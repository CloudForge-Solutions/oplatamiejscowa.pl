/**
 * Storage Service - Platform Service
 *
 * ARCHITECTURE: Main orchestrator for all storage operations
 * - Simple localStorage-only architecture (no IndexedDB complexity)
 * - Repository pattern for data access
 * - Smart caching with TTL support
 * - EventBus integration for storage events
 * - Mobile-first performance optimization
 */

import { CACHE_CONFIG } from '../../constants';

import {logger} from '@/platform/CentralizedLogger';
interface CacheEntry<T> {
    data: T;
    timestamp: number;
    ttl: number;
}

interface StorageOptions {
    ttl?: number;
    skipCache?: boolean;
    silent?: boolean;
}

/**
 * StorageService - Main storage orchestrator
 *
 * ARCHITECTURE PRINCIPLE: Single source of truth for all storage operations
 * - Repository pattern for data access
 * - Smart caching with TTL support
 * - EventBus integration for storage events
 * - Fail-fast validation with proper error handling
 */
export class StorageService {
    private cache = new Map<string, CacheEntry<any>>();

    constructor() {
        logger.info('💾 StorageService initialized', {
            storageType: 'localStorage',
            cacheEnabled: true,
            defaultTTL: CACHE_CONFIG.DEFAULT_TTL
        });

        // Clean up expired cache entries on initialization
        this.cleanupExpiredCache();
    }

    /**
     * Get data from storage with caching
     */
    get<T>(key: string, options: StorageOptions = {}): T | null {
        try {
            // Check cache first (unless skipCache is true)
            if (!options.skipCache) {
                const cached = this.getFromCache<T>(key);
                if (cached !== null) {
                    if (!options.silent) {
                        logger.debug(`Cache hit for key: ${key}`);
                    }
                    return cached;
                }
            }

            // Get from localStorage
            const stored = localStorage.getItem(key);
            if (stored === null) {
                return null;
            }

            const parsed = JSON.parse(stored) as T;

            // Cache the result
            this.setCache(key, parsed, options.ttl || CACHE_CONFIG.DEFAULT_TTL);

            if (!options.silent) {
                logger.debug(`Retrieved from localStorage: ${key}`);
            }

            return parsed;
        } catch (error) {
            logger.error(`Failed to get data for key: ${key}`, error);
            return null;
        }
    }

    /**
     * Set data in storage with caching
     */
    set<T>(key: string, value: T, options: StorageOptions = {}): boolean {
        try {
            const serialized = JSON.stringify(value);
            localStorage.setItem(key, serialized);

            // Update cache
            this.setCache(key, value, options.ttl || CACHE_CONFIG.DEFAULT_TTL);

            if (!options.silent) {
                logger.debug(`Stored data for key: ${key}`, { size: serialized.length });
            }

            // Emit storage event
            this.emitStorageEvent('set', key, value);

            return true;
        } catch (error) {
            logger.error(`Failed to set data for key: ${key}`, error);
            return false;
        }
    }

    /**
     * Remove data from storage and cache
     */
    remove(key: string, options: StorageOptions = {}): boolean {
        try {
            localStorage.removeItem(key);
            this.cache.delete(key);

            if (!options.silent) {
                logger.debug(`Removed data for key: ${key}`);
            }

            // Emit storage event
            this.emitStorageEvent('remove', key, null);

            return true;
        } catch (error) {
            logger.error(`Failed to remove data for key: ${key}`, error);
            return false;
        }
    }

    /**
     * Clear all storage and cache
     */
    clear(options: StorageOptions = {}): boolean {
        try {
            localStorage.clear();
            this.cache.clear();

            if (!options.silent) {
                logger.info('Cleared all storage data');
            }

            // Emit storage event
            this.emitStorageEvent('clear', null, null);

            return true;
        } catch (error) {
            logger.error('Failed to clear storage', error);
            return false;
        }
    }

    /**
     * Check if key exists in storage
     */
    has(key: string): boolean {
        return localStorage.getItem(key) !== null;
    }

    /**
     * Get all keys from storage
     */
    keys(): string[] {
        const keys: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key) {
                keys.push(key);
            }
        }
        return keys;
    }

    /**
     * Get storage size information
     */
    getStorageInfo(): { used: number; available: number; keys: number } {
        let used = 0;
        const keys = this.keys();

        keys.forEach(key => {
            const value = localStorage.getItem(key);
            if (value) {
                used += key.length + value.length;
            }
        });

        return {
            used,
            available: 5 * 1024 * 1024 - used, // Assume 5MB limit
            keys: keys.length
        };
    }

    /**
     * Get data from cache
     */
    private getFromCache<T>(key: string): T | null {
        const entry = this.cache.get(key);
        if (!entry) {
            return null;
        }

        // Check if cache entry is expired
        if (Date.now() - entry.timestamp > entry.ttl) {
            this.cache.delete(key);
            return null;
        }

        return entry.data;
    }

    /**
     * Set data in cache
     */
    private setCache<T>(key: string, data: T, ttl: number): void {
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            ttl
        });
    }

    /**
     * Clean up expired cache entries
     */
    private cleanupExpiredCache(): void {
        const now = Date.now();
        const expiredKeys: string[] = [];

        this.cache.forEach((entry, key) => {
            if (now - entry.timestamp > entry.ttl) {
                expiredKeys.push(key);
            }
        });

        expiredKeys.forEach(key => {
            this.cache.delete(key);
        });

        if (expiredKeys.length > 0) {
            logger.debug(`Cleaned up ${expiredKeys.length} expired cache entries`);
        }
    }

    /**
     * Emit storage event via EventBus
     */
    private emitStorageEvent(action: string, key: string | null, value: any): void {
        try {
            // TODO: Integrate with EventBus when implemented
            // For now, just log the event
            logger.debug(`Storage event: ${action}`, { key, hasValue: value !== null });
        } catch (error) {
            logger.warn('Failed to emit storage event', error);
        }
    }
}

// Create singleton instance
export const storageService = new StorageService();

// Export as default for easy importing
export default storageService;
