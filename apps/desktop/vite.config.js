import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import electron from 'vite-plugin-electron';
import renderer from 'vite-plugin-electron-renderer';
import path from 'path';
export default defineConfig({
    plugins: [
        react(),
        electron([
            {
                entry: 'electron/main.ts',
                vite: {
                    build: {
                        rollupOptions: {
                            external: ['electron'],
                            output: {
                                format: 'cjs',
                            },
                        },
                    },
                },
            },
            {
                entry: 'electron/preload.ts',
                onstart(options) {
                    options.reload();
                },
                vite: {
                    build: {
                        rollupOptions: {
                            external: ['electron'],
                            output: {
                                format: 'cjs',
                            },
                        },
                    },
                },
            },
        ]),
        renderer(),
    ],
    resolve: {
        alias: {
            '@jarvis/shared': path.resolve(__dirname, '../../packages/shared/src'),
            '@': path.resolve(__dirname, './src'),
        },
    },
});
