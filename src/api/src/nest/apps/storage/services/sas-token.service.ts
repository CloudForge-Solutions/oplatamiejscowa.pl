/**
 * SAS Token Service (NestJS)
 *
 * RESPONSIBILITY: Generate secure SAS tokens for Azure Blob Storage
 * ARCHITECTURE: NestJS service with dependency injection and configuration
 */

import { Injectable, Logger, InternalServerErrorException, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  generateBlobSASQueryParameters,
  BlobSASPermissions,
  StorageSharedKeyCredential,
  BlobServiceClient,
} from '@azure/storage-blob';
import { GenerateSasTokenDto } from '../dto/generate-sas-token.dto';
import { SasTokenResponseDto } from '../dto/sas-token-response.dto';

@Injectable()
export class SasTokenService {
  private readonly logger = new Logger(SasTokenService.name);

  constructor(private readonly configService: ConfigService) {}

  /**
   * Generate Blob-Specific SAS Token with Reservation Validation
   * SECURITY: Validates reservation exists and generates blob-specific token
   * COST-OPTIMIZED: Minimal permissions for specific blob only
   */
  async generateSasToken(dto: GenerateSasTokenDto): Promise<SasTokenResponseDto> {
    try {
      this.logger.log('🔐 Generating blob-specific SAS token', {
        containerName: dto.containerName,
        permissions: dto.permissions,
        expiryHours: dto.expiryHours,
        reservationId: dto.reservationId,
      });

      // SECURITY: Require reservation ID for blob-specific access
      if (!dto.reservationId) {
        throw new BadRequestException('Reservation ID is required for secure blob access');
      }

      // Get configuration values
      const accountName = this.configService.get<string>('storage.accountName');
      const accountKey = this.configService.get<string>('storage.accountKey');
      const connectionString = this.configService.get<string>('storage.connectionString');
      const defaultContainer = this.configService.get<string>('storage.containerName');
      const defaultExpiryHours = this.configService.get<number>('sas.expiryHours');

      if (!accountName || !accountKey) {
        this.logger.error('❌ Missing Azure Storage credentials', {
          hasAccountName: !!accountName,
          hasAccountKey: !!accountKey,
          hasConnectionString: !!connectionString,
        });

        throw new InternalServerErrorException('Azure Storage credentials not configured');
      }

      // Use provided values or defaults with proper type safety
      const containerName = dto.containerName || defaultContainer || 'reservations';
      const expiryHours = dto.expiryHours || defaultExpiryHours;
      const blobName = `${dto.reservationId}.json`;
      const safeConnectionString = connectionString || '';

      // SECURITY: Validate reservation exists before generating SAS token
      await this.validateReservationExists(accountName, accountKey, safeConnectionString, containerName, blobName);

      // Create shared key credential
      const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);

      // Set expiry time (24h max for security)
      const expiresOn = new Date();
      expiresOn.setHours(expiresOn.getHours() + Math.min(expiryHours || 24, 24));

      // SECURITY: Configure minimal blob-specific permissions (read-only by default)
      const sasPermissions = BlobSASPermissions.parse(dto.permissions || 'r');

      // Generate blob-specific SAS token
      const sasToken = generateBlobSASQueryParameters(
        {
          containerName: containerName,
          blobName: blobName,
          permissions: sasPermissions,
          startsOn: new Date(),
          expiresOn: expiresOn,
        },
        sharedKeyCredential,
      ).toString();

      // Extract service URL from connection string
      const serviceUrl = this.extractBlobEndpointFromConnectionString(safeConnectionString);

      this.logger.log('✅ Blob-specific SAS token generated successfully', {
        expiresAt: expiresOn.toISOString(),
        permissions: dto.permissions || 'r',
        containerName: containerName,
        blobName: blobName,
        reservationId: dto.reservationId,
      });

      return new SasTokenResponseDto({
        success: true,
        sasToken: sasToken,
        serviceUrl: serviceUrl,
        expiresAt: expiresOn.toISOString(),
      });
    } catch (error) {
      this.logger.error('❌ Failed to generate blob-specific SAS token', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        dto: dto,
      });

      if (error instanceof BadRequestException || error instanceof NotFoundException || error instanceof InternalServerErrorException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to generate SAS token');
    }
  }

  /**
   * Validate that reservation blob exists before generating SAS token
   * SECURITY: Prevents SAS token generation for non-existent reservations
   */
  private async validateReservationExists(
    accountName: string,
    accountKey: string,
    connectionString: string,
    containerName: string,
    blobName: string
  ): Promise<void> {
    try {
      this.logger.debug('🔍 Validating reservation exists', { blobName });

      const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);
      const serviceUrl = this.extractBlobEndpointFromConnectionString(connectionString);
      const blobServiceClient = new BlobServiceClient(serviceUrl, sharedKeyCredential);
      const containerClient = blobServiceClient.getContainerClient(containerName);
      const blobClient = containerClient.getBlobClient(blobName);

      const exists = await blobClient.exists();

      if (!exists) {
        this.logger.warn('🚫 Reservation not found', { blobName });
        throw new NotFoundException(`Reservation not found or has been archived`);
      }

      this.logger.debug('✅ Reservation exists', { blobName });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error('❌ Failed to validate reservation existence', {
        error: error instanceof Error ? error.message : 'Unknown error',
        blobName,
      });

      throw new InternalServerErrorException('Failed to validate reservation');
    }
  }

  /**
   * Extract blob endpoint from connection string
   */
  private extractBlobEndpointFromConnectionString(connectionString: string): string {
    try {
      const blobEndpointMatch = connectionString.match(/BlobEndpoint=([^;]+)/);
      if (blobEndpointMatch && blobEndpointMatch[1]) {
        return blobEndpointMatch[1];
      }

      // Fallback for development
      return 'http://127.0.0.1:10000/devstoreaccount1';
    } catch (error) {
      this.logger.warn('⚠️ Failed to extract blob endpoint from connection string', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      return 'http://127.0.0.1:10000/devstoreaccount1';
    }
  }

  /**
   * Validate SAS token (for testing purposes)
   */
  async validateSasToken(serviceUrl: string, sasToken: string, containerName: string): Promise<boolean> {
    try {
      const blobServiceClient = new BlobServiceClient(`${serviceUrl}?${sasToken}`);
      const containerClient = blobServiceClient.getContainerClient(containerName);

      // Try to get container properties to validate token
      await containerClient.getProperties();

      this.logger.log('✅ SAS token validation successful', {
        containerName: containerName,
      });

      return true;
    } catch (error) {
      this.logger.warn('⚠️ SAS token validation failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        containerName: containerName,
      });

      return false;
    }
  }
}
