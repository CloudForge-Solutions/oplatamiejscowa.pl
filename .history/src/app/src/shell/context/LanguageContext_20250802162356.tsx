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

  const updateDocumentLanguage = (language: SupportedLanguage) => {
    // Update document attributes
    document.documentElement.lang = language;
    document.documentElement.dir = 'ltr'; // All supported languages are LTR

    // Update Bootstrap classes if needed
    document.body.className = document.body.className.replace(/lang-\w+/, '') + ` lang-${language}`;
  };

  const switchLanguage = async (language: SupportedLanguage) => {
    if (language === currentLanguage) return;

    setIsLoading(true);

    try {
      // TODO: Change i18next language
      // await i18n.changeLanguage(language);

      // Update state
      setCurrentLanguage(language);

      // Update URL parameter (two-way sync)
      setLangParam(language);

      // Update document
      updateDocumentLanguage(language);

      // Store preference
      const currentPrefs = storageService.get(STORAGE_KEYS.TOURIST_TAX_PREFERENCES);
      const prefs = currentPrefs ? JSON.parse(currentPrefs) : {};
      prefs.language = language;
      storageService.set(STORAGE_KEYS.TOURIST_TAX_PREFERENCES, JSON.stringify(prefs));

      // TODO: Emit event via EventBus
      // EventBus.emit(TOURIST_TAX_EVENTS.LANGUAGE_CHANGED, { language });

    } catch (error) {
      console.error('Failed to switch language:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Formatting utilities
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat(currentLanguage === 'pl' ? 'pl-PL' : 'en-US', {
      style: 'currency',
      currency: 'PLN'
    }).format(amount);
  };

  const formatDate = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat(currentLanguage === 'pl' ? 'pl-PL' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(dateObj);
  };

  const formatNumber = (number: number): string => {
    return new Intl.NumberFormat(currentLanguage === 'pl' ? 'pl-PL' : 'en-US').format(number);
  };

  const contextValue: LanguageContextType = {
    currentLanguage,
    switchLanguage,
    isLoading,
    formatCurrency,
    formatDate,
    formatNumber
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
