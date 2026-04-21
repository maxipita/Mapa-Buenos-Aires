// ============================================
// CONFIGURACIÓN
// ============================================
const GEOJSON_URL = "barriosGeoJson.json";

// ============================================
// DATOS DE LAS COMUNAS (solo estructura: nombre y barrios)
// Las localidades se cargan desde sanatorios.js y consultorios.js
// ============================================
const comunasData = {
  1:  { nombre: "Comuna 1",  barrios: ["Retiro", "San Nicolás", "Puerto Madero", "San Telmo", "Montserrat", "Constitución"], localidades: [] },
  2:  { nombre: "Comuna 2",  barrios: ["Recoleta"], localidades: [] },
  3:  { nombre: "Comuna 3",  barrios: ["Balvanera", "San Cristóbal"], localidades: [] },
  4:  { nombre: "Comuna 4",  barrios: ["La Boca", "Barracas", "Parque Patricios", "Nueva Pompeya"], localidades: [] },
  5:  { nombre: "Comuna 5",  barrios: ["Almagro", "Boedo"], localidades: [] },
  6:  { nombre: "Comuna 6",  barrios: ["Caballito"], localidades: [] },
  7:  { nombre: "Comuna 7",  barrios: ["Flores", "Parque Chacabuco"], localidades: [] },
  8:  { nombre: "Comuna 8",  barrios: ["Villa Soldati", "Villa Riachuelo", "Villa Lugano"], localidades: [] },
  9:  { nombre: "Comuna 9",  barrios: ["Liniers", "Mataderos", "Parque Avellaneda"], localidades: [] },
  10: { nombre: "Comuna 10", barrios: ["Villa Real", "Monte Castro", "Versalles", "Floresta", "Vélez Sársfield", "Villa Luro"], localidades: [] },
  11: { nombre: "Comuna 11", barrios: ["Villa General Mitre", "Villa Devoto", "Villa del Parque", "Villa Santa Rita"], localidades: [] },
  12: { nombre: "Comuna 12", barrios: ["Coghlan", "Saavedra", "Villa Urquiza", "Villa Pueyrredón"], localidades: [] },
  13: { nombre: "Comuna 13", barrios: ["Belgrano", "Colegiales", "Núñez"], localidades: [] },
  14: { nombre: "Comuna 14", barrios: ["Palermo"], localidades: [] },
  15: { nombre: "Comuna 15", barrios: ["Chacarita", "Villa Crespo", "La Paternal", "Villa Ortúzar", "Agronomía", "Parque Chas"], localidades: [] },
};

// ============================================
// MERGE DE DATOS EXTERNOS EN comunasData
// sanatorios.js y consultorios.js se combinan aquí
// ============================================
(function mergeData() {
  [
    typeof sanatoriosData !== "undefined" ? sanatoriosData : null,
    typeof consultoriosData !== "undefined" ? consultoriosData : null
  ].forEach(function(fuente) {
    if (!fuente) return;
    Object.keys(fuente).forEach(function(id) {
      const numId = parseInt(id);
      const locs = (fuente[id].localidades || []).filter(l => l.nombre);
      if (locs.length === 0) return;
      if (comunasData[numId]) {
        comunasData[numId].localidades = comunasData[numId].localidades.concat(locs);
      } else {
        comunasData[numId] = { nombre: "Comuna " + numId, barrios: [], localidades: locs };
      }
    });
  });
})();

// ============================================
// BUSCADOR
// ============================================
function initBuscador() {
  const input = document.getElementById("searchInput");
  const clearBtn = document.getElementById("searchClear");

  input.addEventListener("input", function () {
    const query = this.value.trim();
    clearBtn.style.display = query.length > 0 ? "block" : "none";

    if (query.length === 0) {
      // Volver al estado anterior o listado completo
      if (comunaSeleccionadaId !== null) {
        mostrarInfoPanel(comunaSeleccionadaId);
      } else {
        mostrarTodasLasLocalidades();
      }
      return;
    }

    mostrarResultadosBusqueda(query);
  });

  clearBtn.addEventListener("click", function () {
    input.value = "";
    clearBtn.style.display = "none";
    input.focus();

    if (comunaSeleccionadaId !== null) {
      mostrarInfoPanel(comunaSeleccionadaId);
    } else {
      mostrarTodasLasLocalidades();
    }
  });
}

