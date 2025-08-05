/**
 * Development Controller
 *
 * RESPONSIBILITY: Handle development and testing endpoints
 * ARCHITECTURE: NestJS controller for development utilities
 * ENDPOINTS: Development-specific endpoints at /api/dev
 * SECURITY: Only available in non-production environments
 */

import {
  Controller,
  Delete,
  Post,
  Get,
  Logger,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { PaymentService } from '../payment/services/payment.service';
import { DataSeedingService } from '../payment/services/data-seeding.service';

@ApiTags('development')
@Controller('dev')
export class DevController {
  private readonly logger = new Logger(DevController.name);

  constructor(
    private readonly paymentService: PaymentService,
    private readonly dataSeedingService: DataSeedingService
  ) {}

  @Get('status')
  @ApiOperation({
    summary: 'Development Environment Status',
    description: 'Check development environment status and configuration',
  })
  @ApiResponse({
    status: 200,
    description: 'Development status information',
  })
  async getDevStatus(): Promise<{
    environment: string;
    isDevelopment: boolean;
    features: string[];
    timestamp: string;
  }> {
    this.logger.log('🔧 Development status check requested');

    return {
      environment: process.env.NODE_ENV || 'development',
      isDevelopment: process.env.NODE_ENV !== 'production',
      features: [
        'Data seeding',
        'Data clearing',
        'Mock data generation',
        'Test utilities'
      ],
      timestamp: new Date().toISOString(),
    };
  }

  @Delete('data')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Clear All Data',
    description: 'Clear all reservations and payments from storage (development only)',
  })
  @ApiResponse({
    status: 204,
    description: 'All data cleared successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Not available in production environment',
  })
  async clearAllData(): Promise<void> {
    this.logger.log('🧹 Clearing all development data via REST API');
    
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Data clearing not available in production');
    }

    await this.paymentService.clearAllData();
  }

  @Post('seed')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Seed Test Data',
    description: 'Generate and insert mock data for development and testing',
  })
  @ApiResponse({
    status: 201,
    description: 'Test data seeded successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Not available in production environment',
  })
  async seedTestData(): Promise<{ success: boolean; message: string; count: number }> {
    this.logger.log('🌱 Seeding test data via REST API');
    
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Data seeding not available in production');
    }

    await this.dataSeedingService.seedMockData();
    
    return {
      success: true,
      message: 'Test data seeded successfully',
      count: 4, // Number of mock reservations created
    };
  }

  @Post('reset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reset All Data',
    description: 'Clear all data and reseed with fresh mock data (development only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Data reset completed successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Not available in production environment',
  })
  async resetAllData(): Promise<{ success: boolean; message: string }> {
    this.logger.log('🔄 Resetting all development data via REST API');
    
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Data reset not available in production');
    }

    await this.dataSeedingService.resetData();
    
    return {
      success: true,
      message: 'All data reset and reseeded successfully',
    };
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Development Statistics',
    description: 'Get current data statistics for development monitoring',
  })
  @ApiResponse({
    status: 200,
    description: 'Development statistics',
  })
  async getDevStats(): Promise<{
    reservations: number;
    payments: number;
    environment: string;
    timestamp: string;
  }> {
    this.logger.log('📊 Development statistics requested');

    const reservations = await this.paymentService.getAllReservations();
    const payments = await this.paymentService.getAllPayments();

    return {
      reservations: reservations.length,
      payments: payments.length,
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
    };
  }
}
