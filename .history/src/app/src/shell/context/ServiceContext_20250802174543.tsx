/**
 * Service Context - Layer 1 (Static)
 *
 * RESPONSIBILITY: Provide access to core application services
 * ARCHITECTURE: Static layer that remains constant throughout app lifecycle
 * SERVICES: StorageService, ApiService, LocalStorageManager (never change during app lifecycle)
 */

import React, { createContext, useContext, ReactNode } from 'react';
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
  try {
    logger.info('🏗️ Initializing Service Context (Layer 1)');

    // Static services - initialized once, never change
    const services: ServiceContextType = {
      storageService,
      apiService,
      localStorageManager
    };

    logger.info('✅ Service Context initialized with platform services');

    return (
      <ServiceContext.Provider value={services}>
        {children}
      </ServiceContext.Provider>
    );
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

// Global services manager instance
const servicesManager = new TouristTaxServicesManager();

/**
 * Service Provider Component
 * Initializes and provides access to the services manager
 */
export const ServiceProvider: React.FC<ProviderProps> = ({children}) => {
    // ARCHITECTURE COMPLIANCE: Services are memoized and never change
    const services = useMemo(() => {
        // CRITICAL FIX: Prevent duplicate initialization logging in React StrictMode
        if (!servicesManager.isInitialized()) {
            logger.info('🏗️ Initializing Service Context (Layer 1)');

            // Initialize services manager
            servicesManager.initialize().catch(error => {
                logger.error('❌ Failed to initialize services manager', {error: error.message});
            });
        }

        return servicesManager;
    }, []); // Empty dependency array - services never change

    // ARCHITECTURE COMPLIANCE: Provide static service access
    const contextValue = useMemo((): ServiceContextValue => ({
        // Helper method for direct service access
        getService: (serviceName: keyof TouristTaxServices): any => {
            try {
                return services.getService(serviceName);
            } catch (error) {
                logger.error('❌ Failed to get service', {serviceName, error: error.message});
                return null;
            }
        },

        // Service availability check
        isServiceAvailable: (serviceName: keyof TouristTaxServices): boolean => {
            try {
                const service = services.getService(serviceName);
                return service !== null && service !== undefined;
            } catch {
                return false;
            }
        },

        // Get multiple services at once
        getServices: (serviceNames: (keyof TouristTaxServices)[]): Record<string, any> => {
            const result: Record<string, any> = {};
            serviceNames.forEach(name => {
                result[name] = services.getService(name);
            });
            return result;
        }
    }), [services]);

    return (
        <ServiceContext.Provider value={contextValue}>
            {children}
        </ServiceContext.Provider>
    );
};

/**
 * Hook to access services
 * ARCHITECTURE COMPLIANCE: Type-safe service access
 */
export const useServices = (): ServiceContextValue => {
    const context = useContext(ServiceContext);
    if (!context) {
        throw new Error('useServices must be used within a ServiceProvider');
    }
    return context;
};

export default ServiceContext;
