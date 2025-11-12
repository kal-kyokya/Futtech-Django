import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
	proxy: {
	    '/api/v2': {
		target: 'http://localhost:8000',
		changeOrigin: true,
	    },
	},
    },
    build: {
	sourcemap: false,
	commonjsOptions: {
	    include: [/node_modules/],
	},
    },
});
