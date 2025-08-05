/**
 * Azure Storage Service
 *
 * RESPONSIBILITY: Handle Azure Storage operations (Blob, Table, Queue)
 * ARCHITECTURE: Service for persistent storage using Azure Storage emulator
 */

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';
import { TableClient, TableEntity } from '@azure/data-tables';
import { QueueServiceClient, QueueClient } from '@azure/storage-queue';
import { Reservation, Payment } from '../entities/reservation.entity';

// Table entities
export interface ReservationEntity extends TableEntity {
  partitionKey: string; // Use 'reservations'
  rowKey: string; // Use reservation ID
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
  status: string;
  paymentId?: string;
  paymentUrl?: string;
  cityName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentEntity extends TableEntity {
  partitionKey: string; // Use 'payments'
  rowKey: string; // Use payment ID
  reservationId: string;
  status: string;
  amount: number;
  currency: string;
  paymentUrl: string;
  expiresAt: string;
  transactionId?: string;
  receiptUrl?: string;
  failureReason?: string;
  providerPaymentId?: string;
  webhookData?: string; // JSON string
  createdAt: string;
  updatedAt: string;
}

// Queue message types
export interface PaymentStatusMessage {
  type: 'payment-status-changed';
  paymentId: string;
  reservationId: string;
  oldStatus: string;
  newStatus: string;
  timestamp: string;
}

export interface ReservationCreatedMessage {
  type: 'reservation-created';
  reservationId: string;
  guestEmail: string;
  totalAmount: number;
  currency: string;
  timestamp: string;
}

@Injectable()
export class AzureStorageService implements OnModuleInit {
  private readonly logger = new Logger(AzureStorageService.name);

  private readonly blobServiceClient: BlobServiceClient;
  private readonly reservationsContainerClient: ContainerClient;
  private readonly reservationsTableClient: TableClient;
  private readonly paymentsTableClient: TableClient;
  private readonly queueServiceClient: QueueServiceClient;
  private readonly eventsQueueClient: QueueClient;

  private readonly containerName = 'payment-documents';
  private readonly reservationsContainerName = 'reservations';
  private readonly reservationsTableName = 'reservations';
  private readonly paymentsTableName = 'payments';
  private readonly eventsQueueName = 'payment-events';

