import { useState, useCallback, useEffect } from 'react';
import { TouristTaxData, Transaction } from '../types/TouristTaxTypes';
import { StorageService } from '../../../platform/storage/StorageService';
import { UserPreferences, FormDataCache } from '../../../platform/storage/LocalStorageManager';
import { DBTransaction } from '../../../platform/storage/IndexedDBManager';

interface UseLocalStorageReturn {
  // Form data management
  getStoredFormData: () => Partial<TouristTaxData> | null;
  storeFormData: (data: Partial<TouristTaxData>) => void;
  clearFormData: () => void;

  // Transaction history
  getRecentTransactions: () => Promise<DBTransaction[]>;
  addTransaction: (transaction: DBTransaction) => Promise<void>;
  clearTransactionHistory: () => Promise<void>;

  // User preferences
  getUserPreferences: () => UserPreferences;
  updateUserPreferences: (preferences: Partial<UserPreferences>) => void;

  // General storage utilities
  clearAllData: () => Promise<void>;
  getStorageSize: () => Promise<any>;

  // Storage service status
  isInitialized: boolean;
  initializationError: string | null;
}

// Singleton storage service instance
let storageServiceInstance: StorageService | null = null;

const getStorageService = async (): Promise<StorageService> => {
  if (!storageServiceInstance) {
    storageServiceInstance = new StorageService();
    await storageServiceInstance.initialize();
  }
  return storageServiceInstance;
};

export const useLocalStorage = (): UseLocalStorageReturn => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initializationError, setInitializationError] = useState<string | null>(null);

  // Initialize storage service on first use
  useEffect(() => {
    const initializeStorage = async () => {
      try {
        await getStorageService();
        setIsInitialized(true);
        setInitializationError(null);
      } catch (error) {
        console.error('Failed to initialize storage service:', error);
        setInitializationError(error instanceof Error ? error.message : 'Unknown error');
        setIsInitialized(false);
      }
    };

    initializeStorage();
  }, []);

  // Form data management
  const getStoredFormData = useCallback((): Partial<TouristTaxData> | null => {
    const preferences = getUserPreferences();
    if (!preferences.rememberFormData) {
      return null;
    }

    return safeParseJSON<Partial<TouristTaxData> | null>(STORAGE_KEYS.FORM_DATA, null);
  }, []);

  const storeFormData = useCallback((data: Partial<TouristTaxData>): void => {
    const preferences = getUserPreferences();
    if (!preferences.rememberFormData) {
      return;
    }

    // Don't store sensitive data
    const sanitizedData = {
      ...data,
      email: '', // Don't store email for privacy
      phone: '', // Don't store phone for privacy
      gdprConsents: [] // Don't store consents
    };

    safeStoreJSON(STORAGE_KEYS.FORM_DATA, sanitizedData);
  }, []);

  const clearFormData = useCallback((): void => {
    localStorage.removeItem(STORAGE_KEYS.FORM_DATA);
    forceUpdate({});
  }, []);

  // Transaction history management
  const getRecentTransactions = useCallback((): Transaction[] => {
    return safeParseJSON<Transaction[]>(STORAGE_KEYS.RECENT_TRANSACTIONS, []);
  }, []);

  const addTransaction = useCallback((transaction: Transaction): void => {
    const existingTransactions = getRecentTransactions();

    // Check if transaction already exists
    const existingIndex = existingTransactions.findIndex(t => t.transactionId === transaction.transactionId);

    let updatedTransactions: Transaction[];
    if (existingIndex >= 0) {
      // Update existing transaction
      updatedTransactions = [...existingTransactions];
      updatedTransactions[existingIndex] = transaction;
    } else {
      // Add new transaction at the beginning
      updatedTransactions = [transaction, ...existingTransactions];
    }

    // Keep only the most recent 20 transactions
    const limitedTransactions = updatedTransactions
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 20);

    safeStoreJSON(STORAGE_KEYS.RECENT_TRANSACTIONS, limitedTransactions);
    forceUpdate({});
  }, [getRecentTransactions]);

  const clearTransactionHistory = useCallback((): void => {
    localStorage.removeItem(STORAGE_KEYS.RECENT_TRANSACTIONS);
    forceUpdate({});
  }, []);

  // User preferences management
  const getUserPreferences = useCallback((): UserPreferences => {
    return safeParseJSON<UserPreferences>(STORAGE_KEYS.USER_PREFERENCES, DEFAULT_PREFERENCES);
  }, []);

  const updateUserPreferences = useCallback((preferences: Partial<UserPreferences>): void => {
    const currentPreferences = getUserPreferences();
    const updatedPreferences = { ...currentPreferences, ...preferences };
    safeStoreJSON(STORAGE_KEYS.USER_PREFERENCES, updatedPreferences);
    forceUpdate({});
  }, [getUserPreferences]);

  // General utilities
  const clearAllData = useCallback((): void => {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    forceUpdate({});
  }, []);

  const getStorageSize = useCallback((): number => {
    let totalSize = 0;
    Object.values(STORAGE_KEYS).forEach(key => {
      const item = localStorage.getItem(key);
      if (item) {
        totalSize += item.length;
      }
    });
    return totalSize;
  }, []);

  return {
    getStoredFormData,
    storeFormData,
    clearFormData,
    getRecentTransactions,
    addTransaction,
    clearTransactionHistory,
    getUserPreferences,
    updateUserPreferences,
    clearAllData,
    getStorageSize
  };
};
