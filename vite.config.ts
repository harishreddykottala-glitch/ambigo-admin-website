import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    server: {
      port: 5174,
      proxy: {
        '/api': {
          target: env.VITE_MEDIA_URL || 'https://ambigo.in',
          changeOrigin: true,
          secure: false,
        },
        '/ws': {
          target: env.VITE_MEDIA_URL || 'https://ambigo.in',
          ws: true,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
