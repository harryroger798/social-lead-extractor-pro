/**
 * v3.5.35: React hook for managing the one-click test runner.
 *
 * Handles: starting tests, polling progress, capturing frontend console logs,
 * and downloading the log bundle.
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { generateTestMatrix, TOGGLE_COMBOS } from '@/lib/testMatrix';
import type { TestCase } from '@/lib/testMatrix';

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

export type TestPhase = 'idle' | 'running' | 'done' | 'aborted';

export interface TestProgress {
  phase: TestPhase;
  sessionId: string | null;
  total: number;
  completed: number;
  failed: number;
  progressPct: number;
  currentCase: { id: string; keyword: string; group: string; toggle: string } | null;
  bundleReady: boolean;
  elapsedMs: number;
  estimatedRemainingMs: number | null;
}

const INITIAL: TestProgress = {
  phase: 'idle',
  sessionId: null,
  total: 0,
  completed: 0,
  failed: 0,
  progressPct: 0,
  currentCase: null,
  bundleReady: false,
  elapsedMs: 0,
  estimatedRemainingMs: null,
};

export function useTestRunner() {
  const [progress, setProgress] = useState<TestProgress>(INITIAL);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const frontendLogsRef = useRef<Array<{ ts: string; level: string; session_id: string; msg: string }>>([]);
  const restoreConsoleRef = useRef<(() => void) | null>(null);

  // ── Intercept console.* for frontend log capture ──────────────────────
  const installConsoleCapture = useCallback((sessionId: string) => {
    const original = {
      log: console.log,
      warn: console.warn,
      error: console.error,
    };

    const capture = (level: string) =>
      (...args: unknown[]) => {
        const entry = {
          ts: new Date().toISOString(),
          level,
          session_id: sessionId,
          msg: args
            .map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a)))
            .join(' '),
        };
        frontendLogsRef.current.push(entry);
        // Flush every 20 entries
        if (frontendLogsRef.current.length % 20 === 0) {
          flushFrontendLogs(sessionId);
        }
        (original as Record<string, (...a: unknown[]) => void>)[level](...args);
      };

    console.log = capture('log');
    console.warn = capture('warn');
    console.error = capture('error');

    return () => {
      console.log = original.log;
      console.warn = original.warn;
      console.error = original.error;
    };
  }, []);

  const flushFrontendLogs = useCallback(async (sessionId: string) => {
    const batch = frontendLogsRef.current.splice(0);
    if (!batch.length) return;
    for (const entry of batch) {
      try {
        await fetch(`${API_BASE}/api/test/${sessionId}/frontend-log`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entry),
        });
      } catch {
        // ignore flush errors
      }
    }
  }, []);

  // ── Start ─────────────────────────────────────────────────────────────
  const start = useCallback(
    async (options?: { quickMode?: boolean }) => {
      const cases: TestCase[] = generateTestMatrix(
        options?.quickMode
          ? {
              keywordSubset: 2,
              platformGroups: ['B2B', 'LOCAL'],
              toggleCombos: [TOGGLE_COMBOS[0], TOGGLE_COMBOS[3]],
            }
          : undefined,
      );

      const res = await fetch(`${API_BASE}/api/test/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          test_cases: cases,
          concurrency: 2,
          timeout_per_case: 300,  // v3.5.36: Increased from 90s to match backend Fix 3
        }),
      });
      const data = await res.json();
      const sessionId: string = data.session_id;

      startTimeRef.current = Date.now();
      frontendLogsRef.current = [];
      const restore = installConsoleCapture(sessionId);
      restoreConsoleRef.current = restore;

      setProgress({
        ...INITIAL,
        phase: 'running',
        sessionId,
        total: cases.length,
      });

      // Poll every 2s
      pollRef.current = setInterval(async () => {
        try {
          const statusRes = await fetch(`${API_BASE}/api/test/${sessionId}/status`);
          const s = await statusRes.json();
          const elapsed = Date.now() - startTimeRef.current;
          const rate = elapsed / Math.max(s.completed, 1);
          const remaining = s.status !== 'done' ? rate * (s.total - s.completed) : 0;

          setProgress((prev) => ({
            ...prev,
            completed: s.completed,
            failed: s.failed,
            progressPct: s.progress_pct,
            currentCase: s.current_case,
            elapsedMs: elapsed,
            estimatedRemainingMs: remaining,
            phase: s.status === 'done' ? 'done' : 'running',
            bundleReady: s.status === 'done',
          }));

          if (s.status === 'done') {
            if (pollRef.current) clearInterval(pollRef.current);
            await flushFrontendLogs(sessionId);
            restore();
            restoreConsoleRef.current = null;
          }
        } catch {
          // poll error — ignore
        }
      }, 2000);
    },
    [installConsoleCapture, flushFrontendLogs],
  );

  // ── Abort ─────────────────────────────────────────────────────────────
  const abort = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (restoreConsoleRef.current) {
      restoreConsoleRef.current();
      restoreConsoleRef.current = null;
    }
    setProgress((prev) => ({ ...prev, phase: 'aborted', bundleReady: true }));
  }, []);

  // ── Download bundle ───────────────────────────────────────────────────
  const downloadBundle = useCallback(() => {
    const { sessionId } = progress;
    if (!sessionId) return;
    const link = document.createElement('a');
    link.href = `${API_BASE}/api/test/${sessionId}/download-bundle`;
    link.download = `snapleads_test_${sessionId.slice(0, 8)}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [progress]);

  // ── Reset ─────────────────────────────────────────────────────────────
  const reset = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (restoreConsoleRef.current) {
      restoreConsoleRef.current();
      restoreConsoleRef.current = null;
    }
    setProgress(INITIAL);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (restoreConsoleRef.current) {
        restoreConsoleRef.current();
      }
    };
  }, []);

  return { progress, start, abort, downloadBundle, reset };
}
