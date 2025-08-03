// src/platform/utils/QueryParameterManager.ts - Centralized query parameter management
// ARCHITECTURE COMPLIANCE: Proper separation of global vs page-specific parameters

import { StringParam } from 'use-query-params';
import { URL_PARAMS } from '@/constants';
import { logger } from '@/platform/CentralizedLogger';

/**
 * Query Parameter Categories
 * ARCHITECTURE PRINCIPLE: Clear separation of concerns
 */
export const PARAMETER_CATEGORIES = {
    GLOBAL: 'global',           // Persist across all pages (entityId, lang)
    PAGE_SPECIFIC: 'page',      // Only relevant to specific pages (jpkId, tab, recordId)
    TEMPORARY: 'temporary'      // Short-lived parameters (modal states, etc.)
} as const;

/**
 * Parameter Configuration
 * Defines which parameters belong to which category and their behavior
 */
export const PARAMETER_CONFIG = {
    // Global parameters - persist across all pages
    [URL_PARAMS.ENTITY_ID]: {
        category: PARAMETER_CATEGORIES.GLOBAL,
        type: StringParam,
        persistent: true,
        description: 'Current entity context'
    },
    [URL_PARAMS.LANGUAGE]: {
        category: PARAMETER_CATEGORIES.GLOBAL,
        type: StringParam,
        persistent: true,
        description: 'Current language setting'
    },

    // Page-specific parameters - only relevant to specific pages
    [URL_PARAMS.JPK_ID]: {
        category: PARAMETER_CATEGORIES.PAGE_SPECIFIC,
        type: StringParam,
        persistent: false,
        pages: ['/jpk'],
        description: 'Selected JPK ID'
    },
    [URL_PARAMS.RECORD_ID]: {
        category: PARAMETER_CATEGORIES.PAGE_SPECIFIC,
        type: StringParam,
        persistent: false,
        pages: ['/records'],
        description: 'Selected record ID'
    },

    // Settings page tab parameter
    tab: {
        category: PARAMETER_CATEGORIES.PAGE_SPECIFIC,
        type: StringParam,
        persistent: false,
        pages: ['/settings'],
        description: 'Settings page active tab'
    },

    // View mode parameter
    [URL_PARAMS.VIEW_MODE]: {
        category: PARAMETER_CATEGORIES.PAGE_SPECIFIC,
        type: StringParam,
        persistent: false,
        pages: ['/records', '/jpk'],
        description: 'Current view mode'
    },

    // Filter parameter
    [URL_PARAMS.FILTER]: {
        category: PARAMETER_CATEGORIES.PAGE_SPECIFIC,
        type: StringParam,
        persistent: false,
        pages: ['/records', '/jpk'],
        description: 'Applied filters'
    }
} as const;

/**
 * Get global parameters configuration
 * These parameters persist across all pages
 */
export function getGlobalParametersConfig() {
    const globalParams: Record<string, any> = {};

    Object.entries(PARAMETER_CONFIG).forEach(([key, config]) => {
        if (config.category === PARAMETER_CATEGORIES.GLOBAL) {
            globalParams[key] = config.type;
        }
    });

    return globalParams;
}

/**
 * Get page-specific parameters configuration for a given page
 * @param pathname - Current page pathname
 */
export function getPageParametersConfig(pathname: string) {
    const pageParams: Record<string, any> = {};

    Object.entries(PARAMETER_CONFIG).forEach(([key, config]) => {
        if (config.category === PARAMETER_CATEGORIES.PAGE_SPECIFIC) {
            // Check if this parameter is relevant to the current page
            if (config.pages && config.pages.some(page => pathname.startsWith(page))) {
                pageParams[key] = config.type;
            }
        }
    });

    return pageParams;
}

/**
 * Get all parameters configuration for a given page
 * Combines global and page-specific parameters
 */
export function getAllParametersConfig(pathname: string) {
    return {
        ...getGlobalParametersConfig(),
        ...getPageParametersConfig(pathname)
    };
}

/**
 * Get parameters that should be cleaned up when leaving a page
 * @param fromPath - Page being left
 * @param toPath - Page being navigated to
 */
