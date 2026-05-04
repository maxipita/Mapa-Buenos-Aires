// ============================================
// CONFIGURACIÓN
// ============================================
const GEOJSON_URL = "barriosGeoJson.json";
const GEOJSON_AMBA_URL = "ambaGeoJson.json";

// ============================================
// DATOS DE LAS COMUNAS (CABA)
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
// DATOS DE LOS PARTIDOS (AMBA / GBA)
// ============================================
const partidosData = {
  "06028": { nombre: "Almirante Brown",     barrios: ["Adrogué", "Burzaco", "Claypole", "Don Orione", "Glew", "José Mármol", "Longchamps", "Ministro Rivadavia", "Rafael Calzada", "San Francisco Solano"] },
  "06035": { nombre: "Avellaneda",          barrios: ["Avellaneda", "Dock Sud", "Gerli", "Piñeyro", "Sarandí", "Villa Domínico", "Wilde"] },
  "06091": { nombre: "Berazategui",         barrios: ["Berazategui", "El Pato", "Hudson", "Pereyra", "Plátanos", "Ranelagh", "Villa España"] },
  "06260": { nombre: "Esteban Echeverría",  barrios: ["Monte Grande", "Luis Guillón", "El Jagüel", "Canning", "9 de Abril"] },
  "06270": { nombre: "Ezeiza",              barrios: ["Ezeiza", "Tristán Suárez", "La Unión", "Carlos Spegazzini"] },
  "06274": { nombre: "Florencio Varela",    barrios: ["Florencio Varela", "Bosques", "Ingeniero Allan", "La Capilla", "Villa San Luis", "Villa Vatteone"] },
  "06371": { nombre: "General San Martín",  barrios: ["San Martín", "Villa Ballester", "José León Suárez", "Billinghurst", "Villa Maipú"] },
  "06408": { nombre: "Hurlingham",          barrios: ["Hurlingham", "Villa Tesei", "William Morris"] },
  "06410": { nombre: "Ituzaingó",           barrios: ["Ituzaingó"] },
  "06412": { nombre: "José C. Paz",         barrios: ["José C. Paz"] },
  "06427": { nombre: "La Matanza",          barrios: ["San Justo", "Ramos Mejía", "Laferrere", "González Catán", "Ciudad Evita", "Isidro Casanova", "Villa Luzuriaga", "Gregorio de Laferrere", "Tapiales"] },
  "06434": { nombre: "Lanús",               barrios: ["Lanús Este", "Lanús Oeste", "Remedios de Escalada", "Valentín Alsina", "Monte Chingolo"] },
  "06490": { nombre: "Lomas de Zamora",     barrios: ["Lomas de Zamora", "Banfield", "Temperley", "Ingeniero Budge", "Villa Fiorito", "Turdera"] },
  "06515": { nombre: "Malvinas Argentinas", barrios: ["Los Polvorines", "Grand Bourg", "Ing. Pablo Nogués", "Villa de Mayo", "Tierras Altas"] },
  "06539": { nombre: "Merlo",               barrios: ["Merlo", "San Antonio de Padua", "Parque San Martín", "Libertad", "Mariano Acosta"] },
  "06560": { nombre: "Moreno",              barrios: ["Moreno", "Paso del Rey", "Trujui", "Cuartel V", "La Reja"] },
  "06568": { nombre: "Morón",               barrios: ["Morón", "Castelar", "Haedo", "El Palomar", "Villa Sarmiento"] },
  "06658": { nombre: "Quilmes",             barrios: ["Quilmes", "Bernal", "Ezpeleta", "San Francisco Solano"] },
  "06749": { nombre: "San Fernando",        barrios: ["San Fernando", "Victoria", "Virreyes"] },
  "06756": { nombre: "San Isidro",          barrios: ["San Isidro", "Martínez", "Acassuso", "Beccar", "Boulogne"] },
  "06760": { nombre: "San Miguel",          barrios: ["San Miguel", "Bella Vista", "Muñiz"] },
  "06805": { nombre: "Tigre",               barrios: ["Tigre", "Don Torcuato", "El Talar", "Benavídez", "General Pacheco", "Nordelta"] },
  "06840": { nombre: "Tres de Febrero",     barrios: ["Caseros", "Ciudadela", "El Palomar", "Santos Lugares", "Villa Bosch", "Loma Hermosa"] },
  "06861": { nombre: "Vicente López",       barrios: ["Olivos", "Florida", "Munro", "La Lucila", "Vicente López", "Villa Martelli"]},
};

// ============================================
// CARGA Y MERGE DE DATOS EXTERNOS (JSON)
// ============================================
const DATA_URLS = {
  sanatorios:        "sanatorios.json",
  consultorios:      "consultorios.json",
  sanatoriosAmba:    "sanatoriosAmba.json",
  consultoriosAmba:  "consultoriosAmba.json"
};

