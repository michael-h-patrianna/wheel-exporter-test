import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: /^@lib-types\//, replacement: path.resolve(__dirname, './src/lib/types') + '/' },
      { find: '@lib-types', replacement: path.resolve(__dirname, './src/lib/types.ts') },
      { find: '@assets', replacement: path.resolve(__dirname, './src/assets') },
      { find: '@components', replacement: path.resolve(__dirname, './src/lib/components') },
      { find: '@config', replacement: path.resolve(__dirname, './src/lib/config') },
      { find: '@demo', replacement: path.resolve(__dirname, './src/demo') },
      { find: '@hooks', replacement: path.resolve(__dirname, './src/lib/hooks') },
      { find: '@lib', replacement: path.resolve(__dirname, './src/lib') },
      { find: '@services', replacement: path.resolve(__dirname, './src/lib/services') },
      { find: '@theme', replacement: path.resolve(__dirname, './src/lib/theme') },
      { find: '@test-utils', replacement: path.resolve(__dirname, './src/lib/test-utils') },
      { find: '@tests', replacement: path.resolve(__dirname, './src/tests') },
      { find: '@utils', replacement: path.resolve(__dirname, './src/lib/utils') },
      { find: '@constants', replacement: path.resolve(__dirname, './src/lib/constants') },
      { find: '@', replacement: path.resolve(__dirname, './src') },
    ],
  },
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: 'build',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Split vendor dependencies into separate chunks
          if (id.includes('node_modules')) {
            // React core and related
            if (id.includes('react') || id.includes('react-dom') || id.includes('scheduler')) {
              return 'vendor-react';
            }
            // JSZip for file handling
            if (id.includes('jszip')) {
              return 'vendor-jszip';
            }
            // Other vendor dependencies
            return 'vendor-other';
          }
          // Split demo code from library code
          if (id.includes('/src/demo/')) {
            return 'demo';
          }
        },
      },
    },
  },
  publicDir: 'public',
});
