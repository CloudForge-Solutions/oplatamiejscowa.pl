import { defineConfig } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';
import viteTsconfigPaths from 'vite-tsconfig-paths';

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
			'react-i18next'
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
	build: {
		rollupOptions: {
			// Exclude deprecated files from build scanning
			external: [
				/^\/src\/apps\/records\/src\/main\.js$/,
				/^@services\/ModernInvoicePdfGenerator\.js$/
			],
			output: {
				// Let Vite handle chunking automatically for better optimization
				manualChunks(id: string) {
					if (id.includes('node_modules')) {
						if (id.includes('react') || id.includes('react-dom')) {
							return 'react-vendor';
						}
						if (id.includes('react-router')) {
							return 'react-router';
						}
						if (id.includes('react-bootstrap') || id.includes('bootstrap')) {
							return 'react-bootstrap';
						}
						if (id.includes('axios') || id.includes('uuid') || id.includes('openai')) {
							return 'business';
						}
						return 'vendor';
					}
				}
			}
		},
		// Optimize for production
		minify: 'terser',
		sourcemap: true
	},

	server: {
		port: 3000,
		host: '0.0.0.0',
		open: true,
		// Enable debugging support
		sourcemapIgnoreList: false
	},

	// Development-specific settings for better debugging
	define: {
		__DEV__: JSON.stringify(process.env.NODE_ENV === 'development')
	}
});
