function getSectorDeProvinciaId(provinciaId) {
  return Object.keys(sectoresExpansion).find(
    sectorId => sectoresExpansion[sectorId].provincias.includes(provinciaId)
  ) || null;
}

function getLocalidadesDeSector(sectorId) {
  const sector = sectoresExpansion[sectorId];
  const localidades = [];
  const vistas = new Set();
  sector.provincias.forEach(provId => {
    const prov = provinciasDataExpansion[provId];
    if (prov && Array.isArray(prov.localidades)) {
      prov.localidades.forEach(loc => {
        const key = `${loc.lat},${loc.lng}`;
        if (!vistas.has(key)) { vistas.add(key); localidades.push(loc); }
      });
    }
  });
  return localidades;
}

function seleccionarSector(sectorId) {
  sectorSeleccionadoId = sectorId;
  provinciaSeleccionadaId = null;
  _provinciaCentroLatLng = null;
  comunaSeleccionadaId = null;
  partidoSeleccionadoId = null;

  marcadoresActivos.forEach(m => m.setMap(null));
  marcadoresActivos = [];

  const provinciasDelSector = new Set(sectoresExpansion[sectorId].provincias);

  argentinaDataLayer.setStyle(function (feature) {
    return provinciasDelSector.has(getProvinciaId(feature)) ? ESTILO_SELECCIONADO : ESTILO_EXPANSION_BASE;
  });

  const bounds = new google.maps.LatLngBounds();
  argentinaDataLayer.forEach(feature => {
    if (provinciasDelSector.has(getProvinciaId(feature))) {
      feature.getGeometry().forEachLatLng(latLng => {
        if (latLng.lat() > -58 && latLng.lng() > -75 && latLng.lng() < -50) {
          bounds.extend(latLng);
        }
      });
    }
  });
  if (!bounds.isEmpty()) {
    const padding = esMobile()
      ? { top: 20, right: 20, bottom: Math.round(window.innerHeight * 0.72), left: 20 }
      : { top: 40, right: 40, bottom: 40, left: 40 };
    map.fitBounds(bounds, padding);
  }

  mostrarInfoPanelSector(sectorId);
  mostrarEtiquetasSector(sectorId);
  agregarMarcadores(getLocalidadesDeSector(sectorId));
}

function mostrarInfoPanelSector(sectorId) {
  const sector = sectoresExpansion[sectorId];
  const localidades = getLocalidadesDeSector(sectorId);
  const locOrdenadas = [...localidades].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));

  const localidadesHtml = locOrdenadas.length > 0
    ? locOrdenadas.map(loc => `
        <div class="localidad-item" onclick="centrarEnMarcador(${loc.lat}, ${loc.lng})">
          <strong>${loc.nombre}</strong>
          <small>📌 ${loc.direccion} &nbsp;•&nbsp; <span class="badge">${loc.tipo}</span></small>
        </div>
      `).join("")
    : `<p class="sin-datos">Sin localidades registradas para este sector.</p>`;

  document.getElementById("panelBody").innerHTML = `
    <div class="comuna-header">
      <div class="comuna-header-top">
        <h3>🚀 ${sector.nombre}</h3>
        <button class="btn-volver" onclick="volverAlListado()" title="Volver al listado">✕</button>
      </div>
      <div class="barrios-tag"><strong>Provincias:</strong> ${sector.provincias.map(p => toTitleCase(p)).join(", ")}</div>
    </div>
    <div class="seccion-titulo">Localidades de interés</div>
    ${localidadesHtml}
  `;

  abrirPanelMobile();
}
function mostrarEtiquetasSector(sectorId) {
  ocultarEtiquetasSector();
  const sector = sectoresExpansion[sectorId];
  sector.provincias.forEach(function (provId) {
    const centroide = CENTROIDES_ARGENTINA[provId];
    if (!centroide) return;
    const nombre = PROVINCIAS_DISPLAY[provId] || toTitleCase(provId);
    const { url, w, h } = crearLabelSVGNombre(nombre);
    const marker = new google.maps.Marker({
      position: centroide,
      map: map,
      icon: {
        url,
        scaledSize: new google.maps.Size(w, h),
        anchor: new google.maps.Point(w / 2, h / 2)
      },
      clickable: false,
      zIndex: 10
    });
    marcadoresSector.push(marker);
  });
}

