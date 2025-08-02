/**
 * ImojePaymentService - Handles imoje payment gateway integration
 * Follows single responsibility principle - only manages imoje payment operations
 */

export interface ImojePaymentRequest {
  amount: number; // Amount in PLN (e.g., 3.50)
  currency: 'PLN';
  orderId: string; // Unique order identifier
  description: string;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  returnUrl: string;
  notifyUrl: string;
  language: 'pl' | 'en';
  validityTime?: number; // Payment validity in minutes (default: 15)
}

export interface ImojePaymentResponse {
  success: boolean;
  paymentId?: string;
  paymentUrl?: string;
  status?: 'created' | 'pending' | 'completed' | 'failed' | 'cancelled';
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface ImojePaymentStatus {
  paymentId: string;
  orderId: string;
  status: 'created' | 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  amount: number;
  currency: 'PLN';
  paymentMethod?: string;
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
  failureReason?: string;
}

export interface ImojeNotification {
  paymentId: string;
  orderId: string;
  status: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  transactionId: string;
  signature: string;
  timestamp: string;
}

export interface ImojeConfig {
  merchantId: string;
  serviceId: string;
  serviceKey: string;
  environment: 'sandbox' | 'production';
  apiUrl: string;
  jsUrl: string;
}

export class ImojePaymentService {
  private config: ImojeConfig;
  private isInitialized = false;

  constructor(config: ImojeConfig) {
    this.config = config;
  }

