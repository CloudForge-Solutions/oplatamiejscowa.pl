// src/platform/components/common/DragDropUploadArea.tsx
// Enhanced drag-and-drop upload area with react-dropzone integration
// ARCHITECTURAL COMPLIANCE: Single responsibility for file upload UI with proper error handling

import React, {useCallback, useEffect, useState} from 'react';
import {useDropzone} from 'react-dropzone';
import {logger} from '@/platform/CentralizedLogger';
import { FileInput } from '@/apps/records/components/uploads/components/FileInput.tsx';

// TypeScript interfaces
interface DragDropConfig {
	ACCEPTED_TYPES: string[];
	ACCEPTED_EXTENSIONS: string[];
	MAX_FILE_SIZE: number;
}

interface Messages {
	INVALID_FILE_TYPE: string;
	FILE_TOO_LARGE: string;
	DROP_FILES_HERE: string;
	OR_CLICK_TO_SELECT: string;
	DRAG_ACTIVE: string;
}

interface DragDropUploadAreaProps {
	onFilesSelected: (files: File[], recordType?: string) => void;
	recordType?: string;
	className?: string;
	disabled?: boolean;
	messages?: Partial<Messages>;
	maxFiles?: number;
	showFileList?: boolean;
}

interface FileValidationError {
	fileName: string;
	error: string;
}

// Configuration constants
const DRAG_DROP_CONFIG: DragDropConfig = {
	ACCEPTED_TYPES: ['application/pdf'],
	ACCEPTED_EXTENSIONS: ['.pdf'],
	MAX_FILE_SIZE: 50 * 1024 * 1024 // 50MB
};

const DEFAULT_MESSAGES: Messages = {
	INVALID_FILE_TYPE: 'Obsługiwane są tylko pliki PDF',
	FILE_TOO_LARGE: 'Plik jest za duży (maksymalnie 50MB)',
	DROP_FILES_HERE: 'Przeciągnij pliki tutaj',
	OR_CLICK_TO_SELECT: 'lub kliknij, aby wybrać',
	DRAG_ACTIVE: 'Upuść pliki tutaj'
};

/**
 * Enhanced DragDropUploadArea component with react-dropzone integration
 * ARCHITECTURAL COMPLIANCE: Single responsibility for file upload UI
 * CRITICAL FIXES: Robust file validation and corruption handling
 */
