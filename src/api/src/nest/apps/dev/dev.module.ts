/**
 * Development Module
 *
 * RESPONSIBILITY: Module for development and testing utilities
 * ARCHITECTURE: NestJS module with development-specific controllers and services
 * SECURITY: Only loaded in non-production environments
 */

import { Module } from '@nestjs/common';
import { DevController } from './dev.controller';
import { PaymentModule } from '../payment/payment.module';

@Module({
  imports: [PaymentModule],
  controllers: [DevController],
  providers: [],
  exports: [],
})
export class DevModule {}
