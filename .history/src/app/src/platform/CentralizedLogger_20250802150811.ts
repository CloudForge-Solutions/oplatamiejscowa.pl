/**
 * Centralized Logger - Platform Service
 *
 * ARCHITECTURE: Single source of truth for all logging
 * - Structured logging with proper context
 * - Mobile-first performance optimization
 * - localStorage persistence (no IndexedDB complexity)
 * - EventBus integration for log events
 * - Fail-fast validation with proper error handling
 */

import { LOGGER_CONFIG, STORAGE_KEYS, TOURIST_TAX_EVENTS } from '../constants';

/**
 * Logger interface for type safety
 */
interface LoggerInterface {
  debug(message: string, data?: any, context?: string): LogEntry;
  info(message: string, data?: any, context?: string): LogEntry;
  warn(message: string, data?: any, context?: string): LogEntry;
  error(message: string, data?: any, context?: string): LogEntry;
  critical(message: string, data?: any, context?: string): LogEntry;
}

/**
 * Log level configuration
 */
interface LogLevel {
    priority: number;
    icon: string;
    color: string;
}

/**
 * Log entry structure
 */
interface LogEntry {
    id: string;
    timestamp: string;
    level: string;
    message: string;
    data?: any;
    context?: string;
    relativeTime: string;
    icon: string;
    callerInfo?: string;
}

/**
 * Performance summary data
 */
interface PerformanceSummary {
    totalOperations: number;
    averageTime: number;
    slowestOperations: LogEntry[];
    fastestOperations: LogEntry[];
}

/**
 * CentralizedLogger - Type-safe logging system
 *
 * ARCHITECTURE PRINCIPLE: Single source of truth for all logging
 * - Centralized logging with timestamps and performance tracking
 * - localStorage persistence (simple storage architecture)
 * - EventBus integration for log events
 * - Mobile-first performance optimization
 * - Fail-fast validation with proper error handling
 */
export class CentralizedLogger implements LoggerInterface {
    private logs: LogEntry[] = [];
    private readonly maxLogs: number = LOGGER_CONFIG.MAX_LOGS;
    private readonly startTime: number = Date.now();
    private performanceMarks: Map<string, number> = new Map();

    // Log levels with priorities and styling
    private readonly levels: Record<string, LogLevel> = {
        debug: {priority: 0, icon: '🔍', color: '#6c757d'},
        info: {priority: 1, icon: 'ℹ️', color: '#0dcaf0'},
        warn: {priority: 2, icon: '⚠️', color: '#ffc107'},
        error: {priority: 3, icon: '❌', color: '#dc3545'},
        critical: {priority: 4, icon: '🚨', color: '#6f42c1'},
        performance: {priority: 1, icon: '⚡', color: '#28a745'}
    };

    private currentLogLevel: string = LOGGER_CONFIG.DEFAULT_LEVEL;
    private enableConsoleOutput: boolean = LOGGER_CONFIG.ENABLE_CONSOLE_OUTPUT;
    private enablePerformanceTracking: boolean = LOGGER_CONFIG.ENABLE_PERFORMANCE_TRACKING;

    constructor() {
        // Initialize logger with proper configuration
        this.info('📝 CentralizedLogger initialized', {
            level: this.currentLogLevel,
            maxLogs: this.maxLogs,
            consoleOutput: this.enableConsoleOutput,
            performanceTracking: this.enablePerformanceTracking
        });

        // Load persisted logs from localStorage
        this.loadPersistedLogs();
    }

    /**
     * Load persisted logs from localStorage
     */
    private loadPersistedLogs(): void {
        try {
            const persistedLogs = localStorage.getItem('tourist-tax-logs');
            if (persistedLogs) {
                const logs = JSON.parse(persistedLogs) as LogEntry[];
                this.logs = logs.slice(-this.maxLogs); // Keep only recent logs
            }
        } catch (error) {
            // Ignore errors loading persisted logs
            this.warn('Failed to load persisted logs', error);
        }
    }