function ocultarEtiquetasSector() {
  marcadoresSector.forEach(function (m) { m.setMap(null); });
  marcadoresSector = [];
}

// ============================================
// FLECHAS DE EXPANSIÓN (estilo mapa antiguo)
// ============================================
const RUTA_EXPANSION = [
  { lat: -34.5860921070048, lng: -58.44745685090108 }, // Sede Central Vighi — Concepción Arenal 3732, Chacarita
  { lat: -46.0,   lng: -68.5   }, // Sector Sur
  { lat: -31.0,   lng: -68.2   }, // Sector Cordillera
  { lat: -25.5,   lng: -61.0   }, // Sector Norte
  { lat: -32.0,   lng: -63.8   }, // Sector Centro
];

function generarCurva(p1, p2, factor, lado, trimStart = 0.05, trimEnd = 0.05) {
  // lado: "mar" (este/derecha) | "izquierda" (izq. del sentido de viaje)
  const n = 60;
  const midLat = (p1.lat + p2.lat) / 2;
  const midLng = (p1.lng + p2.lng) / 2;
  const dLat = p2.lat - p1.lat;
  const dLng = p2.lng - p1.lng;
  const len = Math.sqrt(dLat * dLat + dLng * dLng);
  const cpLngR = midLng + (-dLat / len) * factor * len;
  const cpLngL = midLng + ( dLat / len) * factor * len;
  const usarDerecha = lado === "izquierda" ? false
                    : lado === "oeste"     ? cpLngR < cpLngL
                    : cpLngR >= cpLngL;
  const cpLat = midLat + (usarDerecha ?  dLng : -dLng) / len * factor * len;
  const cpLng = usarDerecha ? cpLngR : cpLngL;
  const puntos = [];
  for (let i = 0; i <= n; i++) {
    const t = trimStart + (1 - trimStart - trimEnd) * (i / n);
    puntos.push({
      lat: (1 - t) * (1 - t) * p1.lat + 2 * (1 - t) * t * cpLat + t * t * p2.lat,
      lng: (1 - t) * (1 - t) * p1.lng + 2 * (1 - t) * t * cpLng + t * t * p2.lng
    });
  }
  return puntos;
}

function calcularRumbo(p1, p2) {
  const lat1 = p1.lat * Math.PI / 180;
  const lat2 = p2.lat * Math.PI / 180;
  const dLng  = (p2.lng - p1.lng) * Math.PI / 180;
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}

// Devuelve m/px para el zoom actual (lat de referencia: centro de Argentina)
function getMetersPerPixel() {
  const lat  = -35;
  const zoom = map.getZoom();
  return 156543.03392 * Math.cos(lat * Math.PI / 180) / Math.pow(2, zoom);
}

// Calcula desplazamiento perpendicular izquierdo/derecho en grados
// dLat/dLng: componentes del vector tangente (en grados); halfM: semiancho en metros
function computePerp(pt, dLat, dLng, halfM) {
  const cosLat  = Math.cos(pt.lat * Math.PI / 180);
  const tLat_m  = dLat * 111320;
  const tLng_m  = dLng * 111320 * cosLat;
  const len     = Math.sqrt(tLat_m * tLat_m + tLng_m * tLng_m);
  if (len === 0) return { left: pt, right: pt };
  // Normal perpendicular (90° CCW): (-tLng_m, tLat_m)
  const nLat_m   = -tLng_m / len;
  const nLng_m   =  tLat_m / len;
  const nLat_deg = nLat_m * halfM / 111320;
  const nLng_deg = nLng_m * halfM / (111320 * cosLat);
  return {
    left:  { lat: pt.lat + nLat_deg, lng: pt.lng + nLng_deg },
    right: { lat: pt.lat - nLat_deg, lng: pt.lng - nLng_deg }
  };
}

