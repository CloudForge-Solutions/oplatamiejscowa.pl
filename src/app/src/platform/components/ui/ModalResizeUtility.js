/**
 * Modal Resize Utility - Platform-level reusable modal resizing functionality
 *
 * ARCHITECTURAL PRINCIPLES:
 * 1. Platform Layer: Reusable utility for all micro-apps
 * 2. Single Responsibility: Only handles modal resizing behavior
 * 3. Accessibility: Full keyboard and screen reader support
 * 4. Performance: Optimized for smooth interactions
 * 5. Persistence: Saves user preferences per modal
 * 6. Responsive: Adapts to different screen sizes
 *
 * USAGE:
 * const resizer = new ModalResizeUtility(modalElement, {
 *     directions: ['right', 'bottom', 'corner'],
 *     minWidth: 400,
 *     minHeight: 300,
 *     persistKey: 'myModal'
 * });
 */

import {logger} from '@/platform/CentralizedLogger';

export class ModalResizeUtility {
	constructor(modalElement, options = {}) {
		this.modalElement = modalElement;
		this.modalDialog = modalElement?.querySelector('.modal-dialog');

		if (!this.modalElement || !this.modalDialog) {
			throw new Error('ModalResizeUtility requires valid modal element with .modal-dialog');
		}

		// Configuration with defaults
		this.config = {
			directions: options.directions || ['right', 'bottom', 'corner'], // Available: 'left', 'right', 'top', 'bottom', 'corner'
			minWidth: options.minWidth || 320,
			maxWidth: options.maxWidth || window.innerWidth * 0.95,
			minHeight: options.minHeight || 200,
			maxHeight: options.maxHeight || window.innerHeight * 0.95,
			persistKey: options.persistKey || 'modal-resize',
			handleSize: options.handleSize || 8,
			cornerSize: options.cornerSize || 16,
			snapThreshold: options.snapThreshold || 10,
			enableKeyboard: options.enableKeyboard !== false,
			enableTouch: options.enableTouch !== false,
			...options
		};

		// State management
		this.state = {
			isResizing: false,
			resizeDirection: null,
			startX: 0,
			startY: 0,
			startWidth: 0,
			startHeight: 0,
			startLeft: 0,
			startTop: 0
		};

		// Bound methods for event listeners
		this.boundHandlers = {
			mouseMove: this.handleMouseMove.bind(this),
			mouseUp: this.handleMouseUp.bind(this),
			touchMove: this.handleTouchMove.bind(this),
			touchEnd: this.handleTouchEnd.bind(this),
			keyDown: this.handleKeyDown.bind(this),
			resize: this.handleWindowResize.bind(this)
		};

		this.resizeHandles = new Map();
		this.isInitialized = false;

		logger.info('🔧 ModalResizeUtility created for modal:', this.config.persistKey);
	}

	/**
	 * Initialize the resize utility
	 */
	initialize() {
		if (this.isInitialized) {
			logger.warn('⚠️ ModalResizeUtility already initialized');
			return;
		}

		try {
			this.createResizeHandles();
			this.setupEventListeners();
			this.restoreModalSize();
			this.addAccessibilityFeatures();
			this.addResponsiveSupport();

			this.isInitialized = true;
			logger.info('✅ ModalResizeUtility initialized successfully');
		} catch (error) {
			logger.error('❌ Failed to initialize ModalResizeUtility:', error);
			throw error;
		}
	}

	/**
	 * Create resize handles based on configuration
	 */
	createResizeHandles() {
		const handleConfigs = {
			left: {cursor: 'ew-resize', position: 'left: 0; top: 0; bottom: 0; width: {size}px;'},
			right: {cursor: 'ew-resize', position: 'right: 0; top: 0; bottom: 0; width: {size}px;'},
			top: {cursor: 'ns-resize', position: 'top: 0; left: 0; right: 0; height: {size}px;'},
			bottom: {cursor: 'ns-resize', position: 'bottom: 0; left: 0; right: 0; height: {size}px;'},
			corner: {
				cursor: 'nw-resize',
				position: 'bottom: 0; right: 0; width: {cornerSize}px; height: {cornerSize}px;'
			}
		};

		// Add CSS for resize handles if not already present
		this.addResizeStyles();

		for (const direction of this.config.directions) {
			if (!handleConfigs[direction]) {
				logger.warn(`⚠️ Unknown resize direction: ${direction}`);
				continue;
			}

			const handle = this.createResizeHandle(direction, handleConfigs[direction]);
			this.resizeHandles.set(direction, handle);
			this.modalDialog.appendChild(handle);
		}
	}

