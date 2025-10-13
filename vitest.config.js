import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vitest/config';
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
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './src/setupTests.ts',
        css: true,
        exclude: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/scripts/playwright/**'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'lcov', 'html'],
            exclude: [
                'node_modules/',
                'src/setupTests.ts',
                '**/*.test.{ts,tsx}',
                '**/__tests__/**',
                'scripts/**',
                'build/**',
                'dist/**',
            ],
        },
    },
});
