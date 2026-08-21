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
});
