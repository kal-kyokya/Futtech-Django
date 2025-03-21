import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,  // Change if needed
    open: true,  // Automatically open browser
    host: '0.0.0.0', // Allows access from network
  },
  build: {
    outDir: 'dist',
  }
});