	/**
	 * Create individual resize handle
	 */
	createResizeHandle(direction, config) {
		const handle = document.createElement('div');
		handle.className = `modal-resize-handle modal-resize-${direction}`;
		handle.setAttribute('data-direction', direction);
		handle.setAttribute('role', 'button');
		handle.setAttribute('tabindex', '0');
		handle.setAttribute('aria-label', `Resize modal ${direction}`);
		handle.title = `Drag to resize modal ${direction}`;

		// Apply positioning styles
		const size = direction === 'corner' ? this.config.cornerSize : this.config.handleSize;
		const positionStyle = config.position
			.replace('{size}', size)
			.replace('{cornerSize}', this.config.cornerSize);

		handle.style.cssText = `
            position: absolute;
            ${positionStyle}
            cursor: ${config.cursor};
            z-index: 1000;
            background: transparent;
            transition: background-color 0.2s ease;
        `;

		// Add visual feedback on hover
		handle.addEventListener('mouseenter', () => {
			handle.style.backgroundColor = 'rgba(0, 123, 255, 0.1)';
			if (direction === 'corner') {
				handle.style.borderLeft = '2px solid #007bff';
				handle.style.borderTop = '2px solid #007bff';
			} else if (['left', 'right'].includes(direction)) {
				handle.style.borderLeft = '2px solid #007bff';
			} else {
				handle.style.borderTop = '2px solid #007bff';
			}
		});

		handle.addEventListener('mouseleave', () => {
			if (!this.state.isResizing) {
				handle.style.backgroundColor = 'transparent';
				handle.style.border = 'none';
			}
		});

		// Mouse events
		handle.addEventListener('mousedown', e => this.startResize(e, direction));

		// Touch events
		if (this.config.enableTouch) {
			handle.addEventListener('touchstart', e => this.startResize(e, direction), {
				passive: false
			});
		}

		// Keyboard events
		if (this.config.enableKeyboard) {
			handle.addEventListener('keydown', e => this.handleKeyDown(e, direction));
		}

		return handle;
	}

	/**
	 * Add CSS styles for resize functionality
	 */
	addResizeStyles() {
		const styleId = 'modal-resize-utility-styles';
		if (document.getElementById(styleId)) {
			return; // Styles already added
		}

		const style = document.createElement('style');
		style.id = styleId;
		style.textContent = `
            .modal-dialog.resizing {
                transition: none !important;
                user-select: none;
                pointer-events: auto;
            }

            .modal-dialog.resizing .modal-content {
                pointer-events: none;
            }

            .modal-dialog.resizing .modal-resize-handle {
                pointer-events: auto;
            }

            .modal-resize-handle:focus {
                outline: 2px solid #007bff;
                outline-offset: 2px;
                background-color: rgba(0, 123, 255, 0.2) !important;
            }

            .modal-resize-corner::after {
                content: '';
                position: absolute;
                bottom: 2px;
                right: 2px;
                width: 0;
                height: 0;
                border-left: 8px solid transparent;
                border-bottom: 8px solid #6c757d;
                opacity: 0.5;
                pointer-events: none;
            }

            .modal-resize-corner:hover::after {
                border-bottom-color: #007bff;
                opacity: 0.8;
            }

            @media (max-width: 768px) {
                .modal-resize-handle {
                    display: none !important;
                }
            }

            @media (prefers-reduced-motion: reduce) {
                .modal-dialog {
                    transition: none !important;
                }
            }
        `;

		document.head.appendChild(style);
	}

	/**
	 * Setup global event listeners
	 */
	setupEventListeners() {
		// Global mouse/touch events for resizing
		document.addEventListener('mousemove', this.boundHandlers.mouseMove, {passive: false});
		document.addEventListener('mouseup', this.boundHandlers.mouseUp);

		if (this.config.enableTouch) {
			document.addEventListener('touchmove', this.boundHandlers.touchMove, {passive: false});
			document.addEventListener('touchend', this.boundHandlers.touchEnd);
		}

		// Window resize handling
		window.addEventListener('resize', this.boundHandlers.resize);

		// Modal-specific keyboard events
		if (this.config.enableKeyboard) {
			this.modalElement.addEventListener('keydown', this.boundHandlers.keyDown);
		}
	}

