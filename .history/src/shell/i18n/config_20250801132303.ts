// i18n configuration for Tourist Tax Payment System
// Opłata Miejscowa Online - Internationalization setup

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import enCommon from '../locales/en/common.json';
import enNavigation from '../locales/en/navigation.json';
import enTouristTax from '../locales/en/tourist-tax.json';
import enLandlord from '../locales/en/landlord.json';
import plCommon from '../locales/pl/common.json';
import plNavigation from '../locales/pl/navigation.json';
import plTouristTax from '../locales/pl/tourist-tax.json';
import plLandlord from '../locales/pl/landlord.json';

// Configuration constants
const I18N_CONFIG = {
  FALLBACK_LANGUAGE: 'pl',
  DEFAULT_NAMESPACE: 'common',
  SUPPORTED_LANGUAGES: ['pl', 'en'],
  STORAGE_KEY: 'tourist-tax-language',

  // Namespaces for organized translations
  NAMESPACES: [
    'common',      // Shared translations
    'navigation',  // Navbar, menus, routing
    'tourist-tax', // Tourist tax specific terms
    'landlord',    // Landlord mode specific terms
    'payment',     // Payment processing
    'cities',      // City-specific content
    'validation',  // Form validation messages
    'gdpr'         // GDPR compliance
  ],

  // Detection order for language preference
  DETECTION_ORDER: ['localStorage', 'navigator', 'htmlTag'],

  // Resource loading path (for future dynamic loading)
  RESOURCE_PATH: '/locales/{{lng}}/{{ns}}.json'
};

// Initialize i18next with tourist tax specific configuration
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    // Language settings
    fallbackLng: I18N_CONFIG.FALLBACK_LANGUAGE,
    supportedLngs: I18N_CONFIG.SUPPORTED_LANGUAGES,

    // Debug mode for development
    debug: import.meta.env.DEV,

    // Namespace configuration
    defaultNS: I18N_CONFIG.DEFAULT_NAMESPACE,
    ns: I18N_CONFIG.NAMESPACES,

    // Language detection configuration
    detection: {
      order: I18N_CONFIG.DETECTION_ORDER,
      caches: ['localStorage'],
      lookupLocalStorage: I18N_CONFIG.STORAGE_KEY,
      checkWhitelist: true,
      excludeCacheFor: ['cimode']
    },

    // Static resource configuration
    resources: {
      en: {
        common: enCommon,
        navigation: enNavigation,
        'tourist-tax': enTouristTax
      },
      pl: {
        common: plCommon,
        navigation: plNavigation,
        'tourist-tax': plTouristTax
      }
    },

    // Interpolation settings
    interpolation: {
      escapeValue: false, // React already escapes
      formatSeparator: ',',
      formatters: {
        // Polish currency formatter
        currency: (value: number, lng: string) => {
          return new Intl.NumberFormat(lng, {
            style: 'currency',
            currency: 'PLN',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          }).format(value);
        },
        // Date formatter
        date: (value: string | Date, lng: string) => {
          return new Intl.DateTimeFormat(lng, {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          }).format(new Date(value));
        },
        // DateTime formatter
        datetime: (value: string | Date, lng: string) => {
          return new Intl.DateTimeFormat(lng, {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          }).format(new Date(value));
        },
        // Number formatter for tax amounts
        number: (value: number, lng: string) => {
          return new Intl.NumberFormat(lng, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          }).format(value);
        }
      }
    },

    // React-specific configuration
    react: {
      useSuspense: false,
      bindI18n: 'languageChanged',
      bindI18nStore: '',
      transEmptyNodeValue: '',
      transSupportBasicHtmlNodes: true,
      transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'em', 'span']
    },

    // Performance optimizations
    load: 'languageOnly',
    preload: I18N_CONFIG.SUPPORTED_LANGUAGES,

    // Error handling
    saveMissing: import.meta.env.DEV,
    missingKeyHandler: import.meta.env.DEV ?
      (lng: string, ns: string, key: string) =>
        console.warn(`Missing translation: ${lng}.${ns}.${key}`) :
      undefined
  });

// Export configuration for use in contexts
export { I18N_CONFIG };
export default i18n;
