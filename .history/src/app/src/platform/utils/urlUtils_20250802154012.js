// src/utils/urlUtils.js - URL parameter handling utilities
import {logger} from '@/platform/CentralizedLogger';

/**
 * Get URL search parameters as an object
 * @returns {Object} URL parameters as key-value pairs
 */
export function getUrlParams() {
	try {
		const params = new URLSearchParams(window.location.search);
		const result = {};
		for (const [key, value] of params.entries()) {
			result[key] = value;
		}
		return result;
	} catch (error) {
		logger.error('❌ Failed to parse URL parameters', {error: error.message});
		return {};
	}
}

/**
 * Get a specific URL parameter
 * @param {string} paramName - Parameter name
 * @returns {string|null} Parameter value or null if not found
 */
export function getUrlParam(paramName) {
	try {
		const params = new URLSearchParams(window.location.search);
		return params.get(paramName);
	} catch (error) {
		logger.error('❌ Failed to get URL parameter', {paramName, error: error.message});
		return null;
	}
}

/**
 * Update URL parameters without page reload
 * @param {Object} params - Parameters to update
 * @param {boolean} replace - Whether to replace current history entry
 */
export function updateUrlParams(params, replace = false) {
	try {
		const url = new URL(window.location);

		// Update parameters
		Object.entries(params).forEach(([key, value]) => {
			if (value !== null && value !== undefined && value !== '') {
				url.searchParams.set(key, value);
			} else {
				url.searchParams.delete(key);
			}
		});

		// Update browser history
		if (replace) {
			window.history.replaceState({}, '', url.toString());
		} else {
			window.history.pushState({}, '', url.toString());
		}

		logger.shell('🔗 URL parameters updated', {params, url: url.toString()});
	} catch (error) {
		logger.error('❌ Failed to update URL parameters', {params, error: error.message});
	}
}

/**
 * Navigate to a URL with parameters
 * @param {string} path - Base path
 * @param {Object} params - URL parameters
 */
export function navigateWithParams(path, params = {}) {
	try {
		const url = new URL(path, window.location.origin);

		// Add parameters
		Object.entries(params).forEach(([key, value]) => {
			if (value !== null && value !== undefined && value !== '') {
				url.searchParams.set(key, value);
			}
		});

		window.location.href = url.toString();
		logger.shell('🔗 Navigating with parameters', {path, params, url: url.toString()});
	} catch (error) {
		logger.error('❌ Failed to navigate with parameters', {path, params, error: error.message});
	}
}

/**
 * Check if current URL matches a path pattern
 * @param {string} pattern - Path pattern to match
 * @returns {boolean} True if URL matches pattern
 */
export function matchesUrlPattern(pattern) {
	try {
		const currentPath = window.location.pathname;
		return currentPath.startsWith(pattern);
	} catch (error) {
		logger.error('❌ Failed to match URL pattern', {pattern, error: error.message});
		return false;
	}
}