function normalizarTexto(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function mostrarResultadosBusqueda(query) {
  const q = normalizarTexto(query);
  const resultados = [];

  Object.keys(comunasData).forEach(id => {
    const comuna = comunasData[id];
    const localidadesFiltradas = filtrarPorCategoria(comuna.localidades);
    localidadesFiltradas.forEach(loc => {
      const hayCoincidencia =
        normalizarTexto(loc.nombre).includes(q) ||
        normalizarTexto(loc.direccion).includes(q) ||
        normalizarTexto(loc.tipo || "").includes(q);

      if (hayCoincidencia) {
        resultados.push({ ...loc, comunaId: parseInt(id), comunaNombre: comuna.nombre });
      }
    });
  });

  const panelBody = document.getElementById("panelBody");

  if (resultados.length === 0) {
    panelBody.innerHTML = `<p class="search-sin-resultados">Sin resultados para "<strong>${query}</strong>"</p>`;
    return;
  }

  panelBody.innerHTML = `
    <div class="seccion-titulo">${resultados.length} resultado${resultados.length !== 1 ? "s" : ""}</div>
    ${resultados.map(loc => `
      <div class="search-result-item" onclick="irALocalidad(${loc.comunaId}, ${loc.lat}, ${loc.lng})">
        <strong>${loc.nombre}</strong>
        <small>📌 ${loc.direccion}</small>
        <div class="result-comuna">📍 ${loc.comunaNombre}</div>
      </div>
    `).join("")}
  `;

  abrirPanelMobile();
}

function irALocalidad(comunaId, lat, lng) {
  // Limpiar el buscador
  const input = document.getElementById("searchInput");
  const clearBtn = document.getElementById("searchClear");
  input.value = "";
  clearBtn.style.display = "none";

  // Seleccionar la comuna y centrar en el marcador
  seleccionarComuna(comunaId);
  setTimeout(() => centrarEnMarcador(lat, lng), 300);
}

// ============================================
// VARIABLES GLOBALES
// ============================================
let map;
let marcadoresActivos = [];
let comunaSeleccionadaId = null;
let infoWindowGlobal = null;
let categoriaActiva = null;

const CATEGORIAS = {
  sanatorios: {
    label: "Sanatorios y Centros Médicos",
    tipos: ["Sanatorio", "Centro Médico"]
  },
  consultorios: {
    label: "Consultorios Externos",
    tipos: ["Consultorio"]
  }
};

function filtrarPorCategoria(localidades) {
  if (!categoriaActiva || !CATEGORIAS[categoriaActiva]) return localidades;
  const tipos = CATEGORIAS[categoriaActiva].tipos;
  return localidades.filter(loc => tipos.includes(loc.tipo));
}

function seleccionarCategoria(cat) {
  categoriaActiva = cat;

  const menu = document.getElementById("menuInicio");
  menu.classList.add("oculto");
  setTimeout(() => { menu.style.display = "none"; }, 400);

  const catInfo = CATEGORIAS[cat];
  const leyenda = document.getElementById("leyendaPrioridad");
  if (leyenda) leyenda.style.display = "block";
  document.getElementById("categoriaActualLabel").textContent = catInfo.label;
  document.getElementById("panelDesc").textContent =
    `Hacé click en una comuna para ver los ${catInfo.label.toLowerCase()} que trabajan con Vighi.`;
  document.getElementById("searchInput").placeholder =
    cat === "sanatorios" ? "Buscar sanatorio o dirección..." : "Buscar consultorio o dirección...";

  mostrarTodasLasLocalidades();
}

function volverAlMenu() {
  // Limpiar estado del mapa
  comunaSeleccionadaId = null;
  marcadoresActivos.forEach(m => m.setMap(null));
  marcadoresActivos = [];
  if (map) aplicarEstiloBase();

  // Limpiar buscador
  const input = document.getElementById("searchInput");
  const clearBtn = document.getElementById("searchClear");
  input.value = "";
  clearBtn.style.display = "none";

  categoriaActiva = null;

  const leyenda = document.getElementById("leyendaPrioridad");
  if (leyenda) leyenda.style.display = "none";

  const menu = document.getElementById("menuInicio");
  menu.style.display = "";
  requestAnimationFrame(() => menu.classList.remove("oculto"));
}

// ============================================
// RESPONSIVE — HELPERS MOBILE
// ============================================
function esMobile() {
  return window.innerWidth <= 768;
}

function abrirPanelMobile() {
  if (esMobile()) {
    document.getElementById("sidePanel").classList.add("panel-abierto");
  }
}

function togglePanelMobile() {
  if (esMobile()) {
    document.getElementById("sidePanel").classList.toggle("panel-abierto");
  }
}

// ============================================
// LISTADO DE TODAS LAS LOCALIDADES
// ============================================
function mostrarTodasLasLocalidades() {
  const panelBody = document.getElementById("panelBody");

  const comunasConLocalidades = Object.keys(comunasData)
    .map(id => ({
      id: parseInt(id),
      ...comunasData[id],
      localidadesFiltradas: filtrarPorCategoria(comunasData[id].localidades)
    }))
    .filter(c => c.localidadesFiltradas.length > 0)
    .sort((a, b) => a.id - b.id);

  const totalLocalidades = comunasConLocalidades.reduce((sum, c) => sum + c.localidadesFiltradas.length, 0);

  if (totalLocalidades === 0) {
    panelBody.innerHTML = `<p class="sin-datos">Sin ubicaciones registradas para esta categoría.</p>`;
    return;
  }

  const html = comunasConLocalidades.map(comuna => {
    const locOrdenadas = [...comuna.localidadesFiltradas].sort((a, b) =>
      a.nombre.localeCompare(b.nombre, 'es')
    );
    return `
      <div class="seccion-titulo todas-titulo" onclick="seleccionarComuna(${comuna.id})" title="Ver en el mapa">
        ${comuna.nombre}
        <span class="todas-count">${locOrdenadas.length}</span>
      </div>
      ${locOrdenadas.map(loc => `
        <div class="localidad-item" onclick="irALocalidad(${comuna.id}, ${loc.lat}, ${loc.lng})">
          <strong>${loc.nombre}</strong>
          <small>📌 ${loc.direccion} &nbsp;•&nbsp; <span class="badge">${loc.tipo}</span></small>
        </div>
      `).join("")}
    `;
  }).join("");

  panelBody.innerHTML = `
    <div class="todas-header">
      <span>${totalLocalidades} ubicaciones en total</span>
    </div>
    ${html}
  `;
}

document.addEventListener("DOMContentLoaded", function () {
  initBuscador();

  const handle = document.getElementById("panelHandle");
  const panel  = document.getElementById("sidePanel");

  // Click para dispositivos con mouse (desktop, aunque el handle está oculto allí)
  handle.addEventListener("click", togglePanelMobile);

  let touchStartY = 0;
  let hasDragged  = false;

  handle.addEventListener("touchstart", function (e) {
    if (!esMobile()) return;
    touchStartY = e.touches[0].clientY;
    hasDragged  = false;
    panel.style.transition = "none";   // quitamos la animación mientras arrastramos
  }, { passive: true });

  handle.addEventListener("touchmove", function (e) {
    if (!esMobile()) return;
    const deltaY = e.touches[0].clientY - touchStartY;

    if (Math.abs(deltaY) > 10) hasDragged = true;

    // Solo mover hacia abajo cuando el panel está abierto
    if (panel.classList.contains("panel-abierto") && deltaY > 0) {
      panel.style.transform = `translateY(${deltaY}px)`;
      e.preventDefault();
    }
  }, { passive: false });

  handle.addEventListener("touchend", function (e) {
    if (!esMobile()) return;

    panel.style.transition = "";   // restaurar animación CSS

    const deltaY = e.changedTouches[0].clientY - touchStartY;
    const estaAbierto = panel.classList.contains("panel-abierto");

    if (!hasDragged) {
      // Fue un toque simple → toggle
      e.preventDefault();          // evita que se dispare también el evento click
      togglePanelMobile();
    } else if (estaAbierto && deltaY > 80) {
      // Arrastró lo suficiente hacia abajo → cerrar (queda el handle visible)
      panel.style.transform = "";
      panel.classList.remove("panel-abierto");
    } else {
      // No llegó al umbral → volver a la posición abierta
      panel.style.transform = "";
    }
  });
});

// ============================================
// INICIALIZAR MAPA
// ============================================
function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: -34.6037, lng: -58.3816 },
    zoom: 12,
    mapTypeControl: true,
    streetViewControl: false,
    fullscreenControl: true
  });

  infoWindowGlobal = new google.maps.InfoWindow();

  cargarGeoJSON();
}

