/**
 * Azure Functions Entry Point with H4AD Serverless Adapter
 *
 * RESPONSIBILITY: Register serverless adapter for NestJS integration
 * ARCHITECTURE: Unified serverless approach with industry-standard adapter
 */

// Import serverless adapter handler
import './main-adapter';

// Export for Azure Functions runtime
export * from './main-adapter';
