import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';

interface BuildOptions {
  mode: string;
}

export default ({ mode }: BuildOptions) => {
  const isDev = mode === 'development';
  const port = process.env.VITE_PORT || 3000;
  const apiUrl = isDev ? 'http://localhost:8080' : 'http://103.90.75.122:88';

  return defineConfig({
    plugins: [svgr({ include: '**/*.svg', }), react()],
    resolve: {
      alias: { '@': '/src' },
    },
    define: {
      __IS_DEV__: JSON.stringify(isDev),
      __API__: JSON.stringify(apiUrl),
      __PROJECT__: JSON.stringify('frontend'),
    },
    server: {
        host: '0.0.0.0',
        port: Number(port),
        watch: {
                usePolling: true, // ← Обязательно для Docker
                interval: 1000    // ← Интервал опроса
        },
    // Для проксирования API запросов в development
          proxy: isDev ? {
            '/api': {
              target: 'http://backend:8080',
              changeOrigin: true,
              secure: false,
            },
            '/ws': {
              target: 'http://backend:8080',
              changeOrigin: true,
              ws: true,
              secure: false,
            }
          } : undefined
        },
    // Настройки для preview режима
        preview: {
          host: '0.0.0.0',
          port: 4173
        }
  });
};