    /**
     * Persist logs to localStorage
     */
    private persistLogs(): void {
        try {
            if (LOGGER_CONFIG.PERSIST_ERROR_LOGS) {
                const logsToStore = this.logs.slice(-this.maxLogs);
                localStorage.setItem('tourist-tax-logs', JSON.stringify(logsToStore));
            }
        } catch (error) {
            // Ignore localStorage errors to prevent infinite loops
        }
    }

    /**
     * Log debug message
     */
    debug(message: string, data?: any, context?: string): LogEntry {
        const entry = this.createLogEntry('debug', message, data, context);
        if (this.enableConsoleOutput && this.shouldLog('debug')) {
            this._logToConsole('debug', entry, data);
        }
        return entry;
    }

    /**
     * Log info message
     */
    info(message: string, data?: any, context?: string): LogEntry {
        const entry = this.createLogEntry('info', message, data, context);
        if (this.enableConsoleOutput && this.shouldLog('info')) {
            this._logToConsole('info', entry, data);
        }
        return entry;
    }

    /**
     * Log warning message
     */
    warn(message: string, data?: any, context?: string): LogEntry {
        const entry = this.createLogEntry('warn', message, data, context);
        if (this.enableConsoleOutput && this.shouldLog('warn')) {
            this._logToConsole('warn', entry, data);
        }
        return entry;
    }

    /**
     * Log error message
     */
    error(message: string, data?: any, context?: string): LogEntry {
        const entry = this.createLogEntry('error', message, data, context);
        if (this.enableConsoleOutput && this.shouldLog('error')) {
            this._logToConsole('error', entry, data);
        }
        return entry;
    }

    /**
     * Log critical message
     */
    critical(message: string, data?: any, context?: string): LogEntry {
        const entry = this.createLogEntry('critical', message, data, context);
        if (this.enableConsoleOutput) {
            this._logToConsole('error', entry, data); // Critical messages use error console
        }
        return entry;
    }

    /**
     * ARCHITECTURAL COMPLIANCE: Smart logging methods with automatic level detection
     */
    platform(message: string, data?: any, context?: string): LogEntry {
        const level = this._detectLogLevel(message);
        const entry = this.createLogEntry(level, message, data, context);
        if (this.enableConsoleOutput && this.shouldLog(level)) {
            this._logToConsole(level, entry, data);
        }
        return entry;
    }

    shell(message: string, data?: any, context?: string): LogEntry {
        const level = this._detectLogLevel(message);
        const entry = this.createLogEntry(level, message, data, context);
        if (this.enableConsoleOutput && this.shouldLog(level)) {
            this._logToConsole(level, entry, data);
        }
        return entry;
    }

    microapp(message: string, data?: any, context?: string): LogEntry {
        const level = this._detectLogLevel(message);
        const entry = this.createLogEntry(level, message, data, context);
        if (this.enableConsoleOutput && this.shouldLog(level)) {
            this._logToConsole(level, entry, data);
        }
        return entry;
    }

    /**
     * ARCHITECTURAL COMPLIANCE: Micro-app logging without layer detection
     */
    jpk(message: string, data?: any, context?: string): LogEntry {
        const level = this._detectLogLevel(message);
        const entry = this.createLogEntry(level, message, data, context);
        if (this.enableConsoleOutput && this.shouldLog(level)) {
            this._logToConsole(level, entry, data);
        }
        return entry;
    }

    /**
     * Performance tracking - start timing
     */
    startPerformanceTimer(label: string): void {
        if (this.enablePerformanceTracking) {
            this.performanceMarks.set(label, Date.now());
        }
    }

    /**
     * Performance tracking - end timing and log
     */
    endPerformanceTimer(label: string, context?: string): LogEntry | null {
        if (!this.enablePerformanceTracking) {
            return null;
        }

        const startTime = this.performanceMarks.get(label);
        if (!startTime) {
            this.warn(`Performance timer "${label}" was not started`);
            return null;
        }

        const duration = Date.now() - startTime;
        this.performanceMarks.delete(label);

        const message = `⚡ ${label} completed in ${duration}ms`;
        return this.createLogEntry('performance', message, {duration, label}, context);
    }

