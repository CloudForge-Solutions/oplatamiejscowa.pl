import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/platform/test-setup.ts'],
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['node_modules', 'dist', 'build', 'reports'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './reports/coverage',
      exclude: [
        'node_modules/',
        'tests/',
        'dist/',
        'build/',
        'reports/',
        '*.config.js',
        '*.config.ts'
      ]
    },
    reporter: ['verbose', 'json'],
    outputFile: {
      json: './reports/vitest-results.json'
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/js': path.resolve(__dirname, './src/js'),
      '@/css': path.resolve(__dirname, './src/css'),
      '@/assets': path.resolve(__dirname, './src/assets'),
      '@services': path.resolve(__dirname, './src/js/services'),
      '@components': path.resolve(__dirname, './src/js/components'),
      '@utils': path.resolve(__dirname, './src/js/utils'),
      '@constants': path.resolve(__dirname, './src/js/constants')
    }
  }
});
