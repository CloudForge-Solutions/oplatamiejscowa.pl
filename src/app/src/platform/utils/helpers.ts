// src/utils/helpers.ts
// Utility functions for the application

// Re-export from platform helpers for backward compatibility
export {
	generateFileHash,
	generateUUID,
	generateShortUUID
} from '@/platform/helpers';

/**
 * Debounce function to limit the rate of function calls
 */
export function debounce<T extends (...args: any[]) => any>(
	func: T,
	wait: number,
	immediate: boolean = false
): (...args: Parameters<T>) => void {
	let timeout: NodeJS.Timeout | null = null;
	return function executedFunction(...args: Parameters<T>): void {
		const later = () => {
			timeout = null;
			if (!immediate) {
				func(...args);
			}
		};
		const callNow = immediate && !timeout;
		if (timeout) clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) {
			func(...args);
		}
	};
}

/**
 * Throttle function to limit the rate of function calls
 */
export function throttle(func, limit) {
	let inThrottle;
	return function (...args) {
		if (!inThrottle) {
			func.apply(this, args);
			inThrottle = true;
			setTimeout(() => inThrottle = false, limit);
		}
	};
}

/**
 * Format file size in human readable format
 */
export function formatFileSize(bytes) {
	if (bytes === 0) {
		return '0 Bytes';
	}

	const k = 1024;
	const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))  } ${  sizes[i]}`;
}

/**
 * Format date in Polish locale
 */
export function formatDate(date, options = {}) {
	const defaultOptions = {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		...options
	};

	return new Date(date).toLocaleDateString('pl-PL', defaultOptions);
}

/**
 * Format currency in Polish locale
 */
export function formatCurrency(amount, currency = 'PLN') {
	return new Intl.NumberFormat('pl-PL', {
		style: 'currency',
		currency
	}).format(amount);
}

/**
 * Convert text to proper title case (Polish-aware)
 * Handles Polish entity names and legal forms properly
 */
export function toTitleCase(text) {
	if (!text || typeof text !== 'string') {
		return '';
	}

	// Words that should remain lowercase in Polish titles
	const lowercaseWords = ['i', 'z', 'w', 'na', 'do', 'od', 'za', 'po', 'o', 'u', 'we', 'ze'];

	// Words that should remain uppercase (abbreviations)
	const uppercaseWords = ['NIP', 'REGON', 'KRS', 'VAT', 'JPK', 'PSA', 'SA', 'LLC'];

	return text.toLowerCase()
		.split(' ')
		.map((word, index) => {
			// First word is always capitalized
			if (index === 0) {
				return word.charAt(0).toUpperCase() + word.slice(1);
			}

			// Keep abbreviations uppercase
			if (uppercaseWords.includes(word.toUpperCase())) {
				return word.toUpperCase();
			}

			// Keep small words lowercase unless they're the first word
			if (lowercaseWords.includes(word.toLowerCase())) {
				return word.toLowerCase();
			}

			// Capitalize first letter of other words
			return word.charAt(0).toUpperCase() + word.slice(1);
		})
		.join(' ');
}

/**
 * Validate Polish NIP (tax identification number)
 */
export function validateNIP(nip) {
	if (!nip) {
		return false;
	}

	// Remove any non-digit characters
	const cleanNip = nip.replace(/\D/g, '');

	// Check length
	if (cleanNip.length !== 10) {
		return false;
	}

	// Calculate checksum
	const weights = [6, 5, 7, 2, 3, 4, 5, 6, 7];
	let sum = 0;

	for (let i = 0; i < 9; i++) {
		sum += parseInt(cleanNip[i]) * weights[i];
	}

	const checksum = sum % 11;
	const lastDigit = parseInt(cleanNip[9]);

	return checksum === lastDigit;
}

/**
 * Validate Polish REGON number
 */
export function validateREGON(regon) {
	if (!regon) {
		return false;
	}

	// Remove any non-digit characters
	const cleanRegon = regon.replace(/\D/g, '');

	// Check length (9 or 14 digits)
	if (cleanRegon.length !== 9 && cleanRegon.length !== 14) {
		return false;
	}

	// Validate 9-digit REGON
	if (cleanRegon.length === 9) {
		const weights = [8, 9, 2, 3, 4, 5, 6, 7];
		let sum = 0;

		for (let i = 0; i < 8; i++) {
			sum += parseInt(cleanRegon[i]) * weights[i];
		}

		const checksum = sum % 11;
		const lastDigit = parseInt(cleanRegon[8]);

		return checksum === 10 ? 0 === lastDigit : checksum === lastDigit;
	}

	// Validate 14-digit REGON
	if (cleanRegon.length === 14) {
		// First validate the 9-digit part
		if (!validateREGON(cleanRegon.substring(0, 9))) {
			return false;
		}

		const weights = [2, 4, 8, 5, 0, 9, 7, 3, 6, 1, 2, 4, 8];
		let sum = 0;

		for (let i = 0; i < 13; i++) {
			sum += parseInt(cleanRegon[i]) * weights[i];
		}

		const checksum = sum % 11;
		const lastDigit = parseInt(cleanRegon[13]);

		return checksum === 10 ? 0 === lastDigit : checksum === lastDigit;
	}

	return false;
}

/**
 * Deep clone an object
 */
export function deepClone(obj) {
	if (obj === null || typeof obj !== 'object') {
		return obj;
	}
	if (obj instanceof Date) {
		return new Date(obj.getTime());
	}
	if (obj instanceof Array) {
		return obj.map(item => deepClone(item));
	}
	if (typeof obj === 'object') {
		const clonedObj = {};
		for (const key in obj) {
			if (obj.hasOwnProperty(key)) {
				clonedObj[key] = deepClone(obj[key]);
			}
		}
		return clonedObj;
	}
}

/**
 * Check if value is empty (null, undefined, empty string, empty array, empty object)
 */
export function isEmpty(value) {
	if (value === null || value === undefined) {
		return true;
	}
	if (typeof value === 'string') {
		return value.trim() === '';
	}
	if (Array.isArray(value)) {
		return value.length === 0;
	}
	if (typeof value === 'object') {
		return Object.keys(value).length === 0;
	}
	return false;
}

/**
 * Capitalize first letter of a string
 */
export function capitalize(str) {
	if (!str) {
		return '';
	}
	return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Convert string to kebab-case
 */
export function toKebabCase(str) {
	return str
		.replace(/([a-z])([A-Z])/g, '$1-$2')
		.replace(/[\s_]+/g, '-')
		.toLowerCase();
}

/**
 * Convert string to camelCase
 */
export function toCamelCase(str) {
	return str
		.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
			return index === 0 ? word.toLowerCase() : word.toUpperCase();
		})
		.replace(/\s+/g, '');
}

/**
 * Generate random string
 */
export function generateRandomString(length = 8) {
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let result = '';
	for (let i = 0; i < length; i++) {
		result += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return result;
}

/**
 * Sleep function for async operations
 */
export function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry function with exponential backoff
 */
export async function retry(fn, options = {}) {
	const {
		retries = 3,
		delay = 1000,
		backoff = 2,
		onRetry = () => {
		}
	} = options;

	let lastError;

	for (let i = 0; i <= retries; i++) {
		try {
			return await fn();
		} catch (error) {
			lastError = error;

			if (i === retries) {
				throw lastError;
			}

			const waitTime = delay * Math.pow(backoff, i);
			onRetry(error, i + 1, waitTime);
			await sleep(waitTime);
		}
	}
}

/**
 * Create a promise that resolves after a timeout
 */
export function timeout(promise, ms) {
	return Promise.race([
		promise,
		new Promise((_, reject) =>
			setTimeout(() => reject(new Error('Operation timed out')), ms)
		)
	]);
}

/**
 * Batch process array items
 */
export async function batchProcess(items, processor, batchSize = 10) {
	const results = [];

	for (let i = 0; i < items.length; i += batchSize) {
		const batch = items.slice(i, i + batchSize);
		const batchResults = await Promise.all(batch.map(processor));
		results.push(...batchResults);
	}

	return results;
}

/**
 * Safe JSON parse with fallback
 */
export function safeJsonParse(str, fallback = null) {
	try {
		return JSON.parse(str);
	} catch (error) {
		return fallback;
	}
}

/**
 * Safe JSON stringify
 */
export function safeJsonStringify(obj, fallback = '{}') {
	try {
		return JSON.stringify(obj);
	} catch (error) {
		return fallback;
	}
}
