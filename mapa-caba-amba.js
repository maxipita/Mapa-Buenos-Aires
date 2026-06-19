// ============================================
// CARGAR GEOJSON CABA
// ============================================
function cargarGeoJSON() {
  map.data.loadGeoJson(GEOJSON_URL, null, function () {
    aplicarEstiloBase();

    if (regionActiva === "argentina" || regionActiva === "expansion") {
      map.data.setMap(null);
    }

    map.data.addListener("click", function (event) {
      const comunaId = getComunaId(event.feature);
      if (!comunaId) return;
      seleccionarComuna(comunaId);
    });

    verificarYAjustarBounds();
  });
}

// ============================================
// CARGAR GEOJSON AMBA
// ============================================
function cargarGeoJSONAmba() {
  ambaDataLayer.loadGeoJson(GEOJSON_AMBA_URL, null, function () {
    aplicarEstiloBaseAmba();
    if (regionActiva !== "argentina" && regionActiva !== "expansion") {
      ambaDataLayer.setMap(map);
    }

    ambaDataLayer.addListener("click", function (event) {
      if (regionActiva === "argentina" || regionActiva === "expansion") return;
      const partidoId = getPartidoId(event.feature);
      if (!partidoId) return;
      seleccionarPartido(partidoId);
    });

    // (Los polygons de Argentina usan el GeoJSON de departamentos BA, no este)

    verificarYAjustarBounds();
  });
}

// ============================================
// OBTENER IDs DESDE FEATURES
// ============================================
function getComunaId(feature) {
  const val = feature.getProperty("COMUNA");
  return val != null ? parseInt(val) : null;
}

function getPartidoId(feature) {
  return feature.getProperty("in1") || null;
}

// ============================================
// ESTILOS DE LAS CAPAS
// ============================================
function aplicarEstiloBase() {
  map.data.setStyle(ESTILO_BASE);
}

function aplicarEstiloBaseAmba() {
  if (ambaDataLayer) {
    ambaDataLayer.setStyle(function(feature) {
      return getEstiloZonaAmba(getPartidoId(feature), false);
    });
  }
}

// ============================================
// SELECCIONAR COMUNA (CABA)
// ============================================
function seleccionarComuna(comunaId) {
  comunaSeleccionadaId = comunaId;
  partidoSeleccionadoId = null;

  marcadoresActivos.forEach(m => m.setMap(null));
  marcadoresActivos = [];

  aplicarEstiloBaseAmba();

  map.data.setStyle(function (feature) {
    return getComunaId(feature) === comunaId ? ESTILO_SELECCIONADO : ESTILO_BASE;
  });

  const bounds = new google.maps.LatLngBounds();
  map.data.forEach(feature => {
    if (getComunaId(feature) === comunaId) {
      feature.getGeometry().forEachLatLng(latLng => bounds.extend(latLng));
    }
  });
  if (!bounds.isEmpty()) {
    const padding = esMobile()
      ? { top: 20, right: 20, bottom: Math.round(window.innerHeight * 0.72), left: 20 }
      : { top: 40, right: 40, bottom: 40, left: 40 };
    map.fitBounds(bounds, padding);
  }

  mostrarInfoPanel(comunaId);
  agregarMarcadores(getLocalidadesDeComuna(comunaId));
}

// ============================================
// SELECCIONAR PARTIDO (AMBA)
// ============================================
function seleccionarPartido(partidoId) {
  partidoSeleccionadoId = partidoId;
  comunaSeleccionadaId = null;

  marcadoresActivos.forEach(m => m.setMap(null));
  marcadoresActivos = [];

  aplicarEstiloBase();

  ambaDataLayer.setStyle(function (feature) {
    const id = getPartidoId(feature);
    return getEstiloZonaAmba(id, id === partidoId);
  });

  const bounds = new google.maps.LatLngBounds();
  ambaDataLayer.forEach(feature => {
    if (getPartidoId(feature) === partidoId) {
      feature.getGeometry().forEachLatLng(latLng => bounds.extend(latLng));
    }
  });
  if (!bounds.isEmpty()) {
    const padding = esMobile()
      ? { top: 20, right: 20, bottom: Math.round(window.innerHeight * 0.72), left: 20 }
      : { top: 40, right: 40, bottom: 40, left: 40 };
    map.fitBounds(bounds, padding);
  }

  mostrarInfoPanelPartido(partidoId);
  agregarMarcadores(getLocalidadesDePartido(partidoId));
}

