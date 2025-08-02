/**
 * ReservationRepository - Repository pattern for reservation data operations
 * Follows mVAT architecture patterns for data access layer
 */

import { BookingReservation } from '../types/BookingTypes';
import { reservationDB, ReservationDatabaseService } from '../services/ReservationDatabaseService';

// Repository interfaces following mVAT patterns
export interface ReservationFilter {
  status?: BookingReservation['status'][];
  taxStatus?: BookingReservation['taxStatus'][];
  dateFrom?: string;
  dateTo?: string;
  guestCountry?: string[];
  searchTerm?: string;
}

export interface ReservationQueryOptions {
  limit?: number;
  offset?: number;
  sortBy?: keyof BookingReservation;
  sortOrder?: 'asc' | 'desc';
}

export interface ReservationStats {
  total: number;
  confirmed: number;
  pending: number;
  cancelled: number;
  totalTaxAmount: number;
  averageStayLength: number;
}

// Logger for consistency
const logger = {
  info: (message: string, data?: any) => console.log(`[ReservationRepo] ${message}`, data || ''),
  error: (message: string, error?: any) => console.error(`[ReservationRepo] ${message}`, error || ''),
  debug: (message: string, data?: any) => import.meta.env.DEV && console.debug(`[ReservationRepo] ${message}`, data || '')
};

/**
 * ReservationRepository - High-level data access layer for reservations
 * Implements repository pattern with business logic abstraction
 */
export class ReservationRepository {
  private dbService: ReservationDatabaseService;

  constructor(dbService: ReservationDatabaseService = reservationDB) {
    this.dbService = dbService;
    logger.info('📊 ReservationRepository initialized');
  }

  /**
   * Initialize repository (ensures database is ready)
   */
  async initialize(): Promise<void> {
    await this.dbService.initialize();
    logger.info('✅ ReservationRepository ready');
  }

  /**
   * Save single reservation
   */
  async save(reservation: BookingReservation): Promise<BookingReservation> {
    try {
      await this.dbService.saveReservation(reservation);
      logger.debug('💾 Reservation saved', { id: reservation.id, guestName: reservation.guestName });
      return reservation;
    } catch (error) {
      logger.error('❌ Failed to save reservation', { id: reservation.id, error });
      throw error;
    }
  }

  /**
   * Save multiple reservations (bulk operation)
   */
  async saveMany(reservations: BookingReservation[]): Promise<BookingReservation[]> {
    try {
      await this.dbService.saveReservations(reservations);
      logger.info('💾 Bulk save completed', { count: reservations.length });
      return reservations;
    } catch (error) {
      logger.error('❌ Failed to save reservations', { count: reservations.length, error });
      throw error;
    }
  }

  /**
   * Find reservation by ID
   */
  async findById(id: string): Promise<BookingReservation | null> {
    try {
      const reservation = await this.dbService.getReservation(id);
      logger.debug('🔍 Reservation lookup', { id, found: !!reservation });
      return reservation;
    } catch (error) {
      logger.error('❌ Failed to find reservation', { id, error });
      throw error;
    }
  }

  /**
   * Find all reservations
   */
  async findAll(): Promise<BookingReservation[]> {
    try {
      const reservations = await this.dbService.getAllReservations();
      logger.debug('🔍 Retrieved all reservations', { count: reservations.length });
      return reservations;
    } catch (error) {
      logger.error('❌ Failed to retrieve reservations', error);
      throw error;
    }
  }

  /**
   * Find reservations with filters
   */
  async findWithFilters(filter: ReservationFilter): Promise<BookingReservation[]> {
    try {
      let reservations = await this.dbService.getAllReservations();

      // Apply filters
      if (filter.status && filter.status.length > 0) {
        reservations = reservations.filter(r => filter.status!.includes(r.status));
      }

      if (filter.taxStatus && filter.taxStatus.length > 0) {
        reservations = reservations.filter(r => r.taxStatus && filter.taxStatus!.includes(r.taxStatus));
      }

      if (filter.dateFrom) {
        reservations = reservations.filter(r => r.checkInDate >= filter.dateFrom!);
      }

      if (filter.dateTo) {
        reservations = reservations.filter(r => r.checkInDate <= filter.dateTo!);
      }

      if (filter.guestCountry && filter.guestCountry.length > 0) {
        reservations = reservations.filter(r => filter.guestCountry!.includes(r.guestCountry));
      }

      if (filter.searchTerm) {
        const searchLower = filter.searchTerm.toLowerCase();
        reservations = reservations.filter(r => 
          r.guestName.toLowerCase().includes(searchLower) ||
          r.reservationNumber.toLowerCase().includes(searchLower) ||
          (r.guestEmail && r.guestEmail.toLowerCase().includes(searchLower))
        );
      }

      logger.debug('🔍 Filtered reservations', { 
        originalCount: await this.count(),
        filteredCount: reservations.length,
        filter 
      });

      return reservations;
    } catch (error) {
      logger.error('❌ Failed to filter reservations', { filter, error });
      throw error;
    }
  }

