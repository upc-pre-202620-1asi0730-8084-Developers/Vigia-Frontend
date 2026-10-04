# Vigía — Frontend Web Application
**Startup:** Trazza Labs  
**Curso:** 1ASI0730 — Aplicaciones Web (UPC 2026-20)  
**Módulos Implementados:** 
1. **Shared Layout & Navegación Global:** Sidebar con selector interactivo de roles, Topbar con breadcrumbs e idioma, Footer corporativo.
2. **Bounded Context BC-04:** Fleet and Device Management (Registro de Flota y Dispositivos) — Historias **US-18**, **US-19** y **TS-08** (Epic EP-08).

---

## 1. Arquitectura y Tecnologías
- **Core:** Vue 3 (Composition API con `<script setup>`), JavaScript moderno (sin TypeScript).
- **Herramienta de Construcción:** Vite 8.
- **Estado Global:** Pinia 4.
- **Enrutamiento:** Vue Router 5 con `createWebHashHistory()` y guard global de permisos por rol (`meta.roles`).
- **Internacionalización:** Vue I18n 11 con diccionarios completos en español (`es_419`) e inglés (`en_US`). Cero textos hardcodeados.
- **Componentes UI y Estilos:** PrimeVue 5 + `@primeuix/themes` (preset personalizado acorde a la Style Guide §4.1), PrimeFlex, PrimeIcons.
- **Mapas y Geocercas:** Leaflet 1.9 + `@vue-leaflet/vue-leaflet`.
- **Tipografía:** `@fontsource/roboto` (400, 500, 700) cargada localmente para operatividad sin conexión.
- **API Mock Local:** `json-server` con middleware personalizado (`server/middleware.cjs`) que simula validaciones de negocio, rechazos HTTP 409 y webhook de telemetría GPS.

---

## 2. Tokens de Diseño (Style Guide §4.1)
- **Azul Vigía (Primario):** `#1B3A5C` (Barra lateral, encabezados, botones primarios).
- **Azul Claro:** `#3D6B94` (Hover/focus, énfasis sobre primario).
- **Ámbar (Acento):** `#F5A623` (Acciones principales, llamados a la acción con texto `#212121`).
- **Verde Éxito:** `#2E7D32` (Confirmaciones Toast de éxito).
- **Rojo Error:** `#D32F2F` (Discrepancias y errores de validación en línea).
- **Fondo / Superficie:** `#F5F5F5` / `#FFFFFF`.

---

## 3. Estructura del Proyecto (DDD)
```text
src/
├── iam/                                # BC-02 IAM (Store mínimo de autenticación y rol activo)
│   └── application/
│       └── iam.store.js
├── shared/                             # Componentes y utilidades compartidas
│   ├── infrastructure/                 # BaseApi y clientes HTTP
│   └── presentation/
│       ├── navigation.config.js        # Matriz declarativa única de navegación y roles
│       ├── components/
│       │   ├── layout.vue              # Layout principal con topbar, breadcrumb y footer
│       │   ├── sidebar.vue             # Barra lateral fija (Desktop) + Barra inferior (Mobile/Tablet) + Selector de roles
│       │   ├── language-switcher.vue   # Conmutador de idioma (ES / EN)
│       │   └── footer-content.vue      # Pie de página corporativo Vigía (Trazza Labs)
│       └── views/
│           ├── home.vue
│           ├── module-placeholder.vue  # Vistas informativas para módulos del flujo
│           └── page-not-found.vue      # Vista 404
├── fleet-and-device-management/        # BC-04: Registro de Flota y Dispositivos
│   ├── domain/                         # Capa de Dominio
│   │   └── model/
│   │       ├── vehicle.entity.js       # Entidad Aggregate Root Vehicle
│   │       ├── geofence.entity.js      # Entidad Aggregate Root Geofence
│   │       ├── location.js             # Objeto de Valor Location con fórmula de Haversine
│   │       └── geofence-type.js        # Enum GeofenceType (WAREHOUSE, JOB_SITE)
│   ├── infrastructure/                 # Capa de Infraestructura
│   │   ├── fleet-api.js                # Cliente Axios con normalización de errores {status, code, message}
│   │   ├── vehicle.assembler.js        # Mapeo DTO <-> Entidad de vehículos
│   │   └── geofence.assembler.js       # Mapeo DTO <-> Entidad de geocercas
│   ├── application/                    # Capa de Aplicación
│   │   └── fleet.store.js              # Pinia Store reactivo de flota y geocercas
│   └── presentation/                   # Capa de Presentación
│       └── views/
│           ├── transport-view.vue      # Vista contenedora con pestañas Unidades y Geocercas
│           ├── vehicle-list-view.vue   # Tabla de vehículos (desktop), Cards (mobile), Diálogos y 409
│           └── geofence-view.vue       # Mapa interactivo Leaflet con dibujo de radios perimetrales
├── locales/
│   ├── es.json                         # Diccionario en español (es_419)
│   └── en.json                         # Diccionario en inglés (en_US)
├── router.js                           # Router con guard de navegación y roles
├── main.js                             # Configuración de PrimeVue, i18n, Pinia y estilos
└── style.css                           # Variables CSS globales, tokens de diseño y reset
server/
├── db.json                             # Base de datos local simulada (vehicles, geofences)
├── routes.json                         # Mapeo de rutas /api/v1/* -> /*
└── middleware.cjs                      # Validaciones de placa duplicada, GPS asignado y telemetría TS-08
```

