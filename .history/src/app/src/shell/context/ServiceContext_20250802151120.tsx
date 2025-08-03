/**
 * Service Context - Layer 1 (Static)
 *
 * RESPONSIBILITY: Provide access to core application services
 * ARCHITECTURE: Static layer that remains constant throughout app lifecycle
 * SERVICES: StorageService, ApiService (never change during app lifecycle)
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { logger } from '../../constants';

// Temporary service interfaces
interface IStorageService {
  get(key: string): string | null;
  set(key: string, value: string): void;
  remove(key: string): void;
  clear(): void;
}

interface IApiService {
  get(endpoint: string): Promise<any>;
  post(endpoint: string, data: any): Promise<any>;
}

// Mock services for development
class MockStorageService implements IStorageService {
  get(key: string): string | null {
    return localStorage.getItem(key);
  }

  set(key: string, value: string): void {
    localStorage.setItem(key, value);
  }

  remove(key: string): void {
    localStorage.removeItem(key);
  }

  clear(): void {
    localStorage.clear();
  }
}

class MockApiService implements IApiService {
  async get(endpoint: string): Promise<any> {
    logger.debug('Mock API GET request', { endpoint });
    return { status: 'mock' };
  }

  async post(endpoint: string, data: any): Promise<any> {
    logger.debug('Mock API POST request', { endpoint, data });
    return { status: 'mock' };
  }
}

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
