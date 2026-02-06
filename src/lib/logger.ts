/**
 * @dcyfr/ai-code-gen - Structured logger
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

export interface Logger {
  debug(message: string, data?: Record<string, unknown>): void;
  info(message: string, data?: Record<string, unknown>): void;
  warn(message: string, data?: Record<string, unknown>): void;
  error(message: string, data?: Record<string, unknown>): void;
}

/**
 * Create a structured logger with a given level threshold.
 */
export function createLogger(minLevel: LogLevel = 'info', prefix?: string): Logger {
  const threshold = LOG_LEVELS[minLevel];
  const tag = prefix ? `[${prefix}]` : '';

  function log(level: LogLevel, message: string, data?: Record<string, unknown>): void {
    if (LOG_LEVELS[level] < threshold) return;

    const timestamp = new Date().toISOString();
    const entry = `${timestamp} ${level.toUpperCase().padEnd(5)} ${tag} ${message}`;

    if (level === 'error') {
      console.error(entry, data ? JSON.stringify(data) : '');
    } else if (level === 'warn') {
      console.warn(entry, data ? JSON.stringify(data) : '');
    } else {
      console.log(entry, data ? JSON.stringify(data) : '');
    }
  }

  return {
    debug: (msg, data) => log('debug', msg, data),
    info: (msg, data) => log('info', msg, data),
    warn: (msg, data) => log('warn', msg, data),
    error: (msg, data) => log('error', msg, data),
  };
}

/** Silent logger for testing */
export function createSilentLogger(): Logger {
  const noop = () => {};
  return { debug: noop, info: noop, warn: noop, error: noop };
}
