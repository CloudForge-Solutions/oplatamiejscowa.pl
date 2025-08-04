import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ServerlessAdapter } from '@h4ad/serverless-adapter';
import { LazyFramework } from '@h4ad/serverless-adapter/lib/frameworks/lazy';
import { ExpressFramework } from '@h4ad/serverless-adapter/lib/frameworks/express';
import { DefaultHandler } from '@h4ad/serverless-adapter/lib/handlers/default';
import { PromiseResolver } from '@h4ad/serverless-adapter/lib/resolvers/promise';
import { HttpTriggerV4Adapter } from '@h4ad/serverless-adapter/lib/adapters/azure';
import { AppModule } from './nest/shell/app.module';

/**
 * UNIFIED SERVERLESS ARCHITECTURE WITH H4AD ADAPTER
 *
 * This implementation uses the industry-standard @h4ad/serverless-adapter
 * for seamless integration between NestJS and Azure Functions.
 *
 * Benefits:
 * - Automatic request/response transformation
 * - Lazy loading for optimal cold start performance
 * - Multi-cloud compatibility (Azure, AWS, GCP)
 * - Battle-tested in production environments
 */

/**
 * Bootstrap NestJS Application with Serverless Optimizations
 */
async function bootstrap() {
  console.log('🚀 Bootstrapping NestJS for Serverless...');

  // Create NestJS application with Express adapter
  const nestApp = await NestFactory.create(AppModule, new ExpressAdapter(), {
    logger: ['error', 'warn'], // Minimal logging for faster startup
    abortOnError: false,
  });

  // Enable CORS for frontend integration
  nestApp.enableCors({
    origin: ['http://localhost:3040', 'http://localhost:3041', 'http://localhost:3042', 'http://localhost:3043', 'http://localhost:3044', 'http://localhost:3045'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // Global prefix for all routes
  nestApp.setGlobalPrefix('api');

  // Setup Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Oplata Miejscowa API')
    .setDescription('Tourist Tax Payment System - Serverless Backend')
    .setVersion('1.0')
    .addServer('http://localhost:7071', 'Azure Functions (Development)')
    .addServer('https://your-function-app.azurewebsites.net', 'Azure Functions (Production)')
    .addTag('health', 'Health Checks')
    .addTag('storage', 'SAS Token Generation')
    .addTag('validation', 'Data Validation')
    .build();

  const document = SwaggerModule.createDocument(nestApp, config);
  SwaggerModule.setup('api/docs', nestApp, document, {
    customSiteTitle: 'Oplata Miejscowa API Documentation',
    customfavIcon: '/favicon.ico',
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // Initialize the NestJS application
  await nestApp.init();

  console.log('✅ NestJS Application Initialized');
  console.log('📡 Available Endpoints:');
  console.log('  • GET  /api/health - Health check');
  console.log('  • POST /api/storage/generate-sas - Generate SAS tokens');
  console.log('  • POST /api/validation/uuid - Validate UUIDs');
  console.log('  • GET  /api/docs - Swagger documentation');

  // Get the Express instance for serverless adapter
  const expressApp = nestApp.getHttpAdapter().getInstance();

  return expressApp;
}

/**
 * Create Serverless Handler with H4AD Adapter
 */
const expressFramework = new ExpressFramework();
const lazyFramework = new LazyFramework(expressFramework, bootstrap);

export const handler = ServerlessAdapter.new(null)
  .setFramework(lazyFramework)
  .setHandler(new DefaultHandler())
  .setResolver(new PromiseResolver())
  .addAdapter(new HttpTriggerV4Adapter())
  .build();

/**
 * Development Server Bootstrap
 *
 * This function creates a traditional HTTP server for local development
 * when not running in a serverless environment.
 */
export async function startHttpServer() {
  console.log('🚀 Starting HTTP Development Server...');

  const expressApp = await bootstrap();
  const port = process.env.PORT || 3044;

  const server = expressApp.listen(port, () => {
    console.log('');
    console.log('🎉 HTTP Development Server Started!');
    console.log('');
    console.log('📍 Server URL: http://localhost:' + port);
    console.log('📖 API Documentation: http://localhost:' + port + '/api/docs');
    console.log('');
    console.log('🔧 Mode: HTTP Server (development)');
    console.log('💡 For serverless testing, deploy to Azure Functions');
    console.log('');
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('🛑 Received SIGTERM, shutting down gracefully...');
    server.close(() => {
      console.log('✅ HTTP server closed');
      process.exit(0);
    });
  });

  return server;
}

// Auto-start HTTP server if not in serverless environment
if (!process.env.AZURE_FUNCTIONS_ENVIRONMENT && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
  startHttpServer().catch((error) => {
    console.error('❌ Failed to start HTTP server:', error);
    process.exit(1);
  });
}

// Export for Azure Functions
export { handler as httpHandler };

// Register Azure Functions handler (if we're in Azure Functions environment)
if (process.env.AZURE_FUNCTIONS_ENVIRONMENT) {
  const { app } = require('@azure/functions');

  app.http('api', {
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    authLevel: 'anonymous',
    route: '{*segments}',
    handler: handler,
  });
}
