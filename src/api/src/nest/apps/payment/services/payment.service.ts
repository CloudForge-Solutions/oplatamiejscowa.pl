/**
 * Payment Service
 *
 * RESPONSIBILITY: Payment processing logic with mock imoje integration
 * ARCHITECTURE: NestJS service for tourist tax payment management
 */

import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CreateReservationDto,
  InitiatePaymentDto,
  PaymentWebhookDto,
  ReservationResponseDto,
  PaymentResponseDto,
  PaymentStatusResponseDto,
  PaymentStatus,
  ReservationStatus,
  Currency
} from '../dto/payment.dto';
import {
  Reservation,
  Payment,
  generateReservationId,
  generatePaymentId,
  validateReservationDates,
  calculateNumberOfNights,
  isValidStatusTransition,
  formatCurrency
} from '../entities/reservation.entity';
import { ImojeService } from './imoje.service';
import { AzureStorageService } from './azure-storage.service';
import { DataSeedingService } from './data-seeding.service';
import { TaxRateService } from './tax-rate.service';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  constructor(
    private readonly configService: ConfigService,
    private readonly imojeService: ImojeService,
    private readonly azureStorageService: AzureStorageService,
    private readonly dataSeedingService: DataSeedingService,
    private readonly taxRateService: TaxRateService
  ) {
    this.logger.log('Payment service initialized with Azure Storage and imoje integration', {
      imojeConfigured: this.imojeService.isConfigured(),
      storageType: 'azure-storage',
      environment: this.configService.get<string>('NODE_ENV', 'development'),
    });

    // Seed mock data for development environments
    this.initializeDevelopmentData();
  }

  /**
   * Initialize development data if needed
   */
  private async initializeDevelopmentData(): Promise<void> {
    try {
      await this.dataSeedingService.seedMockData();
    } catch (error) {
      this.logger.warn('Failed to seed development data', { error: error.message });
      // Don't throw - seeding failure shouldn't break the service
    }
  }

  /**
   * Check payment service availability
   */
  async isAvailable(): Promise<boolean> {
    this.logger.log('🔍 Checking payment service availability');

    try {
      // Check imoje configuration
      const imojeConfigured = this.imojeService.isConfigured();

      // Check storage health
      const storageHealth = await this.azureStorageService.getHealthStatus();
      const storageHealthy = storageHealth.blob && storageHealth.tables && storageHealth.queue;

      const isAvailable = imojeConfigured && storageHealthy;

      this.logger.log('Payment service availability check completed', {
        imojeConfigured,
        storageHealthy,
        storageDetails: storageHealth.details,
        isAvailable,
      });

      return isAvailable;
    } catch (error) {
      this.logger.error('Payment service availability check failed', { error: error.message });
      return false;
    }
  }

  /**
   * Create a new reservation with auto-calculated tax amounts
   *
   * BUSINESS LOGIC:
   * - Auto-calculates numberOfNights from check-in/check-out dates
   * - Auto-determines taxAmountPerNight based on city
   * - Auto-calculates totalTaxAmount = numberOfGuests × numberOfNights × cityTaxRate
   */
  async createReservation(createReservationDto: CreateReservationDto): Promise<ReservationResponseDto> {
    this.logger.log('📝 Creating new reservation with auto-calculation', {
      guestName: createReservationDto.guestName,
      accommodationName: createReservationDto.accommodationName,
      cityName: createReservationDto.cityName,
      numberOfGuests: createReservationDto.numberOfGuests,
    });

    // Validate dates
    if (!validateReservationDates(createReservationDto.checkInDate, createReservationDto.checkOutDate)) {
      throw new BadRequestException('Invalid check-in or check-out dates');
    }

    // AUTO-CALCULATE: Number of nights from dates
    const numberOfNights = calculateNumberOfNights(createReservationDto.checkInDate, createReservationDto.checkOutDate);

    // AUTO-CALCULATE: Tax rate per night per person based on city
    const taxAmountPerNight = this.taxRateService.getTaxRateForCity(createReservationDto.cityName);

    // AUTO-CALCULATE: Total tax amount
    const totalTaxAmount = this.taxRateService.calculateTotalTaxAmount(
      createReservationDto.cityName,
      createReservationDto.numberOfGuests,
      numberOfNights
    );

    this.logger.log('💰 Auto-calculated tax amounts', {
      cityName: createReservationDto.cityName,
      numberOfGuests: createReservationDto.numberOfGuests,
      numberOfNights,
      taxAmountPerNight,
      totalTaxAmount,
    });

    const reservationId = generateReservationId();
    const now = new Date().toISOString();

    const reservation: Reservation = {
      id: reservationId,
      guestName: createReservationDto.guestName,
      guestEmail: createReservationDto.guestEmail,
      accommodationName: createReservationDto.accommodationName,
      accommodationAddress: createReservationDto.accommodationAddress,
      checkInDate: createReservationDto.checkInDate,
      checkOutDate: createReservationDto.checkOutDate,
      numberOfGuests: createReservationDto.numberOfGuests,
      numberOfNights: numberOfNights, // AUTO-CALCULATED
      taxAmountPerNight: taxAmountPerNight, // AUTO-CALCULATED from city
      totalTaxAmount: totalTaxAmount, // AUTO-CALCULATED
      currency: createReservationDto.currency,
      status: ReservationStatus.PENDING,
      createdAt: now,
      updatedAt: now,
      cityName: createReservationDto.cityName,
    };

    // Save to storage
    await this.azureStorageService.saveReservation(reservation);

    this.logger.log('✅ Reservation created successfully', {
      reservationId,
      totalAmount: formatCurrency(reservation.totalTaxAmount, reservation.currency),
    });

    return this.mapReservationToResponse(reservation);
  }

  /**
   * Get reservation by ID
   */
  async getReservation(reservationId: string): Promise<ReservationResponseDto> {
    this.logger.log('🔍 Fetching reservation', { reservationId });

    const reservation = await this.azureStorageService.getReservation(reservationId);
    if (!reservation) {
      throw new NotFoundException(`Reservation with ID ${reservationId} not found`);
    }

    return this.mapReservationToResponse(reservation);
  }

  /**
   * Get all reservations (for development/testing)
   */
  async getAllReservations(): Promise<ReservationResponseDto[]> {
    this.logger.log('📋 Fetching all reservations');

    const reservations = await this.azureStorageService.getAllReservations();

    return reservations.map(reservation => this.mapReservationToResponse(reservation));
  }

  /**
   * Initialize payment for a reservation
   */
  async initializePayment(initiatePaymentDto: InitiatePaymentDto): Promise<PaymentResponseDto> {
    this.logger.log('💳 Initializing payment', {
      reservationId: initiatePaymentDto.reservationId,
    });

    const reservation = await this.azureStorageService.getReservation(initiatePaymentDto.reservationId);
    if (!reservation) {
      throw new NotFoundException(`Reservation with ID ${initiatePaymentDto.reservationId} not found`);
    }

    if (reservation.status !== ReservationStatus.PENDING) {
      throw new BadRequestException(`Cannot initiate payment for reservation with status: ${reservation.status}`);
    }

    const paymentId = generatePaymentId();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes expiry

    try {
      // Create payment with imoje
      const orderId = this.imojeService.generateOrderId('TAX');
      const [firstName, ...lastNameParts] = reservation.guestName.split(' ');
      const lastName = lastNameParts.join(' ') || firstName;

      const imojePayment = await this.imojeService.createPayment({
        amount: this.imojeService.formatAmount(reservation.totalTaxAmount, reservation.currency),
        currency: reservation.currency,
        orderId,
        customerFirstName: firstName,
        customerLastName: lastName,
        customerEmail: reservation.guestEmail,
        title: `Tourist Tax - ${reservation.accommodationName}`,
        successReturnUrl: initiatePaymentDto.successUrl,
        failureReturnUrl: initiatePaymentDto.failureUrl,
      });

      const payment: Payment = {
        paymentId,
        reservationId: initiatePaymentDto.reservationId,
        status: PaymentStatus.PENDING,
        amount: reservation.totalTaxAmount,
        currency: reservation.currency,
        paymentUrl: imojePayment.payment.url,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
        providerPaymentId: imojePayment.payment.id,
      };

      // Save payment to storage
      await this.azureStorageService.savePayment(payment);

      // Update reservation with payment info
      reservation.paymentId = paymentId;
      reservation.paymentUrl = imojePayment.payment.url;
      reservation.updatedAt = now.toISOString();
      await this.azureStorageService.saveReservation(reservation);

      this.logger.log('✅ Payment initialized successfully with imoje', {
        paymentId,
        reservationId: reservation.id,
        imojePaymentId: imojePayment.payment.id,
        amount: formatCurrency(payment.amount, payment.currency),
        expiresAt: payment.expiresAt,
      });

      return {
        paymentId: payment.paymentId,
        reservationId: payment.reservationId,
        status: payment.status,
        paymentUrl: payment.paymentUrl,
        amount: payment.amount,
        currency: payment.currency,
        createdAt: payment.createdAt,
        expiresAt: payment.expiresAt,
      };
    } catch (error) {
      this.logger.error('Failed to initialize payment with imoje', {
        error: error.message,
        reservationId: reservation.id,
      });
      throw new BadRequestException(`Payment initialization failed: ${error.message}`);
    }
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(paymentId: string): Promise<PaymentStatusResponseDto> {
    this.logger.log('📊 Fetching payment status', { paymentId });

    const payment = await this.azureStorageService.getPayment(paymentId);
    if (!payment) {
      throw new NotFoundException(`Payment with ID ${paymentId} not found`);
    }

    // Optionally sync with imoje for real-time status
    try {
      if (payment.providerPaymentId && payment.status === PaymentStatus.PENDING) {
        const imojeStatus = await this.imojeService.getPaymentStatus(payment.providerPaymentId);
        const mappedStatus = this.imojeService.mapPaymentStatus(imojeStatus.payment.status) as PaymentStatus;

        if (mappedStatus !== payment.status) {
          this.logger.log('Payment status updated from imoje', {
            paymentId,
            oldStatus: payment.status,
            newStatus: mappedStatus,
          });

          // Update payment status
          payment.status = mappedStatus;
          payment.updatedAt = new Date().toISOString();

          if (mappedStatus === PaymentStatus.COMPLETED) {
            payment.transactionId = imojeStatus.transaction.id;
            payment.receiptUrl = `${this.configService.get<string>('app.baseUrl', 'http://localhost:3044')}/api/payment/${paymentId}/receipt`;
          }

          await this.azureStorageService.savePayment(payment);

          // Send status change event
          await this.azureStorageService.sendPaymentStatusEvent(
            paymentId,
            payment.reservationId,
            payment.status,
            mappedStatus
          );
        }
      }
    } catch (error) {
      this.logger.warn('Failed to sync payment status with imoje', {
        error: error.message,
        paymentId,
      });
      // Continue with stored status
    }

    const response: PaymentStatusResponseDto = {
      paymentId: payment.paymentId,
      reservationId: payment.reservationId,
      status: payment.status,
      message: this.getStatusMessage(payment.status),
      lastUpdated: payment.updatedAt,
      amount: payment.amount,
      currency: payment.currency,
      transactionId: payment.transactionId,
      receiptUrl: payment.receiptUrl,
      failureReason: payment.failureReason,
    };

    return response;
  }

  /**
   * Process payment webhook
   */
  async processWebhook(webhookDto: PaymentWebhookDto): Promise<{ success: boolean; message: string }> {
    this.logger.log('🔔 Processing payment webhook', {
      paymentId: webhookDto.paymentId,
      status: webhookDto.status,
    });

    const payment = await this.azureStorageService.getPayment(webhookDto.paymentId);
    if (!payment) {
      this.logger.warn('⚠️ Webhook received for unknown payment', { paymentId: webhookDto.paymentId });
      throw new NotFoundException(`Payment with ID ${webhookDto.paymentId} not found`);
    }

    // Validate status transition
    if (!isValidStatusTransition(payment.status, webhookDto.status, 'payment')) {
      throw new BadRequestException(`Invalid status transition from ${payment.status} to ${webhookDto.status}`);
    }

    const oldStatus = payment.status;

    // Update payment status
    payment.status = webhookDto.status;
    payment.updatedAt = new Date().toISOString();
    payment.transactionId = webhookDto.transactionId;
    payment.webhookData = webhookDto;

    if (webhookDto.status === PaymentStatus.COMPLETED) {
      payment.receiptUrl = `${this.configService.get<string>('app.baseUrl', 'http://localhost:3044')}/api/payment/${payment.paymentId}/receipt`;
    } else if (webhookDto.status === PaymentStatus.FAILED) {
      payment.failureReason = 'Payment failed at provider level';
    }

    // Save updated payment
    await this.azureStorageService.savePayment(payment);

    // Update reservation status
    const reservation = await this.azureStorageService.getReservation(payment.reservationId);
    if (reservation) {
      if (webhookDto.status === PaymentStatus.COMPLETED) {
        reservation.status = ReservationStatus.PAID;
      } else if (webhookDto.status === PaymentStatus.FAILED) {
        reservation.status = ReservationStatus.FAILED;
      }
      reservation.updatedAt = new Date().toISOString();
      await this.azureStorageService.saveReservation(reservation);
    }

    // Send status change event to queue
    await this.azureStorageService.sendPaymentStatusEvent(
      payment.paymentId,
      payment.reservationId,
      oldStatus,
      payment.status
    );

    this.logger.log('✅ Webhook processed successfully', {
      paymentId: payment.paymentId,
      oldStatus,
      newStatus: payment.status,
      reservationStatus: reservation?.status,
    });

    return {
      success: true,
      message: `Payment status updated to ${payment.status}`,
    };
  }

  /**
   * Get all payments (for development/testing)
   */
  async getAllPayments(): Promise<Payment[]> {
    this.logger.log('📋 Fetching all payments');

    return await this.azureStorageService.getAllPayments();
  }

  /**
   * Delete reservation (for development/testing)
   */
  async deleteReservation(reservationId: string): Promise<{ success: boolean; message: string }> {
    this.logger.log('🗑️ Deleting reservation', { reservationId });

    const reservation = await this.azureStorageService.getReservation(reservationId);
    if (!reservation) {
      throw new NotFoundException(`Reservation with ID ${reservationId} not found`);
    }

    // Delete associated payment if exists
    if (reservation.paymentId) {
      const payment = await this.azureStorageService.getPayment(reservation.paymentId);
      if (payment) {
        // Note: In production, you might want to cancel the payment with imoje first
        this.logger.log('Deleting associated payment', { paymentId: reservation.paymentId });
      }
    }

    await this.azureStorageService.deleteReservation(reservationId);

    this.logger.log('✅ Reservation deleted successfully', { reservationId });

    return {
      success: true,
      message: `Reservation ${reservationId} deleted successfully`,
    };
  }

  /**
   * Clear all data (for development/testing)
   */
  async clearAllData(): Promise<{ success: boolean; message: string }> {
    this.logger.log('🧹 Clearing all payment data');

    await this.dataSeedingService.clearAllData();

    this.logger.log('✅ All data cleared successfully');

    return {
      success: true,
      message: 'All payment data cleared successfully',
    };
  }

  // Private helper methods

  private mapReservationToResponse(reservation: Reservation): ReservationResponseDto {
    return {
      id: reservation.id,
      guestName: reservation.guestName,
      guestEmail: reservation.guestEmail,
      accommodationName: reservation.accommodationName,
      accommodationAddress: reservation.accommodationAddress,
      checkInDate: reservation.checkInDate,
      checkOutDate: reservation.checkOutDate,
      numberOfGuests: reservation.numberOfGuests,
      numberOfNights: reservation.numberOfNights,
      taxAmountPerNight: reservation.taxAmountPerNight,
      totalTaxAmount: reservation.totalTaxAmount,
      currency: reservation.currency,
      status: reservation.status,
      createdAt: reservation.createdAt,
      updatedAt: reservation.updatedAt,
      paymentId: reservation.paymentId,
      paymentUrl: reservation.paymentUrl,
      cityName: reservation.cityName,
    };
  }

  private getStatusMessage(status: PaymentStatus): string {
    switch (status) {
      case PaymentStatus.PENDING:
        return 'Payment is waiting to be processed';
      case PaymentStatus.PROCESSING:
        return 'Payment is being processed';
      case PaymentStatus.COMPLETED:
        return 'Payment completed successfully';
      case PaymentStatus.FAILED:
        return 'Payment failed';
      case PaymentStatus.CANCELLED:
        return 'Payment was cancelled';
      default:
        return 'Unknown payment status';
    }
  }


}
