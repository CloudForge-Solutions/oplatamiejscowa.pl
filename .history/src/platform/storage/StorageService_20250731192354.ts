/**
 * StorageService - Unified interface for browser storage operations
 * Orchestrates IndexedDB and localStorage managers
 * Follows single responsibility principle - only coordinates storage operations
 */

import { IndexedDBManager, DBTransaction, DBConfig } from './IndexedDBManager';
import { LocalStorageManager, UserPreferences, FormDataCache, SessionData } from './LocalStorageManager';

export interface StorageCapabilities {
  indexedDB: boolean;
  localStorage: boolean;
  quotaEstimate?: {
    quota: number;
    usage: number;
    usageDetails?: Record<string, number>;
  };
}

export interface TransactionStorageOptions {
  useIndexedDB: boolean;
  fallbackToLocalStorage: boolean;
}

export class StorageService {
  private indexedDBManager: IndexedDBManager;
  private localStorageManager: LocalStorageManager;
  private isInitialized = false;
  private capabilities: StorageCapabilities;

  private readonly DB_CONFIG: DBConfig = {
    dbName: 'TouristTaxDB',
    version: 1,
    stores: {
      transactions: 'transactions',
      preferences: 'preferences',
      consents: 'consents'
    }
  };

  constructor() {
    this.indexedDBManager = new IndexedDBManager(this.DB_CONFIG);
    this.localStorageManager = new LocalStorageManager();
    this.capabilities = this.detectCapabilities();
  }

  /**
   * Initialize storage service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Initialize IndexedDB if supported
      if (this.capabilities.indexedDB) {
        await this.indexedDBManager.initialize();
        console.log('IndexedDB initialized successfully');
      }

      // Check quota if supported
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        try {
          const estimate = await navigator.storage.estimate();
          this.capabilities.quotaEstimate = {
            quota: estimate.quota || 0,
            usage: estimate.usage || 0,
            usageDetails: estimate.usageDetails
          };
        } catch (error) {
          console.warn('Failed to get storage quota estimate:', error);
        }
      }

      this.isInitialized = true;
      console.log('StorageService initialized with capabilities:', this.capabilities);
    } catch (error) {
      console.error('Failed to initialize StorageService:', error);
      throw error;
    }
  }

  /**
   * Detect browser storage capabilities
   */
  private detectCapabilities(): StorageCapabilities {
    return {
      indexedDB: IndexedDBManager.isSupported(),
      localStorage: LocalStorageManager.isSupported()
    };
  }

  /**
   * Get storage capabilities
   */
  getCapabilities(): StorageCapabilities {
    return { ...this.capabilities };
  }