// Dibuja las flechas como Polígonos (shaft + punta = elemento unificado)
function dibujarFlechasPoligono() {
  flechasPoligonos.forEach(function (p) { p.setMap(null); });
  flechasPoligonos = [];
  if (regionActiva !== "expansion" || !map) return;

  const COLOR      = "#a020a8";
  const COLOR_DARK = "#6a0070";
  const mpp        = getMetersPerPixel();
  const shaftHalfM = 11 * mpp;   // semiancho del cuerpo (≈22 px visuales)
  const headHalfM  = 28 * mpp;   // semiancho de la punta (≈56 px visuales)
  const HEAD_FRAC  = 0.18;        // último 18% de los puntos = punta de flecha
  const LADOS      = ["mar", "oeste", "oeste", "mar"];

  for (let i = 0; i < RUTA_EXPANSION.length - 1; i++) {
    const puntos = generarCurva(
      RUTA_EXPANSION[i], RUTA_EXPANSION[i + 1],
      0.25, LADOS[i],
      i === 0 ? 0 : 0.05,  // trimStart: primera flecha parte del logo
      0                     // trimEnd = 0: la punta llega exactamente al destino
    );

    const n         = puntos.length - 1;
    const headStart = n - Math.round(n * HEAD_FRAC);

    // Bordes izquierdo y derecho del cuerpo (shaft)
    const leftEdge  = [];
    const rightEdge = [];
    for (let j = 0; j <= headStart; j++) {
      const prev = j === 0 ? puntos[0]   : puntos[j - 1];
      const next = j >= n  ? puntos[n]   : puntos[j + 1];
      const off  = computePerp(puntos[j], next.lat - prev.lat, next.lng - prev.lng, shaftHalfM);
      leftEdge.push(off.left);
      rightEdge.push(off.right);
    }

    // Base de la punta (más ancha)
    const hPrev   = headStart > 0 ? puntos[headStart - 1] : puntos[0];
    const hNext   = headStart < n ? puntos[headStart + 1] : puntos[n];
    const baseOff = computePerp(puntos[headStart], hNext.lat - hPrev.lat, hNext.lng - hPrev.lng, headHalfM);

    // Punta (vértice final exacto)
    const tip = puntos[n];

    // Path del polígono: borde izq → base izq → punta → base der → borde der (invertido)
    const path = [
      ...leftEdge,
      baseOff.left,
      tip,
      baseOff.right,
      ...rightEdge.slice().reverse()
    ];

    const poligono = new google.maps.Polygon({
      paths:         path,
      fillColor:     COLOR,
      fillOpacity:   0.85,
      strokeColor:   COLOR_DARK,
      strokeOpacity: 0.9,
      strokeWeight:  1.5,
      map:           map,
      zIndex:        5,
      clickable:     false
    });
    flechasPoligonos.push(poligono);
  }
}

function mostrarFlechasExpansion() {
  ocultarFlechasExpansion();

  const LADOS  = ["mar", "oeste", "oeste", "mar"];
  const ETAPAS = ["1° Etapa", "2° Etapa", "3° Etapa", "4° Etapa"];

  // 1. Flechas como polígonos (zoom-dependiente)
  dibujarFlechasPoligono();

  // 2. Etiquetas de etapa (marcadores SVG, zoom-independiente)
  for (let i = 0; i < RUTA_EXPANSION.length - 1; i++) {
    const puntos = generarCurva(
      RUTA_EXPANSION[i], RUTA_EXPANSION[i + 1],
      0.25, LADOS[i],
      i === 0 ? 0 : 0.05, 0
    );
    const midIdx   = Math.floor(puntos.length / 2);
    const midPunto = puntos[midIdx];
    const bearing  = calcularRumbo(puntos[midIdx - 1], puntos[midIdx + 1]);
    // bearing (norte=0, CW) → rotación SVG (este=0, CW)
    let svgRot = bearing - 90;
    if (svgRot >  90) svgRot -= 180;
    if (svgRot < -90) svgRot += 180;

    const cw = 160, ch = 50;
    const svgEtapa = `<svg xmlns="http://www.w3.org/2000/svg" width="${cw}" height="${ch}">
      <text x="${cw/2}" y="${ch/2 + 5}"
        font-family="Arial,sans-serif" font-size="13" font-weight="bold"
        fill="white" text-anchor="middle"
        transform="rotate(${svgRot.toFixed(1)}, ${cw/2}, ${ch/2})">${ETAPAS[i]}</text>
    </svg>`;

    const etiqueta = new google.maps.Marker({
      position: midPunto,
      map:      map,
      icon: {
        url:        "data:image/svg+xml," + encodeURIComponent(svgEtapa),
        scaledSize: new google.maps.Size(cw, ch),
        anchor:     new google.maps.Point(cw / 2, ch / 2)
      },
      clickable: false,
      zIndex:    7
    });
    flechasExpansion.push(etiqueta);
  }

  // 3. Logo en la Sede Central Vighi
  const origen = new google.maps.Marker({
    position: RUTA_EXPANSION[0],
    map:      map,
    icon: {
      url:        "logo_vighi.png",
      scaledSize: new google.maps.Size(48, 48),
      anchor:     new google.maps.Point(24, 24)
    },
    title:     "Sede Central Vighi",
    clickable: false,
    zIndex:    15
  });
  flechasExpansion.push(origen);

  // 4. Redibujar polígonos al cambiar zoom (para mantener proporción visual)
  flechaZoomListener = map.addListener("zoom_changed", function () {
    if (regionActiva === "expansion") dibujarFlechasPoligono();
  });
}

