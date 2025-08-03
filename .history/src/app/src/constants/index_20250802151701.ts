/**
 * Centralized Constants Hub - Single Barrel Export
 *
 * ARCHITECTURE PRINCIPLE: All constants MUST be imported via this barrel export
 * - Magic strings and numbers are FORBIDDEN - use named constants
 * - Constants are modular but barrel-exported during development phase
 * - No duplicate constant definitions across modules
 * - Use TypeScript `as const` assertions for immutable constants
 */

// TODO: Create platform constants files
// export * from '@/platform/constants/StorageConstants';
// export * from '@/platform/constants/ApiConstants';
// export * from '@/platform/constants/ValidationConstants';

// TODO: Create shell constants files
// export * from '@/shell/constants/ShellConstants';
// export * from '@/shell/constants/ContextConstants';

// TODO: Create app-specific constants files
// export * from '@/apps/tourist-tax/constants/PaymentConstants';
// export * from '@/apps/tourist-tax/constants/MobileConstants';

// Temporary basic constants until proper structure is created
export const STORAGE_KEYS = {
  TOURIST_TAX_PREFERENCES: 'tourist-tax-preferences',
  TOURIST_TAX_FORM_CACHE: 'tourist-tax-form-cache',
  TOURIST_TAX_SESSION: 'tourist-tax-session',
  TOURIST_TAX_GDPR_CONSENTS: 'tourist-tax-gdpr-consents',
  TOURIST_TAX_APP_VERSION: 'tourist-tax-app-version'
} as const;

export const API_ENDPOINTS = {
  PAYMENT_STATUS: '/api/payment/status',
  GENERATE_SAS: '/api/reservation/generate-sas',
  INITIATE_PAYMENT: '/api/payment/initiate'
} as const;

export const MOBILE_CONSTANTS = {
  MIN_TOUCH_TARGET: 44, // px
  VIEWPORT_BREAKPOINTS: {
    MOBILE: 768,
    TABLET: 1024,
    DESKTOP: 1200
  }
} as const;

export const TOURIST_TAX_EVENTS = {
  PAYMENT_STATUS_UPDATED: 'tourist-tax:payment-status-updated',
  RESERVATION_LOADED: 'tourist-tax:reservation-loaded',
  LANGUAGE_CHANGED: 'tourist-tax:language-changed',
  STORAGE_UPDATED: 'tourist-tax:storage-updated'
} as const;

export const VALIDATION_RULES = {
  RESERVATION_ID_PATTERN: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  MIN_PAYMENT_AMOUNT: 0.01,
  MAX_PAYMENT_AMOUNT: 10000,
  SUPPORTED_CURRENCIES: ['PLN'] as const,
  SUPPORTED_LANGUAGES: ['pl', 'en'] as const
} as const;

export const CACHE_CONFIG = {
  DEFAULT_TTL: 5 * 60 * 1000, // 5 minutes
  RESERVATION_TTL: 24 * 60 * 60 * 1000, // 24 hours
  PAYMENT_STATUS_TTL: 30 * 1000, // 30 seconds
  SAS_TOKEN_TTL: 23 * 60 * 60 * 1000 // 23 hours (refresh before 24h expiry)
} as const;

export const UI_CONSTANTS = {
  LOADING_DEBOUNCE: 300, // ms
  POLLING_INTERVAL: 5000, // ms
  ERROR_DISPLAY_DURATION: 5000, // ms
  SUCCESS_DISPLAY_DURATION: 3000, // ms
  MOBILE_BREAKPOINT: 768 // px
} as const;

// Logger configuration
export const LOGGER_CONFIG = {
  LEVELS: {
    DEBUG: 'debug',
    INFO: 'info',
    WARN: 'warn',
    ERROR: 'error',
    CRITICAL: 'critical'
  } as const,
  DEFAULT_LEVEL: 'info' as const,
  MAX_LOGS: 1000,
  PERSIST_ERROR_LOGS: true,
  ENABLE_PERFORMANCE_TRACKING: true,
  ENABLE_CONSOLE_OUTPUT: true
} as const;

// Platform services - import from constants barrel export
export { logger } from '../platform/CentralizedLogger';
export { storageService } from '../platform/storage/StorageService';
export { localStorageManager } from '../platform/storage/LocalStorageManager';
export { apiService } from '../platform/api/ApiService';
export { validationErrorReporter } from '../platform/ValidationErrorReporter';
