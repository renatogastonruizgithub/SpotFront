# GUIA PROYECTO SPOT - FRONTEND (ACTUALIZADA)

Documento actualizado para entender en profundidad el frontend de `SpotFront`, incluyendo:

- separacion de area usuario (mapa) y area admin (dashboard),
- arquitectura por rutas,
- flujo completo de render y datos,
- explicacion archivo por archivo,
- que se agrego y que se modifico recientemente.

---

## 1) Objetivo actual del frontend

El frontend hoy tiene **dos experiencias dentro del mismo proyecto React**:

1. **Usuario final**: vista de mapa para buscar negocios cercanos.
2. **Admin/Owner**: dashboard visual de gestion (estilo Neon Lounge).

La separacion se hace por **rutas URL**, no por dos repos distintos:

- `/mapa` -> experiencia usuario
- `/dashboard` -> experiencia admin

Esto permite trabajar profesionalmente con una sola base de codigo, reutilizando estilos, utilidades, API client y componentes compartidos.

---

## 2) Cambios nuevos realizados (resumen)

Se incorporo enrutamiento para separar usuario/admin dentro del mismo frontend:

1. **Se agrego dependencia**
   - `react-router-dom` en `package.json`.

2. **Se modifico `src/main.jsx`**
   - Se agrego `BrowserRouter` alrededor de `App`.

3. **Se modifico `src/App.jsx`**
   - Dejo de renderizar una sola pagina fija.
   - Ahora define rutas:
     - `/mapa` -> `MapaNegocios`
     - `/dashboard` -> `NeonDashboardPage`
     - `*` -> redireccion a `/mapa`

Resultado: ahora tenes separacion clara entre frontend de usuario y frontend admin en un mismo proyecto.

---

## 3) Estructura general del frontend

Ruta base: `src/`

- `main.jsx`: entry point de React y providers globales.
- `App.jsx`: router principal de pantallas.
- `ApiContext.jsx`: cliente HTTP compartido.
- `components/`: componentes visuales y funcionales.
- `pages/`: paginas de alto nivel (ej: dashboard).
- `hooks/`: hooks de geolocalizacion, negocio cercano, etc.
- `lib/`: utilidades (distancias, rutas OSRM, clases).
- `styles/`: estilos de modulos grandes (ej: dashboard neon).
- `index.css` y `App.css`: estilos globales base y mapa.

---

## 4) Flujo completo de la aplicacion (de punta a punta)

### 4.1 Arranque de React

1. El navegador carga la app Vite.
2. `src/main.jsx` monta React en `#root`.
3. Se aplican providers globales:
   - `StrictMode`
   - `ApiProvider`
   - `BrowserRouter`

### 4.2 Resolucion de ruta

`src/App.jsx` decide que modulo renderizar segun URL:

- si URL = `/mapa` -> renderiza modulo usuario (`MapaNegocios`)
- si URL = `/dashboard` -> renderiza modulo admin (`NeonDashboardPage`)
- si URL no existe -> redirige a `/mapa`

### 4.3 Flujo usuario (mapa)

1. Pide geolocalizacion al navegador.
2. Si obtiene posicion, centra mapa en usuario.
3. Usuario define radio (km) y presiona "Buscar".
4. Se consulta backend `GET /api/negocios/cercanos?...`.
5. Se renderizan marcadores de negocios + popup.
6. Se dibuja circulo de radio sobre mapa.

### 4.4 Flujo admin (dashboard)

1. Entra a `/dashboard`.
2. Renderiza `NeonDashboardPage`.
3. Muestra widgets visuales (stats, chart, acciones y bottom nav).
4. Actualmente usa datos mock (sin persistencia backend en esta pantalla).

---

## 5) Render y conexiones principales

### `src/main.jsx`

- **Que hace**: punto de entrada de la app.
- **Como conecta**:
  - importa estilos globales (`index.css`, Leaflet y MapLibre CSS),
  - envuelve todo con `ApiProvider` y `BrowserRouter`.
