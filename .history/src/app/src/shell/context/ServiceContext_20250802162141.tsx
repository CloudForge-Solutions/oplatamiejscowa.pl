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
            const { EventBus } = await import('@/platform/services/EventBus');
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
