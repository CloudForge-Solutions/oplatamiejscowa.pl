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
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryParamProvider } from 'use-query-params';
import { ReactRouter6Adapter } from 'use-query-params/adapters/react-router-6';

// Bootstrap CSS (mobile-first)
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

// Application shell
import App from './App';

// Global error handling
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  // TODO: Send to logging service
});

window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  // TODO: Send to logging service
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
