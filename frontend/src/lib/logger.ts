/**
 * v3.5.22: Comprehensive frontend logger.
 *
 * Batches log entries and POSTs them to the backend every 2 seconds.
 * On error-level logs, flushes immediately so critical issues are captured
 * even if the app crashes shortly after.
 *
 * Usage:
 *   import { logger } from '$lib/logger';
 *   logger.info('extraction', 'Started extraction for keyword: yoga');
 *   logger.error('api', 'Failed to fetch results: 500');
 */

interface LogEntry {
  level: string;
  module: string;
  message: string;
  timestamp: string;
}

const API_BASE = 'http://127.0.0.1:8000/api';
const FLUSH_INTERVAL_MS = 2000;

class Logger {
  private buffer: LogEntry[] = [];
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.startFlushTimer();
  }

  private startFlushTimer(): void {
    if (typeof window === 'undefined') return; // SSR guard
    this.timer = setInterval(() => this.flush(), FLUSH_INTERVAL_MS);
    // Flush on page unload so we don't lose logs
    window.addEventListener('beforeunload', () => this.flush());
  }

  private push(level: string, module: string, message: string): void {
    this.buffer.push({
      level,
      module,
      message,
      timestamp: new Date().toISOString(),
    });
  }

  async flush(): Promise<void> {
    if (this.buffer.length === 0) return;
    const batch = this.buffer.splice(0);
    try {
      await fetch(`${API_BASE}/logs/write-batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(batch),
      });
    } catch {
      // Backend might not be ready yet — re-queue entries
      this.buffer.unshift(...batch);
    }
  }

  debug(module: string, message: string): void {
    this.push('debug', module, message);
  }

  info(module: string, message: string): void {
    this.push('info', module, message);
  }

  warn(module: string, message: string): void {
    this.push('warn', module, message);
  }

  error(module: string, message: string): void {
    this.push('error', module, message);
    // Flush immediately on errors
    this.flush();
  }

  /** Log an API call with method, URL, and status. */
  api(method: string, url: string, status: number, durationMs?: number): void {
    const dur = durationMs !== undefined ? ` (${durationMs}ms)` : '';
    const level = status >= 400 ? 'error' : 'info';
    this.push(level, 'api', `${method} ${url} -> ${status}${dur}`);
    if (level === 'error') this.flush();
  }

  /** Log a user navigation event. */
  navigate(route: string): void {
    this.push('info', 'navigation', `Navigated to ${route}`);
  }

  destroy(): void {
    if (this.timer) clearInterval(this.timer);
    this.flush();
  }
}

export const logger = new Logger();
