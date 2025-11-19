/**
 * Logger Utility
 * Provides structured logging with different levels: DEBUG, INFO, WARN, ERROR
 * Can be enabled/disabled via environment variable
 */

type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR";

interface LogConfig {
  enabled: boolean;
  level: LogLevel;
  timestamp: boolean;
  colorize: boolean;
}

class Logger {
  private config: LogConfig = {
    enabled: process.env.NODE_ENV === "development",
    level: (process.env.NEXT_PUBLIC_LOG_LEVEL as LogLevel) || "INFO",
    timestamp: true,
    colorize: true,
  };

  private levels: Record<LogLevel, number> = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
  };

  private colors: Record<LogLevel, string> = {
    DEBUG: "\x1b[36m", // Cyan
    INFO: "\x1b[32m", // Green
    WARN: "\x1b[33m", // Yellow
    ERROR: "\x1b[31m", // Red
  };

  private reset = "\x1b[0m";

  private shouldLog(level: LogLevel): boolean {
    if (!this.config.enabled) return false;
    return this.levels[level] >= this.levels[this.config.level];
  }

  private formatMessage(level: LogLevel, message: string, data?: any): string {
    const timestamp = this.config.timestamp
      ? `[${new Date().toISOString()}]`
      : "";
    const color = this.config.colorize ? this.colors[level] : "";
    const reset = this.config.colorize ? this.reset : "";

    let formatted = `${color}${timestamp} [${level}]${reset} ${message}`;

    if (data !== undefined) {
      formatted += `\n${color}Data:${reset} ${JSON.stringify(data, null, 2)}`;
    }

    return formatted;
  }

  /**
   * DEBUG level - detailed information for debugging
   */
  debug(message: string, data?: any): void {
    if (this.shouldLog("DEBUG")) {
      console.debug(this.formatMessage("DEBUG", message, data));
    }
  }

  /**
   * INFO level - general informational messages
   */
  info(message: string, data?: any): void {
    if (this.shouldLog("INFO")) {
      console.info(this.formatMessage("INFO", message, data));
    }
  }

  /**
   * WARN level - warning messages
   */
  warn(message: string, data?: any): void {
    if (this.shouldLog("WARN")) {
      console.warn(this.formatMessage("WARN", message, data));
    }
  }

  /**
   * ERROR level - error messages
   */
  error(message: string, error?: any): void {
    if (this.shouldLog("ERROR")) {
      const errorData = error instanceof Error
        ? {
            message: error.message,
            stack: error.stack,
            name: error.name,
          }
        : error;

      console.error(this.formatMessage("ERROR", message, errorData));
    }
  }

  /**
   * Group related logs together
   */
  group(label: string): void {
    if (this.config.enabled) {
      console.group(`🔍 ${label}`);
    }
  }

  groupEnd(): void {
    if (this.config.enabled) {
      console.groupEnd();
    }
  }

  /**
   * Enable/disable logging at runtime
   */
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
  }

  /**
   * Set log level at runtime
   */
  setLevel(level: LogLevel): void {
    this.config.level = level;
  }

  /**
   * Enable/disable colors
   */
  setColorize(colorize: boolean): void {
    this.config.colorize = colorize;
  }

  /**
   * Enable/disable timestamps
   */
  setTimestamp(timestamp: boolean): void {
    this.config.timestamp = timestamp;
  }
}

// Export singleton instance
export const logger = new Logger();

// Export type for use in other files
export type { LogLevel };
