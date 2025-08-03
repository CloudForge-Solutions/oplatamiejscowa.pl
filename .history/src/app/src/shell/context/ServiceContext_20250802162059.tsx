// src/shell/context/ServiceContext.tsx
// Layer 1: Service Context (Static) - Tourist Tax Application
// ARCHITECTURE COMPLIANCE: Simplified service management for tourist tax

import React, {createContext, useContext, useMemo} from 'react';
import {logger} from '@/platform/CentralizedLogger';

/**
 * Tourist Tax Services Interface
 */
interface TouristTaxServices {
    EventBus: any;
    StorageService: any;
    PaymentService: any;
    LanguageService: any;
}

/**
 * Service Context Value Interface
 */
interface ServiceContextValue {
    getService: (serviceName: keyof TouristTaxServices) => any;
    isServiceAvailable: (serviceName: keyof TouristTaxServices) => boolean;
    getServices: (serviceNames: (keyof TouristTaxServices)[]) => Record<string, any>;
}

/**
 * Provider Props Interface
 */
interface ProviderProps {
    children: React.ReactNode;
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
