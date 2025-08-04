/**
 * Storage Validation Service
 * 
 * RESPONSIBILITY: Validate storage-related requests and data
 * ARCHITECTURE: NestJS service with validation utilities
 */

import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class StorageValidationService {
  private readonly logger = new Logger(StorageValidationService.name);

  /**
   * Validate UUID format
   */
  validateUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const isValid = uuidRegex.test(uuid);
    
    if (!isValid) {
      this.logger.warn('🚫 Invalid UUID format', { uuid });
    }
    
    return isValid;
  }

  /**
   * Validate Azure container name format
   */
  validateContainerName(name: string): boolean {
    // Azure container name rules:
    // - 3-63 characters
    // - lowercase letters, numbers, and hyphens
    // - must start and end with letter or number
    // - no consecutive hyphens
    const containerRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;
    const isValid = name.length >= 3 && name.length <= 63 && containerRegex.test(name);
    
    if (!isValid) {
      this.logger.warn('🚫 Invalid container name format', { 
        name,
        length: name.length,
        rules: 'Must be 3-63 chars, lowercase letters/numbers/hyphens, start/end with alphanumeric'
      });
    }
    
    return isValid;
  }

  /**
   * Validate SAS permissions string
   */
  validatePermissions(permissions: string): boolean {
    const permissionsRegex = /^[rwdl]+$/;
    const isValid = permissionsRegex.test(permissions);
    
    if (!isValid) {
      this.logger.warn('🚫 Invalid permissions format', { 
        permissions,
        allowedChars: 'r (read), w (write), d (delete), l (list)'
      });
    }
    
    return isValid;
  }

  /**
   * Validate expiry hours range
   */
  validateExpiryHours(hours: number): boolean {
    const isValid = hours >= 1 && hours <= 168; // 1 hour to 7 days
    
    if (!isValid) {
      this.logger.warn('🚫 Invalid expiry hours', { 
        hours,
        allowedRange: '1-168 hours (1 hour to 7 days)'
      });
    }
    
    return isValid;
  }

  /**
   * Sanitize string input
   */
  sanitizeString(input: string): string {
    const sanitized = input.trim().replace(/[<>"'&]/g, '');
    
    if (sanitized !== input) {
      this.logger.log('🧹 String sanitized', { 
        original: input,
        sanitized: sanitized
      });
    }
    
    return sanitized;
  }

  /**
   * Validate blob name format
   */
  validateBlobName(name: string): boolean {
    // Azure blob name rules:
    // - 1-1024 characters
    // - case-sensitive
    // - any URL-safe characters
    // - avoid certain characters and patterns
    const forbiddenChars = /[<>:"\\|?*]/;
    const isValid = name.length >= 1 && 
                   name.length <= 1024 && 
                   !forbiddenChars.test(name) &&
                   !name.endsWith('.') &&
                   !name.includes('//');
    
    if (!isValid) {
      this.logger.warn('🚫 Invalid blob name format', { 
        name,
        length: name.length,
        rules: 'Must be 1-1024 chars, no forbidden chars (<>:"\\|?*), no trailing dots, no double slashes'
      });
    }
    
    return isValid;
  }

  /**
   * Validate reservation ID format and structure
   */
  validateReservationId(reservationId: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Check UUID format
    if (!this.validateUUID(reservationId)) {
      errors.push('Reservation ID must be a valid UUID');
    }
    
    // Additional business logic validation can be added here
    // For example: check if reservation exists, is active, etc.
    
    const isValid = errors.length === 0;
    
    if (!isValid) {
      this.logger.warn('🚫 Invalid reservation ID', { 
        reservationId,
        errors
      });
    }
    
    return { isValid, errors };
  }

  /**
   * Validate storage configuration
   */
  validateStorageConfig(config: {
    accountName?: string;
    accountKey?: string;
    connectionString?: string;
    containerName?: string;
  }): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!config.accountName) {
      errors.push('Storage account name is required');
    }
    
    if (!config.accountKey) {
      errors.push('Storage account key is required');
    }
    
    if (!config.connectionString) {
      errors.push('Storage connection string is required');
    }
    
    if (config.containerName && !this.validateContainerName(config.containerName)) {
      errors.push('Invalid container name format');
    }
    
    const isValid = errors.length === 0;
    
    if (!isValid) {
      this.logger.error('❌ Invalid storage configuration', { errors });
    } else {
      this.logger.log('✅ Storage configuration validated successfully');
    }
    
    return { isValid, errors };
  }
}
