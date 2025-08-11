import path from 'node:path';
import react from '@vitejs/plugin-react';
import { createLogger, defineConfig } from 'vite';

const logger = createLogger();
const loggerError = logger.error;

logger.error = (msg, options) => {
  if (options?.error?.toString().includes('CssSyntaxError: [postcss]')) {
    return;
  }
  loggerError(msg, options);
};

export default defineConfig({
  customLogger: logger,
  plugins: [
    react() // Configuration React simple sans plugins Babel supplémentaires
  ],
  server: {
    port: 5173,
    host: 'localhost',
    cors: true,
    headers: {
      'Cross-Origin-Embedder-Policy': 'credentialless',
    },
    allowedHosts: true,
    hmr: false, // Désactiver complètement HMR
    proxy: {
      // Chatbot local
      '/api/chat': {
        target: 'http://localhost:5173',
        changeOrigin: false,
        secure: false,
        ws: false,
      },
      // Backend historique
      '/api': {
        target: 'https://maximarket-backend.onrender.com',
        changeOrigin: true,
        secure: false,
        ws: false, // Désactiver WebSocket pour le proxy aussi
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  resolve: {
    extensions: ['.jsx', '.js', '.tsx', '.ts', '.json'],
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Optimisations pour la production
  build: {
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu']
        }
      }
    }
  },
  // Optimisations pour le développement
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
    exclude: ['@vite/client', '@vite/env']
  }
}); 