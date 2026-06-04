import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteCompression from 'vite-plugin-compression';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    viteCompression({ algorithm: 'gzip', ext: '.gz' }),
    viteCompression({ algorithm: 'brotliCompress', ext: '.br' })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 1000, 
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react/') || id.includes('react-dom') || id.includes('react-router')) return 'vendor-react';
            if (id.includes('three') || id.includes('@react-three')) return 'vendor-three';
            if (id.includes('framer-motion')) return 'vendor-motion';
            if (id.includes('recharts')) return 'vendor-charts';
            if (id.includes('lucide-react') || id.includes('clsx') || id.includes('tailwind-merge')) return 'vendor-ui';
            if (id.includes('opencv')) return 'vendor-cv'; 
          }
        }
      }
    }
  },
  esbuild: {
    drop: ['console', 'debugger'],
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'framer-motion', 'three']
  }
});