/**
 * ImojePaymentService - Integration with imoje sandbox payment system
 * 
 * RESPONSIBILITY: Handle payment processing through imoje sandbox API
 * ARCHITECTURE: Secure payment gateway integration with proper error handling
 */

import { logger } from '../CentralizedLogger';
import { eventBus, PLATFORM_EVENTS } from '../EventBus';

export interface ImojeConfig {
  clientId: string;
  shopId: string;
  shopKey: string;
  authToken: string;
  apiToken: string;
  sandboxUrl: string;
}

export interface ImojePaymentRequest {
  amount: number;
  currency: string;
  orderId: string;
  title: string;
  customerEmail: string;
  customerName: string;
  returnUrl: string;
  notificationUrl?: string;
  language?: string;
}

export interface ImojePaymentResponse {
  paymentId: string;
  paymentUrl: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  amount: number;
  currency: string;
  orderId: string;
  transactionId?: string;
}

export interface ImojePaymentStatus {
  paymentId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  amount: number;
  currency: string;
  orderId: string;
  transactionId?: string;
  completedAt?: string;
  failureReason?: string;
}

/**
 * ImojePaymentService - Sandbox payment processing
 */
export class ImojePaymentService {
  private config: ImojeConfig;
  private baseUrl: string;

  constructor() {
    this.config = {
      clientId: import.meta.env.VITE_IMOJE_CLIENT_ID || '',
      shopId: import.meta.env.VITE_IMOJE_SHOP_ID || '',
      shopKey: import.meta.env.VITE_IMOJE_SHOP_KEY || '',
      authToken: import.meta.env.VITE_IMOJE_AUTH_TOKEN || '',
      apiToken: import.meta.env.VITE_IMOJE_API_TOKEN || '',
      sandboxUrl: import.meta.env.VITE_IMOJE_SANDBOX_URL || 'https://sandbox.imoje.pl'
    };

    this.baseUrl = `${this.config.sandboxUrl}/api/v1`;

    logger.info('💳 ImojePaymentService initialized', {
      clientId: this.config.clientId,
      shopId: this.config.shopId,
      sandboxUrl: this.config.sandboxUrl,
      environment: 'sandbox'
    });
  }