- **Por que importa**: sin este archivo no hay app montada ni rutas funcionales.

### `src/App.jsx`

- **Que hace**: router principal.
- **Como conecta**:
  - `MapaNegocios` (usuario),
  - `NeonDashboardPage` (admin),
  - redireccion de fallback.
- **Problema que resuelve**: separacion formal de experiencias dentro del mismo proyecto.

### `src/ApiContext.jsx`

- **Que hace**: abstrae `fetch` en metodos `get/post/put/delete`.
- **Como conecta**:
  - usa `VITE_API_URL` como base.
  - cualquier componente/hook puede consumir `useApi()`.
- **Detalle clave**: tolera `404` como lista vacia cuando se pide con `treat404AsEmpty`.

---

## 6) Area usuario (mapa) - explicacion completa

## 6.1 Pantalla principal usuario

### `src/components/MapaNegocios.jsx`

- **Rol**: pantalla de mapa activa para `/mapa`.
- **Estado que maneja**:
  - `posicionUsuario`
  - `negocios`
  - `radioKm`
  - `cargando`
  - `errorGeo`
  - `buscando`
- **Hooks usados**:
  - `useState`, `useEffect`, `useCallback`.
- **Flujo interno**:
  1. pide geolocalizacion (`navigator.geolocation.getCurrentPosition`)
  2. define centro por defecto si falla GPS
  3. ejecuta busqueda manual de negocios por radio
  4. renderiza mapa Leaflet con:
     - marcador usuario,
     - circulo de radio,
     - marcadores de negocios.
- **Backend**: actualmente usa `API_BASE` hardcodeado (`http://localhost:53957/api`).

> Nota tecnica: este archivo no usa `ApiContext`, llama con `fetch` directo.

---

## 6.2 Componentes de mapa (version avanzada y auxiliares)

Hay dos enfoques de mapa en el repo:

1. **Leaflet** (activo en `MapaNegocios`).
2. **MapLibre/react-map-gl** (componentes avanzados preparados).

### `src/components/mapas/MapViewGL.jsx`

- Vista avanzada con `react-map-gl/maplibre`.
- Permite:
  - seleccionar bar,
  - dibujar ruta por calles con OSRM,
  - mostrar card inferior (`BarBottomCard`),
  - abrir detalles (`BarDetailsScreen`),
  - abrir Google Maps externo para navegacion.

### `src/components/mapas/BarBottomCard.jsx`

- Card inferior contextual de un bar seleccionado.
- Muestra rating, distancia, CTA y datos visuales.

### `src/components/mapas/BarDetailsScreen.jsx`

- Pantalla de detalle de bar (modal/full overlay).
- Incluye acciones: guardar, como llegar, check-in, promos, metadata.
- Usa `localStorage` para estados locales (`saved`, puntos check-in).

### `src/components/mapas/MapControls.jsx`

- Controles de mapa (brujula/zoom de MapLibre + centrar usuario).
- Oculta controles si hay detalle abierto.

### `src/components/mapas/UserLocationMarker.jsx`

- Marker visual de usuario con estilo tipo apps de movilidad.

### `src/lib/osrmRoute.js`

- Llama servicio OSRM para ruta por calles.
- En dev usa proxy `/osrm`; en prod usa `VITE_OSRM_URL` o fallback publico.

### `src/lib/geo.js`

- Utilidades geograficas:
  - Haversine (`distanceMeters`),
  - formato de distancia (`formatDistanceFromUser`),
  - LineString GeoJSON.

---

## 6.3 Componentes/archivos de mapa legacy o alternativos

Siguen en el repo y sirven para pruebas/referencia:

- `src/components/mapas/MapView.jsx`: version Leaflet con tracker de distancia.
- `src/components/mapas/MapMarkers.jsx`: wrapper simple de marker+popup.
- `src/components/serch/Serch.jsx`: barra superior de busqueda por radio.
- `src/hooks/obtenerUbicacionGps.js`: hook de GPS con soporte `VITE_DEV_LAT/LNG`.
- `src/hooks/ejecutarNegociosCercanos.js`: hook que dispara callback cada X metros caminados.
- `src/hooks/getNegocios.js`: hook API robusto para negocios (normaliza shape y fallback de cercania).

---

## 7) Area admin (dashboard) - explicacion completa

### `src/pages/NeonDashboardPage.jsx`

- **Rol**: pagina principal de `/dashboard`.
- **Composicion**:
  - `Header`
  - grilla de `StatsCard`
  - `WeeklyChart`
  - lista de `ActionCard`
  - `BottomNav` (dashboard).
- **Datos**: usa arreglos mock `STATS` y `ACTIONS` dentro del archivo.

### `src/components/dashboard/Header.jsx`

- Encabezado del local (titulo, estado verificado, saludo, acciones de iconos).

### `src/components/dashboard/StatsCard.jsx`

- Tarjetas KPI reutilizables con color de acento configurable.

### `src/components/dashboard/WeeklyChart.jsx`

- Grafico de barras mock semanal (sin libreria pesada).

### `src/components/dashboard/ActionCard.jsx`

- CTA visual para acciones rapidas de gestion.

### `src/components/dashboard/BottomNav.jsx`

- Navegacion inferior visual de 5 items para dashboard.

### `src/components/dashboard/neonUtils.js`

- Helper para convertir color HEX a tupla RGB y alimentar estilos neon.

### `src/styles/neon-dashboard.css`

- Estilos del dashboard:
  - fondo degradado,
  - glassmorphism,
  - glow neon,
  - microanimaciones.

---

## 8) Estilos globales y sistema UI

### `src/index.css`

- Configura Tailwind v4 + tema base (variables `--color-*`, radios, tipografia Geist).
- Define base de tema claro/oscuro.

### `src/App.css`

- Reglas globales de layout y estilos de mapa:
  - altura completa,
  - ajustes controles maplibre,
  - estilos marcador usuario,
  - scrollbars personalizadas,
  - animaciones de sheets/modales.

### `src/components/ui/*`

- Set de componentes base tipo shadcn/radix (button, card, input, carousel, etc.).
- Son reutilizables y desacoplan UI base de la logica de negocio.

---

## 9) Navegacion/rutas actuales

Rutas activas en `App.jsx`:

- `/mapa` -> usuario (mapa)
- `/dashboard` -> admin (dashboard)
- `*` -> redireccion a `/mapa`

## Como probar rapido

1. `npm run dev`
2. abrir:
   - `http://localhost:5173/mapa`
   - `http://localhost:5173/dashboard`

---

## 10) Conexion con backend y APIs

### Configuracion de Vite

`vite.config.js` define proxies:

- `/api` -> backend local `http://localhost:53957`
- `/api/negocios/cercanos` -> manejo especial de 404 como `[]`
- `/osrm` -> `https://router.project-osrm.org`

### Cliente API central

`ApiContext.jsx` unifica llamadas HTTP y manejo de errores.

### Estado actual de integracion

- Modulo mapa `MapaNegocios.jsx` usa `fetch` directo con `API_BASE` local.
- Hooks mas desacoplados (`useGetNegocios`) ya estan preparados para usar `ApiContext`.

Recomendacion profesional: unificar todo el consumo de API en `ApiContext`/`services`.

---

## 11) Organizacion profesional actual (usuario + admin)

Actualmente ya hay separacion funcional por rutas. La organizacion profesional aplicada fue:

1. **Un solo proyecto frontend** (rapido de mantener).
2. **Dos modulos funcionales separados por URL**.
3. **Entry point unico con providers globales**.
4. **Composicion por componentes reutilizables**.
5. **Base de estilos compartida + estilos especificos por modulo**.

Esto es correcto para etapa MVP y crecimiento inicial.