    /**
     * Get all logs
     */
    getLogs(): LogEntry[] {
        return [...this.logs];
    }

    /**
     * Get logs by level
     */
    getLogsByLevel(level: string): LogEntry[] {
        return this.logs.filter(log => log.level === level);
    }

    /**
     * Clear all logs
     */
    clearLogs(): void {
        this.logs = [];
    }

    /**
     * Set log level
     */
    setLogLevel(level: string): void {
        if (this.levels[level]) {
            this.currentLogLevel = level;
            this.info(`Log level set to: ${level}`);
        } else {
            this.warn(`Invalid log level: ${level}`);
        }
    }

    /**
     * Get current log level
     */
    getLogLevel(): string {
        return this.currentLogLevel;
    }

    /**
     * Enable/disable console output
     */
    setConsoleOutput(enabled: boolean): void {
        this.enableConsoleOutput = enabled;
    }

    /**
     * Enable/disable performance tracking
     */
    setPerformanceTracking(enabled: boolean): void {
        this.enablePerformanceTracking = enabled;
    }

    /**
     * Get performance summary
     */
    getPerformanceSummary(): PerformanceSummary {
        const performanceLogs = this.logs.filter(log => log.level === 'performance');
        const summary: PerformanceSummary = {
            totalOperations: performanceLogs.length,
            averageTime: 0,
            slowestOperations: [],
            fastestOperations: []
        };

        if (performanceLogs.length > 0) {
            const durations = performanceLogs.map(log => {
                const match = log.message.match(/(\d+\.?\d*?)ms/);
                return match ? parseFloat(match[1]) : 0;
            });

            summary.averageTime = durations.reduce((a, b) => a + b, 0) / durations.length;
            summary.slowestOperations = performanceLogs
                .sort((a, b) => {
                    const aDuration = parseFloat(a.message.match(/(\d+\.?\d*?)ms/)?.[1] || '0');
                    const bDuration = parseFloat(b.message.match(/(\d+\.?\d*?)ms/)?.[1] || '0');
                    return bDuration - aDuration;
                })
                .slice(0, 5);
        }

        return summary;
    }

    /**
     * Get current timestamp in ISO format
     */
    private getTimestamp(): string {
        return new Date().toISOString();
    }

    /**
     * Get relative time since app start
     */
    private getRelativeTime(): string {
        return `+${Date.now() - this.startTime}ms`;
    }

    /**
     * Get caller information for precise debugging
     */
    private getCallerInfo(): string | null {
        try {
            const stack = new Error().stack;
            if (!stack) return null;

            const lines = stack.split('\n');
            // Skip the first few lines (Error, getCallerInfo, createLogEntry, log method)
            for (let i = 4; i < lines.length; i++) {
                const line = lines[i];
                if (line && !line.includes('CentralizedLogger') && !line.includes('node_modules')) {
                    // Extract file path and line number
                    const match = line.match(/\((.*):(\d+):(\d+)\)/) || line.match(/at (.*):(\d+):(\d+)/);
                    if (match) {
                        const [, filePath, lineNumber] = match;
                        // Get relative path from src/
                        const srcIndex = filePath.indexOf('src/');
                        const relativePath = srcIndex !== -1 ? filePath.substring(srcIndex) : filePath;
                        return `<${relativePath}:${lineNumber}>`;
                    }
                }
            }
            return null;
        } catch (error) {
            return null;
        }
    }

    /**
     * Check if log level should be shown
     */
    private shouldLog(level: string): boolean {
        const currentPriority = this.levels[this.currentLogLevel]?.priority ?? 0;
        const logPriority = this.levels[level]?.priority ?? 0;
        return logPriority >= currentPriority;
    }

    /**
     * Create a log entry
     */
    private createLogEntry(level: string, message: string, data?: any, context?: string): LogEntry {
        const levelConfig = this.levels[level] || this.levels.info;
        const entry: LogEntry = {
            id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: this.getTimestamp(),
            level,
            message,
            data,
            context,
            relativeTime: this.getRelativeTime(),
            icon: levelConfig.icon,
            callerInfo: this.getCallerInfo()
        };

        this.logs.push(entry);

        // Maintain max logs limit
        if (this.logs.length > this.maxLogs) {
            this.logs = this.logs.slice(-this.maxLogs);
        }

        // ARCHITECTURE COMPLIANCE: Persist logs to IndexedDB instead of localStorage
        this.persistLogToIndexedDB(entry);

        return entry;
    }

