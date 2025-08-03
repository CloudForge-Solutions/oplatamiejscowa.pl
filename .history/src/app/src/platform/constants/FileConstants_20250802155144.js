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
	// Document MIME types
	PDF: 'application/pdf',
	DOC: 'application/msword',
	DOCX: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
	XLS: 'application/vnd.ms-excel',
	XLSX: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
	TXT: 'text/plain',
	RTF: 'application/rtf',

	// Image MIME types
	JPEG: 'image/jpeg',
	PNG: 'image/png',
	GIF: 'image/gif',
	BMP: 'image/bmp',
	WEBP: 'image/webp',
	SVG: 'image/svg+xml',
	TIFF: 'image/tiff',

	// Data MIME types
	JSON: 'application/json',
	XML: 'application/xml',
	CSV: 'text/csv',

	// Web MIME types
	HTML: 'text/html',
	CSS: 'text/css',
	JAVASCRIPT: 'application/javascript',

	// Archive MIME types
	ZIP: 'application/zip',
	RAR: 'application/x-rar-compressed',
	TAR: 'application/x-tar',
	GZIP: 'application/gzip',

	// Form data
	FORM_DATA: 'multipart/form-data',
	URL_ENCODED: 'application/x-www-form-urlencoded',

	// Generic
	OCTET_STREAM: 'application/octet-stream'
};

// ===== FILE PATTERNS =====
export const FILE_PATTERNS = {
	// Document type detection patterns
	SALES_PATTERNS: ['sprzedaz', 'faktura', 'invoice', 'sales', 'faktura_wyst'],

	PURCHASE_PATTERNS: ['zakup', 'rachunek', 'paragon', 'purchase', 'receipt', 'faktura_otrz'],

	FIXED_ASSETS_PATTERNS: ['srodki', 'aktywa', 'asset', 'equipment', 'srodki_trwale', 'amortyzacja'],

	// File name patterns
	BACKUP_PATTERN: /backup_\d{8}_\d{6}/,
	EXPORT_PATTERN: /export_\d{8}_\d{6}/,
	TEMP_PATTERN: /temp_\d{13}/,

	// Document number patterns
	INVOICE_NUMBER_PATTERN: /^[A-Z0-9\/\-_]+$/,
	DOCUMENT_NUMBER_PATTERN: /^[A-Z0-9\/\-_\s]+$/,

	// File validation patterns
	SAFE_FILENAME_PATTERN: /^[a-zA-Z0-9._-]+$/,
	DANGEROUS_EXTENSIONS: ['.exe', '.bat', '.cmd', '.scr', '.vbs', '.js'],

	// Image file patterns
	IMAGE_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'],
	DOCUMENT_EXTENSIONS: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt']
};

// ===== FILE SIZES =====
export const FILE_SIZES = {
	// Size units (in bytes)
	BYTE: 1,
	KB: 1024,
	MB: 1024 * 1024,
	GB: 1024 * 1024 * 1024,

	// Size limits
	MAX_UPLOAD_SIZE: 10 * 1024 * 1024, // 10MB
	MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
	MAX_DOCUMENT_SIZE: 50 * 1024 * 1024, // 50MB
	MIN_FILE_SIZE: 1024, // 1KB

	// Chunk sizes for processing
	CHUNK_SIZE_SMALL: 64 * 1024, // 64KB
	CHUNK_SIZE_MEDIUM: 256 * 1024, // 256KB
	CHUNK_SIZE_LARGE: 1024 * 1024, // 1MB

	// Cache sizes
	CACHE_SIZE_LIMIT: 100 * 1024 * 1024, // 100MB
	TEMP_FILE_LIMIT: 50 * 1024 * 1024, // 50MB

	// Batch processing limits
	MAX_FILES_PER_BATCH: 50,
	MAX_BATCH_SIZE: 100 * 1024 * 1024 // 100MB total
};

// ===== FILE ENCODING =====
export const FILE_ENCODING = {
	// Text encodings
	UTF8: 'utf-8',
	UTF16: 'utf-16',
	ASCII: 'ascii',
	LATIN1: 'latin1',

	// Binary encodings
	BASE64: 'base64',
	HEX: 'hex',
	BINARY: 'binary',

	// Default encoding
	DEFAULT: 'utf-8'
};

// ===== FILE OPERATIONS =====
export const FILE_OPERATIONS = {
	// Operation types
	UPLOAD: 'upload',
	DOWNLOAD: 'download',
	DELETE: 'delete',
	MOVE: 'move',
	COPY: 'copy',
	RENAME: 'rename',

	// Processing operations
	EXTRACT: 'extract',
	COMPRESS: 'compress',
	CONVERT: 'convert',
	VALIDATE: 'validate',
	ANALYZE: 'analyze',

	// Batch operations
	BATCH_UPLOAD: 'batch_upload',
	BATCH_DELETE: 'batch_delete',
	BATCH_PROCESS: 'batch_process'
};

