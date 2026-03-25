# Spot — frontend

App web (**Vite + React**) para descubrir bares en un mapa y consultar negocios cercanos vía API.

## Documentación completa

Toda la explicación del producto, el frontend, el backend en C#, flujos, carpetas y cómo ejecutar el proyecto está en:

**[GUIA-PROYECTO-SPOT.md](./GUIA-PROYECTO-SPOT.md)**

## Comandos rápidos

```bash
npm install
npm run dev
```

Configuración: archivo **`.env`** (`VITE_API_URL`, opcional coords de prueba). El backend debe estar corriendo en el puerto configurado en `vite.config.js` (proxy `/api`).

## Build

```bash
npm run build
npm run preview
```
