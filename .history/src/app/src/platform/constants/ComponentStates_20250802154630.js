/**
 * Component States Constants
 *
 * ARCHITECTURAL LAYER: Platform
 * PURPOSE: Tourist tax application component states for UI logic
 *
 * SINGLE RESPONSIBILITY: Component state identifiers only
 * - UI visibility states
 * - Modal enhancement states
 * - Status indicator states
 * - Payment flow states
 *
 * NOTE: These are application logic identifiers, NOT CSS classes
 * CSS classes belong in SCSS files following CSS-in-CSS principle
 */

// ===== COMPONENT STATES =====
export const COMPONENT_STATES = {
	// UI visibility states
	UI_HIDDEN: 'ui-hidden',
	UI_VISIBLE: 'ui-visible',
	UI_LOADING: 'ui-loading',
	UI_ERROR: 'ui-error',
	UI_SUCCESS: 'ui-success',

	// Theme states
	THEME_LIGHT: 'theme-light',
	THEME_DARK: 'theme-dark',

	// Modal enhancement states
	MODAL_ENHANCED: 'modal-enhanced',
	MODAL_ENHANCEMENT_INDICATOR: 'modal-enhancement-indicator',
	MODAL_RESIZE_HANDLE: 'modal-resize-handle',
	RESIZE_HINT: 'resize-hint',
	RESIZING: 'resizing',

	// Status indicator states
	STATUS_INDICATOR: 'status-indicator',
	STATUS_ACTIVE: 'status-active',
	STATUS_INACTIVE: 'status-inactive',
	STATUS_ERROR: 'status-error',
	STATUS_WARNING: 'status-warning',
	STATUS_SUCCESS: 'status-success',

	// Payment processing states
	PAYMENT_PENDING: 'payment-pending',
	PAYMENT_PROCESSING: 'payment-processing',
	PAYMENT_COMPLETED: 'payment-completed',
	PAYMENT_FAILED: 'payment-failed',

	// Form states
	FORM_PRISTINE: 'form-pristine',
	FORM_DIRTY: 'form-dirty',
	FORM_VALID: 'form-valid',
	FORM_INVALID: 'form-invalid',
	FORM_SUBMITTING: 'form-submitting'
	PROCESSING: 'processing',
	PROCESSED: 'processed',
	PROCESSING_ERROR: 'processing-error',

	// Queue states
	QUEUE_PENDING: 'queue-pending',
	QUEUE_PROCESSING: 'queue-processing',
	QUEUE_COMPLETED: 'queue-completed',
	QUEUE_ERROR: 'queue-error'
};

// ===== MODAL SIZES =====
export const MODAL_SIZES = {
	DEFAULT_WIDTH: 800,
	DEFAULT_HEIGHT: 600,
	MIN_WIDTH: 400,
	MIN_HEIGHT: 300,
	MAX_WIDTH: 1400,
	MAX_HEIGHT: 900
};

// ===== ELEMENT IDS =====
export const ELEMENT_IDS = {
	// Main application containers
	APP_CONTAINER: 'app-container',
	MAIN_CONTENT: 'main-content',
	SIDEBAR_CONTAINER: 'sidebar-container',

	// Modal containers
	MODAL_CONTAINER: 'modal-container',
	MODAL_BACKDROP: 'modal-backdrop',

	// Navigation elements
	NAV_CONTAINER: 'nav-container',
	TAB_CONTAINER: 'tab-container',

	// Status elements
	STATUS_INDICATOR: 'status-indicator',
	LOADING_INDICATOR: 'loading-indicator',
	ERROR_CONTAINER: 'error-container',

	// Context elements
	CONTEXT_INDICATOR: 'context-indicator',
	ENTITY_SELECTOR: 'entity-selector',
	LANGUAGE_SELECTOR: 'language-selector'
};

// ===== DOM ATTRIBUTES =====
export const DOM_ATTRIBUTES = {
	// Data attributes for component identification
	DATA_COMPONENT: 'data-component',
	DATA_STATE: 'data-state',
	DATA_CONTEXT: 'data-context',
	DATA_ENTITY: 'data-entity',
	DATA_ACTION: 'data-action',
	DATA_TARGET: 'data-target',
	DATA_TOGGLE: 'data-toggle',

	// ARIA attributes for accessibility
	ARIA_LABEL: 'aria-label',
	ARIA_EXPANDED: 'aria-expanded',
	ARIA_HIDDEN: 'aria-hidden',
	ARIA_SELECTED: 'aria-selected',

	// Role attributes
	ROLE: 'role',
	TABINDEX: 'tabindex',

	// Custom attributes
	DRAGGABLE: 'draggable',
	CONTENTEDITABLE: 'contenteditable'
};

// ===== PROCESSING MODES =====
export const PROCESSING_MODES = {
	// Document processing modes
	BATCH: 'batch',
	SINGLE: 'single',
	QUEUE: 'queue',
	BACKGROUND: 'background',

	// Analysis modes
	QUICK: 'quick',
	DETAILED: 'detailed',
	COMPREHENSIVE: 'comprehensive',

	// Validation modes
	STRICT: 'strict',
	LENIENT: 'lenient',
	SKIP: 'skip'
};

// ===== QUEUE STATUSES =====
export const QUEUE_STATUSES = {
	// Queue states
	IDLE: 'idle',
	RUNNING: 'running',
	PAUSED: 'paused',
	STOPPED: 'stopped',

	// Item states
	PENDING: 'pending',
	PROCESSING: 'processing',
	COMPLETED: 'completed',
	FAILED: 'failed',
	CANCELLED: 'cancelled',
	RETRYING: 'retrying'
};
