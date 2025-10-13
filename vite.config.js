import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@lib': path.resolve(__dirname, './src/lib'),
            '@components': path.resolve(__dirname, './src/lib/components'),
            '@hooks': path.resolve(__dirname, './src/lib/hooks'),
            '@services': path.resolve(__dirname, './src/lib/services'),
            '@types': path.resolve(__dirname, './src/lib/types'),
            '@utils': path.resolve(__dirname, './src/lib/utils'),
            '@theme': path.resolve(__dirname, './src/lib/theme'),
            '@demo': path.resolve(__dirname, './src/demo'),
        },
    },
    server: {
        port: 5173,
        open: true,
    },
    build: {
        outDir: 'build',
        sourcemap: true,
    },
    publicDir: 'public',
});
