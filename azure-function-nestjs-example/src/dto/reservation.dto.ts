/**
 * Data Transfer Objects for Reservation API
 * Defines the structure for request/response data
 */

import { IsString, IsNumber, IsEnum, IsOptional, IsDateString, Min, Max } from 'class-validator';

export class CreateReservationDto {
  @IsString()
  cityCode: string;

  @IsString()
  cityName: string;

  @IsString()
  bookingPlatform: string;

  @IsDateString()
  checkInDate: string;

  @IsDateString()
  checkOutDate: string;

  @IsNumber()
  @Min(1)
  @Max(20)
  guestCount: number;

  @IsNumber()
  @Min(0.01)
  taxAmount: number;
}

export class UpdateReservationStatusDto {
  @IsEnum(['pending', 'paid', 'cancelled'])
  status: 'pending' | 'paid' | 'cancelled';
}

export class ReservationQueryDto {
  @IsOptional()
  @IsEnum(['pending', 'paid', 'cancelled'])
  status?: 'pending' | 'paid' | 'cancelled';

  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;
}
