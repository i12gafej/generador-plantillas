import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/generador-plantillas/', // Nombre de tu repositorio
  server: {
    port: 5175,
    strictPort: false, // Si 5175 está ocupado, usa el siguiente disponible
    open: true // Abre el navegador automáticamente
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false
  }
})

