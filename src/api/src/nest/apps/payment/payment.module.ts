/**
 * Payment Module
 *
 * RESPONSIBILITY: Payment processing and imoje integration
 * ARCHITECTURE: NestJS module for future payment functionality
 */

import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './services/payment.service';
import { ImojeService } from './services/imoje.service';
import { AzureStorageService } from './services/azure-storage.service';
import { DataSeedingService } from './services/data-seeding.service';
import { TaxRateService } from './services/tax-rate.service';

@Module({
  controllers: [PaymentController],
  providers: [PaymentService, ImojeService, AzureStorageService, DataSeedingService, TaxRateService],
  exports: [PaymentService, ImojeService, AzureStorageService, DataSeedingService, TaxRateService],
})
export class PaymentModule {}