// ===== FILE STATUSES =====
export const FILE_STATUSES = {
	// Upload statuses
	PENDING: 'pending',
	UPLOADING: 'uploading',
	UPLOADED: 'uploaded',
	FAILED: 'failed',
	CANCELLED: 'cancelled',

	// Processing statuses
	QUEUED: 'queued',
	PROCESSING: 'processing',
	PROCESSED: 'processed',
	ERROR: 'error',
	COMPLETED: 'completed',

	// Validation statuses
	VALID: 'valid',
	INVALID: 'invalid',
	CORRUPTED: 'corrupted',
	DUPLICATE: 'duplicate',

	// Storage statuses
	STORED: 'stored',
	ARCHIVED: 'archived',
	DELETED: 'deleted',
	EXPIRED: 'expired'
};

// ===== FILE PATHS =====
export const FILE_PATHS = {
	// Static paths
	ASSETS: '/assets',
	UPLOADS: '/uploads',
	EXPORTS: '/exports',
	TEMP: '/temp',
	CACHE: '/cache',
	BACKUPS: '/backups',

	// Config paths
	CONFIG_BANKS_PL: '/config/banks/pl/plewiba.xml',

	// Relative paths
	CURRENT_DIR: './',
	PARENT_DIR: '../',
	ROOT_DIR: '/',

	// Path separators
	UNIX_SEPARATOR: '/',
	WINDOWS_SEPARATOR: '\\',

	// Default paths
	DEFAULT_UPLOAD_PATH: '/uploads',
	DEFAULT_TEMP_PATH: '/temp',
	DEFAULT_EXPORT_PATH: '/exports'
};

// ===== FILE NAMING =====
export const FILE_NAMING = {
	// Naming patterns
	TIMESTAMP_FORMAT: 'YYYYMMDD_HHmmss',
	DATE_FORMAT: 'YYYY-MM-DD',

	// Prefixes
	BACKUP_PREFIX: 'backup_',
	EXPORT_PREFIX: 'export_',
	TEMP_PREFIX: 'temp_',
	PROCESSED_PREFIX: 'processed_',
	ORIGINAL_PREFIX: 'original_',

	// Suffixes
	DATA_SUFFIX: '_data',
	METADATA_SUFFIX: '_metadata',
	THUMBNAIL_SUFFIX: '_thumb',
	COMPRESSED_SUFFIX: '_compressed',

	// Separators
	UNDERSCORE: '_',
	DASH: '-',
	DOT: '.',

	// Reserved names (Windows)
	RESERVED_NAMES: [
		'CON',
		'PRN',
		'AUX',
		'NUL',
		'COM1',
		'COM2',
		'COM3',
		'COM4',
		'COM5',
		'COM6',
		'COM7',
		'COM8',
		'COM9',
		'LPT1',
		'LPT2',
		'LPT3',
		'LPT4',
		'LPT5',
		'LPT6',
		'LPT7',
		'LPT8',
		'LPT9'
	],

	// Invalid characters
	INVALID_CHARS: ['<', '>', ':', '"', '|', '?', '*', '\\', '/'],

	// Max lengths
	MAX_FILENAME_LENGTH: 255,
	MAX_PATH_LENGTH: 4096
};

// ===== FILE METADATA =====
export const FILE_METADATA = {
	// Standard metadata fields
	NAME: 'name',
	SIZE: 'size',
	TYPE: 'type',
	LAST_MODIFIED: 'lastModified',
	CREATED_DATE: 'createdDate',

	// Custom metadata fields
	UPLOAD_DATE: 'uploadDate',
	PROCESSED_DATE: 'processedDate',
	ENTITY_ID: 'entityId',
	USER_ID: 'userId',

	// Processing metadata
	PROCESSING_STATUS: 'processingStatus',
	PROCESSING_RESULT: 'processingResult',
	ERROR_MESSAGE: 'errorMessage',
	RETRY_COUNT: 'retryCount',

	// Content metadata
	PAGE_COUNT: 'pageCount',
	WORD_COUNT: 'wordCount',
	CHARACTER_COUNT: 'characterCount',
	LANGUAGE: 'language',

	// Security metadata
	CHECKSUM: 'checksum',
	HASH: 'hash',
	SIGNATURE: 'signature',
	ENCRYPTED: 'encrypted'
};
