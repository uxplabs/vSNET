import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;

          if (id.includes('recharts') || id.includes('d3-')) return 'charts-vendor';
          if (id.includes('leaflet')) return 'map-vendor';
          if (id.includes('@radix-ui')) return 'radix-vendor';
          if (id.includes('react') || id.includes('scheduler')) return 'react-vendor';

          return 'vendor';
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true, // listen on 0.0.0.0 so localhost and 127.0.0.1 both work
    port: 5174,
    strictPort: false,
    open: true,
  },
})
