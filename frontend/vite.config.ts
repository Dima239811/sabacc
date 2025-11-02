import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';

interface BuildOptions {
  mode: string;
}

export default ({ mode }: BuildOptions) => {
  const isDev = mode === 'development';
  const port = process.env.VITE_PORT || 5173;
  // По умолчанию везде используем относительный префикс /api
  const apiUrl = process.env.VITE_API_URL ?? '/api';
  console.log(`API URL: ${apiUrl}`)

  return defineConfig({
    plugins: [svgr({ include: '**/*.svg' }), react()],
    resolve: { alias: { '@': '/src' } },
    define: {
      __IS_DEV__: JSON.stringify(isDev),
      __API__: JSON.stringify(apiUrl),
      __PROJECT__: JSON.stringify('frontend'),
    },
    server: {
      host: '0.0.0.0',
      port: Number(port),
      watch: { usePolling: true, interval: 1000 },
      proxy: isDev ? {
        // при локальной разработке проксируем /api -> локальный backend
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
        '/ws': {
          target: 'ws://localhost:8080',
          changeOrigin: true,
          ws: true,
          secure: false,
        }
      } : undefined
    },
    preview: { host: '0.0.0.0', port: 4173 }
  });
};