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
      // Dev: el backend a veces devuelve 404 cuando no hay filas; el navegador lo pinta en rojo en consola.
      // Traducimos solo ese caso a 200 + [] (el front ya tolera lista vacía y usa fallback).
      "/api/negocios/cercanos": {
        target: "http://localhost:53957",
        changeOrigin: true,
        selfHandleResponse: true,
        configure(proxy) {
          proxy.on("proxyRes", (proxyRes, req, res) => {
            if (proxyRes.statusCode === 404) {
              res.writeHead(200, { "Content-Type": "application/json" })
              res.end("[]")
              return
            }
            res.writeHead(proxyRes.statusCode, proxyRes.headers)
            proxyRes.pipe(res)
          })
          proxy.on("error", (_err, _req, res) => {
            if (!res.headersSent) {
              res.writeHead(502, { "Content-Type": "application/json" })
              res.end(JSON.stringify({ message: "Backend no disponible" }))
            }
          })
        },
      },
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