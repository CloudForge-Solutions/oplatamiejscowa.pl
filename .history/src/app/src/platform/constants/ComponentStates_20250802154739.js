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
} as const;

// ===== MODAL SIZES =====
export const MODAL_SIZES = {
	DEFAULT_WIDTH: 800,
	DEFAULT_HEIGHT: 600,
	MIN_WIDTH: 400,
	MIN_HEIGHT: 300,
	MAX_WIDTH: 1400,
	MAX_HEIGHT: 900
} as const;

// ===== ELEMENT IDS =====
export const ELEMENT_IDS = {
	// Main application containers
	APP_CONTAINER: 'app-container',
	MAIN_CONTENT: 'main-content',

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

	// Tourist tax specific elements
	PAYMENT_FORM: 'payment-form',
	RESERVATION_DISPLAY: 'reservation-display',
	LANGUAGE_SELECTOR: 'language-selector'
} as const;

// ===== DOM ATTRIBUTES =====
export const DOM_ATTRIBUTES = {
	// Data attributes for component identification
	DATA_COMPONENT: 'data-component',
	DATA_STATE: 'data-state',
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
} as const;

// ===== PAYMENT PROCESSING MODES =====
export const PROCESSING_MODES = {
	// Payment processing modes
	SINGLE: 'single',
	BACKGROUND: 'background',

	// Validation modes
	STRICT: 'strict',
	LENIENT: 'lenient'
} as const;

// Type definitions for TypeScript
export type ComponentState = typeof COMPONENT_STATES[keyof typeof COMPONENT_STATES];
export type ModalSize = typeof MODAL_SIZES[keyof typeof MODAL_SIZES];
export type ElementId = typeof ELEMENT_IDS[keyof typeof ELEMENT_IDS];
export type DomAttribute = typeof DOM_ATTRIBUTES[keyof typeof DOM_ATTRIBUTES];
export type ProcessingMode = typeof PROCESSING_MODES[keyof typeof PROCESSING_MODES];
