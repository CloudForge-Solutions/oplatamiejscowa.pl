const TerserPlugin = require('terser-webpack-plugin');

module.exports = (options, webpack) => {
  const lazyImports = [
    '@nestjs/microservices/microservices-module',
    '@nestjs/websockets/socket-module',
    // Add more unused modules to reduce bundle size
    '@nestjs/platform-fastify',
    '@nestjs/platform-ws',
    '@nestjs/platform-socket.io',
    // Azure Functions core (optional dependency)
    '@azure/functions-core',
    // Template engines (not needed for serverless)
    'velocityjs',
    'liquor',
    'ejs',
    'hamljs',
    'underscore',
    'lodash',
    'mustache',
    'mote',
    'bracket-template',
    'ractive',
    'plates',
    'react-dom/server',
    'marko',
    'squirrelly',
    'twing',
  ];

  return {
    ...options,
    // Bundle everything for serverless
    externals: [],

    // Optimize for production
    mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',

    optimization: {
      // Minimize for faster cold starts
      minimize: true,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            // Keep class names for NestJS decorators
            keep_classnames: true,
            keep_fnames: true,
            // Remove console.logs in production
            compress: {
              drop_console: process.env.NODE_ENV === 'production',
            },
          },
        }),
      ],
      // Disable chunk splitting for serverless - single bundle
      splitChunks: false,
    },

    output: {
      ...options.output,
      // Azure Functions compatible output
      libraryTarget: 'commonjs2',
      // Single file output for serverless
      filename: 'main.js',
      chunkFilename: '[name].js',
      // Clean dist folder
      clean: true,
    },

    plugins: [
      ...options.plugins,
      // Ignore unused NestJS modules and VSCode extensions
      new webpack.IgnorePlugin({
        checkResource(resource, context) {
          // Ignore VSCode extensions
          if (context && context.includes('.vscode/extensions')) {
            return true;
          }

          // Ignore lazy imports
          if (lazyImports.includes(resource)) {
            try {
              require.resolve(resource);
            } catch (err) {
              return true;
            }
          }
          return false;
        },
      }),
      // Define environment variables
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      }),
    ],

    // Resolve configuration
    resolve: {
      ...options.resolve,
      // Prefer ES modules when available
      mainFields: ['module', 'main'],
    },
  };
};
