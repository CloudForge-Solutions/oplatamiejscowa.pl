/**
 * Payments Module
 *
 * RESPONSIBILITY: Module for payment processing and management
 * ARCHITECTURE: NestJS module with controller and shared services
 */

import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentModule } from '../payment/payment.module';

@Module({
  imports: [PaymentModule],
  controllers: [PaymentsController],
  providers: [],
  exports: [],
})
export class PaymentsModule {}
