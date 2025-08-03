/**
 * Centralized Constants Hub - Single Barrel Export
 *
 * ARCHITECTURE PRINCIPLE: All constants MUST be imported via this barrel export
 * - Magic strings and numbers are FORBIDDEN - use named constants
 * - Constants are modular but barrel-exported during development phase
 * - No duplicate constant definitions across modules
 * - Use TypeScript `as const` assertions for immutable constants
 */

// Platform constants (core infrastructure)
export * from '@/platform/constants/StorageConstants';
export * from '@/platform/constants/ApiConstants';
export * from '@/platform/constants/ValidationConstants';

// Shell constants (application shell)
export * from '@/shell/constants/ShellConstants';
export * from '@/shell/constants/ContextConstants';

// App-specific constants
export * from '@/apps/tourist-tax/constants/PaymentConstants';
export * from '@/apps/tourist-tax/constants/MobileConstants';