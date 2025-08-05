/**
 * Reservations Module
 *
 * RESPONSIBILITY: Module for reservation management
 * ARCHITECTURE: NestJS module with controller and shared services
 */

import { Module } from '@nestjs/common';
import { ReservationsController } from './reservations.controller';
import { PaymentModule } from '../payment/payment.module';

@Module({
  imports: [PaymentModule],
  controllers: [ReservationsController],
  providers: [],
  exports: [],
})
export class ReservationsModule {}
