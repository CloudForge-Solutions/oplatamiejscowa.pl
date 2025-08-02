/**
 * Centralized API Service for Tourist Tax Application
 * Handles all communication with Azure Function NestJS backend
 * Follows existing patterns from TaxCalculationService and ImojePaymentService
 */

import { ApiResponse } from '../types/TouristTaxTypes';

export interface ReservationData {
  id?: string;
  cityCode: string;
  cityName: string;
  bookingPlatform: string;
  checkInDate: string;
  checkOutDate: string;
  guestCount: number;
  taxAmount: number;
  status: 'pending' | 'paid' | 'cancelled';
  paymentId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CityConfiguration {
  cityCode: string;
  cityName: string;
  taxRate: number;
  currency: string;
  regulations?: string;
  lastUpdated: string;
}

export interface PaymentRecord {
  id: string;
  reservationId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: string;
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
}

export class ApiService {
  private static instance: ApiService;
  private config: ApiConfig;

  private constructor() {
    this.config = {
      baseUrl: import.meta.env.VITE_API_BASE_URL || 'https://your-function-app.azurewebsites.net/api',
      timeout: 30000, // 30 seconds
      retryAttempts: 3
    };
  }

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  /**
   * Generic HTTP request method with retry logic
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount = 0
  ): Promise<ApiResponse<T>> {
    const url = `${this.config.baseUrl}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    const requestOptions: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers
      },
      signal: AbortSignal.timeout(this.config.timeout)
    };

    try {
      const response = await fetch(url, requestOptions);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        data
      };
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      
      // Retry logic for network errors
      if (retryCount < this.config.retryAttempts && this.isRetryableError(error)) {
        console.log(`Retrying request (${retryCount + 1}/${this.config.retryAttempts})...`);
        await this.delay(1000 * (retryCount + 1)); // Exponential backoff
        return this.makeRequest<T>(endpoint, options, retryCount + 1);
      }

      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error',
          code: 'API_ERROR'
        }
      };
    }
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(error: any): boolean {
    return error.name === 'TypeError' || // Network errors
           error.name === 'AbortError' || // Timeout errors
           (error.message && error.message.includes('fetch'));
  }

  /**
   * Delay utility for retry logic
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ===== RESERVATION ENDPOINTS =====

  /**
   * Create a new reservation
   */
  async createReservation(reservation: Omit<ReservationData, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<ReservationData>> {
    return this.makeRequest<ReservationData>('/reservations', {
      method: 'POST',
      body: JSON.stringify(reservation)
    });
  }

  /**
   * Get reservations by city
   */
  async getReservationsByCity(cityCode: string): Promise<ApiResponse<ReservationData[]>> {
    return this.makeRequest<ReservationData[]>(`/reservations/city/${cityCode}`);
  }

  /**
   * Get reservation by ID
   */
  async getReservation(id: string): Promise<ApiResponse<ReservationData>> {
    return this.makeRequest<ReservationData>(`/reservations/${id}`);
  }

  /**
   * Update reservation status
   */
  async updateReservationStatus(id: string, status: ReservationData['status']): Promise<ApiResponse<ReservationData>> {
    return this.makeRequest<ReservationData>(`/reservations/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  }

  // ===== CITY CONFIGURATION ENDPOINTS =====

  /**
   * Get all city configurations
   */
  async getCityConfigurations(): Promise<ApiResponse<CityConfiguration[]>> {
    return this.makeRequest<CityConfiguration[]>('/cities');
  }

  /**
   * Get city configuration by code
   */
  async getCityConfiguration(cityCode: string): Promise<ApiResponse<CityConfiguration>> {
    return this.makeRequest<CityConfiguration>(`/cities/${cityCode}`);
  }

  // ===== PAYMENT ENDPOINTS =====

  /**
   * Create payment record
   */
  async createPayment(payment: Omit<PaymentRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<PaymentRecord>> {
    return this.makeRequest<PaymentRecord>('/payments', {
      method: 'POST',
      body: JSON.stringify(payment)
    });
  }

  /**
   * Get payment by ID
   */
  async getPayment(id: string): Promise<ApiResponse<PaymentRecord>> {
    return this.makeRequest<PaymentRecord>(`/payments/${id}`);
  }

  /**
   * Update payment status
   */
  async updatePaymentStatus(id: string, status: PaymentRecord['status'], transactionId?: string): Promise<ApiResponse<PaymentRecord>> {
    return this.makeRequest<PaymentRecord>(`/payments/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, transactionId })
    });
  }

  // ===== DOCUMENT ENDPOINTS =====

  /**
   * Generate PDF receipt
   */
  async generateReceipt(reservationId: string): Promise<ApiResponse<{ url: string; blobName: string }>> {
    return this.makeRequest<{ url: string; blobName: string }>(`/documents/receipt/${reservationId}`, {
      method: 'POST'
    });
  }

  /**
   * Generate QR code for payment
   */
  async generateQRCode(paymentId: string): Promise<ApiResponse<{ url: string; blobName: string }>> {
    return this.makeRequest<{ url: string; blobName: string }>(`/documents/qr/${paymentId}`, {
      method: 'POST'
    });
  }

  // ===== HEALTH CHECK =====

  /**
   * Health check endpoint
   */
  async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    return this.makeRequest<{ status: string; timestamp: string }>('/health');
  }
}

// Export singleton instance
export const apiService = ApiService.getInstance();
