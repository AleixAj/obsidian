import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // The 3D warehouse (Three.js) is one big file, but it only downloads
    // when someone opens that page, so the warning is not useful here.
    chunkSizeWarningLimit: 1200,
  },
})