---

## 12) Que se agrego / que se modifico (detalle puntual)

### Agregado

- Dependencia `react-router-dom`.

### Modificado

- `src/main.jsx`
  - agregado `BrowserRouter`.
- `src/App.jsx`
  - agregado sistema de rutas y redireccion.

### Impacto funcional

- ya no hay una sola pantalla fija;
- ahora se puede entrar directo a usuario o admin por URL;
- queda base lista para agregar auth/roles y guards en siguiente etapa.

---

## 13) Buenas practicas ya presentes

- Componentizacion clara en dashboard.
- Uso de hooks para separar comportamiento (GPS, distancia, negocios).
- Utilidades geograficas desacopladas en `lib`.
- Proxies de Vite bien definidos para dev y OSRM.
- UI base reutilizable (`components/ui`).

---

## 14) Mejoras recomendadas (siguiente paso senior)

1. Crear `AppRouter` separado en `src/routes/`.
2. Agregar autenticacion y roles (`user/admin`).
3. Proteger `/dashboard` con guard de rol.
4. Unificar llamadas HTTP en `ApiContext` (evitar `API_BASE` hardcodeado).
5. Reorganizar por features:
   - `features/user-map/...`
   - `features/admin-dashboard/...`
6. Definir carpeta `services/` con endpoints tipados.

---

## 15) Mapa mental simple del frontend

`main.jsx` -> providers globales -> `App.jsx` (router) -> elige modulo:

- **/mapa**:
  - geolocalizacion
  - busqueda por radio
  - render marcadores y popups
  - detalle/ruta (componentes avanzados preparados)

- **/dashboard**:
  - header
  - KPIs
  - actividad semanal
  - acciones rapidas
  - nav inferior

Todo dentro del mismo proyecto React, pero separado por rutas para mantener orden profesional.

---

## 16) Nota final

Esta guia refleja el estado actual del frontend con separacion usuario/admin por rutas y la estructura vigente del repositorio.

Si queres, la siguiente actualizacion la puedo dejar en version "manual tecnico" (con diagrama de carpetas final propuesta + checklist de migracion a estructura `features/` paso a paso).

# Guía del proyecto Spot (frontend + backend)

Documento pensado para entender **qué es Spot**, **cómo está armado**, **qué hace cada parte** y **cómo encajan el front y la API**. Podés usarlo como apuntes paso a paso.

---

## 1. Idea del producto de spot 

**Problema:** La gente que quiere salir de noche no tiene un solo lugar donde ver, para cada bar, ambiente, música, promos y qué pasa esa noche; la info está repartida en redes, Google Maps y boca a boca.

**Solución Spot:** Una app que **centralice** la información y permita **descubrir bares cercanos** y decidir rápido a cuál ir.

**Estado actual del código:** Tenés un **mapa con búsqueda por radio** y datos de negocios desde una **API en C#**. Funciones “grandes” del producto (promos en vivo, eventos de la noche, etc.) pueden apoyarse en tablas/modelo que ya existan en base, pero **la UI principal hoy es el mapa + API de negocios/usuarios**.

---

## 2. Arquitectura general (cómo se conecta todo)

```
[ Navegador: React + mapa ]
        |
        |  HTTP GET /api/negocios/cercanos?lat=&lng=&radioKm=
        |  (en desarrollo: Vite hace de “puente” hacia el puerto del IIS Express)
        v
[ ASP.NET Web API (.NET Framework) ]
        |
        |  Entity Framework 6 + EDMX (Database First)
        v
[ SQL Server: base `Spot`, tablas negocio, usuario, etc. ]
```

- **Frontend:** app web en tu PC, suele correr en `http://localhost:5173` (Vite).
- **Backend:** API en `http://localhost:53957` (puerto típico de IIS Express; puede variar según el `.csproj`).
- **Base de datos:** SQL Server; la cadena de conexión está en `Web.config` del backend (`SpotEntities`).

