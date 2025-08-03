/**
 * Browser polyfills for Node.js APIs required by Azure Storage SDK
 */

// Polyfill Buffer for browser environment
import { Buffer } from 'buffer';

// Make Buffer available globally
if (typeof window !== 'undefined') {
  (window as any).Buffer = Buffer;
  (window as any).global = window;
}

// Polyfill process.env for browser
if (typeof process === 'undefined') {
  (globalThis as any).process = {
    env: {},
    nextTick: (fn: Function) => setTimeout(fn, 0),
    version: '16.0.0',
    platform: 'browser'
  };
}

export {};
