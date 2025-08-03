/**
 * Validation Constants - Tourist Tax Application
 *
 * ARCHITECTURAL PRINCIPLES:
 * 1. Single Source of Truth: All validation patterns and messages in one place
 * 2. Type Safety: Prevents magic strings in validation logic
 * 3. Maintainability: Easy to update validation rules across the app
 * 4. Consistency: Standardized validation patterns
 *
 * CATEGORIES:
 * - REGEX_PATTERNS: Regular expression patterns for validation
 * - VALIDATION_MESSAGES: Error messages for validation failures
 * - FIELD_REQUIREMENTS: Field validation requirements
 */

// ===== REGEX PATTERNS =====
export const REGEX_PATTERNS = {
	// International patterns
	EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
	PHONE_PATTERN: /^[\+]?[1-9][\d]{0,15}$/,
	URL_PATTERN: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,

	// Financial patterns (for tourist tax payments)
	AMOUNT_PATTERN: /^\d+([.,]\d{1,2})?$/,
	CURRENCY_CODE_PATTERN: /^[A-Z]{3}$/,

	// Date patterns
	DATE_ISO_PATTERN: /^\d{4}-\d{2}-\d{2}$/,
	DATETIME_ISO_PATTERN: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/,

	// UUID patterns (for reservation IDs)
	UUID_PATTERN: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,

	// Tourist tax specific patterns
	RESERVATION_ID_PATTERN: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
	CITY_CODE_PATTERN: /^[a-z]{2,20}$/,
	GUEST_COUNT_PATTERN: /^[1-9]\d{0,2}$/,
	ACCOMMODATION_NAME_PATTERN: /^[a-zA-Z0-9\s\-\.]{2,100}$/,

	// Language and locale patterns
	LANGUAGE_CODE_PATTERN: /^[a-z]{2}$/,
	LOCALE_PATTERN: /^[a-z]{2}(-[A-Z]{2})?$/
} as const;

// ===== VALIDATION MESSAGES =====
export const VALIDATION_MESSAGES = {
	// Required field messages (tourist tax specific)
	REQUIRED_FIELD: 'This field is required',
	REQUIRED_RESERVATION_ID: 'Reservation ID is required',
	REQUIRED_GUEST_COUNT: 'Number of guests is required',
	REQUIRED_CHECK_IN_DATE: 'Check-in date is required',
	REQUIRED_CHECK_OUT_DATE: 'Check-out date is required',
	REQUIRED_ACCOMMODATION_NAME: 'Accommodation name is required',
	REQUIRED_CITY: 'City is required',
	REQUIRED_AMOUNT: 'Amount is required',

	// Format validation messages
	INVALID_EMAIL: 'Invalid email format',
	INVALID_PHONE: 'Invalid phone number format',
	INVALID_URL: 'Invalid URL format',
	INVALID_AMOUNT: 'Invalid amount format',
	INVALID_DATE: 'Invalid date format',
	INVALID_UUID: 'Invalid reservation ID format',
	INVALID_RESERVATION_ID: 'Invalid reservation ID format',
	INVALID_GUEST_COUNT: 'Guest count must be between 1 and 999',
	INVALID_CITY_CODE: 'Invalid city code format',
	INVALID_ACCOMMODATION_NAME: 'Invalid accommodation name format',
	INVALID_LANGUAGE_CODE: 'Invalid language code',

	// Range validation messages
	TOO_SMALL: 'Value is too small',
	TOO_LARGE: 'Value is too large',
	MIN_VALUE: 'Minimum value: {min}',
	MAX_VALUE: 'Maximum value: {max}',
	OUT_OF_RANGE: 'Value out of range {min}-{max}',

	// Date validation messages
	INVALID_DATE_RANGE: 'Check-out date must be after check-in date',
	DATE_IN_PAST: 'Date cannot be in the past',
	DATE_TOO_FAR_FUTURE: 'Date is too far in the future',
	INVALID_STAY_DURATION: 'Stay duration is invalid',

	// Payment validation messages
	PAYMENT_AMOUNT_TOO_SMALL: 'Payment amount is too small',
	PAYMENT_AMOUNT_TOO_LARGE: 'Payment amount is too large',
	INVALID_CURRENCY: 'Invalid currency code',
	PAYMENT_FAILED: 'Payment processing failed',
	PAYMENT_TIMEOUT: 'Payment processing timeout',

	// Business logic validation messages
	RESERVATION_NOT_FOUND: 'Reservation not found',
	RESERVATION_EXPIRED: 'Reservation has expired',
	PAYMENT_ALREADY_COMPLETED: 'Payment has already been completed',
	INVALID_PAYMENT_STATUS: 'Invalid payment status',
	CITY_NOT_SUPPORTED: 'City is not supported for tourist tax payments'
	UNSUPPORTED_DOCUMENT_KIND: 'Nieobsługiwany typ dokumentu',
	INVALID_ANALYSIS_TYPE: 'Nieprawidłowy typ analizy',

	// JPK validation messages
	INVALID_JPK_PERIOD: 'Nieprawidłowy okres JPK',
	INVALID_JPK_TYPE: 'Nieprawidłowy typ JPK',
	JPK_VALIDATION_FAILED: 'Walidacja JPK nie powiodła się',

	// Storage validation messages
	STORAGE_KEY_INVALID: 'Nieprawidłowy klucz przechowywania',
	STORAGE_VALUE_INVALID: 'Nieprawidłowa wartość do przechowania',
	STORAGE_QUOTA_EXCEEDED: 'Przekroczono limit przechowywania'
};