    /**
     * Format log for console output with precise file path information
     */
    private formatConsoleMessage(entry: LogEntry): string {
        const {timestamp, message, relativeTime, context, level} = entry;

        // Get caller file information for precise debugging
        const callerStr = entry.callerInfo ? ` - ${entry.callerInfo}` : '';

        // Include log level for filtering and debugging
        const levelStr = level ? ` [${level.toUpperCase()}]` : '';

        // Include context if provided (for component-specific logging)
        const contextStr = context ? ` [${context}]` : '';

        return `[${timestamp}]${levelStr}${contextStr} ${entry.icon} ${message} ${relativeTime}${callerStr}`;
    }

    /**
     * Output to console with appropriate method
     */
    private _logToConsole(consoleLevel: string, entry: LogEntry, data?: any): void {
        const formattedMessage = this.formatConsoleMessage(entry);

        switch (consoleLevel) {
            case 'debug':
                console.debug(formattedMessage, data || '');
                break;
            case 'warn':
                console.warn(formattedMessage, data || '');
                break;
            case 'error':
            case 'critical':
                console.error(formattedMessage, data || '');
                break;
            default:
                console.info(formattedMessage, data || '');
        }
    }

    /**
     * Detect log level from message content with intelligent context analysis
     */
    private _detectLogLevel(message: string): string {
        if (!message || typeof message !== 'string') {
            return 'info';
        }

        const lowerMessage = message.toLowerCase();

        // CRITICAL ERRORS - Highest priority
        if (message.includes('❌') && (
            lowerMessage.includes('failed') ||
            lowerMessage.includes('error') ||
            lowerMessage.includes('invalid') ||
            lowerMessage.includes('cannot') ||
            lowerMessage.includes('unable')
        )) {
            return 'error';
        }

        // EXPLICIT ERROR KEYWORDS - Without emoji context
        if (lowerMessage.includes('error') || lowerMessage.includes('failed') ||
            lowerMessage.includes('invalid') || lowerMessage.includes('cannot') ||
            lowerMessage.includes('unable') || lowerMessage.includes('missing')) {
            return 'error';
        }

        // WARNING INDICATORS
        if (message.includes('⚠️') || lowerMessage.includes('warning') ||
            lowerMessage.includes('deprecated') || lowerMessage.includes('fallback') ||
            lowerMessage.includes('retry') || lowerMessage.includes('timeout')) {
            return 'warn';
        }

        // DEBUG INDICATORS
        if (message.includes('🔍') || lowerMessage.includes('debug') ||
            lowerMessage.includes('trace') || lowerMessage.includes('verbose')) {
            return 'debug';
        }

        // PERFORMANCE INDICATORS
        if (message.includes('⚡') || lowerMessage.includes('performance') ||
            lowerMessage.includes('timing') || message.includes('ms)')) {
            return 'performance';
        }

        // SUCCESS/INFO INDICATORS (default)
        return 'info';
    }

