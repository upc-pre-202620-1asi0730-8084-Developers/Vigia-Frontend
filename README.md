# Vigía — Frontend Web Application
**Startup:** Trazza Labs  
**Curso:** 1ASI0730 — Aplicaciones Web (UPC 2026-20)  
**Módulos Implementados:** 
1. **Shared Layout & Navegación Global:** Sidebar con selector interactivo de roles, Topbar con breadcrumbs e idioma, Footer corporativo.
2. **Bounded Context BC-04:** Fleet and Device Management (Registro de Flota y Dispositivos) — Historias **US-18**, **US-19** y **TS-08** (Epic EP-08).
3. **Bounded Context BC-07:** Site Reception and Verification (Recepción y Verificación de Obra) — Historias **US-09**, **US-10** y **TS-04** (Epic EP-04 / EP-05).

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
├── site-reception-and-verification/    # BC-07: Recepción y Verificación de Obra
│   ├── domain/                         # Capa de Dominio
│   │   └── model/
│   │       ├── reception-status.js     # Enum ReceptionStatus (ARRIVED, VERIFIED_CONFORMANT, VERIFIED_DISCREPANT)
│   │       ├── reception-item.entity.js # Entidad ReceptionItem con cálculo de diferencias y conformidad
│   │       ├── supporting-evidence.entity.js # Entidad SupportingEvidence para fotos, firmas y guías
│   │       ├── reception-checklist.js  # Objeto de valor ReceptionChecklist para calidad física
│   │       └── reception.entity.js     # Aggregate Root Reception con invariantes de negocio
│   ├── infrastructure/                 # Capa de Infraestructura
│   │   ├── reception.resource.js       # DTOs de recepción, ítems y evidencias
│   │   ├── reception.assembler.js      # Mapeo bidireccional DTO <-> Entidades de dominio
│   │   └── reception-api.js            # Cliente Axios extendiendo BaseApi con endpoints RESTful
│   ├── application/                    # Capa de Aplicación
│   │   └── reception.store.js          # Store Pinia reactivo para recepciones, arribos y evidencias
│   └── presentation/                   # Capa de Presentación
│       ├── views/
│       │   └── reception-management-view.vue # Vista contenedora con selector dinámico de perspectiva
│       └── components/
│           ├── site-manager-reception-view.vue # Réplica pixel-perfect del mockup Responsable de Obra
│           ├── supervisor-reception-view.vue   # Réplica pixel-perfect del mockup Supervisor
│           ├── register-reception-dialog.vue   # Diálogo de verificación con checklist y cálculo en vivo
│           ├── report-discrepancy-dialog.vue   # Diálogo para reporte formal de incidencias/discrepancias
│           └── evidence-gallery-dialog.vue     # Visor y cargador de evidencias fotográficas (US-10)
├── locales/
│   ├── es.json                         # Diccionario en español (es_419)
│   └── en.json                         # Diccionario en inglés (en_US)
├── router.js                           # Router con guard de navegación y roles
├── main.js                             # Configuración de PrimeVue, i18n, Pinia y estilos
└── style.css                           # Variables CSS globales, tokens de diseño y reset
server/
├── db.json                             # Base de datos local simulada (vehicles, geofences, receptions, arrivals)
├── routes.json                         # Mapeo de rutas /api/v1/* -> /*
└── middleware.cjs                      # Validaciones de negocio, unicidad uq_receptions_dispatch y endpoints custom
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

### Paso 5: Ejecutar suite de pruebas de integración E2E
Con el servidor mock ejecutándose en el puerto 3000:
```bash
node test-e2e.js
```

---

## 5. Criterios de Aceptación Cubiertos

### BC-04: Fleet and Device Management