	/**
	 * Start resize operation
	 */
	startResize(event, direction) {
		event.preventDefault();
		event.stopPropagation();

		const clientX = event.clientX || event.touches?.[0]?.clientX || 0;
		const clientY = event.clientY || event.touches?.[0]?.clientY || 0;

		const rect = this.modalDialog.getBoundingClientRect();

		this.state = {
			isResizing: true,
			resizeDirection: direction,
			startX: clientX,
			startY: clientY,
			startWidth: rect.width,
			startHeight: rect.height,
			startLeft: rect.left,
			startTop: rect.top
		};

		// Visual feedback
		this.modalDialog.classList.add('resizing');
		document.body.style.cursor = this.getCursorForDirection(direction);
		document.body.style.userSelect = 'none';

		// Emit resize start event
		this.emitResizeEvent('resize-start', {direction, dimensions: rect});

		logger.debug('🔧 Started resizing modal:', direction);
	}

	/**
	 * Handle mouse move during resize
	 */
	handleMouseMove(event) {
		if (!this.state.isResizing) {
			return;
		}

		event.preventDefault();
		this.performResize(event.clientX, event.clientY);
	}

	/**
	 * Handle touch move during resize
	 */
	handleTouchMove(event) {
		if (!this.state.isResizing) {
			return;
		}

		event.preventDefault();
		const touch = event.touches[0];
		this.performResize(touch.clientX, touch.clientY);
	}

	/**
	 * Perform the actual resize calculation and application
	 */
	performResize(clientX, clientY) {
		const {resizeDirection, startX, startY, startWidth, startHeight} = this.state;

		let newWidth = startWidth;
		let newHeight = startHeight;

		const deltaX = clientX - startX;
		const deltaY = clientY - startY;

		// Calculate new dimensions based on resize direction
		switch (resizeDirection) {
			case 'right':
				newWidth = startWidth + deltaX;
				break;
			case 'left':
				newWidth = startWidth - deltaX;
				break;
			case 'bottom':
				newHeight = startHeight + deltaY;
				break;
			case 'top':
				newHeight = startHeight - deltaY;
				break;
			case 'corner':
				newWidth = startWidth + deltaX;
				newHeight = startHeight + deltaY;
				break;
		}

		// Apply constraints
		newWidth = Math.max(this.config.minWidth, Math.min(this.config.maxWidth, newWidth));
		newHeight = Math.max(this.config.minHeight, Math.min(this.config.maxHeight, newHeight));

		// Apply snap-to-edge behavior
		if (this.config.snapThreshold > 0) {
			const viewport = {width: window.innerWidth, height: window.innerHeight};

			if (Math.abs(newWidth - viewport.width * 0.5) < this.config.snapThreshold) {
				newWidth = viewport.width * 0.5;
			}
			if (Math.abs(newHeight - viewport.height * 0.5) < this.config.snapThreshold) {
				newHeight = viewport.height * 0.5;
			}
		}

		// Apply new dimensions
		this.applyDimensions(newWidth, newHeight);

		// Emit resize event
		this.emitResizeEvent('resize', {
			direction: resizeDirection,
			dimensions: {width: newWidth, height: newHeight}
		});
	}

	/**
	 * Apply dimensions to modal
	 */
	applyDimensions(width, height) {
		this.modalDialog.style.width = `${width}px`;
		this.modalDialog.style.height = `${height}px`;
		this.modalDialog.style.maxWidth = `${width}px`;
		this.modalDialog.style.maxHeight = `${height}px`;
	}

	/**
	 * Handle mouse up - end resize
	 */
	handleMouseUp(event) {
		if (!this.state.isResizing) {
			return;
		}

		this.endResize();
	}

	/**
	 * Handle touch end - end resize
	 */
	handleTouchEnd(event) {
		if (!this.state.isResizing) {
			return;
		}

		this.endResize();
	}

	/**
	 * End resize operation
	 */
	endResize() {
		if (!this.state.isResizing) {
			return;
		}

		const finalDimensions = {
			width: parseInt(this.modalDialog.style.width),
			height: parseInt(this.modalDialog.style.height)
		};

		// Clean up visual feedback
		this.modalDialog.classList.remove('resizing');
		document.body.style.cursor = '';
		document.body.style.userSelect = '';

		// Clear resize handle hover states
		this.resizeHandles.forEach(handle => {
			handle.style.backgroundColor = 'transparent';
			handle.style.border = 'none';
		});

		// Save dimensions
		this.saveModalSize(finalDimensions);

		// Emit resize end event
		this.emitResizeEvent('resize-end', {
			direction: this.state.resizeDirection,
			dimensions: finalDimensions
		});

		// Reset state
		this.state.isResizing = false;
		this.state.resizeDirection = null;

		logger.debug('🔧 Ended resizing modal:', finalDimensions);
	}

