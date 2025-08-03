/**
 * BlobStorageService - Azure Blob Storage integration for Tourist Tax Application
 *
 * RESPONSIBILITY: Handle Azure Storage Emulator operations for reservation data
 * ARCHITECTURE: Direct blob access with proper error handling and caching
 */

/**
 * Azure Storage Blob Service using jsDelivr CDN
 *
 * This service uses the official Azure Storage SDK loaded from jsDelivr CDN
 * for browser-compatible Azure Storage operations.
 */

// Global Azure Storage SDK from jsDelivr CDN
declare global {
  interface Window {
    Azure: {
      Storage: {
        Blob: {
          BlobServiceClient: any;
        };
      };
    };
  }
}

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
      // Wait for Azure Storage SDK to be available from jsDelivr CDN
      if (typeof window !== 'undefined' && window.Azure?.Storage?.Blob?.BlobServiceClient) {
        this.blobServiceClient = window.Azure.Storage.Blob.BlobServiceClient.fromConnectionString(config.connectionString);
        this.containerClient = this.blobServiceClient.getContainerClient(config.containerName);

        logger.info('🗄️ BlobStorageService initialized with jsDelivr CDN SDK', {
          accountName: config.accountName,
          containerName: config.containerName,
          endpoint: 'Azure Storage Emulator'
        });

        // Initialize container
        this.initializeContainer();
      } else {
        throw new Error('Azure Storage SDK not available from jsDelivr CDN. Make sure the script is loaded.');
      }
    } catch (error) {
      logger.error('❌ Failed to initialize BlobStorageService', { error, config });
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

      // Download blob content
      const downloadResponse = await blobClient.download();
      const content = await this.streamToString(downloadResponse.readableStreamBody!);

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
      const storageData = this.getStorageData();

      // Extract reservation IDs from blob names
      Object.keys(storageData).forEach(blobName => {
        const match = blobName.match(/reservations\/(.+)\.json$/);
        if (match && match[1]) {
          reservationIds.push(match[1]);
        }
      });

      logger.info('✅ Listed reservations from development storage', {
        count: reservationIds.length
      });

      return reservationIds;
    } catch (error) {
      logger.error('❌ Failed to list reservations', { error });
      return [];
    }
  }

  /**
   * Delete reservation from development storage
   */
  async deleteReservation(reservationId: string): Promise<boolean> {
    try {
      const blobName = `reservations/${reservationId}.json`;
      const storageData = this.getStorageData();

      // Delete the reservation if it exists
      if (storageData[blobName]) {
        delete storageData[blobName];
        localStorage.setItem(this.storageKey, JSON.stringify(storageData));
      }

      logger.info('✅ Reservation deleted from development storage', {
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
      const storageData = this.getStorageData();
      const blobCount = Object.keys(storageData).length;

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
