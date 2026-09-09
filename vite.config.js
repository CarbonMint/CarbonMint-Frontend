import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.js'],
    include: ['src/test/**/*.{test,spec}.{js,jsx,ts,tsx}'],
    exclude: [
      'src/test/formatCurrency.test.js',
      'src/test/formatTonnes.test.js',
      'src/test/locale.test.jsx',
    ],
  },
  build:{
    // Here I am lowering the warning limit per fragment to 400KB to alert about heavy bundles
    chunkSizeWarningLimit:400,
    // Here I set a strict budget for assest/images (4 KB) to avoid heavy inline injections
    assetsInlineLimit: 4096,
    rollupOptions:{
      output:{
        //in this code what I do is divide the code to separate the heavy libraries of node_modules
        manualChunks(id){
          if(id.includes('node_modules')){
            // I separate react and core libraries into their own small files
            if(id.includes('react')) return 'vendor-react';
            return 'vendor-libs';
          }
        }
      }
    }
  }
});
