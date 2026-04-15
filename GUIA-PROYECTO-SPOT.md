# GUIA PROYECTO SPOT (estado actual)

Esta guia describe el estado real del proyecto `SpotFront` hoy: que hace cada carpeta, que hace cada archivo importante, cual es el flujo de datos, que parte esta activa en produccion y que parte quedo legacy.

---

## 1) Objetivo del frontend

Spot es una app para descubrir bares cercanos.

La experiencia activa actual es:
- obtener ubicacion del usuario;
- buscar negocios cercanos en API;
- mostrar bares en mapa;
- ver card resumida y pantalla de detalle del bar;
- ruta visual interna por calles (OSRM).
  - Nota: el boton "Cómo llegar" esta bloqueado por ahora (no abre navegacion externa).

La parte administrativa (dashboard para propietario) existe en otro proyecto del ecosistema Spot, no en este repositorio `SpotFront`.

---

## 2) Arquitectura general

```txt
Usuario (navegador)
   -> React + Vite (SpotFront)
   -> GET /api/negocios/cercanos?lat=...&lng=...&radioKm=...
   -> API ASP.NET (backend)
   -> SQL Server (negocios, usuarios, ubicaciones)
```

En desarrollo:
- Vite corre en `http://localhost:5173`
- El backend suele correr en `http://localhost:53957`
- `vite.config.js` hace proxy `/api` y `/osrm` para evitar CORS.

---

## 3) Flujo completo de la app (paso a paso)

1. `index.html` carga `src/main.jsx`.
2. `src/main.jsx` monta React, importa estilos globales, y envuelve app con `ApiProvider`.
3. `src/App.jsx`:
   - llama a `obtenerUbicacionGps` para lat/lng del usuario;
   - dispara busqueda inicial una sola vez (`VITE_MAPA_RADIO_KM`, default 10 km);
   - guarda resultados en estado `bars`;
   - renderiza `MapViewGL` + `BottomNav`.
4. `src/hooks/getNegocios.js` hace la llamada a `negocios/cercanos` y normaliza datos.
5. `src/components/mapas/MapViewGL.jsx`:
   - muestra marcador del usuario;
   - muestra marcador por cada bar;
   - al seleccionar bar abre `BarBottomCard`;
   - al abrir detalle muestra `BarDetailsScreen`;
   - pide ruta por calles con `fetchOsrmRoute`.
6. `src/lib/osrmRoute.js` llama a OSRM y devuelve GeoJSON para pintar la linea en el mapa.

---

## 4) Estructura de carpetas y que hace cada una

## Raiz del proyecto

- `src/`: codigo fuente frontend.
- `public/`: assets publicos servidos tal cual.
- `dist/`: salida de build de produccion.
- `node_modules/`: dependencias instaladas.

Archivos de configuracion en raiz:
- `package.json`: scripts y dependencias.
- `vite.config.js`: config Vite, alias `@`, proxy API/OSRM.
- `eslint.config.js`: reglas de lint.
- `postcss.config.js` y `postcss.config.cjs`: config PostCSS/Tailwind (hay duplicidad legacy).
- `tsconfig.json`: alias de paths para tooling (`@/*`).
- `components.json`: config de shadcn/ui.
- `index.html`: HTML base del frontend.
- `.env`: variables de entorno (`VITE_*`).
- `.gitignore`: exclusiones git.

## `src/`

- `main.jsx`: entrypoint React.
- `App.jsx`: shell principal de la app mapa.
- `ApiContext.jsx`: cliente HTTP compartido (`get`, `post`, `put`, `delete`).
- `index.css`: base Tailwind + tema/tokens.
- `App.css`: estilos especificos de mapa, markers, paneles y animaciones.
- `assets/`: assets locales (ejemplo: `react.svg`, hoy no usado).

## `src/hooks/`

- `getNegocios.js`: acceso API de negocios + normalizacion de payload.
- `obtenerUbicacionGps.js`: geolocalizacion (real o por variables de entorno).
- `ejecutarNegociosCercanos.js`: hook de distancia acumulada (legacy, no activo en flujo principal).

## `src/lib/`

- `geo.js`: funciones de geografia (Haversine, formato distancia, LineString).
- `osrmRoute.js`: integra OSRM para generar ruta por calles.
- `utils.ts`: helper `cn(...)` para combinar clases CSS.

## `src/components/`

- `mapas/`: componentes del mapa y UX principal.
- `navegation/`: barra de navegacion inferior.
- `cards/`: tarjetas de negocio (legacy no activadas en `App.jsx`).
- `serch/`: barra de busqueda por radio (legacy no activa).
- `ui/`: componentes base reutilizables (shadcn/radix).

---

## 5) Archivo por archivo (frontend)

## Entrypoint y app

- `src/main.jsx`
  - importa `index.css`, CSS de Leaflet, CSS de MapLibre;
  - monta `<App />` dentro de `<ApiProvider>`.

- `src/App.jsx`
  - estado `bars`;
  - usa `useGetNegocios()` y `obtenerUbicacionGps()`;
  - hace busqueda inicial automatica de cercanos;
  - renderiza `MapViewGL` y `BottomNav`.

