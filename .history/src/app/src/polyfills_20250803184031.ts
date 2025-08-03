/**
 * Browser polyfills for Node.js APIs required by Azure Storage SDK
 * This must be imported before any other modules that use Node.js APIs
 */

// Polyfill Buffer for browser environment
import { Buffer } from 'buffer';

// Make Buffer available globally immediately
(globalThis as any).Buffer = Buffer;
(globalThis as any).global = globalThis;

// Also make it available on window for legacy compatibility
if (typeof window !== 'undefined') {
  (window as any).Buffer = Buffer;
  (window as any).global = window;
}

// Polyfill process for browser
(globalThis as any).process = {
  env: {
    NODE_ENV: 'development'
  },
  nextTick: (fn: Function) => setTimeout(fn, 0),
  version: '16.0.0',
  platform: 'browser',
  browser: true
};

// Ensure process is also available on window
if (typeof window !== 'undefined') {
  (window as any).process = (globalThis as any).process;
}

export {};
