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
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
});
