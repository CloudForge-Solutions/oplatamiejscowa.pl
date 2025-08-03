/**
 * Application Entry Point
 *
 * ARCHITECTURE: Mobile-first React application with TypeScript
 * - Bootstrap-based responsive design
 * - EventBus-driven architecture
 * - Simple localStorage persistence
 * - Polling-based status updates
 */

import React from 'react';
import App from './App';
import {logger} from '../platform/CentralizedLogger';

// Import Bootstrap CSS (React Bootstrap handles JavaScript)
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

// Import custom styles
import '../assets/styles/main.scss';

import { createRoot } from 'react-dom/client';

// Mobile viewport configuration
const viewport = document.querySelector('meta[name="viewport"]');
if (!viewport) {
  const meta = document.createElement('meta');
  meta.name = 'viewport';
  meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
  document.head.appendChild(meta);
}

/**
 * Application Bootstrap
 * ARCHITECTURE COMPLIANCE: Clean initialization with proper error handling
 */
const initializeReactApp = (): void => {
    try {
        logger.info('🚀 Tourist Tax React application starting');

        const rootElement = document.getElementById('root');
        if (!rootElement) {
            throw new Error('Root element not found');
        }

        const root = createRoot(rootElement);
        root.render(
            <React.StrictMode>
                <App />
            </React.StrictMode>
        );

        logger.info('✅ Tourist Tax React application rendered');
    } catch (error) {
        logger.error('❌ Failed to initialize Tourist Tax React application', {error: error instanceof Error ? error.message : String(error)});

        // Fallback: Show basic error message
        const rootElement = document.getElementById('root');
        if (rootElement) {
            rootElement.innerHTML = `
        <div class="d-flex justify-content-center align-items-center vh-100">
          <div class="text-center">
            <h3 class="text-danger">Application Error</h3>
            <p class="text-muted">Failed to initialize the tourist tax application. Please refresh the page.</p>
            <button class="btn btn-primary" onclick="window.location.reload()">Refresh Page</button>
          </div>
        </div>
      `;
        }
    }
};

// Initialize the application
initializeReactApp();
