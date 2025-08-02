import { useState, useCallback } from 'react';
import { TouristTaxData, Transaction, UserPreferences, LocalStorageData } from '../types/TouristTaxTypes';

const STORAGE_KEYS = {
  FORM_DATA: 'tourist-tax-form-data',
  RECENT_TRANSACTIONS: 'tourist-tax-recent-transactions',
  USER_PREFERENCES: 'tourist-tax-user-preferences'
} as const;

interface UseLocalStorageReturn {
  // Form data management
  getStoredFormData: () => Partial<TouristTaxData> | null;
  storeFormData: (data: Partial<TouristTaxData>) => void;
  clearFormData: () => void;
  
  // Transaction history
  getRecentTransactions: () => Transaction[];
  addTransaction: (transaction: Transaction) => void;
  clearTransactionHistory: () => void;
  
  // User preferences
  getUserPreferences: () => UserPreferences;
  updateUserPreferences: (preferences: Partial<UserPreferences>) => void;
  
  // General storage utilities
  clearAllData: () => void;
  getStorageSize: () => number;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  language: 'pl',
  currency: 'PLN',
  rememberFormData: true,
  emailNotifications: true
};

export const useLocalStorage = (): UseLocalStorageReturn => {
  const [, forceUpdate] = useState({});

  // Utility function to safely parse JSON from localStorage
  const safeParseJSON = <T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`Failed to parse localStorage item "${key}":`, error);
      return defaultValue;
    }
  };

  // Utility function to safely store JSON in localStorage
  const safeStoreJSON = (key: string, value: any): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Failed to store localStorage item "${key}":`, error);
      // Handle quota exceeded error
      if (error instanceof DOMException && error.code === 22) {
        console.warn('localStorage quota exceeded, clearing old data...');
        clearOldData();
        try {
          localStorage.setItem(key, JSON.stringify(value));
        } catch (retryError) {
          console.error('Failed to store data even after cleanup:', retryError);
        }
      }
    }
  };

  // Clear old data when storage is full
  const clearOldData = (): void => {
    try {
      // Clear old transactions (keep only last 10)
      const transactions = getRecentTransactions();
      if (transactions.length > 10) {
        const recentTransactions = transactions
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 10);
        safeStoreJSON(STORAGE_KEYS.RECENT_TRANSACTIONS, recentTransactions);
      }
    } catch (error) {
      console.error('Failed to clear old data:', error);
    }
  };

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