function ocultarFlechasExpansion() {
  flechasExpansion.forEach(function (f) { f.setMap(null); });
  flechasExpansion = [];
  flechasPoligonos.forEach(function (p) { p.setMap(null); });
  flechasPoligonos = [];
  if (flechaZoomListener) {
    google.maps.event.removeListener(flechaZoomListener);
    flechaZoomListener = null;
  }
}
function toggleModoMultiSector() {
  modoMultiSector = !modoMultiSector;
  sectoresComparados.clear();

  if (modoMultiSector && sectorFiltroArgentina) {
    sectoresComparados.add(sectorFiltroArgentina);
  }

  actualizarEstilosMultiSector();

  // Re-renderizar la card del sector activo
  const card = document.getElementById('sector-resumen-card');
  if (card) { card.remove(); if (sectorFiltroArgentina) mostrarResumenSector(sectorFiltroArgentina); }

  if (modoMultiSector) {
    const argCard = document.querySelector('.pob-argentina-card');
    if (argCard) argCard.style.display = 'none';
    mostrarBarraMultiSector();
  } else {
    const barra = document.getElementById('barra-multi-sector');
    if (barra) barra.remove();
  }
}

function actualizarEstilosMultiSector() {
  if (!argentinaDataLayer) return;
  argentinaDataLayer.setStyle(feature => {
    const provId = getProvinciaId(feature);
    if (modoMultiSector) {
      const enSectorSeleccionado = Array.from(sectoresComparados).some(sid =>
        sectoresExpansion[sid] && sectoresExpansion[sid].provincias.includes(provId)
      );
      return enSectorSeleccionado
        ? estiloArgentina(feature, true)
        : { fillColor: "#cccccc", fillOpacity: 0.15, strokeColor: "#aaaaaa", strokeWeight: 0.8, strokeOpacity: 0.5 };
    }
    if (sectorFiltroArgentina) {
      const enSector = sectoresExpansion[sectorFiltroArgentina] &&
                       sectoresExpansion[sectorFiltroArgentina].provincias.includes(provId);
      return enSector ? estiloArgentina(feature, true)
        : { fillColor: "#cccccc", fillOpacity: 0.2, strokeColor: "#aaaaaa", strokeWeight: 0.8, strokeOpacity: 0.5 };
    }
    return estiloArgentina(feature, false);
  });
}

