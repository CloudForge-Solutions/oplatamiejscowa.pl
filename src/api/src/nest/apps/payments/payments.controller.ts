/**
 * Payments Controller
 *
 * RESPONSIBILITY: Handle payment-related HTTP requests
 * ARCHITECTURE: NestJS controller for payment processing and status management
 * ENDPOINTS: RESTful resource-based endpoints at /api/payments
 */

import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Logger,
  HttpCode,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody
} from '@nestjs/swagger';
import { PaymentService } from '../payment/services/payment.service';
import {
  InitiatePaymentDto,
  PaymentWebhookDto,
  PaymentResponseDto,
  PaymentStatusResponseDto
} from '../payment/dto/payment.dto';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(private readonly paymentService: PaymentService) {}

  @Get()
  @ApiOperation({
    summary: 'List All Payments',
    description: 'Retrieve all payment transactions',
  })
  @ApiResponse({
    status: 200,
    description: 'List of all payments',
  })
  async getAllPayments() {
    this.logger.log('📋 Fetching all payments via REST API');
    return await this.paymentService.getAllPayments();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create Payment',
    description: 'Initialize a new payment transaction for a reservation',
  })
  @ApiBody({ type: InitiatePaymentDto })
  @ApiResponse({
    status: 201,
    description: 'Payment initiated successfully',
    type: PaymentResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid payment data',
  })
  @ApiResponse({
    status: 404,
    description: 'Reservation not found',
  })
  async createPayment(
    @Body(ValidationPipe) initiatePaymentDto: InitiatePaymentDto
  ): Promise<PaymentResponseDto> {
    this.logger.log('💳 Creating payment via REST API', {
      reservationId: initiatePaymentDto.reservationId,
    });

    return await this.paymentService.initializePayment(initiatePaymentDto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get Payment Details',
    description: 'Retrieve detailed information about a specific payment',
  })
  @ApiParam({
    name: 'id',
    description: 'Payment ID',
    example: 'pay_1691234567_abc123def',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment details',
    type: PaymentStatusResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Payment not found',
  })
  async getPayment(
    @Param('id') paymentId: string
  ): Promise<PaymentStatusResponseDto> {
    this.logger.log('🔍 Fetching payment details via REST API', { paymentId });
    return await this.paymentService.getPaymentStatus(paymentId);
  }

  @Get(':id/status')
  @ApiOperation({
    summary: 'Get Payment Status',
    description: 'Retrieve current status of a payment transaction',
  })
  @ApiParam({
    name: 'id',
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
    @Param('id') paymentId: string
  ): Promise<PaymentStatusResponseDto> {
    this.logger.log('📊 Fetching payment status via REST API', { paymentId });
    return await this.paymentService.getPaymentStatus(paymentId);
  }

  @Put(':id/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update Payment Status',
    description: 'Update payment status via webhook (used by payment providers)',
  })
  @ApiParam({
    name: 'id',
    description: 'Payment ID',
    example: 'pay_1691234567_abc123def',
  })
  @ApiBody({ type: PaymentWebhookDto })
  @ApiResponse({
    status: 200,
    description: 'Payment status updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Payment not found',
  })
  async updatePaymentStatus(
    @Param('id') paymentId: string,
    @Body(ValidationPipe) webhookDto: PaymentWebhookDto
  ): Promise<{ success: boolean; message: string }> {
    this.logger.log('🔔 Updating payment status via REST API', {
      paymentId,
      status: webhookDto.status,
    });

    // Ensure the payment ID in the URL matches the webhook data
    const updatedWebhookDto = { ...webhookDto, paymentId };
    return await this.paymentService.processWebhook(updatedWebhookDto);
  }

  @Post('webhooks')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Payment Webhook',
    description: 'Handle payment status updates from payment providers (legacy endpoint)',
  })
  @ApiBody({ type: PaymentWebhookDto })
  @ApiResponse({
    status: 200,
    description: 'Webhook processed successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid webhook data',
  })
  async processWebhook(
    @Body(ValidationPipe) webhookDto: PaymentWebhookDto
  ): Promise<{ success: boolean; message: string }> {
    this.logger.log('🔔 Processing payment webhook via REST API', {
      paymentId: webhookDto.paymentId,
      status: webhookDto.status,
    });

    return await this.paymentService.processWebhook(webhookDto);
  }
}
