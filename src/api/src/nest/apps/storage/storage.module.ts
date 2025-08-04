/**
 * Storage Module
 * 
 * RESPONSIBILITY: Azure Blob Storage and SAS token management
 * ARCHITECTURE: NestJS module with dependency injection
 */

import { Module } from '@nestjs/common';
import { StorageController } from './storage.controller';
import { SasTokenService } from './services/sas-token.service';
import { StorageValidationService } from './services/storage-validation.service';

@Module({
  controllers: [StorageController],
  providers: [SasTokenService, StorageValidationService],
  exports: [SasTokenService, StorageValidationService],
})
export class StorageModule {}