function mostrarBarraMultiSector() {
  let barra = document.getElementById('barra-multi-sector');
  if (!barra) {
    barra = document.createElement('div');
    barra.id = 'barra-multi-sector';
    barra.className = 'barra-multi-sector-container';
    const card = document.getElementById('sector-resumen-card');
    if (card) card.insertAdjacentElement('afterend', barra);
    else document.getElementById('panelBody').prepend(barra);
  }

  if (sectoresComparados.size === 0) {
    barra.innerHTML = `
      <div class="multi-barra-vacia">
        <div class="multi-hint-icon">🗂️</div>
        <div class="multi-hint">Hacé click en un sector para agregarlo a la comparación</div>
      </div>`;
    return;
  }

  const fmt    = n => n > 0 ? n.toLocaleString('es-AR') : '—';
  const fmtUSD = n => n > 0 ? `USD ${n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—';

  let totalPrest = 0, totalFac = 0, totalPob = 0;

  const filas = Array.from(sectoresComparados).map(sectorId => {
    const sector = sectoresExpansion[sectorId];
    const { cap, vol, facTotal, prestTotal } = calcularTotalesSector(sectorId);
    const capTotal = Object.values(cap).reduce((s, v) => s + v, 0);
    const volTotal = Object.values(vol).reduce((s, v) => s + v, 0);
    const pobEf = sector.provincias.reduce((sum, provId) => {
      const pob = POBLACION_ARGENTINA[provId] || 0;
      const cob = COBERTURA_PRIVADA[provId] || 0.65;
      return sum + (filtroSectorActivo === "privado" ? pob * cob
                  : filtroSectorActivo === "publico" ? pob * (1 - cob)
                  : pob);
    }, 0);
    const ratio = pobEf > 0 ? ((prestTotal / pobEf) * 100000).toFixed(2).replace('.', ',') : null;

    totalPrest += prestTotal;
    totalFac   += facTotal;
    totalPob   += pobEf;

    return `
      <div class="multi-prov-card">
        <div class="multi-prov-top">
          <span class="multi-prov-nombre">${sector.nombre}</span>
          <span class="multi-stat-prest" style="font-size:11px">${prestTotal} prest.</span>
        </div>
        <div class="multi-prov-stats">
          ${ratio ? `<span class="multi-stat-ratio">${ratio}/100k</span><span class="multi-stat-sep">·</span>` : ''}
          ${capTotal > 0 ? `<span class="multi-stat-vol"><span class="multi-stat-val">${fmt(capTotal)}</span> cap.</span><span class="multi-stat-sep">·</span>` : ''}
          ${volTotal > 0 ? `<span class="multi-stat-vol"><span class="multi-stat-val">${fmt(volTotal)}</span> vol.</span><span class="multi-stat-sep">·</span>` : ''}
          ${facTotal > 0 ? `<span class="multi-stat-fac">${fmtUSD(facTotal)}</span>` : ''}
        </div>
      </div>`;
  }).join('');

  const totalRatio = totalPob > 0 ? ((totalPrest / totalPob) * 100000).toFixed(2).replace('.', ',') : null;

  barra.innerHTML = `
    <div class="multi-tabla-header">
      <span>📊 Comparación de sectores</span>
      <div class="sector-filtro-mini">
        <button class="sector-filtro-mini-btn ${!filtroSectorActivo ? 'sector-filtro-mini-activo' : ''}" onclick="filtrarSectorArgentina(null)">Todo</button>
        <button class="sector-filtro-mini-btn ${filtroSectorActivo === 'privado' ? 'sector-filtro-mini-activo' : ''}" onclick="filtrarSectorArgentina('privado')">Priv.</button>
        <button class="sector-filtro-mini-btn ${filtroSectorActivo === 'publico' ? 'sector-filtro-mini-activo' : ''}" onclick="filtrarSectorArgentina('publico')">Púb.</button>
      </div>
    </div>
    <div class="multi-prov-lista">${filas}</div>
    <div class="multi-total-row">
      <span class="multi-total-label">TOTAL</span>
      <span class="multi-total-stats">
        <span class="multi-stat-prest"><strong>${totalPrest}</strong> prest.</span>
        ${totalRatio ? `<span class="multi-stat-sep">·</span><span class="multi-stat-ratio"><strong>${totalRatio}</strong>/100k</span>` : ''}
        ${totalFac > 0 ? `<span class="multi-stat-sep">·</span><span class="multi-stat-fac"><strong>${fmtUSD(totalFac)}</strong></span>` : ''}
      </span>
    </div>
    <button class="multi-btn-limpiar" onclick="sectoresComparados.clear();mostrarBarraMultiSector();actualizarEstilosMultiSector()">Limpiar selección</button>
  `;
}

