/**
 * File Constants - Tourist Tax Application
 *
 * ARCHITECTURAL PRINCIPLES:
 * 1. Single Source of Truth: All file-related constants in one place
 * 2. Type Safety: Prevents magic strings in file operations
 * 3. Mobile-First: Optimized for mobile file handling
 *
 * CATEGORIES:
 * - FILE_EXTENSIONS: File extension patterns
 * - MIME_TYPES: MIME type constants
 * - FILE_SIZES: File size limits
 */

// ===== FILE EXTENSIONS =====
export const FILE_EXTENSIONS = {
	// Document formats (for receipts and confirmations)
	PDF: '.pdf',

	// Image formats (for mobile uploads if needed)
	JPG: '.jpg',
	JPEG: '.jpeg',
	PNG: '.png',
	WEBP: '.webp',

	// Data formats
	JSON: '.json'
} as const;

// ===== MIME TYPES =====
export const MIME_TYPES = {
	// Document MIME types (for receipts)
	PDF: 'application/pdf',

	// Image MIME types (for mobile uploads)
	JPEG: 'image/jpeg',
	PNG: 'image/png',
	WEBP: 'image/webp',

	// Data MIME types
	JSON: 'application/json',

	// Form data
	FORM_DATA: 'multipart/form-data',
	URL_ENCODED: 'application/x-www-form-urlencoded'
} as const;

// ===== FILE PATTERNS =====
export const FILE_PATTERNS = {
	// Tourist tax specific patterns
	RECEIPT_PATTERN: /receipt_\d{8}_\d{6}/,
	CONFIRMATION_PATTERN: /confirmation_\d{8}_\d{6}/,

	// File validation patterns
	SAFE_FILENAME_PATTERN: /^[a-zA-Z0-9._-]+$/,

	// Allowed file extensions
	IMAGE_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp'],
	DOCUMENT_EXTENSIONS: ['.pdf']
} as const;

// ===== FILE SIZES =====
export const FILE_SIZES = {
	// Size units (in bytes)
	KB: 1024,
	MB: 1024 * 1024,

	// Size limits (mobile-optimized)
	MAX_RECEIPT_SIZE: 5 * 1024 * 1024, // 5MB for receipts
	MAX_IMAGE_SIZE: 2 * 1024 * 1024, // 2MB for mobile images
	MIN_FILE_SIZE: 1024 // 1KB
} as const;

// Type definitions for TypeScript
// ===== FILE OPERATIONS =====
export const FILE_OPERATIONS = {
	// Tourist tax specific operations
	DOWNLOAD: 'download', // For receipts
	UPLOAD: 'upload' // For mobile file uploads if needed
} as const;

// Type definitions for TypeScript
export type FileExtension = typeof FILE_EXTENSIONS[keyof typeof FILE_EXTENSIONS];
export type MimeType = typeof MIME_TYPES[keyof typeof MIME_TYPES];
export type FilePattern = typeof FILE_PATTERNS[keyof typeof FILE_PATTERNS];
export type FileSize = typeof FILE_SIZES[keyof typeof FILE_SIZES];
export type FileOperation = typeof FILE_OPERATIONS[keyof typeof FILE_OPERATIONS];
