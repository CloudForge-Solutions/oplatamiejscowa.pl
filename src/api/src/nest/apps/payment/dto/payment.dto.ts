/**
 * Payment DTOs
 *
 * RESPONSIBILITY: Data Transfer Objects for payment operations
 * ARCHITECTURE: NestJS DTOs with validation decorators
 */

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsEmail, IsOptional, IsUUID, IsEnum, IsDateString, Min, Max } from 'class-validator';

// Enums
export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum ReservationStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum Currency {
  PLN = 'PLN',
  EUR = 'EUR',
  USD = 'USD',
}

// Request DTOs
export class CreateReservationDto {
  @ApiProperty({ description: 'Guest full name', example: 'Jan Kowalski' })
  @IsString()
  guestName: string;

  @ApiProperty({ description: 'Guest email address', example: 'jan.kowalski@example.com' })
  @IsEmail()
  guestEmail: string;

  @ApiProperty({ description: 'Accommodation name', example: 'Hotel Kraków' })
  @IsString()
  accommodationName: string;

  @ApiProperty({ description: 'Accommodation address', example: 'ul. Floriańska 1, 31-019 Kraków' })
  @IsString()
  accommodationAddress: string;

  @ApiProperty({ description: 'Check-in date', example: '2024-08-15' })
  @IsDateString()
  checkInDate: string;

  @ApiProperty({ description: 'Check-out date', example: '2024-08-18' })
  @IsDateString()
  checkOutDate: string;

  @ApiProperty({ description: 'Number of guests', example: 2, minimum: 1, maximum: 20 })
  @IsNumber()
  @Min(1)
  @Max(20)
  numberOfGuests: number;

  @ApiProperty({ description: 'City name (used to determine tax rate)', example: 'Kraków' })
  @IsString()
  cityName: string;

  @ApiProperty({ description: 'Currency code', enum: Currency, example: Currency.PLN })
  @IsEnum(Currency)
  currency: Currency;
}

export class UpdateReservationDto {
  @ApiProperty({ description: 'Guest full name', example: 'Jan Kowalski', required: false })
  @IsOptional()
  @IsString()
  guestName?: string;

  @ApiProperty({ description: 'Guest email address', example: 'jan.kowalski@example.com', required: false })
  @IsOptional()
  @IsEmail()
  guestEmail?: string;

  @ApiProperty({ description: 'Accommodation name', example: 'Hotel Kraków', required: false })
  @IsOptional()
  @IsString()
  accommodationName?: string;

  @ApiProperty({ description: 'Accommodation address', example: 'ul. Floriańska 1, 31-019 Kraków', required: false })
  @IsOptional()
  @IsString()
  accommodationAddress?: string;

  @ApiProperty({ description: 'Check-in date', example: '2025-08-15', required: false })
  @IsOptional()
  @IsDateString()
  checkInDate?: string;

  @ApiProperty({ description: 'Check-out date', example: '2025-08-18', required: false })
  @IsOptional()
  @IsDateString()
  checkOutDate?: string;