	/**
	 * Handle keyboard resize
	 */
	handleKeyDown(event, direction = null) {
		// Handle keyboard shortcuts for resizing
		if (event.ctrlKey || event.metaKey) {
			switch (event.key) {
				case 'r':
				case 'R':
					event.preventDefault();
					this.resetToDefaultSize();
					break;
				case '=':
				case '+':
					event.preventDefault();
					this.adjustSize(50, 50);
					break;
				case '-':
					event.preventDefault();
					this.adjustSize(-50, -50);
					break;
			}
			return;
		}

		// Handle arrow keys for focused resize handles
		if (direction && event.target.classList.contains('modal-resize-handle')) {
			const step = event.shiftKey ? 20 : 5;
			let deltaX = 0,
				deltaY = 0;

			switch (event.key) {
				case 'ArrowRight':
					deltaX = step;
					break;
				case 'ArrowLeft':
					deltaX = -step;
					break;
				case 'ArrowDown':
					deltaY = step;
					break;
				case 'ArrowUp':
					deltaY = -step;
					break;
				case 'Enter':
				case ' ':
					// Toggle resize mode or reset
					event.preventDefault();
					this.resetToDefaultSize();
					return;
				default:
					return;
			}

			event.preventDefault();
			this.adjustSizeByDirection(direction, deltaX, deltaY);
		}
	}

	/**
	 * Adjust size by specific direction
	 */
	adjustSizeByDirection(direction, deltaX, deltaY) {
		const rect = this.modalDialog.getBoundingClientRect();
		let newWidth = rect.width;
		let newHeight = rect.height;

		switch (direction) {
			case 'right':
			case 'left':
				newWidth += deltaX;
				break;
			case 'bottom':
			case 'top':
				newHeight += deltaY;
				break;
			case 'corner':
				newWidth += deltaX;
				newHeight += deltaY;
				break;
		}

		// Apply constraints
		newWidth = Math.max(this.config.minWidth, Math.min(this.config.maxWidth, newWidth));
		newHeight = Math.max(this.config.minHeight, Math.min(this.config.maxHeight, newHeight));

		this.applyDimensions(newWidth, newHeight);
		this.saveModalSize({width: newWidth, height: newHeight});
	}

	/**
	 * Adjust modal size by delta values
	 */
	adjustSize(deltaWidth, deltaHeight) {
		const rect = this.modalDialog.getBoundingClientRect();
		const newWidth = Math.max(
			this.config.minWidth,
			Math.min(this.config.maxWidth, rect.width + deltaWidth)
		);
		const newHeight = Math.max(
			this.config.minHeight,
			Math.min(this.config.maxHeight, rect.height + deltaHeight)
		);

		this.applyDimensions(newWidth, newHeight);
		this.saveModalSize({width: newWidth, height: newHeight});
	}

	/**
	 * Reset modal to default size
	 */
	resetToDefaultSize() {
		const defaultWidth = this.config.defaultWidth || 600;
		const defaultHeight = this.config.defaultHeight || 400;

		this.applyDimensions(defaultWidth, defaultHeight);
		this.saveModalSize({width: defaultWidth, height: defaultHeight});

		// Show feedback
		this.emitResizeEvent('reset', {
			dimensions: {width: defaultWidth, height: defaultHeight}
		});

		logger.info('🔧 Modal size reset to default');
	}

	/**
	 * Handle window resize - adjust modal if needed
	 */
	handleWindowResize() {
		const rect = this.modalDialog.getBoundingClientRect();
		const viewport = {width: window.innerWidth, height: window.innerHeight};

		let needsAdjustment = false;
		let newWidth = rect.width;
		let newHeight = rect.height;

		// Ensure modal fits in viewport
		if (rect.width > viewport.width * 0.95) {
			newWidth = viewport.width * 0.95;
			needsAdjustment = true;
		}
		if (rect.height > viewport.height * 0.95) {
			newHeight = viewport.height * 0.95;
			needsAdjustment = true;
		}

		if (needsAdjustment) {
			this.applyDimensions(newWidth, newHeight);
		}
	}

	/**
	 * Get cursor style for resize direction
	 */
	getCursorForDirection(direction) {
		const cursors = {
			left: 'ew-resize',
			right: 'ew-resize',
			top: 'ns-resize',
			bottom: 'ns-resize',
			corner: 'nw-resize'
		};
		return cursors[direction] || 'default';
	}

	/**
	 * Save modal size to localStorage
	 */
	saveModalSize(dimensions) {
		try {
			const key = `${this.config.persistKey}_dimensions`;
			localStorage.setItem(key, JSON.stringify(dimensions));
		} catch (error) {
			logger.warn('⚠️ Failed to save modal dimensions:', error);
		}
	}

