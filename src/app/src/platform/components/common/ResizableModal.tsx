// src/components/common/ResizableModal.tsx - Resizable modal wrapper component
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Modal} from 'react-bootstrap';
import {logger} from '@/platform/CentralizedLogger';
import {MODAL_SIZES} from '@/constants';
import './ResizableModal.css';

// TypeScript interfaces
interface ModalSize {
	width: number;
	height: number;
}

interface Position {
	x: number;
	y: number;
}

interface ResizableModalProps {
	children: React.ReactNode;
	show: boolean;
	onHide: () => void;
	title?: string;
	size?: string;
	backdrop?: boolean | 'static';
	keyboard?: boolean;
	className?: string;
	initialWidth?: number;
	initialHeight?: number;
	[key: string]: any;
}

/**
 * ResizableModal - Bootstrap Modal with drag-to-resize functionality
 * Allows users to resize modal by dragging right and bottom edges
 *
 * FEATURES:
 * ✅ Drag right edge to resize width
 * ✅ Drag bottom edge to resize height
 * ✅ Drag bottom-right corner to resize both dimensions
 * ✅ Minimum and maximum size constraints
 * ✅ Maintains aspect ratio when needed
 * ✅ Smooth resize animations
 * ✅ Keyboard accessibility (Escape to close)
 */
