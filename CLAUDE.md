# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Interactive map of Buenos Aires (CABA) showing medical institutions affiliated with Dra. Susana Vighi's diagnostic center. Users click a commune polygon to see which clinics and medical centers in that area work with Vighi.

## Running locally

No build system or package manager. Open `mapaCaba.html` directly in a browser, or serve it with any static file server:

```bash
# Python
python -m http.server 8080

# Node.js
npx serve .
```

The Google Maps API loads asynchronously via CDN in `mapaCaba.html`. The key is embedded in the `<script>` tag at the bottom of the HTML.

## Architecture

Three files contain all the logic:

- **`mapaCaba.html`** — Single HTML shell. Defines the layout (`.app-container` → `.side-panel` + `.map-wrapper`) and loads `mapa.js` before the async Google Maps script.
- **`mapa.css`** — All styles, including responsive breakpoints. Desktop: side panel at 340px left, map fills the rest. Mobile (≤768px): map fills the screen, side panel becomes a draggable bottom sheet fixed to the bottom.
- **`mapa.js`** — All application logic. No external JS dependencies beyond the Google Maps API.

### Data

Medical institution data is hardcoded in the `comunasData` object at the top of `mapa.js`. Each commune entry has:
- `nombre`, `barrios` (array of neighborhood names)
- `localidades` — array of `{ nombre, direccion, lat, lng, tipo, imagen }` objects

Only communes 1, 2, 3, 13, and 14 currently have institutions populated. Communes 4, 5, and 15 exist in `comunasData` but have empty `localidades` arrays.

`barriosGeoJson.json` contains the CABA polygon boundaries. Each GeoJSON feature has a `COMUNA` property (integer) that maps to keys in `comunasData`.

Institution photos are in `Imagenes/`. The Vighi logo (`logo_vighi.png`) is rendered onto map pin icons at runtime using a `<canvas>` element in `crearIconoPin()`.

### Map flow

1. `initMap()` (Google Maps callback) creates the map and calls `cargarGeoJSON()`.
2. `cargarGeoJSON()` loads `barriosGeoJson.json` via `map.data.loadGeoJson`, applies base polygon styles, and fits the map bounds to CABA.
3. Clicking a polygon fires `seleccionarComuna(comunaId)`, which highlights the commune, fits bounds with mobile-aware padding, drops markers via `agregarMarcadores()`, and populates the side panel via `mostrarInfoPanel()`.
4. The search input (`initBuscador()`) normalizes accents/case and filters across all `comunasData` in real time.

### Mobile bottom sheet

The `.side-panel` has `transform: translateY(calc(100% - 52px))` by default on mobile, so only the drag handle peeks above the bottom. The class `panel-abierto` removes the transform to show the full panel. Touch drag on the handle supports swipe-to-close (threshold: 80px downward).

## Adding a new institution

Add an entry to the relevant commune's `localidades` array in `mapa.js` and place the photo in `Imagenes/`. The photo is shown in the Google Maps InfoWindow when the marker is clicked (it is not shown in the side panel list).

## Brand colors

- Primary purple: `#d534db` (selected commune fill, badges, search focus)
- Dark purple: `#a020a8` (stroke, hover states, pin fill)
- Text dark: `#2c3e50`
- Text muted: `#7f8c8d`
