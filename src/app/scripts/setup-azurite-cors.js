#!/usr/bin/env node

/**
 * Azurite CORS Configuration Script
 *
 * RESPONSIBILITY: Configure CORS rules for Azurite development environment
 * ARCHITECTURE: Programmatic CORS setup using Azure Storage SDK
 *
 * This script sets up CORS rules for Azurite (Azure Storage Emulator) to allow
 * cross-origin requests from the Vite development server.
 */

import { BlobServiceClient } from '@azure/storage-blob';

// Development configuration
const AZURITE_CONNECTION_STRING = 'DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://127.0.0.1:10000/devstoreaccount1;QueueEndpoint=http://127.0.0.1:10001/devstoreaccount1;TableEndpoint=http://127.0.0.1:10002/devstoreaccount1;';

// Development origins that should be allowed
const DEVELOPMENT_ORIGINS = [
  'http://localhost:3040',
  'http://localhost:3041',
  'http://localhost:3042',
  'http://localhost:3043',
  'http://localhost:3044',
  'http://localhost:3045',
  'http://127.0.0.1:3040',
  'http://127.0.0.1:3041',
  'http://127.0.0.1:3042',
  'http://127.0.0.1:3043',
  'http://127.0.0.1:3044',
  'http://127.0.0.1:3045',
  'http://0.0.0.0:3040',
  'http://0.0.0.0:3041',
  'http://0.0.0.0:3042',
  'http://0.0.0.0:3043',
  'http://0.0.0.0:3044',
  'http://0.0.0.0:3045'
];

/**
 * Wait for Azurite to be ready
 */
async function waitForAzurite(maxRetries = 30, retryDelay = 1000) {
  console.log('🔄 Waiting for Azurite to be ready...');

  for (let i = 0; i < maxRetries; i++) {
    try {
      // Try a simple health check endpoint
      const response = await fetch('http://127.0.0.1:10000/devstoreaccount1?restype=service&comp=properties', {
        method: 'GET',
        headers: {
          'x-ms-version': '2024-08-04'
        }
      });

      // Azurite is ready if we get any response (even 400 is fine for this endpoint)
      if (response.status >= 200 && response.status < 500) {
        console.log('✅ Azurite is ready!');
        return true;
      }

      console.log(`⏳ Attempt ${i + 1}/${maxRetries} - got status ${response.status}, retrying...`);
    } catch (error) {
      console.log(`⏳ Attempt ${i + 1}/${maxRetries} - connection failed: ${error.message}`);
    }

    await new Promise(resolve => setTimeout(resolve, retryDelay));
  }

  throw new Error('❌ Azurite failed to start within timeout period');
}

/**
 * Configure CORS rules for Azurite
 */
async function configureCORS() {
  try {
    console.log('🔒 Configuring CORS rules for Azurite...');

    // Wait for Azurite to be ready
    await waitForAzurite();

    // Create BlobServiceClient using connection string (includes authentication)
    const blobServiceClient = BlobServiceClient.fromConnectionString(AZURITE_CONNECTION_STRING);

    // Define CORS rules for development
    const corsRules = [
      {
        allowedOrigins: DEVELOPMENT_ORIGINS.join(','),
        allowedMethods: 'GET,PUT,POST,DELETE,HEAD,OPTIONS',
        allowedHeaders: '*',
        exposedHeaders: '*',
        maxAgeInSeconds: 86400 // 24 hours
      }
    ];

    // Also configure CORS to allow all origins for development (more permissive)
    const permissiveCorsRules = [
      {
        allowedOrigins: '*',
        allowedMethods: 'GET,PUT,POST,DELETE,HEAD,OPTIONS',
        allowedHeaders: '*',
        exposedHeaders: '*',
        maxAgeInSeconds: 86400 // 24 hours
      }
    ];

    // Set service properties with CORS rules (try permissive first for development)
    const serviceProperties = {
      cors: permissiveCorsRules,
      defaultServiceVersion: '2024-08-04'
    };

    await blobServiceClient.setProperties(serviceProperties);

    console.log('✅ CORS rules configured successfully!');
    console.log('📋 Allowed origins:', DEVELOPMENT_ORIGINS.join(', '));
    console.log('📋 Allowed methods: GET, PUT, POST, DELETE, HEAD, OPTIONS');
    console.log('📋 Allowed headers: *');
    console.log('📋 Max age: 24 hours');

  } catch (error) {
    console.error('❌ Failed to configure CORS rules:', error.message);
    process.exit(1);
  }
}

// Run the configuration
configureCORS()
  .then(() => {
    console.log('🎉 Azurite CORS configuration complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 CORS configuration failed:', error);
    process.exit(1);
  });

export { configureCORS, waitForAzurite };