// ===== FIELD REQUIREMENTS =====
export const FIELD_REQUIREMENTS = {
	// Length requirements
	NAME_MIN_LENGTH: 2,
	NAME_MAX_LENGTH: 100,
	DESCRIPTION_MAX_LENGTH: 1000,
	EMAIL_MAX_LENGTH: 254,
	PHONE_MAX_LENGTH: 20,
	ADDRESS_MAX_LENGTH: 200,

	// Numeric requirements
	AMOUNT_MIN: 0,
	AMOUNT_MAX: 999999999.99,
	PERCENTAGE_MIN: 0,
	PERCENTAGE_MAX: 100,
	YEAR_MIN: 2019,
	YEAR_MAX: 2030,

	// File requirements
	FILE_SIZE_MAX: 10 * 1024 * 1024, // 10MB
	FILE_SIZE_MIN: 1024, // 1KB

	// Password requirements
	PASSWORD_MIN_LENGTH: 8,
	PASSWORD_MAX_LENGTH: 128,

	// Business requirements
	NIP_LENGTH: 10,
	REGON_LENGTH_SHORT: 9,
	REGON_LENGTH_LONG: 14,
	KRS_LENGTH: 10,
	ACCOUNT_NUMBER_LENGTH: 26,
	POSTAL_CODE_LENGTH: 6 // XX-XXX
};

// ===== FORMAT PATTERNS =====
export const FORMAT_PATTERNS = {
	// Date formats
	DATE_FORMAT_PL: 'DD.MM.YYYY',
	DATE_FORMAT_ISO: 'YYYY-MM-DD',
	DATETIME_FORMAT_PL: 'DD.MM.YYYY HH:mm:ss',
	DATETIME_FORMAT_ISO: 'YYYY-MM-DDTHH:mm:ss.sssZ',

	// Number formats
	AMOUNT_FORMAT_PL: '#,##0.00',
	PERCENTAGE_FORMAT: '#0.00%',

	// Phone formats
	PHONE_FORMAT_PL: '+48 XXX XXX XXX',
	PHONE_FORMAT_INTL: '+XX XXX XXX XXX',

	// Address formats
	POSTAL_CODE_FORMAT_PL: 'XX-XXX',

	// Document formats
	INVOICE_NUMBER_FORMAT: 'FV/YYYY/MM/NNNN',
	DOCUMENT_NUMBER_FORMAT: 'DOC/YYYY/NNNN',

	// File naming formats
	EXPORT_FILENAME_FORMAT: 'export_YYYYMMDD_HHmmss',
	BACKUP_FILENAME_FORMAT: 'backup_YYYYMMDD_HHmmss',

	// Storage key formats
	CONTEXT_KEY_FORMAT: 'type:subtype:version:context',
	GLOBAL_KEY_FORMAT: 'global:type:version',
	SETTINGS_KEY_FORMAT: 'settings:type:version:context'
};

// ===== VALIDATION RULES =====
export const VALIDATION_RULES = {
	// Field validation rules
	REQUIRED_FIELDS: {
		ENTITY: ['name', 'taxId', 'type'],
		ENTITY: ['name', 'taxId', 'entityId'],
		USER: ['displayName', 'email'],
		BANK_ACCOUNT: ['bankName', 'accountNumber'],
		INVOICE: ['number', 'issueDate', 'clientName', 'netAmount']
	},

	// Format validation rules
	FORMAT_RULES: {
		EMAIL: 'EMAIL_PATTERN',
		NIP: 'NIP_PATTERN',
		POSTAL_CODE: 'POSTAL_CODE_PL',
		PHONE: 'PHONE_PATTERN',
		URL: 'URL_PATTERN',
		AMOUNT: 'AMOUNT_PATTERN',
		PERCENTAGE: 'PERCENTAGE_PATTERN'
	},

	// Length validation rules
	LENGTH_RULES: {
		NAME: {min: 2, max: 100},
		DESCRIPTION: {max: 1000},
		EMAIL: {max: 254},
		PHONE: {max: 20},
		PASSWORD: {min: 8, max: 128}
	},

	// Range validation rules
	RANGE_RULES: {
		AMOUNT: {min: 0, max: 999999999.99},
		PERCENTAGE: {min: 0, max: 100},
		YEAR: {min: 2019, max: 2030}
	}
};