  /**
   * Initialize imoje SDK
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Load imoje SDK script
      await this.loadImojeSDK();

      // Initialize SDK with merchant configuration
      if (window.imoje) {
        window.imoje.init({
          merchantId: this.config.merchantId,
          serviceId: this.config.serviceId,
          environment: this.config.environment
        });
      }

      this.isInitialized = true;
      console.log('imoje SDK initialized successfully');
    } catch (error) {
      console.error('Failed to initialize imoje SDK:', error);
      throw new Error('imoje SDK initialization failed');
    }
  }

  /**
   * Load imoje SDK script dynamically
   */
  private loadImojeSDK(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if SDK is already loaded
      if (window.imoje) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = this.config.jsUrl;
      script.async = true;

      script.onload = () => {
        if (window.imoje) {
          resolve();
        } else {
          reject(new Error('imoje SDK not available after loading'));
        }
      };

      script.onerror = () => {
        reject(new Error('Failed to load imoje SDK'));
      };

      document.head.appendChild(script);
    });
  }

  /**
   * Create a payment
   */
  async createPayment(request: ImojePaymentRequest): Promise<ImojePaymentResponse> {
    if (!this.isInitialized) {
      throw new Error('imoje SDK not initialized');
    }

    try {
      // Validate request
      this.validatePaymentRequest(request);

      // Convert amount to grosze (smallest currency unit)
      const amountInGrosze = Math.round(request.amount * 100);

      // Prepare payment data
      const paymentData = {
        serviceId: this.config.serviceId,
        amount: amountInGrosze,
        currency: request.currency,
        orderId: request.orderId,
        description: request.description,
        customer: {
          email: request.customerEmail,
          name: request.customerName,
          phone: request.customerPhone
        },
        urlReturn: request.returnUrl,
        urlFailure: request.returnUrl,
        urlNotification: request.notifyUrl,
        language: request.language,
        validityTime: request.validityTime || 15
      };

      // Create payment using imoje API
      const response = await this.makeAPIRequest('/payment', 'POST', paymentData);

      if (response.success) {
        return {
          success: true,
          paymentId: response.data.paymentId,
          paymentUrl: response.data.paymentUrl,
          status: 'created'
        };
      } else {
        return {
          success: false,
          error: {
            code: response.error?.code || 'PAYMENT_CREATION_FAILED',
            message: response.error?.message || 'Failed to create payment',
            details: response.error
          }
        };
      }
    } catch (error) {
      console.error('Payment creation failed:', error);
      return {
        success: false,
        error: {
          code: 'PAYMENT_CREATION_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
          details: error
        }
      };
    }
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(paymentId: string): Promise<ImojePaymentStatus | null> {
    if (!this.isInitialized) {
      throw new Error('imoje SDK not initialized');
    }

    try {
      const response = await this.makeAPIRequest(`/payment/${paymentId}`, 'GET');

      if (response.success && response.data) {
        return {
          paymentId: response.data.paymentId,
          orderId: response.data.orderId,
          status: response.data.status,
          amount: response.data.amount / 100, // Convert from grosze to PLN
          currency: response.data.currency,
          paymentMethod: response.data.paymentMethod,
          transactionId: response.data.transactionId,
          createdAt: response.data.createdAt,
          updatedAt: response.data.updatedAt,
          failureReason: response.data.failureReason
        };
      }

      return null;
    } catch (error) {
      console.error('Failed to get payment status:', error);
      return null;
    }
  }

  /**
   * Validate payment request
   */
  private validatePaymentRequest(request: ImojePaymentRequest): void {
    if (!request.amount || request.amount <= 0) {
      throw new Error('Invalid payment amount');
    }

    if (request.amount < 0.01) {
      throw new Error('Minimum payment amount is 0.01 PLN');
    }

    if (request.amount > 999999.99) {
      throw new Error('Maximum payment amount is 999,999.99 PLN');
    }

    if (!request.orderId || request.orderId.length < 1 || request.orderId.length > 100) {
      throw new Error('Order ID must be between 1 and 100 characters');
    }

    if (!request.description || request.description.length > 255) {
      throw new Error('Description is required and must be max 255 characters');
    }

    if (!request.customerEmail || !this.isValidEmail(request.customerEmail)) {
      throw new Error('Valid customer email is required');
    }

    if (!request.customerName || request.customerName.length > 100) {
      throw new Error('Customer name is required and must be max 100 characters');
    }

    if (!request.returnUrl || !this.isValidUrl(request.returnUrl)) {
      throw new Error('Valid return URL is required');
    }

    if (!request.notifyUrl || !this.isValidUrl(request.notifyUrl)) {
      throw new Error('Valid notification URL is required');
    }
  }

  /**
   * Make API request to imoje
   */
  private async makeAPIRequest(endpoint: string, method: 'GET' | 'POST', data?: any): Promise<any> {
    const url = `${this.config.apiUrl}${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.config.serviceKey}`
    };

    const requestOptions: RequestInit = {
      method,
      headers,
      ...(data && { body: JSON.stringify(data) })
    };

    try {
      const response = await fetch(url, requestOptions);
      const responseData = await response.json();

      if (response.ok) {
        return {
          success: true,
          data: responseData
        };
      } else {
        return {
          success: false,
          error: {
            code: responseData.code || 'API_ERROR',
            message: responseData.message || 'API request failed',
            details: responseData
          }
        };
      }
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate URL format
   */
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Verify notification signature (webhook security)
   */
  verifyNotificationSignature(notification: ImojeNotification): boolean {
    try {
      // Implementation would depend on imoje's signature algorithm
      // This is a placeholder for the actual signature verification
      const expectedSignature = this.calculateSignature(notification);
      return expectedSignature === notification.signature;
    } catch (error) {
      console.error('Signature verification failed:', error);
      return false;
    }
  }

  /**
   * Calculate notification signature
   */
  private calculateSignature(notification: ImojeNotification): string {
    // This would implement imoje's specific signature calculation
    // Placeholder implementation
    const data = `${notification.paymentId}${notification.orderId}${notification.status}${notification.amount}`;
    return btoa(data); // This is just a placeholder
  }

  /**
   * Get supported payment methods
   */
  getSupportedPaymentMethods(): string[] {
    return [
      'blik',
      'pbl', // Online bank transfers
      'card', // Credit/debit cards
      'imoje_paylater', // Buy now, pay later
      'apple_pay',
      'google_pay'
    ];
  }

  /**
   * Check if imoje is available
   */
  static isAvailable(): boolean {
    return typeof window !== 'undefined';
  }
}

// Extend Window interface for imoje SDK
declare global {
  interface Window {
    imoje?: {
      init: (config: { merchantId: string; serviceId: string; environment: string }) => void;
      createPayment: (data: any) => Promise<any>;
      getPaymentStatus: (paymentId: string) => Promise<any>;
    };
  }
}
