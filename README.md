# Mapa de Prestadores — Dra. Susana Vighi

Mapa interactivo de prestadores de salud (sanatorios, centros médicos y consultorios externos) del Centro de Diagnóstico Dra. Susana Vighi. Permite explorar los prestadores a nivel de provincias de Argentina y visualizar información de cobertura, facturación y capacidad por región.

## Funcionalidades

El menú de inicio ofrece tres vistas:

| Vista | Descripción |
|-------|-------------|
| 🇦🇷 **Argentina** | Mapa nacional a nivel de provincias, con datos de facturación, volumen y cobertura. |
| 🚀 **Proyecto de Expansión** | Agrupa las provincias en sectores estratégicos (Sur, Cordillera, Norte, Centro, Vighi) con flechas y comparación entre sectores. |
| 📉 **El Costo de la Demora Diagnóstica** | Página informativa estática sobre el impacto económico de los retrasos diagnósticos. |

## Stack técnico

- **Vanilla JS / HTML / CSS** — sin framework, sin build tool, sin gestor de paquetes.
- **Google Maps JavaScript API v3** — renderizado del mapa, capas GeoJSON, marcadores e InfoWindows.
- **Canvas API** — generación de los íconos de los marcadores en tiempo de ejecución.

## Cómo correr el proyecto

No requiere compilación. Se puede abrir `index.html` directamente en el navegador, o servirlo con cualquier servidor estático:

```bash
# Python
python -m http.server 8080

# Node
npx serve .
```

Se despliega como **sitio estático en GitHub Pages** (incluye `.nojekyll`).

> **Nota:** Google Maps rechaza `localhost` con un error `RefererNotAllowedMapError` — el mapa solo carga en el dominio autorizado (GitHub Pages). El resto de la interfaz sí funciona en local.

## Estructura de archivos

### Aplicación

| Archivo | Rol |
|---------|-----|
| `index.html` | Shell de la app, menú de inicio, carga de los scripts y la API de Google Maps. |
| `mapa.css` | Todos los estilos. |
| `mapa-shared.js` | Infraestructura común: estado global, carga de datos, buscador, `initMap`, marcadores e InfoWindows. |
| `mapa-argentina.js` | Vista Argentina: provincias, carga del Google Sheet, etiquetas de población, facturación. |
| `mapa-expansion.js` | Proyecto de Expansión: sectores, flechas y comparación multi-sector. |
| `mapa-costo-demora.js` | Abrir/cerrar la vista estática del Costo de la Demora Diagnóstica. |

Los scripts se cargan como `<script>` globales (no son módulos ES), por lo que todas las funciones quedan en el ámbito global y pueden llamarse entre archivos.

### Datos

```
DatosJson/
├── sanatoriosExpansion.json / consultoriosExpansion.json
├── Sector Sur/         (NEUQUEN, RIO_NEGRO, CHUBUT, SANTA_CRUZ, TIERRA_DEL_FUEGO)
├── Sector Cordillera/  (MENDOZA, SAN_JUAN, LA_RIOJA, CATAMARCA)
├── Sector Norte/       (SALTA, JUJUY, CHACO, FORMOSA, CORRIENTES, MISIONES)
├── Sector Centro/      (TUCUMAN, SANTIAGO_DEL_ESTERO, ENTRE_RIOS, SANTA_FE, CORDOBA, SAN_LUIS, LA_PAMPA)
└── Sector Vighi/       (BUENOS_AIRES, CABA)

DatosGeoJson/
├── agrentinaProvincesGeoJson-simplified.json  # Provincias de Argentina
├── departamentos-buenos_aires.json
└── zonasBA.json
```

Los datos de Argentina se cargan **un archivo JSON por provincia**, agrupados por carpeta de sector. Cada archivo tiene la forma:

```json
{
  "nombre": "CORDOBA",
  "sector": "Sector Centro",
  "sanatorios": [ /* ... */ ],
  "consultorios": [ /* ... */ ]
}
```

Cada prestador dentro de esos arrays:

```json
{
  "nombre": "Hospital Privado Universitario de Córdoba",
  "direccion": "Naciones Unidas 346, Córdoba",
  "lat": -31.4422,
  "lng": -64.1991,
  "tipo": "Sanatorio",
  "prioridad": "alta",
  "imagen": "Logo/Cordoba/HospitalPrivado.jpg",
  "logo": "LogoPin/Cordoba/HospitalPrivado.jpg",
  "sector": "privado"
}
```

### Imágenes y logos

| Carpeta | Contenido |
|---------|-----------|
| `Imagenes/` | Fotos de los prestadores (mostradas en los InfoWindows). |
| `Logo/` | Logos para las imágenes de los popups. |
| `LogoPin/` | Logos usados dentro de los marcadores del mapa. |

## Arquitectura

### Nivel geográfico

**Argentina** — provincias, renderizadas con `argentinaDataLayer`. Al hacer click en una provincia se la selecciona, se la resalta, se ajustan los límites del mapa y se llena el panel lateral con los prestadores.

### Colores de prioridad de los marcadores

Los marcadores se generan con Canvas API y se colorean según prioridad:

- **Alta** → Rojo `#e74c3c`
- **Media** → Naranja `#f39c12`
- **Baja** → Verde `#27ae60`

### Estado global (en `mapa-shared.js`)

- `map` — instancia de Google Maps.
- `argentinaDataLayer` — capa GeoJSON de provincias.
- `provinciaSeleccionadaId` — provincia actualmente seleccionada.
- `marcadoresActivos` — marcadores activos (se limpian en cada nueva selección).
- `categoriaActiva` — `"sanatorios"` o `"consultorios"`.
- `regionActiva` — `"argentina"` o `"expansion"`.

### Google Sheet

La vista Argentina enriquece los prestadores con datos de un Google Sheet (publicado como CSV). El Sheet actualiza, por coincidencia de nombre, los nomencladores (QX, AMB, SALA/ENDO, CE), el sector (público/privado) y la facturación de cada prestador que ya exista en el JSON.

### Diseño responsive

- **Desktop (>768px):** panel lateral fijo de 340px + mapa a pantalla completa.
- **Mobile (≤768px):** bottom sheet con handle de arrastre y soporte de gestos de swipe.

## Comportamientos a preservar

- La Antártida se filtra del GeoJSON de Argentina (exclusión especial en la carga de la capa).
- La búsqueda es insensible a acentos (normalizada con `normalize('NFD')`).
- Los marcadores se destruyen y se vuelven a crear en cada selección de región (no hay pool/caché de marcadores).
- Los InfoWindows muestran el desglose de nomencladores con códigos de procedimientos, cantidades y totales de facturación.