---

## 3. Stack tecnológico

### Frontend (`SpotFront`)

| Tecnología | Para qué sirve |
|------------|----------------|
| **Vite** | Empaqueta y sirve el proyecto en desarrollo (`npm run dev`). |
| **React 19** | Interfaz por componentes. |
| **Leaflet + react-leaflet** | Mapa interactivo (OpenStreetMap). |
| **Tailwind CSS** | Estilos utilitarios. |
| **Componentes tipo shadcn** (`components/ui`) | Botones, inputs, etc. |
| **Variables `VITE_*`** | Configuración (`.env`), por ejemplo URL base de la API. |

### Backend (`spotBackend` / `WebApplication1`)

| Tecnología | Para qué sirve |
|------------|----------------|
| **ASP.NET Web API 2** | Expone rutas REST (`/api/...`). |
| **Entity Framework 6** | Acceso a datos. |
| **EDMX (`spotModel.edmx`)** | Modelo **Database First**: el esquema viene de SQL Server. |
| **SQL Server + tipo `geography`** | Guarda la ubicación de cada negocio y calcula distancias. |
| **Swagger** | Documentación y prueba de endpoints en el navegador. |
| **Newtonsoft.Json** | Serialización JSON en la API. |

---

## 4. Frontend — estructura de carpetas (qué contiene cada cosa)

Ruta base: `SpotFront/src/`

| Ruta | Contenido |
|------|-----------|
| `main.jsx` | Entrada de la app: monta React, importa estilos globales y Leaflet, envuelve todo en `ApiProvider`. |
| `App.jsx` | Pantalla principal: estado de la lista de bares, ubicación, búsqueda y mapa. |
| `ApiContext.jsx` | Cliente HTTP (`get`, `post`, etc.) usando `fetch` y `VITE_API_URL`. |
| `index.css` / `App.css` | Estilos globales y del layout. |
| `hooks/getNegocios.js` | Funciones que llaman a la API de negocios (listar, uno por id, **cercanos**). |
| `hooks/obtenerUbicacionGps.js` | Obtiene lat/lng con `navigator.geolocation`. Opcional: coords fijas con `VITE_DEV_LAT` / `VITE_DEV_LNG` en `.env` para pruebas sin GPS real. |
| `hooks/negociosCercanos.js` | Hook auxiliar con fórmula Haversine (distancia); puede usarse para filtrar en cliente si hiciera falta. |
| `components/mapas/MapView.jsx` | Mapa Leaflet: usuario + marcadores de bares. |
| `components/mapas/MapMarkers.jsx` | Un marcador + popup de texto. |
| `components/mapas/MapControls.jsx` | Botones zoom +/- y centrar en el usuario. |
| `components/serch/Serch.jsx` | Barra superior: radio en km + botón de búsqueda. |
| `components/cards/NegociosCards.jsx` | Carrusel de tarjetas de bares (preparado para otro formato de datos; hoy suele estar comentado en `App.jsx`). |
| `components/navegation/bottomNavegation.jsx` | Barra inferior (Explorar, Mapa, Promos, etc.); hoy es más visual que funcional. |
| `components/ui/*` | Botones, inputs, card, carousel, etc. (patrón shadcn). |
| `lib/utils.ts` | Utilidades (por ejemplo `cn` para clases CSS). |

Archivos en la raíz del proyecto:

| Archivo | Uso |
|---------|-----|
| `.env` | `VITE_API_URL`, opcional `VITE_DEV_LAT` / `VITE_DEV_LNG`. |
| `vite.config.js` | Plugin React, Tailwind, alias `@` → `src`, **proxy `/api` → backend** (evita CORS en desarrollo). |
| `package.json` | Scripts `dev`, `build`, dependencias. |

---

## 5. Frontend — flujo paso a paso (cómo funciona la pantalla del mapa)

