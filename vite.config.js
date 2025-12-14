import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // ÇÖZÜM: React Router'ın dinamik rotaları için geri dönüş (fallback) ayarı.
  // Bu, localhost'ta /article/ID gibi rotalarda 404 hatası almayı engeller.
  server: {
    historyApiFallback: true, 
  }
})