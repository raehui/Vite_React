import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server:{
    open:true,
    proxy:{
      // 실제 요청시에는 api 제거되서 요청된다.
      '/api': {
        target: 'http://localhost:9000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/upload':{
        target: 'http://localhost:9000',
        changeOrigin: true
      }
    }
  }
})
