/**
 * BlobStorageService - Azure Blob Storage integration for Tourist Tax Application
 *
 * RESPONSIBILITY: Handle Azure Storage Emulator operations for reservation data
 * ARCHITECTURE: Direct blob access with proper error handling and caching
 */

// Using Azure Storage SDK from CDN (available as global AzureStorageBlob)
declare global {
  interface Window {
    AzureStorageBlob: any;
  }
}

import { logger } from '../CentralizedLogger';
import { STORAGE_KEYS } from '../../constants';

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
 * BlobStorageService - Browser-compatible mock Azure Storage
 *
 * Note: This is a browser-compatible implementation that simulates Azure Storage
 * using localStorage. In production, this would be replaced with actual Azure SDK
 * calls from a server-side API.
 */
export class BlobStorageService {
  private config: BlobStorageConfig;
  private storageKey: string;

  constructor(config: BlobStorageConfig) {
    this.config = config;
    this.storageKey = `azure-storage-mock:${config.containerName}`;

    try {
      logger.info('🗄️ BlobStorageService initialized (Browser Mock)', {
        accountName: config.accountName,
        containerName: config.containerName,
        endpoint: 'Browser localStorage mock'
      });

      // Initialize container (ensure storage structure exists)
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
   * Store reservation data in localStorage (mock blob storage)
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

      logger.info('✅ Reservation stored in mock blob storage', {
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
   * Retrieve reservation data from localStorage (mock blob storage)
   */
  async getReservation(reservationId: string): Promise<ReservationData | null> {
    try {
      const blobName = `reservations/${reservationId}.json`;
      const storageData = this.getStorageData();

      // Check if blob exists
      if (!storageData[blobName]) {
        logger.warn('⚠️ Reservation not found in mock blob storage', {
          reservationId,
          blobName
        });
        return null;
      }

      const blobData = storageData[blobName];
      const reservationData: ReservationData = blobData.data;

      logger.info('✅ Reservation retrieved from mock blob storage', {
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
   * List all reservations in the container (mock)
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

      logger.info('✅ Listed reservations from mock blob storage', {
        count: reservationIds.length
      });

      return reservationIds;
    } catch (error) {
      logger.error('❌ Failed to list reservations', { error });
      return [];
    }
  }

  /**
   * Delete reservation from localStorage (mock blob storage)
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

      logger.info('✅ Reservation deleted from mock blob storage', {
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
      for await (const blob of this.containerClient.listBlobsFlat()) {
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
  connectionString: import.meta.env.VITE_AZURE_STORAGE_CONNECTION_STRING || '',
  containerName: import.meta.env.VITE_CONTAINER_NAME || 'reservations',
  accountName: import.meta.env.VITE_STORAGE_ACCOUNT_NAME || 'devstoreaccount1'
};

export const blobStorageService = new BlobStorageService(blobStorageConfig);
