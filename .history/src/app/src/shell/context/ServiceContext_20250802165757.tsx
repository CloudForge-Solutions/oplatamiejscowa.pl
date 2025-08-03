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

/**
 * Service Context - Layer 1 (Static)
 *
 * ARCHITECTURE PRINCIPLE: Services are initialized once and never change
 * - Provides access to tourist tax application services
 * - Static layer that remains constant throughout app lifecycle
 * - Foundation for other context layers
 */
const ServiceContext = createContext<ServiceContextValue | null>(null);

/**
 * Simple Services Manager for Tourist Tax
 */
class TouristTaxServicesManager {
    private services: Map<string, any> = new Map();
    private initialized = false;

    async initialize(): Promise<void> {
        if (this.initialized) return;

        logger.platform('🏗️ Initializing Tourist Tax Services');

        try {
            // Initialize EventBus
            const { EventBus } = await import('@/platform/EventBus');
            this.services.set('EventBus', new EventBus());

            // Initialize StorageService
            const { StorageService } = await import('@/platform/storage/StorageService');
            this.services.set('StorageService', new StorageService());

            // Initialize PaymentService (placeholder)
            this.services.set('PaymentService', {
                processPayment: async (data: any) => {
                    logger.info('💳 Processing payment', data);
                    // Payment processing logic will be implemented later
                    return { success: true, transactionId: 'mock-' + Date.now() };
                }
            });

            // Initialize LanguageService (placeholder)
            this.services.set('LanguageService', {
                getCurrentLanguage: () => 'en',
                setLanguage: (lang: string) => {
                    logger.info('🌐 Setting language', { language: lang });
                }
            });

            this.initialized = true;
            logger.platform('✅ Tourist Tax Services initialized successfully');
        } catch (error) {
            logger.error('❌ Failed to initialize services', { error });
            throw error;
        }
    }

    getService(serviceName: string): any {
        if (!this.initialized) {
            throw new Error('Services not initialized');
        }
        return this.services.get(serviceName);
    }

    isInitialized(): boolean {
        return this.initialized;
    }
}

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
            logger.platform('🏗️ Initializing Service Context (Layer 1)');

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
