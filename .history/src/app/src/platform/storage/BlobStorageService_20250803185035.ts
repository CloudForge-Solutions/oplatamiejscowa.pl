/**
 * BlobStorageService - Azure Blob Storage integration for Tourist Tax Application
 *
 * RESPONSIBILITY: Handle Azure Storage Emulator operations for reservation data
 * ARCHITECTURE: Direct blob access with proper error handling and caching
 */

/**
 * Azure Storage Blob Service using npm package
 *
 * This service uses the official Azure Storage SDK installed via npm
 * for browser-compatible Azure Storage operations.
 */


import { BlobServiceClient } from '@azure/storage-blob';
import { logger } from '../CentralizedLogger';

export interface ReservationData {
  id: string;
  guestName: string;
  guestEmail: string;
  accommodationName: string;
  accommodationAddress: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  numberOfNights: number;
  taxAmountPerNight: number;
  totalTaxAmount: number;
  currency: string;
  status: 'pending' | 'paid' | 'failed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  paymentId?: string;
  paymentUrl?: string;
}

export interface BlobStorageConfig {
  connectionString: string;
  containerName: string;
  accountName: string;
}

/**
 * BlobStorageService - Azure Storage integration using jsDelivr CDN
 */
export class BlobStorageService {
  private blobServiceClient: any;
  private containerClient: any;
  private config: BlobStorageConfig;

  constructor(config: BlobStorageConfig) {
    this.config = config;

    try {
      // For browser environments, construct the service URL directly
      // Connection string format: DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=...;BlobEndpoint=http://127.0.0.1:10000/devstoreaccount1;
      const serviceUrl = this.extractBlobEndpointFromConnectionString(config.connectionString);

      // Initialize Azure Storage SDK for browser with service URL
      this.blobServiceClient = new BlobServiceClient(serviceUrl);
      this.containerClient = this.blobServiceClient.getContainerClient(config.containerName);

      logger.info('🗄️ BlobStorageService initialized for browser environment', {
        accountName: config.accountName,
        containerName: config.containerName,
        serviceUrl: serviceUrl,
        endpoint: 'Azure Storage Emulator'
      });

      // Initialize container
      this.initializeContainer();
    } catch (error) {
      logger.error('❌ Failed to initialize BlobStorageService', { error, config });
      throw error;
    }
  }

  /**
   * Extract blob endpoint URL from connection string for browser compatibility
   */
  private extractBlobEndpointFromConnectionString(connectionString: string): string {
    try {
      // Parse connection string to extract BlobEndpoint
      const parts = connectionString.split(';');
      for (const part of parts) {
        if (part.startsWith('BlobEndpoint=')) {
          return part.substring('BlobEndpoint='.length);
        }
      }

      // Fallback: construct from AccountName if BlobEndpoint not found
      const accountNameMatch = connectionString.match(/AccountName=([^;]+)/);
      if (accountNameMatch) {
        const accountName = accountNameMatch[1];
        if (accountName === 'devstoreaccount1') {
          // Azure Storage Emulator default endpoint
          return 'http://127.0.0.1:10000/devstoreaccount1';
        } else {
          // Production Azure Storage endpoint
          return `https://${accountName}.blob.core.windows.net`;
        }
      }

      throw new Error('Could not extract blob endpoint from connection string');
    } catch (error) {
      logger.error('❌ Failed to parse connection string', { error, connectionString });
      throw error;
    }
  }

  /**
   * Initialize container if it doesn't exist
   */
  private async initializeContainer(): Promise<void> {
    try {
      await this.containerClient.createIfNotExists({
        access: 'blob'
      });

      logger.info('✅ Container initialized', {
        containerName: this.config.containerName
      });
    } catch (error) {
      logger.error('❌ Failed to initialize container', {
        error,
        containerName: this.config.containerName
      });
    }
  }

