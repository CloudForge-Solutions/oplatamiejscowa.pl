/**
 * Data Seeding Service
 * 
 * RESPONSIBILITY: Seed development data for testing purposes
 * ARCHITECTURE: Development-only service for populating storage with test data
 * NOTE: This service should only be used in development/testing environments
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AzureStorageService } from './azure-storage.service';
import { Reservation, generateReservationId } from '../entities/reservation.entity';

@Injectable()
export class DataSeedingService {
  private readonly logger = new Logger(DataSeedingService.name);
  private readonly isDevelopment: boolean;

  constructor(
    private readonly configService: ConfigService,
    private readonly azureStorageService: AzureStorageService
  ) {
    this.isDevelopment = this.configService.get<string>('NODE_ENV') !== 'production';
  }

  /**
   * Seed mock data for development/testing
   * Only runs in non-production environments
   */
  async seedMockData(): Promise<void> {
    if (!this.isDevelopment) {
      this.logger.warn('Data seeding skipped - not in development environment');
      return;
    }

    try {
      this.logger.log('🌱 Starting data seeding for development');

      // Check if data already exists
      const existingReservations = await this.azureStorageService.getAllReservations();
      if (existingReservations.length > 0) {
        this.logger.log('Data already exists, skipping seeding', {
          existingCount: existingReservations.length
        });
        return;
      }

      // Create sample reservations
      const mockReservations = this.createMockReservations();
      
      // Save to storage
      for (const reservation of mockReservations) {
        await this.azureStorageService.saveReservation(reservation);
      }

      this.logger.log(`✅ Successfully seeded ${mockReservations.length} mock reservations`);
    } catch (error) {
      this.logger.error('Failed to seed mock data', { error: error.message });
      // Don't throw - seeding failure shouldn't break the application
    }
  }

  /**
   * Clear all data (development only)
   */
  async clearAllData(): Promise<void> {
    if (!this.isDevelopment) {
      this.logger.warn('Data clearing skipped - not in development environment');
      return;
    }

    try {
      this.logger.log('🧹 Clearing all development data');
      await this.azureStorageService.clearAllData();
      this.logger.log('✅ All development data cleared');
    } catch (error) {
      this.logger.error('Failed to clear data', { error: error.message });
      throw error;
    }
  }

  /**
   * Reset data (clear and reseed)
   */
  async resetData(): Promise<void> {
    if (!this.isDevelopment) {
      this.logger.warn('Data reset skipped - not in development environment');
      return;
    }

    await this.clearAllData();
    await this.seedMockData();
  }

  /**
   * Create mock reservation data
   */
  private createMockReservations(): Reservation[] {
    const now = new Date().toISOString();
    
    const mockData: Omit<Reservation, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        guestName: 'Jan Kowalski',
        guestEmail: 'jan.kowalski@example.com',
        accommodationName: 'Hotel Kraków',
        accommodationAddress: 'ul. Floriańska 1, 31-019 Kraków',
        checkInDate: '2025-08-15',
        checkOutDate: '2025-08-18',
        numberOfGuests: 2,
        numberOfNights: 3,
        taxAmountPerNight: 2.50,
        totalTaxAmount: 15.00,
        currency: 'PLN' as any,
        status: 'pending' as any,
        cityName: 'Kraków',
      },
      {
        guestName: 'Anna Nowak',
        guestEmail: 'anna.nowak@example.com',
        accommodationName: 'Apartamenty Centrum',
        accommodationAddress: 'ul. Grodzka 15, 31-006 Kraków',
        checkInDate: '2025-08-20',
        checkOutDate: '2025-08-22',
        numberOfGuests: 1,
        numberOfNights: 2,
        taxAmountPerNight: 2.50,
        totalTaxAmount: 5.00,
        currency: 'PLN' as any,
        status: 'paid' as any,
        cityName: 'Kraków',
      },
      {
        guestName: 'Maria Schmidt',
        guestEmail: 'maria.schmidt@example.com',
        accommodationName: 'Boutique Hotel Wawel',
        accommodationAddress: 'ul. Kanonicza 22, 31-002 Kraków',
        checkInDate: '2025-09-01',
        checkOutDate: '2025-09-05',
        numberOfGuests: 3,
        numberOfNights: 4,
        taxAmountPerNight: 3.00,
        totalTaxAmount: 36.00,
        currency: 'PLN' as any,
        status: 'pending' as any,
        cityName: 'Kraków',
      },
      {
        guestName: 'John Smith',
        guestEmail: 'john.smith@example.com',
        accommodationName: 'Hostel Kazimierz',
        accommodationAddress: 'ul. Szeroka 2, 31-053 Kraków',
        checkInDate: '2025-09-10',
        checkOutDate: '2025-09-12',
        numberOfGuests: 1,
        numberOfNights: 2,
        taxAmountPerNight: 2.00,
        totalTaxAmount: 4.00,
        currency: 'PLN' as any,
        status: 'failed' as any,
        cityName: 'Kraków',
      },
    ];

    return mockData.map((data, index) => ({
      ...data,
      id: generateReservationId(),
      createdAt: now,
      updatedAt: now,
    }));
  }

  /**
   * Get seeding status
   */
  async getSeedingStatus(): Promise<{
    isDevelopment: boolean;
    canSeed: boolean;
    dataExists: boolean;
    reservationCount: number;
    paymentCount: number;
  }> {
    const reservations = await this.azureStorageService.getAllReservations();
    const payments = await this.azureStorageService.getAllPayments();

    return {
      isDevelopment: this.isDevelopment,
      canSeed: this.isDevelopment,
      dataExists: reservations.length > 0 || payments.length > 0,
      reservationCount: reservations.length,
      paymentCount: payments.length,
    };
  }
}
