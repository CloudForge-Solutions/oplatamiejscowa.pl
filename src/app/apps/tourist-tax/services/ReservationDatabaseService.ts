/**
 * ReservationDatabaseService - IndexedDB storage for tourist tax reservations
 * Follows mVAT architecture patterns for database management
 */

import { BookingReservation } from '../types/BookingTypes';

// Database configuration
export interface ReservationDBConfig {
  dbName: string;
  version: number;
  stores: {
    reservations: string;
    metadata: string;
  };
}

export interface ReservationStoreConfig {
  keyPath: string;
  autoIncrement: boolean;
  indexes: Array<{
    name: string;
    keyPath: string;
    options?: IDBIndexParameters;
  }>;
}

// Logger for consistency with mVAT patterns
const logger = {
  info: (message: string, data?: any) => console.log(`[ReservationDB] ${message}`, data || ''),
  error: (message: string, error?: any) => console.error(`[ReservationDB] ${message}`, error || ''),
  debug: (message: string, data?: any) => import.meta.env.DEV && console.debug(`[ReservationDB] ${message}`, data || '')
};

/**
 * ReservationDatabaseService - Manages IndexedDB operations for reservations
 * Following mVAT patterns for database management
 */
export class ReservationDatabaseService {
  private dbName: string;
  private version: number;
  private db: IDBDatabase | null;
  private isInitialized: boolean;
  private stores: ReservationDBConfig['stores'];

  // Store configuration following mVAT patterns
  private readonly storeConfig: Record<string, ReservationStoreConfig> = {
    reservations: {
      keyPath: 'id',
      autoIncrement: false,
      indexes: [
        { name: 'guestName', keyPath: 'guestName', options: { unique: false } },
        { name: 'status', keyPath: 'status', options: { unique: false } },
        { name: 'checkInDate', keyPath: 'checkInDate', options: { unique: false } },
        { name: 'checkOutDate', keyPath: 'checkOutDate', options: { unique: false } },
        { name: 'guestCountry', keyPath: 'guestCountry', options: { unique: false } },
        { name: 'taxStatus', keyPath: 'taxStatus', options: { unique: false } },
        { name: 'reservationNumber', keyPath: 'reservationNumber', options: { unique: false } },
        { name: 'createdAt', keyPath: 'createdAt', options: { unique: false } },
        { name: 'updatedAt', keyPath: 'updatedAt', options: { unique: false } }
      ]
    },
    metadata: {
      keyPath: 'key',
      autoIncrement: false,
      indexes: []
    }
  };

  constructor(config?: Partial<ReservationDBConfig>) {
    this.dbName = config?.dbName || 'TouristTaxReservationsDB';
    this.version = config?.version || 1;
    this.db = null;
    this.isInitialized = false;

    this.stores = {
      reservations: 'reservations',
      metadata: 'metadata'
    };

    logger.info('📊 ReservationDatabaseService constructed', {
      dbName: this.dbName,
      version: this.version
    });
  }

