import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // En desarrollo, las peticiones a /api van al backend y evitan bloqueos CORS (5173 → 53957).
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:53957",
        changeOrigin: true,
      },
      // OSRM enrutamiento por calles (evita CORS en dev). Producción: VITE_OSRM_URL o proxy en el servidor.
      "/osrm": {
        target: "https://router.project-osrm.org",
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/osrm/, ""),
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})