  /**
   * Store reservation data in blob storage
   */
  async storeReservation(reservationData: ReservationData): Promise<boolean> {
    try {
      const blobName = `reservations/${reservationData.id}.json`;
      const blobClient = this.containerClient.getBlobClient(blobName);
      const blockBlobClient = blobClient.getBlockBlobClient();

      const jsonData = JSON.stringify(reservationData, null, 2);

      await blockBlobClient.upload(jsonData, jsonData.length, {
        blobHTTPHeaders: {
          blobContentType: 'application/json'
        },
        metadata: {
          reservationId: reservationData.id,
          guestName: reservationData.guestName,
          status: reservationData.status,
          createdAt: reservationData.createdAt
        }
      });

      logger.info('✅ Reservation stored in blob storage', {
        reservationId: reservationData.id,
        blobName,
        size: jsonData.length
      });

      return true;
    } catch (error) {
      logger.error('❌ Failed to store reservation', {
        error,
        reservationId: reservationData.id
      });
      return false;
    }
  }

  /**
   * Retrieve reservation data from blob storage
   */
  async getReservation(reservationId: string): Promise<ReservationData | null> {
    try {
      const blobName = `reservations/${reservationId}.json`;
      const blobClient = this.containerClient.getBlobClient(blobName);

      // Check if blob exists
      const exists = await blobClient.exists();
      if (!exists) {
        logger.warn('⚠️ Reservation not found in blob storage', {
          reservationId,
          blobName
        });
        return null;
      }

      // Download blob content (browser-compatible approach)
      const downloadResponse = await blobClient.download();
      const blobBody = await downloadResponse.blobBody;
      const content = await blobBody!.text();

      const reservationData: ReservationData = JSON.parse(content);

      logger.info('✅ Reservation retrieved from blob storage', {
        reservationId,
        blobName,
        status: reservationData.status
      });

      return reservationData;
    } catch (error) {
      logger.error('❌ Failed to retrieve reservation', {
        error,
        reservationId
      });
      return null;
    }
  }

  /**
   * List all reservations in the container
   */
  async listReservations(): Promise<string[]> {
    try {
      const reservationIds: string[] = [];

      for await (const blob of this.containerClient.listBlobsFlat({
        prefix: 'reservations/'
      })) {
        // Extract reservation ID from blob name (reservations/{id}.json)
        const match = blob.name.match(/reservations\/(.+)\.json$/);
        if (match) {
          reservationIds.push(match[1]);
        }
      }

      logger.info('✅ Listed reservations from blob storage', {
        count: reservationIds.length
      });

      return reservationIds;
    } catch (error) {
      logger.error('❌ Failed to list reservations', { error });
      return [];
    }
  }

  /**
   * Delete reservation from blob storage
   */
  async deleteReservation(reservationId: string): Promise<boolean> {
    try {
      const blobName = `reservations/${reservationId}.json`;
      const blobClient = this.containerClient.getBlobClient(blobName);

      await blobClient.deleteIfExists();

      logger.info('✅ Reservation deleted from blob storage', {
        reservationId,
        blobName
      });

      return true;
    } catch (error) {
      logger.error('❌ Failed to delete reservation', {
        error,
        reservationId
      });
      return false;
    }
  }

  /**
   * Get storage statistics
   */
  async getStorageStats(): Promise<{ containerExists: boolean; blobCount: number }> {
    try {
      const containerExists = await this.containerClient.exists();

      if (!containerExists) {
        return { containerExists: false, blobCount: 0 };
      }

      let blobCount = 0;
      for await (const _blob of this.containerClient.listBlobsFlat()) {
        blobCount++;
      }

      return { containerExists: true, blobCount };
    } catch (error) {
      logger.error('❌ Failed to get storage stats', { error });
      return { containerExists: false, blobCount: 0 };
    }
  }
}

// Create singleton instance for the application
const blobStorageConfig: BlobStorageConfig = {
  connectionString: import.meta.env['VITE_AZURE_STORAGE_CONNECTION_STRING'] || '',
  containerName: import.meta.env['VITE_CONTAINER_NAME'] || 'reservations',
  accountName: import.meta.env['VITE_STORAGE_ACCOUNT_NAME'] || 'devstoreaccount1'
};

export const blobStorageService = new BlobStorageService(blobStorageConfig);
