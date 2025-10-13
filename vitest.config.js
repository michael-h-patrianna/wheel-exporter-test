import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
export default defineConfig({
    plugins: [react()],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './src/setupTests.ts',
        css: true,
        exclude: [
            '**/node_modules/**',
            '**/dist/**',
            '**/build/**',
            '**/scripts/playwright/**',
        ],
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