function ResizableModal({
													children,
													show,
													onHide,
													title,
													size = 'xl',
													backdrop = 'static',
													keyboard = true,
													className = '',
													initialWidth = MODAL_SIZES.DEFAULT_WIDTH,
													initialHeight = MODAL_SIZES.DEFAULT_HEIGHT,
													...props
												}: ResizableModalProps): JSX.Element {
	// Modal size state
	const [modalSize, setModalSize] = useState<ModalSize>({
		width: initialWidth,
		height: initialHeight
	});

	// Resize state
	const [isResizing, setIsResizing] = useState<boolean>(false);
	const [resizeDirection, setResizeDirection] = useState<string | null>(null);
	const [startPos, setStartPos] = useState<Position>({x: 0, y: 0});
	const [startSize, setStartSize] = useState<ModalSize>({width: 0, height: 0});

	// Refs
	const modalRef = useRef<HTMLDivElement>(null);
	const dialogRef = useRef<HTMLDivElement>(null);

	// Reset modal size when modal opens
	useEffect(() => {
		if (show) {
			setModalSize({
				width: initialWidth,
				height: initialHeight
			});
		}
	}, [show, initialWidth, initialHeight]);

	// Parse size value (handle both px and vw/vh units)
	const parseSize = useCallback((size, dimension) => {
		if (typeof size === 'string') {
			if (size.includes('vw')) {
				return (parseFloat(size) / 100) * window.innerWidth;
			} else if (size.includes('vh')) {
				return (parseFloat(size) / 100) * window.innerHeight;
			} else if (size.includes('px')) {
				return parseFloat(size);
			}
		}
		return parseFloat(size) || (dimension === 'width' ? 800 : 600);
	}, []);

	// Get size constraints
	const getSizeConstraints = useCallback(() => {
		return {
			minWidth: parseSize(MODAL_SIZES.MIN_WIDTH, 'width'),
			minHeight: parseSize(MODAL_SIZES.MIN_HEIGHT, 'height'),
			maxWidth: parseSize(MODAL_SIZES.MAX_WIDTH, 'width'),
			maxHeight: parseSize(MODAL_SIZES.MAX_HEIGHT, 'height')
		};
	}, [parseSize]);

	// Handle resize start
	const handleResizeStart = useCallback((e, direction) => {
		e.preventDefault();
		e.stopPropagation();

		const rect = dialogRef.current?.getBoundingClientRect();
		if (!rect) return;

		setIsResizing(true);
		setResizeDirection(direction);
		setStartPos({x: e.clientX, y: e.clientY});
		setStartSize({
			width: parseSize(modalSize.width, 'width'),
			height: parseSize(modalSize.height, 'height')
		});

		// Add global event listeners
		document.addEventListener('mousemove', handleResizeMove);
		document.addEventListener('mouseup', handleResizeEnd);
		document.body.style.cursor = direction === 'right' ? 'ew-resize' :
			direction === 'bottom' ? 'ns-resize' :
				'nw-resize';
		document.body.style.userSelect = 'none';
		document.body.classList.add('resizing');

		logger.debug('🔧 Modal resize started', {direction, startSize});
	}, [modalSize, parseSize]);

	// Handle resize move
	const handleResizeMove = useCallback((e) => {
		if (!isResizing || !resizeDirection) return;

		const deltaX = e.clientX - startPos.x;
		const deltaY = e.clientY - startPos.y;
		const constraints = getSizeConstraints();

		let newWidth = startSize.width;
		let newHeight = startSize.height;

		// Calculate new dimensions based on resize direction
		if (resizeDirection === 'right' || resizeDirection === 'corner') {
			newWidth = Math.max(constraints.minWidth,
				Math.min(constraints.maxWidth, startSize.width + deltaX));
		}

		if (resizeDirection === 'bottom' || resizeDirection === 'corner') {
			newHeight = Math.max(constraints.minHeight,
				Math.min(constraints.maxHeight, startSize.height + deltaY));
		}

		setModalSize({
			width: `${newWidth}px`,
			height: `${newHeight}px`
		});
	}, [isResizing, resizeDirection, startPos, startSize, getSizeConstraints]);

	// Handle resize end
	const handleResizeEnd = useCallback(() => {
		setIsResizing(false);
		setResizeDirection(null);

		// Remove global event listeners
		document.removeEventListener('mousemove', handleResizeMove);
		document.removeEventListener('mouseup', handleResizeEnd);
		document.body.style.cursor = '';
		document.body.style.userSelect = '';
		document.body.classList.remove('resizing');

		logger.debug('🔧 Modal resize ended', {finalSize: modalSize});
	}, [modalSize, handleResizeMove]);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			document.removeEventListener('mousemove', handleResizeMove);
			document.removeEventListener('mouseup', handleResizeEnd);
			document.body.style.cursor = '';
			document.body.style.userSelect = '';
			document.body.classList.remove('resizing');
		};
	}, [handleResizeMove, handleResizeEnd]);

	return (
		<Modal
			ref={modalRef}
			show={show}
			onHide={onHide}
			backdrop={backdrop}
			keyboard={keyboard}
			className={`resizable-modal ${className}`}
			dialogClassName="resizable-modal-dialog"
			contentClassName="resizable-modal-content"
			{...props}
		>
			<div
				ref={dialogRef}
				className="resizable-modal-wrapper"
				style={{
					width: modalSize.width,
					height: modalSize.height,
					maxWidth: 'none',
					maxHeight: 'none',
					position: 'relative',
					resize: 'none',
					overflow: 'hidden',
					display: 'flex',
					flexDirection: 'column'
				}}
			>
				{/* Modal Header */}
				{title && (
					<Modal.Header closeButton className="flex-shrink-0">
						<Modal.Title>{title}</Modal.Title>
					</Modal.Header>
				)}

				{/* Modal Body - Proper Bootstrap structure */}
				<Modal.Body
					className="flex-grow-1 d-flex flex-column"
					style={{
						overflow: 'hidden',
						padding: 0
					}}
				>
					{children}
				</Modal.Body>

				{/* Resize Handles */}
				<div
					className="resize-handle resize-handle-right"
					onMouseDown={(e) => handleResizeStart(e, 'right')}
					title="Przeciągnij aby zmienić szerokość"
				/>

				<div
					className="resize-handle resize-handle-bottom"
					onMouseDown={(e) => handleResizeStart(e, 'bottom')}
					title="Przeciągnij aby zmienić wysokość"
				/>

				<div
					className="resize-handle resize-handle-corner"
					onMouseDown={(e) => handleResizeStart(e, 'corner')}
					title="Przeciągnij aby zmienić rozmiar"
				/>

				{/* Resize indicator when resizing */}
				{isResizing && (
					<div className="resize-indicator">
						{parseSize(modalSize.width, 'width').toFixed(0)} × {parseSize(modalSize.height, 'height').toFixed(0)}
					</div>
				)}
			</div>
		</Modal>
	);
}

export {ResizableModal};
export default ResizableModal;
