import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/retro-games/', // Base path for GitHub Pages deployment
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
