/**
 * MockupApiService - Replace Azure Functions with direct Azure Storage access
 * 
 * RESPONSIBILITY: Provide API-like interface for tourist tax operations using Azure Storage
 * ARCHITECTURE: Direct storage access with API-compatible responses
 */

import { blobStorageService, ReservationData } from '../storage/BlobStorageService';
import { dataSeedingService } from '../storage/DataSeedingService';
import { logger } from '../CentralizedLogger';
import { eventBus, PLATFORM_EVENTS } from '../EventBus';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface PaymentRequest {
  reservationId: string;
  amount: number;
  currency: string;
  returnUrl: string;
  notificationUrl?: string;
}

export interface PaymentResponse {
  paymentId: string;
  paymentUrl: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  amount: number;
  currency: string;
}

/**
 * MockupApiService - Simulates Azure Functions API using direct storage access
 */
export class MockupApiService {
  private baseUrl: string;
  private isInitialized: boolean = false;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3040/api';
    this.initialize();
  }

  /**
   * Initialize the service and seed data if needed
   */
  private async initialize(): Promise<void> {
    try {
      logger.info('🚀 Initializing MockupApiService');

      // Check if we need to seed data
      const stats = await dataSeedingService.getSeedingStats();
      
      if (!stats.storageConnected) {
        logger.warn('⚠️ Azure Storage Emulator not connected - some features may not work');
        return;
      }

      if (stats.reservationCount === 0) {
        logger.info('🌱 No reservations found, seeding initial data');
        await dataSeedingService.seedReservations(15);
      }

      this.isInitialized = true;
      logger.info('✅ MockupApiService initialized', {
        reservationCount: stats.reservationCount,
        storageConnected: stats.storageConnected
      });

    } catch (error) {
      logger.error('❌ Failed to initialize MockupApiService', { error });
    }
  }

  /**
   * Get reservation by ID
   */
  async getReservation(reservationId: string): Promise<ApiResponse<ReservationData>> {
    try {
      logger.info('📋 Fetching reservation', { reservationId });

      const reservation = await blobStorageService.getReservation(reservationId);
      
      if (!reservation) {
        return {
          success: false,
          error: 'RESERVATION_NOT_FOUND',
          message: 'Reservation not found',
          timestamp: new Date().toISOString()
        };
      }

      // Emit event for analytics
      eventBus.emit(PLATFORM_EVENTS.RESERVATION_LOADED, {
        reservationId,
        status: reservation.status,
        amount: reservation.totalTaxAmount
      });

      return {
        success: true,
        data: reservation,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('❌ Failed to fetch reservation', { error, reservationId });
      
      return {
        success: false,
        error: 'FETCH_ERROR',
        message: 'Failed to fetch reservation data',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Create payment for reservation
   */
  async createPayment(paymentRequest: PaymentRequest): Promise<ApiResponse<PaymentResponse>> {
    try {
      logger.info('💳 Creating payment', { 
        reservationId: paymentRequest.reservationId,
        amount: paymentRequest.amount 
      });

      // Get reservation to validate
      const reservation = await blobStorageService.getReservation(paymentRequest.reservationId);
      
      if (!reservation) {
        return {
          success: false,
          error: 'RESERVATION_NOT_FOUND',
          message: 'Reservation not found',
          timestamp: new Date().toISOString()
        };
      }

      if (reservation.status === 'paid') {
        return {
          success: false,
          error: 'ALREADY_PAID',
          message: 'Reservation has already been paid',
          timestamp: new Date().toISOString()
        };
      }

      // Validate amount
      if (Math.abs(paymentRequest.amount - reservation.totalTaxAmount) > 0.01) {
        return {
          success: false,
          error: 'AMOUNT_MISMATCH',
          message: 'Payment amount does not match reservation total',
          timestamp: new Date().toISOString()
        };
      }

      // Generate payment ID and URL (simulating imoje)
      const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const paymentUrl = `${import.meta.env.VITE_IMOJE_SANDBOX_URL}/payment/${paymentId}`;

      // Update reservation with payment info
      const updatedReservation: ReservationData = {
        ...reservation,
        status: 'pending',
        paymentId,
        paymentUrl,
        updatedAt: new Date().toISOString()
      };

      await blobStorageService.storeReservation(updatedReservation);

      // Emit payment initiated event
      eventBus.emit(PLATFORM_EVENTS.PAYMENT_INITIATED, {
        reservationId: paymentRequest.reservationId,
        paymentId,
        amount: paymentRequest.amount,
        currency: paymentRequest.currency
      });

      const paymentResponse: PaymentResponse = {
        paymentId,
        paymentUrl,
        status: 'pending',
        amount: paymentRequest.amount,
        currency: paymentRequest.currency
      };

      return {
        success: true,
        data: paymentResponse,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('❌ Failed to create payment', { error, paymentRequest });
      
      return {
        success: false,
        error: 'PAYMENT_CREATION_ERROR',
        message: 'Failed to create payment',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(paymentId: string): Promise<ApiResponse<{ status: string; reservationId?: string }>> {
    try {
      logger.info('🔍 Checking payment status', { paymentId });

      // Find reservation by payment ID
      const reservationIds = await blobStorageService.listReservations();
      let foundReservation: ReservationData | null = null;

      for (const id of reservationIds) {
        const reservation = await blobStorageService.getReservation(id);
        if (reservation?.paymentId === paymentId) {
          foundReservation = reservation;
          break;
        }
      }

      if (!foundReservation) {
        return {
          success: false,
          error: 'PAYMENT_NOT_FOUND',
          message: 'Payment not found',
          timestamp: new Date().toISOString()
        };
      }

      // Simulate payment processing (for demo purposes)
      let status = foundReservation.status;
      
      // Randomly complete pending payments (simulating real payment processing)
      if (status === 'pending' && Math.random() > 0.7) {
        status = 'paid';
        
        // Update reservation status
        const updatedReservation: ReservationData = {
          ...foundReservation,
          status: 'paid',
          updatedAt: new Date().toISOString()
        };
        
        await blobStorageService.storeReservation(updatedReservation);
        
        // Emit payment completed event
        eventBus.emit(PLATFORM_EVENTS.PAYMENT_COMPLETED, {
          reservationId: foundReservation.id,
          paymentId,
          amount: foundReservation.totalTaxAmount
        });
      }

      return {
        success: true,
        data: {
          status,
          reservationId: foundReservation.id
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('❌ Failed to check payment status', { error, paymentId });
      
      return {
        success: false,
        error: 'STATUS_CHECK_ERROR',
        message: 'Failed to check payment status',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * List all reservations (for admin/debug purposes)
   */
  async listReservations(): Promise<ApiResponse<ReservationData[]>> {
    try {
      logger.info('📋 Listing all reservations');

      const reservationIds = await blobStorageService.listReservations();
      const reservations: ReservationData[] = [];

      for (const id of reservationIds) {
        const reservation = await blobStorageService.getReservation(id);
        if (reservation) {
          reservations.push(reservation);
        }
      }

      // Sort by creation date (newest first)
      reservations.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      return {
        success: true,
        data: reservations,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('❌ Failed to list reservations', { error });
      
      return {
        success: false,
        error: 'LIST_ERROR',
        message: 'Failed to list reservations',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Health check endpoint
   */
  async healthCheck(): Promise<ApiResponse<{ status: string; storage: boolean; timestamp: string }>> {
    try {
      const stats = await dataSeedingService.getSeedingStats();
      
      return {
        success: true,
        data: {
          status: 'healthy',
          storage: stats.storageConnected,
          timestamp: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        success: false,
        error: 'HEALTH_CHECK_ERROR',
        message: 'Health check failed',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Reseed data (for development)
   */
  async reseedData(count: number = 15): Promise<ApiResponse<{ message: string; count: number }>> {
    try {
      logger.info('🌱 Reseeding data', { count });
      
      await dataSeedingService.reseed(count);
      
      return {
        success: true,
        data: {
          message: 'Data reseeded successfully',
          count
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('❌ Failed to reseed data', { error });
      
      return {
        success: false,
        error: 'RESEED_ERROR',
        message: 'Failed to reseed data',
        timestamp: new Date().toISOString()
      };
    }
  }
}

// Export singleton instance
export const mockupApiService = new MockupApiService();