  /**
   * Find reservations by status
   */
  async findByStatus(status: BookingReservation['status']): Promise<BookingReservation[]> {
    try {
      const reservations = await this.dbService.getReservationsByStatus(status);
      logger.debug('🔍 Retrieved reservations by status', { status, count: reservations.length });
      return reservations;
    } catch (error) {
      logger.error('❌ Failed to find reservations by status', { status, error });
      throw error;
    }
  }

  /**
   * Find reservations by date range
   */
  async findByDateRange(startDate: string, endDate: string): Promise<BookingReservation[]> {
    try {
      const reservations = await this.dbService.getReservationsByDateRange(startDate, endDate);
      logger.debug('🔍 Retrieved reservations by date range', { 
        startDate, 
        endDate, 
        count: reservations.length 
      });
      return reservations;
    } catch (error) {
      logger.error('❌ Failed to find reservations by date range', { startDate, endDate, error });
      throw error;
    }
  }

  /**
   * Update reservation
   */
  async update(id: string, updates: Partial<BookingReservation>): Promise<BookingReservation> {
    try {
      await this.dbService.updateReservation(id, updates);
      const updated = await this.dbService.getReservation(id);
      
      if (!updated) {
        throw new Error(`Reservation ${id} not found after update`);
      }

      logger.debug('📝 Reservation updated', { id, updates: Object.keys(updates) });
      return updated;
    } catch (error) {
      logger.error('❌ Failed to update reservation', { id, updates, error });
      throw error;
    }
  }

  /**
   * Delete reservation
   */
  async delete(id: string): Promise<void> {
    try {
      await this.dbService.deleteReservation(id);
      logger.debug('🗑️ Reservation deleted', { id });
    } catch (error) {
      logger.error('❌ Failed to delete reservation', { id, error });
      throw error;
    }
  }

  /**
   * Count total reservations
   */
  async count(): Promise<number> {
    try {
      const count = await this.dbService.countReservations();
      logger.debug('📊 Reservation count', { count });
      return count;
    } catch (error) {
      logger.error('❌ Failed to count reservations', error);
      throw error;
    }
  }

  /**
   * Get reservation statistics
   */
  async getStats(): Promise<ReservationStats> {
    try {
      const reservations = await this.dbService.getAllReservations();
      
      const stats: ReservationStats = {
        total: reservations.length,
        confirmed: reservations.filter(r => r.status === 'confirmed').length,
        pending: reservations.filter(r => r.status === 'pending').length,
        cancelled: reservations.filter(r => r.status === 'cancelled').length,
        totalTaxAmount: reservations.reduce((sum, r) => sum + (r.taxAmount || 0), 0),
        averageStayLength: reservations.length > 0 
          ? reservations.reduce((sum, r) => sum + r.numberOfNights, 0) / reservations.length 
          : 0
      };

      logger.debug('📊 Reservation statistics calculated', stats);
      return stats;
    } catch (error) {
      logger.error('❌ Failed to calculate statistics', error);
      throw error;
    }
  }

  /**
   * Clear all reservations (for testing/reset)
   */
  async clear(): Promise<void> {
    try {
      await this.dbService.clearAllReservations();
      logger.info('🧹 All reservations cleared');
    } catch (error) {
      logger.error('❌ Failed to clear reservations', error);
      throw error;
    }
  }

  /**
   * Check if reservation exists
   */
  async exists(id: string): Promise<boolean> {
    try {
      const reservation = await this.dbService.getReservation(id);
      return !!reservation;
    } catch (error) {
      logger.error('❌ Failed to check reservation existence', { id, error });
      throw error;
    }
  }
}

// Export singleton instance
export const reservationRepository = new ReservationRepository();
