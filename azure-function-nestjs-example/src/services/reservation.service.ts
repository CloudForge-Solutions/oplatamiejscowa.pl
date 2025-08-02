/**
 * Reservation Service for NestJS Azure Function
 * Handles business logic and Azure Storage integration
 * Uses Azure Table Storage for metadata and Blob Storage for documents
 */

import { Injectable, Logger } from '@nestjs/common';
import { TableClient, TableEntity } from '@azure/data-tables';
import { BlobServiceClient } from '@azure/storage-blob';
import { v4 as uuidv4 } from 'uuid';
import { ReservationData } from '../interfaces/reservation.interface';
import { CreateReservationDto, ReservationQueryDto } from '../dto/reservation.dto';

@Injectable()
export class ReservationService {
  private readonly logger = new Logger(ReservationService.name);
  private readonly tableClient: TableClient;
  private readonly blobServiceClient: BlobServiceClient;

  constructor() {
    // Initialize Azure Table Storage client
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    if (!connectionString) {
      throw new Error('AZURE_STORAGE_CONNECTION_STRING environment variable is required');
    }

    this.tableClient = new TableClient(connectionString, 'reservations');
    this.blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    
    this.initializeStorage();
  }

  /**
   * Initialize storage containers and tables
   */
  private async initializeStorage(): Promise<void> {
    try {
      // Create table if it doesn't exist
      await this.tableClient.createTable();
      
      // Create blob containers if they don't exist
      const auditContainer = this.blobServiceClient.getContainerClient('audit-logs');
      await auditContainer.createIfNotExists();
      
      this.logger.log('Azure Storage initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Azure Storage', error);
      throw error;
    }
  }