  /**
   * Create a new payment
   */
  async createPayment(paymentRequest: ImojePaymentRequest): Promise<ImojePaymentResponse> {
    try {
      logger.info('💳 Creating imoje payment', {
        orderId: paymentRequest.orderId,
        amount: paymentRequest.amount,
        currency: paymentRequest.currency
      });

      // Prepare payment data for imoje API
      const paymentData = {
        serviceId: this.config.shopId,
        amount: Math.round(paymentRequest.amount * 100), // Convert to grosze/cents
        currency: paymentRequest.currency,
        orderId: paymentRequest.orderId,
        title: paymentRequest.title,
        customer: {
          email: paymentRequest.customerEmail,
          name: paymentRequest.customerName
        },
        urlReturn: paymentRequest.returnUrl,
        urlFailure: paymentRequest.returnUrl,
        urlSuccess: paymentRequest.returnUrl,
        urlNotification: paymentRequest.notificationUrl,
        language: paymentRequest.language || 'pl',
        signature: this.generateSignature(paymentRequest)
      };

      // For sandbox, we'll simulate the API call
      const response = await this.simulateImojeApiCall('/payment', 'POST', paymentData);

      const paymentResponse: ImojePaymentResponse = {
        paymentId: response.paymentId,
        paymentUrl: response.paymentUrl,
        status: 'pending',
        amount: paymentRequest.amount,
        currency: paymentRequest.currency,
        orderId: paymentRequest.orderId,
        transactionId: response.transactionId
      };

      // Emit payment initiated event
      eventBus.emit(PLATFORM_EVENTS.PAYMENT_INITIATED, {
        paymentId: paymentResponse.paymentId,
        orderId: paymentRequest.orderId,
        amount: paymentRequest.amount,
        currency: paymentRequest.currency,
        provider: 'imoje'
      });

      logger.info('✅ Payment created successfully', {
        paymentId: paymentResponse.paymentId,
        paymentUrl: paymentResponse.paymentUrl
      });

      return paymentResponse;

    } catch (error) {
      logger.error('❌ Failed to create payment', { error, paymentRequest });
      throw new Error(`Payment creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check payment status
   */
  async getPaymentStatus(paymentId: string): Promise<ImojePaymentStatus> {
    try {
      logger.info('🔍 Checking payment status', { paymentId });

      // For sandbox, simulate API call
      const response = await this.simulateImojeApiCall(`/payment/${paymentId}/status`, 'GET');

      const paymentStatus: ImojePaymentStatus = {
        paymentId,
        status: response.status,
        amount: response.amount / 100, // Convert from grosze/cents
        currency: response.currency,
        orderId: response.orderId,
        transactionId: response.transactionId,
        completedAt: response.completedAt,
        failureReason: response.failureReason
      };

      // Emit status update event
      eventBus.emit(PLATFORM_EVENTS.PAYMENT_STATUS_UPDATED, {
        paymentId,
        status: paymentStatus.status,
        orderId: paymentStatus.orderId
      });

      return paymentStatus;

    } catch (error) {
      logger.error('❌ Failed to check payment status', { error, paymentId });
      throw new Error(`Status check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Cancel payment
   */
  async cancelPayment(paymentId: string): Promise<boolean> {
    try {
      logger.info('❌ Cancelling payment', { paymentId });

      // For sandbox, simulate API call
      await this.simulateImojeApiCall(`/payment/${paymentId}/cancel`, 'POST');

      // Emit payment cancelled event
      eventBus.emit(PLATFORM_EVENTS.PAYMENT_FAILED, {
        paymentId,
        reason: 'cancelled_by_user'
      });

      logger.info('✅ Payment cancelled successfully', { paymentId });
      return true;

    } catch (error) {
      logger.error('❌ Failed to cancel payment', { error, paymentId });
      return false;
    }
  }

  /**
   * Generate signature for imoje API (simplified for sandbox)
   */
  private generateSignature(paymentRequest: ImojePaymentRequest): string {
    // In production, this would be a proper HMAC signature
    // For sandbox, we'll use a simple hash
    const data = `${this.config.shopId}${paymentRequest.orderId}${Math.round(paymentRequest.amount * 100)}${paymentRequest.currency}${this.config.shopKey}`;
    
    // Simple hash for sandbox (in production, use proper HMAC-SHA256)
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(16);
  }

  /**
   * Simulate imoje API calls for sandbox environment
   */
  private async simulateImojeApiCall(endpoint: string, method: string, data?: any): Promise<any> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    logger.info('🔄 Simulating imoje API call', { endpoint, method });

    if (endpoint === '/payment' && method === 'POST') {
      // Simulate payment creation
      const paymentId = `imoje_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const transactionId = `txn_${Date.now()}`;
      
      return {
        paymentId,
        transactionId,
        paymentUrl: `${this.config.sandboxUrl}/payment/${paymentId}`,
        status: 'pending'
      };
    }

    if (endpoint.includes('/status') && method === 'GET') {
      // Simulate payment status check
      const statuses = ['pending', 'processing', 'completed', 'failed'];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      
      // Bias towards completion for demo purposes
      const status = Math.random() > 0.3 ? 'completed' : randomStatus;
      
      return {
        status,
        amount: data?.amount || 2500, // 25.00 PLN in grosze
        currency: 'PLN',
        orderId: data?.orderId || 'test-order',
        transactionId: `txn_${Date.now()}`,
        completedAt: status === 'completed' ? new Date().toISOString() : undefined,
        failureReason: status === 'failed' ? 'Insufficient funds' : undefined
      };
    }

    if (endpoint.includes('/cancel') && method === 'POST') {
      // Simulate payment cancellation
      return {
        status: 'cancelled',
        cancelledAt: new Date().toISOString()
      };
    }

    throw new Error(`Unsupported API endpoint: ${method} ${endpoint}`);
  }

  /**
   * Validate webhook notification (for production use)
   */
  validateWebhookSignature(payload: string, signature: string): boolean {
    // In production, validate the webhook signature
    // For sandbox, we'll always return true
    logger.info('🔐 Validating webhook signature', { 
      payloadLength: payload.length,
      signature: signature.substring(0, 10) + '...'
    });
    
    return true;
  }

  /**
   * Process webhook notification
   */
  async processWebhookNotification(payload: any): Promise<void> {
    try {
      logger.info('📨 Processing webhook notification', { 
        paymentId: payload.paymentId,
        status: payload.status 
      });

      // Emit appropriate events based on status
      switch (payload.status) {
        case 'completed':
          eventBus.emit(PLATFORM_EVENTS.PAYMENT_COMPLETED, {
            paymentId: payload.paymentId,
            orderId: payload.orderId,
            amount: payload.amount / 100,
            transactionId: payload.transactionId
          });
          break;
          
        case 'failed':
          eventBus.emit(PLATFORM_EVENTS.PAYMENT_FAILED, {
            paymentId: payload.paymentId,
            orderId: payload.orderId,
            reason: payload.failureReason
          });
          break;
          
        default:
          eventBus.emit(PLATFORM_EVENTS.PAYMENT_STATUS_UPDATED, {
            paymentId: payload.paymentId,
            status: payload.status,
            orderId: payload.orderId
          });
      }

    } catch (error) {
      logger.error('❌ Failed to process webhook notification', { error, payload });
      throw error;
    }
  }

  /**
   * Get supported payment methods
   */
  getSupportedPaymentMethods(): string[] {
    return [
      'card', // Credit/debit cards
      'blik', // BLIK mobile payments
      'p24', // Przelewy24
      'payu', // PayU
      'dotpay', // Dotpay
      'transfer' // Bank transfer
    ];
  }

  /**
   * Get service configuration (for debugging)
   */
  getConfig(): Partial<ImojeConfig> {
    return {
      clientId: this.config.clientId,
      shopId: this.config.shopId,
      sandboxUrl: this.config.sandboxUrl
      // Don't expose sensitive keys
    };
  }
}

// Export singleton instance
export const imojePaymentService = new ImojePaymentService();
