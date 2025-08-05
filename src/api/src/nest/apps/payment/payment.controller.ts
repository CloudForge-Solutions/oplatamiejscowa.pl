/**
 * Payment Controller (Legacy)
 *
 * RESPONSIBILITY: Legacy payment endpoints for backward compatibility
 * ARCHITECTURE: NestJS controller - will be deprecated in favor of resource-based endpoints
 * NOTE: New endpoints are available at /api/reservations and /api/payments
 */

import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Logger,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  ParseUUIDPipe
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody
} from '@nestjs/swagger';
import { PaymentService } from './services/payment.service';
import {
  CreateReservationDto,
  InitiatePaymentDto,
  PaymentWebhookDto,
  ReservationResponseDto,
  PaymentResponseDto,
  PaymentStatusResponseDto
} from './dto/payment.dto';

@ApiTags('payment-legacy')
@Controller('payment')
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);

  constructor(private readonly paymentService: PaymentService) {}

  // Service Status Endpoints

  @Get('status')
  @ApiOperation({
    summary: 'Payment Service Status (Legacy)',
    description: 'Check if payment service is available. DEPRECATED: Use /api/dev/status instead',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment service status',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'available' },
        message: { type: 'string', example: 'Payment service is ready' },
        timestamp: { type: 'string', example: '2024-08-04T10:30:00Z' },
      },
    },
  })
  async getServiceStatus(): Promise<{ status: string; message: string; timestamp: string }> {
    this.logger.log('📊 Payment service status check requested');

    const isAvailable = await this.paymentService.isAvailable();

    return {
      status: isAvailable ? 'available' : 'unavailable',
      message: isAvailable
        ? 'Payment service is ready for tourist tax payments'
        : 'Payment service is currently unavailable',
      timestamp: new Date().toISOString(),
    };
  }

  // Reservation Management Endpoints

  @Post('reservations')
  @ApiOperation({
    summary: 'Create New Reservation (Legacy)',
    description: 'Create a new tourist tax reservation. DEPRECATED: Use POST /api/reservations instead',
  })
  @ApiBody({ type: CreateReservationDto })
  @ApiResponse({
    status: 201,
    description: 'Reservation created successfully',
    type: ReservationResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid reservation data',
  })
  async createReservation(
    @Body(ValidationPipe) createReservationDto: CreateReservationDto
  ): Promise<ReservationResponseDto> {
    this.logger.log('📝 Creating new reservation via API', {
      guestName: createReservationDto.guestName,
      accommodationName: createReservationDto.accommodationName,
    });

    return await this.paymentService.createReservation(createReservationDto);
  }

  @Get('reservations')
  @ApiOperation({
    summary: 'Get All Reservations',
    description: 'Retrieve all reservations (development/testing endpoint)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of all reservations',
    type: [ReservationResponseDto],
  })
  async getAllReservations(): Promise<ReservationResponseDto[]> {
    this.logger.log('📋 Fetching all reservations via API');
    return await this.paymentService.getAllReservations();
  }

  @Get('reservations/:reservationId')
  @ApiOperation({
    summary: 'Get Reservation by ID',
    description: 'Retrieve a specific reservation by its UUID',
  })
  @ApiParam({
    name: 'reservationId',
    description: 'Reservation UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Reservation details',
    type: ReservationResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Reservation not found',
  })
  async getReservation(
    @Param('reservationId', ParseUUIDPipe) reservationId: string
  ): Promise<ReservationResponseDto> {
    this.logger.log('🔍 Fetching reservation via API', { reservationId });
    return await this.paymentService.getReservation(reservationId);
  }

  @Delete('reservations/:reservationId')
  @ApiOperation({
    summary: 'Delete Reservation',
    description: 'Delete a reservation and its associated payment (development/testing endpoint)',
  })
  @ApiParam({
    name: 'reservationId',
    description: 'Reservation UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Reservation deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Reservation not found',
  })
  async deleteReservation(
    @Param('reservationId', ParseUUIDPipe) reservationId: string
  ): Promise<{ success: boolean; message: string }> {
    this.logger.log('🗑️ Deleting reservation via API', { reservationId });
    return await this.paymentService.deleteReservation(reservationId);
  }

  // Payment Processing Endpoints

  @Post('initiate')
  @ApiOperation({
    summary: 'Initiate Payment',
    description: 'Initialize payment process for a reservation',
  })
  @ApiBody({ type: InitiatePaymentDto })
  @ApiResponse({
    status: 201,
    description: 'Payment initiated successfully',
    type: PaymentResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid payment request',
  })
  @ApiResponse({
    status: 404,
    description: 'Reservation not found',
  })
  async initiatePayment(
    @Body(ValidationPipe) initiatePaymentDto: InitiatePaymentDto
  ): Promise<PaymentResponseDto> {
    this.logger.log('💳 Initiating payment via API', {
      reservationId: initiatePaymentDto.reservationId,
    });

    return await this.paymentService.initializePayment(initiatePaymentDto);
  }

  @Get(':paymentId/status')
  @ApiOperation({
    summary: 'Get Payment Status',
    description: 'Retrieve current status of a payment',
  })
  @ApiParam({
    name: 'paymentId',
    description: 'Payment ID',
    example: 'pay_1691234567_abc123def',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment status details',
    type: PaymentStatusResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Payment not found',
  })
  async getPaymentStatus(
    @Param('paymentId') paymentId: string
  ): Promise<PaymentStatusResponseDto> {
    this.logger.log('📊 Fetching payment status via API', { paymentId });
    return await this.paymentService.getPaymentStatus(paymentId);
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Payment Webhook',
    description: 'Handle payment status updates from payment provider',
  })
  @ApiBody({ type: PaymentWebhookDto })
  @ApiResponse({
    status: 200,
    description: 'Webhook processed successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Payment status updated to completed' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid webhook data',
  })
  @ApiResponse({
    status: 404,
    description: 'Payment not found',
  })
  async processWebhook(
    @Body(ValidationPipe) webhookDto: PaymentWebhookDto
  ): Promise<{ success: boolean; message: string }> {
    this.logger.log('🔔 Processing payment webhook via API', {
      paymentId: webhookDto.paymentId,
      status: webhookDto.status,
    });

    return await this.paymentService.processWebhook(webhookDto);
  }

  // Development/Testing Endpoints

  @Get('payments')
  @ApiOperation({
    summary: 'Get All Payments',
    description: 'Retrieve all payments (development/testing endpoint)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of all payments',
  })
  async getAllPayments() {
    this.logger.log('📋 Fetching all payments via API');
    return await this.paymentService.getAllPayments();
  }

  @Delete('clear-all')
  @ApiOperation({
    summary: 'Clear All Data',
    description: 'Clear all reservations and payments, reseed with mock data (development/testing endpoint)',
  })
  @ApiResponse({
    status: 200,
    description: 'All data cleared successfully',
  })
  async clearAllData(): Promise<{ success: boolean; message: string }> {
    this.logger.log('🧹 Clearing all data via API');
    return await this.paymentService.clearAllData();
  }
}
