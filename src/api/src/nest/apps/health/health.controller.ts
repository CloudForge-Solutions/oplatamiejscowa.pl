/**
 * Health Controller
 * 
 * RESPONSIBILITY: Health check endpoints
 * ARCHITECTURE: NestJS controller with system monitoring
 */

import { Controller, Get, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthService } from './services/health.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({
    summary: 'Health Check',
    description: 'Check if the Azure Functions backend is healthy and operational',
  })
  @ApiResponse({
    status: 200,
    description: 'Service is healthy',
  })
  @ApiResponse({
    status: 503,
    description: 'Service is unhealthy',
  })
  async getHealth(): Promise<{
    status: string;
    timestamp: string;
    uptime: number;
    version: string;
    environment: string;
  }> {
    this.logger.log('🏥 Health check requested');

    const healthStatus = await this.healthService.getHealthStatus();

    this.logger.log(`${healthStatus.status === 'healthy' ? '✅' : '❌'} Health check completed`, {
      status: healthStatus.status,
      uptime: healthStatus.uptime,
    });

    return healthStatus;
  }

  @Get('ready')
  @ApiOperation({
    summary: 'Readiness Check',
    description: 'Check if the service is ready to accept requests',
  })
  @ApiResponse({
    status: 200,
    description: 'Service is ready',
  })
  @ApiResponse({
    status: 503,
    description: 'Service is not ready',
  })
  async getReadiness(): Promise<{
    ready: boolean;
    checks: Record<string, boolean>;
  }> {
    this.logger.log('🚀 Readiness check requested');

    const readinessStatus = await this.healthService.getReadinessStatus();

    this.logger.log(`${readinessStatus.ready ? '✅' : '❌'} Readiness check completed`, {
      ready: readinessStatus.ready,
      checks: readinessStatus.checks,
    });

    return readinessStatus;
  }

  @Get('live')
  @ApiOperation({
    summary: 'Liveness Check',
    description: 'Check if the service is alive and responding',
  })
  @ApiResponse({
    status: 200,
    description: 'Service is alive',
  })
  getLiveness(): { alive: boolean; timestamp: string } {
    this.logger.log('💓 Liveness check requested');

    const livenessStatus = {
      alive: true,
      timestamp: new Date().toISOString(),
    };

    this.logger.log('✅ Liveness check completed', livenessStatus);

    return livenessStatus;
  }
}
