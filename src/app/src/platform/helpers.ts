// File utilities - TypeScript migration
import { CRYPTO_ALGORITHMS } from '@/constants';

export async function generateFileHash(file: File | Blob): Promise<string> {
	// CRITICAL FIX: Validate file parameter to prevent 'file.arrayBuffer is not a function' errors
	if (!file) {
		throw new Error('File parameter is required for hash generation');
	}

	if (typeof file.arrayBuffer !== 'function') {
		throw new Error(`Invalid file object: expected File or Blob, got ${typeof file}. File must have arrayBuffer() method.`);
	}

	try {
		const arrayBuffer = await file.arrayBuffer();
		const hashBuffer = await crypto.subtle.digest(CRYPTO_ALGORITHMS.SHA_256, arrayBuffer);
		const hashArray = Array.from(new Uint8Array(hashBuffer));
		return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Unknown error';
		throw new Error(`Failed to generate file hash: ${errorMessage}`);
	}
}

// UUID generation utility
export function generateUUID(): string {
	// Use crypto.randomUUID if available (modern browsers)
	if (typeof crypto !== 'undefined' && crypto.randomUUID) {
		return crypto.randomUUID();
	}

	// Fallback implementation for older browsers
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
		const r = (Math.random() * 16) | 0;
		const v = c === 'x' ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
}

// UUID validation utility
export function isValidUUID(uuid: string): boolean {
	const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
	return uuidRegex.test(uuid);
}

// Generate short UUID for display purposes
export function generateShortUUID(): string {
	return generateUUID().split('-')[0];
}

export function formatFileSize(bytes) {
	if (bytes === 0) {
		return '0 Bytes';
	}
	const k = 1024;
	const sizes = ['Bytes', 'KB', 'MB', 'GB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function formatDate(dateString) {
	return new Date(dateString).toLocaleString('pl-PL');
}

// PDF comparison utilities
export function calculatePdfSimilarity(pdf1Metadata, pdf2Metadata) {
	let similarity = 0;
	let factors = 0;

	// Size similarity (within 5% difference)
	if (pdf1Metadata.size && pdf2Metadata.size) {
		const sizeDiff =
			Math.abs(pdf1Metadata.size - pdf2Metadata.size) /
			Math.max(pdf1Metadata.size, pdf2Metadata.size);
		if (sizeDiff < 0.05) {
			similarity += 0.3;
		}
		factors += 0.3;
	}

	// Page count similarity
	if (pdf1Metadata.pages && pdf2Metadata.pages) {
		if (pdf1Metadata.pages === pdf2Metadata.pages) {
			similarity += 0.4;
		}
		factors += 0.4;
	}

	// Last modified date similarity (within 1 hour)
	if (pdf1Metadata.lastModified && pdf2Metadata.lastModified) {
		const timeDiff = Math.abs(pdf1Metadata.lastModified - pdf2Metadata.lastModified);
		if (timeDiff < 3600000) {
			// 1 hour in milliseconds
			similarity += 0.3;
		}
		factors += 0.3;
	}

	return factors > 0 ? similarity / factors : 0;
}

// Text comparison utilities
export function calculateTextSimilarity(text1, text2) {
	if (!text1 || !text2) {
		return 0;
	}

	const words1 = text1.toLowerCase().split(/\s+/);
	const words2 = text2.toLowerCase().split(/\s+/);

	const set1 = new Set(words1);
	const set2 = new Set(words2);

	const intersection = new Set([...set1].filter(x => set2.has(x)));
	const union = new Set([...set1, ...set2]);

	return intersection.size / union.size; // Jaccard similarity
}

// Color utilities for diff visualization
export function getColorForDifference(type) {
	const colors = {
		added: '#d4edda', // Light green
		removed: '#f8d7da', // Light red
		modified: '#fff3cd', // Light yellow
		unchanged: '#ffffff' // White
	};
	return colors[type] || colors.unchanged;
}

// Debounce utility
export function debounce(func, wait) {
	let timeout;
	return function executedFunction(...args) {
		const later = () => {
			clearTimeout(timeout);
			func(...args);
		};
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
	};
}