---

## 4. Instrucciones de Ejecución Local

### Paso 1: Instalar dependencias (solo si es la primera vez)
```bash
npm install
```

### Paso 2: Iniciar servidor API simulado (`json-server`)
En una terminal:
```bash
npm run server
```
*El servidor mock se ejecutará en `http://localhost:3000/api/v1`.*

### Paso 3: Iniciar la aplicación web (`Vite`)
En otra terminal:
```bash
npm run dev
```
*Abre tu navegador en: **`http://localhost:5173/`***

### Paso 4: Compilar para producción
```bash
npm run build
```

---

## 5. Criterios de Aceptación Cubiertos

### US-18: Registro de unidad de transporte y vinculación de GPS
- Registro de nuevas unidades con placa obligatoria (normalizada a mayúsculas y sin espacios) y capacidad máxima > 0 toneladas.
- Al confirmar el registro, la unidad se añade a la flota disponible.
- Vinculación de dispositivo GPS: si el dispositivo ya pertenece a otra unidad, el sistema rechaza la acción con código `409` e indica explícitamente a qué placa pertenece el dispositivo en conflicto.
- Tags de estado: Azul (`#1B3A5C`) para "Vinculado", Ámbar (`#F5A623`) para "Sin dispositivo" (sin usar verde ni rojo conforme a la Style Guide).

### US-19: Definición de geocercas de almacén y obra
- Mapa interactivo con Leaflet centrado en Lima (-12.0464, -77.0428).
- El usuario hace clic en el mapa para fijar el centro; se dibuja el perímetro en vivo con el radio indicado (10 a 5000 m).
- Diferenciación cromática estricta: Azul para Almacenes y Ámbar para Obras.
- Invariante de negocio: a lo sumo una geocerca por predio y empresa (rechazo 409 si el predio ya tiene geocerca).

### TS-08: Ingesta de telemetría satelital GPS
- Endpoint `POST /telemetry/reports`: recibe `{gpsDeviceId, latitude, longitude, timestamp}` y responde `HTTP 200`.
- Si el dispositivo no está vinculado a ninguna unidad activa, descarta el reporte y lo audita localmente como `UNASSOCIATED_TELEMETRY_EVENT` en `db.json`.

---

## 6. Apartados Compartidos (Shared)

1. **Barra Lateral (Sidebar):**
   - **Desktop (>960px):** Menú lateral fijo de 256px con fondo `#1B3A5C`.
   - **Mobile/Tablet (<960px):** Barra inferior de 64px con 4 accesos principales y botón "Más" modal.
   - **Selector de Rol Integrado:** Permite cambiar instantáneamente entre **Supervisor (Admin)**, **Responsable de almacén** y **Responsable de obra**, filtrando en tiempo real la lista de opciones accesibles.
2. **Migas de Pan (Breadcrumb):**
   - Ubicadas en el topbar, proporcionan navegación de retorno clara hacia el inicio o módulo actual.
3. **Selector de Idioma:**
   - Permite alternar en tiempo real entre Español e Inglés sin recargar la página.
4. **Pie de Página Corporativo:**
   - Presenta la marca Vigía y Trazza Labs de manera sobria y profesional.
