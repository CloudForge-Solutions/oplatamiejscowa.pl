/**
 * Validation Error Reporter - Platform Service
 *
 * ARCHITECTURE: Centralized validation error handling
 * - Structured error collection and reporting
 * - Integration with logging system
 * - Performance tracking for validation operations
 * - Fail-fast validation with proper error handling
 */

import { logger } from './CentralizedLogger';

interface ValidationError {
    id: string;
    timestamp: string;
    field: string;
    message: string;
    value: any;
    rule: string;
    context?: string;
}

interface ValidationStats {
    totalValidations: number;
    failedValidations: number;
    successRate: number;
}

/**
 * ValidationErrorReporter - Centralized validation error handling
 *
 * ARCHITECTURE PRINCIPLE: Single source of truth for validation error reporting
 * - Centralized error collection and reporting
 * - Structured error data for debugging
 * - Integration with logging system
 * - Performance tracking for validation operations
 */
export class ValidationErrorReporter {
    private errors: ValidationError[] = [];
    private validationStats: ValidationStats = {
        totalValidations: 0,
        failedValidations: 0,
        successRate: 100
    };

    constructor() {
        logger.info('🔍 ValidationErrorReporter initialized');
    }

    /**
     * Report a validation error
     */
    reportError(field: string, message: string, value: any, rule: string): ValidationError {
        const error: ValidationError = {
            id: `validation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString(),
            field,
            message,
            value,
            rule,
            context: this._getValidationContext()
        };

        this.errors.push(error);
        this.validationStats.failedValidations++;
        this._updateSuccessRate();

        // Log the validation error
        logger.error(`Validation failed for field "${field}": ${message}`, {
            field,
            value,
            rule,
            error
        });

        return error;
    }

    /**
     * Report successful validation
     */
    reportSuccess(field: string, value: any, rule: string): void {
        this.validationStats.totalValidations++;
        this._updateSuccessRate();

        logger.debug(`Validation passed for field "${field}"`, {
            field,
            value,
            rule
        });
    }

    /**
     * Get all validation errors
     */
    getErrors(): ValidationError[] {
        return [...this.errors];
    }

    /**
     * Get errors for specific field
     */
    getErrorsForField(field: string): ValidationError[] {
        return this.errors.filter(error => error.field === field);
    }

    /**
     * Clear all errors
     */
    clearErrors(): void {
        this.errors = [];
        logger.info('🧹 Validation errors cleared');
    }

    /**
     * Clear errors for specific field
     */
    clearErrorsForField(field: string): void {
        const initialCount = this.errors.length;
        this.errors = this.errors.filter(error => error.field !== field);
        const clearedCount = initialCount - this.errors.length;

        if (clearedCount > 0) {
            logger.info(`🧹 Cleared ${clearedCount} validation errors for field "${field}"`);
        }
    }

    /**
     * Get validation statistics
     */
    getValidationStats(): ValidationStats {
        return { ...this.validationStats };
    }

    /**
     * Check if there are any validation errors
     */
    hasErrors(): boolean {
        return this.errors.length > 0;
    }

    /**
     * Check if specific field has errors
     */
    hasErrorsForField(field: string): boolean {
        return this.errors.some(error => error.field === field);
    }

    /**
     * Get validation context for debugging
     */
    private _getValidationContext(): string | null {
        try {
            const stack = new Error().stack;
            if (!stack) return null;

            const lines = stack.split('\n');
            // Find the first line that's not from this class
            for (let i = 3; i < lines.length; i++) {
                const line = lines[i];
                if (line && !line.includes('ValidationErrorReporter') && !line.includes('node_modules')) {
                    return line.trim();
                }
            }
            return null;
        } catch (error) {
            return null;
        }
    }

    /**
     * Update success rate calculation
     */
    private _updateSuccessRate(): void {
        if (this.validationStats.totalValidations > 0) {
            const successfulValidations = this.validationStats.totalValidations - this.validationStats.failedValidations;
            this.validationStats.successRate = (successfulValidations / this.validationStats.totalValidations) * 100;
        }
    }
}

// Create global instance
export const validationErrorReporter = new ValidationErrorReporter();

// Export as default for easy importing
export default validationErrorReporter;
