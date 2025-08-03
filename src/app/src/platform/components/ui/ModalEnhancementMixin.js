/**
 * Modal Enhancement Mixin - Platform-level modal enhancement functionality
 *
 * ARCHITECTURAL PRINCIPLES:
 * 1. Mixin Pattern: Can be applied to any modal class
 * 2. Platform Layer: Reusable across all micro-apps
 * 3. Single Responsibility: Only handles modal enhancements
 * 4. Non-intrusive: Doesn't modify existing modal behavior
 * 5. Configurable: Flexible configuration per modal type
 *
 * USAGE:
 * class MyModal extends ModalEnhancementMixin(BaseClass) {
 *     constructor() {
 *         super();
 *         this.initializeModalEnhancements({
 *             resizable: true,
 *             draggable: false,
 *             persistKey: 'myModal'
 *         });
 *     }
 * }
 */

import {ModalResizeUtility} from '../common/ModalResizeUtility';
import {logger} from '@/platform/CentralizedLogger';
import {COMPONENT_STATES} from '@platform/core/ApplicationConstants';

// ARCHITECTURAL FIX: Use simple selectors instead of importing from God Object
const MODAL_SELECTORS = {
	MODAL: '.modal',
	MODAL_DIALOG: '.modal-dialog',
	MODAL_CONTENT: '.modal-content'
};

/**
 * Modal Enhancement Mixin Factory
 */
