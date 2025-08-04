/**
 * Payment Module
 * 
 * RESPONSIBILITY: Payment processing and imoje integration
 * ARCHITECTURE: NestJS module for future payment functionality
 */

import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './services/payment.service';

@Module({
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
