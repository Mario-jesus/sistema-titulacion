/// <reference types='vitest' />
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig(() => ({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/apps/sistema-titulacion-cliente',
  server: {
    port: 4200,
    host: 'localhost',
  },
  preview: {
    port: 4200,
    host: 'localhost',
  },
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@features': resolve(__dirname, '../../libs/frontend/features/src'),
      '@entities': resolve(__dirname, '../../libs/frontend/entities/src'),
      '@pages': resolve(__dirname, '../../libs/frontend/pages/src'),
      '@shared': resolve(__dirname, '../../libs/frontend/shared/src'),
      '@widgets': resolve(__dirname, '../../libs/frontend/widgets/src'),
    },
  },
  build: {
    outDir: './dist',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
}));
