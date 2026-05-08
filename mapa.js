// ============================================
// CONFIGURACIÓN
// ============================================
const GEOJSON_URL = "barriosGeoJson.json";
const GEOJSON_AMBA_URL = "ambaGeoJson.json";
const GEOJSON_ARGENTINA_URL = "agrentinaProvincesGeoJson.json";

const SHEETS_CSV_URL = "https://docs.google.com/spreadsheets/d/1LWynrRdnZSB9kaYPBZsRtswAAHDJIQHDwrRRdR2jwa8/gviz/tq?tqx=out:csv&sheet=resumen";

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

function cargarDesdeSheetsArgentina() {
  return fetch(SHEETS_CSV_URL)
    .then(r => r.ok ? r.text() : Promise.reject("No se pudo cargar el Sheet"))
    .then(texto => {
      const filas = parsearCSVSheets(texto);
      if (filas.length < 2) return;

      const COL = { cliente:0, zona:1, tipo:2, qx:3, amb:4, salaEndo:5, ce:6, qx2:7, amb2:8, salaEndo2:9, ce2:10, facturacion:11 };

      // Construir índice de localidades de provinciasData por nombre normalizado
      const indicePorNombre = {};
      Object.values(provinciasData).forEach(prov => {
        (prov.localidades || []).forEach(loc => {
          const key = normalizarNombre(loc.nombre);
          if (key) indicePorNombre[key] = loc;
        });
      });

      filas.slice(1).forEach(row => {
        const nombre = (row[COL.cliente] || "").trim();
        if (!nombre || nombre.toUpperCase() === "TOTAL") return;

        const nomencladores = [
          { tipo: "eficiencia",     codigo: "QX",                  cantidad: row[COL.qx]       || "-" },
          { tipo: "eficiencia",     codigo: "AMB",                 cantidad: row[COL.amb]      || "-" },
          { tipo: "eficiencia",     codigo: "SALA/ENDO",           cantidad: row[COL.salaEndo] || "-" },
          { tipo: "eficiencia",     codigo: "CE",                  cantidad: row[COL.ce]       || "-" },
          { tipo: "capacidad",      codigo: "QX",                  cantidad: row[COL.qx2]      || "0" },
          { tipo: "capacidad",      codigo: "AMB",                 cantidad: row[COL.amb2]     || "0" },
          { tipo: "capacidad",      codigo: "SALA/ENDO",           cantidad: row[COL.salaEndo2]|| "0" },
          { tipo: "capacidad",      codigo: "CE",                  cantidad: row[COL.ce2]      || "0" },
          { tipo: "total facturado",codigo: "Facturación estimada",cantidad: row[COL.facturacion] || "-" },
        ];

        // Buscar la localidad en el JSON por nombre y actualizar sus nomencladores
        const key = normalizarNombre(nombre);
        const loc = indicePorNombre[key];
        if (loc) {
          loc.nomencladores = nomencladores;
        } else {
          // Si no está en el JSON todavía, lo ignoramos (el usuario lo cargará a mano)
          console.info("Sheet: sin match en JSON para →", nombre);
        }
      });
    })
    .catch(err => console.warn("Sheet Argentina:", err));
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
  sanatorios:              "sanatorios.json",
  consultorios:            "consultorios.json",
  sanatoriosAmba:          "sanatoriosAmba.json",
  consultoriosAmba:        "consultoriosAmba.json",
  sanatoriosArgentina:     "sanatoriosArgentina.json",
  consultoriosArgentina:   "consultoriosArgentina.json",
  sanatoriosExpansion:     "sanatoriosExpansion.json",
  consultoriosExpansion:   "consultoriosExpansion.json"
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
    fetchJSON(DATA_URLS.consultoriosAmba),
    fetchJSON(DATA_URLS.sanatoriosArgentina),
    fetchJSON(DATA_URLS.consultoriosArgentina),
    fetchJSON(DATA_URLS.sanatoriosExpansion),
    fetchJSON(DATA_URLS.consultoriosExpansion)
  ]).then(function ([sanat, consult, sanatAmba, consultAmba, sanatArg, consultArg, sanatExp, consultExp]) {
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

    // ARGENTINA
    [sanatArg, consultArg].forEach(function (fuente) {
      Object.keys(fuente).forEach(function (id) {
        const locs = (fuente[id].localidades || []).filter(l => l.nombre);
        if (locs.length === 0) return;
        if (provinciasData[id]) {
          if (!Array.isArray(provinciasData[id].localidades)) provinciasData[id].localidades = [];
          provinciasData[id].localidades = provinciasData[id].localidades.concat(locs);
        } else {
          provinciasData[id] = { nombre: fuente[id].nombre || id, localidades: locs };
        }
      });
    });

    // EXPANSIÓN
    [sanatExp, consultExp].forEach(function (fuente) {
      Object.keys(fuente).forEach(function (id) {
        const locs = (fuente[id].localidades || []).filter(l => l.nombre);
        if (locs.length === 0) return;
        if (provinciasDataExpansion[id]) {
          if (!Array.isArray(provinciasDataExpansion[id].localidades)) provinciasDataExpansion[id].localidades = [];
          provinciasDataExpansion[id].localidades = provinciasDataExpansion[id].localidades.concat(locs);
        } else {
          provinciasDataExpansion[id] = { nombre: fuente[id].nombre || id, localidades: locs };
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
let marcadoresActivos = [];
let marcadoresPoblacion = [];
let marcadoresSector = [];
let flechasExpansion = [];
let flechasPoligonos = [];
let flechaZoomListener = null;
let comunaSeleccionadaId = null;
let partidoSeleccionadoId = null;
let provinciaSeleccionadaId = null;
let infoWindowGlobal = null;
let categoriaActiva = null;
let regionActiva = null;
let geojsonCargados = 0;
const provinciasData = {};
const provinciasDataExpansion = {};

// ============================================
// SECTORES DEL PROYECTO DE EXPANSIÓN
// ============================================
const sectoresExpansion = {
  "sur": {
    nombre: "Sector Sur",
    provincias: ["NEUQUEN", "RIO NEGRO", "CHUBUT", "SANTA CRUZ", "TIERRA DEL FUEGO"]
  },
  "cordillera": {
    nombre: "Sector Cordillera",
    provincias: ["MENDOZA", "SAN JUAN", "LA RIOJA", "CATAMARCA"]
  },
  "norte": {
    nombre: "Sector Norte",
    provincias: ["SALTA", "JUJUY", "CHACO", "FORMOSA", "CORRIENTES", "MISIONES"]
  },
  "centro": {
    nombre: "Sector Centro",
    provincias: ["TUCUMAN", "SANTIAGO DEL ESTERO", "ENTRE RIOS", "SANTA FE", "CORDOBA", "SAN LUIS", "LA PAMPA"]
  },
  "sede": {
    nombre: "Sede Central Vighi",
    provincias: ["BUENOS AIRES", "CIUDAD AUTONOMA DE BUENOS AIRES"]
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

let ESTILO_BASE;
let ESTILO_SELECCIONADO;
let ESTILO_BASE_ARGENTINA;
let ESTILO_SELECCIONADO_ARGENTINA;

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
  "BUENOS AIRES":                    { lat: -37.1639, lng: -60.1358 },
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

function filtrarPorCategoria(localidades) {
  if (!categoriaActiva || !CATEGORIAS[categoriaActiva]) return localidades;
  const tipos = CATEGORIAS[categoriaActiva].tipos;
  return localidades.filter(loc => tipos.includes(loc.tipo));
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
      if (argentinaDataLayer) argentinaDataLayer.setMap(map);
      map.setCenter({ lat: -38.5, lng: -65 });
      map.setZoom(4);
      if (regionActiva === "expansion") {
        aplicarEstiloExpansionBase();
        mostrarFlechasExpansion();
      } else {
        mostrarEtiquetasPoblacion();
      }
    }
  } else {
    if (map) {
      map.data.setMap(map);
      if (ambaDataLayer) ambaDataLayer.setMap(map);
      if (argentinaDataLayer) argentinaDataLayer.setMap(null);
      map.setCenter({ lat: -34.62, lng: -58.52 });
      map.setZoom(11);
    }
  }

  mostrarTodasLasLocalidades();
}

function volverAlMenu() {
  comunaSeleccionadaId = null;
  partidoSeleccionadoId = null;
  provinciaSeleccionadaId = null;
  sectorSeleccionadoId = null;
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

  if (regionActiva === "argentina") {
    const provinciasConLocs = Object.keys(provinciasData)
      .map(id => ({ id, ...provinciasData[id], locs: filtrarPorCategoria(provinciasData[id].localidades || []) }))
      .filter(p => p.locs.length > 0)
      .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
    const totalArg = provinciasConLocs.reduce((s, p) => s + p.locs.length, 0);

    // Tabla de población por provincia (todas, con o sin prestadores)
    const pobRanking = Object.keys(POBLACION_ARGENTINA)
      .sort((a, b) => POBLACION_ARGENTINA[b] - POBLACION_ARGENTINA[a])
      .map(prov => {
        const conLocs = provinciasConLocs.find(p => p.id === prov);
        const cantPrest = conLocs ? conLocs.locs.length : 0;
        const nombre = PROVINCIAS_DISPLAY[prov] || toTitleCase(prov);
        return `
          <div class="pob-row pob-row-activa" onclick="seleccionarProvincia('${prov}')">
            <span class="pob-nombre">${nombre}</span>
            <span class="pob-numero">${formatPoblacion(POBLACION_ARGENTINA[prov])}</span>
            ${cantPrest > 0 ? `<span class="pob-prest">${cantPrest} prest.</span>` : ""}
          </div>`;
      }).join("");

    let htmlArg = `
      <div class="region-subtitulo">📊 Población por provincia</div>
      <div class="pob-subtitulo">Censo 2022 · Hacé click en una provincia con prestadores</div>
      <div class="pob-lista">${pobRanking}</div>
    `;

    if (totalArg > 0) {
      htmlArg += `
        <div class="region-subtitulo" style="margin-top:12px">🏥 Provincias con prestadores</div>
      `;
      htmlArg += renderItems(provinciasConLocs, "seleccionarProvincia", "argentina");
    }

    panelBody.innerHTML = htmlArg;
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
  initEstilos();
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: -34.65, lng: -58.55 },
    zoom: 10,
    mapTypeControl: true,
    streetViewControl: false,
    fullscreenControl: true
  });

  infoWindowGlobal = new google.maps.InfoWindow();
  ambaDataLayer = new google.maps.Data();
  argentinaDataLayer = new google.maps.Data();

  Promise.all([cargarDatosExternos(), cargarDesdeSheetsArgentina()]).then(function () {
    cargarGeoJSON();
    cargarGeoJSONAmba();
    cargarGeoJSONArgentina();
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
// ETIQUETAS DE POBLACIÓN (ARGENTINA)
// ============================================
function formatPoblacion(n) {
  return n.toLocaleString("es-AR");
}

function crearLabelSVG(provKey) {
  const nombre = PROVINCIAS_DISPLAY[provKey] || toTitleCase(provKey);
  const pob = POBLACION_ARGENTINA[provKey];
  const pobStr = pob ? formatPoblacion(pob) + " hab." : "";

  // Calcular ancho dinámico según largo del texto
  const maxLen = Math.max(nombre.length, pobStr.length);
  const w = Math.max(100, maxLen * 7 + 20);
  const h = pobStr ? 42 : 26;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#f3e8ff"/>
        <stop offset="100%" stop-color="#dbb8f5"/>
      </linearGradient>
      <filter id="sombra" x="-10%" y="-10%" width="120%" height="130%">
        <feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-color="#9b59b6" flood-opacity="0.25"/>
      </filter>
    </defs>
    <rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="7" ry="7"
      fill="url(#bg)" stroke="#9b59b6" stroke-width="1" filter="url(#sombra)"/>
    <text x="${w / 2}" y="15" font-family="'Segoe UI',Arial,sans-serif" font-size="11"
      font-weight="700" fill="#6c2fa0" text-anchor="middle" letter-spacing="0.3">${nombre}</text>
    ${pobStr ? `<text x="${w / 2}" y="30" font-family="'Segoe UI',Arial,sans-serif" font-size="9.5"
      fill="#9b59b6" text-anchor="middle">${pobStr}</text>` : ""}
  </svg>`;

  return "data:image/svg+xml," + encodeURIComponent(svg);
}

function mostrarEtiquetasPoblacion() {
  ocultarEtiquetasPoblacion();

  const CABA_KEY = "CIUDAD AUTONOMA DE BUENOS AIRES";
  const BA_KEY   = "BUENOS AIRES";
  const unificadas = new Set([CABA_KEY, BA_KEY]);

  // Etiqueta unificada Buenos Aires + CABA
  const pobBA   = POBLACION_ARGENTINA[BA_KEY]   || 0;
  const pobCABA = POBLACION_ARGENTINA[CABA_KEY] || 0;
  const pobTotal = pobBA + pobCABA;
  const labelUnif = crearLabelSVGUnificado("Buenos Aires", pobTotal);
  const posUnif = { lat: -35.5, lng: -59.0 };
  const markerUnif = new google.maps.Marker({
    position: posUnif,
    map: map,
    icon: {
      url: labelUnif.url,
      scaledSize: new google.maps.Size(labelUnif.w, labelUnif.h),
      anchor: new google.maps.Point(labelUnif.w / 2, labelUnif.h / 2)
    },
    clickable: false,
    zIndex: 10
  });
  marcadoresPoblacion.push(markerUnif);

  // Resto de provincias
  Object.keys(CENTROIDES_ARGENTINA).forEach(function (prov) {
    if (unificadas.has(prov)) return;
    const centroide = CENTROIDES_ARGENTINA[prov];
    const iconUrl = crearLabelSVG(prov);
    const pob = POBLACION_ARGENTINA[prov];
    const w = Math.max(100, Math.max(
      (PROVINCIAS_DISPLAY[prov] || prov).length,
      pob ? (formatPoblacion(pob) + " hab.").length : 0
    ) * 7 + 20);
    const h = pob ? 42 : 26;
    const marker = new google.maps.Marker({
      position: centroide,
      map: map,
      icon: {
        url: iconUrl,
        scaledSize: new google.maps.Size(w, h),
        anchor: new google.maps.Point(w / 2, h / 2)
      },
      clickable: false,
      zIndex: 10
    });
    marcadoresPoblacion.push(marker);
  });
}

function crearLabelSVGUnificado(nombre, pob) {
  const pobStr = pob ? formatPoblacion(pob) + " hab." : "";
  const maxLen = Math.max(nombre.length, pobStr.length);
  const w = Math.max(130, maxLen * 7 + 20);
  const h = pobStr ? 42 : 26;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <defs>
      <linearGradient id="bg2" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#f3e8ff"/>
        <stop offset="100%" stop-color="#dbb8f5"/>
      </linearGradient>
      <filter id="sombra2" x="-10%" y="-10%" width="120%" height="130%">
        <feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-color="#9b59b6" flood-opacity="0.25"/>
      </filter>
    </defs>
    <rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="7" ry="7"
      fill="url(#bg2)" stroke="#9b59b6" stroke-width="1" filter="url(#sombra2)"/>
    <text x="${w / 2}" y="15" font-family="'Segoe UI',Arial,sans-serif" font-size="11"
      font-weight="700" fill="#6c2fa0" text-anchor="middle" letter-spacing="0.3">${nombre}</text>
    ${pobStr ? `<text x="${w / 2}" y="30" font-family="'Segoe UI',Arial,sans-serif" font-size="9.5"
      fill="#9b59b6" text-anchor="middle">${pobStr}</text>` : ""}
  </svg>`;
  return { url: "data:image/svg+xml," + encodeURIComponent(svg), w, h };
}

function ocultarEtiquetasPoblacion() {
  marcadoresPoblacion.forEach(function (m) { m.setMap(null); });
  marcadoresPoblacion = [];
}

function crearLabelSVGNombre(nombre) {
  const w = Math.max(80, nombre.length * 7 + 20);
  const h = 26;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="5" ry="5"
      fill="white" fill-opacity="0.92" stroke="#a020a8" stroke-width="1.5"/>
    <text x="${w / 2}" y="17" font-family="Arial,sans-serif" font-size="11"
      font-weight="bold" fill="#a020a8" text-anchor="middle">${nombre}</text>
  </svg>`;
  return { url: "data:image/svg+xml," + encodeURIComponent(svg), w, h };
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

// ============================================
// CARGAR GEOJSON ARGENTINA
// ============================================
function cargarGeoJSONArgentina() {
  argentinaDataLayer.loadGeoJson(GEOJSON_ARGENTINA_URL, null, function () {
    // Filtrar Antártida: por nombre de provincia o por coordenadas extremas al sur
    const toRemove = [];
    argentinaDataLayer.forEach(feature => {
      const prov = (feature.getProperty("provincia") || "").toUpperCase();
      if (prov.includes("ANTARTIDA") || prov.includes("ANTÁRTIDA")) {
        toRemove.push(feature);
        return;
      }
      // También filtrar features cuyo centroide esté por debajo de -60° (territorio antártico)
      let minLat = 0;
      let count = 0;
      feature.getGeometry().forEachLatLng(latLng => {
        minLat += latLng.lat();
        count++;
      });
      if (count > 0 && (minLat / count) < -60) {
        toRemove.push(feature);
      }
    });
    toRemove.forEach(f => argentinaDataLayer.remove(f));

    // Poblar provinciasData y provinciasDataExpansion desde el GeoJSON
    argentinaDataLayer.forEach(feature => {
      const prov = feature.getProperty("provincia");
      if (prov) {
        if (!provinciasData[prov]) provinciasData[prov] = { nombre: toTitleCase(prov), localidades: [] };
        if (!provinciasDataExpansion[prov]) provinciasDataExpansion[prov] = { nombre: toTitleCase(prov), localidades: [] };
      }
    });

    aplicarEstiloBaseArgentina();
    // No se muestra hasta que el usuario seleccione Argentina
    argentinaDataLayer.setMap(null);

    argentinaDataLayer.addListener("click", function (event) {
      const provinciaId = getProvinciaId(event.feature);
      if (!provinciaId) return;
      if (regionActiva === "expansion") {
        const sectorId = getSectorDeProvinciaId(provinciaId);
        if (sectorId) seleccionarSector(sectorId);
      } else {
        seleccionarProvincia(provinciaId);
      }
    });
  });
}

function toTitleCase(str) {
  return str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

function getProvinciaId(feature) {
  return feature.getProperty("provincia") || null;
}

function esCaba(feature) {
  const prov = (getProvinciaId(feature) || "").toUpperCase();
  return prov.includes("CIUDAD AUTONOMA") || prov.includes("CIUDAD AUTÓNOMA");
}

function estiloArgentina(feature, seleccionado) {
  const base = seleccionado ? ESTILO_SELECCIONADO_ARGENTINA : ESTILO_BASE_ARGENTINA;
  if (esCaba(feature)) {
    return {
      fillColor:    base.fillColor,
      fillOpacity:  base.fillOpacity,
      strokeColor:  base.fillColor,
      strokeOpacity: 0,
      strokeWeight: 0
    };
  }
  return base;
}

function aplicarEstiloBaseArgentina() {
  if (argentinaDataLayer) argentinaDataLayer.setStyle(function(feature) {
    return estiloArgentina(feature, false);
  });
}

const ESTILO_EXPANSION_BASE = { fillColor: "#95a5a6", fillOpacity: 0.3, strokeColor: "#2c3e50", strokeOpacity: 1, strokeWeight: 1 };

function aplicarEstiloExpansionBase() {
  if (argentinaDataLayer) argentinaDataLayer.setStyle(ESTILO_EXPANSION_BASE);
}

// Provincias que se remarcan juntas al seleccionar cualquiera del grupo
const PROVINCIAS_AGRUPADAS = {
  "BUENOS AIRES":                    ["BUENOS AIRES", "CIUDAD AUTONOMA DE BUENOS AIRES"],
  "CIUDAD AUTONOMA DE BUENOS AIRES": ["BUENOS AIRES", "CIUDAD AUTONOMA DE BUENOS AIRES"],
};

function getGrupoProvincias(provinciaId) {
  return PROVINCIAS_AGRUPADAS[provinciaId] || [provinciaId];
}

// ============================================
// SELECCIONAR PROVINCIA (ARGENTINA)
// ============================================
function seleccionarProvincia(provinciaId) {
  provinciaSeleccionadaId = provinciaId;
  comunaSeleccionadaId = null;
  partidoSeleccionadoId = null;

  ocultarEtiquetasPoblacion();

  marcadoresActivos.forEach(m => m.setMap(null));
  marcadoresActivos = [];

  const grupo = new Set(getGrupoProvincias(provinciaId));

  argentinaDataLayer.setStyle(function (feature) {
    const seleccionado = grupo.has(getProvinciaId(feature));
    return estiloArgentina(feature, seleccionado);
  });

  const bounds = new google.maps.LatLngBounds();
  argentinaDataLayer.forEach(feature => {
    if (grupo.has(getProvinciaId(feature))) {
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

  // Combinar localidades de todas las provincias del grupo
  const datos = getProvinciasDataActivo();
  const todasLasLocalidades = [];
  const vistas = new Set();
  grupo.forEach(id => {
    const prov = datos[id];
    if (prov && Array.isArray(prov.localidades)) {
      prov.localidades.forEach(loc => {
        if (!vistas.has(loc.nombre)) {
          vistas.add(loc.nombre);
          todasLasLocalidades.push(loc);
        }
      });
    }
  });

  mostrarInfoPanelProvincia(provinciaId);
  agregarMarcadores(filtrarPorCategoria(todasLasLocalidades));
}

function getLocalidadesDeProvincia(provinciaId) {
  const localidades = [];
  const vistas = new Set();
  const datos = getProvinciasDataActivo();

  if (datos[provinciaId] && Array.isArray(datos[provinciaId].localidades)) {
    datos[provinciaId].localidades.forEach(loc => {
      const key = `${loc.lat},${loc.lng}`;
      if (!vistas.has(key)) { vistas.add(key); localidades.push(loc); }
    });
  }

  return filtrarPorCategoria(localidades);
}

function mostrarInfoPanelProvincia(provinciaId) {
  const provincia = getProvinciasDataActivo()[provinciaId];
  const localidades = getLocalidadesDeProvincia(provinciaId);

  const nombre = provincia ? provincia.nombre : toTitleCase(provinciaId);
  const locOrdenadas = [...localidades].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));

  const localidadesHtml = locOrdenadas.length > 0
    ? locOrdenadas.map(loc => `
        <div class="localidad-item" onclick="centrarEnMarcador(${loc.lat}, ${loc.lng})">
          <strong>${loc.nombre}</strong>
          <small>📌 ${loc.direccion} &nbsp;•&nbsp; <span class="badge">${loc.tipo}</span></small>
        </div>
      `).join("")
    : `<p class="sin-datos">Sin localidades registradas para esta provincia.</p>`;

  document.getElementById("panelBody").innerHTML = `
    <div class="comuna-header">
      <div class="comuna-header-top">
        <h3>📍 ${nombre}</h3>
        <button class="btn-volver" onclick="volverAlListado()" title="Volver al listado">✕</button>
      </div>
    </div>
    <div class="seccion-titulo">Localidades de interés</div>
    ${localidadesHtml}
  `;

  abrirPanelMobile();
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
// VOLVER AL LISTADO COMPLETO
// ============================================
function volverAlListado() {
  comunaSeleccionadaId = null;
  partidoSeleccionadoId = null;
  provinciaSeleccionadaId = null;
  sectorSeleccionadoId = null;

  marcadoresActivos.forEach(m => m.setMap(null));
  marcadoresActivos = [];
  ocultarEtiquetasSector();

  aplicarEstiloBase();
  aplicarEstiloBaseAmba();
  if (regionActiva === "expansion") {
    aplicarEstiloExpansionBase();
  } else {
    aplicarEstiloBaseArgentina();
  }

  if (regionActiva === "argentina") {
    mostrarEtiquetasPoblacion();
    if (map) { map.setCenter({ lat: -38.5, lng: -65 }); map.setZoom(4); }
  }

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
                  const esTotal = n.tipo && (n.tipo.toLowerCase() === "total" || n.tipo.toLowerCase() === "total facturado");
                  const etiqueta = n.tipo && n.tipo.toLowerCase() === "presencia" ? "Presencia Patólogo" : n.tipo && n.tipo.toLowerCase() === "total" ? "Total" : n.codigo;
                  return `<tr${esTotal ? ' class="popup-fila-total"' : ""}><td>${etiqueta}</td><td>${n.cantidad}</td></tr>`;
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
