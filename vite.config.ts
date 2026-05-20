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
        // Converted to a function to satisfy TypeScript's ManualChunksFunction requirement
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react/') || id.includes('react-dom') || id.includes('react-router')) return 'vendor-react';
            if (id.includes('three') || id.includes('@react-three')) return 'vendor-three';
            if (id.includes('framer-motion')) return 'vendor-motion';
            if (id.includes('recharts')) return 'vendor-charts';
            if (id.includes('lucide-react') || id.includes('clsx') || id.includes('tailwind-merge')) return 'vendor-ui';
          }
        }
      }
    }
  },
  // Ensure the dev server runs fast by pre-bundling these heavy dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'framer-motion', 'three']
  }
});