/**
 * Imoje Payment Service
 *
 * RESPONSIBILITY: Integration with imoje payment gateway
 * ARCHITECTURE: Service for handling imoje API calls and webhook processing
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { createHash, createHmac } from 'crypto';
import { v4 as uuidv4 } from 'uuid';

// Imoje API Types
export interface ImojePaymentRequest {
  merchantId: string;
  serviceId: string;
  amount: number;
  currency: string;
  orderId: string;
  customerFirstName: string;
  customerLastName: string;
  customerEmail: string;
  orderDescription: string;
  urlSuccess: string;
  urlFailure: string;
  signature: string;
}

export interface ImojePaymentResponse {
  payment: {
    id: string;
    url: string;
    status: string;
  };
  transaction: {
    id: string;
    status: string;
  };
}

export interface ImojeWebhookPayload {
  payment: {
    id: string;
    status: string;
    amount: number;
    currency: string;
    title: string;
    orderId: string;
  };
  transaction: {
    id: string;
    status: string;
    type: string;
  };
  signature: string;
}

export interface ImojePaymentStatus {
  payment: {
    id: string;
    status: string;
    amount: number;
    currency: string;
    title: string;
    orderId: string;
    created: string;
    modified: string;
  };
  transaction: {
    id: string;
    status: string;
    type: string;
    created: string;
    modified: string;
  };
}

@Injectable()
export class ImojeService {
  private readonly logger = new Logger(ImojeService.name);
  private readonly httpClient: AxiosInstance;
  private readonly merchantId: string;
  private readonly serviceId: string;
  private readonly serviceKey: string;
  private readonly apiUrl: string;
  private readonly isProduction: boolean;

  constructor(private readonly configService: ConfigService) {
    // Load imoje configuration from environment
    this.merchantId = this.configService.get<string>('IMOJE_MERCHANT_ID') || '';
    this.serviceId = this.configService.get<string>('IMOJE_SERVICE_ID') || '';
    this.serviceKey = this.configService.get<string>('IMOJE_SERVICE_KEY') || '';
    this.apiUrl = this.configService.get<string>('IMOJE_API_URL') || 'https://sandbox.imoje.pl';
    this.isProduction = this.configService.get<string>('NODE_ENV') === 'production';

    // Configure HTTP client
    this.httpClient = axios.create({
      baseURL: this.apiUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Add request/response interceptors for logging
    this.httpClient.interceptors.request.use(
      (config) => {
        this.logger.debug('Imoje API Request', {
          method: config.method?.toUpperCase(),
          url: config.url,
          data: config.data ? JSON.stringify(config.data) : undefined,
        });
        return config;
      },
      (error) => {
        this.logger.error('Imoje API Request Error', { error: error.message });
        return Promise.reject(error);
      }
    );

    this.httpClient.interceptors.response.use(
      (response) => {
        this.logger.debug('Imoje API Response', {
          status: response.status,
          data: JSON.stringify(response.data),
        });
        return response;
      },
      (error) => {
        this.logger.error('Imoje API Response Error', {
          status: error.response?.status,
          data: error.response?.data ? JSON.stringify(error.response.data) : undefined,
          message: error.message,
        });
        return Promise.reject(error);
      }
    );

    this.logger.log('Imoje service initialized', {
      merchantId: this.merchantId,
      serviceId: this.serviceId,
      apiUrl: this.apiUrl,
      isProduction: this.isProduction,
    });
  }

  /**
   * Check if imoje service is properly configured
   */
  isConfigured(): boolean {
    return !!(this.merchantId && this.serviceId && this.serviceKey);
  }

  /**
   * Create a new payment in imoje
   */
  async createPayment(params: {
    amount: number;
    currency: string;
    orderId: string;
    customerFirstName: string;
    customerLastName: string;
    customerEmail: string;
    title: string;
    successReturnUrl: string;
    failureReturnUrl: string;
  }): Promise<ImojePaymentResponse> {
    try {
      this.logger.log('Creating imoje payment', {
        orderId: params.orderId,
        amount: params.amount,
        currency: params.currency,
        customerEmail: params.customerEmail,
      });

      if (!this.isConfigured()) {
        throw new Error('Imoje service is not properly configured');
      }

      // Convert amount to smallest currency unit (grosze for PLN)
      const amountInSmallestUnit = this.formatAmount(params.amount, params.currency);

      // Prepare payment request
      const paymentRequest: ImojePaymentRequest = {
        merchantId: this.merchantId,
        serviceId: this.serviceId,
        amount: amountInSmallestUnit,
        currency: params.currency,
        orderId: params.orderId,
        customerFirstName: params.customerFirstName,
        customerLastName: params.customerLastName,
        customerEmail: params.customerEmail,
        orderDescription: params.title,
        urlSuccess: params.successReturnUrl,
        urlFailure: params.failureReturnUrl,
        signature: this.generateSignature({
          ...params,
          amount: amountInSmallestUnit,
        }),
      };

      // Convert to form data (Imoje API expects form-encoded data, not JSON)
      const formData = new URLSearchParams();
      Object.entries(paymentRequest).forEach(([key, value]) => {
        formData.append(key, value.toString());
      });

      // Make API call to imoje (response can be HTML or JSON)
      const response: AxiosResponse<any> = await this.httpClient.post(
        '/payment',
        formData,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      this.logger.log('Imoje API response received', {
        status: response.status,
        contentType: response.headers['content-type'],
        dataType: typeof response.data,
        dataLength: response.data?.length || 'N/A',
      });

      // Handle HTML response (Imoje returns HTML payment page)
      if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
        this.logger.log('Received HTML payment page from Imoje');

        // Extract payment ID from the HTML content
        const paymentIdMatch = response.data.match(/\/pay\/([a-f0-9-]{36})/);
        const paymentId = paymentIdMatch ? paymentIdMatch[1] : `imoje_${Date.now()}`;

        // Extract payment URL from the HTML
        const baseUrl = this.apiUrl.replace('/payment', '');
        const paymentUrl = `${baseUrl}/en/pay/${paymentId}`;

        // Create standardized response
        const paymentData: ImojePaymentResponse = {
          payment: {
            id: paymentId,
            url: paymentUrl,
            status: 'new',
          },
          transaction: {
            id: paymentId,
            status: 'new',
          },
        };

        this.logger.log('Extracted payment information from HTML', {
          paymentId,
          paymentUrl,
        });

        return paymentData;
      }

      // Handle JSON response (fallback)
      if (response.data && typeof response.data === 'object') {
        const responseData: any = response.data;

        if (responseData.payment && responseData.transaction) {
          return responseData;
        }

        if (responseData.url) {
          return {
            payment: {
              id: responseData.id || 'unknown',
              url: responseData.url,
              status: responseData.status || 'new',
            },
            transaction: {
              id: responseData.transactionId || responseData.id || 'unknown',
              status: responseData.status || 'new',
            },
          };
        }
      }

      throw new Error(`Unrecognized Imoje response format. Content-Type: ${response.headers['content-type']}, Data type: ${typeof response.data}`);
    } catch (error) {
      this.logger.error('Failed to create imoje payment', {
        error: error.message,
        orderId: params.orderId,
        amount: params.amount,
        stack: error.stack,
      });

      // Provide specific error messages for common issues
      if (error.message.includes('EBUSY') || error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
        throw new Error(`Network connectivity issue with Imoje API (${this.apiUrl}): ${error.message}. Please check your internet connection and DNS settings.`);
      }

      if (error.response?.status === 401) {
        throw new Error('Imoje authentication failed. Please verify your IMOJE_MERCHANT_ID, IMOJE_SERVICE_ID, and IMOJE_SERVICE_KEY credentials.');
      }

      if (error.response?.status === 400) {
        throw new Error(`Imoje API rejected the payment request: ${error.response.data?.message || error.message}`);
      }

      throw new Error(`Imoje payment creation failed: ${error.message}`);
    }
  }

  /**
   * Get payment status from imoje
   */
  async getPaymentStatus(paymentId: string): Promise<ImojePaymentStatus> {
    try {
      this.logger.debug('Fetching imoje payment status', { paymentId });

      if (!this.isConfigured()) {
        throw new Error('Imoje service is not properly configured');
      }

      const response: AxiosResponse<ImojePaymentStatus> = await this.httpClient.get(
        `/api/payment/${paymentId}`
      );

      this.logger.debug('Imoje payment status fetched', {
        paymentId,
        status: response.data.payment.status,
        transactionStatus: response.data.transaction.status,
      });

      return response.data;
    } catch (error) {
      this.logger.error('Failed to fetch imoje payment status', {
        error: error.message,
        paymentId,
      });
      throw new Error(`Imoje payment status fetch failed: ${error.message}`);
    }
  }

  /**
   * Verify webhook signature from imoje
   */
  verifyWebhookSignature(payload: ImojeWebhookPayload): boolean {
    try {
      if (!this.isConfigured()) {
        this.logger.warn('Cannot verify webhook signature - imoje not configured');
        return false;
      }

      // Generate expected signature
      const expectedSignature = this.generateWebhookSignature(payload);

      // Compare signatures
      const isValid = expectedSignature === payload.signature;

      this.logger.debug('Webhook signature verification', {
        paymentId: payload.payment.id,
        isValid,
        receivedSignature: payload.signature,
        expectedSignature,
      });

      return isValid;
    } catch (error) {
      this.logger.error('Webhook signature verification failed', {
        error: error.message,
        paymentId: payload.payment?.id,
      });
      return false;
    }
  }

  /**
   * Map imoje payment status to our internal status
   */
  mapPaymentStatus(imojeStatus: string): string {
    const statusMap: Record<string, string> = {
      'new': 'pending',
      'pending': 'pending',
      'settled': 'completed',
      'cancelled': 'cancelled',
      'rejected': 'failed',
      'error': 'failed',
    };

    return statusMap[imojeStatus.toLowerCase()] || 'pending';
  }

  /**
   * Generate signature for payment request
   */
  private generateSignature(params: {
    amount: number;
    currency: string;
    orderId: string;
    customerFirstName: string;
    customerLastName: string;
    customerEmail: string;
    title: string;
    successReturnUrl: string;
    failureReturnUrl: string;
  }): string {
    // Prepare payment data for signature (according to Imoje API spec)
    const paymentData = {
      merchantId: this.merchantId,
      serviceId: this.serviceId,
      amount: params.amount,
      currency: params.currency,
      orderId: params.orderId,
      customerFirstName: params.customerFirstName,
      customerLastName: params.customerLastName,
      customerEmail: params.customerEmail,
      orderDescription: params.title,
      urlSuccess: params.successReturnUrl,
      urlFailure: params.failureReturnUrl,
    };

    // Sort parameters alphabetically by key
    const sortedKeys = Object.keys(paymentData).sort();

    // Create query string format: param1=value1&param2=value2...
    const queryString = sortedKeys
      .map(key => `${key}=${paymentData[key]}`)
      .join('&');

    // Generate SHA256 hash: sha256(queryString + serviceKey)
    const signature = createHash('sha256')
      .update(queryString + this.serviceKey)
      .digest('hex');

    // Add algorithm suffix: signature + ';sha256'
    const finalSignature = `${signature};sha256`;

    this.logger.debug('Generated payment signature', {
      queryString,
      serviceKey: this.serviceKey.substring(0, 8) + '...',
      signature,
      finalSignature,
    });

    return finalSignature;
  }

  /**
   * Generate signature for webhook verification
   */
  private generateWebhookSignature(payload: ImojeWebhookPayload): string {
    // Imoje webhook signature format: paymentId;status;amount;currency;transactionId;transactionStatus
    const signatureData = [
      payload.payment.id,
      payload.payment.status,
      payload.payment.amount.toString(),
      payload.payment.currency,
      payload.transaction.id,
      payload.transaction.status,
    ].join(';');

    // Generate HMAC-SHA256 signature
    const signature = createHmac('sha256', this.serviceKey)
      .update(signatureData)
      .digest('hex');

    return signature;
  }

  /**
   * Generate unique order ID
   */
  generateOrderId(prefix: string = 'ORDER'): string {
    const timestamp = Date.now();
    const uuid = uuidv4().split('-')[0]; // Use first part of UUID
    return `${prefix}_${timestamp}_${uuid}`;
  }

  /**
   * Format amount for imoje (convert to grosze/cents)
   */
  formatAmount(amount: number, currency: string): number {
    // Imoje expects amounts in smallest currency unit (grosze for PLN, cents for EUR/USD)
    return Math.round(amount * 100);
  }

  /**
   * Parse amount from imoje (convert from grosze/cents)
   */
  parseAmount(amount: number, currency: string): number {
    // Convert from smallest currency unit back to main unit
    return amount / 100;
  }

  /**
   * Get service configuration for debugging
   */
  getConfiguration(): {
    merchantId: string;
    serviceId: string;
    apiUrl: string;
    isProduction: boolean;
    isConfigured: boolean;
  } {
    return {
      merchantId: this.merchantId,
      serviceId: this.serviceId,
      apiUrl: this.apiUrl,
      isProduction: this.isProduction,
      isConfigured: this.isConfigured(),
    };
  }
}
