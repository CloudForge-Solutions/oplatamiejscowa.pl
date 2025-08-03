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