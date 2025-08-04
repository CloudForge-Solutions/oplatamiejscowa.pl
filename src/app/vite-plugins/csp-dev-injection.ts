/**
 * Vite Plugin: CSP Development Injection
 *
 * RESPONSIBILITY: Inject development-specific CSP entries only during development
 * ARCHITECTURE: Clean separation of development and production security policies
 */

import type { Plugin } from 'vite';

interface CSPDevInjectionOptions {
  developmentEndpoints?: string[];
  placeholder?: string;
}

/**
 * Development CSP endpoints that should NEVER appear in production
 */
const DEFAULT_DEV_ENDPOINTS = [
  'http://127.0.0.1:10000',  // Azure Storage Emulator - Blob
  'http://127.0.0.1:10001',  // Azure Storage Emulator - Queue
  'http://127.0.0.1:10002',  // Azure Storage Emulator - Table
  'http://localhost:7071',   // Azure Functions Core Tools
  'http://localhost:3040',   // Vite Dev Server (self-reference)
];

/**
 * Vite plugin to inject development CSP entries only during development
 *
 * @param options Configuration options
 * @returns Vite plugin
 */
export function cspDevInjection(options: CSPDevInjectionOptions = {}): Plugin {
  const {
    developmentEndpoints = DEFAULT_DEV_ENDPOINTS,
    placeholder = '%VITE_DEV_CSP_CONNECT%'
  } = options;

  return {
    name: 'csp-dev-injection',

    transformIndexHtml: {
      order: 'pre',
      handler(html: string, context) {
        const isDevelopment = context.server !== undefined || process.env['NODE_ENV'] === 'development';

        if (isDevelopment) {
          // Development: inject development endpoints
          const devEndpoints = ' ' + developmentEndpoints.join(' ');
          const transformedHtml = html.replace(placeholder, devEndpoints);

          console.log('🔒 CSP Development Injection: Added development endpoints');
          console.log('   Endpoints:', developmentEndpoints.join(', '));

          return transformedHtml;
        } else {
          // Production: remove placeholder (clean CSP)
          const transformedHtml = html.replace(placeholder, '');

          console.log('🔒 CSP Production Build: Clean security policy (no development endpoints)');

          return transformedHtml;
        }
      }
    }
  };
}

export default cspDevInjection;
