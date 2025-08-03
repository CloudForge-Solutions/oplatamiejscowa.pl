/**
 * Service Context - Layer 1 (Static)
 *
 * RESPONSIBILITY: Provide access to core application services
 * ARCHITECTURE: Static layer that remains constant throughout app lifecycle
 * SERVICES: StorageService, ApiService, LocalStorageManager (never change during app lifecycle)
 */

import React, { createContext, useContext, ReactNode, useMemo, useRef } from 'react';
import { logger } from '../../platform/CentralizedLogger';
import { storageService } from '../../platform/storage/StorageService';
import { apiService } from '../../platform/api/ApiService';
import { localStorageManager } from '../../platform/storage/LocalStorageManager';

interface ServiceContextType {
  storageService: typeof storageService;
  apiService: typeof apiService;
  localStorageManager: typeof localStorageManager;
}

const ServiceContext = createContext<ServiceContextType | undefined>(undefined);

interface ServiceProviderProps {
  children: ReactNode;
}

export const ServiceProvider: React.FC<ServiceProviderProps> = ({ children }) => {
  // Use ref to track if services have been initialized to prevent multiple logs in React StrictMode
  const initializedRef = useRef(false);

  // Memoize services to prevent recreation on every render
  const services = useMemo((): ServiceContextType => {
    try {
      // Only log initialization once, even in React StrictMode
      if (!initializedRef.current) {
        logger.info('🏗️ Initializing Service Context (Layer 1)');
        initializedRef.current = true;
      }

      // Static services - initialized once, never change
      const serviceInstances: ServiceContextType = {
        storageService,
        apiService,
        localStorageManager
      };

      logger.info('✅ Service Context initialized with platform services');
      return serviceInstances;
    } catch (error) {
      logger.error('❌ Failed to initialize services', { error });

    // Fallback: provide mock services to prevent app crash
    const mockServices: ServiceContextType = {
      storageService: {
        get: () => null,
        set: () => false,
        remove: () => false,
        clear: () => false,
        has: () => false,
        keys: () => [],
        getStorageInfo: () => ({ used: 0, available: 0, keys: 0 })
      } as any,
      apiService: {
        get: async () => ({ data: null, status: 500, statusText: 'Service Unavailable', headers: {} }),
        post: async () => ({ data: null, status: 500, statusText: 'Service Unavailable', headers: {} })
      } as any,
      localStorageManager: {
        get: () => null,
        set: () => false,
        remove: () => false,
        clear: () => false
      } as any
    };

    logger.error('❌ Failed to initialize services manager', { error });

    return (
      <ServiceContext.Provider value={mockServices}>
        {children}
      </ServiceContext.Provider>
    );
  }
};

// Hooks for accessing services
export const useServices = (): ServiceContextType => {
  const context = useContext(ServiceContext);
  if (context === undefined) {
    throw new Error('useServices must be used within a ServiceProvider');
  }
  return context;
};

export const useStorageService = () => {
  const { storageService } = useServices();
  return storageService;
};

export const useApiService = () => {
  const { apiService } = useServices();
  return apiService;
};

export const useLocalStorageManager = () => {
  const { localStorageManager } = useServices();
  return localStorageManager;
};
