/**
 * Core Constants Barrel Export
 *
 * ARCHITECTURAL LAYER: Core
 * PURPOSE: Pure utility constants with no business context
 *
 * This barrel export provides all core-level constants that are:
 * - Pure utility functions and patterns
 * - File handling and validation
 * - DOM manipulation utilities
 * - Generic validation rules
 * - Framework-agnostic constants
 *
 * USAGE: import { FILE_EXTENSIONS, VALIDATION_PATTERNS } from '@/constants';
 *
 * NOTE: These constants are pure utilities and should have no business
 * logic or domain-specific knowledge. They should be reusable across
 * any application regardless of business domain.
 */

// ✅ ARCHITECTURAL FIX: ApplicationConstants god object resolved
// Replaced with focused, single-responsibility files:
export * from './ComponentStates';      // Component states and UI elements
export * from './DatabaseConstants';    // Database and storage configurations
export * from './DatabaseNamingConstants'; // Database naming patterns and store names
export * from './ApplicationMessages';  // Messages and notifications
export * from './LocaleConstants';      // Internationalization and formatting

// Locale and formatting constants
export * from './LocaleConstants';
export * from './CoreConstants';
export * from './DOMConstants';
export * from './EntityConstants';
// ARCHITECTURAL FIX: EntityTypes removed - EntityConstants re-exports everything from EntityTypes
export * from './EventConstants';
export * from './FileConstants';
export * from './PolishLegalEntities';

// ARCHITECTURAL FIX: All export conflicts resolved by removing duplicates from source files

export * from './SecurityConstants';
export * from './RecordKinds';
export * from './StorageConstants';
export * from './StorageKeys';
export * from './TransactionFlowTypes';
export * from './ValidationConstants';

// Audit Log Constants (from apps/settings/components/audit/constants)
export * from '../../apps/settings/components/audit/constants/AuditLogConstants';