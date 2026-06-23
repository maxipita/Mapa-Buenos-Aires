// ============================================
// CONFIGURACIÓN
// ============================================
const GEOJSON_URL = "DatosGeoJson/barriosGeoJson.json";
const GEOJSON_AMBA_URL = "DatosGeoJson/ambaGeoJson.json";
const GEOJSON_ARGENTINA_URL = "DatosGeoJson/agrentinaProvincesGeoJson-simplified.json";
const GEOJSON_BA_DEPARTAMENTOS_URL = "DatosGeoJson/departamentos-buenos_aires.json";

const SHEETS_CSV_URL = "https://docs.google.com/spreadsheets/d/1LWynrRdnZSB9kaYPBZsRtswAAHDJIQHDwrRRdR2jwa8/gviz/tq?tqx=out:csv&gid=269143430";

// Mapeo de PROVINCIA_ZONA del Sheet a los IDs de provincia del GeoJSON
const ZONA_A_PROVINCIA = {
  "CABA":              "CIUDAD AUTONOMA DE BUENOS AIRES",
  "AMBA OESTE":        "BUENOS AIRES",
  "AMBA NORTE":        "BUENOS AIRES",
  "AMBA SUR":          "BUENOS AIRES",
  "AMBA ESTE":         "BUENOS AIRES",
  "BUENOS AIRES":      "BUENOS AIRES",
  "CORDOBA":           "CORDOBA",
  "SANTA FE":          "SANTA FE",
  "MENDOZA":           "MENDOZA",
  "NEUQUEN":           "NEUQUEN",
  "RIO NEGRO":         "RIO NEGRO",
  "CHUBUT":            "CHUBUT",
  "SANTA CRUZ":        "SANTA CRUZ",
  "TIERRA DEL FUEGO":  "TIERRA DEL FUEGO ANTARTIDA E ISLAS DEL ATLANTICO SUR",
  "SALTA":             "SALTA",
  "JUJUY":             "JUJUY",
  "TUCUMAN":           "TUCUMAN",
  "ENTRE RIOS":        "ENTRE RIOS",
  "CORRIENTES":        "CORRIENTES",
  "MISIONES":          "MISIONES",
  "CHACO":             "CHACO",
  "FORMOSA":           "FORMOSA",
  "SANTIAGO DEL ESTERO": "SANTIAGO DEL ESTERO",
  "CATAMARCA":         "CATAMARCA",
  "LA RIOJA":          "LA RIOJA",
  "SAN JUAN":          "SAN JUAN",
  "SAN LUIS":          "SAN LUIS",
  "LA PAMPA":          "LA PAMPA",
};

function parsearCSVSheets(texto) {
  const filas = [];
  let campo = "", fila = [], dentroComillas = false;
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (c === '"') {
      if (dentroComillas && texto[i + 1] === '"') { campo += '"'; i++; }
      else dentroComillas = !dentroComillas;
    } else if (c === ',' && !dentroComillas) {
      fila.push(campo.trim()); campo = "";
    } else if ((c === '\n' || c === '\r') && !dentroComillas) {
      if (c === '\r' && texto[i + 1] === '\n') i++;
      fila.push(campo.trim()); campo = "";
      if (fila.some(f => f !== "")) filas.push(fila);
      fila = [];
    } else {
      campo += c;
    }
  }
  if (campo || fila.length) { fila.push(campo.trim()); filas.push(fila); }
  return filas;
}

function derivarPrioridad(qx, amb, salaEndo, ce) {
  const vals = [qx, amb, salaEndo, ce].map(v => (v || "").toUpperCase());
  if (vals.includes("ALTA")) return "alta";
  if (vals.includes("MEDIA")) return "media";
  return "baja";
}

function normalizarNombre(n) {
  return (n || "").toLowerCase().trim()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, " ").replace(/\s+/g, " ").trim();
}
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
  sanatorios:              "DatosJson/sanatorios.json",
  consultorios:            "DatosJson/consultorios.json",
  sanatoriosAmba:          "DatosJson/sanatoriosAmba.json",
  consultoriosAmba:        "DatosJson/consultoriosAmba.json",
  sanatoriosExpansion:     "DatosJson/sanatoriosExpansion.json",
  consultoriosExpansion:   "DatosJson/consultoriosExpansion.json"
};

const PROVINCIAS_POR_SECTOR = [
  { sector: "Sector Sur",        provincias: ["NEUQUEN", "RIO_NEGRO", "CHUBUT", "SANTA_CRUZ", "TIERRA_DEL_FUEGO"] },
  { sector: "Sector Cordillera", provincias: ["MENDOZA", "SAN_JUAN", "LA_RIOJA", "CATAMARCA"] },
  { sector: "Sector Norte",      provincias: ["SALTA", "JUJUY", "CHACO", "FORMOSA", "CORRIENTES", "MISIONES"] },
  { sector: "Sector Centro",     provincias: ["TUCUMAN", "SANTIAGO_DEL_ESTERO", "ENTRE_RIOS", "SANTA_FE", "CORDOBA", "SAN_LUIS", "LA_PAMPA"] },
  { sector: "Sector Vighi",      provincias: ["BUENOS_AIRES", "CABA"] }
];

const PROVINCIA_URLS = PROVINCIAS_POR_SECTOR.flatMap(s =>
  s.provincias.map(p => `DatosJson/${s.sector}/${p}.json`)
);

function cargarDatosExternos() {
  const fetchJSON = url =>
    fetch(url)
      .then(r => r.ok ? r.json() : Promise.reject(new Error(url + " HTTP " + r.status)))
      .catch(err => { console.warn("No se pudo cargar", url, err); return {}; });

  return Promise.all([
    fetchJSON(DATA_URLS.sanatorios),
    fetchJSON(DATA_URLS.consultorios),
    fetchJSON(DATA_URLS.sanatoriosAmba),
    fetchJSON(DATA_URLS.consultoriosAmba),
    fetchJSON(DATA_URLS.sanatoriosExpansion),
    fetchJSON(DATA_URLS.consultoriosExpansion),
    ...PROVINCIA_URLS.map(fetchJSON)
  ]).then(function ([sanat, consult, sanatAmba, consultAmba, sanatExp, consultExp, ...provinciaFiles]) {
    // Helper: concat sin duplicar por nombre
    function concatSinDuplicados(existentes, nuevas) {
      const nombresExistentes = new Set(existentes.map(l => normalizarNombre(l.nombre)));
      return existentes.concat(nuevas.filter(l => !nombresExistentes.has(normalizarNombre(l.nombre))));
    }

    // CABA
    [sanat, consult].forEach(function (fuente) {
      Object.keys(fuente).forEach(function (id) {
        const numId = parseInt(id);
        const locs = (fuente[id].localidades || []).filter(l => l.nombre);
        if (locs.length === 0) return;
        if (comunasData[numId]) {
          comunasData[numId].localidades = concatSinDuplicados(comunasData[numId].localidades, locs);
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
          partidosData[id].localidades = concatSinDuplicados(partidosData[id].localidades, locs);
        } else {
          partidosData[id] = { nombre: fuente[id].nombre || id, barrios: [], localidades: locs };
        }
      });
    });

    // ARGENTINA — un archivo por provincia
    provinciaFiles.forEach(function (provData) {
      if (!provData || !provData.nombre) return;
      const id = provData.nombre;
      const provId = id === "CABA" ? "CIUDAD AUTONOMA DE BUENOS AIRES" : id;
      const locs = [
        ...(provData.sanatorios || []),
        ...(provData.consultorios || [])
      ].filter(l => l.nombre);
      if (locs.length === 0) return;
      if (provinciasData[provId]) {
        if (!Array.isArray(provinciasData[provId].localidades)) provinciasData[provId].localidades = [];
        provinciasData[provId].localidades = concatSinDuplicados(provinciasData[provId].localidades, locs);
      } else {
        provinciasData[provId] = { nombre: id, localidades: locs };
      }
    });

    // EXPANSIÓN
    [sanatExp, consultExp].forEach(function (fuente) {
      Object.keys(fuente).forEach(function (id) {
        const locs = (fuente[id].localidades || []).filter(l => l.nombre);
        if (locs.length === 0) return;
        if (provinciasDataExpansion[id]) {
          if (!Array.isArray(provinciasDataExpansion[id].localidades)) provinciasDataExpansion[id].localidades = [];
          provinciasDataExpansion[id].localidades = concatSinDuplicados(provinciasDataExpansion[id].localidades, locs);
        } else {
          provinciasDataExpansion[id] = { nombre: fuente[id].nombre || id, localidades: locs };
        }
      });
    });

    // Asignar sector por defecto a todas las localidades que no lo tengan
    asignarSectorPorDefecto();
  });
}