// ============================================
// CARGAR GEOJSON
// ============================================
function cargarGeoJSON() {
  map.data.loadGeoJson(GEOJSON_URL, null, function (features) {
    aplicarEstiloBase();

    map.data.addListener("click", function (event) {
      const comunaId = getComunaId(event.feature);
      if (!comunaId) return;
      seleccionarComuna(comunaId);
    });

    // Ajustar vista al contorno de CABA
    const bounds = new google.maps.LatLngBounds();
    features.forEach(feature => {
      feature.getGeometry().forEachLatLng(latLng => bounds.extend(latLng));
    });
    if (!bounds.isEmpty()) {
      map.fitBounds(bounds);
    }
  });
}

// ============================================
// OBTENER ID DE COMUNA DESDE FEATURE
// ============================================
function getComunaId(feature) {
  const val = feature.getProperty("COMUNA");
  return val != null ? parseInt(val) : null;
}

// ============================================
// ESTILO BASE (sin selección)
// ============================================
function aplicarEstiloBase() {
  map.data.setStyle({
    fillColor: "#95a5a6",
    fillOpacity: 0.3,
    strokeColor: "#2c3e50",
    strokeWeight: 1
  });
}

// ============================================
// SELECCIONAR COMUNA (resalta todos sus barrios)
// ============================================
function seleccionarComuna(comunaId) {
  comunaSeleccionadaId = comunaId;

  // Limpiar marcadores anteriores
  marcadoresActivos.forEach(m => m.setMap(null));
  marcadoresActivos = [];

  // Resaltar barrios de la comuna seleccionada
  map.data.setStyle(function (feature) {
    const id = getComunaId(feature);
    if (id === comunaId) {
      return {
        fillColor: "#d534db",   // ← color de la comuna seleccionada
        fillOpacity: 0.4,
        strokeColor: "#a020a8",
        strokeWeight: 2
      };
    }
    return {
      fillColor: "#95a5a6",
      fillOpacity: 0.3,
      strokeColor: "#2c3e50",
      strokeWeight: 1
    };
  });

  // Calcular bounds de todos los barrios de esta comuna
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
  agregarMarcadores(comunaId);
}

