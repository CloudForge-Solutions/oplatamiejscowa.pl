/**
 * Azure Functions Entry Point with NestJS
 *
 * RESPONSIBILITY: Bootstrap NestJS application for Azure Functions
 * ARCHITECTURE: NestJS + Azure Functions integration
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

/**
 * Create NestJS application instance
 */
export const createNestApp = async () => {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // CORS configuration
  app.enableCors({
    origin: (process.env.CORS_ALLOWED_ORIGINS || 'http://localhost:3040,http://localhost:3041,http://localhost:3042,http://localhost:3043,http://localhost:3044,http://localhost:3045').split(','),
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with'],
    credentials: false,
    maxAge: 86400, // 24 hours
  });

  // Swagger documentation (for development)
  if (process.env.NODE_ENV === 'development') {
    const config = new DocumentBuilder()
      .setTitle('Oplata Miejscowa API')
      .setDescription('Tourist Tax Payment System - Azure Functions Backend')
      .setVersion('1.0')
      .addTag('storage', 'SAS Token Generation')
      .addTag('payment', 'Payment Processing')
      .addTag('validation', 'Data Validation')
      .addTag('health', 'Health Checks')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  // Global prefix for all routes
  app.setGlobalPrefix('api');

  const logger = new Logger('Bootstrap');
  logger.log('🚀 NestJS application created successfully');
  logger.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.log(`🔐 CORS Origins: ${process.env.CORS_ALLOWED_ORIGINS || 'http://localhost:3040'}`);

  return app;
};

/**
 * Export the NestJS app factory for hybrid integration
 */
