/**
 * Service Context - Layer 1 (Static)
 *
 * RESPONSIBILITY: Provide access to core application services
 * ARCHITECTURE: Static layer that remains constant throughout app lifecycle
 * SERVICES: StorageService, ApiService (never change during app lifecycle)
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { logger } from '../../constants';
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
  // Static services - initialized once, never change
  const services: ServiceContextType = {
    storageService,
    apiService,
    localStorageManager
  };

  logger.info('🔧 ServiceProvider initialized with platform services');

  return (
    <ServiceContext.Provider value={services}>
      {children}
    </ServiceContext.Provider>
  );
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
