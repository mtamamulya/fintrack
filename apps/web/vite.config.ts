import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server : { host: true, port: 5173 },
  build  : {
    target   : 'es2020',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          react : ['react', 'react-dom'],
          router: ['react-router-dom'],
          charts: ['recharts'],
          query : ['@tanstack/react-query'],
        },
      },
    },
  },
})
