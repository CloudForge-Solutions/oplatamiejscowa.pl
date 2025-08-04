/**
 * Centralized Logger for Azure Functions
 * 
 * RESPONSIBILITY: Structured logging with Azure Functions integration
 * ARCHITECTURE: JSON-based logging with correlation IDs and context
 */

/**
 * Log Level Enum
 */
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug'
}

/**
 * Log Entry Interface
 */
interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  correlationId?: string;
  functionName?: string;
  invocationId?: string;
}

/**
 * Logger Configuration
 */
const LOGGER_CONFIG = {
  level: (process.env.LOG_LEVEL || 'info').toLowerCase() as LogLevel,
  enableConsole: true,
  enableStructuredLogging: true
};

/**
 * Centralized Logger Class
 */
class Logger {
  private currentLevel: LogLevel;

  constructor() {
    this.currentLevel = LOGGER_CONFIG.level;
  }

  /**
   * Log an error message
   */
  error(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.ERROR, message, context);
  }

  /**
   * Log a warning message
   */
  warn(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, context);
  }

  /**
   * Log an info message
   */
  info(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, context);
  }

  /**
   * Log a debug message
   */
  debug(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  /**
   * Core logging method
   */
  private log(level: LogLevel, message: string, context?: Record<string, any>): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: level,
      message: message,
      context: context
    };

    if (LOGGER_CONFIG.enableStructuredLogging) {
      this.logStructured(logEntry);
    } else {
      this.logSimple(logEntry);
    }
  }

  /**
   * Check if message should be logged based on current level
   */
  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.ERROR, LogLevel.WARN, LogLevel.INFO, LogLevel.DEBUG];
    const currentIndex = levels.indexOf(this.currentLevel);
    const messageIndex = levels.indexOf(level);
    
    return messageIndex <= currentIndex;
  }

  /**
   * Log structured JSON output
   */
  private logStructured(entry: LogEntry): void {
    const output = JSON.stringify(entry);
    
    switch (entry.level) {
      case LogLevel.ERROR:
        console.error(output);
        break;
      case LogLevel.WARN:
        console.warn(output);
        break;
      case LogLevel.INFO:
        console.info(output);
        break;
      case LogLevel.DEBUG:
        console.debug(output);
        break;
    }
  }

  /**
   * Log simple text output
   */
  private logSimple(entry: LogEntry): void {
    const contextStr = entry.context ? ` ${JSON.stringify(entry.context)}` : '';
    const output = `[${entry.timestamp}] ${entry.level.toUpperCase()}: ${entry.message}${contextStr}`;
    
    switch (entry.level) {
      case LogLevel.ERROR:
        console.error(output);
        break;
      case LogLevel.WARN:
        console.warn(output);
        break;
      case LogLevel.INFO:
        console.info(output);
        break;
      case LogLevel.DEBUG:
        console.debug(output);
        break;
    }
  }

  /**
   * Set log level
   */
  setLevel(level: LogLevel): void {
    this.currentLevel = level;
  }

  /**
   * Get current log level
   */
  getLevel(): LogLevel {
    return this.currentLevel;
  }
}

/**
 * Global logger instance
 */
export const logger = new Logger();

/**
 * Create logger with correlation context
 */
export function createContextLogger(correlationId: string, functionName?: string): Logger {
  const contextLogger = new Logger();
  
  // Override log method to include correlation context
  const originalLog = (contextLogger as any).log.bind(contextLogger);
  (contextLogger as any).log = function(level: LogLevel, message: string, context?: Record<string, any>) {
    const enhancedContext = {
      ...context,
      correlationId: correlationId,
      functionName: functionName
    };
    
    originalLog(level, message, enhancedContext);
  };
  
  return contextLogger;
}

/**
 * Performance timing utility
 */
export class PerformanceTimer {
  private startTime: number;
  private name: string;

  constructor(name: string) {
    this.name = name;
    this.startTime = Date.now();
    
    logger.debug(`⏱️ Performance timer started: ${name}`);
  }

  /**
   * End timing and log duration
   */
  end(context?: Record<string, any>): number {
    const duration = Date.now() - this.startTime;
    
    logger.info(`⏱️ Performance timer completed: ${this.name}`, {
      duration: `${duration}ms`,
      ...context
    });
    
    return duration;
  }
}

/**
 * Create performance timer
 */
export function createTimer(name: string): PerformanceTimer {
  return new PerformanceTimer(name);
}
