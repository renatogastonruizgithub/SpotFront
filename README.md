# Panel de Administración - Playa de Estacionamiento

Dashboard completo para gestionar una playa de estacionamiento construido con **Vite**, **React** y **Tailwind CSS**.

## 🚀 Características

- **Dashboard Principal**: Resumen de estadísticas clave
- **Gestión de Clientes**: CRUD completo para clientes
- **Gestión de Vehículos**: Registro y seguimiento de vehículos
- **Sistema de Tickets**: Control de entradas y salidas
- **Abonos**: Gestión de suscripciones mensuales
- **Precios**: Configuración de tarifas por tipo de vehículo
- **Tipos de Vehículo**: Categorización y capacidad de estacionamiento
- **Tipos de Tarifa**: Diferentes modalidades de cobro
- **Interfaz Responsiva**: Diseño adaptado a todos los dispositivos

## 📁 Estructura del Proyecto

```
src/
├── assets/           # Recursos estáticos
├── components/       # Componentes reutilizables
│   ├── Sidebar.jsx
│   ├── Header.jsx
│   └── StatCard.jsx
├── layouts/
│   └── DashboardLayout.jsx
├── pages/            # Páginas por entidad
│   ├── Dashboard.jsx
│   ├── Abono/
│   ├── Cliente/
│   ├── Precio/
│   ├── Ticket/
│   ├── TipoTarifa/
│   ├── TipoVehiculo/
│   └── Vehiculo/
├── App.jsx
├── main.jsx
├── index.css         # Estilos globales con Tailwind
└── App.css
```

## 🛠️ Instalación

1. **Dependencias instaladas**

2. **Ya configurado**: Tailwind CSS, React Router, Lucide Icons

## 📦 Dependencias

- **React**: ^19.2.0
- **Vite**: ^6.2.0
- **React Router**: ^7.10.1
- **Tailwind CSS**: ^4.x
- **Lucide React**: ^0.562.0 (iconos)

## 🚀 Ejecución

### Modo desarrollo
```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:5173`

### Compilar para producción
```bash
npm run build
```

### Vista previa de producción
```bash
npm run preview
```

## 📋 Rutas Disponibles

| Ruta | Página | Descripción |
|------|--------|-------------|
| `/` | Dashboard | Página principal con estadísticas |
| `/clientes` | Clientes | Gestión de clientes |
| `/vehiculos` | Vehículos | Registro de vehículos |
| `/tickets` | Tickets | Control de tickets |
| `/abonos` | Abonos | Gestión de abonos |
| `/precios` | Precios | Configuración de tarifas |
| `/tipo-vehiculo` | Tipos de Vehículo | Categorías de vehículos |
| `/tipo-tarifa` | Tipos de Tarifa | Modalidades de cobro |

## 🎨 Personalización

### Colores y Tema
Los estilos se encuentran en `tailwind.config.js` y en `src/index.css`. Puedes personalizar:

- Paleta de colores
- Tipografía
- Espaciado
- Respuesta

## 🔧 Configuración de Tailwind

El proyecto incluye configuración completa de Tailwind CSS con:
- PostCSS automático
- Autoprefixer
- Purge automático de CSS no utilizado

## 📝 Próximos Pasos

Para completar la funcionalidad:

1. **Backend**: Conectar con API REST
2. **Validación**: Implementar validación de formularios
3. **Autenticación**: Sistema de login
4. **Base de datos**: Integración con base de datos
5. **Reportes**: Generación de reportes PDF/Excel
6. **Gráficos**: Dashboards con gráficos avanzados

---

**Desarrollado con ❤️ usando Vite + React + Tailwind CSS**
