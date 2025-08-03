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
import {logger} from '@/platform/CentralizedLogger';

// Import Bootstrap CSS (React Bootstrap handles JavaScript)
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

// Import custom styles
import '@/assets/styles/main.scss';

import { createRoot } from 'react-dom/client';

// Global error handling
window.addEventListener('unhandledrejection', (event) => {
  logger.error('Unhandled promise rejection', event.reason);
});

window.addEventListener('error', (event) => {
  logger.error('Global error', event.error);
});

// Mobile viewport configuration
const viewport = document.querySelector('meta[name="viewport"]');
if (!viewport) {
  const meta = document.createElement('meta');
  meta.name = 'viewport';
  meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
  document.head.appendChild(meta);
}

// Application root
const container = document.getElementById('root');
if (!container) {
  throw new Error('Root container not found');
}

const root = createRoot(container);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryParamProvider adapter={ReactRouter6Adapter}>
        <App />
      </QueryParamProvider>
    </BrowserRouter>
  </React.StrictMode>
);
