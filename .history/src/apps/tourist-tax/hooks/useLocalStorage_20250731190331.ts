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
    if (!isInitialized) return null;

    try {
      const storageService = storageServiceInstance;
      if (!storageService) return null;

      const formCache = storageService.getFormDataCache();
      if (!formCache) return null;

      // Convert FormDataCache to TouristTaxData format
      return {
        cityCode: formCache.cityCode,
        cityName: formCache.cityName,
        checkInDate: formCache.checkInDate,
        checkOutDate: formCache.checkOutDate,
        numberOfPersons: formCache.numberOfPersons,
        accommodationType: formCache.accommodationType as any,
        accommodationName: formCache.accommodationName,
        accommodationAddress: formCache.accommodationAddress
      };
    } catch (error) {
      console.error('Failed to get stored form data:', error);
      return null;
    }
  }, [isInitialized]);

  const storeFormData = useCallback((data: Partial<TouristTaxData>): void => {
    if (!isInitialized || !storageServiceInstance) return;

    try {
      const formCache: Partial<FormDataCache> = {
        cityCode: data.cityCode,
        cityName: data.cityName,
        checkInDate: data.checkInDate,
        checkOutDate: data.checkOutDate,
        numberOfPersons: data.numberOfPersons,
        accommodationType: data.accommodationType,
        accommodationName: data.accommodationName,
        accommodationAddress: data.accommodationAddress
      };

      storageServiceInstance.updateFormDataCache(formCache);
    } catch (error) {
      console.error('Failed to store form data:', error);
    }
  }, [isInitialized]);

  const clearFormData = useCallback((): void => {
    if (!isInitialized || !storageServiceInstance) return;

    try {
      storageServiceInstance.clearFormDataCache();
    } catch (error) {
      console.error('Failed to clear form data:', error);
    }
  }, [isInitialized]);

  // Transaction history management
  const getRecentTransactions = useCallback(async (): Promise<DBTransaction[]> => {
    if (!isInitialized || !storageServiceInstance) return [];

    try {
      return await storageServiceInstance.getRecentTransactions();
    } catch (error) {
      console.error('Failed to get recent transactions:', error);
      return [];
    }
  }, [isInitialized]);

  const addTransaction = useCallback(async (transaction: DBTransaction): Promise<void> => {
    if (!isInitialized || !storageServiceInstance) return;

    try {
      await storageServiceInstance.storeTransaction(transaction);
    } catch (error) {
      console.error('Failed to add transaction:', error);
      throw error;
    }
  }, [isInitialized]);

  const clearTransactionHistory = useCallback(async (): Promise<void> => {
    if (!isInitialized || !storageServiceInstance) return;

    try {
      await storageServiceInstance.clearAllData();
    } catch (error) {
      console.error('Failed to clear transaction history:', error);
      throw error;
    }
  }, [isInitialized]);

  // User preferences management
  const getUserPreferences = useCallback((): UserPreferences => {
    if (!isInitialized || !storageServiceInstance) {
      return {
        language: 'pl',
        currency: 'PLN',
        rememberFormData: true,
        emailNotifications: true,
        theme: 'light',
        autoSaveInterval: 30
      };
    }

    try {
      return storageServiceInstance.getUserPreferences();
    } catch (error) {
      console.error('Failed to get user preferences:', error);
      return {
        language: 'pl',
        currency: 'PLN',
        rememberFormData: true,
        emailNotifications: true,
        theme: 'light',
        autoSaveInterval: 30
      };
    }
  }, [isInitialized]);

  const updateUserPreferences = useCallback((preferences: Partial<UserPreferences>): void => {
    if (!isInitialized || !storageServiceInstance) return;

    try {
      storageServiceInstance.updateUserPreferences(preferences);
    } catch (error) {
      console.error('Failed to update user preferences:', error);
    }
  }, [isInitialized]);

  // General utilities
  const clearAllData = useCallback(async (): Promise<void> => {
    if (!isInitialized || !storageServiceInstance) return;

    try {
      await storageServiceInstance.clearAllData();
    } catch (error) {
      console.error('Failed to clear all data:', error);
      throw error;
    }
  }, [isInitialized]);

  const getStorageSize = useCallback(async (): Promise<any> => {
    if (!isInitialized || !storageServiceInstance) return null;

    try {
      return await storageServiceInstance.getStorageUsage();
    } catch (error) {
      console.error('Failed to get storage size:', error);
      return null;
    }
  }, [isInitialized]);

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
    getStorageSize,
    isInitialized,
    initializationError
  };
};
