import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // En desarrollo, las peticiones a /api van al backend (ApiRestSpot, IIS Express).
  server: {
    proxy: {
      // Dev: el backend a veces devuelve 404 cuando no hay filas; el navegador lo pinta en rojo en consola.
      // Traducimos solo ese caso a 200 + [] (el front ya tolera lista vacía y usa fallback).
      "/api/negocios/cercanos": {
        target: "http://localhost:54512",
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
        target: "http://localhost:54512",
        changeOrigin: true,
      },
      // Auth no va bajo /api; útil si VITE_API_BASE_URL=/ y las rutas son relativas al dev server.
      "/Auth": {
        target: "http://localhost:54512",
        changeOrigin: true,
      },
      // OSRM vía espejo FOSSGIS (router.project-osrm.org suele timeout → 504 en el proxy).
      // Misma API: /routed-car/route/v1/driving/...
      "/osrm": {
        target: "https://routing.openstreetmap.de",
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/osrm/, "/routed-car"),
        timeout: 60_000,
        proxyTimeout: 60_000,
        configure(proxy) {
          proxy.on("proxyReq", (proxyReq) => {
            proxyReq.setHeader("User-Agent", "SpotFront/1.0 (local dev)")
          })
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})