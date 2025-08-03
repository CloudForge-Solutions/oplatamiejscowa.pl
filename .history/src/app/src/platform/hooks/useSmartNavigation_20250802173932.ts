// src/platform/hooks/useSmartNavigation.ts - Smart navigation with parameter cleanup
// ARCHITECTURE COMPLIANCE: Automatic cleanup of irrelevant parameters

import { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getParametersToCleanup, PARAMETER_CONFIG, PARAMETER_CATEGORIES } from '@/platform/utils/QueryParameterManager';
import { logger } from '@/platform/CentralizedLogger';

/**
 * Smart Navigation Hook
 *
 * ARCHITECTURE PRINCIPLES:
 * 1. Automatic cleanup of page-specific parameters when navigating
 * 2. Preservation of global parameters across all pages
 * 3. Prevention of URL pollution
 * 4. Intelligent parameter management
 */
export function useSmartNavigation() {
    const navigate = useNavigate();
    const location = useLocation();

    /**
     * Navigate to a new path with intelligent parameter management
     * @param path - Target path
     * @param options - Navigation options
     */
    const smartNavigate = useCallback((path: string, options: { replace?: boolean } = {}) => {
        const currentPath = location.pathname;
        const currentParams = new URLSearchParams(location.search);

        // Get parameters that should be cleaned up
        const parametersToCleanup = getParametersToCleanup(currentPath, path);

        // Create new URL with only relevant parameters
        const newParams = new URLSearchParams();

        // Preserve global parameters
        Object.entries(PARAMETER_CONFIG).forEach(([key, config]) => {
            if (config.category === PARAMETER_CATEGORIES.GLOBAL) {
                const value = currentParams.get(key);
                if (value) {
                    newParams.set(key, value);
                }
            }
        });

        // Preserve page-specific parameters that are relevant to the new page
        Object.entries(PARAMETER_CONFIG).forEach(([key, config]) => {
            if (config.category === PARAMETER_CATEGORIES.PAGE_SPECIFIC && config.pages) {
                // Check if parameter is relevant to the new page
                const relevantToNewPage = config.pages.some(page => path.startsWith(page));
                if (relevantToNewPage) {
                    const value = currentParams.get(key);
                    if (value) {
                        newParams.set(key, value);
                    }
                }
            }
        });

        // Build final URL
        const queryString = newParams.toString();
        const finalUrl = queryString ? `${path}?${queryString}` : path;

        // Navigate
        if (options.replace) {
            navigate(finalUrl, { replace: true });
        } else {
            navigate(finalUrl);
        }

        logger.info('🧭 Smart navigation completed', {
            from: currentPath,
            to: path,
            cleanedParams: parametersToCleanup,
            preservedParams: Object.fromEntries(newParams.entries()),
            finalUrl
        });
    }, [navigate, location]);

    /**
     * Navigate with explicit parameter preservation
     * @param path - Target path
     * @param preserveParams - Parameters to explicitly preserve
     * @param options - Navigation options
     */
    const navigateWithParams = useCallback((
        path: string,
        preserveParams: Record<string, string> = {},
        options: { replace?: boolean } = {}
    ) => {
        const newParams = new URLSearchParams();

        // Add explicitly preserved parameters
        Object.entries(preserveParams).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                newParams.set(key, value);
            }
        });

        // Build final URL
        const queryString = newParams.toString();
        const finalUrl = queryString ? `${path}?${queryString}` : path;

        // Navigate
        if (options.replace) {
            navigate(finalUrl, { replace: true });
        } else {
            navigate(finalUrl);
        }

        logger.info('🧭 Navigation with explicit params', {
            path,
            preservedParams: preserveParams,
            finalUrl
        });
    }, [navigate]);

    /**
     * Navigate to a path and clear all parameters
     * @param path - Target path
     * @param options - Navigation options
     */
    const navigateClean = useCallback((path: string, options: { replace?: boolean } = {}) => {
        if (options.replace) {
            navigate(path, { replace: true });
        } else {
            navigate(path);
        }

        logger.info('🧭 Clean navigation (no parameters)', { path });
    }, [navigate]);

    /**
     * Get current path without parameters
     */
    const getCurrentPath = useCallback(() => {
        return location.pathname;
    }, [location.pathname]);

    /**
     * Get current search parameters
     */
    const getCurrentParams = useCallback(() => {
        return Object.fromEntries(new URLSearchParams(location.search).entries());
    }, [location.search]);

    /**
     * Check if current page has specific parameter
     */
    const hasCurrentParam = useCallback((paramName: string) => {
        const params = new URLSearchParams(location.search);
        return params.has(paramName);
    }, [location.search]);

    return {
        // Smart navigation functions
        smartNavigate,
        navigateWithParams,
        navigateClean,

        // Current state getters
        getCurrentPath,
        getCurrentParams,
        hasCurrentParam,

        // Current location info
        currentPath: location.pathname,
        currentSearch: location.search
    };
}