  /**
   * Store a transaction
   */
  async storeTransaction(transaction: DBTransaction, options?: TransactionStorageOptions): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('StorageService not initialized');
    }

    const useIndexedDB = options?.useIndexedDB ?? this.capabilities.indexedDB;
    const fallback = options?.fallbackToLocalStorage ?? true;

    try {
      if (useIndexedDB && this.capabilities.indexedDB) {
        await this.indexedDBManager.storeTransaction(transaction);
        return;
      }
    } catch (error) {
      console.error('Failed to store transaction in IndexedDB:', error);

      if (!fallback) {
        throw error;
      }
    }

    // Fallback to localStorage (limited functionality)
    if (fallback && this.capabilities.localStorage) {
      const recentTransactions = this.getRecentTransactionsFromLocalStorage();
      recentTransactions.unshift(transaction);

      // Keep only last 10 transactions in localStorage
      const limitedTransactions = recentTransactions.slice(0, 10);

      this.localStorageManager.updateSessionData({
        currentTransactionId: transaction.transactionId
      });

      // Store in a special localStorage key for transactions
      localStorage.setItem('tourist-tax-recent-transactions', JSON.stringify(limitedTransactions));
    } else {
      throw new Error('No storage method available for transactions');
    }
  }

  /**
   * Get transaction by ID
   */
  async getTransaction(id: string): Promise<DBTransaction | null> {
    if (!this.isInitialized) {
      throw new Error('StorageService not initialized');
    }

    // Try IndexedDB first
    if (this.capabilities.indexedDB) {
      try {
        const transaction = await this.indexedDBManager.getTransaction(id);
        if (transaction) {
          return transaction;
        }
      } catch (error) {
        console.error('Failed to get transaction from IndexedDB:', error);
      }
    }

    // Fallback to localStorage
    if (this.capabilities.localStorage) {
      const recentTransactions = this.getRecentTransactionsFromLocalStorage();
      return recentTransactions.find(t => t.id === id) || null;
    }

    return null;
  }

  /**
   * Get transaction by transaction ID
   */
  async getTransactionByTransactionId(transactionId: string): Promise<DBTransaction | null> {
    if (!this.isInitialized) {
      throw new Error('StorageService not initialized');
    }

    // Try IndexedDB first
    if (this.capabilities.indexedDB) {
      try {
        const transaction = await this.indexedDBManager.getTransactionByTransactionId(transactionId);
        if (transaction) {
          return transaction;
        }
      } catch (error) {
        console.error('Failed to get transaction from IndexedDB:', error);
      }
    }

    // Fallback to localStorage
    if (this.capabilities.localStorage) {
      const recentTransactions = this.getRecentTransactionsFromLocalStorage();
      return recentTransactions.find(t => t.transactionId === transactionId) || null;
    }

    return null;
  }

  /**
   * Get recent transactions
   */
  async getRecentTransactions(limit = 20): Promise<DBTransaction[]> {
    if (!this.isInitialized) {
      throw new Error('StorageService not initialized');
    }

    // Try IndexedDB first
    if (this.capabilities.indexedDB) {
      try {
        return await this.indexedDBManager.getRecentTransactions(limit);
      } catch (error) {
        console.error('Failed to get recent transactions from IndexedDB:', error);
      }
    }

    // Fallback to localStorage
    if (this.capabilities.localStorage) {
      const transactions = this.getRecentTransactionsFromLocalStorage();
      return transactions.slice(0, limit);
    }

    return [];
  }

  /**
   * Update transaction status
   */
  async updateTransactionStatus(
    id: string,
    status: DBTransaction['paymentStatus'],
    providerTransactionId?: string
  ): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('StorageService not initialized');
    }

    // Try IndexedDB first
    if (this.capabilities.indexedDB) {
      try {
        await this.indexedDBManager.updateTransactionStatus(id, status, providerTransactionId);
        return;
      } catch (error) {
        console.error('Failed to update transaction status in IndexedDB:', error);
      }
    }

    // Fallback to localStorage
    if (this.capabilities.localStorage) {
      const transactions = this.getRecentTransactionsFromLocalStorage();
      const transactionIndex = transactions.findIndex(t => t.id === id);

      if (transactionIndex >= 0) {
        transactions[transactionIndex].paymentStatus = status;
        transactions[transactionIndex].updatedAt = new Date().toISOString();

        if (providerTransactionId) {
          transactions[transactionIndex].providerTransactionId = providerTransactionId;
        }

        localStorage.setItem('tourist-tax-recent-transactions', JSON.stringify(transactions));
      }
    }
  }

  /**
   * Get recent transactions from localStorage
   */
  private getRecentTransactionsFromLocalStorage(): DBTransaction[] {
    try {
      const stored = localStorage.getItem('tourist-tax-recent-transactions');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to parse recent transactions from localStorage:', error);
      return [];
    }
  }

  /**
   * User preferences operations
   */
  getUserPreferences(): UserPreferences {
    return this.localStorageManager.getUserPreferences();
  }

  updateUserPreferences(preferences: Partial<UserPreferences>): boolean {
    return this.localStorageManager.updateUserPreferences(preferences);
  }

  /**
   * Form data cache operations
   */
  getFormDataCache(): FormDataCache | null {
    return this.localStorageManager.getFormDataCache();
  }

  updateFormDataCache(formData: Partial<FormDataCache>): boolean {
    return this.localStorageManager.updateFormDataCache(formData);
  }

  clearFormDataCache(): void {
    this.localStorageManager.clearFormDataCache();
  }

  /**
   * Session data operations
   */
  getSessionData(): SessionData {
    return this.localStorageManager.getSessionData();
  }

  updateSessionData(sessionData: Partial<SessionData>): boolean {
    return this.localStorageManager.updateSessionData(sessionData);
  }

  /**
   * GDPR operations
   */
  storeGDPRConsents(consents: Array<{ type: string; given: boolean; timestamp: string }>): boolean {
    return this.localStorageManager.storeGDPRConsents(consents);
  }

  getGDPRConsents(): Array<{ type: string; given: boolean; timestamp: string }> {
    return this.localStorageManager.getGDPRConsents();
  }

  /**
   * Get storage usage statistics
   */
  async getStorageUsage(): Promise<{
    indexedDB?: { transactions: number; totalSize: number };
    localStorage: { used: number; total: number; percentage: number };
    quota?: { quota: number; usage: number };
  }> {
    const result: any = {};

    // IndexedDB usage
    if (this.capabilities.indexedDB) {
      try {
        result.indexedDB = await this.indexedDBManager.getDatabaseSize();
      } catch (error) {
        console.error('Failed to get IndexedDB usage:', error);
      }
    }

    // localStorage usage
    if (this.capabilities.localStorage) {
      result.localStorage = this.localStorageManager.getStorageUsage();
    }

    // Quota information
    if (this.capabilities.quotaEstimate) {
      result.quota = {
        quota: this.capabilities.quotaEstimate.quota,
        usage: this.capabilities.quotaEstimate.usage
      };
    }

    return result;
  }

  /**
   * Cleanup old data (GDPR compliance)
   */
  async performCleanup(olderThanDays = 365): Promise<{ deletedTransactions: number }> {
    let deletedTransactions = 0;

    // Cleanup IndexedDB
    if (this.capabilities.indexedDB) {
      try {
        deletedTransactions = await this.indexedDBManager.deleteOldTransactions(olderThanDays);
      } catch (error) {
        console.error('Failed to cleanup IndexedDB:', error);
      }
    }

    // Cleanup localStorage (limited)
    if (this.capabilities.localStorage) {
      const transactions = this.getRecentTransactionsFromLocalStorage();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      const filteredTransactions = transactions.filter(t =>
        new Date(t.createdAt) > cutoffDate
      );

      if (filteredTransactions.length !== transactions.length) {
        localStorage.setItem('tourist-tax-recent-transactions', JSON.stringify(filteredTransactions));
        deletedTransactions += transactions.length - filteredTransactions.length;
      }
    }

    return { deletedTransactions };
  }

  /**
   * Export all user data (GDPR compliance)
   */
  async exportUserData(): Promise<{
    transactions: DBTransaction[];
    preferences: UserPreferences;
    formCache: FormDataCache | null;
    gdprConsents: Array<{ type: string; given: boolean; timestamp: string }>;
    exportTimestamp: string;
  }> {
    const transactions = await this.getRecentTransactions(1000); // Get all transactions
    const localStorageData = this.localStorageManager.exportUserData();

    return {
      transactions,
      preferences: localStorageData.preferences,
      formCache: localStorageData.formCache,
      gdprConsents: localStorageData.gdprConsents,
      exportTimestamp: new Date().toISOString()
    };
  }

  /**
   * Clear all user data
   */
  async clearAllData(): Promise<void> {
    // Clear localStorage
    this.localStorageManager.clearAllData();

    // Clear localStorage transactions
    localStorage.removeItem('tourist-tax-recent-transactions');

    // Note: We don't clear IndexedDB automatically for safety
    // This should be done manually by the user through UI
    console.log('All localStorage data cleared. IndexedDB data preserved.');
  }

  /**
   * Close storage connections
   */
  close(): void {
    if (this.capabilities.indexedDB) {
      this.indexedDBManager.close();
    }
    this.isInitialized = false;
  }
}
