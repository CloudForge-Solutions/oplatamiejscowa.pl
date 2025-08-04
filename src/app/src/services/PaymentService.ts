/**
 * Payment Service
 * 
 * RESPONSIBILITY: Handle all payment-related API calls and business logic
 * ARCHITECTURE: Service layer for payment operations with error handling and caching
 */

import { ApiService } from '../platform/api/ApiService';
import { logger } from '../platform/logging/logger';
import { 
  API_ENDPOINTS, 
  API_CONFIG, 
  PAYMENT_CONSTANTS, 
  STORAGE_KEYS 
} from '../constants';
import {
  CreateReservationRequest,
  InitiatePaymentRequest,
  ReservationResponse,
  PaymentResponse,
  PaymentStatusResponse,
  PaymentServiceStatusResponse,
  PaymentError,
  ValidationError,
  NetworkError,
  TimeoutError,
  PaymentFormData,
  PaymentValidationResult,
  PaymentCalculation,
  Currency,
  PaymentStatus,
  ReservationStatus
} from '../types/payment';

export class PaymentService {
  private apiService: ApiService;
  private pollingIntervals: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    this.apiService = new ApiService({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT_MS,
      retries: API_CONFIG.RETRY_ATTEMPTS,
      retryDelay: API_CONFIG.RETRY_DELAY_MS
    });
  }

  /**
   * Check if payment service is available
   */
  async checkServiceStatus(): Promise<PaymentServiceStatusResponse> {
    try {
      logger.info('Checking payment service status');
      
      const response = await this.apiService.get<PaymentServiceStatusResponse>(
        API_ENDPOINTS.PAYMENT_STATUS,
        { cache: false, timeout: 5000 }
      );

      if (!response.data) {
        throw new NetworkError('No response data received');
      }

      logger.info('Payment service status checked', { status: response.data.status });
      return response.data;
    } catch (error) {
      logger.error('Failed to check payment service status', { error });
      throw this.handleError(error);
    }
  }

  /**
   * Create a new reservation
   */
  async createReservation(request: CreateReservationRequest): Promise<ReservationResponse> {
    try {
      logger.info('Creating reservation', { 
        guestName: request.guestName,
        accommodationName: request.accommodationName,
        totalAmount: request.totalTaxAmount
      });

      // Validate request
      const validation = this.validateReservationRequest(request);
      if (!validation.isValid) {
        throw new ValidationError('Invalid reservation data', undefined, validation.errors);
      }

      const response = await this.apiService.post<ReservationResponse>(
        API_ENDPOINTS.CREATE_RESERVATION,
        request,
        { cache: false }
      );

      if (!response.data) {
        throw new NetworkError('No response data received');
      }

      // Cache reservation ID for later use
      localStorage.setItem(STORAGE_KEYS.PAYMENT_RESERVATION_ID, response.data.id);

      logger.info('Reservation created successfully', { 
        reservationId: response.data.id,
        status: response.data.status
      });

      return response.data;
    } catch (error) {
      logger.error('Failed to create reservation', { error, request });
      throw this.handleError(error);
    }
  }

  /**
   * Get reservation by ID
   */
  async getReservation(reservationId: string): Promise<ReservationResponse> {
    try {
      logger.info('Fetching reservation', { reservationId });

      const response = await this.apiService.get<ReservationResponse>(
        `${API_ENDPOINTS.GET_RESERVATION}/${reservationId}`,
        { cacheTTL: 30000 } // Cache for 30 seconds
      );

      if (!response.data) {
        throw new NetworkError('No response data received');
      }

      logger.info('Reservation fetched successfully', { 
        reservationId: response.data.id,
        status: response.data.status
      });

      return response.data;
    } catch (error) {
      logger.error('Failed to fetch reservation', { error, reservationId });
      throw this.handleError(error);
    }
  }

  /**
   * Initiate payment for a reservation
   */
  async initiatePayment(request: InitiatePaymentRequest): Promise<PaymentResponse> {
    try {
      logger.info('Initiating payment', { reservationId: request.reservationId });

      const response = await this.apiService.post<PaymentResponse>(
        API_ENDPOINTS.INITIATE_PAYMENT,
        request,
        { cache: false }
      );

      if (!response.data) {
        throw new NetworkError('No response data received');
      }

      logger.info('Payment initiated successfully', { 
        paymentId: response.data.paymentId,
        status: response.data.status,
        expiresAt: response.data.expiresAt
      });

      return response.data;
    } catch (error) {
      logger.error('Failed to initiate payment', { error, request });
      throw this.handleError(error);
    }
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(paymentId: string): Promise<PaymentStatusResponse> {
    try {
      logger.debug('Fetching payment status', { paymentId });

      const response = await this.apiService.get<PaymentStatusResponse>(
        `${API_ENDPOINTS.GET_PAYMENT_STATUS}/${paymentId}/status`,
        { cache: false } // Always get fresh status
      );

      if (!response.data) {
        throw new NetworkError('No response data received');
      }

      logger.debug('Payment status fetched', { 
        paymentId: response.data.paymentId,
        status: response.data.status
      });

      return response.data;
    } catch (error) {
      logger.error('Failed to fetch payment status', { error, paymentId });
      throw this.handleError(error);
    }
  }

  /**
   * Start polling payment status until completion or timeout
   */
  async pollPaymentStatus(
    paymentId: string,
    onStatusUpdate?: (status: PaymentStatusResponse) => void,
    onComplete?: (status: PaymentStatusResponse) => void,
    onError?: (error: Error) => void
  ): Promise<PaymentStatusResponse> {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const maxAttempts = PAYMENT_CONSTANTS.POLLING.MAX_ATTEMPTS;
      const interval = PAYMENT_CONSTANTS.POLLING.INTERVAL_MS;

      logger.info('Starting payment status polling', { 
        paymentId, 
        maxAttempts, 
        intervalMs: interval 
      });

      const poll = async () => {
        try {
          attempts++;
          const status = await this.getPaymentStatus(paymentId);

          // Notify about status update
          onStatusUpdate?.(status);

          // Check if payment is in final state
          if (status.status === PaymentStatus.COMPLETED) {
            this.stopPolling(paymentId);
            logger.info('Payment completed', { paymentId, attempts });
            onComplete?.(status);
            resolve(status);
            return;
          }

          if (status.status === PaymentStatus.FAILED || status.status === PaymentStatus.CANCELLED) {
            this.stopPolling(paymentId);
            const error = new PaymentError(
              `Payment ${status.status}: ${status.failureReason || status.message}`,
              status.status.toUpperCase(),
              400,
              status
            );
            logger.warn('Payment failed or cancelled', { paymentId, status: status.status, attempts });
            onError?.(error);
            reject(error);
            return;
          }

          // Check timeout
          if (attempts >= maxAttempts) {
            this.stopPolling(paymentId);
            const error = new TimeoutError(`Payment status polling timeout after ${attempts} attempts`);
            logger.error('Payment polling timeout', { paymentId, attempts });
            onError?.(error);
            reject(error);
            return;
          }

          // Continue polling
          const timeoutId = setTimeout(poll, interval);
          this.pollingIntervals.set(paymentId, timeoutId);

        } catch (error) {
          this.stopPolling(paymentId);
          logger.error('Error during payment polling', { error, paymentId, attempts });
          onError?.(error as Error);
          reject(error);
        }
      };

      // Start polling
      poll();
    });
  }

  /**
   * Stop polling for a specific payment
   */
  stopPolling(paymentId: string): void {
    const timeoutId = this.pollingIntervals.get(paymentId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.pollingIntervals.delete(paymentId);
      logger.debug('Stopped polling for payment', { paymentId });
    }
  }

  /**
   * Stop all active polling
   */
  stopAllPolling(): void {
    this.pollingIntervals.forEach((timeoutId, paymentId) => {
      clearTimeout(timeoutId);
      logger.debug('Stopped polling for payment', { paymentId });
    });
    this.pollingIntervals.clear();
    logger.info('Stopped all payment polling');
  }

  /**
   * Calculate tax amount based on form data
   */
  calculateTaxAmount(formData: Partial<PaymentFormData>): PaymentCalculation | null {
    const { numberOfGuests, numberOfNights, taxAmountPerNight, currency } = formData;

    if (!numberOfGuests || !numberOfNights || !taxAmountPerNight || !currency) {
      return null;
    }

    const totalTaxAmount = Number((numberOfGuests * numberOfNights * taxAmountPerNight).toFixed(2));

    return {
      numberOfGuests,
      numberOfNights,
      taxAmountPerNight,
      totalTaxAmount,
      currency: currency as Currency,
      breakdown: {
        guestsText: `${numberOfGuests} ${numberOfGuests === 1 ? 'guest' : 'guests'}`,
        nightsText: `${numberOfNights} ${numberOfNights === 1 ? 'night' : 'nights'}`,
        rateText: `${taxAmountPerNight.toFixed(2)} ${currency} per night per guest`,
        totalText: `${totalTaxAmount.toFixed(2)} ${currency}`
      }
    };
  }

  /**
   * Validate reservation request data
   */
  private validateReservationRequest(request: CreateReservationRequest): PaymentValidationResult {
    const errors: Record<string, string> = {};
    const warnings: string[] = [];

    // Required fields
    if (!request.guestName?.trim()) {
      errors.guestName = 'Guest name is required';
    }

    if (!request.guestEmail?.trim()) {
      errors.guestEmail = 'Guest email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(request.guestEmail)) {
      errors.guestEmail = 'Invalid email format';
    }

    if (!request.accommodationName?.trim()) {
      errors.accommodationName = 'Accommodation name is required';
    }

    if (!request.accommodationAddress?.trim()) {
      errors.accommodationAddress = 'Accommodation address is required';
    }

    // Date validation
    if (!request.checkInDate) {
      errors.checkInDate = 'Check-in date is required';
    }

    if (!request.checkOutDate) {
      errors.checkOutDate = 'Check-out date is required';
    }

    if (request.checkInDate && request.checkOutDate) {
      const checkIn = new Date(request.checkInDate);
      const checkOut = new Date(request.checkOutDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (checkIn < today) {
        errors.checkInDate = 'Check-in date cannot be in the past';
      }

      if (checkOut <= checkIn) {
        errors.checkOutDate = 'Check-out date must be after check-in date';
      }
    }

    // Numeric validations
    if (!request.numberOfGuests || request.numberOfGuests < PAYMENT_CONSTANTS.VALIDATION.MIN_GUESTS) {
      errors.numberOfGuests = `Number of guests must be at least ${PAYMENT_CONSTANTS.VALIDATION.MIN_GUESTS}`;
    } else if (request.numberOfGuests > PAYMENT_CONSTANTS.VALIDATION.MAX_GUESTS) {
      errors.numberOfGuests = `Number of guests cannot exceed ${PAYMENT_CONSTANTS.VALIDATION.MAX_GUESTS}`;
    }

    if (!request.numberOfNights || request.numberOfNights < PAYMENT_CONSTANTS.VALIDATION.MIN_NIGHTS) {
      errors.numberOfNights = `Number of nights must be at least ${PAYMENT_CONSTANTS.VALIDATION.MIN_NIGHTS}`;
    } else if (request.numberOfNights > PAYMENT_CONSTANTS.VALIDATION.MAX_NIGHTS) {
      errors.numberOfNights = `Number of nights cannot exceed ${PAYMENT_CONSTANTS.VALIDATION.MAX_NIGHTS}`;
    }

    if (!request.taxAmountPerNight || request.taxAmountPerNight < PAYMENT_CONSTANTS.VALIDATION.MIN_TAX_AMOUNT) {
      errors.taxAmountPerNight = `Tax amount per night must be at least ${PAYMENT_CONSTANTS.VALIDATION.MIN_TAX_AMOUNT}`;
    } else if (request.taxAmountPerNight > PAYMENT_CONSTANTS.VALIDATION.MAX_TAX_AMOUNT) {
      errors.taxAmountPerNight = `Tax amount per night cannot exceed ${PAYMENT_CONSTANTS.VALIDATION.MAX_TAX_AMOUNT}`;
    }

    if (!request.totalTaxAmount || request.totalTaxAmount < PAYMENT_CONSTANTS.VALIDATION.MIN_TOTAL_AMOUNT) {
      errors.totalTaxAmount = `Total tax amount must be at least ${PAYMENT_CONSTANTS.VALIDATION.MIN_TOTAL_AMOUNT}`;
    } else if (request.totalTaxAmount > PAYMENT_CONSTANTS.VALIDATION.MAX_TOTAL_AMOUNT) {
      errors.totalTaxAmount = `Total tax amount cannot exceed ${PAYMENT_CONSTANTS.VALIDATION.MAX_TOTAL_AMOUNT}`;
    }

    // Currency validation
    if (!request.currency || !Object.values(Currency).includes(request.currency)) {
      errors.currency = 'Valid currency is required';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      warnings
    };
  }

  /**
   * Handle and transform errors
   */
  private handleError(error: any): PaymentError {
    if (error instanceof PaymentError) {
      return error;
    }

    if (error.name === 'AbortError' || error.message?.includes('timeout')) {
      return new TimeoutError('Request timeout');
    }

    if (error.status || error.statusCode) {
      const statusCode = error.status || error.statusCode;
      const message = error.message || error.data?.message || 'Network error';
      return new NetworkError(message, statusCode, error.data);
    }

    return new PaymentError(error.message || 'Unknown error', 'UNKNOWN_ERROR', 500, error);
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.stopAllPolling();
    logger.info('PaymentService destroyed');
  }
}