export function ModalEnhancementMixin(BaseClass) {
	return class extends BaseClass {
		constructor(...args) {
			super(...args);

			// Enhancement state
			this.modalEnhancements = {
				resizeUtility: null,
				isEnhanced: false,
				config: {}
			};
		}

		/**
		 * Initialize modal enhancements
		 */
		initializeModalEnhancements(config = {}) {
			if (this.modalEnhancements.isEnhanced) {
				logger.warn('⚠️ Modal enhancements already initialized');
				return;
			}

			// Default configuration
			this.modalEnhancements.config = {
				resizable: true,
				draggable: false, // Dragging modals is generally poor UX
				persistKey: config.persistKey || 'modal',
				resizeDirections: config.resizeDirections || ['right', 'bottom', 'corner'],
				minWidth: config.minWidth || 400,
				minHeight: config.minHeight || 300,
				defaultWidth: config.defaultWidth || 600,
				defaultHeight: config.defaultHeight || 400,
				enableKeyboard: config.enableKeyboard !== false,
				enableTouch: config.enableTouch !== false,
				autoInitialize: config.autoInitialize !== false,
				...config
			};

			if (this.modalEnhancements.config.autoInitialize) {
				// Wait for modal to be created and shown
				this.setupEnhancementTriggers();
			}
			// If autoInitialize is false, the modal will call applyEnhancements() manually

			logger.info('🎨 Modal enhancements configured:', this.modalEnhancements.config.persistKey);
		}

		/**
		 * Setup triggers to initialize enhancements when modal is ready
		 */
		setupEnhancementTriggers() {
			// Method 1: If modal element already exists
			if (this.modalElement) {
				this.applyModalEnhancements();
				return;
			}

			// Method 2: Watch for modal element creation
			const observer = new MutationObserver(mutations => {
				mutations.forEach(mutation => {
					mutation.addedNodes.forEach(node => {
						if (node.nodeType === Node.ELEMENT_NODE) {
							// Check if this is our modal
							if (node.classList?.contains('modal') || node.querySelector?.(MODAL_SELECTORS.MODAL)) {
								this.modalElement = node.classList?.contains('modal')
									? node
									: node.querySelector(MODAL_SELECTORS.MODAL);
								this.applyModalEnhancements();
								observer.disconnect();
							}
						}
					});
				});
			});

			observer.observe(document.body, {
				childList: true,
				subtree: true
			});

			// Cleanup observer after 10 seconds to prevent memory leaks
			setTimeout(() => {
				observer.disconnect();
			}, 10000);
		}

		/**
		 * Apply modal enhancements
		 */
		applyModalEnhancements() {
			logger.info('🔧 applyModalEnhancements called');
			logger.info('🔧 modalElement exists:', !!this.modalElement);
			logger.info('🔧 modalElement ID:', this.modalElement?.id);
			logger.info('🔧 isEnhanced:', this.modalEnhancements.isEnhanced);
			logger.info('🔧 config:', this.modalEnhancements.config);

			if (!this.modalElement) {
				logger.warn('⚠️ Cannot apply modal enhancements: modal element not found');
				return;
			}

			if (this.modalEnhancements.isEnhanced) {
				logger.warn('⚠️ Modal enhancements already applied');
				return;
			}

			try {
				// Apply resize functionality
				if (this.modalEnhancements.config.resizable) {
					logger.info('🔧 Initializing resize utility...');
					this.initializeResizeUtility();
				}

				// Add enhancement CSS class
				this.modalElement.classList.add(COMPONENT_STATES.MODAL_ENHANCED);
				logger.info('🔧 Added modal-enhanced class');

				// Add enhancement indicators to modal
				this.addEnhancementIndicators();
				logger.info('🔧 Added enhancement indicators');

				this.modalEnhancements.isEnhanced = true;
				logger.info('✅ Modal enhancements applied successfully');
			} catch (error) {
				logger.error('❌ Failed to apply modal enhancements:', error);
				throw error; // Re-throw for debugging
			}
		}

		/**
		 * Initialize resize utility
		 */
		initializeResizeUtility() {
			if (this.modalEnhancements.resizeUtility) {
				return; // Already initialized
			}

			try {
				this.modalEnhancements.resizeUtility = new ModalResizeUtility(this.modalElement, {
					directions: this.modalEnhancements.config.resizeDirections,
					minWidth: this.modalEnhancements.config.minWidth,
					minHeight: this.modalEnhancements.config.minHeight,
					defaultWidth: this.modalEnhancements.config.defaultWidth,
					defaultHeight: this.modalEnhancements.config.defaultHeight,
					persistKey: this.modalEnhancements.config.persistKey,
					enableKeyboard: this.modalEnhancements.config.enableKeyboard,
					enableTouch: this.modalEnhancements.config.enableTouch
				});

				this.modalEnhancements.resizeUtility.initialize();

				// Listen for resize events
				this.modalElement.addEventListener('modal-resize', e => {
					this.onModalResize?.(e.detail);
				});

				this.modalElement.addEventListener('modal-resize-end', e => {
					this.onModalResizeEnd?.(e.detail);
				});

				logger.info('🔧 Modal resize utility initialized');
			} catch (error) {
				logger.error('❌ Failed to initialize resize utility:', error);
			}
		}

		/**
		 * Add visual indicators for enhanced functionality
		 * ARCHITECTURE FIX: Prevent duplicate indicators
		 */
		addEnhancementIndicators() {
			const header = this.modalElement.querySelector('.modal-header');
			if (!header) {
				return; // No header
			}

			// Check for existing indicators (from ModalResizeUtility or previous calls)
			const existingIndicator = header.querySelector('.modal-enhancement-indicator, .resize-hint');
			if (existingIndicator) {
				return; // Already added - prevent duplicates
			}

			const indicator = document.createElement('div');
			indicator.className = 'modal-enhancement-indicator d-flex align-items-center';
			indicator.innerHTML = `
                <small class="text-muted d-none d-md-inline">
                    ${
						this.modalEnhancements.config.resizable
							? '<i class="bi bi-arrows-expand me-1"></i>Resizable • <kbd>Ctrl+R</kbd> reset'
							: ''
					}
                </small>
            `;

			// Insert before close button
			const closeButton = header.querySelector('.btn-close');
			if (closeButton) {
				header.insertBefore(indicator, closeButton);
			} else {
				header.appendChild(indicator);
			}
		}

		/**
		 * Get modal enhancement status
		 */
		getEnhancementStatus() {
			return {
				isEnhanced: this.modalEnhancements.isEnhanced,
				hasResize: !!this.modalEnhancements.resizeUtility,
				config: {...this.modalEnhancements.config}
			};
		}

		/**
		 * Manually trigger enhancement application
		 */
		applyEnhancements() {
			this.applyModalEnhancements();
		}

		/**
		 * Reset modal to default size (if resizable)
		 */
		resetModalSize() {
			if (this.modalEnhancements.resizeUtility) {
				this.modalEnhancements.resizeUtility.resetToDefaultSize();
			}
		}

		/**
		 * Set modal dimensions programmatically (if resizable)
		 */
		setModalDimensions(width, height) {
			if (this.modalEnhancements.resizeUtility) {
				return this.modalEnhancements.resizeUtility.setDimensions(width, height);
			}
			return null;
		}

		/**
		 * Get current modal dimensions (if resizable)
		 */
		getModalDimensions() {
			if (this.modalEnhancements.resizeUtility) {
				return this.modalEnhancements.resizeUtility.getDimensions();
			}
			return null;
		}

		/**
		 * Override destroy method to clean up enhancements
		 */
		destroy() {
			// Clean up modal enhancements
			if (this.modalEnhancements.resizeUtility) {
				this.modalEnhancements.resizeUtility.destroy();
				this.modalEnhancements.resizeUtility = null;
			}

			// Remove enhancement indicators
			const indicator = this.modalElement?.querySelector('.modal-enhancement-indicator');
			if (indicator) {
				indicator.remove();
			}

			// Remove enhancement CSS class
			if (this.modalElement) {
				this.modalElement.classList.remove('modal-enhanced');
			}

			this.modalEnhancements.isEnhanced = false;

			// Call parent destroy if it exists
			if (super.destroy) {
				super.destroy();
			}

			logger.info('🗑️ Modal enhancements destroyed');
		}

		/**
		 * Hook for modal resize events (override in subclasses)
		 */
		onModalResize(detail) {
			// Override in subclasses to handle resize events
			logger.debug('📏 Modal resized:', detail);
		}

		/**
		 * Hook for modal resize end events (override in subclasses)
		 */
		onModalResizeEnd(detail) {
			// Override in subclasses to handle resize end events
			logger.debug('📏 Modal resize ended:', detail);
		}
	};
}

/**
 * Standalone function to enhance any existing modal element
 */
export function enhanceModal(modalElement, config = {}) {
	if (!modalElement) {
		throw new Error('Modal element is required');
	}

	const enhancementConfig = {
		persistKey: modalElement.id || 'modal',
		resizable: true,
		...config
	};

	let resizeUtility = null;

	if (enhancementConfig.resizable) {
		resizeUtility = new ModalResizeUtility(modalElement, enhancementConfig);
		resizeUtility.initialize();
	}

	// Add enhancement class
	modalElement.classList.add(COMPONENT_STATES.MODAL_ENHANCED);

	logger.info('✅ Modal enhanced standalone:', enhancementConfig.persistKey);

	return {
		resizeUtility,
		destroy: () => {
			if (resizeUtility) {
				resizeUtility.destroy();
			}
			modalElement.classList.remove('modal-enhanced');
		}
	};
}