// ============================================
// OBTENER LOCALIDADES
// ============================================
function getLocalidadesDeComuna(comunaId) {
  const localidades = [];
  const vistas = new Set();

  if (comunasData[comunaId]) {
    comunasData[comunaId].localidades.forEach(loc => {
      const key = `${loc.lat},${loc.lng}`;
      if (!vistas.has(key)) { vistas.add(key); localidades.push(loc); }
    });
  }

  return filtrarPorCategoria(localidades);
}

function getLocalidadesDePartido(partidoId) {
  const localidades = [];
  const vistas = new Set();

  if (partidosData[partidoId] && Array.isArray(partidosData[partidoId].localidades)) {
    partidosData[partidoId].localidades.forEach(loc => {
      const key = `${loc.lat},${loc.lng}`;
      if (!vistas.has(key)) { vistas.add(key); localidades.push(loc); }
    });
  }

  return filtrarPorCategoria(localidades);
}

// ============================================
// MOSTRAR TODOS LOS MARCADORES EN EL MAPA
// ============================================
function mostrarTodosLosMarcadores() {
  const btn = document.getElementById("btnVerTodos");

  // Si ya están visibles, los oculta
  if (marcadoresActivos.length > 0 && comunaSeleccionadaId === null && partidoSeleccionadoId === null) {
    marcadoresActivos.forEach(m => m.setMap(null));
    marcadoresActivos = [];
    if (btn) { btn.textContent = "📍 Ver todos en el mapa"; btn.classList.remove("activo"); }
    return;
  }

  comunaSeleccionadaId = null;
  partidoSeleccionadoId = null;

  marcadoresActivos.forEach(m => m.setMap(null));
  marcadoresActivos = [];

  aplicarEstiloBase();
  aplicarEstiloBaseAmba();

  // Recolectar todas las localidades filtradas
  const todasLasLocs = [];
  const vistas = new Set();

  Object.values(comunasData).forEach(comuna => {
    filtrarPorCategoria(comuna.localidades).forEach(loc => {
      const key = `${loc.lat},${loc.lng}`;
      if (!vistas.has(key)) { vistas.add(key); todasLasLocs.push(loc); }
    });
  });

  Object.values(partidosData).forEach(partido => {
    filtrarPorCategoria(partido.localidades || []).forEach(loc => {
      const key = `${loc.lat},${loc.lng}`;
      if (!vistas.has(key)) { vistas.add(key); todasLasLocs.push(loc); }
    });
  });

  if (regionActiva === "argentina" || regionActiva === "expansion") {
    Object.values(getProvinciasDataActivo()).forEach(prov => {
      filtrarPorCategoria(prov.localidades || []).forEach(loc => {
        const key = `${loc.lat},${loc.lng}`;
        if (!vistas.has(key)) { vistas.add(key); todasLasLocs.push(loc); }
      });
    });
  }

  if (todasLasLocs.length === 0) return;

  agregarMarcadores(todasLasLocs);

  if (btn) { btn.textContent = "✕ Ocultar pins"; btn.classList.add("activo"); }

  // Ajustar vista para mostrar todos los pins
  const bounds = new google.maps.LatLngBounds();
  todasLasLocs.forEach(loc => bounds.extend({ lat: loc.lat, lng: loc.lng }));
  const padding = esMobile()
    ? { top: 20, right: 20, bottom: Math.round(window.innerHeight * 0.72), left: 20 }
    : { top: 60, right: 60, bottom: 60, left: 60 };
  map.fitBounds(bounds, padding);
}
// ============================================
// MOSTRAR INFO PANEL — CABA
// ============================================
function mostrarInfoPanel(comunaId) {
  const comuna = comunasData[comunaId];
  const localidades = getLocalidadesDeComuna(comunaId);

  const nombre = comuna ? comuna.nombre : `Comuna ${comunaId}`;
  const barriosHtml = comuna
    ? `<div class="barrios-tag"><strong>Barrios:</strong> ${comuna.barrios.join(", ")}</div>`
    : "";

  const locOrdenadas = [...localidades].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
  const locFiltradas = filtrarPorSector(locOrdenadas);

  const localidadesHtml = locFiltradas.length > 0
    ? locFiltradas.map(loc => `
        <div class="localidad-item" onclick="centrarEnMarcador(${loc.lat}, ${loc.lng})">
          <strong>${loc.nombre}</strong>
          <small>📌 ${loc.direccion} &nbsp;•&nbsp; <span class="badge">${loc.tipo}</span></small>
        </div>
      `).join("")
    : `<p class="sin-datos">Sin localidades para el filtro seleccionado.</p>`;

  const filtroHtmlComuna = locOrdenadas.length > 0 ? `
    <div class="sector-filter-container">
      <label>Filtrar por sector:</label>
      <div class="sector-filter-buttons">
        <button class="sector-btn ${!filtroSectorActivo ? 'sector-btn-active' : ''}" onclick="aplicarFiltroSector('')">Todo</button>
        <button class="sector-btn ${filtroSectorActivo === 'privado' ? 'sector-btn-active' : ''}" onclick="aplicarFiltroSector('privado')">Privado</button>
        <button class="sector-btn ${filtroSectorActivo === 'publico' ? 'sector-btn-active' : ''}" onclick="aplicarFiltroSector('publico')">Público</button>
        <button class="sector-btn sector-btn-vighi ${filtroVighiActivo ? 'sector-btn-active' : ''}" onclick="toggleFiltroVighi()">Vighi</button>
      </div>
    </div>` : "";

  document.getElementById("panelBody").innerHTML = `
    <div class="comuna-header">
      <div class="comuna-header-top">
        <h3>📍 ${nombre}</h3>
        <button class="btn-volver" onclick="volverAlListado()" title="Volver al listado">✕</button>
      </div>
      ${barriosHtml}
    </div>
    ${filtroHtmlComuna}
    <div class="seccion-titulo">Localidades de interés</div>
    ${localidadesHtml}
  `;

  abrirPanelMobile();
}