function asignarSectorPorDefecto() {
  // CABA
  Object.values(comunasData).forEach(comuna => {
    (comuna.localidades || []).forEach(loc => {
      if (!loc.sector) loc.sector = "privado";
    });
  });

  // AMBA
  Object.values(partidosData).forEach(partido => {
    (partido.localidades || []).forEach(loc => {
      if (!loc.sector) loc.sector = "privado";
    });
  });

  // ARGENTINA
  Object.values(provinciasData).forEach(provincia => {
    (provincia.localidades || []).forEach(loc => {
      if (!loc.sector) loc.sector = "privado";
    });
  });

  // EXPANSIÓN
  Object.values(provinciasDataExpansion).forEach(provincia => {
    (provincia.localidades || []).forEach(loc => {
      if (!loc.sector) loc.sector = "privado";
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

  if (regionActiva === "argentina" || regionActiva === "expansion") {
    const datos = getProvinciasDataActivo();
    Object.keys(datos).forEach(id => {
      const prov = datos[id];
      const matchArea = normalizarTexto(prov.nombre || "").includes(q);
      filtrarPorCategoria(prov.localidades || []).forEach(loc => {
        const coincide = matchArea ||
          normalizarTexto(loc.nombre).includes(q) ||
          normalizarTexto(loc.direccion || "").includes(q) ||
          normalizarTexto(loc.tipo || "").includes(q);
        if (coincide) {
          resultados.push({ ...loc, areaId: id, areaNombre: prov.nombre, region: "argentina" });
        }
      });
    });
  } else {
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
  }

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
  } else if (region === "argentina") {
    seleccionarProvincia(String(areaId));
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
let argentinaDataLayer;
let argentinaLoaded = false;
// Polígonos nativos para mostrar los partidos AMBA sobre el mapa de Argentina
// Los google.maps.Polygon siempre se dibujan encima de cualquier Data layer
let ambaPolygonsArgentina = [];
// Bordes precalculados de cada zona (unión de polígonos) — para mostrar solo el contorno exterior
let _zonaBorders = null;       // { norte: Polygon[], oeste: Polygon[], sur: Polygon[] }
let _zonaBorderPolys = {};     // google.maps.Polygon activos por zona
let marcadoresActivos = [];
const iconCache = {};
let marcadoresPoblacion = [];
let marcadoresSector = [];
let flechasExpansion = [];
let flechasPoligonos = [];
let flechaZoomListener = null;
let comunaSeleccionadaId = null;
let partidoSeleccionadoId = null;
let provinciaSeleccionadaId = null;
let provinciaAnteriorId = null;
let _provinciaCentroLatLng = null;   // centro geométrico de la provincia seleccionada

// ── Multi-selección de provincias ──
let modoMultiSeleccion = false;
let provinciasSeleccionadas = new Set(); // IDs de provincias seleccionadas

// ── Multi-selección de sectores ──
let modoMultiSector = false;
let sectoresComparados = new Set(); // IDs de sectores seleccionados

// ── Filtro de sector en Argentina ──
let sectorFiltroArgentina = null; // null = todos, o clave de sectoresExpansion
let sectorBoxAbierto = false;
let regionalizacionAbierto = false; // si el box "Regionalizar" está expandido
let comparacionBoxAbierto = false;  // si el box "Comparar" está expandido
let infoWindowGlobal = null;
let infoWindowSector = null;
let _locInfoWindowAbierto = null; // localidad cuyo InfoWindow está abierto actualmente
let _modalDesgloseAbierto = false; // si el modal de desglose está abierto
const SHEET_POLL_MS = 30000;
let _sheetPollTimer = null;
let _markerAnclaSector = null; // marker invisible que ancla el InfoWindow de sector
let categoriaActiva = null;
let regionActiva = null;
let filtroSectorActivo = null;
let filtroVighiActivo = false;
let todasProvinciasMostradas = false;
let ordenProvinciasPor = "poblacion";
let ordenProvinciasDireccion = "desc";
let geojsonCargados = 0;
const provinciasData = {};
const provinciasDataExpansion = {};
const clientesProvinciasSheets = {};
const clientesProvinciasDirectos = {}; // filas zona="PROVINCIAS" del Sheet, una por provincia
const clientesZonasBA = { norte: null, oeste: null, sur: null, interior: null }; // datos del Sheet por zona BA

// ============================================
// SECTORES DEL PROYECTO DE EXPANSIÓN
// ============================================
const sectoresExpansion = {
  "sur": {
    nombre: "Sector Sur",
    provincias: ["NEUQUEN", "RIO NEGRO", "CHUBUT", "SANTA CRUZ", "TIERRA DEL FUEGO"],
    ancla: { lat: -43.5, lng: -68.5 }  // Chubut centro (interior)
  },
  "cordillera": {
    nombre: "Sector Cordillera",
    provincias: ["MENDOZA", "SAN JUAN", "LA RIOJA", "CATAMARCA"],
    ancla: { lat: -31.5, lng: -67.5 }  // San Juan / La Rioja
  },
  "norte": {
    nombre: "Sector Norte",
    provincias: ["SALTA", "JUJUY", "CHACO", "FORMOSA", "CORRIENTES", "MISIONES"],
    ancla: { lat: -24.5, lng: -62.0 }  // Chaco / Formosa
  },
  "centro": {
    nombre: "Sector Centro",
    provincias: ["TUCUMAN", "SANTIAGO DEL ESTERO", "ENTRE RIOS", "SANTA FE", "CORDOBA", "SAN LUIS", "LA PAMPA"],
    ancla: { lat: -32.5, lng: -63.5 }  // Córdoba
  },
  "sede": {
    nombre: "Sede Central Vighi",
    provincias: ["BUENOS AIRES", "CIUDAD AUTONOMA DE BUENOS AIRES"],
    ancla: { lat: -35.5, lng: -59.5 }  // Centro provincia BA
  }
};

let sectorSeleccionadoId = null;

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

const SECTORES = {
  privado: { label: "Privado", color: "#3498db" },
  publico: { label: "Público", color: "#e74c3c" }
};

let ESTILO_BASE;
let ESTILO_SELECCIONADO;
let ESTILO_BASE_ARGENTINA;
let ESTILO_SELECCIONADO_ARGENTINA;

// ============================================
// ZONAS AMBA — clasificación de partidos por zona
// ============================================
// Zonas por código in1 (GeoJSON AMBA — 24 partidos del 1er y 2do cordón)
const ZONA_AMBA = {
  "06861": "norte",  // Vicente López
  "06756": "norte",  // San Isidro
  "06749": "norte",  // San Fernando
  "06805": "norte",  // Tigre
  "06515": "norte",  // Malvinas Argentinas
  "06371": "norte",  // General San Martín
  "06412": "norte",  // José C. Paz
  "06760": "norte",  // San Miguel
  "06427": "oeste",  // La Matanza
  "06539": "oeste",  // Merlo
  "06560": "oeste",  // Moreno
  "06408": "oeste",  // Hurlingham
  "06568": "oeste",  // Morón
  "06410": "oeste",  // Ituzaingó
  "06840": "oeste",  // Tres de Febrero
  "06028": "sur",    // Almirante Brown
  "06091": "sur",    // Berazategui
  "06270": "sur",    // Ezeiza
  "06260": "sur",    // Esteban Echeverría
  "06274": "sur",    // Florencio Varela
  "06658": "sur",    // Quilmes
  "06434": "sur",    // Lanús
  "06490": "sur",    // Lomas de Zamora
  "06035": "sur",    // Avellaneda
};

// Zonas por nombre de departamento (GeoJSON BA completo — incluye 3er cordón)
// Nombres en mayúsculas sin tildes, tal como vienen en la propiedad "departamento"
const ZONA_BA_NOMBRE = {
  // Norte — 1er y 2do cordón
  "VICENTE LOPEZ":        "norte",
  "SAN ISIDRO":           "norte",
  "SAN FERNANDO":         "norte",
  "TIGRE":                "norte",
  "MALVINAS ARGENTINAS":  "norte",
  "GENERAL SAN MARTIN":   "norte",
  "JOSE C PAZ":           "norte",
  "SAN MIGUEL":           "norte",
  // Norte — 3er cordón
  "ESCOBAR":              "norte",
  "PILAR":                "norte",
  // Oeste — 1er y 2do cordón
  "LA MATANZA":           "oeste",
  "MORON":                "oeste",
  "TRES DE FEBRERO":      "oeste",
  "HURLINGHAM":           "oeste",
  "ITUZAINGO":            "oeste",
  "MERLO":                "oeste",
  "MORENO":               "oeste",
  // Oeste — 3er cordón
  "GENERAL RODRIGUEZ":    "oeste",
  "MARCOS PAZ":           "oeste",
  // Sur — 1er y 2do cordón
  "AVELLANEDA":           "sur",
  "LANUS":                "sur",
  "LOMAS DE ZAMORA":      "sur",
  "ALMIRANTE BROWN":      "sur",
  "BERAZATEGUI":          "sur",
  "ESTEBAN ECHEVERRIA":   "sur",
  "EZEIZA":               "sur",
  "FLORENCIO VARELA":     "sur",
  "QUILMES":              "sur",
  // Sur — 3er cordón
  "PRESIDENTE PERON":     "sur",
  "SAN VICENTE":          "sur",
};

const COLORES_ZONA_AMBA = {
  norte: { fill: "#b94fd4", stroke: "#8b21a8" },
  oeste: { fill: "#9b3cc4", stroke: "#6e1a96" },
  sur:   { fill: "#cc6de0", stroke: "#a040c0" },
};

function getEstiloZonaAmba(partidoId, seleccionado) {
  if (seleccionado) return ESTILO_SELECCIONADO;
  const zona = ZONA_AMBA[partidoId];
  const color = zona ? COLORES_ZONA_AMBA[zona] : null;
  if (!color) return ESTILO_BASE;
  return {
    fillColor:    color.fill,
    fillOpacity:  0.35,
    strokeColor:  color.stroke,
    strokeWeight: 1.5,
  };
}

function initEstilos() {
  const v = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  ESTILO_BASE = {
    fillColor:    v("--map-fill"),
    fillOpacity:  parseFloat(v("--map-fill-opacity")),
    strokeColor:  v("--map-stroke"),
    strokeWeight: parseFloat(v("--map-stroke-weight"))
  };
  ESTILO_SELECCIONADO = {
    fillColor:    v("--map-sel-fill"),
    fillOpacity:  parseFloat(v("--map-sel-fill-opacity")),
    strokeColor:  v("--map-sel-stroke"),
    strokeWeight: parseFloat(v("--map-sel-stroke-weight"))
  };
  ESTILO_BASE_ARGENTINA = {
    fillColor:    v("--arg-fill"),
    fillOpacity:  parseFloat(v("--arg-fill-opacity")),
    strokeColor:  v("--arg-stroke"),
    strokeWeight: parseFloat(v("--arg-stroke-weight"))
  };
  ESTILO_SELECCIONADO_ARGENTINA = {
    fillColor:    v("--arg-sel-fill"),
    fillOpacity:  parseFloat(v("--arg-sel-fill-opacity")),
    strokeColor:  v("--arg-sel-stroke"),
    strokeWeight: parseFloat(v("--arg-sel-stroke-weight"))
  };
}

// ============================================
// DATOS DE POBLACIÓN POR PROVINCIA (Censo 2022)
// ============================================
const POBLACION_ARGENTINA = {
  "BUENOS AIRES":                    17569053,
  "CIUDAD AUTONOMA DE BUENOS AIRES":  3120612,
  "CORDOBA":                          3978984,
  "SANTA FE":                         3556522,
  "MENDOZA":                          2014533,
  "TUCUMAN":                          1703186,
  "SALTA":                            1440672,
  "ENTRE RIOS":                       1426426,
  "MISIONES":                         1280960,
  "CORRIENTES":                       1197553,
  "CHACO":                            1142963,
  "SANTIAGO DEL ESTERO":              1054028,
  "SAN JUAN":                          818234,
  "JUJUY":                             797955,
  "RIO NEGRO":                         762067,
  "NEUQUEN":                           726590,
  "FORMOSA":                           606041,
  "CHUBUT":                            603120,
  "SAN LUIS":                          540905,
  "CATAMARCA":                         429562,
  "LA PAMPA":                          358428,
  "LA RIOJA":                          384607,
  "SANTA CRUZ":                        333473,
  "TIERRA DEL FUEGO":                  190641
};

// Porcentaje de cobertura privada por provincia (fuente: datos de cobertura de salud)
const COBERTURA_PRIVADA = {
  "BUENOS AIRES":                    0.649,
  "CIUDAD AUTONOMA DE BUENOS AIRES": 0.837,
  "CATAMARCA":                       0.593,
  "CHACO":                           0.478,
  "CHUBUT":                          0.722,
  "CORDOBA":                         0.658,
  "CORRIENTES":                      0.562,
  "ENTRE RIOS":                      0.644,
  "FORMOSA":                         0.441,
  "JUJUY":                           0.538,
  "LA PAMPA":                        0.679,
  "LA RIOJA":                        0.585,
  "MENDOZA":                         0.621,
  "MISIONES":                        0.534,
  "NEUQUEN":                         0.685,
  "RIO NEGRO":                       0.654,
  "SALTA":                           0.521,
  "SAN JUAN":                        0.554,
  "SAN LUIS":                        0.630,
  "SANTA CRUZ":                      0.830,
  "SANTA FE":                        0.693,
  "SANTIAGO DEL ESTERO":             0.434,
  "TIERRA DEL FUEGO":                0.847,
  "TUCUMAN":                         0.655,
};

// Overrides de centro para provincias cuyo bounding-box GeoJSON es engañoso
// (ej: Tierra del Fuego incluye Malvinas → el centroide queda en el océano)
const PROVINCIA_CENTRO_OVERRIDE = {
  "TIERRA DEL FUEGO ANTARTIDA E ISLAS DEL ATLANTICO SUR": { lat: -54.149572305876625, lng: -67.67548062985036 },
  "TIERRA DEL FUEGO":                                     { lat: -54.149572305876625, lng: -67.67548062985036 },
};

const PROVINCIAS_DISPLAY = {
  "BUENOS AIRES":                    "Buenos Aires",
  "CIUDAD AUTONOMA DE BUENOS AIRES": "CABA",
  "CORDOBA":                         "Córdoba",
  "SANTA FE":                        "Santa Fe",
  "MENDOZA":                         "Mendoza",
  "TUCUMAN":                         "Tucumán",
  "SALTA":                           "Salta",
  "ENTRE RIOS":                      "Entre Ríos",
  "MISIONES":                        "Misiones",
  "CORRIENTES":                      "Corrientes",
  "CHACO":                           "Chaco",
  "SANTIAGO DEL ESTERO":             "Stgo. del Estero",
  "SAN JUAN":                        "San Juan",
  "JUJUY":                           "Jujuy",
  "RIO NEGRO":                       "Río Negro",
  "NEUQUEN":                         "Neuquén",
  "FORMOSA":                         "Formosa",
  "CHUBUT":                          "Chubut",
  "SAN LUIS":                        "San Luis",
  "CATAMARCA":                       "Catamarca",
  "LA PAMPA":                        "La Pampa",
  "LA RIOJA":                        "La Rioja",
  "SANTA CRUZ":                      "Santa Cruz",
  "TIERRA DEL FUEGO":                "T. del Fuego"
};

const CENTROIDES_ARGENTINA = {
  "BUENOS AIRES":                    { lat: -37.4, lng: -60.5 },
  "CIUDAD AUTONOMA DE BUENOS AIRES": { lat: -34.616,  lng: -58.4357 },
  "CORDOBA":                         { lat: -32.2348, lng: -63.6512 },
  "SANTA FE":                        { lat: -31.1792, lng: -60.9832 },
  "MENDOZA":                         { lat: -34.7867, lng: -68.4403 },
  "TUCUMAN":                         { lat: -27.069,  lng: -65.3798 },
  "SALTA":                           { lat: -24.2054, lng: -63.2575 },
  "ENTRE RIOS":                      { lat: -32.1211, lng: -59.429  },
  "MISIONES":                        { lat: -26.8303, lng: -54.3994 },
  "CORRIENTES":                      { lat: -28.9888, lng: -57.8106 },
  "CHACO":                           { lat: -26.076,  lng: -60.6922 },
  "SANTIAGO DEL ESTERO":             { lat: -28.0723, lng: -63.1376 },
  "SAN JUAN":                        { lat: -30.5014, lng: -68.8518 },
  "JUJUY":                           { lat: -23.1906, lng: -66.0555 },
  "RIO NEGRO":                       { lat: -39.7604, lng: -66.4028 },
  "NEUQUEN":                         { lat: -38.6293, lng: -69.5583 },
  "FORMOSA":                         { lat: -24.6784, lng: -60.0736 },
  "CHUBUT":                          { lat: -44.0096, lng: -68.4747 },
  "SAN LUIS":                        { lat: -33.8991, lng: -65.9406 },
  "CATAMARCA":                       { lat: -27.6392, lng: -67.4912 },
  "LA PAMPA":                        { lat: -36.9682, lng: -65.817  },
  "LA RIOJA":                        { lat: -29.8668, lng: -66.8501 },
  "SANTA CRUZ":                      { lat: -49.1972, lng: -70.394  },
  "TIERRA DEL FUEGO":                { lat: -54.5,    lng: -67.5    }
};

function getProvinciasDataActivo() {
  return regionActiva === "expansion" ? provinciasDataExpansion : provinciasData;
}

function filtrarPorCategoria(localidades) {
  if (!categoriaActiva || !CATEGORIAS[categoriaActiva]) return localidades;
  const tipos = CATEGORIAS[categoriaActiva].tipos;
  return localidades.filter(loc => tipos.includes(loc.tipo));
}

function filtrarPorSector(localidades) {
  let result = localidades;
  if (filtroSectorActivo) {
    result = result.filter(loc => (loc.sector || "privado") === filtroSectorActivo);
  }
  if (filtroVighiActivo) {
    result = result.filter(loc => (loc.prioridad || "").toLowerCase() === 'vighi');
  }
  return result;
}
function seleccionarCategoria(cat, region) {
  categoriaActiva = cat;
  regionActiva = region || null;

  const menu = document.getElementById("menuInicio");
  menu.classList.add("oculto");
  setTimeout(() => { menu.style.display = "none"; }, 400);

  const catInfo = CATEGORIAS[cat];
  const leyenda = document.getElementById("leyendaPrioridad");
  if (leyenda) leyenda.style.display = "block";
  document.getElementById("categoriaActualLabel").textContent =
    regionActiva === "argentina" ? "Argentina" :
    regionActiva === "expansion" ? "Proyecto de Expansión" :
    catInfo.label;
  document.getElementById("mapaTitulo").textContent =
    (regionActiva === "argentina" || regionActiva === "expansion")
      ? "Mapa de Argentina"
      : "Mapa de Buenos Aires";
  document.getElementById("panelDesc").textContent =
    (regionActiva === "argentina" || regionActiva === "expansion")
      ? "Hacé click en una provincia para ver los prestadores que trabajan con Vighi."
      : `Hacé click en una comuna o partido para ver los ${catInfo.label.toLowerCase()} que trabajan con Vighi.`;
  document.getElementById("searchInput").placeholder =
    cat === "sanatorios" ? "Buscar sanatorio o dirección..." : "Buscar consultorio o dirección...";

  // Mostrar/ocultar capas según región
  if (regionActiva === "argentina" || regionActiva === "expansion") {
    if (map) {
      map.data.setMap(null);
      if (ambaDataLayer) ambaDataLayer.setMap(null);
      // Solo mostrar si ya cargó; si no, el callback de cargarGeoJSONArgentina lo mostrará
      if (argentinaLoaded && argentinaDataLayer) argentinaDataLayer.setMap(map);
      // Polígonos AMBA encima de Argentina (siempre por encima de Data layers)
      mostrarPolygonsAmbaEnArgentina();
      map.setCenter({ lat: -38.5, lng: -65 });
      map.setZoom(4);
      if (regionActiva === "expansion") {
        aplicarEstiloExpansionBase();
        mostrarFlechasExpansion();
      }
    }
  } else {
    if (map) {
      map.data.setMap(map);
      if (argentinaDataLayer) argentinaDataLayer.setMap(null);
      ocultarPolygonsAmbaEnArgentina();
      if (ambaDataLayer) {
        ambaDataLayer.setMap(map);
        aplicarEstiloBaseAmba();
      }
      map.setCenter({ lat: -34.62, lng: -58.52 });
      map.setZoom(11);
    }
  }

  mostrarTodasLasLocalidades();
}

function volverAlMenu() {
  const avisoEl = document.getElementById('aviso-mensual-panel');
  if (avisoEl) avisoEl.style.display = 'none';
  comunaSeleccionadaId = null;
  partidoSeleccionadoId = null;
  provinciaSeleccionadaId = null;
  sectorSeleccionadoId = null;
  sectorFiltroArgentina = null;
  sectorBoxAbierto = false;
  regionalizacionAbierto = false;
  ocultarFloatingSector();
  _provinciaCentroLatLng = null;
  regionActiva = null;
  marcadoresActivos.forEach(m => m.setMap(null));
  marcadoresActivos = [];
  ocultarEtiquetasPoblacion();
  ocultarEtiquetasSector();
  ocultarFlechasExpansion();
  if (map) {
    map.data.setMap(map);
    aplicarEstiloBase();
    aplicarEstiloBaseAmba();
    if (argentinaDataLayer) argentinaDataLayer.setMap(null);
    ocultarPolygonsAmbaEnArgentina();
  }

  const input = document.getElementById("searchInput");
  const clearBtn = document.getElementById("searchClear");
  input.value = "";
  clearBtn.style.display = "none";

  categoriaActiva = null;

  const leyenda = document.getElementById("leyendaPrioridad");
  if (leyenda) leyenda.style.display = "none";

  document.getElementById("mapaTitulo").textContent = "Mapa de Buenos Aires";

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

function resetFiltroSector() {
  filtroSectorActivo = null;
  filtroVighiActivo = false;
  const selectElement = document.getElementById("filtroSector");
  if (selectElement) {
    selectElement.value = "";
  }
}

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

  if (regionActiva === "argentina") {
    const CABA_KEY = "CIUDAD AUTONOMA DE BUENOS AIRES";
    const BA_KEY   = "BUENOS AIRES";

    // CABA y Buenos Aires como entidades separadas
    const provinciasConLocs = Object.keys(provinciasData)
      .map(id => {
        const locs = filtrarPorSector(filtrarPorCategoria(provinciasData[id].localidades || []));
        return { id, ...provinciasData[id], locs };
      })
      .filter(p => p.locs.length > 0)
      .sort((a, b) => {
        const na = PROVINCIAS_DISPLAY[a.id] || toTitleCase(a.id);
        const nb = PROVINCIAS_DISPLAY[b.id] || toTitleCase(b.id);
        return na.localeCompare(nb, 'es');
      });
    const totalArg = provinciasConLocs.reduce((s, p) => s + p.locs.length, 0);

    // Fila total Argentina
    const pobTotalArg = Object.values(POBLACION_ARGENTINA).reduce((s, v) => s + v, 0);
    // Usar facturación recalculada después de cargar el Sheet
    let facturacionTotalArgentina = filtroSectorActivo === 'privado'
      ? (window._facturacionPrivadaArgentina  || 0)
      : filtroSectorActivo === 'publico'
      ? (window._facturacionPublicaArgentina  || 0)
      : (window._facturacionTotalArgentinaActual || 0);

    const filaArgentina = `
      <div class="pob-argentina-card ${todasProvinciasMostradas ? 'pob-argentina-activa' : ''}" onclick="${todasProvinciasMostradas ? '' : 'seleccionarTodaArgentina()'}" title="${todasProvinciasMostradas ? '' : 'Ver todos los prestadores de Argentina'}">
        <div class="pob-argentina-top">
          <span class="pob-argentina-titulo">🗺️ Argentina</span>
          <div class="pob-argentina-top-right">
            ${totalArg > 0 ? `<span class="pob-prest pob-prest-total pob-argentina-prest">${totalArg} prest.</span>` : ""}
            ${todasProvinciasMostradas ? `<button class="btn-cerrar-argentina" onclick="event.stopPropagation(); deseleccionarTodaArgentina()" title="Cerrar vista general">✕</button>` : ""}
          </div>
        </div>
        <div class="pob-argentina-pob">${formatPoblacion(pobTotalArg)} hab.</div>
        ${facturacionTotalArgentina > 0 ? `
        <div class="pob-argentina-bottom">
          <span class="pob-argentina-fac-label">💰 Total facturado</span>
          <span class="pob-argentina-fac-valor">USD ${facturacionTotalArgentina.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>` : ""}
        <div class="sector-toggle-arg" onclick="event.stopPropagation()">
          <button class="sector-btn-arg ${!filtroSectorActivo ? 'sector-btn-activo' : ''}" data-sector="" onclick="filtrarSectorArgentina(null)">Todos</button>
          <button class="sector-btn-arg ${filtroSectorActivo === 'privado' ? 'sector-btn-activo' : ''}" data-sector="privado" onclick="filtrarSectorArgentina('privado')">Privado</button>
          <button class="sector-btn-arg ${filtroSectorActivo === 'publico' ? 'sector-btn-activo' : ''}" data-sector="publico" onclick="filtrarSectorArgentina('publico')">Público</button>
        </div>
      </div>`;

    const sectorSubHtml = `
      <div class="sector-box-contenido">
        <button class="sector-box-btn ${!sectorFiltroArgentina ? 'sector-box-btn-activo' : ''}" onclick="seleccionarSectorArgentina(null)">
          🗺️ Todas las provincias
        </button>
        ${Object.keys(sectoresExpansion).map(sectorId => {
          const sector = sectoresExpansion[sectorId];
          const activo = sectorFiltroArgentina === sectorId;
          const cantProv = sector.provincias.length;
          const sectorPrest = sector.provincias.reduce((sum, provId) => {
            const conLocs = provinciasConLocs.find(p => p.id === provId);
            return sum + (conLocs ? conLocs.locs.length : 0);
          }, 0);
          const sectorPobEf = sector.provincias.reduce((sum, provId) => {
            const pob = POBLACION_ARGENTINA[provId] || 0;
            const cobPrivada = COBERTURA_PRIVADA[provId] || 0.65;
            return sum + (filtroSectorActivo === "privado" ? pob * cobPrivada
                        : filtroSectorActivo === "publico" ? pob * (1 - cobPrivada)
                        : pob);
          }, 0);
          const enComparacion = modoMultiSector && sectoresComparados.has(sectorId);
          return `<button class="sector-box-btn ${activo ? 'sector-box-btn-activo' : ''} ${enComparacion ? 'sector-box-btn-comparado' : ''}" onclick="seleccionarSectorArgentina('${sectorId}')">
            <span class="sector-box-nombre">${sector.nombre}${enComparacion ? ' <span class="sector-comparado-check">✓</span>' : ''}</span>
            <span class="sector-box-meta">
              <span class="sector-box-count">${cantProv} prov. · ${sectorPrest} prest.</span>
            </span>
          </button>`;
        }).join('')}
      </div>
    `;

    const regionalizacionHtml = `
      <div class="regionalizacion-box">
        <div class="regionalizacion-header" onclick="toggleRegionalizacion()">
          <span class="regionalizacion-titulo">
            ⊕ Regionalizar
            ${sectorFiltroArgentina ? `<span class="reg-modo-badge">${sectoresExpansion[sectorFiltroArgentina].nombre}</span>` : ''}
          </span>
          <span class="regionalizacion-flecha">${regionalizacionAbierto ? '▼' : '▶'}</span>
        </div>
        <div id="regionalizacion-contenido" style="display:${regionalizacionAbierto ? 'block' : 'none'}">
          ${sectorSubHtml}
        </div>
      </div>
      <div class="regionalizacion-box">
        <div class="regionalizacion-header" onclick="toggleComparacionBox()">
          <span class="regionalizacion-titulo">
            📊 Comparar Provincias
            ${modoMultiSeleccion ? '<span class="reg-modo-badge">Activo</span>' : ''}
          </span>
          <span class="comparacion-flecha">${comparacionBoxAbierto ? '▼' : '▶'}</span>
        </div>
        <div id="comparacion-contenido" style="display:${comparacionBoxAbierto ? 'block' : 'none'}">
          ${modoMultiSeleccion ? `<div id="barra-multi" class="barra-multi-container"></div>` : ''}
        </div>
      </div>
    `;

    // Ranking completo de población (sin filtro de sector en la lista)
    const provRows = Object.keys(POBLACION_ARGENTINA).map(prov => {
      const pob = POBLACION_ARGENTINA[prov];
      const conLocs = provinciasConLocs.find(p => p.id === prov);
      const cantPrest = conLocs ? conLocs.locs.length : 0;
      const cobPrivada = COBERTURA_PRIVADA[prov] || 0.65;
      const pobEfectiva = filtroSectorActivo === "privado" ? pob * cobPrivada
                        : filtroSectorActivo === "publico" ? pob * (1 - cobPrivada)
                        : pob;
      // Facturación desde Sheet
      let fac = 0;
      const sheetData = (clientesProvinciasSheets[prov] || []).filter(c => {
        if (!filtroSectorActivo) return true;
        return (c.sector || "privado") === filtroSectorActivo;
      });
      if (sheetData.length) {
        sheetData.forEach(c => {
          const raw = (c.facturacion || "").replace(/U\$S/g, "").replace(/\s/g, "").replace(/,/g, "");
          const val = parseFloat(raw);
          if (!isNaN(val) && val > 0) fac += val;
        });
      } else if (conLocs) {
        conLocs.locs.forEach(loc => {
          (loc.nomencladores || []).forEach(n => {
            if (n.tipo === "total facturado") {
              const val = parseFloat((n.cantidad || "").replace(/[^0-9.]/g, ""));
              if (!isNaN(val)) fac += val;
            }
          });
        });
      }
      return { prov, pob, pobEfectiva, cantPrest, fac };
    });

    const dir = ordenProvinciasDireccion === "asc" ? 1 : -1;
    if (ordenProvinciasPor === "ratio") {
      provRows.sort((a, b) => dir * (a.fac - b.fac));
    } else if (ordenProvinciasPor === "prest") {
      provRows.sort((a, b) => dir * (a.cantPrest - b.cantPrest));
    } else if (ordenProvinciasPor === "nombre") {
      provRows.sort((a, b) => dir * (PROVINCIAS_DISPLAY[a.prov] || a.prov).localeCompare(PROVINCIAS_DISPLAY[b.prov] || b.prov, 'es'));
    } else {
      provRows.sort((a, b) => dir * (a.pobEfectiva - b.pobEfectiva));
    }

    const pobRanking = provRows.map(({ prov, pob, pobEfectiva, cantPrest, fac }) => {
        const nombre = PROVINCIAS_DISPLAY[prov] || toTitleCase(prov);
        const clickFn = modoMultiSeleccion
          ? `seleccionarProvincia('${prov}')`
          : `mostrarResumenProvincia('${prov}')`;
        const estaSeleccionada = modoMultiSeleccion && provinciasSeleccionadas.has(prov);
        const enSector = sectorFiltroArgentina && sectoresExpansion[sectorFiltroArgentina].provincias.includes(prov);
        const facStr = fac > 0
          ? `U$S ${fac.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
          : null;
        return `
          <div class="pob-row ${cantPrest > 0 ? 'pob-row-activa' : ''} ${estaSeleccionada ? 'pob-row-seleccionada' : ''} ${enSector ? 'pob-row-en-sector' : ''}" data-prov="${prov}" data-nombre="${nombre}" ${cantPrest > 0 ? `onclick="${clickFn}"` : ''}>
            <span class="pob-nombre">${estaSeleccionada ? '✓ ' : ''}${nombre}</span>
            <span class="pob-numero">${formatPoblacion(Math.round(pobEfectiva))}</span>
            ${cantPrest > 0 ? `<span class="pob-prest">${cantPrest} prest.</span>` : ""}
            ${facStr ? `<span class="pob-ratio">${facStr}</span>` : ""}
          </div>`;
      }).join("");

    const avisoEl = document.getElementById('aviso-mensual-panel');
    if (avisoEl) avisoEl.style.display = regionActiva === 'argentina' ? '' : 'none';

    let htmlArg = `
      ${filaArgentina}
      ${regionalizacionHtml}
      <div class="region-subtitulo">📊 Población por provincia</div>
      <div class="pob-subtitulo">Censo 2022 · Hacé click en una provincia con prestadores</div>
      <div class="pob-tabla-header">
        <span class="pob-th pob-th-nombre pob-th-clickable ${ordenProvinciasPor === 'nombre' ? 'pob-th-activo' : ''}" onclick="toggleOrdenProvincias('nombre')">Provincia ${ordenProvinciasPor === 'nombre' ? (ordenProvinciasDireccion === 'desc' ? '▼' : '▲') : '↕'}</span>
        <span class="pob-th pob-th-pob pob-th-clickable ${ordenProvinciasPor === 'poblacion' ? 'pob-th-activo' : ''}" onclick="toggleOrdenProvincias('poblacion')">Población ${ordenProvinciasPor === 'poblacion' ? (ordenProvinciasDireccion === 'desc' ? '▼' : '▲') : '↕'}</span>
        <span class="pob-th pob-th-prest pob-th-clickable ${ordenProvinciasPor === 'prest' ? 'pob-th-activo' : ''}" onclick="toggleOrdenProvincias('prest')">Prest. ${ordenProvinciasPor === 'prest' ? (ordenProvinciasDireccion === 'desc' ? '▼' : '▲') : '↕'}</span>
        <span class="pob-th pob-th-ratio pob-th-clickable ${ordenProvinciasPor === 'ratio' ? 'pob-th-activo' : ''}" onclick="toggleOrdenProvincias('ratio')">Fact. U$S ${ordenProvinciasPor === 'ratio' ? (ordenProvinciasDireccion === 'desc' ? '▼' : '▲') : '↕'}</span>
      </div>
      <div class="pob-lista">${pobRanking}</div>
    `;

    panelBody.innerHTML = htmlArg;
    if (modoMultiSeleccion) mostrarBarraMultiSeleccion();
    return;
  }

  if (regionActiva === "expansion") {
    const sectoresList = Object.keys(sectoresExpansion).map(sectorId => ({
      id: sectorId,
      nombre: sectoresExpansion[sectorId].nombre,
      locs: getLocalidadesDeSector(sectorId)
    }));
    const totalExp = sectoresList.reduce((s, sec) => s + sec.locs.length, 0);
    let htmlExp = `
      <div class="region-subtitulo">🚀 Proyecto de Expansión</div>
    `;
    if (totalExp > 0) {
      htmlExp = `
        <div class="todas-header">
          <span>${totalExp} ubicaciones en total</span>
          <button id="btnVerTodos" class="btn-ver-todos" onclick="mostrarTodosLosMarcadores()">📍 Ver todos en el mapa</button>
        </div>
      ` + htmlExp;
    }
    htmlExp += sectoresList.map(sector => {
      const ordenadas = [...sector.locs].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
      return `
        <div class="seccion-titulo todas-titulo" onclick="seleccionarSector('${sector.id}')" title="Ver en el mapa">
          ${sector.nombre}
        </div>
        ${ordenadas.map(loc => `
          <div class="localidad-item" onclick="seleccionarSector('${sector.id}')">
            <strong>${loc.nombre}</strong>
            <small>📌 ${loc.direccion} &nbsp;•&nbsp; <span class="badge">${loc.tipo}</span></small>
          </div>
        `).join("")}
      `;
    }).join("");
    panelBody.innerHTML = htmlExp;
    return;
  }

  if (comunasConLocs.length > 0) {
    html += `<div class="region-subtitulo">📍 Ciudad de Buenos Aires</div>`;
    html += renderItems(comunasConLocs, "seleccionarComuna", "caba");
  }

  if (partidosConLocs.length > 0) {
    html += `<div class="region-subtitulo">🗺️ Conurbano Bonaerense</div>`;
    html += `
      <div class="amba-zona-leyenda">
        <span class="amba-zona-chip amba-zona-norte">● Norte</span>
        <span class="amba-zona-chip amba-zona-oeste">● Oeste</span>
        <span class="amba-zona-chip amba-zona-sur">● Sur</span>
      </div>`;
    // Agrupar por zona para el panel
    const ZONA_LABEL = { norte: "Norte", oeste: "Oeste", sur: "Sur" };
    const ZONA_ORDEN = ["norte", "oeste", "sur"];
    const grupos = { norte: [], oeste: [], sur: [], sin_zona: [] };
    partidosConLocs.forEach(p => {
      const zona = ZONA_AMBA[p.id] || "sin_zona";
      grupos[zona].push(p);
    });
    ZONA_ORDEN.forEach(zona => {
      if (grupos[zona].length === 0) return;
      html += `<div class="amba-zona-grupo-titulo amba-zona-grupo-${zona}">${ZONA_LABEL[zona]}</div>`;
      html += renderItems(grupos[zona], "seleccionarPartido", "amba");
    });
    if (grupos.sin_zona.length > 0) {
      html += renderItems(grupos.sin_zona, "seleccionarPartido", "amba");
    }
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
function initMap() {
  initEstilos();
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: -34.65, lng: -58.55 },
    zoom: 10,
    mapTypeControl: true,
    streetViewControl: false,
    fullscreenControl: true
  });

  infoWindowGlobal = new google.maps.InfoWindow({ disableAutoPan: true });
  infoWindowGlobal.addListener("closeclick", () => { _locInfoWindowAbierto = null; });
  // infoWindowSector se crea lazy en mostrarFloatingSector()


  ambaDataLayer = new google.maps.Data();
  argentinaDataLayer = new google.maps.Data();

  // Cargar todos los GeoJSONs en background inmediatamente (ocultos hasta que se seleccione la región)
  map.data.setMap(null); // CABA oculto hasta que el usuario elija CABA/AMBA
  cargarGeoJSON();
  cargarGeoJSONAmba();
  cargarGeoJSONArgentina();

  // Datos de prestadores y Sheet (para el panel)
  cargarDatosExternos().then(function () {
    return cargarDesdeSheetsArgentina();
  }).then(function () {
    iniciarPollingSheet();
  });
}

// ============================================
// POLLING DEL GOOGLE SHEET (actualización cada 30s)
// ============================================
function iniciarPollingSheet() {
  if (_sheetPollTimer) return;
  _sheetPollTimer = setInterval(function () {
    if (document.hidden) return; // pestaña en background: no pedir
    cargarDesdeSheetsArgentina().then(refrescarVistaActual);
  }, SHEET_POLL_MS);
}

function refrescarVistaActual() {
  if (_locInfoWindowAbierto && infoWindowGlobal && infoWindowGlobal.getMap()) {
    infoWindowGlobal.setContent(construirContenidoPopup(_locInfoWindowAbierto));
  }
  refrescarModalDesgloseSiAbierto();

  if (regionActiva !== "argentina") return;

  if (provinciaSeleccionadaId) {
    mostrarInfoPanelProvincia(provinciaSeleccionadaId);
  } else {
    mostrarTodasLasLocalidades();
  }
}

// ============================================
// AJUSTAR VISTA AL TERMINAR DE CARGAR AMBAS CAPAS
// ============================================
function verificarYAjustarBounds() {
  geojsonCargados++;
  if (geojsonCargados < 2) return;

  // Solo ajustar si no estamos en Argentina o Expansión
  if (regionActiva === "argentina" || regionActiva === "expansion") return;

  map.setCenter({ lat: -34.62, lng: -58.52 });
  map.setZoom(11);
}

// ============================================
// ETIQUETAS DE POBLACIÓN (ARGENTINA)
// ============================================
function formatPoblacion(n) {
  return n.toLocaleString("es-AR");
}
function toTitleCase(str) {
  return str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

// ============================================
// VOLVER AL LISTADO COMPLETO
// ============================================
function toggleDesgloseCard(btn) {
  const desglose = btn.nextElementSibling;
  const flecha = btn.querySelector('.prov-card-flecha');
  const abierto = desglose.style.display !== 'none';
  desglose.style.display = abierto ? 'none' : 'block';
  flecha.textContent = abierto ? '▾' : '▴';
}

function volverAlListado() {
  if (infoWindowGlobal) infoWindowGlobal.close();
  comunaSeleccionadaId = null;
  partidoSeleccionadoId = null;
  provinciaSeleccionadaId = null;
  provinciaAnteriorId = null;
  sectorSeleccionadoId = null;
  _provinciaCentroLatLng = null;
  resetFiltroSector();

  marcadoresActivos.forEach(m => m.setMap(null));
  marcadoresActivos = [];
  ocultarEtiquetasSector();

  aplicarEstiloBase();
  aplicarEstiloBaseAmba();
  resetEstiloPolygonsAmba();
  if (regionActiva === "expansion") {
    aplicarEstiloExpansionBase();
  } else {
    aplicarEstiloBaseArgentina();
  }

  if (regionActiva === "argentina") {
    if (map) { map.setCenter({ lat: -38.5, lng: -65 }); map.setZoom(4); }
  }

  mostrarTodasLasLocalidades();
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
    ctx.fillStyle = borderColor === "#ffffff" ? "#ffffff" : "#a020a8";
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
  // Filtrar por sector si hay un filtro activo
  let localidadesFiltradas = localidades;
  if (filtroSectorActivo) {
    localidadesFiltradas = localidades.filter(loc => {
      const sector = loc.sector || "privado";
      return sector === filtroSectorActivo;
    });
  }

  if (localidadesFiltradas.length === 0) return;

  const vistas = new Set();
  const pares = [];
  localidadesFiltradas.forEach(loc => {
    const logoUrl = loc.logo || "logo_vighi.png";
    const color = getColorPorPrioridad(loc.prioridad);
    const key = logoUrl + "\0" + color;
    if (!vistas.has(key)) {
      vistas.add(key);
      pares.push({ logoUrl, color, key });
    }
  });

  const paresNuevos = pares.filter(({ key }) => !iconCache[key]);
  if (paresNuevos.length === 0) {
    _colocarMarcadores(localidadesFiltradas, iconCache);
    return;
  }

  let pendientes = paresNuevos.length;

  paresNuevos.forEach(({ logoUrl, color, key }) => {
    crearIconoPin(logoUrl, color, function(iconUrl, W, H, cx) {
      iconCache[key] = {
        url: iconUrl,
        scaledSize: new google.maps.Size(W, H),
        anchor: new google.maps.Point(cx, H)
      };
      pendientes--;
      if (pendientes === 0) {
        _colocarMarcadores(localidadesFiltradas, iconCache);
      }
    });
  });
}

function construirDesgloseHtml(loc) {
  const grupos = { eficiencia: [], capacidad: [], volumen: [], "volumen total": [], "total facturado": [], otros: [] };
  (loc.nomencladores || []).forEach(n => {
    const t = (n.tipo || "").toLowerCase();
    if (grupos[t]) grupos[t].push(n);
    else grupos.otros.push(n);
  });
  let html = "";
  if (grupos.capacidad.length) {
    html += `<div class="popup-seccion-titulo">Capacidad instalada</div><table class="popup-tabla"><tbody>`;
    grupos.capacidad.forEach(n => { html += `<tr><td>${n.codigo}</td><td>${n.cantidad}</td></tr>`; });
    html += `</tbody></table>`;
  }
  if (grupos.volumen.length) {
    html += `<div class="popup-seccion-titulo">Volumen</div><table class="popup-tabla"><tbody>`;
    grupos.volumen.forEach(n => { html += `<tr><td>${n.codigo}</td><td>${n.cantidad}</td></tr>`; });
    html += `</tbody></table>`;
  }
  if (grupos["volumen total"].length) {
    grupos["volumen total"].forEach(n => {
      if (n.cantidad && n.cantidad !== "0") {
        html += `<div class="popup-seccion-total-vol">📊 Volúmenes totales por dirección: <strong>${n.cantidad}</strong></div>`;
      }
    });
  }
  if (grupos["total facturado"].length) {
    grupos["total facturado"].forEach(n => {
      if (n.cantidad && n.cantidad !== "-") {
        html += `<div class="popup-seccion-fac">💰 Facturación estimada: <strong>${n.cantidad}</strong></div>`;
      }
    });
  }
  grupos.otros.forEach(n => {
    const esTotal = n.tipo && (n.tipo.toLowerCase() === "total" || n.tipo.toLowerCase() === "total facturado");
    const esTotalFacturado = n.tipo && n.tipo.toLowerCase() === "total facturado";
    const etiqueta = n.tipo && n.tipo.toLowerCase() === "presencia" ? "Presencia Patólogo" : n.tipo && n.tipo.toLowerCase() === "total" ? "Total" : n.codigo;
    const facturado = n.facturado || (esTotalFacturado ? n.cantidad : "");
    const cantidadCell = esTotalFacturado ? (regionActiva === 'argentina' ? facturado : "") : n.cantidad;
    html += `<table class="popup-tabla"><tbody><tr${esTotal ? ' class="popup-fila-total"' : ""}><td>${etiqueta}</td><td>${cantidadCell}</td>${regionActiva !== 'argentina' ? `<td>${facturado}</td>` : ''}</tr></tbody></table>`;
  });
  return html;
}

function construirContenidoPopup(loc) {
  return `
        <div class="popup-container">
          ${loc.imagen ? `<img src="${loc.imagen}" alt="${loc.nombre}" class="popup-imagen" style="width:100%;max-height:120px;object-fit:contain;border-radius:8px;margin-bottom:10px;background:white;display:block;">` : ""}
          <strong class="popup-nombre">${loc.nombre}</strong>
          <p class="popup-direccion">${loc.direccion}</p>
          <span class="popup-tipo">${loc.tipo}</span>
          ${loc.nomencladores && loc.nomencladores.length ? `
          <button class="popup-btn-desglose" onclick="toggleDesglose(this)">Ver desglose <span class="popup-btn-flecha">&#9660;</span></button>
          <div id="nomDesglose" class="popup-desglose">
            ${construirDesgloseHtml(loc)}
          </div>
          ` : ""}
        </div>
      `;
}

function _colocarMarcadores(localidades, iconCache) {
  localidades.forEach(loc => {
    const logoUrl = loc.logo || "logo_vighi.png";
    const color = getColorPorPrioridad(loc.prioridad);
    const key = logoUrl + "\0" + color;
    const marker = new google.maps.Marker({
      position: { lat: loc.lat, lng: loc.lng },
      map: map,
      title: loc.nombre,
      animation: google.maps.Animation.DROP,
      icon: iconCache[key]
    });

    marker.addListener("click", () => {
      _locInfoWindowAbierto = loc;
      infoWindowGlobal.setContent(construirContenidoPopup(loc));
      map.setCenter(marker.getPosition());
      infoWindowGlobal.open(map, marker);
      google.maps.event.addListenerOnce(infoWindowGlobal, 'domready', function() {
        liberarAlturaInfoWindow();
        setTimeout(centrarInfoWindow, 150);
      });
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
  // Abrir el InfoWindow del marker en esas coordenadas
  setTimeout(() => {
    const marcador = marcadoresActivos.find(m => {
      const pos = m.getPosition();
      return Math.abs(pos.lat() - lat) < 0.0001 && Math.abs(pos.lng() - lng) < 0.0001;
    });
    if (marcador) google.maps.event.trigger(marcador, "click");
  }, 300);
}

// Panea el mapa para que el InfoWindow quede completamente visible en pantalla
function ajustarInfoWindowVisible() {
  setTimeout(function() {
    var iw = document.querySelector('.gm-style-iw-t')
           || document.querySelector('.gm-style-iw-c')
           || document.querySelector('.gm-style-iw');
    if (!iw) return;
    var rect = iw.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    var pad = 16;
    var dx = 0, dy = 0;
    if (rect.top < pad)
      dy = rect.top - pad;
    else if (rect.bottom > window.innerHeight - pad)
      dy = rect.bottom - window.innerHeight + pad;

    if (rect.left < pad)
      dx = rect.left - pad;
    else if (rect.right > window.innerWidth - pad)
      dx = rect.right - window.innerWidth + pad;

    if (Math.abs(dx) > 1 || Math.abs(dy) > 1) map.panBy(dx, dy);
  }, 300);
}

function centrarInfoWindow() {
  var iw = document.querySelector('.gm-style-iw-c')
         || document.querySelector('.gm-style-iw-t')
         || document.querySelector('.gm-style-iw');
  if (!iw) return;
  var rect = iw.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return;

  var panel = document.getElementById('sidePanel');
  var panelWidth = (panel && window.innerWidth > 768) ? panel.offsetWidth : 0;
  var mapCenterX = panelWidth + (window.innerWidth - panelWidth) / 2;
  var mapCenterY = window.innerHeight / 2;
  var dx = (rect.left + rect.width / 2) - mapCenterX;
  var dy = (rect.top + rect.height / 2) - mapCenterY;
  if (Math.abs(dx) > 1 || Math.abs(dy) > 1) map.panBy(dx, dy);
}

function liberarAlturaInfoWindow() {
  // Google Maps aplica max-height inline via JS después del CSS — hay que forzarlo desde domready
  var iwd = document.querySelector('.gm-style-iw-d');
  if (iwd) {
    iwd.setAttribute('style',
      (iwd.getAttribute('style') || '').replace(/max-height:[^;]+;?/g, '') +
      '; max-height: none !important; overflow-y: auto !important;'
    );
  }
  var iwc = document.querySelector('.gm-style-iw-c');
  if (iwc) {
    iwc.setAttribute('style',
      (iwc.getAttribute('style') || '').replace(/max-height:[^;]+;?/g, '') +
      '; max-height: none !important;'
    );
  }
  // Forzar padding 0 en el botón X (no alcanza con element.style, requiere setAttribute)
  var closeBtn = document.querySelector('.gm-style-iw-chr button');
  if (closeBtn) {
    closeBtn.setAttribute('style',
      (closeBtn.getAttribute('style') || '') + '; padding: 0px !important;'
    );
  }
}
function toggleDesglose(btn) {
  var d = document.getElementById('nomDesglose');
  if (!d) return;

  // Obtener el nombre del marcador del popup
  var nombreEl = document.querySelector('.popup-nombre');
  var nombre = nombreEl ? nombreEl.textContent : "Desglose";

  // Mostrar en modal lateral
  _modalDesgloseAbierto = true;
  abrirModalDesglose(nombre, d.innerHTML);
}

function refrescarModalDesgloseSiAbierto() {
  if (!_modalDesgloseAbierto || !_locInfoWindowAbierto) return;
  var overlay = document.getElementById('desglose-overlay');
  if (!overlay || overlay.style.display === 'none') return;
  document.getElementById('desglose-modal-titulo').textContent = _locInfoWindowAbierto.nombre;
  document.getElementById('desglose-modal-body').innerHTML = construirDesgloseHtml(_locInfoWindowAbierto);
}

function abrirModalDesglose(titulo, contenidoHtml) {
  // Crear overlay si no existe
  var overlay = document.getElementById('desglose-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'desglose-overlay';
    overlay.innerHTML = `
      <div id="desglose-modal">
        <div id="desglose-modal-header">
          <span id="desglose-modal-titulo"></span>
          <button id="desglose-modal-cerrar" onclick="cerrarModalDesglose()">✕</button>
        </div>
        <div id="desglose-modal-body"></div>
      </div>
    `;
    document.body.appendChild(overlay);
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) cerrarModalDesglose();
    });
  }

  document.getElementById('desglose-modal-titulo').textContent = titulo;
  document.getElementById('desglose-modal-body').innerHTML = contenidoHtml;
  overlay.style.display = 'flex';
  requestAnimationFrame(() => overlay.classList.add('desglose-visible'));
}

function cerrarModalDesglose() {
  _modalDesgloseAbierto = false;
  var overlay = document.getElementById('desglose-overlay');
  if (overlay) {
    overlay.classList.remove('desglose-visible');
    setTimeout(() => { overlay.style.display = 'none'; }, 250);
  }
}
