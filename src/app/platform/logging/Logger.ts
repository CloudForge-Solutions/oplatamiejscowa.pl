/**
 * Centralized Logger Service for Tourist Tax Payment System
 * Professional logging with proper levels and formatting
 * Follows mVAT architecture patterns
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  SILENT = 4
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  component: string;
  message: string;
  data?: any;
  error?: Error;
}

export class Logger {
  private static instance: Logger;
  private currentLevel: LogLevel = LogLevel.INFO;
  private isDevelopment: boolean = import.meta.env.DEV;

  private constructor() {
    // Set development level
    if (this.isDevelopment) {
      this.currentLevel = LogLevel.DEBUG;
    }
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  setLevel(level: LogLevel): void {
    this.currentLevel = level;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.currentLevel;
  }

  private formatMessage(component: string, message: string, level: LogLevel): string {
    const timestamp = new Date().toISOString();
    const levelName = LogLevel[level];
    return `[${levelName}] ${timestamp} [${component}] ${message}`;
  }

  private log(level: LogLevel, component: string, message: string, data?: any, error?: Error): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const formattedMessage = this.formatMessage(component, message, level);

    switch (level) {
      case LogLevel.DEBUG:
        if (this.isDevelopment) {
          console.debug(formattedMessage, data || '');
        }
        break;
      case LogLevel.INFO:
        console.log(formattedMessage, data || '');
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage, data || '');
        break;
      case LogLevel.ERROR:
        console.error(formattedMessage, error || data || '');
        break;
    }
  }

  debug(component: string, message: string, data?: any): void {
    this.log(LogLevel.DEBUG, component, message, data);
  }

  info(component: string, message: string, data?: any): void {
    this.log(LogLevel.INFO, component, message, data);
  }

  warn(component: string, message: string, data?: any): void {
    this.log(LogLevel.WARN, component, message, data);
  }

  error(component: string, message: string, error?: Error | any): void {
    this.log(LogLevel.ERROR, component, message, undefined, error);
  }
}

// Export singleton instance
export const logger = Logger.getInstance();

// Component-specific logger factory
export function createComponentLogger(componentName: string) {
  return {
    debug: (message: string, data?: any) => logger.debug(componentName, message, data),
    info: (message: string, data?: any) => logger.info(componentName, message, data),
    warn: (message: string, data?: any) => logger.warn(componentName, message, data),
    error: (message: string, error?: Error | any) => logger.error(componentName, message, error)
  };
}
