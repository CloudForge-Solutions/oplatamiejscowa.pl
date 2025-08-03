/**
 * DataSeedingService - Populate Azure Storage Emulator with mockup data
 * 
 * RESPONSIBILITY: Create realistic tourist tax reservation data for development
 * ARCHITECTURE: One-time seeding service for development environment
 */

import { v4 as uuidv4 } from 'uuid';
import { blobStorageService, ReservationData } from './BlobStorageService';
import { logger } from '../CentralizedLogger';

/**
 * Generate realistic mockup reservation data
 */
export class DataSeedingService {
  
  /**
   * Generate a single reservation with realistic data
   */
  private generateReservation(overrides: Partial<ReservationData> = {}): ReservationData {
    const accommodations = [
      {
        name: 'Hotel Kraków Palace',
        address: 'ul. Floriańska 45, 31-019 Kraków, Poland'
      },
      {
        name: 'Apartamenty Stare Miasto',
        address: 'ul. Grodzka 12, 31-006 Kraków, Poland'
      },
      {
        name: 'Villa Zakopane Resort',
        address: 'ul. Krupówki 88, 34-500 Zakopane, Poland'
      },
      {
        name: 'Pensjonat Górski Widok',
        address: 'ul. Tetmajera 15, 34-500 Zakopane, Poland'
      },
      {
        name: 'Hotel Gdańsk Marina',
        address: 'ul. Długi Targ 19, 80-828 Gdańsk, Poland'
      }
    ];

    const guests = [
      { name: 'Jan Kowalski', email: 'jan.kowalski@example.com' },
      { name: 'Anna Nowak', email: 'anna.nowak@example.com' },
      { name: 'Piotr Wiśniewski', email: 'piotr.wisniewski@example.com' },
      { name: 'Maria Wójcik', email: 'maria.wojcik@example.com' },
      { name: 'Tomasz Kowalczyk', email: 'tomasz.kowalczyk@example.com' },
      { name: 'John Smith', email: 'john.smith@example.com' },
      { name: 'Emma Johnson', email: 'emma.johnson@example.com' },
      { name: 'Hans Mueller', email: 'hans.mueller@example.com' },
      { name: 'Sophie Dubois', email: 'sophie.dubois@example.com' }
    ];

    const accommodation = accommodations[Math.floor(Math.random() * accommodations.length)];
    const guest = guests[Math.floor(Math.random() * guests.length)];
    
    // Generate random dates
    const checkInDate = new Date();
    checkInDate.setDate(checkInDate.getDate() + Math.floor(Math.random() * 30)); // Next 30 days
    
    const numberOfNights = Math.floor(Math.random() * 7) + 1; // 1-7 nights
    const checkOutDate = new Date(checkInDate);
    checkOutDate.setDate(checkOutDate.getDate() + numberOfNights);
    
    const numberOfGuests = Math.floor(Math.random() * 4) + 1; // 1-4 guests
    const taxAmountPerNight = 2.50; // Standard Polish tourist tax
    const totalTaxAmount = numberOfGuests * numberOfNights * taxAmountPerNight;
    
    const statuses: ReservationData['status'][] = ['pending', 'paid', 'failed'];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    const createdAt = new Date();
    createdAt.setHours(createdAt.getHours() - Math.floor(Math.random() * 24)); // Created within last 24h
    
    const baseReservation: ReservationData = {
      id: uuidv4(),
      guestName: guest.name,
      guestEmail: guest.email,
      accommodationName: accommodation.name,
      accommodationAddress: accommodation.address,
      checkInDate: checkInDate.toISOString().split('T')[0],
      checkOutDate: checkOutDate.toISOString().split('T')[0],
      numberOfGuests,
      numberOfNights,
      taxAmountPerNight,
      totalTaxAmount,
      currency: 'PLN',
      status,
      createdAt: createdAt.toISOString(),
      updatedAt: createdAt.toISOString(),
      paymentId: status === 'paid' ? `pay_${uuidv4().substring(0, 8)}` : undefined,
      paymentUrl: status === 'pending' ? `https://sandbox.imoje.pl/payment/${uuidv4()}` : undefined
    };

    return { ...baseReservation, ...overrides };
  }

