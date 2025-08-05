/**
 * Storage Controller
 *
 * RESPONSIBILITY: Handle SAS token generation requests
 * ARCHITECTURE: NestJS controller with validation and error handling
 */

import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Logger,
  UseGuards,
  Headers,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { SasTokenService } from './services/sas-token.service';
import { GenerateSasTokenDto } from './dto/generate-sas-token.dto';
import { SasTokenResponseDto } from './dto/sas-token-response.dto';
import { RateLimitGuard } from '../../common/guards/rate-limit.guard';

@ApiTags('storage')
@Controller('storage')
@UseGuards(RateLimitGuard)
export class StorageController {
  private readonly logger = new Logger(StorageController.name);

  constructor(private readonly sasTokenService: SasTokenService) {}

  @Post('sas-tokens')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Generate SAS Token',
    description: 'Generate a secure SAS token for Azure Blob Storage access with time-limited permissions',
  })
  @ApiBody({
    type: GenerateSasTokenDto,
    description: 'SAS token generation parameters',
  })
  @ApiResponse({
    status: 200,
    description: 'SAS token generated successfully',
    type: SasTokenResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request parameters',
  })
  @ApiResponse({
    status: 429,
    description: 'Rate limit exceeded',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async generateSasToken(
    @Body() generateSasTokenDto: GenerateSasTokenDto,
    @Headers('x-forwarded-for') clientIp?: string,
    @Headers('user-agent') userAgent?: string,
  ): Promise<SasTokenResponseDto> {
    const startTime = Date.now();

    this.logger.log('🔐 SAS token generation request received', {
      containerName: generateSasTokenDto.containerName,
      permissions: generateSasTokenDto.permissions,
      expiryHours: generateSasTokenDto.expiryHours,
      reservationId: generateSasTokenDto.reservationId,
      clientIp: clientIp || 'unknown',
      userAgent: userAgent || 'unknown',
    });

    try {
      const result = await this.sasTokenService.generateSasToken(generateSasTokenDto);

      const duration = Date.now() - startTime;
      this.logger.log('✅ SAS token generated successfully', {
        duration: `${duration}ms`,
        expiresAt: result.expiresAt,
        containerName: generateSasTokenDto.containerName,
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error('❌ Failed to generate SAS token', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        duration: `${duration}ms`,
        containerName: generateSasTokenDto.containerName,
      });

      throw error;
    }
  }
}
