/**
 * Validation Controller
 * 
 * RESPONSIBILITY: Handle validation requests
 * ARCHITECTURE: NestJS controller with validation endpoints
 */

import { Controller, Post, Body, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { ValidationService } from './services/validation.service';
import { ValidateUuidDto } from './dto/validate-uuid.dto';

@ApiTags('validation')
@Controller('validation')
export class ValidationController {
  private readonly logger = new Logger(ValidationController.name);

  constructor(private readonly validationService: ValidationService) {}

  @Post('uuid')
  @ApiOperation({
    summary: 'Validate UUID',
    description: 'Validate if a string is a properly formatted UUID',
  })
  @ApiBody({
    type: ValidateUuidDto,
    description: 'UUID validation request',
  })
  @ApiResponse({
    status: 200,
    description: 'UUID validation result',
  })
  validateUuid(@Body() validateUuidDto: ValidateUuidDto): { isValid: boolean; uuid: string } {
    this.logger.log('🔍 UUID validation requested', {
      uuid: validateUuidDto.uuid,
    });

    const isValid = this.validationService.validateUUID(validateUuidDto.uuid);

    this.logger.log(`${isValid ? '✅' : '❌'} UUID validation result`, {
      uuid: validateUuidDto.uuid,
      isValid,
    });

    return {
      isValid,
      uuid: validateUuidDto.uuid,
    };
  }
}
