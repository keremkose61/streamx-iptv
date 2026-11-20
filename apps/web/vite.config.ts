import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@streamx/player-core': path.resolve(__dirname, '../../packages/player-core/src/index.ts'),
      '@streamx/playlist-engine': path.resolve(__dirname, '../../packages/playlist-engine/src/index.ts'),
    },
  },
  server: {
    host: true, // Listen on all network interfaces (0.0.0.0) so TV / phone can connect
    port: 5173,
    open: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
});
