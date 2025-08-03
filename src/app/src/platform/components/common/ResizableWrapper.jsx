// src/components/common/ResizableWrapper.jsx - Clean resizable wrapper without modal nesting
import {useCallback, useEffect, useRef, useState} from 'react';
import {logger} from '@/platform/CentralizedLogger';
import {MODAL_SIZES} from '@/constants';

/**
 * ResizableWrapper - Clean resizable functionality without modal nesting
 * Provides drag-to-resize functionality for any content without creating modal-in-modal issues
 *
 * ARCHITECTURE COMPLIANCE:
 * ✅ No modal nesting - pure resize functionality
 * ✅ Bootstrap-agnostic - works with any container
 * ✅ Clean separation of concerns
 * ✅ Constants-driven configuration
 * ✅ Proper event cleanup
 */
function ResizableWrapper({
														children,
														className = '',
														initialWidth = MODAL_SIZES.DEFAULT_WIDTH,
														initialHeight = MODAL_SIZES.DEFAULT_HEIGHT,
														minWidth = MODAL_SIZES.MIN_WIDTH,
														minHeight = MODAL_SIZES.MIN_HEIGHT,
														maxWidth = MODAL_SIZES.MAX_WIDTH,
														maxHeight = MODAL_SIZES.MAX_HEIGHT,
														onResize,
														disabled = false,
														...props
													}) {
	// Resize state
	const [size, setSize] = useState({
		width: initialWidth,
		height: initialHeight
	});
	const [isResizing, setIsResizing] = useState(false);
	const [resizeDirection, setResizeDirection] = useState(null);
	const [startPos, setStartPos] = useState({x: 0, y: 0});
	const [startSize, setStartSize] = useState({width: 0, height: 0});

	// Refs
	const containerRef = useRef(null);

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
			minWidth: parseSize(minWidth, 'width'),
			minHeight: parseSize(minHeight, 'height'),
			maxWidth: parseSize(maxWidth, 'width'),
			maxHeight: parseSize(maxHeight, 'height')
		};
	}, [parseSize, minWidth, minHeight, maxWidth, maxHeight]);

	// Handle resize start
	const handleResizeStart = useCallback((e, direction) => {
		if (disabled) return;

		e.preventDefault();
		e.stopPropagation();

		const rect = containerRef.current?.getBoundingClientRect();
		if (!rect) return;

		setIsResizing(true);
		setResizeDirection(direction);
		setStartPos({x: e.clientX, y: e.clientY});
		setStartSize({
			width: parseSize(size.width, 'width'),
			height: parseSize(size.height, 'height')
		});

		// Add global event listeners
		document.addEventListener('mousemove', handleResizeMove);
		document.addEventListener('mouseup', handleResizeEnd);
		document.body.style.cursor = direction === 'right' ? 'ew-resize' :
			direction === 'bottom' ? 'ns-resize' :
				'nw-resize';
		document.body.style.userSelect = 'none';

		logger.debug('🔧 Resize started', {direction, startSize});
	}, [disabled, size, parseSize]);

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

		const newSize = {
			width: `${newWidth}px`,
			height: `${newHeight}px`
		};

		setSize(newSize);

		// Call onResize callback if provided
		if (onResize) {
			onResize(newSize);
		}
	}, [isResizing, resizeDirection, startPos, startSize, getSizeConstraints, onResize]);

	// Handle resize end
	const handleResizeEnd = useCallback(() => {
		setIsResizing(false);
		setResizeDirection(null);

		// Remove global event listeners
		document.removeEventListener('mousemove', handleResizeMove);
		document.removeEventListener('mouseup', handleResizeEnd);
		document.body.style.cursor = '';
		document.body.style.userSelect = '';

		logger.debug('🔧 Resize ended', {finalSize: size});
	}, [size, handleResizeMove]);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			document.removeEventListener('mousemove', handleResizeMove);
			document.removeEventListener('mouseup', handleResizeEnd);
			document.body.style.cursor = '';
			document.body.style.userSelect = '';
		};
	}, [handleResizeMove, handleResizeEnd]);

	return (
		<div
			ref={containerRef}
			className={`resizable-wrapper ${className}`}
			style={{
				width: size.width,
				height: size.height,
				position: 'relative',
				overflow: 'hidden',
				...props.style
			}}
			{...props}
		>
			{/* Content */}
			<div className="resizable-content" style={{width: '100%', height: '100%'}}>
				{children}
			</div>

			{/* Resize Handles - Only show if not disabled */}
			{!disabled && (
				<>
					{/* Right edge handle */}
					<div
						className="resize-handle resize-handle-right"
						onMouseDown={(e) => handleResizeStart(e, 'right')}
						style={{
							position: 'absolute',
							top: 0,
							right: 0,
							width: '8px',
							height: '100%',
							cursor: 'ew-resize',
							backgroundColor: 'transparent',
							zIndex: 1000
						}}
						title="Przeciągnij aby zmienić szerokość"
					/>

					{/* Bottom edge handle */}
					<div
						className="resize-handle resize-handle-bottom"
						onMouseDown={(e) => handleResizeStart(e, 'bottom')}
						style={{
							position: 'absolute',
							bottom: 0,
							left: 0,
							width: '100%',
							height: '8px',
							cursor: 'ns-resize',
							backgroundColor: 'transparent',
							zIndex: 1000
						}}
						title="Przeciągnij aby zmienić wysokość"
					/>

					{/* Bottom-right corner handle */}
					<div
						className="resize-handle resize-handle-corner"
						onMouseDown={(e) => handleResizeStart(e, 'corner')}
						style={{
							position: 'absolute',
							bottom: 0,
							right: 0,
							width: '16px',
							height: '16px',
							cursor: 'nw-resize',
							backgroundColor: 'rgba(0, 0, 0, 0.1)',
							borderLeft: '2px solid #dee2e6',
							borderTop: '2px solid #dee2e6',
							zIndex: 1001
						}}
						title="Przeciągnij aby zmienić rozmiar"
					/>

					{/* Resize indicator when resizing */}
					{isResizing && (
						<div
							className="resize-indicator"
							style={{
								position: 'absolute',
								top: '10px',
								right: '10px',
								background: 'rgba(0, 0, 0, 0.8)',
								color: 'white',
								padding: '4px 8px',
								borderRadius: '4px',
								fontSize: '12px',
								fontFamily: 'monospace',
								zIndex: 1002,
								pointerEvents: 'none'
							}}
						>
							{parseSize(size.width, 'width').toFixed(0)} × {parseSize(size.height, 'height').toFixed(0)}
						</div>
					)}
				</>
			)}
		</div>
	);
}

export default ResizableWrapper;
