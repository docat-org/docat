import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react()],
  assetsInclude: ['**/*.md'],
  server: {
    port: 8080,
    proxy: {
      "/api": {
	 target: "http://localhost:5000",
	 changeOrigin: true,
	 secure: false,
      },
      "/doc": {
	target: "http://localhost:5000",
	changeOrigin: true,
        secure: false,
      }
    }
  }
})
