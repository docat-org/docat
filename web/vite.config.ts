import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  return {
    base: '/',
    plugins: [react()],
    assetsInclude: ['**/*.md'],
    server: {
      port: 8080,
      proxy: {
        '/api': {
          target: 'http://localhost:' + `${env.VITE_PROXY_PORT ?? '5000'}`,
          changeOrigin: true,
          secure: false
        },
        '/doc': {
          target: 'http://localhost:' + `${env.VITE_PROXY_PORT ?? '5000'}`,
          changeOrigin: true,
          secure: false
        }
      }
    },
    test: {
      globals: true,
      environment: 'jsdom',
      css: true,
      reporters: ['verbose'],
      coverage: {
        reporter: ['text', 'json', 'html'],
        include: ['src/**/*'],
        exclude: []
      }
    }
  }
})
