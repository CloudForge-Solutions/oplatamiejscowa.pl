/**
 * Language Context - Layer 2 (Semi-Static)
 * 
 * RESPONSIBILITY: Manage application language state with i18next integration
 * ARCHITECTURE: Changes infrequently, provides formatting utilities
 * FEATURES: Two-way URL synchronization, document attributes, Bootstrap classes
 */

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useQueryParam, StringParam } from 'use-query-params';

// TODO: Import i18next when configured
// import i18n from 'i18next';

import { useStorageService } from './ServiceContext';
import { STORAGE_KEYS, VALIDATION_RULES } from '../../constants';

type SupportedLanguage = typeof VALIDATION_RULES.SUPPORTED_LANGUAGES[number];

interface LanguageContextType {
  currentLanguage: SupportedLanguage;
  switchLanguage: (language: SupportedLanguage) => void;
  isLoading: boolean;
  formatCurrency: (amount: number) => string;
  formatDate: (date: Date | string) => string;
  formatNumber: (number: number) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const storageService = useStorageService();
  const [langParam, setLangParam] = useQueryParam('lang', StringParam);
  
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('pl');
  const [isLoading, setIsLoading] = useState(false);

  // Initialize language from URL, localStorage, or browser
  useEffect(() => {
    const initializeLanguage = () => {
      let initialLang: SupportedLanguage = 'pl';

      // Priority: URL param > localStorage > browser language
      if (langParam && VALIDATION_RULES.SUPPORTED_LANGUAGES.includes(langParam as SupportedLanguage)) {
        initialLang = langParam as SupportedLanguage;
      } else {
        const stored = storageService.get(STORAGE_KEYS.TOURIST_TAX_PREFERENCES);
        if (stored) {
          try {
            const prefs = JSON.parse(stored);
            if (prefs.language && VALIDATION_RULES.SUPPORTED_LANGUAGES.includes(prefs.language)) {
              initialLang = prefs.language;
            }
          } catch (error) {
            console.warn('Failed to parse stored language preference:', error);
          }
        }

        // Fallback to browser language
        if (initialLang === 'pl') {
          const browserLang = navigator.language.split('-')[0];
          if (VALIDATION_RULES.SUPPORTED_LANGUAGES.includes(browserLang as SupportedLanguage)) {
            initialLang = browserLang as SupportedLanguage;
          }
        }
      }

      setCurrentLanguage(initialLang);
      updateDocumentLanguage(initialLang);
    };

    initializeLanguage();
  }, [langParam, storageService]);

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