  /**
   * Seed the storage with multiple reservations
   */
  async seedReservations(count: number = 10): Promise<void> {
    try {
      logger.info('🌱 Starting data seeding process', { count });

      const reservations: ReservationData[] = [];
      
      // Generate specific test cases
      reservations.push(
        // Pending payment - for testing payment flow
        this.generateReservation({
          id: 'test-pending-001',
          guestName: 'Test User',
          guestEmail: 'test@example.com',
          accommodationName: 'Test Hotel Kraków',
          accommodationAddress: 'ul. Testowa 1, 31-000 Kraków, Poland',
          numberOfGuests: 2,
          numberOfNights: 3,
          totalTaxAmount: 15.00,
          status: 'pending',
          paymentUrl: 'https://sandbox.imoje.pl/payment/test-001'
        }),
        
        // Paid reservation - for testing success state
        this.generateReservation({
          id: 'test-paid-001',
          guestName: 'Paid User',
          guestEmail: 'paid@example.com',
          status: 'paid',
          paymentId: 'pay_test_001'
        }),
        
        // Failed payment - for testing error handling
        this.generateReservation({
          id: 'test-failed-001',
          guestName: 'Failed User',
          guestEmail: 'failed@example.com',
          status: 'failed'
        })
      );

      // Generate additional random reservations
      for (let i = 0; i < count - 3; i++) {
        reservations.push(this.generateReservation());
      }

      // Store all reservations
      let successCount = 0;
      for (const reservation of reservations) {
        const success = await blobStorageService.storeReservation(reservation);
        if (success) {
          successCount++;
        }
      }

      logger.info('✅ Data seeding completed', {
        totalReservations: reservations.length,
        successfullyStored: successCount,
        failed: reservations.length - successCount
      });

      // Log some sample reservation IDs for testing
      const sampleIds = reservations.slice(0, 3).map(r => r.id);
      logger.info('📋 Sample reservation IDs for testing', { sampleIds });

    } catch (error) {
      logger.error('❌ Data seeding failed', { error });
      throw error;
    }
  }

  /**
   * Clear all existing reservations
   */
  async clearReservations(): Promise<void> {
    try {
      logger.info('🧹 Clearing existing reservations');

      const reservationIds = await blobStorageService.listReservations();
      
      let deletedCount = 0;
      for (const id of reservationIds) {
        const success = await blobStorageService.deleteReservation(id);
        if (success) {
          deletedCount++;
        }
      }

      logger.info('✅ Reservations cleared', {
        totalFound: reservationIds.length,
        deleted: deletedCount
      });

    } catch (error) {
      logger.error('❌ Failed to clear reservations', { error });
      throw error;
    }
  }

  /**
   * Get seeding statistics
   */
  async getSeedingStats(): Promise<{
    storageConnected: boolean;
    containerExists: boolean;
    reservationCount: number;
    sampleReservations: string[];
  }> {
    try {
      const stats = await blobStorageService.getStorageStats();
      const reservationIds = await blobStorageService.listReservations();
      
      return {
        storageConnected: true,
        containerExists: stats.containerExists,
        reservationCount: reservationIds.length,
        sampleReservations: reservationIds.slice(0, 5)
      };
    } catch (error) {
      logger.error('❌ Failed to get seeding stats', { error });
      return {
        storageConnected: false,
        containerExists: false,
        reservationCount: 0,
        sampleReservations: []
      };
    }
  }

  /**
   * Reseed with fresh data (clear + seed)
   */
  async reseed(count: number = 10): Promise<void> {
    await this.clearReservations();
    await this.seedReservations(count);
  }
}

// Export singleton instance
export const dataSeedingService = new DataSeedingService();
