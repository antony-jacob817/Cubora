import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    cssCodeSplit: true,
    // Reduce the chunk size warning limit since we are actively managing it
    chunkSizeWarningLimit: 1000, 
    rollupOptions: {
      output: {
        // Manually separate heavy libraries so they load in parallel and cache independently
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-three': ['three', '@react-three/fiber', '@react-three/drei'],
          'vendor-motion': ['framer-motion'],
          'vendor-charts': ['recharts'],
          'vendor-ui': ['clsx', 'tailwind-merge', 'lucide-react']
        }
      }
    }
  },
  // Ensure the dev server runs fast by pre-bundling these heavy dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'framer-motion', 'three']
  }
});