// ============================================
// OBTENER LOCALIDADES COMBINADAS PARA UNA COMUNA
// (une comunasData + barriosData)
// ============================================
function getLocalidadesDeComuna(comunaId) {
  const localidades = [];
  const vistas = new Set();

  if (comunasData[comunaId]) {
    comunasData[comunaId].localidades.forEach(loc => {
      const key = `${loc.lat},${loc.lng}`;
      if (!vistas.has(key)) {
        vistas.add(key);
        localidades.push(loc);
      }
    });
  }

  return filtrarPorCategoria(localidades);
}

// ============================================
// VOLVER AL LISTADO COMPLETO
// ============================================
function volverAlListado() {
  comunaSeleccionadaId = null;

  // Limpiar marcadores
  marcadoresActivos.forEach(m => m.setMap(null));
  marcadoresActivos = [];

  // Restaurar estilo base del mapa
  aplicarEstiloBase();

  mostrarTodasLasLocalidades();
}

// ============================================
// MOSTRAR INFO EN EL PANEL LATERAL
// ============================================
function mostrarInfoPanel(comunaId) {
  const comuna = comunasData[comunaId];
  const localidades = getLocalidadesDeComuna(comunaId);

  const nombre = comuna ? comuna.nombre : `Comuna ${comunaId}`;
  const barriosHtml = comuna
    ? `<div class="barrios-tag"><strong>Barrios:</strong> ${comuna.barrios.join(", ")}</div>`
    : "";

  const locOrdenadas = [...localidades].sort((a, b) =>
    a.nombre.localeCompare(b.nombre, 'es')
  );

  const localidadesHtml = locOrdenadas.length > 0
    ? locOrdenadas.map(loc => `
        <div class="localidad-item" onclick="centrarEnMarcador(${loc.lat}, ${loc.lng})">
          <strong>${loc.nombre}</strong>
          <small>📌 ${loc.direccion} &nbsp;•&nbsp; <span class="badge">${loc.tipo}</span></small>
        </div>
      `).join("")
    : `<p class="sin-datos">Sin localidades registradas para esta comuna.</p>`;

  document.getElementById("panelBody").innerHTML = `
    <div class="comuna-header">
      <div class="comuna-header-top">
        <h3>📍 ${nombre}</h3>
        <button class="btn-volver" onclick="volverAlListado()" title="Volver al listado">✕</button>
      </div>
      ${barriosHtml}
    </div>
    <div class="seccion-titulo">Localidades de interés</div>
    ${localidadesHtml}
  `;

  abrirPanelMobile();
}

