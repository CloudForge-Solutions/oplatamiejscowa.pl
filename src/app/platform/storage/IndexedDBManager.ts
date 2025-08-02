/**
 * IndexedDBManager - Handles IndexedDB operations for tourist tax transactions
 * Follows single responsibility principle - only manages IndexedDB operations
 */

export interface DBTransaction {
  id: string;
  transactionId: string;
  touristEmail: string;
  cityCode: string;
  cityName: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfNights: number;
  numberOfPersons: number;
  taxRatePerNight: number;
  totalAmount: number;
  paymentStatus: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  paymentProvider: 'imoje';
  providerTransactionId?: string;
  createdAt: string;
  updatedAt: string;
  gdprConsents: Array<{
    type: string;
    given: boolean;
    timestamp: string;
  }>;
}

export interface DBConfig {
  dbName: string;
  version: number;
  stores: {
    transactions: string;
    preferences: string;
    consents: string;
  };
}

export class IndexedDBManager {
  private db: IDBDatabase | null = null;
  private readonly config: DBConfig;

  constructor(config: DBConfig) {
    this.config = config;
  }

  /**
   * Initialize IndexedDB connection
   */
  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.config.dbName, this.config.version);

      request.onerror = () => {
        reject(new Error(`Failed to open IndexedDB: ${request.error?.message}`));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = event => {
        const db = (event.target as IDBOpenDBRequest).result;
        this.createObjectStores(db);
      };
    });
  }

  /**
   * Create object stores during database upgrade
   */
  private createObjectStores(db: IDBDatabase): void {
    // Transactions store
    if (!db.objectStoreNames.contains(this.config.stores.transactions)) {
      const transactionStore = db.createObjectStore(this.config.stores.transactions, {
        keyPath: 'id'
      });

      // Create indexes for efficient querying
      transactionStore.createIndex('transactionId', 'transactionId', { unique: true });
      transactionStore.createIndex('touristEmail', 'touristEmail', { unique: false });
      transactionStore.createIndex('paymentStatus', 'paymentStatus', { unique: false });
      transactionStore.createIndex('createdAt', 'createdAt', { unique: false });
      transactionStore.createIndex('cityCode', 'cityCode', { unique: false });
    }

    // Preferences store
    if (!db.objectStoreNames.contains(this.config.stores.preferences)) {
      db.createObjectStore(this.config.stores.preferences, {
        keyPath: 'key'
      });
    }

    // GDPR Consents store
    if (!db.objectStoreNames.contains(this.config.stores.consents)) {
      const consentStore = db.createObjectStore(this.config.stores.consents, {
        keyPath: 'id'
      });
      consentStore.createIndex('transactionId', 'transactionId', { unique: false });
      consentStore.createIndex('timestamp', 'timestamp', { unique: false });
    }
  }

  /**
   * Store a transaction
   */
  async storeTransaction(transaction: DBTransaction): Promise<void> {
    if (!this.db) {
      throw new Error('IndexedDB not initialized');
    }

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction([this.config.stores.transactions], 'readwrite');
      const store = tx.objectStore(this.config.stores.transactions);

      const request = store.put(transaction);

      request.onsuccess = () => resolve();
      request.onerror = () =>
        reject(new Error(`Failed to store transaction: ${request.error?.message}`));
    });
  }

  /**
   * Get transaction by ID
   */
  async getTransaction(id: string): Promise<DBTransaction | null> {
    if (!this.db) {
      throw new Error('IndexedDB not initialized');
    }

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction([this.config.stores.transactions], 'readonly');
      const store = tx.objectStore(this.config.stores.transactions);

      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () =>
        reject(new Error(`Failed to get transaction: ${request.error?.message}`));
    });
  }

  /**
   * Get transaction by transaction ID
   */
  async getTransactionByTransactionId(transactionId: string): Promise<DBTransaction | null> {
    if (!this.db) {
      throw new Error('IndexedDB not initialized');
    }

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction([this.config.stores.transactions], 'readonly');
      const store = tx.objectStore(this.config.stores.transactions);
      const index = store.index('transactionId');

      const request = index.get(transactionId);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () =>
        reject(new Error(`Failed to get transaction: ${request.error?.message}`));
    });
  }

  /**
   * Get all transactions for a user (by email)
   */
  async getTransactionsByEmail(email: string, limit = 50): Promise<DBTransaction[]> {
    if (!this.db) {
      throw new Error('IndexedDB not initialized');
    }

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction([this.config.stores.transactions], 'readonly');
      const store = tx.objectStore(this.config.stores.transactions);
      const index = store.index('touristEmail');

      const request = index.getAll(email, limit);

      request.onsuccess = () => {
        const results = request.result.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        resolve(results);
      };
      request.onerror = () =>
        reject(new Error(`Failed to get transactions: ${request.error?.message}`));
    });
  }

  /**
   * Get recent transactions (last N transactions)
   */
  async getRecentTransactions(limit = 20): Promise<DBTransaction[]> {
    if (!this.db) {
      throw new Error('IndexedDB not initialized');
    }

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction([this.config.stores.transactions], 'readonly');
      const store = tx.objectStore(this.config.stores.transactions);
      const index = store.index('createdAt');

      const request = index.openCursor(null, 'prev'); // Reverse order (newest first)
      const results: DBTransaction[] = [];

      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor && results.length < limit) {
          results.push(cursor.value);
          cursor.continue();
        } else {
          resolve(results);
        }
      };

      request.onerror = () =>
        reject(new Error(`Failed to get recent transactions: ${request.error?.message}`));
    });
  }

  /**
   * Update transaction status
   */
  async updateTransactionStatus(
    id: string,
    status: DBTransaction['paymentStatus'],
    providerTransactionId?: string
  ): Promise<void> {
    const transaction = await this.getTransaction(id);
    if (!transaction) {
      throw new Error(`Transaction not found: ${id}`);
    }

    transaction.paymentStatus = status;
    transaction.updatedAt = new Date().toISOString();

    if (providerTransactionId) {
      transaction.providerTransactionId = providerTransactionId;
    }

    await this.storeTransaction(transaction);
  }

  /**
   * Delete old transactions (GDPR compliance)
   */
  async deleteOldTransactions(olderThanDays: number): Promise<number> {
    if (!this.db) {
      throw new Error('IndexedDB not initialized');
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
    const cutoffTimestamp = cutoffDate.toISOString();

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction([this.config.stores.transactions], 'readwrite');
      const store = tx.objectStore(this.config.stores.transactions);
      const index = store.index('createdAt');

      const request = index.openCursor(IDBKeyRange.upperBound(cutoffTimestamp));
      let deletedCount = 0;

      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          cursor.delete();
          deletedCount++;
          cursor.continue();
        } else {
          resolve(deletedCount);
        }
      };

      request.onerror = () =>
        reject(new Error(`Failed to delete old transactions: ${request.error?.message}`));
    });
  }

  /**
   * Get database size estimation
   */
  async getDatabaseSize(): Promise<{ transactions: number; totalSize: number }> {
    if (!this.db) {
      throw new Error('IndexedDB not initialized');
    }

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction([this.config.stores.transactions], 'readonly');
      const store = tx.objectStore(this.config.stores.transactions);

      const request = store.count();

      request.onsuccess = () => {
        const transactionCount = request.result;
        // Rough estimation: each transaction ~1KB
        const estimatedSize = transactionCount * 1024;

        resolve({
          transactions: transactionCount,
          totalSize: estimatedSize
        });
      };

      request.onerror = () =>
        reject(new Error(`Failed to get database size: ${request.error?.message}`));
    });
  }

  /**
   * Close database connection
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  /**
   * Check if IndexedDB is supported
   */
  static isSupported(): boolean {
    return 'indexedDB' in window && indexedDB !== null;
  }
}
