import { defineConfig } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';
import viteTsconfigPaths from 'vite-tsconfig-paths';

// Fix for Node.js 22 crypto issue
import { webcrypto } from 'node:crypto';
if (!globalThis.crypto) {
  globalThis.crypto = webcrypto as any;
}

export default defineConfig({
	root: resolve(__dirname, './'),
	base: './',
	publicDir: 'public',

	// Optimize dependencies for tourist tax payment system
	optimizeDeps: {
		include: [
			'react',
			'react-dom',
			'react-router-dom',
			'react-bootstrap',
			'bootstrap',
			'uuid',
			'i18next',
			'react-i18next',
			'@azure/storage-blob'
		]
	},

	// React plugins configuration - ELIMINATING HANDLEBARS COMPLEXITY
	plugins: [
		react({
			// Modern JSX runtime (no need for fastRefresh option)
			jsxRuntime: 'automatic'
		}),
		viteTsconfigPaths() // Resolve absolute paths from tsconfig.json
	],

	resolve: {
		alias: {
			'@': resolve(__dirname, 'src'),
			'@apps': resolve(__dirname, 'src/apps'),
			'@assets': resolve(__dirname, 'src/assets'),
			'@constants': resolve(__dirname, 'src/constants'),
			'@platform': resolve(__dirname, 'src/platform'),
			'@shell': resolve(__dirname, 'src/shell'),
			'@components': resolve(__dirname, 'src/components'),
			'@services': resolve(__dirname, 'src/services'),
			'@utils': resolve(__dirname, 'src/utils')
		}
	},

	// Node.js polyfills for Azure Storage SDK
	define: {
		global: 'globalThis',
		__DEV__: JSON.stringify(process.env['NODE_ENV'] === 'development')
	},
	build: {
		rollupOptions: {
			output: {
				// Optimize chunks for tourist tax payment system
				manualChunks(id: string) {
					if (id.includes('node_modules')) {
						if (id.includes('react') || id.includes('react-dom')) {
							return 'react-vendor';
						}
						if (id.includes('react-router')) {
							return 'react-router';
						}
						if (id.includes('react-bootstrap') || id.includes('bootstrap')) {
							return 'ui-vendor';
						}
						if (id.includes('i18next') || id.includes('react-i18next')) {
							return 'i18n-vendor';
						}
						if (id.includes('uuid')) {
							return 'utils-vendor';
						}
						return 'vendor';
					}
					// Split our app code by feature
					if (id.includes('src/apps/tourist-tax')) {
						return 'tourist-tax-app';
					}
					if (id.includes('src/platform/storage')) {
						return 'storage-platform';
					}
					return undefined;
				}
			}
		},
		// Optimize for production
		minify: 'terser',
		sourcemap: true,
		target: 'es2020'
	},

	server: {
		port: 3040,
		host: '0.0.0.0',
		open: true,
		// Enable debugging support
		sourcemapIgnoreList: false
	},


});