	/**
	 * Restore modal size from localStorage
	 */
	restoreModalSize() {
		try {
			const key = `${this.config.persistKey}_dimensions`;
			const saved = localStorage.getItem(key);

			if (saved) {
				const dimensions = JSON.parse(saved);
				this.applyDimensions(dimensions.width, dimensions.height);
				logger.debug('🔧 Restored modal size:', dimensions);
			}
		} catch (error) {
			logger.warn('⚠️ Failed to restore modal dimensions:', error);
		}
	}

	/**
	 * Add accessibility features
	 * ARCHITECTURE FIX: Prevent duplicate indicators
	 */
	addAccessibilityFeatures() {
		// Add ARIA labels and descriptions
		this.modalDialog.setAttribute('aria-describedby', 'modal-resize-instructions');

		// Create instructions element if not exists
		let instructions = this.modalElement.querySelector('#modal-resize-instructions');
		if (!instructions) {
			instructions = document.createElement('div');
			instructions.id = 'modal-resize-instructions';
			instructions.className = 'sr-only';
			instructions.textContent =
				'Use Ctrl+R to reset size, Ctrl+Plus to increase, Ctrl+Minus to decrease. Use arrow keys on resize handles for precise adjustment.';
			this.modalElement.appendChild(instructions);
		}

		// Check for existing indicators (from ModalEnhancementMixin or previous calls)
		const header = this.modalElement.querySelector('.modal-header');
		if (header) {
			const existingIndicator = header.querySelector('.modal-enhancement-indicator, .resize-hint');
			if (!existingIndicator) {
				// Only add if no indicator exists
				const hint = document.createElement('small');
				hint.className = 'text-muted resize-hint ms-2';
				hint.innerHTML = '<i class="bi bi-arrows-expand me-1"></i>Resizable • Ctrl+R to reset';
				header.appendChild(hint);
			}
		}
	}

	/**
	 * Add responsive support
	 */
	addResponsiveSupport() {
		// Hide resize handles on mobile
		const mediaQuery = window.matchMedia('(max-width: 768px)');

		const handleMediaChange = e => {
			this.resizeHandles.forEach(handle => {
				handle.style.display = e.matches ? 'none' : '';
			});
		};

		mediaQuery.addListener(handleMediaChange);
		handleMediaChange(mediaQuery); // Initial check
	}

	/**
	 * Emit resize events for external listeners
	 */
	emitResizeEvent(type, data) {
		const event = new CustomEvent(`modal-${type}`, {
			detail: {
				modalId: this.config.persistKey,
				...data
			}
		});

		this.modalElement.dispatchEvent(event);
	}

	/**
	 * Destroy the resize utility and clean up
	 */
	destroy() {
		if (!this.isInitialized) {
			return;
		}

		// Remove event listeners
		document.removeEventListener('mousemove', this.boundHandlers.mouseMove);
		document.removeEventListener('mouseup', this.boundHandlers.mouseUp);
		document.removeEventListener('touchmove', this.boundHandlers.touchMove);
		document.removeEventListener('touchend', this.boundHandlers.touchEnd);
		window.removeEventListener('resize', this.boundHandlers.resize);

		if (this.modalElement) {
			this.modalElement.removeEventListener('keydown', this.boundHandlers.keyDown);
		}

		// Remove resize handles
		this.resizeHandles.forEach(handle => {
			if (handle.parentNode) {
				handle.parentNode.removeChild(handle);
			}
		});
		this.resizeHandles.clear();

		// Remove instructions
		const instructions = this.modalElement?.querySelector('#modal-resize-instructions');
		if (instructions) {
			instructions.remove();
		}

		// Reset state
		this.isInitialized = false;
		this.state.isResizing = false;

		logger.info('🗑️ ModalResizeUtility destroyed');
	}

	/**
	 * Get current modal dimensions
	 */
	getDimensions() {
		const rect = this.modalDialog.getBoundingClientRect();
		return {
			width: rect.width,
			height: rect.height
		};
	}

	/**
	 * Set modal dimensions programmatically
	 */
	setDimensions(width, height) {
		const constrainedWidth = Math.max(this.config.minWidth, Math.min(this.config.maxWidth, width));
		const constrainedHeight = Math.max(
			this.config.minHeight,
			Math.min(this.config.maxHeight, height)
		);

		this.applyDimensions(constrainedWidth, constrainedHeight);
		this.saveModalSize({width: constrainedWidth, height: constrainedHeight});

		return {width: constrainedWidth, height: constrainedHeight};
	}
}
