/**
 * BlobStorageService - Azure Blob Storage integration for Tourist Tax Application
 *
 * RESPONSIBILITY: Handle Azure Storage Emulator operations for reservation data
 * ARCHITECTURE: Direct blob access with proper error handling and caching
 */

/**
 * Browser-compatible Azure Storage implementation
 *
 * This service provides Azure Storage-compatible API using localStorage for development.
 * In production, this would be replaced with server-side Azure Storage calls.
 */

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
 * BlobStorageService - Browser-compatible Azure Storage implementation
 *
 * This service provides Azure Storage-compatible operations using localStorage
 * for development. It maintains the same API as Azure Storage SDK.
 */
export class BlobStorageService {
  private config: BlobStorageConfig;
  private storageKey: string;

  constructor(config: BlobStorageConfig) {
    this.config = config;
    this.storageKey = `azure-storage-dev:${config.containerName}`;

    try {
      logger.info('🗄️ BlobStorageService initialized (Development Storage)', {
        accountName: config.accountName,
        containerName: config.containerName,
        endpoint: 'Development localStorage backend'
      });

      // Initialize container
      this.initializeContainer();
    } catch (error) {
      logger.error('❌ Failed to initialize BlobStorageService', { error, config });
      throw error;
    }
  }

  /**
   * Initialize container (ensure storage structure exists)
   */
  private initializeContainer(): void {
    try {
      // Ensure the storage structure exists in localStorage
      const existingData = localStorage.getItem(this.storageKey);
      if (!existingData) {
        localStorage.setItem(this.storageKey, JSON.stringify({}));
      }

      logger.info('✅ Container initialized', {
        containerName: this.config.containerName,
        storageKey: this.storageKey
      });
    } catch (error) {
      logger.error('❌ Failed to initialize container', {
        error,
        containerName: this.config.containerName
      });
    }
  }

  /**
   * Get storage data from localStorage
   */
  private getStorageData(): Record<string, any> {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      logger.error('❌ Failed to get storage data', { error });
      return {};
    }
  }

  /**
   * Store reservation data in development storage
   */
  async storeReservation(reservationData: ReservationData): Promise<boolean> {
    try {
      // Get existing storage data
      const storageData = this.getStorageData();

      // Store reservation
      const blobName = `reservations/${reservationData.id}.json`;
      storageData[blobName] = {
        data: reservationData,
        metadata: {
          reservationId: reservationData.id,
          guestName: reservationData.guestName,
          status: reservationData.status,
          createdAt: reservationData.createdAt,
          contentType: 'application/json',
          size: JSON.stringify(reservationData).length
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Save back to localStorage
      localStorage.setItem(this.storageKey, JSON.stringify(storageData));

      logger.info('✅ Reservation stored in development storage', {
        reservationId: reservationData.id,
        blobName,
        size: JSON.stringify(reservationData).length
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
   * Helper method to convert stream to string
   */
  private async streamToString(readableStream: NodeJS.ReadableStream): Promise<string> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      readableStream.on('data', (data) => {
        chunks.push(data instanceof Buffer ? data : Buffer.from(data));
      });
      readableStream.on('end', () => {
        resolve(Buffer.concat(chunks).toString());
      });
      readableStream.on('error', reject);
    });
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
