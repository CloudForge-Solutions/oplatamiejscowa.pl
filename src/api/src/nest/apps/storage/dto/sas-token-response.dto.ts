/**
 * SAS Token Response DTO
 *
 * RESPONSIBILITY: Structure SAS token generation responses
 * ARCHITECTURE: Class-transformer with Swagger documentation
 */

import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class SasTokenResponseDto {
  @ApiProperty({
    description: 'Indicates if the SAS token generation was successful',
    example: true,
  })
  @Expose()
  success: boolean = false;

  @ApiProperty({
    description: 'Generated SAS token query string',
    example: 'sv=2024-08-04&ss=b&srt=sco&sp=rw&se=2024-08-04T12:00:00Z&st=2024-08-03T12:00:00Z&spr=https&sig=...',
    required: false,
  })
  @Expose()
  sasToken?: string;

  @ApiProperty({
    description: 'Azure Blob Storage service URL',
    example: 'http://127.0.0.1:10000/devstoreaccount1',
    required: false,
  })
  @Expose()
  serviceUrl?: string;

  @ApiProperty({
    description: 'Token expiration timestamp in ISO format',
    example: '2024-08-04T12:00:00.000Z',
    required: false,
  })
  @Expose()
  expiresAt?: string;

  @ApiProperty({
    description: 'Error message if generation failed',
    example: 'Invalid container name',
    required: false,
  })
  @Expose()
  error?: string;

  @ApiProperty({
    description: 'Additional error details for debugging',
    example: ['Container name must be lowercase'],
    required: false,
  })
  @Expose()
  details?: string[];

  constructor(partial: Partial<SasTokenResponseDto>) {
    Object.assign(this, partial);
  }
}