function cargarDatosExternos() {
  const fetchJSON = url =>
    fetch(url)
      .then(r => r.ok ? r.json() : Promise.reject(new Error(url + " HTTP " + r.status)))
      .catch(err => { console.warn("No se pudo cargar", url, err); return {}; });

  return Promise.all([
    fetchJSON(DATA_URLS.sanatorios),
    fetchJSON(DATA_URLS.consultorios),
    fetchJSON(DATA_URLS.sanatoriosAmba),
    fetchJSON(DATA_URLS.consultoriosAmba)
  ]).then(function ([sanat, consult, sanatAmba, consultAmba]) {
    // CABA
    [sanat, consult].forEach(function (fuente) {
      Object.keys(fuente).forEach(function (id) {
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

    // AMBA
    [sanatAmba, consultAmba].forEach(function (fuente) {
      Object.keys(fuente).forEach(function (id) {
        const locs = (fuente[id].localidades || []).filter(l => l.nombre);
        if (locs.length === 0) return;
        if (partidosData[id]) {
          if (!Array.isArray(partidosData[id].localidades)) partidosData[id].localidades = [];
          partidosData[id].localidades = partidosData[id].localidades.concat(locs);
        } else {
          partidosData[id] = { nombre: fuente[id].nombre || id, barrios: [], localidades: locs };
        }
      });
    });
  });
}

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
      if (comunaSeleccionadaId !== null) {
        mostrarInfoPanel(comunaSeleccionadaId);
      } else if (partidoSeleccionadoId !== null) {
        mostrarInfoPanelPartido(partidoSeleccionadoId);
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
    } else if (partidoSeleccionadoId !== null) {
      mostrarInfoPanelPartido(partidoSeleccionadoId);
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

  // Helper: ¿el query matchea el nombre del área o alguno de sus barrios?
  function areaMatchea(area) {
    if (normalizarTexto(area.nombre || "").includes(q)) return true;
    const barrios = area.barrios || [];
    return barrios.some(b => normalizarTexto(b).includes(q));
  }

  Object.keys(comunasData).forEach(id => {
    const comuna = comunasData[id];
    const matchArea = areaMatchea(comuna);
    filtrarPorCategoria(comuna.localidades).forEach(loc => {
      const coincide = matchArea ||
        normalizarTexto(loc.nombre).includes(q) ||
        normalizarTexto(loc.direccion).includes(q) ||
        normalizarTexto(loc.tipo || "").includes(q);
      if (coincide) {
        resultados.push({ ...loc, areaId: parseInt(id), areaNombre: comuna.nombre, region: "caba" });
      }
    });
  });

  Object.keys(partidosData).forEach(id => {
    const partido = partidosData[id];
    const matchArea = areaMatchea(partido);
    filtrarPorCategoria(partido.localidades || []).forEach(loc => {
      const coincide = matchArea ||
        normalizarTexto(loc.nombre).includes(q) ||
        normalizarTexto(loc.direccion).includes(q) ||
        normalizarTexto(loc.tipo || "").includes(q);
      if (coincide) {
        resultados.push({ ...loc, areaId: id, areaNombre: partido.nombre, region: "amba" });
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
      <div class="search-result-item" onclick="irALocalidad('${loc.areaId}', ${loc.lat}, ${loc.lng}, '${loc.region}')">
        <strong>${loc.nombre}</strong>
        <small>📌 ${loc.direccion}</small>
        <div class="result-comuna">📍 ${loc.areaNombre}</div>
      </div>
    `).join("")}
  `;

  abrirPanelMobile();
}

function irALocalidad(areaId, lat, lng, region) {
  const input = document.getElementById("searchInput");
  const clearBtn = document.getElementById("searchClear");
  input.value = "";
  clearBtn.style.display = "none";

  if (region === "amba") {
    seleccionarPartido(String(areaId));
  } else {
    seleccionarComuna(parseInt(areaId));
  }
  setTimeout(() => centrarEnMarcador(lat, lng), 300);
}

// ============================================
// VARIABLES GLOBALES
// ============================================
let map;
let ambaDataLayer;
let marcadoresActivos = [];
let comunaSeleccionadaId = null;
let partidoSeleccionadoId = null;
let infoWindowGlobal = null;
let categoriaActiva = null;
let geojsonCargados = 0;

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

const ESTILO_BASE = {
  fillColor: "#95a5a6",
  fillOpacity: 0.3,
  strokeColor: "#2c3e50",
  strokeWeight: 1
};

const ESTILO_SELECCIONADO = {
  fillColor: "#d534db",
  fillOpacity: 0.4,
  strokeColor: "#a020a8",
  strokeWeight: 2
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
    `Hacé click en una comuna o partido para ver los ${catInfo.label.toLowerCase()} que trabajan con Vighi.`;
  document.getElementById("searchInput").placeholder =
    cat === "sanatorios" ? "Buscar sanatorio o dirección..." : "Buscar consultorio o dirección...";

  mostrarTodasLasLocalidades();
}

function volverAlMenu() {
  comunaSeleccionadaId = null;
  partidoSeleccionadoId = null;
  marcadoresActivos.forEach(m => m.setMap(null));
  marcadoresActivos = [];
  if (map) {
    aplicarEstiloBase();
    aplicarEstiloBaseAmba();
  }

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

  const comunasConLocs = Object.keys(comunasData)
    .map(id => ({
      id: parseInt(id),
      ...comunasData[id],
      locs: filtrarPorCategoria(comunasData[id].localidades)
    }))
    .filter(c => c.locs.length > 0)
    .sort((a, b) => a.id - b.id);

  const partidosConLocs = Object.keys(partidosData)
    .map(id => ({
      id,
      ...partidosData[id],
      locs: filtrarPorCategoria(partidosData[id].localidades || [])
    }))
    .filter(p => p.locs.length > 0)
    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));

  const total = comunasConLocs.reduce((s, c) => s + c.locs.length, 0)
              + partidosConLocs.reduce((s, p) => s + p.locs.length, 0);

  if (total === 0) {
    panelBody.innerHTML = `<p class="sin-datos">Sin ubicaciones registradas para esta categoría.</p>`;
    return;
  }

  function renderItems(items, clickFn, region) {
    return items.map(area => {
      const ordenadas = [...area.locs].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
      const idJs = region === "caba" ? area.id : `'${area.id}'`;
      return `
        <div class="seccion-titulo todas-titulo" onclick="${clickFn}(${idJs})" title="Ver en el mapa">
          ${area.nombre}
          <span class="todas-count">${ordenadas.length}</span>
        </div>
        ${ordenadas.map(loc => `
          <div class="localidad-item" onclick="irALocalidad('${area.id}', ${loc.lat}, ${loc.lng}, '${region}')">
            <strong>${loc.nombre}</strong>
            <small>📌 ${loc.direccion} &nbsp;•&nbsp; <span class="badge">${loc.tipo}</span></small>
          </div>
        `).join("")}
      `;
    }).join("");
  }

  let html = `
    <div class="todas-header">
      <span>${total} ubicaciones en total</span>
      <button id="btnVerTodos" class="btn-ver-todos" onclick="mostrarTodosLosMarcadores()">📍 Ver todos en el mapa</button>
    </div>
  `;

  if (comunasConLocs.length > 0) {
    html += `<div class="region-subtitulo">📍 Ciudad de Buenos Aires</div>`;
    html += renderItems(comunasConLocs, "seleccionarComuna", "caba");
  }

  if (partidosConLocs.length > 0) {
    html += `<div class="region-subtitulo">🗺️ Conurbano Bonaerense</div>`;
    html += renderItems(partidosConLocs, "seleccionarPartido", "amba");
  }

  panelBody.innerHTML = html;
}

document.addEventListener("DOMContentLoaded", function () {
  initBuscador();

  const handle = document.getElementById("panelHandle");
  const panel  = document.getElementById("sidePanel");

  handle.addEventListener("click", togglePanelMobile);

  let touchStartY = 0;
  let hasDragged  = false;

  handle.addEventListener("touchstart", function (e) {
    if (!esMobile()) return;
    touchStartY = e.touches[0].clientY;
    hasDragged  = false;
    panel.style.transition = "none";
  }, { passive: true });

  handle.addEventListener("touchmove", function (e) {
    if (!esMobile()) return;
    const deltaY = e.touches[0].clientY - touchStartY;

    if (Math.abs(deltaY) > 10) hasDragged = true;

    if (panel.classList.contains("panel-abierto") && deltaY > 0) {
      panel.style.transform = `translateY(${deltaY}px)`;
      e.preventDefault();
    }
  }, { passive: false });

  handle.addEventListener("touchend", function (e) {
    if (!esMobile()) return;

    panel.style.transition = "";

    const deltaY = e.changedTouches[0].clientY - touchStartY;
    const estaAbierto = panel.classList.contains("panel-abierto");

    if (!hasDragged) {
      e.preventDefault();
      togglePanelMobile();
    } else if (estaAbierto && deltaY > 80) {
      panel.style.transform = "";
      panel.classList.remove("panel-abierto");
    } else {
      panel.style.transform = "";
    }
  });
});

// ============================================
// INICIALIZAR MAPA
// ============================================
function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: -34.65, lng: -58.55 },
    zoom: 10,
    mapTypeControl: true,
    streetViewControl: false,
    fullscreenControl: true
  });

  infoWindowGlobal = new google.maps.InfoWindow();
  ambaDataLayer = new google.maps.Data();

  cargarDatosExternos().then(function () {
    cargarGeoJSON();
    cargarGeoJSONAmba();
  });
}

// ============================================
// AJUSTAR VISTA AL TERMINAR DE CARGAR AMBAS CAPAS
// ============================================
function verificarYAjustarBounds() {
  geojsonCargados++;
  if (geojsonCargados < 2) return;

  map.setCenter({ lat: -34.62, lng: -58.52 });
  map.setZoom(11);
}

// ============================================
// CARGAR GEOJSON CABA
// ============================================
function cargarGeoJSON() {
  map.data.loadGeoJson(GEOJSON_URL, null, function () {
    aplicarEstiloBase();

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
    ambaDataLayer.setMap(map);

    ambaDataLayer.addListener("click", function (event) {
      const partidoId = getPartidoId(event.feature);
      if (!partidoId) return;
      seleccionarPartido(partidoId);
    });

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
  if (ambaDataLayer) ambaDataLayer.setStyle(ESTILO_BASE);
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
    return getPartidoId(feature) === partidoId ? ESTILO_SELECCIONADO : ESTILO_BASE;
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
// VOLVER AL LISTADO COMPLETO
// ============================================
function volverAlListado() {
  comunaSeleccionadaId = null;
  partidoSeleccionadoId = null;

  marcadoresActivos.forEach(m => m.setMap(null));
  marcadoresActivos = [];

  aplicarEstiloBase();
  aplicarEstiloBaseAmba();

  mostrarTodasLasLocalidades();
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

  document.getElementById("panelBody").innerHTML = `
    <div class="comuna-header">
      <div class="comuna-header-top">
        <h3>🗺️ ${nombre}</h3>
        <button class="btn-volver" onclick="volverAlListado()" title="Volver al listado">✕</button>
      </div>
      ${partido && partido.barrios && partido.barrios.length > 0
        ? `<div class="barrios-tag"><strong>Localidades:</strong> ${partido.barrios.join(", ")}</div>`
        : `<div class="barrios-tag"><strong>Partido del GBA</strong></div>`
      }
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
    case "alta":   return "#e74c3c";
    case "media":  return "#f39c12";
    case "baja":   return "#27ae60";
    case "blanca":
    case "blanco": return "#ffffff";
    default:       return "#a020a8";
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
    ctx.shadowColor = "rgba(0,0,0,0.35)";
    ctx.shadowBlur = 5;
    ctx.shadowOffsetY = 2;

    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = borderColor;
    ctx.fill();

    ctx.shadowColor = "transparent";

    const rInner = r - 5;
    ctx.beginPath();
    ctx.arc(cx, cy, rInner, 0, Math.PI * 2);
    ctx.fillStyle = "#a020a8";
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(cx - 7, cy + r - 3);
    ctx.lineTo(cx + 7, cy + r - 3);
    ctx.lineTo(cx, H - 2);
    ctx.fillStyle = borderColor;
    ctx.fill();

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
function agregarMarcadores(localidades) {
  if (localidades.length === 0) return;

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
        <div class="popup-container">
          ${loc.imagen ? `<img src="${loc.imagen}" alt="${loc.nombre}" class="popup-imagen">` : ""}
          <strong class="popup-nombre">${loc.nombre}</strong>
          <p class="popup-direccion">${loc.direccion}</p>
          <span class="popup-tipo">${loc.tipo}</span>
          ${loc.nomencladores && loc.nomencladores.length ? `
          <button class="popup-btn-desglose" onclick="var d=document.getElementById('nomDesglose');var b=this;if(d.style.display!=='block'){d.style.display='block';b.innerHTML='Ver menos <span class=\\'popup-btn-flecha\\'>&#9650;</span>';}else{d.style.display='none';b.innerHTML='Ver desglose <span class=\\'popup-btn-flecha\\'>&#9660;</span>';}">Ver desglose <span class="popup-btn-flecha">&#9660;</span></button>
          <div id="nomDesglose" class="popup-desglose">
            <table class="popup-tabla">
              <thead>
                <tr>
                  <th>Nomenclador</th>
                  <th>Cantidad</th>
                </tr>
              </thead>
              <tbody>
                ${loc.nomencladores.map(n => {
                  const etiqueta = n.tipo && n.tipo.toLowerCase() === "presencia" ? "Presencia Patólogo" : n.tipo && n.tipo.toLowerCase() === "total" ? "Total" : n.codigo;
                  return `<tr><td>${etiqueta}</td><td>${n.cantidad}</td></tr>`;
                }).join("")}
              </tbody>
            </table>
          </div>
          ` : ""}
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