    /**
     * Initialize IndexedDB for log persistence
     * CRITICAL FIX: Proper Promise-based IndexedDB initialization with race condition prevention
     */
    private async initializeIndexedDB(): Promise<void> {
        // Prevent multiple initialization attempts
        if (this.indexedDBInitialized) {
            return;
        }

        if (this.indexedDBInitializing) {
            // Return existing promise if initialization is in progress
            return this.initializationPromise || Promise.resolve();
        }

        this.indexedDBInitializing = true;

        try {
            // Check if IndexedDB is available
            if (typeof indexedDB === 'undefined') {
                throw new Error('IndexedDB is not available in this environment');
            }

            const dbName = DATABASE_NAME_GENERATORS.generateGlobalDatabase(GLOBAL_DATABASE_SERVICES.AUDIT);

            this.initializationPromise = new Promise<void>((resolve, reject) => {
                const request = indexedDB.open(dbName, 1);

                request.onerror = () => {
                    const error = request.error || new Error('Unknown IndexedDB error');
                    console.warn('❌ Failed to initialize IndexedDB for logs:', error);
                    this.indexedDBInitializing = false;
                    reject(error);
                };

                request.onsuccess = () => {
                    this.db = request.result;
                    this.indexedDBInitialized = true;
                    this.indexedDBInitializing = false;
                    console.info('✅ IndexedDB initialized for log persistence');

                    // Process any queued logs after successful initialization
                    this.processPersistedLogs().catch(error => {
                        console.warn('❌ Failed to process queued logs:', error);
                    });

                    resolve();
                };

                request.onupgradeneeded = (event: any) => {
                    try {
                        const db = event.target.result;

                        // Create logs object store
                        if (!db.objectStoreNames.contains('logs')) {
                            const store = db.createObjectStore('logs', { keyPath: 'id' });
                            store.createIndex('timestamp', 'timestamp');
                            store.createIndex('level', 'level');
                            store.createIndex('context', 'context');
                            console.info('📦 Created logs object store in IndexedDB');
                        }
                    } catch (upgradeError) {
                        console.warn('❌ Failed to upgrade IndexedDB schema:', upgradeError);
                        this.indexedDBInitializing = false;
                        reject(upgradeError);
                    }
                };
            });

            return this.initializationPromise;
        } catch (error) {
            this.indexedDBInitializing = false;
            console.warn('❌ IndexedDB not available for log persistence:', error);
            throw error;
        }
    }

    /**
     * Persist log entry to IndexedDB
     * CRITICAL FIX: Proper Promise-based IndexedDB operations with race condition prevention
     */
    private async persistLogToIndexedDB(entry: LogEntry): Promise<void> {
        // If IndexedDB is not initialized and not initializing, queue the entry
        if (!this.indexedDBInitialized && !this.indexedDBInitializing) {
            this.persistenceQueue.push(entry);
            return;
        }

        // If IndexedDB is initializing, wait for it to complete
        if (this.indexedDBInitializing && this.initializationPromise) {
            try {
                await this.initializationPromise;
            } catch (error) {
                // If initialization fails, queue the entry
                this.persistenceQueue.push(entry);
                return;
            }
        }

        // If still not initialized after waiting, queue the entry
        if (!this.indexedDBInitialized || !this.db) {
            this.persistenceQueue.push(entry);
            return;
        }

        try {
            return new Promise<void>((resolve, reject) => {
                const transaction = this.db!.transaction(['logs'], 'readwrite');
                const store = transaction.objectStore('logs');
                const request = store.put(entry);

                request.onsuccess = () => {
                    resolve();
                };

                request.onerror = () => {
                    reject(request.error || new Error('Failed to store log entry'));
                };

                transaction.onerror = () => {
                    reject(transaction.error || new Error('Transaction failed'));
                };
            });
        } catch (error) {
            console.warn('❌ Failed to persist log to IndexedDB:', error);
            // Queue the entry for retry instead of throwing
            this.persistenceQueue.push(entry);
        }
    }

    /**
     * Process queued logs for persistence
     * CRITICAL FIX: Proper error handling for batch log processing
     */
    private async processPersistedLogs(): Promise<void> {
        if (this.persistenceQueue.length === 0) return;

        const logsToProcess = [...this.persistenceQueue];
        this.persistenceQueue = [];

        for (const entry of logsToProcess) {
            try {
                await this.persistLogToIndexedDB(entry);
            } catch (error) {
                console.warn('❌ Failed to process queued log entry:', error);
                // Re-queue failed entries for retry
                this.persistenceQueue.push(entry);
            }
        }
    }
}

// Create global logger instance
export const logger = new CentralizedLogger();

// ARCHITECTURAL COMPLIANCE: No layer-specific loggers
// Layer detection is forbidden - use single logger instance only

// Make available globally for debugging
if (typeof window !== 'undefined') {
    (window as any).logger = logger;
}
