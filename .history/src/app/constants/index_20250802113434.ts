/**
 * Constants Barrel Export - Tourist Tax Payment System
 * 
 * ARCHITECTURE PRINCIPLE: Single Entry Point for All Constants
 * 
 * This file serves as the main entry point for all constants in the application.
 * All components, services, and other modules MUST import constants through this
 * barrel export to maintain clean architecture and prevent direct domain imports.
 * 
 * ✅ CORRECT USAGE:
 * import { STORAGE_KEYS, PAYMENT_STATUS, UI_STATES } from '@constants';
 * import { EVENT_NAMES, API_ENDPOINTS } from '../../../constants';
 * 
 * ❌ FORBIDDEN USAGE:
 * import { PAYMENT_STATUS } from '../apps/payment/constants/PaymentConstants';
 * import { STORAGE_KEYS } from '../platform/storage/StorageConstants';
 */

// ===== STORAGE CONSTANTS =====
export {
  STORAGE_KEYS,
  STORAGE_TYPES,
  INDEXEDDB_CONFIG,
  BLOB_STORAGE_CONFIG,
  CACHE_CONFIG,
  STORAGE_VALIDATION,
  type StorageKey,
  type StorageType,
  type IndexedDBStore,
  type BlobContainer,
  type UserPreferences,
  type FormCache,
  type SessionData,
  type PaymentStatusCache,
  type SASTokenCache,
  type CityContextCache
} from './StorageConstants';

// ===== EVENT CONSTANTS =====
export {
  PAYMENT_EVENTS,
  LANGUAGE_EVENTS,
  STORAGE_EVENTS,
  UI_EVENTS,
  API_EVENTS,
  RESERVATION_EVENTS,
  CITY_EVENTS,
  ERROR_EVENTS,
  EVENT_CATEGORIES,
  type PaymentEvent,
  type LanguageEvent,
  type StorageEvent,
  type UIEvent,
  type ApiEvent,
  type ReservationEvent,
  type CityEvent,
  type ErrorEvent,
  type AllEvents,
  type PaymentStatusEvent,
  type LanguageChangeEvent,
  type StorageEventPayload,
  type UIEventPayload,
  type ApiEventPayload,
  type ErrorEventPayload
} from './EventConstants';

// ===== PAYMENT CONSTANTS =====
export {
  PAYMENT_STATUS,
  PAYMENT_METHODS,
  PAYMENT_STEPS,
  POLLING_CONFIG,
  PAYMENT_LIMITS,
  CURRENCY_CONFIG,
  IMOJE_CONFIG,
  PAYMENT_VALIDATION,
  PAYMENT_ERROR_CODES,
  RECEIPT_CONFIG,
  type PaymentStatus,
  type PaymentMethod,
  type PaymentStep,
  type Currency,
  type PaymentErrorCode,
  type PaymentRequest,
  type PaymentResponse,
  type PaymentStatusUpdate,
  type MobilePaymentConfig
} from './PaymentConstants';

// ===== UI CONSTANTS =====
export {
  UI_STATES,
  BREAKPOINTS,
  TOUCH_TARGETS,
  ANIMATION_DURATIONS,
  Z_INDEX,
  LOADING_TYPES,
  MODAL_SIZES,
  TOAST_CONFIG,
  VALIDATION_STATES,
  MOBILE_NAV,
  THEME_CONFIG,
  A11Y_CONFIG,
  VIEWPORT_CONFIG,
  type UIState,
  type LoadingType,
  type ModalSize,
  type ToastType,
  type ToastPosition,
  type ValidationState,
  type Theme,
  type LoadingState,
  type ToastMessage,
  type ModalState,
  type FormFieldState,
  type MobileGesture
} from './UIConstants';

// ===== API CONSTANTS =====
export {
  API_BASE_URLS,
  API_ENDPOINTS,
  HTTP_METHODS,
  HTTP_STATUS,
  REQUEST_CONFIG,
  POLLING_CONFIG as API_POLLING_CONFIG,
  REQUEST_HEADERS,
  API_ERROR_CODES,
  RATE_LIMITS,
  MOBILE_API_CONFIG,
  type HttpMethod,
  type HttpStatus,
  type ApiErrorCode,
  type PollingStrategy,
  type NetworkType,
  type ConnectionQuality,
  type ApiRequest,
  type ApiResponse,
  type ApiError,
  type PollingOptions,
  type NetworkInfo
} from './ApiConstants';

