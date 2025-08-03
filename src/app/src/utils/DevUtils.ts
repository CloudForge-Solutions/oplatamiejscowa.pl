/**
 * Development Utilities - Helper functions for development and testing
 * 
 * RESPONSIBILITY: Provide development tools for data seeding and testing
 * ARCHITECTURE: Development-only utilities, not included in production builds
 */

import { dataSeedingService } from '../platform/storage/DataSeedingService';
import { mockupApiService } from '../platform/api/MockupApiService';
import { logger } from '../platform/CentralizedLogger';

/**
 * Development utilities for testing and data management
 */
export class DevUtils {
  
  /**
   * Seed the storage with test data
   */
  static async seedTestData(count: number = 15): Promise<void> {
    try {
      logger.info('🌱 Seeding test data for development', { count });
      
      await dataSeedingService.reseed(count);
      
      const stats = await dataSeedingService.getSeedingStats();
      logger.info('✅ Test data seeded successfully', stats);
      
      // Log some sample reservation IDs for testing
      if (stats.sampleReservations.length > 0) {
        logger.info('📋 Sample reservation IDs for testing:', {
          reservations: stats.sampleReservations,
          testUrls: stats.sampleReservations.map(id => 
            `${window.location.origin}/payment/${id}`
          )
        });
      }
      
    } catch (error) {
      logger.error('❌ Failed to seed test data', { error });
      throw error;
    }
  }

  /**
   * Test API health and connectivity
   */
  static async testApiHealth(): Promise<void> {
    try {
      logger.info('🔍 Testing API health');
      
      const healthResponse = await mockupApiService.healthCheck();
      
      if (healthResponse.success) {
        logger.info('✅ API health check passed', healthResponse.data);
      } else {
        logger.error('❌ API health check failed', healthResponse);
      }
      
    } catch (error) {
      logger.error('❌ API health check error', { error });
      throw error;
    }
  }

  /**
   * Test reservation loading
   */
  static async testReservationLoading(reservationId?: string): Promise<void> {
    try {
      // Use a test reservation ID or get one from the list
      let testId = reservationId;
      
      if (!testId) {
        const stats = await dataSeedingService.getSeedingStats();
        if (stats.sampleReservations.length > 0) {
          testId = stats.sampleReservations[0];
        } else {
          throw new Error('No reservations available for testing');
        }
      }
      
      logger.info('🔍 Testing reservation loading', { reservationId: testId });
      
      const response = await mockupApiService.getReservation(testId);
      
      if (response.success) {
        logger.info('✅ Reservation loaded successfully', {
          reservationId: testId,
          data: response.data
        });
      } else {
        logger.error('❌ Failed to load reservation', response);
      }
      
    } catch (error) {
      logger.error('❌ Reservation loading test failed', { error });
      throw error;
    }
  }

  /**
   * List all available reservations
   */
  static async listAllReservations(): Promise<void> {
    try {
      logger.info('📋 Listing all reservations');
      
      const response = await mockupApiService.listReservations();
      
      if (response.success && response.data) {
        logger.info('✅ Reservations listed successfully', {
          count: response.data.length,
          reservations: response.data.map(r => ({
            id: r.id,
            guestName: r.guestName,
            accommodationName: r.accommodationName,
            status: r.status,
            amount: r.totalTaxAmount
          }))
        });
        
        // Log test URLs
        const testUrls = response.data.slice(0, 5).map(r => 
          `${window.location.origin}/payment/${r.id}`
        );
        
        logger.info('🔗 Test URLs (first 5):', { testUrls });
        
      } else {
        logger.error('❌ Failed to list reservations', response);
      }
      
    } catch (error) {
      logger.error('❌ Failed to list reservations', { error });
      throw error;
    }
  }

  /**
   * Clear all test data
   */
  static async clearTestData(): Promise<void> {
    try {
      logger.info('🧹 Clearing all test data');
      
      await dataSeedingService.clearReservations();
      
      logger.info('✅ Test data cleared successfully');
      
    } catch (error) {
      logger.error('❌ Failed to clear test data', { error });
      throw error;
    }
  }

  /**
   * Run full development setup
   */
  static async setupDevelopment(): Promise<void> {
    try {
      logger.info('🚀 Setting up development environment');
      
      // Test API health
      await this.testApiHealth();
      
      // Seed test data
      await this.seedTestData(15);
      
      // Test reservation loading
      await this.testReservationLoading();
      
      logger.info('✅ Development environment setup complete');
      
    } catch (error) {
      logger.error('❌ Development setup failed', { error });
      throw error;
    }
  }

  /**
   * Get development status
   */
  static async getDevStatus(): Promise<{
    apiHealthy: boolean;
    storageConnected: boolean;
    reservationCount: number;
    sampleReservations: string[];
  }> {
    try {
      const [healthResponse, stats] = await Promise.all([
        mockupApiService.healthCheck(),
        dataSeedingService.getSeedingStats()
      ]);
      
      return {
        apiHealthy: healthResponse.success,
        storageConnected: stats.storageConnected,
        reservationCount: stats.reservationCount,
        sampleReservations: stats.sampleReservations
      };
      
    } catch (error) {
      logger.error('❌ Failed to get dev status', { error });
      return {
        apiHealthy: false,
        storageConnected: false,
        reservationCount: 0,
        sampleReservations: []
      };
    }
  }
}

// Make DevUtils available globally in development
if (import.meta.env.DEV) {
  (window as any).DevUtils = DevUtils;
  
  logger.info('🛠️ DevUtils available globally as window.DevUtils', {
    methods: [
      'seedTestData(count?)',
      'testApiHealth()',
      'testReservationLoading(id?)',
      'listAllReservations()',
      'clearTestData()',
      'setupDevelopment()',
      'getDevStatus()'
    ]
  });
}

export default DevUtils;
