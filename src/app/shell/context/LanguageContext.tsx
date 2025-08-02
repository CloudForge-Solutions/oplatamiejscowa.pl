// Language Context for Tourist Tax Payment System
// Simple language management with i18next integration

import React, { createContext, useContext, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

interface LanguageContextType {
  currentLanguage: string;
  changeLanguage: (language: string) => Promise<void>;
  t: (key: string, defaultValue?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const { i18n, t } = useTranslation();

  const changeLanguage = async (language: string): Promise<void> => {
    try {
      await i18n.changeLanguage(language);
      
      // Update document language attribute
      document.documentElement.lang = language;
      
      // Store preference in localStorage
      localStorage.setItem('tourist-tax-language', language);
      
    } catch (error) {
      console.error('Failed to change language:', error);
      throw error;
    }
  };

  const value: LanguageContextType = {
    currentLanguage: i18n.language,
    changeLanguage,
    t
  };

  return (
    <LanguageContext.Provider value={value}>
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

export default LanguageContext;
