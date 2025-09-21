import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';

interface BuildOptions {
  mode: string;
}

export default ({ mode }: BuildOptions) => {
  const isDev = mode === 'development';
  const port = process.env.VITE_PORT || 5173;
  const apiUrl = isDev ? (process.env.VITE_API_URL || '/api'): 'http://103.90.75.122:88';
  console.log(`API URL: ${apiUrl}`)



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
        // ПРАВИЛЬНЫЙ proxy для разработки
          proxy: isDev ? {
            '/api': {
              target: 'http://localhost:8080', // ← localhost, а не backend!
              changeOrigin: true,
              secure: false,
//               rewrite: (path) => path.replace(/^\/api/, '') // опционально: убрать /api
            },
            '/ws': {
              target: 'ws://localhost:8080', // ← localhost!
              changeOrigin: true,
              ws: true,
              secure: false,
            },
            '/api/game': {
              target: 'http://localhost:8080/game',
              changeOrigin: true,
              ws: true,
              secure: false,
              rewrite: (path) => path.replace(/^\/api\/game/, '/game'),
            },


          } : undefined
        },
    // Настройки для preview режима
        preview: {
          host: '0.0.0.0',
          port: 4173
        }
  });
};
