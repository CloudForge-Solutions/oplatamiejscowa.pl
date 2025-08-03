// src/shell/context/LanguageContext.tsx
// Layer 2: Language Context (Semi-Static) - Tourist Tax Application
// ARCHITECTURE COMPLIANCE: Simplified language management for tourist tax

import React, {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useServices} from './ServiceContext';
import {logger} from '@/platform/CentralizedLogger';
import {PLATFORM_EVENTS} from '@/platform/constants';

/**
 * Supported languages for tourist tax application
 */
export const SUPPORTED_LANGUAGES = ['en', 'pl', 'de', 'fr'] as const;
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

/**
 * Language Context Value Interface
 */
interface LanguageContextValue {
    currentLanguage: SupportedLanguage;
    switchLanguage: (language: SupportedLanguage) => Promise<void>;
    t: (key: string, options?: any) => string;
    isLanguageSupported: (language: string) => boolean;
    getSupportedLanguages: () => readonly SupportedLanguage[];
}

/**
 * Provider Props Interface
 */
interface ProviderProps {
    children: React.ReactNode;
}

/**
 * Language Context - Layer 2 (Semi-Static)
 *
 * ARCHITECTURE PRINCIPLE: Language changes infrequently
 * - Manages application language state
 * - Integrates with i18next for translations
 * - Provides tourist tax specific translations
 * - Emits events for language changes
 */
const LanguageContext = createContext<LanguageContextValue | null>(null);

/**
 * Language Provider Component
 * Manages language state and provides translation utilities
 */
export const LanguageProvider: React.FC<ProviderProps> = ({children}) => {
    const {i18n, t} = useTranslation();
    const {getService} = useServices();
    const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('en');

    // Initialize language from localStorage or browser
    useEffect(() => {
        const initializeLanguage = () => {
            // Try to get language from localStorage first
            const savedLanguage = localStorage.getItem('tourist-tax-language');
            if (savedLanguage && SUPPORTED_LANGUAGES.includes(savedLanguage as SupportedLanguage)) {
                setCurrentLanguage(savedLanguage as SupportedLanguage);
                i18n.changeLanguage(savedLanguage);
                return;
            }

            // Fall back to browser language
            const browserLanguage = navigator.language.split('-')[0];
            if (SUPPORTED_LANGUAGES.includes(browserLanguage as SupportedLanguage)) {
                setCurrentLanguage(browserLanguage as SupportedLanguage);
                i18n.changeLanguage(browserLanguage);
            } else {
                // Default to English
                setCurrentLanguage('en');
                i18n.changeLanguage('en');
            }
        };

        initializeLanguage();
    }, [i18n]);

    // ARCHITECTURE COMPLIANCE: Language switching without page reload
    const switchLanguage = useCallback(async (newLanguage: SupportedLanguage): Promise<void> => {
        if (!SUPPORTED_LANGUAGES.includes(newLanguage)) {
            logger.warn('⚠️ Unsupported language requested', {language: newLanguage});
            return;
        }

        if (newLanguage === currentLanguage) {
            logger.info('ℹ️ Language already active', {language: newLanguage});
            return;
        }

        try {
            logger.info('🌐 Switching language', {
                from: currentLanguage,
                to: newLanguage
            });

            // Change i18next language
            await i18n.changeLanguage(newLanguage);

            // Update state
            setCurrentLanguage(newLanguage);

            // Save to localStorage
            localStorage.setItem('tourist-tax-language', newLanguage);

            // Emit language change event
            const eventBus = getService('EventBus');
            if (eventBus) {
                eventBus.emit(PLATFORM_EVENTS.LANGUAGE_CHANGED, {
                    language: newLanguage,
                    previousLanguage: currentLanguage
                });
            }

            logger.info('✅ Language switched successfully', {language: newLanguage});
        } catch (error) {
            logger.error('❌ Failed to switch language', {
                language: newLanguage,
                error: error.message
            });
            throw error;
        }
    }, [currentLanguage, i18n, getService]);

    // Check if language is supported
    const isLanguageSupported = useCallback((language: string): boolean => {
        return SUPPORTED_LANGUAGES.includes(language as SupportedLanguage);
    }, []);

    // Get supported languages
    const getSupportedLanguages = useCallback((): readonly SupportedLanguage[] => {
        return SUPPORTED_LANGUAGES;
    }, []);

    // ARCHITECTURE COMPLIANCE: Memoized context value
    const contextValue = useMemo((): LanguageContextValue => ({
        currentLanguage,
        switchLanguage,
        t,
        isLanguageSupported,
        getSupportedLanguages
    }), [currentLanguage, switchLanguage, t, isLanguageSupported, getSupportedLanguages]);

    return (
        <LanguageContext.Provider value={contextValue}>
            {children}
        </LanguageContext.Provider>
    );
};

/**
 * Hook to access language context
 * ARCHITECTURE COMPLIANCE: Type-safe language access
 */
export const useLanguage = (): LanguageContextValue => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};

export default LanguageContext;
