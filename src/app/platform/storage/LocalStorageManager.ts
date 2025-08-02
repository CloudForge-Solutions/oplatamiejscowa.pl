/**
 * LocalStorageManager - Handles localStorage operations for user preferences and temporary data
 * Follows single responsibility principle - only manages localStorage operations
 */

export interface UserPreferences {
  language: 'pl' | 'en';
  currency: 'PLN';
  rememberFormData: boolean;
  emailNotifications: boolean;
  theme: 'light' | 'dark';
  autoSaveInterval: number; // seconds
}

export interface FormDataCache {
  firstName?: string;
  lastName?: string;
  cityCode?: string;
  cityName?: string;
  checkInDate?: string;
  checkOutDate?: string;
  numberOfPersons?: number;
  accommodationType?: string;
  accommodationName?: string;
  accommodationAddress?: string;
  lastUpdated: string;
}

export interface SessionData {
  currentTransactionId?: string;
  paymentInProgress?: boolean;
  lastActivity: string;
}

export class LocalStorageManager {
  private readonly STORAGE_KEYS = {
    USER_PREFERENCES: 'tourist-tax-preferences',
    FORM_DATA_CACHE: 'tourist-tax-form-cache',
    SESSION_DATA: 'tourist-tax-session',
    GDPR_CONSENTS: 'tourist-tax-gdpr-consents',
    APP_VERSION: 'tourist-tax-app-version'
  } as const;

  private readonly DEFAULT_PREFERENCES: UserPreferences = {
    language: 'pl',
    currency: 'PLN',
    rememberFormData: true,
    emailNotifications: true,
    theme: 'light',
    autoSaveInterval: 30
  };