  @ApiProperty({ description: 'Number of guests', example: 2, minimum: 1, maximum: 20, required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(20)
  numberOfGuests?: number;

  @ApiProperty({ description: 'Number of nights', example: 3, minimum: 1, maximum: 365, required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(365)
  numberOfNights?: number;

  @ApiProperty({ description: 'Tax amount per night', example: 2.50, minimum: 0.01, maximum: 1000, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  @Max(1000)
  taxAmountPerNight?: number;

  @ApiProperty({ description: 'Total tax amount', example: 15.00, minimum: 0.01, maximum: 10000, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  @Max(10000)
  totalTaxAmount?: number;

  @ApiProperty({ description: 'Currency code', enum: Currency, example: Currency.PLN, required: false })
  @IsOptional()
  @IsEnum(Currency)
  currency?: Currency;

  @ApiProperty({ description: 'City name', example: 'Kraków', required: false })
  @IsOptional()
  @IsString()
  cityName?: string;
}

export class InitiatePaymentDto {
  @ApiProperty({ description: 'Reservation UUID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  reservationId: string;

  @ApiProperty({ description: 'Success redirect URL', example: 'https://example.com/payment/success' })
  @IsString()
  successUrl: string;

  @ApiProperty({ description: 'Failure redirect URL', example: 'https://example.com/payment/failure' })
  @IsString()
  failureUrl: string;

  @ApiProperty({ description: 'Payment method preference', example: 'blik', required: false })
  @IsOptional()
  @IsString()
  paymentMethod?: string;
}

export class PaymentWebhookDto {
  @ApiProperty({ description: 'Payment ID from payment provider', example: 'pay_123456789' })
  @IsString()
  paymentId: string;

  @ApiProperty({ description: 'Payment status', enum: PaymentStatus })
  @IsEnum(PaymentStatus)
  status: PaymentStatus;

  @ApiProperty({ description: 'Payment amount', example: 15.00 })
  @IsNumber()
  amount: number;

  @ApiProperty({ description: 'Currency code', enum: Currency })
  @IsEnum(Currency)
  currency: Currency;

  @ApiProperty({ description: 'Transaction ID', example: 'txn_987654321' })
  @IsString()
  transactionId: string;

  @ApiProperty({ description: 'Webhook timestamp', example: '2024-08-04T10:30:00Z' })
  @IsDateString()
  timestamp: string;

  @ApiProperty({ description: 'Provider signature for verification', required: false })
  @IsOptional()
  @IsString()
  signature?: string;
}

// Response DTOs
export class ReservationResponseDto {
  @ApiProperty({ description: 'Reservation UUID' })
  id: string;

  @ApiProperty({ description: 'Guest full name' })
  guestName: string;

  @ApiProperty({ description: 'Guest email address' })
  guestEmail: string;

  @ApiProperty({ description: 'Accommodation name' })
  accommodationName: string;

  @ApiProperty({ description: 'Accommodation address' })
  accommodationAddress: string;

  @ApiProperty({ description: 'Check-in date' })
  checkInDate: string;

  @ApiProperty({ description: 'Check-out date' })
  checkOutDate: string;

  @ApiProperty({ description: 'Number of guests' })
  numberOfGuests: number;

  @ApiProperty({ description: 'Number of nights' })
  numberOfNights: number;

  @ApiProperty({ description: 'Tax amount per night per person' })
  taxAmountPerNight: number;

  @ApiProperty({ description: 'Total tax amount' })
  totalTaxAmount: number;

  @ApiProperty({ description: 'Currency code', enum: Currency })
  currency: Currency;

  @ApiProperty({ description: 'Reservation status', enum: ReservationStatus })
  status: ReservationStatus;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: string;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: string;

  @ApiProperty({ description: 'Payment ID if payment initiated', required: false })
  paymentId?: string;

  @ApiProperty({ description: 'Payment URL if payment initiated', required: false })
  paymentUrl?: string;

  @ApiProperty({ description: 'City name', required: false })
  cityName?: string;
}

export class PaymentResponseDto {
  @ApiProperty({ description: 'Payment ID' })
  paymentId: string;

  @ApiProperty({ description: 'Reservation ID' })
  reservationId: string;

  @ApiProperty({ description: 'Payment status', enum: PaymentStatus })
  status: PaymentStatus;

  @ApiProperty({ description: 'Payment URL for user redirection' })
  paymentUrl: string;

  @ApiProperty({ description: 'Payment amount' })
  amount: number;

  @ApiProperty({ description: 'Currency code', enum: Currency })
  currency: Currency;

  @ApiProperty({ description: 'Payment creation timestamp' })
  createdAt: string;

  @ApiProperty({ description: 'Payment expiration timestamp' })
  expiresAt: string;
}

export class PaymentStatusResponseDto {
  @ApiProperty({ description: 'Payment ID' })
  paymentId: string;

  @ApiProperty({ description: 'Reservation ID' })
  reservationId: string;

  @ApiProperty({ description: 'Current payment status', enum: PaymentStatus })
  status: PaymentStatus;

  @ApiProperty({ description: 'Status message' })
  message: string;

  @ApiProperty({ description: 'Last status update timestamp' })
  lastUpdated: string;

  @ApiProperty({ description: 'Payment amount' })
  amount: number;

  @ApiProperty({ description: 'Currency code', enum: Currency })
  currency: Currency;

  @ApiProperty({ description: 'Transaction ID if completed', required: false })
  transactionId?: string;

  @ApiProperty({ description: 'Receipt URL if completed', required: false })
  receiptUrl?: string;

  @ApiProperty({ description: 'Failure reason if failed', required: false })
  failureReason?: string;
}