- `src/ApiContext.jsx`
  - abstrae `fetch` en metodos `get/post/put/delete`;
  - usa `VITE_API_URL`;
  - soporta `treat404AsEmpty` para convertir ciertos 404 en `[]`.

## Hooks

- `src/hooks/getNegocios.js`
  - endpoints de negocios;
  - normaliza campos del backend (`lat`, `lng`, etc.);
  - fallback: si `cercanos` no devuelve lista util, intenta `GET /negocios` y filtra por Haversine.

- `src/hooks/obtenerUbicacionGps.js`
  - usa `navigator.geolocation.watchPosition`;
  - permite override de ubicacion con `VITE_DEV_LAT` y `VITE_DEV_LNG`.

- `src/hooks/ejecutarNegociosCercanos.js`
  - trackea distancia recorrida y dispara callback por umbral;
  - actualmente no participa del flujo principal.

## Mapa (flujo activo)

- `src/components/mapas/MapViewGL.jsx` (ACTIVO)
  - mapa principal con MapLibre;
  - markers de usuario y bares;
  - seleccion de bar;
  - muestra card inferior y detalle;
  - dibuja ruta GeoJSON al bar seleccionado.

- `src/components/mapas/MapControls.jsx` (ACTIVO)
  - controles de mapa (brujula + boton centrar usuario).

- `src/components/mapas/UserLocationMarker.jsx` (ACTIVO)
  - visual del punto de usuario.

- `src/components/mapas/BarBottomCard.jsx` (ACTIVO)
  - card resumida del bar seleccionado.

- `src/components/mapas/BarDetailsScreen.jsx` (ACTIVO)
  - pantalla/modal de detalle;
  - favoritos y puntos en `localStorage`;
  - botones de accion (guardar, check-in; "Cómo llegar" bloqueado por ahora).

## Componentes legacy (presentes, pero no activos en App principal)

- `src/components/mapas/MapView.jsx`
  - version anterior con Leaflet.

- `src/components/mapas/MapMarkers.jsx`
  - helper de markers para `MapView.jsx`.

- `src/components/MapaNegocios.jsx`
  - implementacion alternativa antigua con Leaflet y fetch directo.

- `src/components/cards/NegociosCards.jsx`
  - carrusel de cards de negocios.

- `src/components/serch/Serch.jsx`
  - input para radio + boton de busqueda.

## Navegacion y UI base

- `src/components/navegation/bottomNavegation.jsx` (ACTIVO visualmente)
  - barra inferior con tabs (Promos, Mapa, Perfil);
  - hoy no cambia de pantalla, solo emite `onChange`.

- `src/components/ui/*.tsx`
  - libreria de componentes base: `button`, `card`, `input`, `carousel`, etc.
  - usados por pantallas y cards para consistencia visual.

## Utilidades y estilos

- `src/lib/geo.js`
  - calculo distancia en metros y formateo.

- `src/lib/osrmRoute.js`
  - llamada a OSRM y retorno de Feature GeoJSON.

- `src/lib/utils.ts`
  - `cn` para merge de clases.

- `src/index.css`
  - Tailwind v4 + tokens de diseno + modo dark.

- `src/App.css`
  - layout de mapa, posicion de controles, animaciones, estilos de markers y scroll.

---

## 6) Variables de entorno (.env)

Variables usadas en frontend:

- `VITE_API_URL`
  - Ejemplo: `/api/`
  - Prefijo para llamadas HTTP en `ApiContext`.

- `VITE_MAPA_RADIO_KM`
  - Radio inicial de busqueda en `App.jsx`.
  - Si falta o es invalido, default = `10`.

- `VITE_DEV_LAT`
- `VITE_DEV_LNG`
  - Coordenadas fijas para pruebas sin GPS real.

- `VITE_OSRM_URL` (opcional en produccion)
  - Base URL de OSRM fuera de desarrollo.

Nota: al cambiar `.env`, reiniciar `npm run dev`.

---

## 7) Conexion front-back (desarrollo y produccion)

## Desarrollo

- El front llama, por ejemplo: `/api/negocios/cercanos?...`
- Vite reenvia al backend (`http://localhost:53957`) por proxy.
- Para rutas OSRM, el front llama `/osrm/...` y Vite reenvia a `https://router.project-osrm.org`.

## Produccion

- El proxy de Vite no existe.
- Debe existir:
  - o una URL real en `VITE_API_URL` y `VITE_OSRM_URL`,
  - o un reverse proxy en infraestructura.

---

## 8) Scripts principales

En `package.json`:

- `npm run dev` -> arranca entorno local.
- `npm run build` -> genera build de produccion en `dist/`.
- `npm run preview` -> sirve build local.
- `npm run lint` -> corre ESLint.

---

## 9) Estado del proyecto (activo vs legacy)

## Activo en flujo principal