  constructor(private readonly configService: ConfigService) {
    const connectionString = this.configService.get<string>('AZURE_STORAGE_CONNECTION_STRING');

    if (!connectionString) {
      this.logger.error('Azure Storage connection string is not configured');
      throw new Error('Azure Storage connection string is not configured');
    }

    try {
      this.logger.debug('Initializing Azure Storage with connection string', {
        connectionStringLength: connectionString.length,
        hasDevstoreAccount: connectionString.includes('devstoreaccount1'),
      });

      // Initialize Blob Storage
      this.blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
      this.reservationsContainerClient = this.blobServiceClient.getContainerClient(this.reservationsContainerName);

      // Initialize Table Storage with proper error handling
      try {
        // Configure options for development with Azurite
        const tableClientOptions = {
          allowInsecureConnection: connectionString.includes('127.0.0.1') || connectionString.includes('localhost')
        };

        this.reservationsTableClient = TableClient.fromConnectionString(
          connectionString,
          this.reservationsTableName,
          tableClientOptions
        );
        this.paymentsTableClient = TableClient.fromConnectionString(
          connectionString,
          this.paymentsTableName,
          tableClientOptions
        );
      } catch (tableError) {
        this.logger.error('Failed to initialize Table Storage clients', {
          error: tableError.message,
          connectionString: connectionString.substring(0, 50) + '...'
        });
        throw tableError;
      }

      // Initialize Queue Storage
      this.queueServiceClient = QueueServiceClient.fromConnectionString(connectionString);
      this.eventsQueueClient = this.queueServiceClient.getQueueClient(this.eventsQueueName);

      this.logger.log('Azure Storage service initialized successfully', {
        containerName: this.containerName,
        reservationsTable: this.reservationsTableName,
        paymentsTable: this.paymentsTableName,
        eventsQueue: this.eventsQueueName,
      });

      // Storage will be initialized in onModuleInit
    } catch (error) {
      this.logger.error('Failed to initialize Azure Storage service', {
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  /**
   * NestJS lifecycle hook - called after module initialization
   */
  async onModuleInit(): Promise<void> {
    this.logger.log('🚀 Initializing Azure Storage resources...');
    await this.initializeStorage();
  }

  /**
   * Initialize storage containers, tables, and queues
   */
  private async initializeStorage(): Promise<void> {
    try {
      this.logger.log('📦 Creating blob containers...');

      // Create blob containers if they don't exist
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      await containerClient.createIfNotExists({
        access: 'blob',
      });
      this.logger.log(`✅ Container '${this.containerName}' ready`);

      // Create reservations container for secure SAS token access
      await this.reservationsContainerClient.createIfNotExists({
        access: 'blob',
      });
      this.logger.log(`✅ Container '${this.reservationsContainerName}' ready`);

      this.logger.log('📋 Creating tables...');

      // Create tables if they don't exist
      await this.reservationsTableClient.createTable();
      this.logger.log(`✅ Table '${this.reservationsTableName}' ready`);

      await this.paymentsTableClient.createTable();
      this.logger.log(`✅ Table '${this.paymentsTableName}' ready`);

      this.logger.log('📬 Creating queues...');

      // Create queue if it doesn't exist
      await this.eventsQueueClient.createIfNotExists();
      this.logger.log(`✅ Queue '${this.eventsQueueName}' ready`);

      this.logger.log('🎉 Azure Storage initialized successfully - all resources ready!');
    } catch (error) {
      this.logger.error('❌ Failed to initialize Azure Storage', {
        error: error.message,
        stack: error.stack
      });
      // Don't throw here - let the service continue with warnings
    }
  }

  // Reservation Storage Operations

  /**
   * Save reservation to Blob Storage for secure SAS token access
   *
   * ARCHITECTURE: Saves reservation as JSON blob for direct frontend access via SAS tokens
   * SECURITY: Enables blob-specific SAS token generation and validation
   */
  async saveReservation(reservation: Reservation): Promise<void> {
    try {
      // Save to Blob Storage as JSON for secure SAS token access
      const blobName = `${reservation.id}.json`;
      const blobClient = this.reservationsContainerClient.getBlobClient(blobName);
      const blockBlobClient = blobClient.getBlockBlobClient();

      const jsonData = JSON.stringify(reservation, null, 2);

      await blockBlobClient.upload(jsonData, jsonData.length, {
        blobHTTPHeaders: {
          blobContentType: 'application/json',
          blobCacheControl: 'no-cache'
        },
        metadata: {
          reservationId: reservation.id,
          guestName: reservation.guestName,
          status: reservation.status,
          cityName: reservation.cityName || '',
          createdAt: reservation.createdAt,
          totalAmount: reservation.totalTaxAmount.toString()
        }
      });

      this.logger.log('✅ Reservation saved to Blob Storage for secure SAS access', {
        reservationId: reservation.id,
        blobName: blobName,
        status: reservation.status,
        totalAmount: reservation.totalTaxAmount,
        cityName: reservation.cityName
      });

      // Also save to Table Storage for querying and management
      const entity: ReservationEntity = {
        partitionKey: 'reservations',
        rowKey: reservation.id,
        guestName: reservation.guestName,
        guestEmail: reservation.guestEmail,
        accommodationName: reservation.accommodationName,
        accommodationAddress: reservation.accommodationAddress,
        checkInDate: reservation.checkInDate,
        checkOutDate: reservation.checkOutDate,
        numberOfGuests: reservation.numberOfGuests,
        numberOfNights: reservation.numberOfNights,
        taxAmountPerNight: reservation.taxAmountPerNight,
        totalTaxAmount: reservation.totalTaxAmount,
        currency: reservation.currency,
        status: reservation.status,
        paymentId: reservation.paymentId,
        paymentUrl: reservation.paymentUrl,
        cityName: reservation.cityName,
        createdAt: reservation.createdAt,
        updatedAt: reservation.updatedAt,
      };

      await this.reservationsTableClient.upsertEntity(entity);

      this.logger.debug('✅ Reservation also saved to Table Storage for management', {
        reservationId: reservation.id,
        status: reservation.status,
      });

      // Send event to queue
      await this.sendReservationCreatedEvent(reservation);
    } catch (error) {
      this.logger.error('❌ Failed to save reservation to Azure Storage', {
        error: error.message,
        reservationId: reservation.id,
      });
      throw error;
    }
  }

  /**
   * Get reservation from Table Storage
   */
  async getReservation(reservationId: string): Promise<Reservation | null> {
    try {
      const entity = await this.reservationsTableClient.getEntity<ReservationEntity>(
        'reservations',
        reservationId
      );

      const reservation: Reservation = {
        id: entity.rowKey,
        guestName: entity.guestName,
        guestEmail: entity.guestEmail,
        accommodationName: entity.accommodationName,
        accommodationAddress: entity.accommodationAddress,
        checkInDate: entity.checkInDate,
        checkOutDate: entity.checkOutDate,
        numberOfGuests: entity.numberOfGuests,
        numberOfNights: entity.numberOfNights,
        taxAmountPerNight: entity.taxAmountPerNight,
        totalTaxAmount: entity.totalTaxAmount,
        currency: entity.currency as any,
        status: entity.status as any,
        paymentId: entity.paymentId,
        paymentUrl: entity.paymentUrl,
        cityName: entity.cityName,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
      };

      this.logger.debug('Reservation retrieved from Azure Table Storage', {
        reservationId,
        status: reservation.status,
      });

      return reservation;
    } catch (error) {
      if (error.statusCode === 404) {
        this.logger.debug('Reservation not found in Azure Table Storage', { reservationId });
        return null;
      }

      this.logger.error('Failed to get reservation from Azure Storage', {
        error: error.message,
        reservationId,
      });
      throw error;
    }
  }

  /**
   * Get all reservations from Table Storage
   */
  async getAllReservations(): Promise<Reservation[]> {
    try {
      const entities = this.reservationsTableClient.listEntities<ReservationEntity>({
        queryOptions: { filter: "PartitionKey eq 'reservations'" }
      });

      const reservations: Reservation[] = [];
      for await (const entity of entities) {
        reservations.push({
          id: entity.rowKey,
          guestName: entity.guestName,
          guestEmail: entity.guestEmail,
          accommodationName: entity.accommodationName,
          accommodationAddress: entity.accommodationAddress,
          checkInDate: entity.checkInDate,
          checkOutDate: entity.checkOutDate,
          numberOfGuests: entity.numberOfGuests,
          numberOfNights: entity.numberOfNights,
          taxAmountPerNight: entity.taxAmountPerNight,
          totalTaxAmount: entity.totalTaxAmount,
          currency: entity.currency as any,
          status: entity.status as any,
          paymentId: entity.paymentId,
          paymentUrl: entity.paymentUrl,
          cityName: entity.cityName,
          createdAt: entity.createdAt,
          updatedAt: entity.updatedAt,
        });
      }

      // Sort by creation date (newest first)
      reservations.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      this.logger.debug('Retrieved all reservations from Azure Table Storage', {
        count: reservations.length,
      });

      return reservations;
    } catch (error) {
      this.logger.error('Failed to get all reservations from Azure Storage', {
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Delete reservation from Table Storage
   */
  async deleteReservation(reservationId: string): Promise<void> {
    try {
      await this.reservationsTableClient.deleteEntity('reservations', reservationId);

      this.logger.debug('Reservation deleted from Azure Table Storage', { reservationId });
    } catch (error) {
      if (error.statusCode === 404) {
        this.logger.debug('Reservation not found for deletion', { reservationId });
        return;
      }

      this.logger.error('Failed to delete reservation from Azure Storage', {
        error: error.message,
        reservationId,
      });
      throw error;
    }
  }

  // Payment Storage Operations

  /**
   * Save payment to Table Storage
   */
  async savePayment(payment: Payment): Promise<void> {
    try {
      const entity: PaymentEntity = {
        partitionKey: 'payments',
        rowKey: payment.paymentId,
        reservationId: payment.reservationId,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency,
        paymentUrl: payment.paymentUrl,
        expiresAt: payment.expiresAt,
        transactionId: payment.transactionId,
        receiptUrl: payment.receiptUrl,
        failureReason: payment.failureReason,
        providerPaymentId: payment.providerPaymentId,
        webhookData: payment.webhookData ? JSON.stringify(payment.webhookData) : undefined,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,
      };

      await this.paymentsTableClient.upsertEntity(entity);

      this.logger.debug('Payment saved to Azure Table Storage', {
        paymentId: payment.paymentId,
        status: payment.status,
      });
    } catch (error) {
      this.logger.error('Failed to save payment to Azure Storage', {
        error: error.message,
        paymentId: payment.paymentId,
      });
      throw error;
    }
  }

  /**
   * Get payment from Table Storage
   */
  async getPayment(paymentId: string): Promise<Payment | null> {
    try {
      const entity = await this.paymentsTableClient.getEntity<PaymentEntity>(
        'payments',
        paymentId
      );

      const payment: Payment = {
        paymentId: entity.rowKey,
        reservationId: entity.reservationId,
        status: entity.status as any,
        amount: entity.amount,
        currency: entity.currency as any,
        paymentUrl: entity.paymentUrl,
        expiresAt: entity.expiresAt,
        transactionId: entity.transactionId,
        receiptUrl: entity.receiptUrl,
        failureReason: entity.failureReason,
        providerPaymentId: entity.providerPaymentId,
        webhookData: entity.webhookData ? JSON.parse(entity.webhookData) : undefined,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
      };

      this.logger.debug('Payment retrieved from Azure Table Storage', {
        paymentId,
        status: payment.status,
      });

      return payment;
    } catch (error) {
      if (error.statusCode === 404) {
        this.logger.debug('Payment not found in Azure Table Storage', { paymentId });
        return null;
      }

      this.logger.error('Failed to get payment from Azure Storage', {
        error: error.message,
        paymentId,
      });
      throw error;
    }
  }

  /**
   * Get all payments from Table Storage
   */
  async getAllPayments(): Promise<Payment[]> {
    try {
      const entities = this.paymentsTableClient.listEntities<PaymentEntity>({
        queryOptions: { filter: "PartitionKey eq 'payments'" }
      });

      const payments: Payment[] = [];
      for await (const entity of entities) {
        payments.push({
          paymentId: entity.rowKey,
          reservationId: entity.reservationId,
          status: entity.status as any,
          amount: entity.amount,
          currency: entity.currency as any,
          paymentUrl: entity.paymentUrl,
          expiresAt: entity.expiresAt,
          transactionId: entity.transactionId,
          receiptUrl: entity.receiptUrl,
          failureReason: entity.failureReason,
          providerPaymentId: entity.providerPaymentId,
          webhookData: entity.webhookData ? JSON.parse(entity.webhookData) : undefined,
          createdAt: entity.createdAt,
          updatedAt: entity.updatedAt,
        });
      }

      // Sort by creation date (newest first)
      payments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      this.logger.debug('Retrieved all payments from Azure Table Storage', {
        count: payments.length,
      });

      return payments;
    } catch (error) {
      this.logger.error('Failed to get all payments from Azure Storage', {
        error: error.message,
      });
      throw error;
    }
  }

  // Queue Operations

  /**
   * Send payment status change event to queue
   */
  async sendPaymentStatusEvent(
    paymentId: string,
    reservationId: string,
    oldStatus: string,
    newStatus: string
  ): Promise<void> {
    try {
      const message: PaymentStatusMessage = {
        type: 'payment-status-changed',
        paymentId,
        reservationId,
        oldStatus,
        newStatus,
        timestamp: new Date().toISOString(),
      };

      await this.eventsQueueClient.sendMessage(JSON.stringify(message));

      this.logger.debug('Payment status event sent to queue', {
        paymentId,
        oldStatus,
        newStatus,
      });
    } catch (error) {
      this.logger.error('Failed to send payment status event to queue', {
        error: error.message,
        paymentId,
      });
      // Don't throw - queue failures shouldn't break the main flow
    }
  }

  /**
   * Send reservation created event to queue
   */
  private async sendReservationCreatedEvent(reservation: Reservation): Promise<void> {
    try {
      const message: ReservationCreatedMessage = {
        type: 'reservation-created',
        reservationId: reservation.id,
        guestEmail: reservation.guestEmail,
        totalAmount: reservation.totalTaxAmount,
        currency: reservation.currency,
        timestamp: new Date().toISOString(),
      };

      await this.eventsQueueClient.sendMessage(JSON.stringify(message));

      this.logger.debug('Reservation created event sent to queue', {
        reservationId: reservation.id,
      });
    } catch (error) {
      this.logger.error('Failed to send reservation created event to queue', {
        error: error.message,
        reservationId: reservation.id,
      });
      // Don't throw - queue failures shouldn't break the main flow
    }
  }

  /**
   * Clear all data (for development/testing)
   */
  async clearAllData(): Promise<void> {
    try {
      this.logger.log('Clearing all Azure Storage data');

      // Clear reservations table
      const reservationEntities = this.reservationsTableClient.listEntities({
        queryOptions: { filter: "PartitionKey eq 'reservations'" }
      });

      for await (const entity of reservationEntities) {
        if (entity.rowKey) {
          await this.reservationsTableClient.deleteEntity('reservations', entity.rowKey);
        }
      }

      // Clear payments table
      const paymentEntities = this.paymentsTableClient.listEntities({
        queryOptions: { filter: "PartitionKey eq 'payments'" }
      });

      for await (const entity of paymentEntities) {
        if (entity.rowKey) {
          await this.paymentsTableClient.deleteEntity('payments', entity.rowKey);
        }
      }

      // Clear queue messages
      await this.eventsQueueClient.clearMessages();

      this.logger.log('All Azure Storage data cleared successfully');
    } catch (error) {
      this.logger.error('Failed to clear Azure Storage data', { error: error.message });
      throw error;
    }
  }

  /**
   * Get storage health status
   */
  async getHealthStatus(): Promise<{
    blob: boolean;
    tables: boolean;
    queue: boolean;
    details: Record<string, string>;
  }> {
    const health = {
      blob: false,
      tables: false,
      queue: false,
      details: {} as Record<string, string>,
    };

    try {
      // Test blob storage
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      await containerClient.getProperties();
      health.blob = true;
    } catch (error: any) {
      health.details.blob = error.message || 'Unknown blob storage error';
    }

    try {
      // Test table storage
      await this.reservationsTableClient.getEntity('reservations', 'health-check');
    } catch (error: any) {
      // 404 is expected for health check
      health.tables = error.statusCode === 404;
      if (!health.tables) {
        health.details.tables = error.message || 'Unknown table storage error';
      }
    }

    try {
      // Test queue storage
      await this.eventsQueueClient.getProperties();
      health.queue = true;
    } catch (error: any) {
      health.details.queue = error.message || 'Unknown queue storage error';
    }

    return health;
  }
}
