/**
 * Validate UUID DTO
 *
 * RESPONSIBILITY: Validate UUID validation requests
 * ARCHITECTURE: Class-validator with Swagger documentation
 */

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class ValidateUuidDto {
  @ApiProperty({
    description: 'UUID string to validate',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  uuid: string = '';
}