export function getParametersToCleanup(fromPath: string, toPath: string): string[] {
    const cleanupParams: string[] = [];

    Object.entries(PARAMETER_CONFIG).forEach(([key, config]) => {
        if (config.category === PARAMETER_CATEGORIES.PAGE_SPECIFIC && config.pages) {
            // If parameter was relevant to the old page but not the new page
            const relevantToOldPage = config.pages.some(page => fromPath.startsWith(page));
            const relevantToNewPage = config.pages.some(page => toPath.startsWith(page));

            if (relevantToOldPage && !relevantToNewPage) {
                cleanupParams.push(key);
            }
        }
    });

    logger.platform('🧹 Parameters to cleanup on navigation', {
        fromPath,
        toPath,
        cleanupParams
    });

    return cleanupParams;
}

/**
 * Validate parameter value according to its configuration
 * @param paramName - Parameter name
 * @param value - Parameter value
 */
export function validateParameter(paramName: string, value: any): boolean {
    const config = PARAMETER_CONFIG[paramName as keyof typeof PARAMETER_CONFIG];

    if (!config) {
        logger.warn('⚠️ Unknown parameter', { paramName, value });
        return false;
    }

    // Basic validation - can be extended with more specific rules
    if (value === null || value === undefined || value === '') {
        return true; // Allow clearing parameters
    }

    if (typeof value !== 'string') {
        logger.warn('⚠️ Invalid parameter type', { paramName, value, expectedType: 'string' });
        return false;
    }

    return true;
}

/**
 * Get use-query-params options for optimal performance
 * ARCHITECTURE COMPLIANCE: Leverage built-in features to prevent issues
 */
export function getQueryParamsOptions() {
    return {
        removeDefaultsFromUrl: true,    // Clean URLs by removing default values
        updateType: 'replaceIn' as const // Use replaceState to avoid history pollution
    };
}

/**
 * Create a safe setQuery function that prevents infinite loops while allowing legitimate concurrent updates
 * CRITICAL FIX: Use parameter-level locking instead of global locking to allow concurrent updates of different parameters
 * @param originalSetQuery - Original setQuery function from use-query-params
 */
export function createSafeSetQuery(originalSetQuery: Function) {
    let lastUpdateTime = 0;
    let updateCount = 0;
    const MAX_UPDATES_PER_SECOND = 20; // Increased limit for React concurrent rendering
    const RESET_INTERVAL = 1000; // 1 second

    // Track pending updates per parameter to prevent duplicate updates
    const pendingUpdates = new Map<string, any>();
    let updateTimer: NodeJS.Timeout | null = null;

    // Batch and deduplicate updates
    const flushUpdates = () => {
        if (pendingUpdates.size === 0) return;

        const updates = Object.fromEntries(pendingUpdates);
        pendingUpdates.clear();
        updateTimer = null;

        try {
            // Validate all parameters before updating
            const validUpdates: Record<string, any> = {};
            const invalidUpdates: string[] = [];

            Object.entries(updates).forEach(([key, value]) => {
                if (validateParameter(key, value)) {
                    validUpdates[key] = value;
                } else {
                    invalidUpdates.push(key);
                }
            });

            if (invalidUpdates.length > 0) {
                logger.warn('⚠️ Skipped invalid parameter updates', { invalidUpdates });
            }

            if (Object.keys(validUpdates).length > 0) {
                originalSetQuery(validUpdates);
                logger.info('🔗 Query parameters updated safely', {
                    updates: validUpdates,
                    updateCount,
                    timestamp: Date.now()
                });
            }
        } catch (error) {
            logger.error('❌ Error in safe query parameter update', {
                error: error instanceof Error ? error.message : String(error),
                updates
            });
        }
    };

    return (updates: Record<string, any>) => {
        const now = Date.now();

        // Reset counter if enough time has passed
        if (now - lastUpdateTime > RESET_INTERVAL) {
            updateCount = 0;
        }

        // Check for rapid successive updates (potential infinite loop)
        if (updateCount >= MAX_UPDATES_PER_SECOND) {
            logger.error('🚨 Blocked excessive query parameter updates - potential infinite loop detected', {
                updates,
                updateCount,
                timeWindow: now - lastUpdateTime
            });
            return;
        }

        updateCount++;
        lastUpdateTime = now;

        // Add updates to pending batch (this deduplicates concurrent updates)
        Object.entries(updates).forEach(([key, value]) => {
            pendingUpdates.set(key, value);
        });

        // Clear existing timer and set new one for batching
        if (updateTimer) {
            clearTimeout(updateTimer);
        }

        // Use microtask for immediate batching, but allow React to finish current render cycle
        updateTimer = setTimeout(flushUpdates, 0);
    };
}
