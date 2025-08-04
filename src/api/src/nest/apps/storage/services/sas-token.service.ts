/**
 * SAS Token Service (NestJS)
 *
 * RESPONSIBILITY: Generate secure SAS tokens for Azure Blob Storage
 * ARCHITECTURE: NestJS service with dependency injection and configuration
 */

import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  generateAccountSASQueryParameters,
  AccountSASPermissions,
  AccountSASServices,
  AccountSASResourceTypes,
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
   * Generate SAS Token for Blob Storage Access
   */
  async generateSasToken(dto: GenerateSasTokenDto): Promise<SasTokenResponseDto> {
    try {
      this.logger.log('🔐 Generating SAS token', {
        containerName: dto.containerName,
        permissions: dto.permissions,
        expiryHours: dto.expiryHours,
        reservationId: dto.reservationId,
      });

      // Get configuration values
      const accountName = this.configService.get<string>('storage.accountName');
      const accountKey = this.configService.get<string>('storage.accountKey');
      const connectionString = this.configService.get<string>('storage.connectionString');
      const defaultContainer = this.configService.get<string>('storage.containerName');
      const defaultExpiryHours = this.configService.get<number>('sas.expiryHours');
      const defaultPermissions = this.configService.get<string>('sas.defaultPermissions');

      if (!accountName || !accountKey) {
        this.logger.error('❌ Missing Azure Storage credentials', {
          hasAccountName: !!accountName,
          hasAccountKey: !!accountKey,
          hasConnectionString: !!connectionString,
        });

        throw new InternalServerErrorException('Azure Storage credentials not configured');
      }

      // Use provided values or defaults
      const containerName = dto.containerName || defaultContainer;
      const permissions = dto.permissions || defaultPermissions;
      const expiryHours = dto.expiryHours || defaultExpiryHours;

      // Create shared key credential
      const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);

      // Set expiry time
      const expiresOn = new Date();
      expiresOn.setHours(expiresOn.getHours() + (expiryHours || 24));

      // Configure SAS permissions
      const sasPermissions = new AccountSASPermissions();
      const permStr = permissions || 'rw';
      if (permStr.includes('r')) sasPermissions.read = true;
      if (permStr.includes('w')) sasPermissions.write = true;
      if (permStr.includes('d')) sasPermissions.delete = true;
      if (permStr.includes('l')) sasPermissions.list = true;

      // Generate SAS token
      const sasToken = generateAccountSASQueryParameters(
        {
          services: 'b', // Blob service only
          resourceTypes: 'sco', // Service, Container, Object
          permissions: sasPermissions,
          startsOn: new Date(),
          expiresOn: expiresOn,
        },
        sharedKeyCredential,
      ).toString();

      // Extract service URL from connection string
      const serviceUrl = this.extractBlobEndpointFromConnectionString(connectionString || '');

      this.logger.log('✅ SAS token generated successfully', {
        expiresAt: expiresOn.toISOString(),
        permissions: permissions,
        containerName: containerName,
      });

      return new SasTokenResponseDto({
        success: true,
        sasToken: sasToken,
        serviceUrl: serviceUrl,
        expiresAt: expiresOn.toISOString(),
      });
    } catch (error) {
      this.logger.error('❌ Failed to generate SAS token', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        dto: dto,
      });

      if (error instanceof InternalServerErrorException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to generate SAS token');
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
