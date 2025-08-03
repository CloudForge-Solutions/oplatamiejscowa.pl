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

// Re-export storage functions that were missing
export * from '@/platform/constants'
export * from '@/platform/storage';

export * from '@/shell/constants';

export * from '@/apps/tourist-tax/constants';


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

/*
IMPORTANT: src/constants should have only one file index.ts used as a constants hub and validator for duplicates, as we should finally have modular constants, but in development phase we do barell export of them all here, then in src/constants/index.ts we should have all ```export
* from '../apps/payment/constants';
export * from '../platform/constants/ReservationConstants';
```
IMPORTANT: src/constants should have only one file index.ts used as a constants hub and validator for duplicates, as we should finally have modular constants, but in development phase we do barell export of them all here, then in src/constants/index.ts we should have all ```export * from '../apps/payment/constants';
export * from '../platform/constants/ReservationConstants';```
*/

// Re-export storage functions that were missing
export * from '@/platform/constants'
export * from '@/platform/storage';

export * from '@/shell/constants';

// App-specific constants
// Invoice Constants - Invoice-specific constants
export * from '@/apps/records/constants';

// JPK Constants - JPK-specific constants and configurations
export * from '@/apps/jpk/constants/JPKConstants';
export * from '@/apps/jpk/constants/JpkEvents';

// Audit Log Constants - Comprehensive audit logging for Polish compliance
export * from '@/apps/settings/components/audit/constants/AuditLogConstants';

// Records Constants - Records management, upload queue, and processing
export * from '@/apps/records/constants';


// API Constants - External API endpoints and configuration
export * from '@/apps/records/services/ai/constants/ApiConstants';

// AI Analysis Types - DeepSeek AI analysis constants
export * from '@/apps/records/services/ai/constants/AnalysisTypes';
export * from '@/apps/settings/constants';


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