// ============================================
// MOSTRAR INFO PANEL — AMBA
// ============================================
function mostrarInfoPanelPartido(partidoId) {
  const partido = partidosData[partidoId];
  const localidades = getLocalidadesDePartido(partidoId);

  const nombre = partido ? partido.nombre : `Partido ${partidoId}`;

  const locOrdenadas = [...localidades].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));

  const localidadesHtml = locOrdenadas.length > 0
    ? locOrdenadas.map(loc => `
        <div class="localidad-item" onclick="centrarEnMarcador(${loc.lat}, ${loc.lng})">
          <strong>${loc.nombre}</strong>
          <small>📌 ${loc.direccion} &nbsp;•&nbsp; <span class="badge">${loc.tipo}</span></small>
        </div>
      `).join("")
    : `<p class="sin-datos">Sin localidades registradas para este partido.</p>`;

  const zonaPartido = ZONA_AMBA[partidoId];
  const ZONA_LABEL_MAP = { norte: "Norte", oeste: "Oeste", sur: "Sur" };
  const zonaBadge = zonaPartido
    ? `<span class="amba-zona-chip amba-zona-${zonaPartido}" style="font-size:10px;padding:2px 8px;">● ${ZONA_LABEL_MAP[zonaPartido]}</span>`
    : "";

  document.getElementById("panelBody").innerHTML = `
    <div class="comuna-header">
      <div class="comuna-header-top">
        <h3>🗺️ ${nombre}</h3>
        <button class="btn-volver" onclick="volverAlListado()" title="Volver al listado">✕</button>
      </div>
      <div class="barrios-tag" style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
        ${zonaBadge}
        ${partido && partido.barrios && partido.barrios.length > 0
          ? `<strong>Localidades:</strong> ${partido.barrios.join(", ")}`
          : `<strong>Partido del GBA</strong>`
        }
      </div>
    </div>
    <div class="seccion-titulo">Localidades de interés</div>
    ${localidadesHtml}
  `;

  abrirPanelMobile();
}
