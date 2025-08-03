
/**
 * Platform Event Constants - Cross-Micro-App Communication
 *
 * ARCHITECTURAL STRATEGY: THREE-TIER EVENT SYSTEM
 *
 * TIER 1: PLATFORM EVENTS (This file)
 * - Cross-micro-app communication
 * - System-wide events (context, navigation, records lifecycle)
 * - Used by multiple micro-apps for integration
 * - NEVER change without considering all micro-apps
 *
 * TIER 2: SHELL EVENTS (src/shell/constants/ShellEvents.js)
 * - Shell orchestration and UI management
 * - Micro-app lifecycle management
 * - Global UI state (modals, sidebars)
 *
 * TIER 3: MICRO-APP EVENTS (src/apps/{app}/constants/{App}Events.js)
 * - Internal micro-app communication only
 * - UI state changes within micro-app
 * - Business logic workflows
 * - NEVER imported by other micro-apps
 *
 * NAMING PATTERN: platform:domain:action
 * - platform: Always 'platform' for cross-micro-app events
 * - domain: context, entity, record, navigation, etc.
 * - action: created, updated, deleted, selected, changed, etc.
 */

// TypeScript type definitions for event constants
export type PlatformEventType = typeof PLATFORM_EVENTS[keyof typeof PLATFORM_EVENTS];
export type GlobalEventType = typeof GLOBAL_EVENTS[keyof typeof GLOBAL_EVENTS];
export type LegacyEventType = typeof LEGACY_EVENT_MAPPINGS[keyof typeof LEGACY_EVENT_MAPPINGS];

/**
 * Platform-level events (cross-micro-app communication)
 * Pattern: platform:domain:action
 */
export const PLATFORM_EVENTS = {
	// Context management
	CONTEXT_UPDATED: 'platform:context:updated',
	CONTEXT_LOADING: 'platform:context:loading',
	CONTEXT_ERROR: 'platform:context:error',

	// Entity management
	ENTITY_SELECTED: 'platform:entity:selected',
	ENTITY_CREATED: 'platform:entity:created',
	ENTITY_UPDATED: 'platform:entity:updated',
	ENTITY_DELETED: 'platform:entity:deleted',
	ENTITY_DEACTIVATED: 'platform:entity:deactivated',

	// Record lifecycle (for JPK auto-generation)
	RECORD_UPLOAD_START: 'platform:record:upload:start',
	RECORD_UPLOAD_COMPLETE: 'platform:record:upload:complete',
	RECORD_UPLOAD_ERROR: 'platform:record:upload:error',
	RECORD_PROCESSING_COMPLETE: 'platform:record:processing:complete',
	RECORD_CREATED: 'platform:record:created',
	RECORD_UPDATED: 'platform:record:updated',
	RECORD_DELETED: 'platform:record:deleted',

	// Queue management
	QUEUE_ITEM_ADDED: 'platform:queue:item:added',
	QUEUE_ITEM_COMPLETED: 'platform:queue:item:completed',
	QUEUE_ITEM_FAILED: 'platform:queue:item:failed',
	QUEUE_STATUS_CHANGED: 'platform:queue:status:changed',
	QUEUE_CLEARED: 'platform:queue:cleared',

	// Upload queue processing events
	UPLOAD_QUEUE_COMPLETE: 'platform:upload:queue:complete',
	UPLOAD_PROCESSING_STARTED: 'platform:upload:processing:started',
	UPLOAD_PROCESSING_PAUSED: 'platform:upload:processing:paused',
	UPLOAD_PROCESSING_RESUMED: 'platform:upload:processing:resumed',
	UPLOAD_PROCESSING_STOPPED: 'platform:upload:processing:stopped',
	FILES_ADDED_TO_QUEUE: 'platform:upload:files:added',
	FILES_ADD_ERROR: 'platform:upload:files:error',

	// Configuration changes (cross-micro-app)
	JPK_CONFIG_UPDATED: 'platform:jpk-config:updated',
	BANK_ACCOUNT_UPDATED: 'platform:bank-account:updated',
	USER_SETTINGS_UPDATED: 'platform:user-settings:updated',

	// Record creation requests (UI actions)
	RECORD_CREATE_REQUESTED: 'platform:record:create-requested',

	// PDF generation requests
	RECORD_PDF_GENERATION_REQUESTED: 'platform:record:pdf-generation-requested',

	// Navigation
	NAVIGATION_CHANGED: 'platform:navigation:changed',
	TAB_CHANGED: 'platform:tab:changed',
	NAVIGATION_SWITCH_TAB: 'platform:navigation:switch-tab',

	// System events
	SERVICE_READY: 'platform:service:ready',
	SERVICE_STATE_CHANGED: 'platform:service:state-changed',
	SERVICE_ERROR: 'platform:service:error',
	NOTIFICATION_SHOW: 'platform:notification:show',
	ERROR_OCCURRED: 'platform:error:occurred'
};

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
