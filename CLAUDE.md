# CLAUDE.md

Este archivo proporciona orientación a Claude Code (claude.ai/code) al trabajar con el código de este repositorio.

## Qué es este proyecto

Una aplicación web estática de una sola página — un mapa interactivo de Buenos Aires que muestra centros de salud (sanatorios, centros médicos y consultorios externos) asociados al Centro de Diagnóstico Susana Vighi SRL. El usuario selecciona una categoría y luego puede explorar los centros por comuna o buscarlos por nombre o dirección.

## Cómo ejecutar

No requiere compilación. Abrir `index.html` directamente en un navegador. La app necesita conexión a internet para la API de Google Maps JavaScript.

## Arquitectura

**Punto de entrada:** `index.html` — define el menú inicial de selección de categoría, el contenedor del mapa y el panel lateral.

**Lógica principal:** `mapa.js` — maneja todo: inicialización de Google Maps, capa GeoJSON de comunas, creación de marcadores, búsqueda, renderizado del panel lateral, ventanas de información y comportamiento responsive móvil (bottom-sheet con gestos de arrastre).

**Archivos de datos:**
- `consultorios.js` — datos de consultorios externos estructurados como `comunasData[1..15]`, cada uno con `{ nombre, barrios, localidades: [...] }`. Cada centro tiene `{ nombre, direccion, lat, lng, tipo, imagen? }`.
- `sanatorios.js` — misma estructura para sanatorios y centros médicos.
- `barriosGeoJson.json` — límites GeoJSON de las 15 comunas de Buenos Aires (663 KB, no editar manualmente).

**Imágenes:** `Imagenes/` — logos y fotos de los centros referenciados por nombre de archivo en los objetos de datos.

## Patrones clave

- **Toggle de categoría:** El menú establece una variable global que controla cuál archivo de datos (`comunasData` de `consultorios.js` o `sanatorios.js`) está activo. Ambos archivos exportan al mismo nombre global.
- **Normalización de búsqueda:** Se eliminan tildes y se convierte a minúsculas — usar el helper `normalizarTexto()` existente para cualquier nueva lógica de búsqueda.
- **Agregar un centro:** Añadir una entrada al array `comunasData[N].localidades` correspondiente en `consultorios.js` o `sanatorios.js`. Las coordenadas (`lat`, `lng`) deben ser valores GPS válidos de Buenos Aires. El campo `imagen` es opcional; si se incluye, el archivo debe existir en `Imagenes/`.
- **Comunas:** Buenos Aires tiene 15 comunas (numeradas 1–15). Todos los datos están indexados por ese número.
