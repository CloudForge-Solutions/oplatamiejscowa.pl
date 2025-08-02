/**
 * React Hook for Dynamic Data Fetching from Azure Function API
 * Integrates with existing localStorage/IndexedDB caching patterns
 * Follows the same patterns as useTaxCalculation and usePaymentProcessing
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { apiService, ReservationData, CityConfiguration, PaymentRecord } from '../services/ApiService';
import { LocalStorageManager } from '../../../platform/storage/LocalStorageManager';
import { STORAGE_KEYS } from '../../../constants';

// Create singleton instance
const localStorageManager = new LocalStorageManager();

interface UseApiDataState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

interface UseApiDataReturn<T> extends UseApiDataState<T> {
  refetch: () => Promise<void>;
  clearError: () => void;
  updateCache: (data: T) => void;
}

/**
 * Generic hook for API data fetching with caching
 */
export function useApiData<T>(
  fetchFunction: () => Promise<{ success: boolean; data?: T; error?: any }>,
  cacheKey: string,
  options: {
    enableCache?: boolean;
    cacheTTL?: number; // Time to live in milliseconds
    refetchOnMount?: boolean;
    refetchInterval?: number; // Auto-refetch interval in milliseconds
  } = {}
): UseApiDataReturn<T> {
  const {
    enableCache = true,
    cacheTTL = 5 * 60 * 1000, // 5 minutes default
    refetchOnMount = true,
    refetchInterval
  } = options;

  const [state, setState] = useState<UseApiDataState<T>>({
    data: null,
    loading: false,
    error: null,
    lastUpdated: null
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  /**
   * Load data from cache
   */
  const loadFromCache = useCallback((): T | null => {
    if (!enableCache) return null;

    try {
      const cached = localStorageManager.get(cacheKey);
      if (!cached) return null;

      const { data, timestamp } = cached;
      const now = Date.now();

      // Check if cache is still valid
      if (now - timestamp < cacheTTL) {
        return data;
      }

      // Cache expired, remove it
      localStorageManager.remove(cacheKey);
      return null;
    } catch (error) {
      console.error('Failed to load from cache:', error);
      return null;
    }
  }, [cacheKey, enableCache, cacheTTL]);

  /**
   * Save data to cache
   */
  const saveToCache = useCallback((data: T): void => {
    if (!enableCache) return;

    try {
      localStorageManager.set(cacheKey, {
        data,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Failed to save to cache:', error);
    }
  }, [cacheKey, enableCache]);

  /**
   * Fetch data from API
   */
  const fetchData = useCallback(async (): Promise<void> => {
    if (!mountedRef.current) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetchFunction();

      if (!mountedRef.current) return;

      if (response.success && response.data) {
        const now = new Date();
        setState(prev => ({
          ...prev,
          data: response.data!,
          loading: false,
          error: null,
          lastUpdated: now
        }));

        // Save to cache
        saveToCache(response.data);
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: response.error?.message || 'Failed to fetch data'
        }));
      }
    } catch (error) {
      if (!mountedRef.current) return;

      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }));
    }
  }, [fetchFunction, saveToCache]);

  /**
   * Initialize data (cache first, then API if needed)
   */
  const initializeData = useCallback(async (): Promise<void> => {
    // Try to load from cache first
    const cachedData = loadFromCache();

    if (cachedData) {
      setState(prev => ({
        ...prev,
        data: cachedData,
        loading: false,
        error: null,
        lastUpdated: new Date()
      }));

      // If we have cached data and don't need to refetch on mount, we're done
      if (!refetchOnMount) return;
    }

    // Fetch fresh data from API
    await fetchData();
  }, [loadFromCache, refetchOnMount, fetchData]);

  /**
   * Clear error state
   */
  const clearError = useCallback((): void => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  /**
   * Update cache manually
   */
  const updateCache = useCallback((data: T): void => {
    saveToCache(data);
    setState(prev => ({
      ...prev,
      data,
      lastUpdated: new Date()
    }));
  }, [saveToCache]);

  /**
   * Refetch data manually
   */
  const refetch = useCallback(async (): Promise<void> => {
    await fetchData();
  }, [fetchData]);

  // Initialize on mount
  useEffect(() => {
    mountedRef.current = true;
    initializeData();

    return () => {
      mountedRef.current = false;
    };
  }, [initializeData]);

  // Set up auto-refetch interval
  useEffect(() => {
    if (refetchInterval && refetchInterval > 0) {
      intervalRef.current = setInterval(() => {
        if (mountedRef.current) {
          fetchData();
        }
      }, refetchInterval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [refetchInterval, fetchData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    ...state,
    refetch,
    clearError,
    updateCache
  };
}

/**
 * Specific hooks for different data types
 */

export function useReservations(cityCode?: string) {
  return useApiData<ReservationData[]>(
    () => cityCode
      ? apiService.getReservationsByCity(cityCode)
      : Promise.resolve({ success: true, data: [] }),
    `${STORAGE_KEYS.CACHE_RESERVATIONS}:${cityCode || 'all'}`,
    {
      enableCache: true,
      cacheTTL: 2 * 60 * 1000, // 2 minutes for reservations
      refetchOnMount: true
    }
  );
}

export function useCityConfigurations() {
  return useApiData<CityConfiguration[]>(
    () => apiService.getCityConfigurations(),
    STORAGE_KEYS.CACHE_CITY_RATES,
    {
      enableCache: true,
      cacheTTL: 30 * 60 * 1000, // 30 minutes for city configs
      refetchOnMount: false // City configs change rarely
    }
  );
}

export function usePaymentRecord(paymentId?: string) {
  return useApiData<PaymentRecord>(
    () => paymentId
      ? apiService.getPayment(paymentId)
      : Promise.resolve({ success: false, error: { message: 'No payment ID provided' } }),
    `${STORAGE_KEYS.CACHE_PAYMENT_HISTORY}:${paymentId}`,
    {
      enableCache: true,
      cacheTTL: 1 * 60 * 1000, // 1 minute for payment records
      refetchOnMount: true
    }
  );
}
