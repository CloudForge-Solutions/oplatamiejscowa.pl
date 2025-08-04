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
  TOURIST_TAX_APP_VERSION: 'tourist-tax-app-version',

  // Payment-related storage
  PAYMENT_RESERVATION_ID: 'payment-reservation-id',
  PAYMENT_SESSION: 'payment-session',
  PAYMENT_FORM_DATA: 'payment-form-data',
  PAYMENT_STATUS_CACHE: 'payment-status-cache'
} as const;

export const API_ENDPOINTS = {
  // Payment Service Endpoints
  PAYMENT_STATUS: '/api/payment/status',
  INITIATE_PAYMENT: '/api/payment/initiate',
  PAYMENT_WEBHOOK: '/api/payment/webhook',

  // Reservation Management
  CREATE_RESERVATION: '/api/payment/reservations',
  GET_RESERVATIONS: '/api/payment/reservations',
  GET_RESERVATION: '/api/payment/reservations',
  DELETE_RESERVATION: '/api/payment/reservations',

  // Payment Status Tracking
  GET_PAYMENT_STATUS: '/api/payment',
  GET_ALL_PAYMENTS: '/api/payment/payments',

  // Storage & Validation (existing)
  GENERATE_SAS: '/api/storage/generate-sas',
  VALIDATE_UUID: '/api/validation/uuid',

  // Health & System
  HEALTH_CHECK: '/api/health',

  // Development/Testing
  CLEAR_PAYMENT_DATA: '/api/payment/clear-all'
} as const;

export const MOBILE_CONSTANTS = {
  MIN_TOUCH_TARGET: 44, // px
  VIEWPORT_BREAKPOINTS: {
    MOBILE: 768,
    TABLET: 1024,
    DESKTOP: 1200
  }
} as const;

// Payment-related constants
export const PAYMENT_CONSTANTS = {
  STATUSES: {
    PENDING: 'pending',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    FAILED: 'failed',
    CANCELLED: 'cancelled'
  },
  RESERVATION_STATUSES: {
    PENDING: 'pending',
    PAID: 'paid',
    FAILED: 'failed',
    CANCELLED: 'cancelled'
  },
  CURRENCIES: {
    PLN: 'PLN',
    EUR: 'EUR',
    USD: 'USD'
  },
  POLLING: {
    INTERVAL_MS: 2000, // 2 seconds
    MAX_ATTEMPTS: 150, // 5 minutes total (150 * 2s)
    TIMEOUT_MS: 300000 // 5 minutes
  },
  VALIDATION: {
    MIN_GUESTS: 1,
    MAX_GUESTS: 20,
    MIN_NIGHTS: 1,
    MAX_NIGHTS: 365,
    MIN_TAX_AMOUNT: 0.01,
    MAX_TAX_AMOUNT: 100.00,
    MIN_TOTAL_AMOUNT: 0.01,
    MAX_TOTAL_AMOUNT: 10000.00
  }
} as const;

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NODE_ENV === 'development'
    ? 'http://localhost:3044'
    : window.location.origin,
  TIMEOUT_MS: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY_MS: 1000
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

// NOTE: Service instances are NOT exported from constants to avoid circular dependencies
// Services should be accessed through ServiceContext or imported directly where needed

// src/constants/index.ts - Barrel exports for clean imports
// Industry-standard pattern for centralized constant access

/*
IMPORTANT: src/constants should have only one file index.ts used as a constants hub and validator for duplicates, as we should finally have modular constants, but in development phase we do barell export of them all here, then in src/constants/index.ts we should have all ```export
* from '../apps/payment/constants';
export * from '../platform/constants/ReservationConstants';
```
IMPORTANT: src/constants should have only one file index.ts used as a constants hub and validator for duplicates, as we should finally have modular constants, but in development phase we do barell export of them all here, then in src/constants/index.ts we should have all ```export
* from '../apps/payment/constants';
export * from '../platform/constants/ReservationConstants';
```
*/

// Re-export platform constants that were missing
export * from '../platform/constants';



// Usage Examples:
// import { GLOBAL_STORAGE_KEYS, PLATFORM_EVENTS, UI_STATES, ENTITY_TYPES, ERROR_MESSAGES } from '@/constants';
// import { GLOBAL_STORAGE_KEYS } from '@/constants';
// import { ENTITY_TYPES, entityRequiresKRS, KRS_DOCUMENT_TYPES } from '@/constants';
// import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/constants';
// import { RECORDS_STORAGE_KEYS, RECORDS_EVENTS, UPLOAD_QUEUE_EVENTS, RECORD_TYPES, DRAG_DROP_CONFIG } from '@/constants';
//
// Available Storage Keys:
// - GLOBAL_STORAGE_KEYS.CURRENT_USER, CURRENT_ENTITY, ENTITIES
// - GLOBAL_STORAGE_KEYS.APP_SETTINGS, DEEPSEEK_CONFIG, QUEUE_CONFIG
// - ENTITY_STORAGE_KEYS.ENTITIES_LIST, CURRENT_ENTITY, KRS_CACHE
// - RECORDS_STORAGE_KEYS.RECORDS_LIST, UPLOAD_QUEUE, PROCESSING_STATE
//
// Available Entity Types:
// - ENTITY_TYPES.INDIVIDUAL, LIMITED_LIABILITY_COMPANY, JOINT_STOCK_COMPANY
// - ENTITY_TYPES.FOUNDATION, ASSOCIATION, COOPERATIVE
// - entityRequiresKRS(entityType) - Check if entity type requires KRS
//
// Available Record Types:
// - RECORD_TYPES.SALES, PURCHASE, FIXED_ASSETS, VAT, BILL, RECEIPT
// - RECORD_TYPE_LABELS for display names
//
// Available Records Events:
// - RECORDS_EVENTS.RECORD_CREATED, RECORD_UPDATED, RECORDS_LOADED
// - UPLOAD_QUEUE_EVENTS.QUEUE_STARTED, ITEM_COMPLETED, QUEUE_UPDATED
//
// Available KRS Management:
// - KRS_NAV.SUBTABS.EXTRACT, RESOLUTIONS, FINANCIAL_REPORTS, DOCUMENTS, HISTORY
// - KRS_DOCUMENT_TYPES.STATUTE, AMENDMENT, RESOLUTION, FINANCIAL_STATEMENT
// - KRS_RESOLUTION_TYPES.SHAREHOLDERS_MEETING, MANAGEMENT_BOARD, SUPERVISORY_BOARD
// src/constants/index.ts - Barrel exports for clean imports
// Industry-standard pattern for centralized constant access


