/**
 * Application Constants - Barrel Export
 * Centralized constants following the architecture requirements
 * All storage keys, events, and configuration constants
 */

// ===== STORAGE KEYS =====
export const STORAGE_KEYS = {
  // Global keys (flat structure)
  GLOBAL_LANGUAGE: 'global:language:v1.0.0',
  GLOBAL_SELECTED_CITY: 'global:selectedCity:v1.0.0',
  GLOBAL_PAYMENT_HISTORY: 'global:paymentHistory:v1.0.0',
  
  // Mode-specific data
  TOURIST_PREFERENCES: 'tourist:preferences',
  LANDLORD_CONFIG: 'landlord:config',
  
  // Cache data
  CACHE_CITY_RATES: 'cache:cityRates',
  CACHE_RESERVATIONS: 'cache:reservations',
  CACHE_PAYMENT_HISTORY: 'cache:paymentHistory',
  CACHE_CITY_DATA: 'cache:cityData',
  
  // Legacy support (from existing LocalStorageManager)
  USER_PREFERENCES: 'tourist-tax-preferences',
  FORM_DATA_CACHE: 'tourist-tax-form-cache',
  SESSION_DATA: 'tourist-tax-session',
  GDPR_CONSENTS: 'tourist-tax-gdpr-consents',
  APP_VERSION: 'tourist-tax-app-version'
} as const;

// ===== PLATFORM EVENTS =====
export const PLATFORM_EVENTS = {
  CITY_SELECTED: 'platform:city:selected',
  CITY_CHANGED: 'platform:city:changed',
  LANGUAGE_CHANGED: 'platform:language:changed',
  MODE_SWITCHED: 'platform:mode:switched',
  STORAGE_UPDATED: 'platform:storage:updated',
  CACHE_INVALIDATED: 'platform:cache:invalidated'
} as const;

// ===== PAYMENT EVENTS =====
export const PAYMENT_EVENTS = {
  PAYMENT_INITIATED: 'payment:initiated',
  PAYMENT_PROCESSING: 'payment:processing',
  PAYMENT_COMPLETED: 'payment:completed',
  PAYMENT_FAILED: 'payment:failed',
  PAYMENT_CANCELLED: 'payment:cancelled',
  PAYMENT_REFUNDED: 'payment:refunded'
} as const;

// ===== RESERVATION EVENTS =====
export const RESERVATION_EVENTS = {
  RESERVATION_CREATED: 'reservation:created',
  RESERVATION_UPDATED: 'reservation:updated',
  RESERVATION_CANCELLED: 'reservation:cancelled',
  RESERVATION_IMPORTED: 'reservation:imported'
} as const;

// ===== CITY CODES =====
export const CITY_CODES = {
  KRAKOW: 'KRK',
  WARSAW: 'WAW',
  GDANSK: 'GDN',
  WROCLAW: 'WRO',
  POZNAN: 'POZ',
  ZAKOPANE: 'ZAK'
} as const;

// ===== PAYMENT STATUS =====
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded'
} as const;

// ===== RESERVATION STATUS =====
export const RESERVATION_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired'
} as const;

// ===== TOURIST TAX TYPES =====
export const TOURIST_TAX_TYPES = {
  STANDARD: 'standard',
  REDUCED: 'reduced',
  EXEMPT: 'exempt'
} as const;

// ===== UI STATES =====
export const UI_STATES = {
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
  IDLE: 'idle'
} as const;

// ===== APP MODES =====
export const APP_MODES = {
  TOURIST: 'tourist',
  LANDLORD: 'landlord'
} as const;

// ===== ACCOMMODATION TYPES =====
export const ACCOMMODATION_TYPES = {
  HOTEL: 'hotel',
  APARTMENT: 'apartment',
  HOSTEL: 'hostel',
  GUESTHOUSE: 'guesthouse',
  VILLA: 'villa',
  OTHER: 'other'
} as const;

// ===== BOOKING PLATFORMS =====
export const BOOKING_PLATFORMS = {
  BOOKING_COM: 'booking.com',
  AIRBNB: 'airbnb',
  EXPEDIA: 'expedia',
  AGODA: 'agoda',
  DIRECT: 'direct',
  OTHER: 'other'
} as const;

// ===== API ENDPOINTS =====
export const API_ENDPOINTS = {
  TAX_CALCULATE: '/tax/calculate',
  RESERVATIONS: '/reservations',
  PAYMENTS: '/payments',
  CITIES: '/cities',
  DOCUMENTS: '/documents',
  HEALTH: '/health'
} as const;

// ===== CACHE SETTINGS =====
export const CACHE_SETTINGS = {
  TTL: {
    CITY_RATES: 30 * 60 * 1000, // 30 minutes
    RESERVATIONS: 2 * 60 * 1000, // 2 minutes
    PAYMENT_HISTORY: 1 * 60 * 1000, // 1 minute
    CITY_DATA: 60 * 60 * 1000 // 1 hour
  },
  MAX_SIZE: {
    RESERVATIONS: 1000,
    PAYMENT_HISTORY: 500,
    CITY_DATA: 100
  }
} as const;

// ===== VALIDATION RULES =====
export const VALIDATION_RULES = {
  MIN_STAY_DAYS: 1,
  MAX_STAY_DAYS: 365,
  MIN_GUESTS: 1,
  MAX_GUESTS: 20,
  MIN_TAX_AMOUNT: 0.01,
  MAX_TAX_AMOUNT: 10000
} as const;

// ===== CURRENCY =====
export const CURRENCY = {
  PLN: 'PLN',
  EUR: 'EUR',
  USD: 'USD'
} as const;

// ===== LANGUAGES =====
export const LANGUAGES = {
  POLISH: 'pl',
  ENGLISH: 'en'
} as const;

// ===== ERROR CODES =====
export const ERROR_CODES = {
  CITY_NOT_FOUND: 'CITY_NOT_FOUND',
  INVALID_DATES: 'INVALID_DATES',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  API_ERROR: 'API_ERROR',
  STORAGE_ERROR: 'STORAGE_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR'
} as const;

// ===== INDEXEDDB SETTINGS =====
export const INDEXEDDB_SETTINGS = {
  DB_NAME: 'TouristTaxDB',
  VERSION: 1,
  STORES: {
    RESERVATIONS: 'reservations',
    PAYMENTS: 'payments',
    DOCUMENTS: 'documents',
    AUDIT_LOGS: 'auditLogs'
  }
} as const;

// Type exports for better TypeScript support
export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];
export type PlatformEvent = typeof PLATFORM_EVENTS[keyof typeof PLATFORM_EVENTS];
export type PaymentEvent = typeof PAYMENT_EVENTS[keyof typeof PAYMENT_EVENTS];
export type CityCode = typeof CITY_CODES[keyof typeof CITY_CODES];
export type PaymentStatus = typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS];
export type ReservationStatus = typeof RESERVATION_STATUS[keyof typeof RESERVATION_STATUS];
export type UIState = typeof UI_STATES[keyof typeof UI_STATES];
export type AppMode = typeof APP_MODES[keyof typeof APP_MODES];
export type AccommodationType = typeof ACCOMMODATION_TYPES[keyof typeof ACCOMMODATION_TYPES];
export type BookingPlatform = typeof BOOKING_PLATFORMS[keyof typeof BOOKING_PLATFORMS];
export type Language = typeof LANGUAGES[keyof typeof LANGUAGES];
export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];
