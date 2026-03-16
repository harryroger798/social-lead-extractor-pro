/**
 * v3.5.35: One-click automated test suite panel.
 *
 * Displays in the Settings page under a "Testing" tab.
 * Provides Quick Mode (fewer cases) and Full Mode (320 cases).
 */

import { useState } from 'react';
import { Play, Square, Download, RefreshCw, Loader2, FlaskConical, ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTestRunner } from '@/hooks/useTestRunner';
import { PLATFORM_GROUPS, TEST_KEYWORDS, TOGGLE_COMBOS } from '@/lib/testMatrix';

function formatTime(ms: number): string {
  if (ms < 60_000) return `${Math.round(ms / 1000)}s`;
  return `${Math.floor(ms / 60_000)}m ${Math.round((ms % 60_000) / 1000)}s`;
}

export default function TestRunner() {
  const { progress, start, abort, downloadBundle, reset } = useTestRunner();
  const [quickMode, setQuickMode] = useState(true);
  const [expanded, setExpanded] = useState(true);

  const isRunning = progress.phase === 'running';
  const isDone = progress.phase === 'done';
  const isAborted = progress.phase === 'aborted';
  const isIdle = progress.phase === 'idle';

  const quickCaseCount =
    2 * 2 * 2 * 2; // 2 kw with loc + 2 kw without * 2 groups * 2 combos = 16
  const fullCaseCount =
    TEST_KEYWORDS.with_location.length * Object.keys(PLATFORM_GROUPS).length * TOGGLE_COMBOS.length +
    TEST_KEYWORDS.without_location.length * Object.keys(PLATFORM_GROUPS).length * TOGGLE_COMBOS.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl bg-bg-card border border-border overflow-hidden">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-zinc-800/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
              <FlaskConical className="w-4 h-4 text-accent" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-text-primary">Automated Test Suite</p>
              <p className="text-xs text-text-muted">One-click testing with full log collection</p>
            </div>
          </div>
          {expanded ? (
            <ChevronDown className="w-4 h-4 text-text-muted" />
          ) : (
            <ChevronRight className="w-4 h-4 text-text-muted" />
          )}
        </button>

        {expanded && (
          <div className="px-6 pb-6 border-t border-border pt-5 space-y-5">
            {/* Config — only when idle */}
            {isIdle && (
              <div className="space-y-4">
                {/* Quick mode toggle */}
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium text-text-primary">Quick Mode</p>
                    <p className="text-xs text-text-muted">
                      {quickMode
                        ? `${quickCaseCount} test cases — ~5 min`
                        : `${fullCaseCount} test cases — ~45 min`}
                    </p>
                  </div>
                  <button
                    onClick={() => setQuickMode((v) => !v)}
                    className={cn(
                      'relative w-11 h-6 rounded-full transition-all flex-shrink-0',
                      quickMode
                        ? 'bg-accent shadow-inner shadow-accent/30'
                        : 'bg-bg-tertiary border border-[#52525b]',
                    )}
                  >
                    <span
                      className={cn(
                        'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200',
                        quickMode && 'translate-x-5',
                      )}
                    />
                  </button>
                </div>

                {/* Matrix preview */}
                <div className="rounded-lg bg-bg-secondary/50 border border-border/50 p-4 text-xs text-text-secondary space-y-2">
                  <p className="font-semibold text-text-primary text-sm">
                    {quickMode ? 'Quick Mode Matrix' : 'Full Matrix'}
                  </p>
                  {quickMode ? (
                    <ul className="space-y-1 list-disc list-inside">
                      <li>2 keywords with location + 2 without = 4 keywords</li>
                      <li>2 platform groups (B2B, LOCAL)</li>
                      <li>2 toggle combos (Base, Full)</li>
                      <li>
                        = <strong className="text-text-primary">{quickCaseCount} test cases</strong>
                      </li>
                    </ul>
                  ) : (
                    <ul className="space-y-1 list-disc list-inside">
                      <li>
                        {TEST_KEYWORDS.with_location.length} keywords with location +{' '}
                        {TEST_KEYWORDS.without_location.length} without ={' '}
                        {TEST_KEYWORDS.with_location.length + TEST_KEYWORDS.without_location.length}{' '}
                        keywords
                      </li>
                      <li>{Object.keys(PLATFORM_GROUPS).length} platform groups</li>
                      <li>{TOGGLE_COMBOS.length} toggle combos</li>
                      <li>
                        = <strong className="text-text-primary">{fullCaseCount} test cases</strong>
                      </li>
                    </ul>
                  )}
                </div>

                {/* Collected data info */}
                <div className="rounded-lg bg-blue-500/5 border border-blue-500/20 p-4 text-xs text-text-secondary space-y-1">
                  <p className="font-semibold text-blue-400 text-sm">Log Collection</p>
                  <ul className="space-y-0.5 list-disc list-inside">
                    <li>Backend Python logs (extraction progress, errors, timing)</li>
                    <li>Frontend console logs</li>
                    <li>Per-platform results (leads found, errors, timeouts)</li>
                    <li>Location filter decisions (which leads kept/dropped and why)</li>
                    <li>Timing data (per-case and per-platform durations)</li>
                  </ul>
                  <p className="pt-1 text-text-muted">
                    All packaged as a downloadable ZIP bundle for developer analysis.
                  </p>
                </div>

                {/* Start button */}
                <button
                  onClick={() => start({ quickMode })}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-accent hover:bg-accent-hover text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-accent/25"
                >
                  <Play className="w-4 h-4" />
                  Run Tests {quickMode ? '(Quick)' : '(Full)'}
                </button>
              </div>
            )}

            {/* Progress — when running or done */}
            {(isRunning || isDone || isAborted) && (
              <div className="space-y-4">
                {/* Progress bar */}
                <div className="w-full h-3 rounded-full bg-bg-tertiary overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-500',
                      isDone && progress.failed === 0
                        ? 'bg-green-500'
                        : isDone
                          ? 'bg-yellow-500'
                          : 'bg-accent',
                    )}
                    style={{ width: `${progress.progressPct}%` }}
                  />
                </div>

                {/* Stats row */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted">
                  <span className="font-medium text-text-primary">
                    {progress.completed} / {progress.total} cases
                  </span>
                  <span>{progress.progressPct}%</span>
                  {progress.failed > 0 && (
                    <span className="text-red-400 font-medium">{progress.failed} failed</span>
                  )}
                  <span>Elapsed: {formatTime(progress.elapsedMs)}</span>
                  {isRunning && progress.estimatedRemainingMs != null && (
                    <span>~{formatTime(progress.estimatedRemainingMs)} left</span>
                  )}
                </div>

                {/* Current case indicator */}
                {isRunning && progress.currentCase && (
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-bg-secondary/50 border border-border/50 text-xs">
                    <Loader2 className="w-3.5 h-3.5 text-accent animate-spin flex-shrink-0" />
                    <span className="text-text-muted">Testing:</span>
                    <span className="font-medium text-text-primary truncate">
                      &ldquo;{progress.currentCase.keyword}&rdquo;
                    </span>
                    <span className="text-text-muted">
                      [{progress.currentCase.group}] [{progress.currentCase.toggle}]
                    </span>
                  </div>
                )}

                {/* Done banner */}
                {isDone && (
                  <div
                    className={cn(
                      'px-4 py-3 rounded-lg text-sm font-medium',
                      progress.failed === 0
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                        : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
                    )}
                  >
                    {progress.failed === 0
                      ? `Test run complete! All ${progress.completed} cases passed.`
                      : `Test run complete. ${progress.completed - progress.failed} passed, ${progress.failed} failed — check the bundle for details.`}
                  </div>
                )}

                {isAborted && (
                  <div className="px-4 py-3 rounded-lg text-sm font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                    Test run aborted at {progress.completed}/{progress.total} cases.
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex items-center gap-3">
                  {isRunning && (
                    <button
                      onClick={abort}
                      className="flex items-center gap-2 px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-sm font-medium transition-all"
                    >
                      <Square className="w-3.5 h-3.5" />
                      Abort
                    </button>
                  )}
                  {(isDone || isAborted) && (
                    <>
                      <button
                        onClick={downloadBundle}
                        className="flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-accent/25"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download Log Bundle (.zip)
                      </button>
                      <button
                        onClick={reset}
                        className="flex items-center gap-2 px-5 py-2.5 bg-bg-card hover:bg-bg-secondary border border-border text-text-secondary rounded-xl text-sm font-medium transition-all"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        New Test Run
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
