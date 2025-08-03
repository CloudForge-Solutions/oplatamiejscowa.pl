/**
 * Local Storage Manager - Platform Service
 *
 * ARCHITECTURE: Tourist tax specific localStorage management
 * - Handles preferences, form cache, session data, transactions
 * - Type-safe data access with validation
 * - Smart caching with TTL support
 * - GDPR compliance with automatic cleanup
 * - Mobile-first performance optimization
 */

import { logger } from '../CentralizedLogger';
import { STORAGE_KEYS, CACHE_CONFIG } from '../../constants';
import { StorageService } from './StorageService';

// Type definitions for tourist tax data
interface TouristTaxPreferences {
    language: string;
    theme: 'light' | 'dark';
    autoSave: boolean;
    notifications: boolean;
}

interface TouristTaxFormCache {
    cityCode?: string;
    checkInDate?: string;
    checkOutDate?: string;
    guestCount?: number;
    accommodationName?: string;
    lastUpdated: string;
}

interface TouristTaxSession {
    currentStep: number;
    paymentId?: string;
    reservationId?: string;
    sessionStarted: string;
    lastActivity: string;
}

interface GDPRConsents {
    dataProcessing: boolean;
    marketing: boolean;
    analytics: boolean;
    consentDate: string;
    version: string;
}

/**
 * LocalStorageManager - Tourist tax specific data management
 *
 * ARCHITECTURE PRINCIPLE: Type-safe localStorage operations for tourist tax app
 * - Structured data access with validation
 * - Automatic data cleanup and GDPR compliance
 * - Smart caching for performance
 * - Fail-fast validation with proper error handling
 */
export class LocalStorageManager {
    private storageService: StorageService;

    constructor() {
        this.storageService = new StorageService();
        logger.info('🏠 LocalStorageManager initialized for tourist tax app');

        // Initialize default preferences if not exists
        this.initializeDefaults();
    }

    /**
     * Get user preferences
     */
    getPreferences(): TouristTaxPreferences {
        const preferences = storageService.get<TouristTaxPreferences>(
            STORAGE_KEYS.TOURIST_TAX_PREFERENCES,
            { ttl: CACHE_CONFIG.DEFAULT_TTL }
        );

        return preferences || this.getDefaultPreferences();
    }

    /**
     * Set user preferences
     */
    setPreferences(preferences: Partial<TouristTaxPreferences>): boolean {
        const current = this.getPreferences();
        const updated = { ...current, ...preferences };

        const success = storageService.set(
            STORAGE_KEYS.TOURIST_TAX_PREFERENCES,
            updated,
            { ttl: CACHE_CONFIG.DEFAULT_TTL }
        );

        if (success) {
            logger.info('User preferences updated', updated);
        }

        return success;
    }

    /**
     * Get form cache data
     */
    getFormCache(): TouristTaxFormCache | null {
        return storageService.get<TouristTaxFormCache>(
            STORAGE_KEYS.TOURIST_TAX_FORM_CACHE,
            { ttl: CACHE_CONFIG.DEFAULT_TTL }
        );
    }

    /**
     * Set form cache data
     */
    setFormCache(formData: Partial<TouristTaxFormCache>): boolean {
        const current = this.getFormCache() || { lastUpdated: new Date().toISOString() };
        const updated = {
            ...current,
            ...formData,
            lastUpdated: new Date().toISOString()
        };

        const success = storageService.set(
            STORAGE_KEYS.TOURIST_TAX_FORM_CACHE,
            updated,
            { ttl: CACHE_CONFIG.DEFAULT_TTL }
        );

        if (success) {
            logger.debug('Form cache updated', { fields: Object.keys(formData) });
        }

        return success;
    }

    /**
     * Clear form cache
     */
    clearFormCache(): boolean {
        const success = storageService.remove(STORAGE_KEYS.TOURIST_TAX_FORM_CACHE);

        if (success) {
            logger.info('Form cache cleared');
        }

        return success;
    }

    /**
     * Get session data
     */
    getSession(): TouristTaxSession | null {
        return storageService.get<TouristTaxSession>(
            STORAGE_KEYS.TOURIST_TAX_SESSION,
            { ttl: CACHE_CONFIG.DEFAULT_TTL }
        );
    }

    /**
     * Set session data
     */
    setSession(sessionData: Partial<TouristTaxSession>): boolean {
        const current = this.getSession() || {
            currentStep: 1,
            sessionStarted: new Date().toISOString(),
            lastActivity: new Date().toISOString()
        };

        const updated = {
            ...current,
            ...sessionData,
            lastActivity: new Date().toISOString()
        };

        const success = storageService.set(
            STORAGE_KEYS.TOURIST_TAX_SESSION,
            updated,
            { ttl: CACHE_CONFIG.DEFAULT_TTL }
        );

        if (success) {
            logger.debug('Session data updated', { step: updated.currentStep });
        }

        return success;
    }

    /**
     * Clear session data
     */
    clearSession(): boolean {
        const success = storageService.remove(STORAGE_KEYS.TOURIST_TAX_SESSION);

        if (success) {
            logger.info('Session data cleared');
        }

        return success;
    }

    /**
     * Get GDPR consents
     */
    getGDPRConsents(): GDPRConsents | null {
        return storageService.get<GDPRConsents>(
            STORAGE_KEYS.TOURIST_TAX_GDPR_CONSENTS,
            { ttl: CACHE_CONFIG.DEFAULT_TTL }
        );
    }

    /**
     * Set GDPR consents
     */
    setGDPRConsents(consents: Partial<GDPRConsents>): boolean {
        const updated: GDPRConsents = {
            dataProcessing: false,
            marketing: false,
            analytics: false,
            consentDate: new Date().toISOString(),
            version: '1.0',
            ...consents
        };

        const success = storageService.set(
            STORAGE_KEYS.TOURIST_TAX_GDPR_CONSENTS,
            updated,
            { ttl: CACHE_CONFIG.DEFAULT_TTL }
        );

        if (success) {
            logger.info('GDPR consents updated', updated);
        }

        return success;
    }

    /**
     * Get app version
     */
    getAppVersion(): string | null {
        return storageService.get<string>(STORAGE_KEYS.TOURIST_TAX_APP_VERSION);
    }

    /**
     * Set app version
     */
    setAppVersion(version: string): boolean {
        return storageService.set(STORAGE_KEYS.TOURIST_TAX_APP_VERSION, version);
    }

    /**
     * Clear all tourist tax data
     */
    clearAllData(): boolean {
        const keys = [
            STORAGE_KEYS.TOURIST_TAX_PREFERENCES,
            STORAGE_KEYS.TOURIST_TAX_FORM_CACHE,
            STORAGE_KEYS.TOURIST_TAX_SESSION,
            STORAGE_KEYS.TOURIST_TAX_GDPR_CONSENTS,
            STORAGE_KEYS.TOURIST_TAX_APP_VERSION
        ];

        let success = true;
        keys.forEach(key => {
            if (!storageService.remove(key, { silent: true })) {
                success = false;
            }
        });

        if (success) {
            logger.info('All tourist tax data cleared');
        }

        return success;
    }

    /**
     * Initialize default preferences
     */
    private initializeDefaults(): void {
        if (!this.getPreferences()) {
            this.setPreferences(this.getDefaultPreferences());
        }
    }

    /**
     * Get default preferences
     */
    private getDefaultPreferences(): TouristTaxPreferences {
        return {
            language: 'pl',
            theme: 'light',
            autoSave: true,
            notifications: true
        };
    }
}

// Create singleton instance
export const localStorageManager = new LocalStorageManager();

// Export as default for easy importing
export default localStorageManager;
