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
  calculateTotalTaxAmount,
  validateReservationDates,
  calculateNumberOfNights,
  isValidStatusTransition,
  formatCurrency
} from '../entities/reservation.entity';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  // In-memory storage for development (replace with database in production)
  private reservations = new Map<string, Reservation>();
  private payments = new Map<string, Payment>();

  constructor(private readonly configService: ConfigService) {
    this.seedMockData();
  }

  /**
   * Check payment service availability
   */
  isAvailable(): boolean {
    this.logger.log('🔍 Checking payment service availability');
    return true;
  }

  /**
   * Create a new reservation
   */
  async createReservation(createReservationDto: CreateReservationDto): Promise<ReservationResponseDto> {
    this.logger.log('📝 Creating new reservation', {
      guestName: createReservationDto.guestName,
      accommodationName: createReservationDto.accommodationName,
      totalAmount: createReservationDto.totalTaxAmount,
    });

    // Validate dates
    if (!validateReservationDates(createReservationDto.checkInDate, createReservationDto.checkOutDate)) {
      throw new BadRequestException('Invalid check-in or check-out dates');
    }

    // Validate calculated nights
    const calculatedNights = calculateNumberOfNights(createReservationDto.checkInDate, createReservationDto.checkOutDate);
    if (calculatedNights !== createReservationDto.numberOfNights) {
      throw new BadRequestException(`Number of nights mismatch. Expected: ${calculatedNights}, provided: ${createReservationDto.numberOfNights}`);
    }

    // Validate total amount calculation
    const calculatedTotal = calculateTotalTaxAmount(
      createReservationDto.numberOfGuests,
      createReservationDto.numberOfNights,
      createReservationDto.taxAmountPerNight
    );
    if (Math.abs(calculatedTotal - createReservationDto.totalTaxAmount) > 0.01) {
      throw new BadRequestException(`Total amount mismatch. Expected: ${calculatedTotal}, provided: ${createReservationDto.totalTaxAmount}`);
    }

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
      numberOfNights: createReservationDto.numberOfNights,
      taxAmountPerNight: createReservationDto.taxAmountPerNight,
      totalTaxAmount: createReservationDto.totalTaxAmount,
      currency: createReservationDto.currency,
      status: ReservationStatus.PENDING,
      createdAt: now,
      updatedAt: now,
      cityName: createReservationDto.cityName,
    };

    this.reservations.set(reservationId, reservation);

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

    const reservation = this.reservations.get(reservationId);
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

    const reservations = Array.from(this.reservations.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return reservations.map(reservation => this.mapReservationToResponse(reservation));
  }

  /**
   * Initialize payment for a reservation
   */
  async initializePayment(initiatePaymentDto: InitiatePaymentDto): Promise<PaymentResponseDto> {
    this.logger.log('💳 Initializing payment', {
      reservationId: initiatePaymentDto.reservationId,
    });

    const reservation = this.reservations.get(initiatePaymentDto.reservationId);
    if (!reservation) {
      throw new NotFoundException(`Reservation with ID ${initiatePaymentDto.reservationId} not found`);
    }

    if (reservation.status !== ReservationStatus.PENDING) {
      throw new BadRequestException(`Cannot initiate payment for reservation with status: ${reservation.status}`);
    }

    const paymentId = generatePaymentId();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes expiry

    // Mock imoje payment URL (in production, this would be from imoje API)
    const mockImojeUrl = this.configService.get<string>('payment.imojeApiUrl') || 'http://localhost:3042';
    const paymentUrl = `${mockImojeUrl}/payment/${paymentId}`;

    const payment: Payment = {
      paymentId,
      reservationId: initiatePaymentDto.reservationId,
      status: PaymentStatus.PENDING,
      amount: reservation.totalTaxAmount,
      currency: reservation.currency,
      paymentUrl,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    };

    this.payments.set(paymentId, payment);

    // Update reservation with payment info
    reservation.paymentId = paymentId;
    reservation.paymentUrl = paymentUrl;
    reservation.updatedAt = now.toISOString();
    this.reservations.set(reservation.id, reservation);

    this.logger.log('✅ Payment initialized successfully', {
      paymentId,
      reservationId: reservation.id,
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
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(paymentId: string): Promise<PaymentStatusResponseDto> {
    this.logger.log('📊 Fetching payment status', { paymentId });

    const payment = this.payments.get(paymentId);
    if (!payment) {
      throw new NotFoundException(`Payment with ID ${paymentId} not found`);
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

    const payment = this.payments.get(webhookDto.paymentId);
    if (!payment) {
      this.logger.warn('⚠️ Webhook received for unknown payment', { paymentId: webhookDto.paymentId });
      throw new NotFoundException(`Payment with ID ${webhookDto.paymentId} not found`);
    }

    // Validate status transition
    if (!isValidStatusTransition(payment.status, webhookDto.status, 'payment')) {
      throw new BadRequestException(`Invalid status transition from ${payment.status} to ${webhookDto.status}`);
    }

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

    this.payments.set(payment.paymentId, payment);

    // Update reservation status
    const reservation = this.reservations.get(payment.reservationId);
    if (reservation) {
      if (webhookDto.status === PaymentStatus.COMPLETED) {
        reservation.status = ReservationStatus.PAID;
      } else if (webhookDto.status === PaymentStatus.FAILED) {
        reservation.status = ReservationStatus.FAILED;
      }
      reservation.updatedAt = new Date().toISOString();
      this.reservations.set(reservation.id, reservation);
    }

    this.logger.log('✅ Webhook processed successfully', {
      paymentId: payment.paymentId,
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

    return Array.from(this.payments.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Delete reservation (for development/testing)
   */
  async deleteReservation(reservationId: string): Promise<{ success: boolean; message: string }> {
    this.logger.log('🗑️ Deleting reservation', { reservationId });

    const reservation = this.reservations.get(reservationId);
    if (!reservation) {
      throw new NotFoundException(`Reservation with ID ${reservationId} not found`);
    }

    // Delete associated payment if exists
    if (reservation.paymentId) {
      this.payments.delete(reservation.paymentId);
    }

    this.reservations.delete(reservationId);

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

    this.reservations.clear();
    this.payments.clear();
    this.seedMockData();

    this.logger.log('✅ All data cleared and reseeded');

    return {
      success: true,
      message: 'All payment data cleared and reseeded with mock data',
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

  private seedMockData(): void {
    this.logger.log('🌱 Seeding mock payment data');

    // Create sample reservations
    const mockReservations: Omit<Reservation, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        guestName: 'Jan Kowalski',
        guestEmail: 'jan.kowalski@example.com',
        accommodationName: 'Hotel Kraków',
        accommodationAddress: 'ul. Floriańska 1, 31-019 Kraków',
        checkInDate: '2024-08-15',
        checkOutDate: '2024-08-18',
        numberOfGuests: 2,
        numberOfNights: 3,
        taxAmountPerNight: 2.50,
        totalTaxAmount: 15.00,
        currency: Currency.PLN,
        status: ReservationStatus.PENDING,
        cityName: 'Kraków',
      },
      {
        guestName: 'Anna Nowak',
        guestEmail: 'anna.nowak@example.com',
        accommodationName: 'Apartamenty Centrum',
        accommodationAddress: 'ul. Grodzka 15, 31-006 Kraków',
        checkInDate: '2024-08-20',
        checkOutDate: '2024-08-22',
        numberOfGuests: 1,
        numberOfNights: 2,
        taxAmountPerNight: 2.50,
        totalTaxAmount: 5.00,
        currency: Currency.PLN,
        status: ReservationStatus.PAID,
        cityName: 'Kraków',
      },
    ];

    const now = new Date().toISOString();
    mockReservations.forEach((mockReservation) => {
      const reservationId = generateReservationId();
      const reservation: Reservation = {
        ...mockReservation,
        id: reservationId,
        createdAt: now,
        updatedAt: now,
      };

      this.reservations.set(reservationId, reservation);
    });

    this.logger.log(`✅ Seeded ${mockReservations.length} mock reservations`);
  }
}