- `main.jsx`
- `App.jsx`
- `ApiContext.jsx`
- `hooks/getNegocios.js`
- `hooks/obtenerUbicacionGps.js`
- `components/mapas/MapViewGL.jsx`
- `components/mapas/MapControls.jsx`
- `components/mapas/BarBottomCard.jsx`
- `components/mapas/BarDetailsScreen.jsx`
- `components/mapas/UserLocationMarker.jsx`
- `components/navegation/bottomNavegation.jsx`
- `lib/geo.js`
- `lib/osrmRoute.js`
- `lib/utils.ts`
- `index.css`
- `App.css`

## Legacy (en repo, pero no usados por `App.jsx` actual)

- `components/mapas/MapView.jsx`
- `components/mapas/MapMarkers.jsx`
- `components/MapaNegocios.jsx`
- `components/cards/NegociosCards.jsx`
- `components/serch/Serch.jsx`
- `hooks/ejecutarNegociosCercanos.js`
- `src/assets/react.svg` y `public/vite.svg` (assets de plantilla)

---

## 10) Checklist rapido para correr y validar

1. Backend corriendo en el puerto configurado en `vite.config.js`.
2. Front:
   - `npm install`
   - `npm run dev`
3. Dar permisos de ubicacion en navegador.
4. Confirmar en pantalla:
   - aparece marcador de usuario;
   - se cargan bares cercanos;
   - al tocar un bar abre card/detalle;
   - se dibuja ruta al bar seleccionado.

---

## 11) Resumen ejecutivo

SpotFront hoy es una app React orientada a experiencia de usuario en mapa, con busqueda de bares cercanos, detalle de negocio y enrutamiento visual, conectada a una API ASP.NET mediante proxy en desarrollo.

Ademas, el ecosistema Spot contempla una parte administrativa para propietarios en otro proyecto, donde un mismo usuario puede tener rol de usuario y rol de propietario cuando crea su bar.

La base esta lista para produccion del flujo mapa. El codigo legacy sigue en el repo y puede removerse en una etapa de limpieza final si se quiere reducir complejidad.

---

## 12) Definicion V1 (MVP) - Spot

La V1 de Spot sera una version basica pero funcional centrada en **Mapa**, **Promos**, **Perfil** y la base del flujo de **Propietario** (alta inicial de bar en el modulo administrativo del ecosistema). El objetivo es cerrar un flujo principal estable antes de agregar funcionalidades avanzadas.

### Objetivo de la V1

Entregar una experiencia minima util donde el usuario pueda descubrir bares cercanos desde el mapa, consultar promos basicas, gestionar un perfil simple y contemplar que un usuario tambien puede operar como propietario al crear su bar (en el proyecto administrativo), sobre una arquitectura clara y mantenible.

### Alcance (SI incluye)

1. **Mapa (flujo principal)**
   - obtener ubicacion del usuario (GPS);
   - consultar bares cercanos en API;
   - mostrar bares en mapa;
   - abrir card y detalle del bar;
   - dibujar ruta visual interna (OSRM) hacia el bar seleccionado.

2. **Promos**
   - mostrar promos activas asociadas a bares;
   - visualizar datos minimos de promo (titulo, descripcion corta, vigencia);
   - acceso a promos desde navegacion inferior o desde detalle del bar.

3. **Perfil de usuario (basico)**
   - visualizar datos basicos del usuario;
   - guardar y consultar favoritos;
   - persistencia local de acciones basicas (ejemplo: favoritos en `localStorage`).

4. **Base administrativa de propietario (en otro proyecto)**
   - contemplar el doble rol: usuario y propietario;
   - permitir alta inicial de bar para el propietario en el modulo administrativo;
   - mantener contrato de datos consistente entre SpotFront y el modulo administrativo.

### No alcance (NO incluye en V1)

- notificaciones push;
- sistema de puntos avanzado en backend;
- recomendaciones inteligentes;
- navegacion externa completa en "Como llegar";
- features de analytics/reporteria avanzada.

### Arquitectura base esperada

- frontend en React + Vite con modulos por feature (`mapas`, `promos`, `perfil`);
- consumo de API mediante capa comun (`ApiContext`) y hooks de dominio;
- separacion clara entre UI, logica de negocio y acceso a datos;
- variables de entorno definidas para API, radio y OSRM;
- mantenimiento de flujo activo y reduccion progresiva de codigo legacy.

### Criterios de aceptacion (Definition of Done V1)

La V1 se considera terminada cuando:

1. el usuario abre la app y puede otorgar permisos de ubicacion;
2. se visualizan bares cercanos en el mapa sin errores criticos;
3. al seleccionar un bar se muestran card, detalle y ruta visual;
4. el usuario puede consultar promos basicas;
5. el usuario puede guardar y ver favoritos desde perfil;
6. el flujo principal es estable y repetible en entorno local.

### Punto final de la V1

**Declaracion de cierre sugerida:**

> "La V1 de Spot queda cerrada al cumplir el flujo base de Mapa + Promos + Perfil basico, con arquitectura estable y sin errores criticos. Toda funcionalidad avanzada pasa a la siguiente iteracion."
