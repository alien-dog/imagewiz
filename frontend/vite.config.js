import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5001,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'https://e3d010d3-10b7-4398-916c-9569531b7cb9-00-nzrxz81n08w.kirk.replit.dev',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      },
      '/auth': {
        target: 'https://e3d010d3-10b7-4398-916c-9569531b7cb9-00-nzrxz81n08w.kirk.replit.dev',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: 'https://e3d010d3-10b7-4398-916c-9569531b7cb9-00-nzrxz81n08w.kirk.replit.dev',
        changeOrigin: true,
        secure: false,
      },
      '/processed': {
        target: 'https://e3d010d3-10b7-4398-916c-9569531b7cb9-00-nzrxz81n08w.kirk.replit.dev',
        changeOrigin: true,
        secure: false,
      },
    },
    cors: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});