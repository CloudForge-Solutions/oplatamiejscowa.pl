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
  storageService: IStorageService;
  apiService: IApiService;
}

const ServiceContext = createContext<ServiceContextType | undefined>(undefined);

interface ServiceProviderProps {
  children: ReactNode;
}

export const ServiceProvider: React.FC<ServiceProviderProps> = ({ children }) => {
  // Static services - initialized once, never change
  const services: ServiceContextType = {
    storageService: new MockStorageService(),
    apiService: new MockApiService()
  };

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

export const useStorageService = (): IStorageService => {
  const { storageService } = useServices();
  return storageService;
};

export const useApiService = (): IApiService => {
  const { apiService } = useServices();
  return apiService;
};
