/**
 * Rate Limiting Guard
 * 
 * RESPONSIBILITY: Implement rate limiting for NestJS controllers
 * ARCHITECTURE: NestJS guard with in-memory rate limiting
 */

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

/**
 * Rate Limit Entry
 */
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly logger = new Logger(RateLimitGuard.name);
  private readonly rateLimitStore = new Map<string, RateLimitEntry>();
  private readonly requestsPerMinute: number;
  private readonly windowSizeMs: number;

  constructor(private readonly configService: ConfigService) {
    this.requestsPerMinute = this.configService.get<number>('rateLimit.requestsPerMinute') || 60;
    this.windowSizeMs = this.configService.get<number>('rateLimit.windowSizeMs') || 60000;

    // Clean up old entries every 5 minutes
    setInterval(() => this.cleanupOldEntries(), 5 * 60 * 1000);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const clientId = this.getClientIdentifier(request);
    const now = Date.now();

    try {
      // Get or create rate limit entry
      let entry = this.rateLimitStore.get(clientId);

      if (!entry || entry.resetTime <= now) {
        // Create new entry or reset expired entry
        entry = {
          count: 1,
          resetTime: now + this.windowSizeMs,
        };
        this.rateLimitStore.set(clientId, entry);

        this.logger.log('🔄 Rate limit entry created/reset', {
          clientId: clientId,
          count: entry.count,
          resetTime: new Date(entry.resetTime).toISOString(),
        });

        return true;
      }

      // Check if limit exceeded
      if (entry.count >= this.requestsPerMinute) {
        this.logger.warn('🚫 Rate limit exceeded', {
          clientId: clientId,
          count: entry.count,
          limit: this.requestsPerMinute,
          resetTime: new Date(entry.resetTime).toISOString(),
        });

        throw new HttpException(
          {
            statusCode: HttpStatus.TOO_MANY_REQUESTS,
            message: 'Rate limit exceeded. Please try again later.',
            error: 'Too Many Requests',
            retryAfter: Math.ceil((entry.resetTime - now) / 1000),
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      // Increment counter
      entry.count++;
      this.rateLimitStore.set(clientId, entry);

      this.logger.log('✅ Rate limit check passed', {
        clientId: clientId,
        count: entry.count,
        remaining: this.requestsPerMinute - entry.count,
        resetTime: new Date(entry.resetTime).toISOString(),
      });

      return true;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error('❌ Rate limiting error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        clientId: clientId,
      });

      // Allow request on error (fail open)
      return true;
    }
  }

  /**
   * Get client identifier from request
   */
  private getClientIdentifier(request: Request): string {
    // Try to get real IP from headers (when behind proxy/load balancer)
    const forwardedFor = request.headers['x-forwarded-for'] as string;
    const realIp = request.headers['x-real-ip'] as string;
    const clientIp = request.headers['x-client-ip'] as string;

    // Use the first available IP
    const ip = forwardedFor?.split(',')[0]?.trim() || realIp || clientIp || request.ip || 'unknown';

    return `ip:${ip}`;
  }

  /**
   * Clean up old rate limit entries
   */
  private cleanupOldEntries(): void {
    try {
      const now = Date.now();
      let cleanedCount = 0;

      for (const [key, entry] of this.rateLimitStore.entries()) {
        if (entry.resetTime <= now) {
          this.rateLimitStore.delete(key);
          cleanedCount++;
        }
      }

      if (cleanedCount > 0) {
        this.logger.log('🧹 Rate limit store cleanup completed', {
          cleanedEntries: cleanedCount,
          remainingEntries: this.rateLimitStore.size,
        });
      }
    } catch (error) {
      this.logger.error('❌ Rate limit cleanup error', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get rate limit status for client
   */
  getRateLimitStatus(request: Request): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
  } {
    const clientId = this.getClientIdentifier(request);
    const entry = this.rateLimitStore.get(clientId);

    if (!entry) {
      return {
        allowed: true,
        remaining: this.requestsPerMinute,
        resetTime: Date.now() + this.windowSizeMs,
      };
    }

    const remaining = Math.max(0, this.requestsPerMinute - entry.count);

    return {
      allowed: remaining > 0,
      remaining: remaining,
      resetTime: entry.resetTime,
    };
  }
}
