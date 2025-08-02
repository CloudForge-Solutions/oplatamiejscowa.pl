/**
 * Reservations Controller for NestJS Azure Function
 * Handles CRUD operations for tourist tax reservations
 * Integrates with Azure Table Storage and Blob Storage
 */

import { Controller, Get, Post, Patch, Param, Body, Query, HttpException, HttpStatus } from '@nestjs/common';
import { ReservationService } from '../services/reservation.service';
import { CreateReservationDto, UpdateReservationStatusDto, ReservationQueryDto } from '../dto/reservation.dto';
import { ReservationData } from '../interfaces/reservation.interface';

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationService: ReservationService) {}

  /**
   * Create a new reservation
   * POST /api/reservations
   */
  @Post()
  async createReservation(@Body() createReservationDto: CreateReservationDto): Promise<ReservationData> {
    try {
      return await this.reservationService.create(createReservationDto);
    } catch (error) {
      throw new HttpException(
        {
          message: 'Failed to create reservation',
          error: error.message
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  /**
   * Get reservations by city
   * GET /api/reservations/city/:cityCode
   */
  @Get('city/:cityCode')
  async getReservationsByCity(
    @Param('cityCode') cityCode: string,
    @Query() query: ReservationQueryDto
  ): Promise<ReservationData[]> {
    try {
      return await this.reservationService.findByCity(cityCode, query);
    } catch (error) {
      throw new HttpException(
        {
          message: 'Failed to fetch reservations',
          error: error.message
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Get reservation by ID
   * GET /api/reservations/:id
   */
  @Get(':id')
  async getReservation(@Param('id') id: string): Promise<ReservationData> {
    try {
      const reservation = await this.reservationService.findById(id);
      
      if (!reservation) {
        throw new HttpException(
          {
            message: 'Reservation not found',
            code: 'RESERVATION_NOT_FOUND'
          },
          HttpStatus.NOT_FOUND
        );
      }

      return reservation;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        {
          message: 'Failed to fetch reservation',
          error: error.message
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Update reservation status
   * PATCH /api/reservations/:id/status
   */
  @Patch(':id/status')
  async updateReservationStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateReservationStatusDto
  ): Promise<ReservationData> {
    try {
      const updatedReservation = await this.reservationService.updateStatus(id, updateStatusDto.status);
      
      if (!updatedReservation) {
        throw new HttpException(
          {
            message: 'Reservation not found',
            code: 'RESERVATION_NOT_FOUND'
          },
          HttpStatus.NOT_FOUND
        );
      }

      return updatedReservation;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        {
          message: 'Failed to update reservation status',
          error: error.message
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Get reservations with pagination
   * GET /api/reservations
   */
  @Get()
  async getReservations(@Query() query: ReservationQueryDto): Promise<{
    data: ReservationData[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      hasMore: boolean;
    };
  }> {
    try {
      const result = await this.reservationService.findWithPagination(query);
      return result;
    } catch (error) {
      throw new HttpException(
        {
          message: 'Failed to fetch reservations',
          error: error.message
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