// ============================================
// PRIORIDAD → COLOR DE BORDE DEL PIN
// ============================================
function getColorPorPrioridad(prioridad) {
  switch (prioridad) {
    case "alta":  return "#e74c3c";
    case "media": return "#f39c12";
    case "baja":  return "#27ae60";
    default:      return "#a020a8";
  }
}

// ============================================
// CREAR ÍCONO PIN CON LOGO
// ============================================
function crearIconoPin(logoUrl, borderColor, callback) {
  const W = 48, H = 62;
  const cx = W / 2;
  const r = W / 2 - 2;
  const cy = r + 2;

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  function dibujar(img) {
    // Sombra suave
    ctx.shadowColor = "rgba(0,0,0,0.35)";
    ctx.shadowBlur = 5;
    ctx.shadowOffsetY = 2;

    // Círculo exterior relleno con color de prioridad
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = borderColor;
    ctx.fill();

    ctx.shadowColor = "transparent";

    // Círculo interior violeta (deja un aro de color alrededor)
    const rInner = r - 5;
    ctx.beginPath();
    ctx.arc(cx, cy, rInner, 0, Math.PI * 2);
    ctx.fillStyle = "#a020a8";
    ctx.fill();

    // Punta triangular con color de prioridad
    ctx.beginPath();
    ctx.moveTo(cx - 7, cy + r - 3);
    ctx.lineTo(cx + 7, cy + r - 3);
    ctx.lineTo(cx, H - 2);
    ctx.fillStyle = borderColor;
    ctx.fill();

    // Logo recortado al círculo interior violeta
    if (img) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, rInner, 0, Math.PI * 2);
      ctx.clip();
      const s = rInner * 2;
      ctx.drawImage(img, cx - rInner, cy - rInner, s, s);
      ctx.restore();
    }

    callback(canvas.toDataURL(), W, H, cx);
  }

  const img = new Image();
  img.onload = () => dibujar(img);
  img.onerror = () => dibujar(null);
  img.src = logoUrl;
}

// ============================================
// AGREGAR MARCADORES AL MAPA
// ============================================
function agregarMarcadores(comunaId) {
  const localidades = getLocalidadesDeComuna(comunaId);
  if (localidades.length === 0) return;

  // Colores únicos necesarios para esta tanda de marcadores
  const coloresUnicos = [...new Set(localidades.map(loc => getColorPorPrioridad(loc.prioridad)))];
  const iconCache = {};
  let pendientes = coloresUnicos.length;

  coloresUnicos.forEach(function(color) {
    crearIconoPin("logo_vighi.png", color, function(iconUrl, W, H, cx) {
      iconCache[color] = {
        url: iconUrl,
        scaledSize: new google.maps.Size(W, H),
        anchor: new google.maps.Point(cx, H)
      };
      pendientes--;
      if (pendientes === 0) {
        _colocarMarcadores(localidades, iconCache);
      }
    });
  });
}

function _colocarMarcadores(localidades, iconCache) {
  localidades.forEach(loc => {
    const color = getColorPorPrioridad(loc.prioridad);
    const marker = new google.maps.Marker({
      position: { lat: loc.lat, lng: loc.lng },
      map: map,
      title: loc.nombre,
      animation: google.maps.Animation.DROP,
      icon: iconCache[color]
    });

    marker.addListener("click", () => {
      infoWindowGlobal.setContent(`
        <div style="padding: 10px; max-width: 240px;">
          ${loc.imagen ? `<img src="${loc.imagen}" alt="${loc.nombre}" style="width:100%;height:120px;object-fit:cover;border-radius:6px;margin-bottom:8px;">` : ""}
          <strong style="color: #2c3e50; font-size: 14px;">${loc.nombre}</strong>
          <p style="margin: 6px 0 2px; color: #7f8c8d; font-size: 13px;">${loc.direccion}</p>
          <span style="background: #f9e6fa; color: #d534db; font-size: 12px; padding: 2px 8px; border-radius: 10px;">${loc.tipo}</span>
        </div>
      `);
      infoWindowGlobal.open(map, marker);
    });

    marcadoresActivos.push(marker);
  });
}

// ============================================
// CENTRAR EN MARCADOR
// ============================================
function centrarEnMarcador(lat, lng) {
  map.setCenter({ lat, lng });
  map.setZoom(16);
}
