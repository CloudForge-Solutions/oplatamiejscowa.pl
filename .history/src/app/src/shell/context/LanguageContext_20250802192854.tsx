// src/shell/context/LanguageContext.tsx
// Layer 2: Language Context (Semi-Static) - Tourist Tax Application
// ARCHITECTURE COMPLIANCE: Simplified language management for tourist tax

import React, {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {logger} from '../../platform/CentralizedLogger';
import {eventBus, PLATFORM_EVENTS} from '../../platform/EventBus';

/**
 * Supported languages for tourist tax application
 */
export const SUPPORTED_LANGUAGES = ['en', 'pl', 'de', 'fr'] as const;
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

/**
 * Language metadata for UI display
 */
const LANGUAGE_METADATA = {
    en: { name: 'English', flag: '🇬🇧' },
    pl: { name: 'Polski', flag: '🇵🇱' },
    de: { name: 'Deutsch', flag: '🇩🇪' },
    fr: { name: 'Français', flag: '🇫🇷' }
} as const;

/**
 * Language Context Value Interface
 */
interface LanguageContextValue {
    currentLanguage: SupportedLanguage;
    availableLanguages: readonly SupportedLanguage[];
    switchLanguage: (language: SupportedLanguage) => Promise<void>;
    t: (key: string, defaultValue?: string) => string;
    getLanguageName: (language?: SupportedLanguage) => string;
    getLanguageFlag: (language?: SupportedLanguage) => string;
    isLanguageSupported: (language: string) => boolean;
    getSupportedLanguages: () => readonly SupportedLanguage[];
    formatCurrency: (amount: number) => string;
    formatDate: (date: Date | string) => string;
    formatNumber: (number: number) => string;
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
            // TODO: Implement EventBus when available
            // const eventBus = getService('EventBus');
            // if (eventBus) {
            //     eventBus.emit(TOURIST_TAX_EVENTS.LANGUAGE_CHANGED, {
            //         language: newLanguage,
            //         previousLanguage: currentLanguage
            //     });
            // }

            logger.info('✅ Language switched successfully', {language: newLanguage});
        } catch (error) {
            logger.error('❌ Failed to switch language', {
                language: newLanguage,
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }
    }, [currentLanguage, i18n]);

    // Check if language is supported
    const isLanguageSupported = useCallback((language: string): boolean => {
        return SUPPORTED_LANGUAGES.includes(language as SupportedLanguage);
    }, []);

    // Get supported languages
    const getSupportedLanguages = useCallback((): readonly SupportedLanguage[] => {
        return SUPPORTED_LANGUAGES;
    }, []);

    // Get language name for display
    const getLanguageName = useCallback((language?: SupportedLanguage): string => {
        const lang = language || currentLanguage;
        return LANGUAGE_METADATA[lang]?.name || lang.toUpperCase();
    }, [currentLanguage]);

    // Get language flag emoji
    const getLanguageFlag = useCallback((language?: SupportedLanguage): string => {
        const lang = language || currentLanguage;
        return LANGUAGE_METADATA[lang]?.flag || '🌐';
    }, [currentLanguage]);

    // Wrapper for translation function with default value support
    const translationWrapper = useCallback((key: string, defaultValue?: string): string => {
        return t(key, defaultValue || key);
    }, [t]);

    // Format currency based on current language
    const formatCurrency = useCallback((amount: number): string => {
        try {
            const locale = currentLanguage === 'pl' ? 'pl-PL' : 'en-US';
            const currency = currentLanguage === 'pl' ? 'PLN' : 'EUR';

            return new Intl.NumberFormat(locale, {
                style: 'currency',
                currency: currency,
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(amount);
        } catch (error) {
            logger.warn('⚠️ Currency formatting failed, using fallback', { amount, currentLanguage, error });
            return `${amount.toFixed(2)} ${currentLanguage === 'pl' ? 'PLN' : 'EUR'}`;
        }
    }, [currentLanguage]);

    // Format date based on current language
    const formatDate = useCallback((date: Date | string): string => {
        try {
            const dateObj = typeof date === 'string' ? new Date(date) : date;
            const locale = currentLanguage === 'pl' ? 'pl-PL' : 'en-US';

            return new Intl.DateTimeFormat(locale, {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }).format(dateObj);
        } catch (error) {
            logger.warn('⚠️ Date formatting failed, using fallback', { date, currentLanguage, error });
            return String(date);
        }
    }, [currentLanguage]);

    // Format number based on current language
    const formatNumber = useCallback((number: number): string => {
        try {
            const locale = currentLanguage === 'pl' ? 'pl-PL' : 'en-US';

            return new Intl.NumberFormat(locale).format(number);
        } catch (error) {
            logger.warn('⚠️ Number formatting failed, using fallback', { number, currentLanguage, error });
            return number.toString();
        }
    }, [currentLanguage]);

    // ARCHITECTURE COMPLIANCE: Memoized context value
    const contextValue = useMemo((): LanguageContextValue => ({
        currentLanguage,
        availableLanguages: SUPPORTED_LANGUAGES,
        switchLanguage,
        t: translationWrapper,
        getLanguageName,
        getLanguageFlag,
        isLanguageSupported,
        getSupportedLanguages,
        formatCurrency,
        formatDate,
        formatNumber
    }), [currentLanguage, switchLanguage, translationWrapper, getLanguageName, getLanguageFlag, isLanguageSupported, getSupportedLanguages, formatCurrency, formatDate, formatNumber]);

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
