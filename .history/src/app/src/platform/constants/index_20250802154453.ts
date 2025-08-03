/**
 * Platform Constants Barrel Export
 *
 * ARCHITECTURAL LAYER: Platform
 * PURPOSE: Tourist tax platform constants
 *
 * This barrel export provides platform-level constants for:
 * - Component states and UI elements
 * - Event system constants
 * - File handling and validation
 * - Security and validation rules
 * - Storage and locale constants
 *
 * USAGE: import { COMPONENT_STATES, PLATFORM_EVENTS } from '@/platform/constants';
 */

// Platform constants for tourist tax application
export * from './ComponentStates';      // Component states and UI elements
export * from './ApplicationMessages';  // Messages and notifications
export * from './LocaleConstants';      // Internationalization and formatting
export * from './CoreConstants';        // Core utility constants
export * from './DOMConstants';         // DOM manipulation utilities
export * from './EventConstants';       // Platform event system
export * from './FileConstants';        // File handling constants
export * from './SecurityConstants';    // Security and validation
export * from './StorageConstants';     // Storage configuration
export * from './StorageKeys';          // Storage key patterns
export * from './ValidationConstants';  // Validation rules