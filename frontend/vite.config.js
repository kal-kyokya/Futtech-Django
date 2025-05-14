import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
	proxy: {
	    '/users': 'http://localhost:8080',
	    '/videos': 'http://localhost:8080',
	    '/lists': 'http://localhost:8080',
	}
    },
    optimizeDeps: {
	include: ['@mux/mux-player-react'],
    },
    build: {
	sourcemap: false,
	commonjsOptions: {
	    include: [/node_modules/],
	},
    }
})