  /**
   * Check if localStorage is available
   */
  static isSupported(): boolean {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Safely parse JSON from localStorage
   */
  private safeParseJSON<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`Failed to parse localStorage item "${key}":`, error);
      return defaultValue;
    }
  }

  /**
   * Safely store JSON in localStorage
   */
  private safeStoreJSON(key: string, value: unknown): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Failed to store localStorage item "${key}":`, error);

      // Handle quota exceeded error
      if (error instanceof DOMException && error.code === 22) {
        console.warn('localStorage quota exceeded, attempting cleanup...');
        this.performCleanup();

        try {
          localStorage.setItem(key, JSON.stringify(value));
          return true;
        } catch (retryError) {
          console.error('Failed to store data even after cleanup:', retryError);
        }
      }
      return false;
    }
  }

  /**
   * Get user preferences
   */
  getUserPreferences(): UserPreferences {
    return this.safeParseJSON(this.STORAGE_KEYS.USER_PREFERENCES, this.DEFAULT_PREFERENCES);
  }

  /**
   * Update user preferences
   */
  updateUserPreferences(preferences: Partial<UserPreferences>): boolean {
    const currentPreferences = this.getUserPreferences();
    const updatedPreferences = { ...currentPreferences, ...preferences };
    return this.safeStoreJSON(this.STORAGE_KEYS.USER_PREFERENCES, updatedPreferences);
  }

  /**
   * Get cached form data
   */
  getFormDataCache(): FormDataCache | null {
    const preferences = this.getUserPreferences();
    if (!preferences.rememberFormData) {
      return null;
    }

    const cached = this.safeParseJSON<FormDataCache | null>(
      this.STORAGE_KEYS.FORM_DATA_CACHE,
      null
    );

    // Check if cache is too old (24 hours)
    if (cached && cached.lastUpdated) {
      const cacheAge = Date.now() - new Date(cached.lastUpdated).getTime();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours

      if (cacheAge > maxAge) {
        this.clearFormDataCache();
        return null;
      }
    }

    return cached;
  }

  /**
   * Update form data cache
   */
  updateFormDataCache(formData: Partial<FormDataCache>): boolean {
    const preferences = this.getUserPreferences();
    if (!preferences.rememberFormData) {
      return true; // Don't store if user doesn't want it
    }

    const currentCache = this.getFormDataCache() || ({} as FormDataCache);

    // Don't cache sensitive data
    const sanitizedData: FormDataCache = {
      ...currentCache,
      ...formData,
      // Remove sensitive fields
      firstName: undefined,
      lastName: undefined,
      lastUpdated: new Date().toISOString()
    };

    return this.safeStoreJSON(this.STORAGE_KEYS.FORM_DATA_CACHE, sanitizedData);
  }

  /**
   * Clear form data cache
   */
  clearFormDataCache(): void {
    localStorage.removeItem(this.STORAGE_KEYS.FORM_DATA_CACHE);
  }

  /**
   * Get session data
   */
  getSessionData(): SessionData {
    return this.safeParseJSON(this.STORAGE_KEYS.SESSION_DATA, {
      lastActivity: new Date().toISOString()
    });
  }

  /**
   * Update session data
   */
  updateSessionData(sessionData: Partial<SessionData>): boolean {
    const currentSession = this.getSessionData();
    const updatedSession = {
      ...currentSession,
      ...sessionData,
      lastActivity: new Date().toISOString()
    };
    return this.safeStoreJSON(this.STORAGE_KEYS.SESSION_DATA, updatedSession);
  }

  /**
   * Clear session data
   */
  clearSessionData(): void {
    localStorage.removeItem(this.STORAGE_KEYS.SESSION_DATA);
  }

  /**
   * Store GDPR consents
   */
  storeGDPRConsents(consents: Array<{ type: string; given: boolean; timestamp: string }>): boolean {
    return this.safeStoreJSON(this.STORAGE_KEYS.GDPR_CONSENTS, consents);
  }

  /**
   * Get GDPR consents
   */
  getGDPRConsents(): Array<{ type: string; given: boolean; timestamp: string }> {
    return this.safeParseJSON(this.STORAGE_KEYS.GDPR_CONSENTS, []);
  }

  /**
   * Get app version
   */
  getAppVersion(): string | null {
    return localStorage.getItem(this.STORAGE_KEYS.APP_VERSION);
  }

  /**
   * Set app version
   */
  setAppVersion(version: string): boolean {
    return this.safeStoreJSON(this.STORAGE_KEYS.APP_VERSION, version);
  }

  /**
   * Check if this is a new app version
   */
  isNewAppVersion(currentVersion: string): boolean {
    const storedVersion = this.getAppVersion();
    return storedVersion !== currentVersion;
  }

  /**
   * Get storage usage estimation
   */
  getStorageUsage(): { used: number; total: number; percentage: number } {
    let used = 0;

    // Calculate used space
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        used += localStorage[key].length + key.length;
      }
    }

    // Estimate total available space (usually 5-10MB)
    const total = 5 * 1024 * 1024; // 5MB estimation
    const percentage = (used / total) * 100;

    return { used, total, percentage };
  }

  /**
   * Perform cleanup when storage is full
   */
  private performCleanup(): void {
    try {
      // Clear old form cache
      this.clearFormDataCache();

      // Clear old session data
      this.clearSessionData();

      console.log('localStorage cleanup completed');
    } catch (error) {
      console.error('Failed to perform localStorage cleanup:', error);
    }
  }

  /**
   * Clear all application data
   */
  clearAllData(): void {
    Object.values(this.STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }

  /**
   * Export user data (GDPR compliance)
   */
  exportUserData(): {
    preferences: UserPreferences;
    formCache: FormDataCache | null;
    gdprConsents: Array<{ type: string; given: boolean; timestamp: string }>;
    exportTimestamp: string;
  } {
    return {
      preferences: this.getUserPreferences(),
      formCache: this.getFormDataCache(),
      gdprConsents: this.getGDPRConsents(),
      exportTimestamp: new Date().toISOString()
    };
  }

  /**
   * Import user data
   */
  importUserData(data: {
    preferences?: UserPreferences;
    formCache?: FormDataCache;
    gdprConsents?: Array<{ type: string; given: boolean; timestamp: string }>;
  }): boolean {
    try {
      if (data.preferences) {
        this.updateUserPreferences(data.preferences);
      }

      if (data.formCache) {
        this.safeStoreJSON(this.STORAGE_KEYS.FORM_DATA_CACHE, data.formCache);
      }

      if (data.gdprConsents) {
        this.storeGDPRConsents(data.gdprConsents);
      }

      return true;
    } catch (error) {
      console.error('Failed to import user data:', error);
      return false;
    }
  }
}
