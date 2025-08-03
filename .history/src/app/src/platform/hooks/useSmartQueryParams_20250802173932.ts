// src/platform/hooks/useSmartQueryParams.ts - Smart query parameter management hook
// ARCHITECTURE COMPLIANCE: Prevents URL pollution and infinite loops

import { useCallback, useEffect, useRef, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useQueryParams } from 'use-query-params';
import {
    getAllParametersConfig,
    getParametersToCleanup,
    getQueryParamsOptions,
    createSafeSetQuery,
    PARAMETER_CATEGORIES,
    PARAMETER_CONFIG
} from '@/platform/utils/QueryParameterManager';
import { logger } from '@/platform/CentralizedLogger';
import { debounce } from '@/platform/utils/helpers';

/**
 * Smart Query Parameters Hook
 *
 * ARCHITECTURE PRINCIPLES:
 * 1. Automatic parameter scoping based on current page
 * 2. Automatic cleanup of irrelevant parameters
 * 3. Infinite loop prevention
 * 4. Built-in validation
 * 5. Performance optimization
 */
export function useSmartQueryParams() {
    const location = useLocation();
    const previousPathRef = useRef<string>(location.pathname);
    const updateCountRef = useRef<number>(0);
    const lastResetTimeRef = useRef<number>(Date.now());

    // Circuit breaker pattern - prevent excessive updates
    const MAX_UPDATES_PER_MINUTE = 50;
    const RESET_INTERVAL = 60000; // 1 minute

    // Get parameters configuration for current page
    const parametersConfig = getAllParametersConfig(location.pathname);

    // Use query params with optimized options
    const [query, originalSetQuery] = useQueryParams(
        parametersConfig,
        getQueryParamsOptions()
    );

    // Create safe setQuery function to prevent infinite loops
    const safeSetQuery = useCallback(
        createSafeSetQuery(originalSetQuery),
        [originalSetQuery]
    );

    // Create debounced version for additional protection against rapid updates
    // CRITICAL FIX: Reduced debounce delay for better responsiveness with new batching system
    const debouncedSetQuery = useMemo(
        () => debounce(safeSetQuery, 16), // ~1 frame at 60fps for better UX
        [safeSetQuery]
    );

    // Track navigation changes for parameter cleanup
    useEffect(() => {
        const currentPath = location.pathname;
        const previousPath = previousPathRef.current;

        if (currentPath !== previousPath) {
            logger.info('🔄 Page navigation detected', {
                from: previousPath,
                to: currentPath
            });

            // Get parameters that should be cleaned up
            const parametersToCleanup = getParametersToCleanup(previousPath, currentPath);

            if (parametersToCleanup.length > 0) {
                // Create cleanup object
                const cleanupUpdates: Record<string, undefined> = {};
                parametersToCleanup.forEach(param => {
                    cleanupUpdates[param] = undefined;
                });

                // Clean up irrelevant parameters
                safeSetQuery(cleanupUpdates);

                logger.info('🧹 Cleaned up irrelevant parameters', {
                    cleanedParams: parametersToCleanup,
                    fromPage: previousPath,
                    toPage: currentPath
                });
            }

            previousPathRef.current = currentPath;
        }
    }, [location.pathname, safeSetQuery]);

    /**
     * Circuit breaker check - prevent excessive updates
     */
    const checkCircuitBreaker = useCallback(() => {
        const now = Date.now();

        // Reset counter if enough time has passed
        if (now - lastResetTimeRef.current > RESET_INTERVAL) {
            updateCountRef.current = 0;
            lastResetTimeRef.current = now;
        }

        // Check if we've exceeded the limit
        if (updateCountRef.current >= MAX_UPDATES_PER_MINUTE) {
            logger.error('🚨 Circuit breaker activated - too many parameter updates', {
                updateCount: updateCountRef.current,
                timeWindow: now - lastResetTimeRef.current
            });
            return false;
        }

        updateCountRef.current++;
        return true;
    }, []);

    /**
     * Set global parameter (persists across all pages)
     */
    const setGlobalParam = useCallback((key: string, value: any) => {
        if (!checkCircuitBreaker()) {
            return;
        }

        const config = PARAMETER_CONFIG[key as keyof typeof PARAMETER_CONFIG];

        if (!config) {
            logger.warn('⚠️ Unknown parameter', { key, value });
            return;
        }

        if (config.category !== PARAMETER_CATEGORIES.GLOBAL) {
            logger.warn('⚠️ Attempted to set non-global parameter as global', { key, value, category: config.category });
            return;
        }

        safeSetQuery({ [key]: value });
    }, [safeSetQuery, checkCircuitBreaker]);

    /**
     * Set page-specific parameter (only relevant to current page)
     */
    const setPageParam = useCallback((key: string, value: any) => {
        const config = PARAMETER_CONFIG[key as keyof typeof PARAMETER_CONFIG];

        if (!config) {
            logger.warn('⚠️ Unknown parameter', { key, value });
            return;
        }

        if (config.category === PARAMETER_CATEGORIES.GLOBAL) {
            logger.warn('⚠️ Use setGlobalParam for global parameters', { key, value });
            return;
        }

        // Check if parameter is relevant to current page
        if (config.pages && !config.pages.some(page => location.pathname.startsWith(page))) {
            logger.warn('⚠️ Parameter not relevant to current page', {
                key,
                value,
                currentPage: location.pathname,
                relevantPages: config.pages
            });
            return;
        }

        safeSetQuery({ [key]: value });
    }, [safeSetQuery, location.pathname]);

    /**
     * Set multiple parameters at once (batch update)
     */
    const setParams = useCallback((updates: Record<string, any>) => {
        // Validate all parameters before batch update
        const validUpdates: Record<string, any> = {};
        const invalidParams: string[] = [];

        Object.entries(updates).forEach(([key, value]) => {
            const config = PARAMETER_CONFIG[key as keyof typeof PARAMETER_CONFIG];

            if (!config) {
                invalidParams.push(key);
                return;
            }

            // Check page relevance for page-specific parameters
            if (config.category === PARAMETER_CATEGORIES.PAGE_SPECIFIC) {
                if (config.pages && !config.pages.some(page => location.pathname.startsWith(page))) {
                    logger.warn('⚠️ Skipping parameter not relevant to current page', {
                        key,
                        currentPage: location.pathname,
                        relevantPages: config.pages
                    });
                    return;
                }
            }

            validUpdates[key] = value;
        });

        if (invalidParams.length > 0) {
            logger.warn('⚠️ Skipped invalid parameters in batch update', { invalidParams });
        }

        if (Object.keys(validUpdates).length > 0) {
            safeSetQuery(validUpdates);
        }
    }, [safeSetQuery, location.pathname]);

    /**
     * Clear specific parameter
     */
    const clearParam = useCallback((key: string) => {
        safeSetQuery({ [key]: undefined });
    }, [safeSetQuery]);

    /**
     * Clear all page-specific parameters (keep global ones)
     */
    const clearPageParams = useCallback(() => {
        const clearUpdates: Record<string, undefined> = {};

        Object.entries(PARAMETER_CONFIG).forEach(([key, config]) => {
            if (config.category === PARAMETER_CATEGORIES.PAGE_SPECIFIC && query[key] !== undefined) {
                clearUpdates[key] = undefined;
            }
        });

        if (Object.keys(clearUpdates).length > 0) {
            safeSetQuery(clearUpdates);
            logger.info('🧹 Cleared all page-specific parameters', { clearedParams: Object.keys(clearUpdates) });
        }
    }, [safeSetQuery, query]);

    /**
     * Get parameter value with type safety
     */
    const getParam = useCallback((key: string) => {
        return query[key];
    }, [query]);

    /**
     * Check if parameter exists and has a value
     */
    const hasParam = useCallback((key: string) => {
        const value = query[key];
        return value !== undefined && value !== null && value !== '';
    }, [query]);

    return {
        // Current query state
        query,

        // Parameter setters
        setGlobalParam,
        setPageParam,
        setParams,

        // Parameter getters
        getParam,
        hasParam,

        // Parameter clearers
        clearParam,
        clearPageParams,

        // Current page info
        currentPath: location.pathname,

        // Raw setQuery for advanced use cases (use with caution)
        setQuery: safeSetQuery
    };
}