// ===== VALIDATION CONSTANTS =====
export {
  VALIDATION_PATTERNS,
  FIELD_LENGTHS,
  NUMERIC_LIMITS,
  DATE_VALIDATION,
  VALIDATION_RULES,
  ERROR_MESSAGES,
  VALIDATION_FUNCTIONS,
  SANITIZATION_RULES,
  type ValidationPattern,
  type FieldLength,
  type NumericLimit,
  type ValidationRule,
  type ValidationResult,
  type FieldValidation,
  type FormValidation
} from './ValidationConstants';

// ===== CONVENIENCE EXPORTS =====
// These are commonly used constants grouped for convenience

// Storage-related exports
export const STORAGE = {
  KEYS: STORAGE_KEYS,
  TYPES: STORAGE_TYPES,
  INDEXEDDB: INDEXEDDB_CONFIG,
  BLOB: BLOB_STORAGE_CONFIG,
  CACHE: CACHE_CONFIG
} as const;

// Event-related exports
export const EVENTS = {
  PAYMENT: PAYMENT_EVENTS,
  LANGUAGE: LANGUAGE_EVENTS,
  STORAGE: STORAGE_EVENTS,
  UI: UI_EVENTS,
  API: API_EVENTS,
  RESERVATION: RESERVATION_EVENTS,
  CITY: CITY_EVENTS,
  ERROR: ERROR_EVENTS
} as const;

// Payment-related exports
export const PAYMENT = {
  STATUS: PAYMENT_STATUS,
  METHODS: PAYMENT_METHODS,
  STEPS: PAYMENT_STEPS,
  LIMITS: PAYMENT_LIMITS,
  CURRENCY: CURRENCY_CONFIG,
  IMOJE: IMOJE_CONFIG,
  VALIDATION: PAYMENT_VALIDATION,
  ERROR_CODES: PAYMENT_ERROR_CODES
} as const;

// UI-related exports
export const UI = {
  STATES: UI_STATES,
  BREAKPOINTS,
  TOUCH_TARGETS,
  ANIMATIONS: ANIMATION_DURATIONS,
  Z_INDEX,
  LOADING: LOADING_TYPES,
  MODALS: MODAL_SIZES,
  TOASTS: TOAST_CONFIG,
  VALIDATION: VALIDATION_STATES,
  MOBILE: MOBILE_NAV,
  THEME: THEME_CONFIG,
  A11Y: A11Y_CONFIG,
  VIEWPORT: VIEWPORT_CONFIG
} as const;

// API-related exports
export const API = {
  BASE_URLS: API_BASE_URLS,
  ENDPOINTS: API_ENDPOINTS,
  METHODS: HTTP_METHODS,
  STATUS: HTTP_STATUS,
  CONFIG: REQUEST_CONFIG,
  POLLING: API_POLLING_CONFIG,
  HEADERS: REQUEST_HEADERS,
  ERROR_CODES: API_ERROR_CODES,
  RATE_LIMITS,
  MOBILE: MOBILE_API_CONFIG
} as const;

// Validation-related exports
export const VALIDATION = {
  PATTERNS: VALIDATION_PATTERNS,
  LENGTHS: FIELD_LENGTHS,
  LIMITS: NUMERIC_LIMITS,
  DATES: DATE_VALIDATION,
  RULES: VALIDATION_RULES,
  MESSAGES: ERROR_MESSAGES,
  FUNCTIONS: VALIDATION_FUNCTIONS,
  SANITIZATION: SANITIZATION_RULES
} as const;

// ===== GLOBAL CONSTANTS =====
// Application-wide constants that don't fit into specific categories

export const APP_CONFIG = {
  NAME: 'Tourist Tax Online',
  VERSION: '1.0.0',
  DESCRIPTION: 'Oplata Miejscowa - Tourist tax payment system for Polish cities',
  DOMAIN: 'oplatamiejscowa.pl',
  SUPPORT_EMAIL: 'support@oplatamiejscowa.pl',
  SUPPORT_PHONE: '+48 123 456 789'
} as const;

export const LANGUAGES = {
  SUPPORTED: ['pl', 'en'] as const,
  DEFAULT: 'pl' as const,
  FALLBACK: 'en' as const
} as const;

export const ENVIRONMENTS = {
  DEVELOPMENT: 'development',
  STAGING: 'staging',
  PRODUCTION: 'production'
} as const;

// ===== TYPE EXPORTS =====
// Re-export all types for convenience
export type SupportedLanguage = typeof LANGUAGES.SUPPORTED[number];
export type Environment = typeof ENVIRONMENTS[keyof typeof ENVIRONMENTS];
