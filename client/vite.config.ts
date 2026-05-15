import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: { '/api': 'http://localhost:4000' },
  },
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        // Split big libs into their own chunks so the initial bundle is small
        manualChunks: {
          'vendor-react':    ['react', 'react-dom', 'react-router-dom'],
          'vendor-firebase': ['firebase/app', 'firebase/auth'],
          'vendor-motion':   ['framer-motion'],
          'vendor-xlsx':     ['xlsx'],
          'vendor-icons':    ['lucide-react'],
        },
      },
    },
  },
});
