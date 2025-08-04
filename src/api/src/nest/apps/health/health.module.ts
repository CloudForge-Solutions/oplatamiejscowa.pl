/**
 * Health Module
 * 
 * RESPONSIBILITY: Health checks and system status
 * ARCHITECTURE: NestJS module with health monitoring
 */

import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { HealthService } from './services/health.service';

@Module({
  controllers: [HealthController],
  providers: [HealthService],
  exports: [HealthService],
})
export class HealthModule {}
