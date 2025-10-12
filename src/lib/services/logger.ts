/**
 * Structured logging service
 * Provides environment-aware logging with levels and context
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  [key: string]: unknown;
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  context?: LogContext;
  timestamp: number;
}

/**
 * Logger configuration
 */
interface LoggerConfig {
  /** Minimum log level to output (default: 'info' in production, 'debug' in development) */
  minLevel: LogLevel;
  /** Enable console output (default: true) */
  enableConsole: boolean;
  /** Custom log handler for telemetry integration */
  onLog?: (entry: LogEntry) => void;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

class Logger {
  private config: LoggerConfig;

  constructor() {
    // Default configuration based on environment
    const isDevelopment = process.env.NODE_ENV === 'development';

    this.config = {
      minLevel: isDevelopment ? 'debug' : 'info',
      enableConsole: true,
    };
  }

  /**
   * Configure the logger
   */
  configure(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Check if a log level should be output
   */
  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.config.minLevel];
  }

  /**
   * Format log entry for console output
   */
  private formatConsoleMessage(entry: LogEntry): string {
    const timestamp = new Date(entry.timestamp).toISOString();
    const context = entry.context ? ` ${JSON.stringify(entry.context)}` : '';
    return `[${timestamp}] [${entry.level.toUpperCase()}] ${entry.message}${context}`;
  }

  /**
   * Internal log method
   */
  private log(level: LogLevel, message: string, context?: LogContext): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const entry: LogEntry = {
      level,
      message,
      context,
      timestamp: Date.now(),
    };

    // Console output
    if (this.config.enableConsole) {
      const formattedMessage = this.formatConsoleMessage(entry);

      switch (level) {
        case 'debug':
        case 'info':
          // eslint-disable-next-line no-console
          console.log(formattedMessage);
          break;
        case 'warn':
          // eslint-disable-next-line no-console
          console.warn(formattedMessage);
          break;
        case 'error':
          // eslint-disable-next-line no-console
          console.error(formattedMessage);
          break;
      }
    }

    // Custom handler (for telemetry)
    if (this.config.onLog) {
      this.config.onLog(entry);
    }
  }

  /**
   * Log debug message (development only by default)
   */
  debug(message: string, context?: LogContext): void {
    this.log('debug', message, context);
  }

  /**
   * Log info message
   */
  info(message: string, context?: LogContext): void {
    this.log('info', message, context);
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: LogContext): void {
    this.log('warn', message, context);
  }

  /**
   * Log error message
   */
  error(message: string, context?: LogContext): void {
    this.log('error', message, context);
  }

  /**
   * Create a child logger with preset context
   */
  withContext(baseContext: LogContext): Pick<Logger, 'debug' | 'info' | 'warn' | 'error'> {
    return {
      debug: (message: string, context?: LogContext) =>
        this.debug(message, { ...baseContext, ...context }),
      info: (message: string, context?: LogContext) =>
        this.info(message, { ...baseContext, ...context }),
      warn: (message: string, context?: LogContext) =>
        this.warn(message, { ...baseContext, ...context }),
      error: (message: string, context?: LogContext) =>
        this.error(message, { ...baseContext, ...context }),
    };
  }
}

// Singleton instance
export const logger = new Logger();

// Export convenience methods for direct use
export const { debug, info, warn, error } = logger;