1. **`main.jsx`** renderiza `<App />` dentro de `<ApiProvider>` para que cualquier componente pueda usar `useApi()` / hooks que llamen a la API.
2. **`obtenerUbicacionGps`** pide permiso de ubicación (o usa coords de desarrollo si configuraste `.env`).
3. Cuando ya hay posición, **`App.jsx`** hace una **primera búsqueda automática** a **10 km** de radio (una sola vez al inicio).
4. El usuario puede cambiar el **radio en km** en **`Serch`** y pulsar el ícono de lupa: se llama otra vez a la API con ese radio.
5. **`getNegocios.js`** arma la URL:  
   `GET {VITE_API_URL}negocios/cercanos?lat=...&lng=...&radioKm=...`  
   Con `VITE_API_URL=/api/`, en desarrollo Vite reenvía eso al backend en el puerto 53957.
6. La respuesta es un **array JSON** de negocios con `id_negocio`, `razon_social`, `lat`, `lng`, `distancia`, etc.
7. **`App.jsx`** guarda ese array en el estado `bars` y lo pasa a **`MapView`**.
8. **`MapView`** dibuja un marcador del usuario y uno por cada bar con coords válidas; el texto del popup incluye nombre y distancia.

**Importante:** La búsqueda usa **tu posición actual** (o las coords de prueba). Si el bar está lejos de ese punto y el radio es chico, la lista puede venir vacía aunque el bar exista en la base.

---

## 6. Backend — estructura principal

Ruta típica: `spotBackend/WebApplication1/`

| Elemento | Rol |
|----------|-----|
| `Web.config` | Cadena de conexión `SpotEntities`, `entityFramework`, handlers IIS. |
| `Global.asax.cs` | Arranque: rutas Web API, Swagger, carga de DLLs de SQL Server Types si hace falta. |
| `App_Start/WebApiConfig.cs` | Rutas Web API (`api/{controller}/{id}`), JSON con Newtonsoft. |
| `App_Start/SwaggerConfig.cs` | Swagger UI. |
| `Controllers/negociosController.cs` | API de negocios (listado, uno por id, **cercanos**, alta con `POST`, etc.). |
| `Controllers/usuariosController.cs` | Registro, listado, perfil, borrado, cambio de contraseña, etc. |
| `Dtos/` | Objetos de transferencia: qué campos entran y salen en JSON (`UsuarioDTO`, `postNegocioDto`, etc.). |
| `spotModel.edmx` + `.tt` | Modelo EF enlazado a la base `Spot`. |
| `spotModel.Context.cs` | Clase `SpotEntities` (`DbContext`): conjuntos `negocio`, `usuario`, etc. |
| Entidades `negocio.cs`, `usuario.cs`, … | Clases generadas o parciales que representan tablas. |

---

## 7. Backend — qué hace cada parte clave

### `SpotEntities` (`spotModel.Context.cs`)

- Es el **contexto de Entity Framework**.
- Hereda de `DbContext` y expone `DbSet<negocio>`, `DbSet<usuario>`, etc.
- La cadena de conexión se toma de `Web.config` con el nombre **`SpotEntities`**.

### `negociosController`

- **`GET api/negocios`** — Lista negocios (según la implementación actual, a veces devuelve lista en el primer método).
- **`GET api/negocios/{id}`** — Detalle por id.
- **`GET api/negocios/cercanos`** — Parámetros: `lat`, `lng`, `radioKm`.  
  Convierte el radio a metros, usa **`DbGeography`** y **`Distance`** en SQL para filtrar negocios con `Location` dentro del radio, ordena por distancia y limita cantidad (ej. 20).
- **`POST` con ruta `negocio/{id_user}`** — Crea un negocio asociado a un usuario **propietario**; guarda `Location` como punto geográfico.
- **`PUT` / `DELETE`** — Según versión: actualizar o borrar negocio.

### `usuariosController`

