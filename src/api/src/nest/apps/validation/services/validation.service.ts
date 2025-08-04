/**
 * Validation Service
 * 
 * RESPONSIBILITY: Core validation logic
 * ARCHITECTURE: NestJS service with validation utilities
 */

import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ValidationService {
  private readonly logger = new Logger(ValidationService.name);

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
   * Validate email format
   */
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);
    
    if (!isValid) {
      this.logger.warn('🚫 Invalid email format', { email });
    }
    
    return isValid;
  }

  /**
   * Validate phone number format (Polish format)
   */
  validatePhoneNumber(phone: string): boolean {
    // Polish phone number formats: +48123456789, 123456789, 123-456-789
    const phoneRegex = /^(\+48)?[\s-]?[1-9]\d{8}$/;
    const isValid = phoneRegex.test(phone.replace(/[\s-]/g, ''));
    
    if (!isValid) {
      this.logger.warn('🚫 Invalid phone number format', { phone });
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
   * Validate required fields
   */
  validateRequiredFields(data: Record<string, any>, requiredFields: string[]): { isValid: boolean; missingFields: string[] } {
    const missingFields: string[] = [];
    
    for (const field of requiredFields) {
      if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
        missingFields.push(field);
      }
    }
    
    const isValid = missingFields.length === 0;
    
    if (!isValid) {
      this.logger.warn('🚫 Missing required fields', { 
        missingFields,
        providedFields: Object.keys(data)
      });
    }
    
    return { isValid, missingFields };
  }
}