export const DragDropUploadArea: React.FC<DragDropUploadAreaProps> = ({
	onFilesSelected,
	recordType = 'general',
	className = '',
	disabled = false,
	messages: customMessages = {},
	maxFiles = 10,
	showFileList = true
}) => {
	// State management
	const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
	const [validationErrors, setValidationErrors] = useState<FileValidationError[]>([]);
	const [isProcessing, setIsProcessing] = useState<boolean>(false);

	// Merge messages
	const messages: Messages = {...DEFAULT_MESSAGES, ...customMessages};

	// React-dropzone configuration and handlers
	const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
		logger.info(`📁 Files dropped: ${acceptedFiles.length} accepted, ${rejectedFiles.length} rejected`);

		if (rejectedFiles.length > 0) {
			const errors: FileValidationError[] = rejectedFiles.map(rejection => ({
				fileName: rejection.file.name,
				error: rejection.errors.map((e: any) => e.message).join(', ')
			}));
			setValidationErrors(errors);
			logger.warn('❌ File validation errors:', errors);
		}

		if (acceptedFiles.length > 0) {
			handleValidFiles(acceptedFiles);
		}
	}, [recordType, onFilesSelected]);

	const {
		getRootProps,
		getInputProps,
		isDragActive,
		isDragAccept,
		isDragReject
	} = useDropzone({
		onDrop,
		accept: {
			'application/pdf': DRAG_DROP_CONFIG.ACCEPTED_EXTENSIONS
		},
		maxSize: DRAG_DROP_CONFIG.MAX_FILE_SIZE,
		maxFiles,
		disabled,
		multiple: true
	});

	/**
	 * Handle valid files after dropzone validation
	 * ARCHITECTURAL FIX: Simplified validation since react-dropzone handles basic validation
	 */
	const handleValidFiles = useCallback((files: File[]) => {
		try {
			setIsProcessing(true);
			setValidationErrors([]);

			// Additional custom validation if needed
			const validFiles: File[] = [];
			const errors: FileValidationError[] = [];

			files.forEach(file => {
				// CRITICAL: Validate file object integrity
				if (!file || typeof file !== 'object' || !file.name || typeof file.size !== 'number') {
					errors.push({
						fileName: file?.name || 'Unknown',
						error: 'Invalid file object'
					});
					return;
				}

				// Clean filename to handle corruption (VPN issues)
				let cleanName = String(file.name).trim();
				if (cleanName.includes('.pdf') && cleanName.length > cleanName.indexOf('.pdf') + 4) {
					const pdfIndex = cleanName.toLowerCase().indexOf('.pdf');
					if (pdfIndex !== -1) {
						cleanName = cleanName.substring(0, pdfIndex + 4);
					}
				}

				// File passed all validations
				validFiles.push(file);
				logger.debug(`✅ File validated: ${cleanName} (${file.size} bytes)`);
			});

			// Update state
			if (errors.length > 0) {
				setValidationErrors(errors);
				logger.warn('❌ File validation errors:', errors);
			}

			if (validFiles.length > 0) {
				setSelectedFiles(prev => [...prev, ...validFiles]);
				onFilesSelected(validFiles, recordType);
				logger.info(`📋 ${validFiles.length} files processed successfully`);
			}

		} catch (error) {
			logger.error(`❌ Error processing files: ${error.message}`, error);
			setValidationErrors([{
				fileName: 'System Error',
				error: 'Failed to process files'
			}]);
		} finally {
			setIsProcessing(false);
		}
	}, [recordType, onFilesSelected]);

	/**
	 * Clear selected files and validation errors
	 */
	const clearFiles = useCallback(() => {
		setSelectedFiles([]);
		setValidationErrors([]);
		logger.info('📋 Files cleared');
	}, []);









	// Get dropzone status classes
	const getDropzoneClasses = () => {
		const classes = ['drop-zone'];
		if (isDragActive) classes.push('drag-active');
		if (isDragAccept) classes.push('drag-accept');
		if (isDragReject) classes.push('drag-reject');
		if (disabled) classes.push('disabled');
		if (isProcessing) classes.push('processing');
		return classes.join(' ');
	};

	// Render component
	return (
		<div className={`drag-drop-upload-area ${className}`}>
			{/* React-dropzone drop zone */}
			<div {...getRootProps({ className: getDropzoneClasses() })}>
				<input {...getInputProps()} />
				<div className="drop-zone-content">
					<div className="drop-zone-icon">
						<i className={`bi ${isDragActive ? 'bi-cloud-arrow-down' : 'bi-cloud-upload'}`}></i>
					</div>
					<div className="drop-zone-text">
						<p className="primary-text">
							{isDragActive ? messages.DRAG_ACTIVE : messages.DROP_FILES_HERE}
						</p>
						<p className="secondary-text">
							{messages.OR_CLICK_TO_SELECT}
						</p>
					</div>
					{isProcessing && (
						<div className="processing-indicator">
							<div className="spinner-border spinner-border-sm" role="status">
								<span className="visually-hidden">Processing...</span>
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Validation errors */}
			{validationErrors.length > 0 && (
				<div className="validation-errors mt-3">
					<div className="alert alert-danger">
						<h6 className="alert-heading">
							<i className="bi bi-exclamation-triangle me-2"></i>
							File validation errors:
						</h6>
						<ul className="mb-0">
							{validationErrors.map((error, index) => (
								<li key={index}>
									<strong>{error.fileName}:</strong> {error.error}
								</li>
							))}
						</ul>
					</div>
				</div>
			)}

			{/* Selected files list */}
			{showFileList && selectedFiles.length > 0 && validationErrors.length === 0 && (
				<div className="selected-files mt-3">
					<div className="alert alert-success">
						<h6 className="alert-heading">
							<i className="bi bi-check-circle me-2"></i>
							Selected files ({selectedFiles.length}):
						</h6>
						<ul className="mb-0">
							{selectedFiles.map((file, index) => (
								<li key={index}>
									<strong>{file.name}</strong> ({(file.size / 1024 / 1024).toFixed(2)} MB)
								</li>
							))}
						</ul>
						<button
							type="button"
							className="btn btn-sm btn-outline-secondary mt-2"
							onClick={clearFiles}
						>
							<i className="bi bi-x-circle me-1"></i>
							Clear files
						</button>
					</div>
				</div>
			)}
		</div>
	);
};

export default DragDropUploadArea;
