
/**
 * Platform Event Constants - Tourist Tax Application
 *
 * ARCHITECTURAL STRATEGY: SIMPLE EVENT SYSTEM
 *
 * PLATFORM EVENTS:
 * - System-wide events (language, payment, storage)
 * - Cross-context communication
 * - EventBus integration for service coordination
 *
 * NAMING PATTERN: platform:domain:action
 * - platform: Always 'platform' for system events
 * - domain: language, payment, storage, navigation
 * - action: updated, completed, failed, changed, etc.
 */

/**
 * Platform-level events for tourist tax application
 * Pattern: platform:domain:action
 */
export const PLATFORM_EVENTS = {
	// Language management
	LANGUAGE_CHANGED: 'platform:language:changed',
	LANGUAGE_LOADING: 'platform:language:loading',
	LANGUAGE_ERROR: 'platform:language:error',

	// Payment management
	PAYMENT_INITIATED: 'platform:payment:initiated',
	PAYMENT_PROCESSING: 'platform:payment:processing',
	PAYMENT_COMPLETED: 'platform:payment:completed',
	PAYMENT_FAILED: 'platform:payment:failed',
	PAYMENT_STATUS_UPDATED: 'platform:payment:status_updated',

	// Storage management
	STORAGE_UPDATED: 'platform:storage:updated',
	STORAGE_CLEARED: 'platform:storage:cleared',
	STORAGE_ERROR: 'platform:storage:error',

	// Navigation events
	ROUTE_CHANGED: 'platform:navigation:route_changed',
	PAGE_LOADED: 'platform:navigation:page_loaded',

	// Reservation management
	RESERVATION_LOADED: 'platform:reservation:loaded',
	RESERVATION_ERROR: 'platform:reservation:error',

	// Form management
	FORM_UPDATED: 'platform:form:updated',
	FORM_SUBMITTED: 'platform:form:submitted',
	FORM_VALIDATION_ERROR: 'platform:form:validation_error',

	// System events
	SERVICE_READY: 'platform:service:ready',
	SERVICE_ERROR: 'platform:service:error',
	NOTIFICATION_SHOW: 'platform:notification:show',
	ERROR_OCCURRED: 'platform:error:occurred'
} as const;

/**
 * Global infrastructure events for tourist tax application
 * Pattern: global:domain:action
 */
export const GLOBAL_EVENTS = {
	// Application lifecycle
	APP_INITIALIZED: 'global:app:initialized',
	APP_ERROR: 'global:app:error',

	// Language and theme
	LANGUAGE_CHANGED: 'global:language:changed',
	THEME_CHANGED: 'global:theme:changed',

	// Window and UI (mobile-first)
	WINDOW_RESIZED: 'global:window:resized',
	APP_VISIBILITY_CHANGED: 'global:app:visibility:changed',

	// Application warnings and errors
	APP_WARNING: 'global:app:warning'
} as const;

/**
 * All platform events for tourist tax application
 */
export const ALL_PLATFORM_EVENTS = {
	PLATFORM: PLATFORM_EVENTS,
	GLOBAL: GLOBAL_EVENTS
} as const;

// TypeScript type definitions for event constants
export type PlatformEventType = typeof PLATFORM_EVENTS[keyof typeof PLATFORM_EVENTS];
export type GlobalEventType = typeof GLOBAL_EVENTS[keyof typeof GLOBAL_EVENTS];
export type AllEventType = PlatformEventType | GlobalEventType;