#### US-18: Registro de unidad de transporte y vinculación de GPS
- Registro de nuevas unidades con placa obligatoria (normalizada a mayúsculas y sin espacios) y capacidad máxima > 0 toneladas.
- Al confirmar el registro, la unidad se añade a la flota disponible.
- Vinculación de dispositivo GPS: si el dispositivo ya pertenece a otra unidad, el sistema rechaza la acción con código `409` e indica explícitamente a qué placa pertenece el dispositivo en conflicto.
- Tags de estado: Azul (`#1B3A5C`) para "Vinculado", Ámbar (`#F5A623`) para "Sin dispositivo" (sin usar verde ni rojo conforme a la Style Guide).

#### US-19: Definición de geocercas de almacén y obra
- Mapa interactivo con Leaflet centrado en Lima (-12.0464, -77.0428).
- El usuario hace clic en el mapa para fijar el centro; se dibuja el perímetro en vivo con el radio indicado (10 a 5000 m).
- Diferenciación cromática estricta: Azul para Almacenes y Ámbar para Obras.
- Invariante de negocio: a lo sumo una geocerca por predio y empresa (rechazo 409 si el predio ya tiene geocerca).

#### TS-08: Ingesta de telemetría satelital GPS
- Endpoint `POST /telemetry/reports`: recibe `{gpsDeviceId, latitude, longitude, timestamp}` y responde `HTTP 200`.
- Si el dispositivo no está vinculado a ninguna unidad activa, descarta el reporte y lo audita localmente como `UNASSOCIATED_TELEMETRY_EVENT` en `db.json`.

---

### BC-07: Site Reception and Verification

#### US-09: Verificación de materiales en obra con checklist digital y comparación con guía de remisión / despacho
- Interfaz dedicada para el Responsable de Obra basada fielmente en el mockup final (`4receptions.png`).
- Presenta métricas clave en la parte superior: Total Recepciones, Conformes y Discrepancias.
- Tabla de **Próximos Arribos (Upcoming Arrivals)** con origen, placa, hora estimada y botón de acción para iniciar verificación inmediata.
- Formulario modal con checklist digital de 4 criterios de calidad:
  1. Embalaje intacto y sin signos de deterioro.
  2. Sellos y precintos de seguridad intactos.
  3. Etiquetado legible y conforme a la guía de despacho.
  4. Documentación física física cotejada y firmada.
- Cotejo en tiempo real de cantidad despachada vs. cantidad recibida con barra de progreso visual de completitud y cálculo de merma/diferencia.
- Transición automática de estado: si todos los ítems coinciden y el checklist está 100% aprobado, el estado pasa a `VERIFIED_CONFORMANT`; si existen diferencias o criterios desaprobados, pasa a `VERIFIED_DISCREPANT`.
- Invariante de negocio `uq_receptions_dispatch`: solo se permite una recepción registrada por guía de despacho. Si se intenta duplicar, se responde con código HTTP 409 Conflict.

#### US-10: Registro fotográfico y documentación de evidencias en la recepción
- Módulo de evidencias fotográficas y documentales integrado (`evidence-gallery-dialog.vue`).
- Permite adjuntar fotos del estado de la carga, capturas de remisión física y firma digital del transportista.
- Cada evidencia cuenta con metadatos de timestamp, URL/base64 y tipo de documento (`PHOTO`, `WAYBILL`, `SIGNATURE`).
- Endpoint `POST /receptions/:id/evidences` para asociar evidencias a la recepción en curso o ya finalizada.

#### TS-04: Conciliación automática entre despacho y recepción en obra
- Endpoint `POST /receptions/:id/compare`: realiza la comparación algorítmica entre la guía de remisión (`dispatchQuantity`) y la recepción física (`receivedQuantity`).
- Genera reporte estructurado de conciliación con `hasDiscrepancies`, porcentaje de cumplimiento y detalle ítem por ítem.
- En la vista del Supervisor (`Modern Receptions Dashboard with Stock Alerts.png`), se identifican alertas críticas de stock y discrepancias con resaltado en filas y desglose multi-ítem en panel lateral.

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

