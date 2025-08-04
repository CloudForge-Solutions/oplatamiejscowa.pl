/**
 * Generate SAS Token DTO
 * 
 * RESPONSIBILITY: Validate SAS token generation requests
 * ARCHITECTURE: Class-validator with Swagger documentation
 */

import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsNumber,
  IsUUID,
  Matches,
  Min,
  Max,
  Length,
} from 'class-validator';

export class GenerateSasTokenDto {
  @ApiProperty({
    description: 'Azure Blob Storage container name',
    example: 'reservations',
    required: false,
    minLength: 3,
    maxLength: 63,
    pattern: '^[a-z0-9]([a-z0-9-]*[a-z0-9])?$',
  })
  @IsOptional()
  @IsString()
  @Length(3, 63, {
    message: 'Container name must be between 3 and 63 characters long',
  })
  @Matches(/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/, {
    message: 'Container name must contain only lowercase letters, numbers, and hyphens',
  })
  containerName?: string;

  @ApiProperty({
    description: 'SAS token permissions (r=read, w=write, d=delete, l=list)',
    example: 'rw',
    required: false,
    pattern: '^[rwdl]+$',
  })
  @IsOptional()
  @IsString()
  @Matches(/^[rwdl]+$/, {
    message: 'Permissions must contain only r, w, d, l characters',
  })
  permissions?: string;

  @ApiProperty({
    description: 'Token expiry time in hours',
    example: 24,
    required: false,
    minimum: 1,
    maximum: 168,
  })
  @IsOptional()
  @IsNumber()
  @Min(1, {
    message: 'Expiry hours must be at least 1',
  })
  @Max(168, {
    message: 'Expiry hours must be at most 168 (7 days)',
  })
  expiryHours?: number;

  @ApiProperty({
    description: 'Reservation UUID for tracking purposes',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID(4, {
    message: 'Reservation ID must be a valid UUID v4',
  })
  reservationId?: string;
}
