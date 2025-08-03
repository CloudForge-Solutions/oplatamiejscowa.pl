
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
 * Global infrastructure events
 * Pattern: global:domain:action
 */
export const GLOBAL_EVENTS = {
	// Application lifecycle
	APP_INITIALIZED: 'global:app:initialized',
	APP_ERROR: 'global:app:error',

	// Language and theme
	LANGUAGE_CHANGED: 'global:language:changed',
	LANGUAGE_SERVICE_INITIALIZED: 'global:language:service:initialized',
	THEME_CHANGED: 'global:theme:changed',

	// Window and UI
	WINDOW_RESIZED: 'global:window:resized',
	APP_VISIBILITY_CHANGED: 'global:app:visibility:changed',
	SIDEBAR_TOGGLED: 'global:sidebar:toggled',

	// Application warnings and errors
	APP_WARNING: 'global:app:warning',
	CONTEXT_LOST: 'global:context:lost'
};

/**
 * DEPRECATED: Micro-app specific events moved to their own constants files
 *
 * These events should be moved to:
 * - Settings: src/apps/settings/constants/SettingsEvents.js
 * - Records: src/apps/records/constants/RecordsEvents.js
 * - JPK: src/apps/jpk/constants/JpkEvents.js
 * - Dashboard: src/apps/dashboard/constants/DashboardEvents.js
 *
 * Only cross-micro-app integration events should remain in platform layer.
 */

/**
 * Legacy event mappings for backward compatibility
 * TODO: Remove after migration is complete
 */
export const LEGACY_EVENT_MAPPINGS = {
	// Platform events
	'context:updated': PLATFORM_EVENTS.CONTEXT_UPDATED,
	'entity:selected': PLATFORM_EVENTS.ENTITY_SELECTED,
	'entity:changed': PLATFORM_EVENTS.ENTITY_SELECTED,
	'record:upload:complete': PLATFORM_EVENTS.RECORD_UPLOAD_COMPLETE,
	'record:processing:complete': PLATFORM_EVENTS.RECORD_PROCESSING_COMPLETE,
	'record:deleted': PLATFORM_EVENTS.RECORD_DELETED,
	'record-created': PLATFORM_EVENTS.RECORD_CREATED,
	'queue:item:completed': PLATFORM_EVENTS.QUEUE_ITEM_COMPLETED,
	'queue-status-changed': PLATFORM_EVENTS.QUEUE_STATUS_CHANGED,
	'navigation:changed': PLATFORM_EVENTS.NAVIGATION_CHANGED,
	'navigation:switch-tab': PLATFORM_EVENTS.TAB_CHANGED,
	'service:ready': PLATFORM_EVENTS.SERVICE_READY,
	'service:state-changed': PLATFORM_EVENTS.SERVICE_STATE_CHANGED,

	// Global events
	'language:changed': GLOBAL_EVENTS.LANGUAGE_CHANGED,
	'language:service:initialized': GLOBAL_EVENTS.LANGUAGE_SERVICE_INITIALIZED,
	'window:resized': GLOBAL_EVENTS.WINDOW_RESIZED,
	'app:visibility': GLOBAL_EVENTS.APP_VISIBILITY_CHANGED,

	// Navigation events (cross-micro-app) - removed duplicate key

	// Configuration events (cross-micro-app)
	'jpk-config:updated': PLATFORM_EVENTS.JPK_CONFIG_UPDATED,
	'settings:language-changed': PLATFORM_EVENTS.USER_SETTINGS_UPDATED,
	'settings:theme-changed': PLATFORM_EVENTS.USER_SETTINGS_UPDATED,
	'context:changed': PLATFORM_EVENTS.CONTEXT_UPDATED
};

/**
 * Platform events only - for cross-micro-app communication
 */
export const ALL_PLATFORM_EVENTS = {
	PLATFORM: PLATFORM_EVENTS,
	GLOBAL: GLOBAL_EVENTS
};

/**
 * Platform event validation helper
 */
export function validatePlatformEvent(eventName: string): boolean {
	const allPlatformEvents = Object.values(ALL_PLATFORM_EVENTS).flatMap(category =>
		Object.values(category)
	);
	return allPlatformEvents.includes(eventName);
}

/**
 * Get platform event category from event name
 */
export function getPlatformEventCategory(eventName: string): string {
	for (const [category, events] of Object.entries(ALL_PLATFORM_EVENTS)) {
		if (Object.values(events).includes(eventName)) {
			return category;
		}
	}
	return 'UNKNOWN';
}

/**
 * String patterns for event validation
 */
const STRING_PATTERNS = {
	PLATFORM_PREFIX: 'platform:',
	GLOBAL_PREFIX: 'global:'
} as const;

/**
 * Check if event is cross-micro-app (platform level)
 */
export function isCrossMicroAppEvent(eventName: string): boolean {
	return (
		eventName.startsWith(STRING_PATTERNS.PLATFORM_PREFIX) ||
		eventName.startsWith(STRING_PATTERNS.GLOBAL_PREFIX)
	);
}

/**
 * Event validation schemas - Type Safety compliance
 */
export const EVENT_SCHEMAS = {
	[PLATFORM_EVENTS.ENTITY_CREATED]: {
		required: ['id', 'name'],
		type: 'object'
	},
	[PLATFORM_EVENTS.ENTITY_UPDATED]: {
		required: ['id', 'name'],
		type: 'object'
	},
	[PLATFORM_EVENTS.ENTITY_DELETED]: {
		required: ['id'],
		type: 'object'
	}
};