  /**
   * Initialize the database
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      this.db = await this.openDatabase();
      this.isInitialized = true;
      logger.info('✅ ReservationDatabaseService initialized successfully');
    } catch (error) {
      logger.error('❌ Failed to initialize ReservationDatabaseService', error);
      throw error;
    }
  }

  /**
   * Open IndexedDB database with proper schema
   */
  private openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        reject(new Error(`Failed to open database: ${request.error?.message}`));
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        this.createStores(db);
      };
    });
  }

  /**
   * Create object stores with proper indexes
   */
  private createStores(db: IDBDatabase): void {
    // Create reservations store
    if (!db.objectStoreNames.contains(this.stores.reservations)) {
      const reservationsStore = db.createObjectStore(this.stores.reservations, {
        keyPath: this.storeConfig.reservations.keyPath,
        autoIncrement: this.storeConfig.reservations.autoIncrement
      });

      // Create indexes for reservations
      this.storeConfig.reservations.indexes.forEach(({ name, keyPath, options }) => {
        reservationsStore.createIndex(name, keyPath, options);
      });

      logger.info('📦 Created reservations store with indexes');
    }

    // Create metadata store
    if (!db.objectStoreNames.contains(this.stores.metadata)) {
      const metadataStore = db.createObjectStore(this.stores.metadata, {
        keyPath: this.storeConfig.metadata.keyPath,
        autoIncrement: this.storeConfig.metadata.autoIncrement
      });

      logger.info('📦 Created metadata store');
    }
  }

  /**
   * Ensure database is initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }

  /**
   * Add timestamps to reservation data
   */
  private addTimestamps(reservation: BookingReservation, isUpdate: boolean = false): BookingReservation {
    const now = new Date().toISOString();

    return {
      ...reservation,
      createdAt: reservation.createdAt || now,
      updatedAt: now
    };
  }

  /**
   * Save reservation to database
   */
  async saveReservation(reservation: BookingReservation): Promise<void> {
    await this.ensureInitialized();

    const reservationWithTimestamps = this.addTimestamps(reservation);

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.stores.reservations], 'readwrite');
      const store = transaction.objectStore(this.stores.reservations);
      const request = store.put(reservationWithTimestamps);

      request.onsuccess = () => {
        logger.debug('📦 Reservation saved', { id: reservation.id });
        resolve();
      };

      request.onerror = () => {
        const error = new Error(`Failed to save reservation: ${request.error?.message}`);
        logger.error('❌ Save operation failed', error);
        reject(error);
      };
    });
  }

  /**
   * Save multiple reservations in a single transaction
   */
  async saveReservations(reservations: BookingReservation[]): Promise<void> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.stores.reservations], 'readwrite');
      const store = transaction.objectStore(this.stores.reservations);

      let completed = 0;
      const total = reservations.length;

      if (total === 0) {
        resolve();
        return;
      }

      reservations.forEach(reservation => {
        const reservationWithTimestamps = this.addTimestamps(reservation);
        const request = store.put(reservationWithTimestamps);

        request.onsuccess = () => {
          completed++;
          if (completed === total) {
            logger.info('📦 Bulk save completed', { count: total });
            resolve();
          }
        };

        request.onerror = () => {
          const error = new Error(`Failed to save reservation ${reservation.id}: ${request.error?.message}`);
          logger.error('❌ Bulk save failed', error);
          reject(error);
        };
      });
    });
  }

  /**
   * Get reservation by ID
   */
  async getReservation(id: string): Promise<BookingReservation | null> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.stores.reservations], 'readonly');
      const store = transaction.objectStore(this.stores.reservations);
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        const error = new Error(`Failed to get reservation: ${request.error?.message}`);
        logger.error('❌ Get operation failed', error);
        reject(error);
      };
    });
  }

  /**
   * Get all reservations
   */
  async getAllReservations(): Promise<BookingReservation[]> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.stores.reservations], 'readonly');
      const store = transaction.objectStore(this.stores.reservations);
      const request = store.getAll();

      request.onsuccess = () => {
        logger.debug('📦 Retrieved all reservations', { count: request.result.length });
        resolve(request.result);
      };

      request.onerror = () => {
        const error = new Error(`Failed to get reservations: ${request.error?.message}`);
        logger.error('❌ GetAll operation failed', error);
        reject(error);
      };
    });
  }

  /**
   * Update reservation
   */
  async updateReservation(id: string, updates: Partial<BookingReservation>): Promise<void> {
    await this.ensureInitialized();

    const existing = await this.getReservation(id);
    if (!existing) {
      throw new Error(`Reservation with id ${id} not found`);
    }

    const updated = this.addTimestamps({ ...existing, ...updates }, true);
    await this.saveReservation(updated);
  }

  /**
   * Delete reservation
   */
  async deleteReservation(id: string): Promise<void> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.stores.reservations], 'readwrite');
      const store = transaction.objectStore(this.stores.reservations);
      const request = store.delete(id);

      request.onsuccess = () => {
        logger.debug('📦 Reservation deleted', { id });
        resolve();
      };

      request.onerror = () => {
        const error = new Error(`Failed to delete reservation: ${request.error?.message}`);
        logger.error('❌ Delete operation failed', error);
        reject(error);
      };
    });
  }

  /**
   * Get reservations by status
   */
  async getReservationsByStatus(status: BookingReservation['status']): Promise<BookingReservation[]> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.stores.reservations], 'readonly');
      const store = transaction.objectStore(this.stores.reservations);
      const index = store.index('status');
      const request = index.getAll(status);

      request.onsuccess = () => {
        logger.debug('📦 Retrieved reservations by status', { status, count: request.result.length });
        resolve(request.result);
      };

      request.onerror = () => {
        const error = new Error(`Failed to get reservations by status: ${request.error?.message}`);
        logger.error('❌ GetByStatus operation failed', error);
        reject(error);
      };
    });
  }

  /**
   * Get reservations by date range
   */
  async getReservationsByDateRange(startDate: string, endDate: string): Promise<BookingReservation[]> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.stores.reservations], 'readonly');
      const store = transaction.objectStore(this.stores.reservations);
      const index = store.index('checkInDate');
      const range = IDBKeyRange.bound(startDate, endDate);
      const request = index.getAll(range);

      request.onsuccess = () => {
        logger.debug('📦 Retrieved reservations by date range', {
          startDate,
          endDate,
          count: request.result.length
        });
        resolve(request.result);
      };

      request.onerror = () => {
        const error = new Error(`Failed to get reservations by date range: ${request.error?.message}`);
        logger.error('❌ GetByDateRange operation failed', error);
        reject(error);
      };
    });
  }

  /**
   * Count total reservations
   */
  async countReservations(): Promise<number> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.stores.reservations], 'readonly');
      const store = transaction.objectStore(this.stores.reservations);
      const request = store.count();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        const error = new Error(`Failed to count reservations: ${request.error?.message}`);
        logger.error('❌ Count operation failed', error);
        reject(error);
      };
    });
  }

  /**
   * Clear all reservations (for testing/reset)
   */
  async clearAllReservations(): Promise<void> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.stores.reservations], 'readwrite');
      const store = transaction.objectStore(this.stores.reservations);
      const request = store.clear();

      request.onsuccess = () => {
        logger.info('📦 All reservations cleared');
        resolve();
      };

      request.onerror = () => {
        const error = new Error(`Failed to clear reservations: ${request.error?.message}`);
        logger.error('❌ Clear operation failed', error);
        reject(error);
      };
    });
  }
}

// Export singleton instance
export const reservationDB = new ReservationDatabaseService();
