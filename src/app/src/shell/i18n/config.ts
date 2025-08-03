// src/shell/i18n/config.ts
// Internationalization configuration for Tourist Tax Application
// ARCHITECTURE COMPLIANCE: Mobile-first, simplified language management

import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// ARCHITECTURE COMPLIANCE: Import translation files from src/ directory (Vite requirement)
import enCommon from '@shell/locales/en/common.json';
import enNavigation from '@shell/locales/en/navigation.json';
import enPayment from '@shell/locales/en/payment.json';
import plCommon from '@shell/locales/pl/common.json';
import plNavigation from '@shell/locales/pl/navigation.json';
import plPayment from '@shell/locales/pl/payment.json';
import deCommon from '@shell/locales/de/common.json';
import deNavigation from '@shell/locales/de/navigation.json';
import dePayment from '@shell/locales/de/payment.json';
import frCommon from '@shell/locales/fr/common.json';
import frNavigation from '@shell/locales/fr/navigation.json';
import frPayment from '@shell/locales/fr/payment.json';

// ARCHITECTURE COMPLIANCE: Use constants for configuration
export const I18N_CONFIG = {
    FALLBACK_LANGUAGE: 'en',
    DEFAULT_NAMESPACE: 'common',
    SUPPORTED_LANGUAGES: ['en', 'pl', 'de', 'fr'],
    STORAGE_KEY: 'tourist-tax-language',

    // Namespaces for organized translations
    NAMESPACES: [
        'common',      // Shared translations
        'navigation',  // Navbar, menus, routing
        'payment',     // Payment-specific terms
        'validation',  // Form validation messages
        'errors'       // Error messages
    ],

    // RTL languages (none for tourist tax app, but architecture ready)
    RTL_LANGUAGES: [],

    // Detection order for language preference
    DETECTION_ORDER: ['localStorage', 'navigator', 'htmlTag'],

    // Resource loading path
    RESOURCE_PATH: '/locales/{{lng}}/{{ns}}.json'
};

// Initialize i18next with proper configuration
i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        // Language settings
        fallbackLng: I18N_CONFIG.FALLBACK_LANGUAGE,
        supportedLngs: I18N_CONFIG.SUPPORTED_LANGUAGES,
        
        // Namespace settings
        defaultNS: I18N_CONFIG.DEFAULT_NAMESPACE,
        ns: I18N_CONFIG.NAMESPACES,

        // Detection settings
        detection: {
            order: I18N_CONFIG.DETECTION_ORDER,
            lookupLocalStorage: I18N_CONFIG.STORAGE_KEY,
            caches: ['localStorage']
        },

        // Resources (inline for better performance)
        resources: {
            en: {
                common: enCommon,
                navigation: enNavigation,
                payment: enPayment
            },
            pl: {
                common: plCommon,
                navigation: plNavigation,
                payment: plPayment
            },
            de: {
                common: deCommon,
                navigation: deNavigation,
                payment: dePayment
            },
            fr: {
                common: frCommon,
                navigation: frNavigation,
                payment: frPayment
            }
        },

        // Interpolation settings
        interpolation: {
            escapeValue: false // React already escapes values
        },

        // React settings
        react: {
            useSuspense: false // Disable suspense for better mobile performance
        },

        // Development settings
        debug: process.env.NODE_ENV === 'development',
        
        // Performance settings
        load: 'languageOnly', // Don't load country-specific variants
        preload: I18N_CONFIG.SUPPORTED_LANGUAGES,

        // Formatting
        returnEmptyString: false,
        returnNull: false,
        returnObjects: false,

        // Pluralization
        pluralSeparator: '_',
        contextSeparator: '_',

        // Keyseparator
        keySeparator: '.',
        nsSeparator: ':'
    });

export default i18n;
