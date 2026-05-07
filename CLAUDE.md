# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Interactive map of healthcare providers (sanatoriums and external clinics) for Centro de Diagnóstico Dra. Susana Vighi. Users can explore facilities across three geographic scopes: CABA (Buenos Aires city), AMBA/GBA (Greater Buenos Aires), and all of Argentina.

## Tech Stack

- **Vanilla JS/HTML/CSS** — no framework, no build tool, no package manager
- **Google Maps JavaScript API v3** — map rendering, GeoJSON Data Layers, Markers, InfoWindows
- **Canvas API** — custom marker icon generation at runtime

## Running the App

No build step required. Open `index.html` directly in a browser, or serve it with any static file server:

```bash
# Python
python -m http.server 8080

# Node
npx serve .
```

The app is deployed as a **GitHub Pages static site** (`.nojekyll` is present).

## Architecture

### File Layout

| File | Role |
|------|------|
| `index.html` | App shell, Google Maps API script tag |
| `mapa.js` | All application logic (~1,174 lines) |
| `mapa.css` | All styles (~778 lines) |
| `sanatorios.json` / `consultorios.json` | Facilities in CABA |
| `sanatoriosAmba.json` / `consultoriosAmba.json` | Facilities in GBA |
| `sanatoriosArgentina.json` / `consultoriosArgentina.json` | Facilities nationwide |
| `barriosGeoJson.json` | CABA communes GeoJSON (648 KB) |
| `ambaGeoJson.json` | GBA partidos GeoJSON (673 KB) |
| `agrentinaGeoJson.json` | Argentina provinces GeoJSON (30 MB) |

### Three Geographic Levels

The app operates on a hierarchy:
1. **CABA** — 15 communes, rendered via `map.data` (native layer)
2. **AMBA/GBA** — 24 partidos, rendered via `ambaDataLayer`
3. **Argentina** — all provinces, rendered via `argentinaDataLayer`

Only one level's GeoJSON is visible at a time. Clicking a region selects it, highlights it, fits the map bounds, and populates the side panel with facilities.

### Two Facility Categories

`sanatorios` (sanatoriums/medical centers) and `consultorios` (external clinics). Both are loaded at startup from their respective JSON files and merged into unified data structures keyed by region ID.

### Data Format

Each JSON file maps region IDs to a `localidades` array:

```json
{
  "1": {
    "localidades": [
      {
        "nombre": "Facility Name",
        "direccion": "Address",
        "lat": -34.0,
        "lng": -58.0,
        "tipo": "Sanatorio",
        "imagen": "Imagenes/foto.jpg",
        "prioridad": "alta" | "media" | "baja",
        "nomencladores": [...]
      }
    ]
  }
}
```

### Marker Priority Colors

Markers are generated at runtime using the Canvas API with color coding:
- **Alta** → Red `#e74c3c`
- **Media** → Orange `#f39c12`
- **Baja** → Green `#27ae60`

### Global State (mapa.js)

Key globals that control app state:

- `map` — Google Maps instance
- `ambaDataLayer`, `argentinaDataLayer` — secondary GeoJSON layers
- `comunaSeleccionadaId`, `partidoSeleccionadoId`, `provinciaSeleccionadaId` — current selection per level
- `marcadoresActivos` — array of active markers (cleared on each new selection)
- `categoriaActiva` — `"sanatorios"` or `"consultorios"`
- `regionActiva` — `"caba"`, `"amba"`, or `"argentina"`

### Responsive Layout

- **Desktop (>768px)**: Fixed 340px side panel + full-screen map
- **Mobile (≤768px)**: Bottom sheet with drag handle and swipe gesture support

## Key Behaviors to Preserve

- The Antarctica-ID province must be filtered out from the Argentina GeoJSON layer — it has a special exclusion in the layer load code.
- Search is accent-insensitive (normalized with `normalize('NFD')`).
- Markers are destroyed and recreated on every region selection — there is no marker pool/cache.
- InfoWindows show a nomenclador breakdown table with medical procedure codes, quantities, and billing totals.
