/**
 * Reservations Controller
 *
 * RESPONSIBILITY: Handle reservation-related HTTP requests
 * ARCHITECTURE: NestJS controller for tourist tax reservation management
 * ENDPOINTS: RESTful resource-based endpoints at /api/reservations
 */

import {
  Controller,
  Get,
  Post,
  Put,
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
import { PaymentService } from '../payment/services/payment.service';
import {
  CreateReservationDto,
  ReservationResponseDto,
  UpdateReservationDto
} from '../payment/dto/payment.dto';

@ApiTags('reservations')
@Controller('reservations')
export class ReservationsController {
  private readonly logger = new Logger(ReservationsController.name);

  constructor(private readonly paymentService: PaymentService) {}

  @Get()
  @ApiOperation({
    summary: 'List All Reservations',
    description: 'Retrieve all tourist tax reservations',
  })
  @ApiResponse({
    status: 200,
    description: 'List of all reservations',
    type: [ReservationResponseDto],
  })
  async getAllReservations(): Promise<ReservationResponseDto[]> {
    this.logger.log('📋 Fetching all reservations via REST API');
    return await this.paymentService.getAllReservations();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create New Reservation',
    description: 'Create a new tourist tax reservation',
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
    this.logger.log('📝 Creating new reservation via REST API', {
      guestName: createReservationDto.guestName,
      accommodationName: createReservationDto.accommodationName,
      cityName: createReservationDto.cityName,
      numberOfGuests: createReservationDto.numberOfGuests,
    });

    return await this.paymentService.createReservation(createReservationDto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get Reservation by ID',
    description: 'Retrieve a specific reservation by its UUID',
  })
  @ApiParam({
    name: 'id',
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
    @Param('id', ParseUUIDPipe) reservationId: string
  ): Promise<ReservationResponseDto> {
    this.logger.log('🔍 Fetching reservation via REST API', { reservationId });
    return await this.paymentService.getReservation(reservationId);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update Reservation',
    description: 'Update an existing reservation',
  })
  @ApiParam({
    name: 'id',
    description: 'Reservation UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({ type: UpdateReservationDto })
  @ApiResponse({
    status: 200,
    description: 'Reservation updated successfully',
    type: ReservationResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Reservation not found',
  })
  async updateReservation(
    @Param('id', ParseUUIDPipe) reservationId: string,
    @Body(ValidationPipe) updateReservationDto: UpdateReservationDto
  ): Promise<ReservationResponseDto> {
    this.logger.log('✏️ Updating reservation via REST API', { reservationId });
    // TODO: Implement updateReservation in PaymentService
    throw new Error('Update reservation not yet implemented');
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete Reservation',
    description: 'Delete a reservation and its associated data',
  })
  @ApiParam({
    name: 'id',
    description: 'Reservation UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 204,
    description: 'Reservation deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Reservation not found',
  })
  async deleteReservation(
    @Param('id', ParseUUIDPipe) reservationId: string
  ): Promise<void> {
    this.logger.log('🗑️ Deleting reservation via REST API', { reservationId });
    await this.paymentService.deleteReservation(reservationId);
  }
}
