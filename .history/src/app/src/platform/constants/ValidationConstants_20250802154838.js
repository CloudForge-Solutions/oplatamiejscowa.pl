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
	// Required field messages
	REQUIRED_FIELD: 'To pole jest wymagane',
	REQUIRED_NAME: 'Nazwa jest wymagana',
	REQUIRED_EMAIL: 'Adres email jest wymagany',
	REQUIRED_PHONE: 'Numer telefonu jest wymagany',
	REQUIRED_ADDRESS: 'Adres jest wymagany',
	REQUIRED_TAX_ID: 'NIP jest wymagany',
	REQUIRED_AMOUNT: 'Kwota jest wymagana',
	REQUIRED_DATE: 'Data jest wymagana',
	REQUIRED_ENTITY: 'Entityanizacja jest wymagana',
	REQUIRED_ENTITY: 'Firma jest wymagana',

	// Format validation messages
	INVALID_EMAIL: 'Nieprawidłowy format adresu email',
	INVALID_PHONE: 'Nieprawidłowy format numeru telefonu',
	INVALID_URL: 'Nieprawidłowy format adresu URL',
	INVALID_NIP: 'Nieprawidłowy format numeru NIP (wymagane 10 cyfr)',
	INVALID_REGON: 'Nieprawidłowy format numeru REGON',
	INVALID_KRS: 'Nieprawidłowy format numeru KRS',
	INVALID_POSTAL_CODE: 'Nieprawidłowy format kodu pocztowego (XX-XXX)',
	INVALID_AMOUNT: 'Nieprawidłowy format kwoty',
	INVALID_PERCENTAGE: 'Nieprawidłowy format procentu (0-100)',
	INVALID_DATE: 'Nieprawidłowy format daty',
	INVALID_ACCOUNT_NUMBER: 'Nieprawidłowy numer konta (26 cyfr)',
	INVALID_SWIFT_BIC: 'Nieprawidłowy kod SWIFT/BIC',
	INVALID_INVOICE_NUMBER: 'Nieprawidłowy format numeru faktury',
	INVALID_UUID: 'Nieprawidłowy format UUID',

	// Length validation messages
	TOO_SHORT: 'Wartość jest zbyt krótka',
	TOO_LONG: 'Wartość jest zbyt długa',
	MIN_LENGTH: 'Minimalna długość: {min} znaków',
	MAX_LENGTH: 'Maksymalna długość: {max} znaków',
	EXACT_LENGTH: 'Wymagana długość: {length} znaków',

	// Range validation messages
	TOO_SMALL: 'Wartość jest zbyt mała',
	TOO_LARGE: 'Wartość jest zbyt duża',
	MIN_VALUE: 'Minimalna wartość: {min}',
	MAX_VALUE: 'Maksymalna wartość: {max}',
	OUT_OF_RANGE: 'Wartość poza zakresem {min}-{max}',

	// Password validation messages
	PASSWORD_TOO_WEAK: 'Hasło jest zbyt słabe',
	PASSWORD_MISMATCH: 'Hasła nie są identyczne',
	PASSWORD_MIN_LENGTH: 'Hasło musi mieć co najmniej 8 znaków',
	PASSWORD_REQUIREMENTS: 'Hasło musi zawierać wielkie i małe litery, cyfry oraz znaki specjalne',

	// File validation messages
	INVALID_FILE_TYPE: 'Nieprawidłowy typ pliku',
	FILE_TOO_LARGE: 'Plik jest zbyt duży',
	FILE_TOO_SMALL: 'Plik jest zbyt mały',
	NO_FILE_SELECTED: 'Nie wybrano pliku',
	UPLOAD_FAILED: 'Przesyłanie pliku nie powiodło się',

	// Business logic validation messages
	DUPLICATE_ENTRY: 'Wpis już istnieje',
	INVALID_COMBINATION: 'Nieprawidłowa kombinacja wartości',
	DEPENDENCY_VIOLATION: 'Naruszenie zależności',
	BUSINESS_RULE_VIOLATION: 'Naruszenie reguły biznesowej',

	// Context validation messages
	CONTEXT_REQUIRED: 'Wymagany kontekst podmiotu',
	INVALID_CONTEXT: 'Nieprawidłowy kontekst',
	CONTEXT_MISMATCH: 'Niezgodność kontekstu',

	// Version validation messages
	VERSION_FORMAT_WARNING: 'Format wersji może nie być zgodny z semantic versioning',
	INVALID_VERSION: 'Nieprawidłowy format wersji',
	VERSION_CONFLICT: 'Konflikt wersji',

	// Record validation messages
	INVALID_RECORD_TYPE: 'Nieprawidłowy typ rekordu',
	UNSUPPORTED_RECORD_KIND: 'Nieobsługiwany typ rekordu',
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
