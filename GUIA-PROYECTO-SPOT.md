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
- **`POST api/usuarios`** — Registro con validaciones; el **rol** viene de un enum (`cliente`, `propietario`); la contraseña se guarda **hasheada** (método tipo `HashPassword` en el controlador).
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
- Panel para **dueños** (aprobar y gestionar bares), si la lógica aún no está en la API que tengas hoy.

---

## 13. Resumen en una frase

**Spot** es una app de descubrimiento de bares: el **frontend React** muestra un **mapa** y pide **negocios cercanos** a la **API ASP.NET**, que consulta **SQL Server** con **Entity Framework** y **geografía** para calcular distancias.

---

*Última actualización alineada con el código en `SpotFront` y `spotBackend/WebApplication1`. Si movés carpetas o renombrás proyectos, revisá rutas y `Web.config`.*
