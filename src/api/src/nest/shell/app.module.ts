/**
 * NestJS Application Module
 *
 * RESPONSIBILITY: Main application module for Azure Functions backend
 * ARCHITECTURE: NestJS with Azure Functions integration
 */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StorageModule } from '../apps/storage/storage.module';
import { PaymentModule } from '../apps/payment/payment.module';
import { ValidationModule } from '../apps/validation/validation.module';
import { HealthModule } from '../apps/health/health.module';

/**
 * Configuration factory for environment variables
 */
const configFactory = () => ({
  // Azure Storage Configuration
  storage: {
    connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING,
    accountName: process.env.AZURE_STORAGE_ACCOUNT_NAME,
    accountKey: process.env.AZURE_STORAGE_ACCOUNT_KEY,
    containerName: process.env.BLOB_CONTAINER_NAME || 'reservations',
  },

  // SAS Token Configuration
  sas: {
    expiryHours: parseInt(process.env.SAS_TOKEN_EXPIRY_HOURS || '24'),
    defaultPermissions: 'rw',
  },

  // CORS Configuration
  cors: {
    allowedOrigins: (process.env.CORS_ALLOWED_ORIGINS || 'http://localhost:3040,http://localhost:3041,http://localhost:3042,http://localhost:3043,http://localhost:3044,http://localhost:3045').split(','),
    allowedMethods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with'],
    maxAge: 86400, // 24 hours
  },

  // Rate Limiting Configuration
  rateLimit: {
    requestsPerMinute: parseInt(process.env.RATE_LIMIT_REQUESTS_PER_MINUTE || '60'),
    windowSizeMs: 60 * 1000, // 1 minute
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    enableStructuredLogging: true,
  },

  // Payment Configuration (for future imoje integration)
  payment: {
    imojeApiUrl: process.env.IMOJE_API_URL,
    imojeApiKey: process.env.IMOJE_API_KEY,
    imojeWebhookSecret: process.env.IMOJE_WEBHOOK_SECRET,
  },
});

/**
 * Main Application Module
 */
@Module({
  imports: [
    // Configuration module with validation
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configFactory],
      envFilePath: ['.env.local', '.env'],
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
    }),

    // Feature modules
    StorageModule,
    PaymentModule,
    ValidationModule,
    HealthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
