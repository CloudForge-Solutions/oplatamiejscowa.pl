/**
 * API Service - Platform Service
 * 
 * ARCHITECTURE: Centralized Azure Functions communication
 * - Simple polling for payment status updates (no WebSocket complexity)
 * - Smart caching with TTL support
 * - Mobile-first performance optimization
 * - Fail-fast validation with proper error handling
 * - EventBus integration for API events
 */

import { logger, API_ENDPOINTS, CACHE_CONFIG } from '../../constants';

interface ApiOptions {
    timeout?: number;
    retries?: number;
    cache?: boolean;
    cacheTTL?: number;
}

interface ApiResponse<T> {
    data: T;
    status: number;
    statusText: string;
    headers: Record<string, string>;
}

interface PaymentStatus {
    id: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    amount: number;
    currency: string;
    lastUpdated: string;
    receiptUrl?: string;
}

interface SASTokenResponse {
    blobPath: string;
    sasToken: string;
    fullUrl: string;
    expiresAt: string;
}

/**
 * ApiService - Centralized API communication
 *
 * ARCHITECTURE PRINCIPLE: Single source of truth for all API operations
 * - Azure Functions backend communication
 * - Smart caching with TTL support
 * - Simple polling for status updates
 * - Mobile-first performance optimization
 */
export class ApiService {
    private baseUrl: string;
    private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

    constructor(baseUrl: string = 'http://localhost:7071/api') {
        this.baseUrl = baseUrl;
        
        logger.info('🌐 ApiService initialized', {
            baseUrl: this.baseUrl,
            cacheEnabled: true,
            defaultTimeout: 10000
        });
    }

    /**
     * Generic GET request
     */
    async get<T>(endpoint: string, options: ApiOptions = {}): Promise<ApiResponse<T>> {
        const cacheKey = `GET:${endpoint}`;
        
        // Check cache first
        if (options.cache !== false) {
            const cached = this.getFromCache<T>(cacheKey);
            if (cached) {
                logger.debug(`API cache hit: ${endpoint}`);
                return cached;
            }
        }

        const response = await this.makeRequest<T>('GET', endpoint, undefined, options);
        
        // Cache successful responses
        if (options.cache !== false && response.status >= 200 && response.status < 300) {
            this.setCache(cacheKey, response, options.cacheTTL || CACHE_CONFIG.DEFAULT_TTL);
        }

        return response;
    }

    /**
     * Generic POST request
     */
    async post<T>(endpoint: string, data?: any, options: ApiOptions = {}): Promise<ApiResponse<T>> {
        return this.makeRequest<T>('POST', endpoint, data, options);
    }

    /**
     * Generic PUT request
     */
    async put<T>(endpoint: string, data?: any, options: ApiOptions = {}): Promise<ApiResponse<T>> {
        return this.makeRequest<T>('PUT', endpoint, data, options);
    }

    /**
     * Generic DELETE request
     */
    async delete<T>(endpoint: string, options: ApiOptions = {}): Promise<ApiResponse<T>> {
        return this.makeRequest<T>('DELETE', endpoint, undefined, options);
    }

    /**
     * Get payment status (polling endpoint)
     */
    async getPaymentStatus(paymentId: string): Promise<PaymentStatus> {
        const response = await this.get<PaymentStatus>(
            `${API_ENDPOINTS.PAYMENT_STATUS}/${paymentId}`,
            { 
                cache: true, 
                cacheTTL: CACHE_CONFIG.PAYMENT_STATUS_TTL 
            }
        );

        logger.debug('Payment status retrieved', { 
            paymentId, 
            status: response.data.status 
        });

        return response.data;
    }

    /**
     * Generate SAS token for blob access
     */
    async generateSASToken(reservationId: string): Promise<SASTokenResponse> {
        const response = await this.post<SASTokenResponse>(
            API_ENDPOINTS.GENERATE_SAS,
            { reservationId },
            { 
                cache: true, 
                cacheTTL: CACHE_CONFIG.SAS_TOKEN_TTL 
            }
        );

        logger.info('SAS token generated', { 
            reservationId, 
            expiresAt: response.data.expiresAt 
        });

        return response.data;
    }

    /**
     * Initiate payment process
     */
    async initiatePayment(paymentData: {
        reservationId: string;
        amount: number;
        currency: string;
        returnUrl: string;
    }): Promise<{ paymentId: string; paymentUrl: string }> {
        const response = await this.post<{ paymentId: string; paymentUrl: string }>(
            API_ENDPOINTS.INITIATE_PAYMENT,
            paymentData
        );

        logger.info('Payment initiated', { 
            reservationId: paymentData.reservationId,
            paymentId: response.data.paymentId 
        });

        return response.data;
    }

    /**
     * Make HTTP request with retry logic
     */
    private async makeRequest<T>(
        method: string,
        endpoint: string,
        data?: any,
        options: ApiOptions = {}
    ): Promise<ApiResponse<T>> {
        const url = `${this.baseUrl}${endpoint}`;
        const timeout = options.timeout || 10000;
        const retries = options.retries || 2;

        let lastError: Error | null = null;

        for (let attempt = 0; attempt <= retries; attempt++) {
            try {
                logger.debug(`API ${method} request`, { 
                    url, 
                    attempt: attempt + 1, 
                    hasData: !!data 
                });

                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), timeout);

                const response = await fetch(url, {
                    method,
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: data ? JSON.stringify(data) : undefined,
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const responseData = await response.json();
                const headers: Record<string, string> = {};
                response.headers.forEach((value, key) => {
                    headers[key] = value;
                });

                const apiResponse: ApiResponse<T> = {
                    data: responseData,
                    status: response.status,
                    statusText: response.statusText,
                    headers
                };

                logger.debug(`API ${method} success`, { 
                    url, 
                    status: response.status,
                    attempt: attempt + 1
                });

                return apiResponse;

            } catch (error) {
                lastError = error as Error;
                
                logger.warn(`API ${method} attempt ${attempt + 1} failed`, { 
                    url, 
                    error: lastError.message 
                });

                // Don't retry on the last attempt
                if (attempt === retries) {
                    break;
                }

                // Wait before retry (exponential backoff)
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
            }
        }

        logger.error(`API ${method} failed after ${retries + 1} attempts`, { 
            url, 
            error: lastError?.message 
        });

        throw lastError || new Error('API request failed');
    }

    /**
     * Get data from cache
     */
    private getFromCache<T>(key: string): ApiResponse<T> | null {
        const entry = this.cache.get(key);
        if (!entry) {
            return null;
        }

        // Check if cache entry is expired
        if (Date.now() - entry.timestamp > entry.ttl) {
            this.cache.delete(key);
            return null;
        }

        return entry.data;
    }

    /**
     * Set data in cache
     */
    private setCache<T>(key: string, data: ApiResponse<T>, ttl: number): void {
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            ttl
        });
    }

    /**
     * Clear API cache
     */
    clearCache(): void {
        this.cache.clear();
        logger.info('API cache cleared');
    }
}

// Create singleton instance
export const apiService = new ApiService();

// Export as default for easy importing
export default apiService;
