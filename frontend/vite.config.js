import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // Accept connections from outside the container (Docker bridge network).
  // Default 127.0.0.1 would silently reject requests from the host.
  preview: {
    host: '0.0.0.0',
    port: 4173,
    strictPort: true,
  },

  server: {
    host: '0.0.0.0',
    port: 5173,
  },
})