  /**
   * Create a new reservation
   */
  async create(createReservationDto: CreateReservationDto): Promise<ReservationData> {
    const reservationId = uuidv4();
    const now = new Date().toISOString();

    const reservationEntity: TableEntity<ReservationData> = {
      partitionKey: createReservationDto.cityCode, // Partition by city for better performance
      rowKey: reservationId,
      id: reservationId,
      cityCode: createReservationDto.cityCode,
      cityName: createReservationDto.cityName,
      bookingPlatform: createReservationDto.bookingPlatform,
      checkInDate: createReservationDto.checkInDate,
      checkOutDate: createReservationDto.checkOutDate,
      guestCount: createReservationDto.guestCount,
      taxAmount: createReservationDto.taxAmount,
      status: 'pending',
      createdAt: now,
      updatedAt: now
    };

    try {
      await this.tableClient.createEntity(reservationEntity);
      
      // Log audit trail
      await this.logAuditEvent('reservation_created', reservationId, {
        cityCode: createReservationDto.cityCode,
        guestCount: createReservationDto.guestCount,
        taxAmount: createReservationDto.taxAmount
      });

      this.logger.log(`Reservation created: ${reservationId}`);
      
      return this.entityToReservationData(reservationEntity);
    } catch (error) {
      this.logger.error(`Failed to create reservation: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Find reservation by ID
   */
  async findById(id: string): Promise<ReservationData | null> {
    try {
      // Since we don't know the partition key, we need to query
      const entities = this.tableClient.listEntities<ReservationData>({
        queryOptions: {
          filter: `RowKey eq '${id}'`
        }
      });

      for await (const entity of entities) {
        return this.entityToReservationData(entity);
      }

      return null;
    } catch (error) {
      this.logger.error(`Failed to find reservation ${id}: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Find reservations by city
   */
  async findByCity(cityCode: string, query: ReservationQueryDto): Promise<ReservationData[]> {
    try {
      let filter = `PartitionKey eq '${cityCode}'`;
      
      // Add status filter if provided
      if (query.status) {
        filter += ` and status eq '${query.status}'`;
      }

      // Add date range filter if provided
      if (query.fromDate) {
        filter += ` and checkInDate ge '${query.fromDate}'`;
      }
      
      if (query.toDate) {
        filter += ` and checkOutDate le '${query.toDate}'`;
      }

      const entities = this.tableClient.listEntities<ReservationData>({
        queryOptions: {
          filter,
          select: ['id', 'cityCode', 'cityName', 'bookingPlatform', 'checkInDate', 'checkOutDate', 'guestCount', 'taxAmount', 'status', 'createdAt', 'updatedAt']
        }
      });

      const reservations: ReservationData[] = [];
      for await (const entity of entities) {
        reservations.push(this.entityToReservationData(entity));
      }

      // Sort by creation date (newest first)
      reservations.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());

      return reservations;
    } catch (error) {
      this.logger.error(`Failed to find reservations for city ${cityCode}: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Update reservation status
   */
  async updateStatus(id: string, status: ReservationData['status']): Promise<ReservationData | null> {
    try {
      // First find the reservation to get the partition key
      const existingReservation = await this.findById(id);
      if (!existingReservation) {
        return null;
      }

      const updateEntity = {
        partitionKey: existingReservation.cityCode,
        rowKey: id,
        status,
        updatedAt: new Date().toISOString()
      };

      await this.tableClient.updateEntity(updateEntity, 'Merge');

      // Log audit trail
      await this.logAuditEvent('reservation_status_updated', id, {
        oldStatus: existingReservation.status,
        newStatus: status
      });

      this.logger.log(`Reservation ${id} status updated to ${status}`);

      // Return updated reservation
      return await this.findById(id);
    } catch (error) {
      this.logger.error(`Failed to update reservation ${id} status: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Find reservations with pagination
   */
  async findWithPagination(query: ReservationQueryDto): Promise<{
    data: ReservationData[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      hasMore: boolean;
    };
  }> {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100); // Max 100 items per page
    
    try {
      let filter = '';
      
      // Build filter based on query parameters
      if (query.status) {
        filter = `status eq '${query.status}'`;
      }

      const entities = this.tableClient.listEntities<ReservationData>({
        queryOptions: {
          filter: filter || undefined
        }
      });

      const allReservations: ReservationData[] = [];
      for await (const entity of entities) {
        allReservations.push(this.entityToReservationData(entity));
      }

      // Sort by creation date (newest first)
      allReservations.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());

      // Apply pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedData = allReservations.slice(startIndex, endIndex);

      return {
        data: paginatedData,
        pagination: {
          page,
          limit,
          total: allReservations.length,
          hasMore: endIndex < allReservations.length
        }
      };
    } catch (error) {
      this.logger.error(`Failed to fetch paginated reservations: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Convert Table Entity to ReservationData
   */
  private entityToReservationData(entity: TableEntity<ReservationData>): ReservationData {
    return {
      id: entity.id || entity.rowKey,
      cityCode: entity.cityCode!,
      cityName: entity.cityName!,
      bookingPlatform: entity.bookingPlatform!,
      checkInDate: entity.checkInDate!,
      checkOutDate: entity.checkOutDate!,
      guestCount: entity.guestCount!,
      taxAmount: entity.taxAmount!,
      status: entity.status!,
      paymentId: entity.paymentId,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt
    };
  }

  /**
   * Log audit event to Blob Storage
   */
  private async logAuditEvent(eventType: string, reservationId: string, data: any): Promise<void> {
    try {
      const auditContainer = this.blobServiceClient.getContainerClient('audit-logs');
      const timestamp = new Date().toISOString();
      const blobName = `${timestamp.split('T')[0]}/${eventType}_${reservationId}_${Date.now()}.json`;

      const auditLog = {
        eventType,
        reservationId,
        timestamp,
        data
      };

      const blockBlobClient = auditContainer.getBlockBlobClient(blobName);
      await blockBlobClient.upload(JSON.stringify(auditLog), JSON.stringify(auditLog).length);
    } catch (error) {
      this.logger.warn(`Failed to log audit event: ${error.message}`);
      // Don't throw - audit logging shouldn't break the main operation
    }
  }
}
