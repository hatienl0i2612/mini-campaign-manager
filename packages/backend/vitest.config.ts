import { defineConfig } from 'vitest/config';
import path from 'path';
import 'dotenv/config';

const getTestDbUrl = () => {
    const base = process.env.DATABASE_URL || '';
    try {
        const url = new URL(base);
        if (!url.pathname.endsWith('_test')) {
            url.pathname = `${url.pathname}_test`;
        }
        return url.toString();
    } catch {
        return `${base}_test`;
    }
};

export default defineConfig({
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    test: {
        globals: true,
        environment: 'node',
        testTimeout: 10000,
        env: {
            DATABASE_URL: getTestDbUrl(),
            NODE_ENV: 'test',
        },
        globalSetup: './tests/global-setup.ts',
    },
});