- **`GET api/usuarios`** / **`GET api/usuarios/{id}`** — Listar y ver usuario.
- **`POST api/usuarios`** — Registro con validaciones; el **rol** viene de un enum (`admin`, `cliente`, `propietario`); la contraseña se guarda **hasheada** (método tipo `HashPassword` en el controlador).
- **`PUT`**, **`DELETE`**, **`PATCH`**, cambio de contraseña, etc. — Mantenimiento de cuentas.

### DTOs

Sirven para **no exponer** directamente las entidades EF y para validar con **DataAnnotations** (`[Required]`, `[EmailAddress]`, etc.).

### Swagger

- Al ejecutar la API, suele abrirse o podés ir a la ruta de **Swagger UI** para probar métodos sin el front.

---

## 8. Cómo se “creó” el proyecto (origen típico)

No hay un único “botón mágico”, pero el flujo habitual es:

1. **Backend:** Proyecto **ASP.NET Web Application** en Visual Studio, plantilla con **Web API**, después **Entity Framework** con **modelo desde base de datos** (EDMX) apuntando a SQL Server.
2. **Frontend:** `npm create vite@latest` (o similar) con plantilla **React**, después instalar **leaflet**, **react-leaflet**, **Tailwind**, etc.
3. **Conexión:** Definir la URL de la API en `.env` y, en desarrollo, usar **proxy en Vite** hacia el mismo host/puerto donde corre IIS Express.

---

## 9. Cómo se conectan front y back (importante)

- En **desarrollo**, `VITE_API_URL=/api/` hace que el navegador llame a `http://localhost:5173/api/...` y **Vite** reenvíe a `http://localhost:53957/api/...`. Así se evita el bloqueo **CORS** entre puertos distintos.
- El backend debe estar **corriendo** (F5 en Visual Studio) en el puerto que uses en `vite.config.js` (`target`).
- **Producción:** el proxy de Vite **no existe**; ahí se suele publicar el front en un servidor estático y la API en otro dominio, configurando **CORS** en la API o un **reverse proxy** (nginx, Azure, etc.).

---

## 10. Variables de entorno del front (`.env`)

| Variable | Ejemplo | Uso |
|----------|---------|-----|
| `VITE_API_URL` | `/api/` | Prefijo de todas las llamadas HTTP. |
| `VITE_DEV_LAT` / `VITE_DEV_LNG` | coords en decimal | Opcional: fija la posición para probar sin estar en el lugar. |

Tras cambiar `.env`, hay que **reiniciar** `npm run dev`.

---

## 11. Cómo ejecutar todo (checklist)

1. **SQL Server** con la base **`Spot`** y el esquema que espera el EDMX.
2. **Backend:** abrir la solución `.sln`, **F5**. Comprobar Swagger y que la cadena de conexión en `Web.config` apunte a tu instancia (`.\SQL`, `SERVIDOR\SQL`, etc.).
3. **Frontend:** en `SpotFront`, `npm install` una vez; luego `npm run dev`.
4. Navegador: permitir **ubicación**; probar búsqueda y ver la pestaña **Red** (F12) si algo falla.

---

## 12. Qué podés extender después (línea de producto)

- Activar **`NegociosCards`** y unificar el formato de datos con el del mapa.
- Endpoints y pantallas para **promociones**, **horarios**, **eventos “esta noche”** (muchas veces ya hay tablas en el modelo EF).
- **Autenticación JWT** en la API y login en el front.
- Panel para **dueños** y **admins** (aprobar bares, etc.), si la lógica aún no está en la API que tengas hoy.

---

## 13. Resumen en una frase

**Spot** es una app de descubrimiento de bares: el **frontend React** muestra un **mapa** y pide **negocios cercanos** a la **API ASP.NET**, que consulta **SQL Server** con **Entity Framework** y **geografía** para calcular distancias.

---

*Última actualización alineada con el código en `SpotFront` y `spotBackend/WebApplication1`. Si movés carpetas o renombrás proyectos, revisá rutas y `Web.config`.*
