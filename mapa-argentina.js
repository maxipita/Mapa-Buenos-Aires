function recalcularFacturacionTotalArgentina() {
  let facturacionTotal    = 0;
  let facturacionPrivado  = 0;
  let facturacionPublico  = 0;

  // Para cada provincia: usa filas individuales si existen, sino la fila PROVINCIAS
  const provinciasConSheets = new Set(Object.keys(clientesProvinciasSheets));

  // Sumar filas individuales
  Object.values(clientesProvinciasSheets).forEach(clientes => {
    clientes.forEach(c => {
      const val = parseFloat((c.facturacion || "").replace(/U\$S/g,"").replace(/\s/g,"").replace(/,/g,""));
      if (!isNaN(val) && val > 0) {
        facturacionTotal += val;
        const sector = (c.sector || "privado").toLowerCase();
        if (sector === "publico" || sector === "público") facturacionPublico += val;
        else facturacionPrivado += val;
      }
    });
  });

  // Sumar filas PROVINCIAS para provincias SIN filas individuales
  Object.entries(clientesProvinciasDirectos).forEach(([prov, entries]) => {
    if (provinciasConSheets.has(prov)) return; // ya contada arriba
    entries.forEach(c => {
      const val = parseFloat((c.facturacion || "").replace(/U\$S/g,"").replace(/\s/g,"").replace(/,/g,""));
      if (!isNaN(val) && val > 0) {
        facturacionTotal += val;
        const sector = (c.sector || "privado").toLowerCase();
        if (sector === "publico" || sector === "público") facturacionPublico += val;
        else facturacionPrivado += val;
      }
    });
  });

  window._facturacionTotalArgentinaActual   = facturacionTotal;
  window._facturacionPrivadaArgentina       = facturacionPrivado;
  window._facturacionPublicaArgentina       = facturacionPublico;

  // Si estamos viendo Argentina, actualizar el panel con los nuevos totales
  if (regionActiva === "argentina" && typeof mostrarTodasLasLocalidades === "function") {
    mostrarTodasLasLocalidades();
  }

  return facturacionTotal;
}

function cargarDesdeSheetsArgentina() {
  return fetch(SHEETS_CSV_URL + "&_=" + Date.now(), { cache: "no-store" })
    .then(r => r.ok ? r.text() : Promise.reject("No se pudo cargar el Sheet"))
    .then(texto => {
      const filas = parsearCSVSheets(texto);
      if (filas.length < 2) return;

      // Reset: evitar duplicar filas en cada poll (cada 30s)
      Object.keys(clientesProvinciasSheets).forEach(k => delete clientesProvinciasSheets[k]);
      Object.keys(clientesProvinciasDirectos).forEach(k => delete clientesProvinciasDirectos[k]);
      Object.keys(clientesZonasBA).forEach(k => clientesZonasBA[k] = null);

      const COL = { cliente:0, zona:1, tipo:2, sector:3, qx:4, amb:5, salaEndo:6, ce:7, qx2:8, amb2:9, salaEndo2:10, ce2:11, volQx:12, volAmb:13, volSalaEndo:14, volCe:15, volTotal:16, facturacionUSD:18 };

      // Construir índice de localidades de provinciasData por nombre normalizado
      const indicePorNombre = {};
      Object.values(provinciasData).forEach(prov => {
        (prov.localidades || []).forEach(loc => {
          const key = normalizarNombre(loc.nombre);
          if (key) indicePorNombre[key] = loc;
        });
      });

      const CLIENTE_A_PROVINCIA = {
        "AMBA TOTAL": "BUENOS AIRES",
      };
      const ZONA_A_GEOJSON = {
        "AMBA NORTE":          "BUENOS AIRES",
        "AMBA OESTE":          "BUENOS AIRES",
        "AMBA SUR":            "BUENOS AIRES",
        "BS-AS - INTERIOR":    "BUENOS AIRES",
        "CABA":                "CIUDAD AUTONOMA DE BUENOS AIRES",
        "CATAMARCA":           "CATAMARCA",
        "CHACO":               "CHACO",
        "CHUBUT":              "CHUBUT",
        "CORDOBA":             "CORDOBA",
        "CORRIENTES":          "CORRIENTES",
        "ENTRE RIOS":          "ENTRE RIOS",
        "FORMOSA":             "FORMOSA",
        "JUJUY":               "JUJUY",
        "LA PAMPA":            "LA PAMPA",
        "LA RIOJA":            "LA RIOJA",
        "MENDOZA":             "MENDOZA",
        "MISIONES":            "MISIONES",
        "NEUQUEN":             "NEUQUEN",
        "RIO NEGRO":           "RIO NEGRO",
        "SALTA":               "SALTA",
        "SAN JUAN":            "SAN JUAN",
        "SAN LUIS":            "SAN LUIS",
        "SANTA CRUZ":          "SANTA CRUZ",
        "SANTA FE":            "SANTA FE",
        "SANTIAGO DEL ESTERO": "SANTIAGO DEL ESTERO",
        "STGO. DEL ESTERO":    "SANTIAGO DEL ESTERO",
        "TIERRA DEL FUEGO":    "TIERRA DEL FUEGO",
        "TUCUMAN":             "TUCUMAN",
      };

      // Valor total de facturación Argentina del Sheet (fila TOTALES)
      window._facturacionTotalArgentinaActual = 6338792.28;

      // Nombres de provincias para detectar subtotales
      const PROVINCIA_NAMES = ["BUENOS AIRES", "CABA", "CATAMARCA", "CHACO", "CHUBUT", "CORDOBA", "CORRIENTES", "ENTRE RIOS", "FORMOSA", "JUJUY", "LA PAMPA", "LA RIOJA", "MENDOZA", "MISIONES", "NEUQUEN", "RIO NEGRO", "SALTA", "SAN JUAN", "SAN LUIS", "SANTA CRUZ", "SANTA FE", "SANTIAGO DEL ESTERO", "STGO. DEL ESTERO", "TIERRA DEL FUEGO", "TUCUMAN"];

      filas.slice(1).forEach(row => {
        const nombre = (row[COL.cliente] || "").trim();
        const nombreUpper = nombre.toUpperCase();

        const zona = (row[COL.zona] || "").toUpperCase().trim()
          .normalize("NFD").replace(/[̀-ͯ]/g, "");

        // Capturar filas zona="PROVINCIAS" → InfoWindow del recuadro de provincia
        if (zona === "PROVINCIAS") {
          const provKey = CLIENTE_A_PROVINCIA[nombreUpper] || nombreUpper;
          if (!clientesProvinciasDirectos[provKey]) clientesProvinciasDirectos[provKey] = [];
          const sV = (row[COL.sector] || "").toLowerCase().trim()
            .normalize("NFD").replace(/[̀-ͯ]/g, "");
          clientesProvinciasDirectos[provKey].push({
            nombre, tipo: (row[COL.tipo] || "").trim(), sector: sV || "privado",
            qx: row[COL.qx] || "", amb: row[COL.amb] || "",
            salaEndo: row[COL.salaEndo] || "", ce: row[COL.ce] || "",
            qx2: row[COL.qx2] || "", amb2: row[COL.amb2] || "",
            salaEndo2: row[COL.salaEndo2] || "", ce2: row[COL.ce2] || "",
            volTotal: row[COL.volTotal] || "0",
            facturacion: row[COL.facturacionUSD] || "",
          });
          return;
        }

        // Excluir: totales, subtotales, nombres exactos de provincias, lineas que empiezan con "ZONA" o "AMBA"
        const isExcluded = !nombre ||
          /TOTAL|SUBTOTAL/i.test(nombreUpper) ||
          PROVINCIA_NAMES.includes(nombreUpper) ||
          /^ZONA|^AMBA/i.test(nombreUpper);

        if (isExcluded) return;

        // Datos de zona BA desde el Sheet (identificados por nombre en col A)
        const ZONA_BA_KEY = { "ZONA NORTE": "norte", "ZONA OESTE": "oeste", "ZONA SUR": "sur", "INTERIOR": "interior" };
        if (ZONA_BA_KEY[nombre.toUpperCase()]) {
          clientesZonasBA[ZONA_BA_KEY[nombre.toUpperCase()]] = {
            nombre, tipo: (row[COL.tipo] || "").trim(),
            qx: row[COL.qx] || "", amb: row[COL.amb] || "",
            salaEndo: row[COL.salaEndo] || "", ce: row[COL.ce] || "",
            qx2: row[COL.qx2] || "", amb2: row[COL.amb2] || "",
            salaEndo2: row[COL.salaEndo2] || "", ce2: row[COL.ce2] || "",
            facturacion: row[COL.facturacionUSD] || "",
          };
          return;
        }

        const provinciaDestino = zona === "PROVINCIAS"
          ? (CLIENTE_A_PROVINCIA[nombre.toUpperCase()] || nombre.toUpperCase())
          : ZONA_A_GEOJSON[zona] || null;

        const nomencladores = [
          { tipo: "eficiencia",     codigo: "QX",                       cantidad: row[COL.qx]          || "-" },
          { tipo: "eficiencia",     codigo: "AMB",                      cantidad: row[COL.amb]         || "-" },
          { tipo: "eficiencia",     codigo: "SALA/ENDO",                cantidad: row[COL.salaEndo]    || "-" },
          { tipo: "eficiencia",     codigo: "CE",                       cantidad: row[COL.ce]          || "-" },
          { tipo: "capacidad",      codigo: "QX",                       cantidad: row[COL.qx2]         || "0" },
          { tipo: "capacidad",      codigo: "AMB",                      cantidad: row[COL.amb2]        || "0" },
          { tipo: "capacidad",      codigo: "SALA/ENDO",                cantidad: row[COL.salaEndo2]   || "0" },
          { tipo: "capacidad",      codigo: "CE",                       cantidad: row[COL.ce2]         || "0" },
          { tipo: "volumen",        codigo: "QX",                       cantidad: row[COL.volQx]       || "0" },
          { tipo: "volumen",        codigo: "AMB",                      cantidad: row[COL.volAmb]      || "0" },
          { tipo: "volumen",        codigo: "SALA/ENDO",                cantidad: row[COL.volSalaEndo] || "0" },
          { tipo: "volumen",        codigo: "CE",                       cantidad: row[COL.volCe]       || "0" },
          { tipo: "volumen total",  codigo: "Total por dirección",      cantidad: row[COL.volTotal]    || "0" },
          { tipo: "total facturado",codigo: "Facturación estimada USD", cantidad: row[COL.facturacionUSD] || "-" },
        ];

        // Buscar la localidad en el JSON por nombre y actualizar sus nomencladores y sector
        const key = normalizarNombre(nombre);
        const loc = indicePorNombre[key];
        const sectorValue = (row[COL.sector] || "").toLowerCase().trim()
          .normalize("NFD").replace(/[̀-ͯ]/g, "");
        if (loc) {
          loc.nomencladores = nomencladores;
          if (sectorValue) {
            loc.sector = sectorValue === "publico" ? "publico" : "privado";
          }
        } else {
          console.info("Sheet: sin match en JSON para →", nombre);
        }

        // Agregar también a clientesProvinciasSheets para cálculo de facturación
        const provDestino = zona === "PROVINCIAS"
          ? (CLIENTE_A_PROVINCIA[nombre.toUpperCase()] || nombre.toUpperCase())
          : ZONA_A_GEOJSON[zona] || null;

        if (provDestino) {
          if (!clientesProvinciasSheets[provDestino]) clientesProvinciasSheets[provDestino] = [];
          const yaExiste = clientesProvinciasSheets[provDestino].some(
            x => normalizarNombre(x.nombre) === normalizarNombre(nombre)
          );
          if (!yaExiste) {
            clientesProvinciasSheets[provDestino].push({
              nombre,
              tipo: (row[COL.tipo] || "").trim(),
              sector: sectorValue || "privado",
              qx: row[COL.qx] || "", amb: row[COL.amb] || "",
              salaEndo: row[COL.salaEndo] || "", ce: row[COL.ce] || "",
              qx2: row[COL.qx2] || "", amb2: row[COL.amb2] || "",
              salaEndo2: row[COL.salaEndo2] || "", ce2: row[COL.ce2] || "",
              volTotal: row[COL.volTotal] || "0",
              facturacion: row[COL.facturacionUSD] || "",
            });
          }
        }
      });
    })
    .then(() => {
      // Calcular totales por sector (para el toggle del card)
      recalcularFacturacionTotalArgentina();
    })
    .catch(err => console.warn("Sheet Argentina:", err));
}
function filtrarSectorArgentina(sector) {
  filtroSectorActivo = sector;
  if (modoMultiSeleccion) {
    mostrarBarraMultiSeleccion();
    return;
  }
  if (modoMultiSector) {
    mostrarBarraMultiSector();
    return;
  }
  if (sectorFiltroArgentina) {
    const card = document.getElementById('sector-resumen-card');
    if (card) { card.remove(); mostrarResumenSector(sectorFiltroArgentina); }
    actualizarPanelArgentina();
    return;
  }
  if (todasProvinciasMostradas) {
    seleccionarTodaArgentina();
  } else if (provinciaSeleccionadaId) {
    marcadoresActivos.forEach(m => m.setMap(null));
    marcadoresActivos = [];
    mostrarInfoPanelProvincia(provinciaSeleccionadaId);
  } else if (regionActiva === "argentina") {
    mostrarTodasLasLocalidades();
  }
  actualizarPanelArgentina();
}

function actualizarFacturacionCard() {
  const el = document.querySelector(".pob-argentina-fac-valor");
  if (!el) return;
  const val = filtroSectorActivo === 'privado'
    ? (window._facturacionPrivadaArgentina  || 0)
    : filtroSectorActivo === 'publico'
    ? (window._facturacionPublicaArgentina  || 0)
    : (window._facturacionTotalArgentinaActual || 0);
  if (val > 0) {
    el.textContent = "USD " + val.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
}

function actualizarPanelArgentina() {
  const panel = document.querySelector(".pob-argentina-card .sector-toggle-arg");
  if (!panel) return;
  panel.querySelectorAll(".sector-btn-arg").forEach(btn => {
    const val = btn.dataset.sector || null;
    btn.classList.toggle("sector-btn-activo", val === filtroSectorActivo);
  });
  actualizarFacturacionCard();
}

function _refrescarPanelConFiltro() {
  const desgloseAbierto = !!document.querySelector('.prov-card-desglose[style*="block"]');
  marcadoresActivos.forEach(m => m.setMap(null));
  marcadoresActivos = [];
  if (provinciaSeleccionadaId) {
    mostrarInfoPanelProvincia(provinciaSeleccionadaId);
    if (desgloseAbierto) {
      const btn = document.querySelector('.prov-card-desglose-btn');
      if (btn) toggleDesgloseCard(btn);
    }
  } else if (comunaSeleccionadaId) {
    mostrarInfoPanel(comunaSeleccionadaId);
  } else if (partidoSeleccionadoId) {
    mostrarInfoPanelPartido(partidoSeleccionadoId);
  }
}

function toggleFiltroVighi() {
  filtroVighiActivo = !filtroVighiActivo;
  _refrescarPanelConFiltro();
}

function aplicarFiltroSector(valor) {
  filtroSectorActivo = valor || null;
  _refrescarPanelConFiltro();
}

function toggleOrdenProvincias(orden) {
  if (ordenProvinciasPor === orden) {
    ordenProvinciasDireccion = ordenProvinciasDireccion === "desc" ? "asc" : "desc";
  } else {
    ordenProvinciasPor = orden;
    ordenProvinciasDireccion = orden === "nombre" ? "asc" : "desc";
  }
  mostrarTodasLasLocalidades();
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

  // Etiquetas separadas para todas las provincias incluyendo CABA
  Object.keys(CENTROIDES_ARGENTINA).forEach(function (prov) {
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
// ============================================
// ============================================
// POLYGONS AMBA SOBRE ARGENTINA
// google.maps.Polygon siempre queda encima de cualquier Data layer
// ============================================
const ESTILO_AMBA_BASE    = { fillOpacity: 0, strokeOpacity: 0, strokeWeight: 0, clickable: false };
const ESTILO_AMBA_RESALT  = { fillOpacity: 0.3, fillColor: "#9b3cc4", strokeOpacity: 0, strokeWeight: 0, clickable: false };
const ESTILO_AMBA_OPACO   = { fillOpacity: 0, strokeOpacity: 0, strokeWeight: 0, clickable: false };
const ESTILO_ZONA_BORDE   = { fillOpacity: 0, strokeColor: "#6b21a8", strokeWeight: 2.5, strokeOpacity: 1, clickable: false };

function _cargarZonaBorders(callback) {
  if (_zonaBorders) { callback(); return; }
  fetch("DatosGeoJson/zonasBA.json")
    .then(r => r.json())
    .then(data => {
      _zonaBorders = data;
      callback();
    });
}

function _mostrarBordeZona(zona) {
  _ocultarBordesZona();
  if (!_zonaBorders || !_zonaBorders[zona]) return;
  const geom = _zonaBorders[zona].geometry;
  const polys = geom.type === "MultiPolygon" ? geom.coordinates : [geom.coordinates];
  _zonaBorderPolys[zona] = polys.map(coords => {
    const paths = coords.map(ring => ring.map(c => ({ lat: c[1], lng: c[0] })));
    return new google.maps.Polygon(Object.assign({ paths, map }, ESTILO_ZONA_BORDE));
  });
}

function _ocultarBordesZona() {
  Object.values(_zonaBorderPolys).forEach(arr => arr.forEach(p => p.setMap(null)));
  _zonaBorderPolys = {};
}

let zonaBASeleccionada = null; // zona actualmente resaltada en el mapa de Argentina

let _baDeptLayerCargado = false;
let _baDeptLayer = null;

function _crearPolygonsDesdeBAFeatures(features) {
  features.forEach(function(feature) {
    const geom = feature.getGeometry();
    if (!geom) return;
    const tipo = geom.getType();
    const nombreDep = (feature.getProperty("departamento") || "").toUpperCase().trim();
    const zona = ZONA_BA_NOMBRE[nombreDep] || "interior";

    function crearPoly(paths) {
      const polygon = new google.maps.Polygon(Object.assign({ paths, map }, ESTILO_AMBA_BASE));
      ambaPolygonsArgentina.push({ polygon, zona });
    }

    if (tipo === "Polygon") {
      crearPoly(geom.getArray().map(ring => ring.getArray()));
    } else if (tipo === "MultiPolygon") {
      geom.getArray().forEach(poly => crearPoly(poly.getArray().map(ring => ring.getArray())));
    }
  });
}

function mostrarPolygonsAmbaEnArgentina() {
  // Si ya están creados, solo mostrarlos
  if (ambaPolygonsArgentina.length > 0) {
    ambaPolygonsArgentina.forEach(item => item.polygon.setMap(map));
    resetEstiloPolygonsAmba();
    return;
  }
  // Si el GeoJSON ya está cargado, crear los polígonos (incluye interior)
  if (_baDeptLayerCargado && _baDeptLayer) {
    const features = [];
    _baDeptLayer.forEach(f => features.push(f));
    _crearPolygonsDesdeBAFeatures(features);
    return;
  }
  // Primera vez: cargar el GeoJSON de departamentos de Buenos Aires
  _baDeptLayer = new google.maps.Data();
  _baDeptLayer.loadGeoJson(GEOJSON_BA_DEPARTAMENTOS_URL, null, function() {
    _baDeptLayerCargado = true;
    const features = [];
    _baDeptLayer.forEach(f => features.push(f));
    _crearPolygonsDesdeBAFeatures(features);
  });
}

function ocultarPolygonsAmbaEnArgentina() {
  ambaPolygonsArgentina.forEach(item => item.polygon.setMap(null));
  ambaPolygonsArgentina = []; // resetear para reconstruir con todos los polígonos la próxima vez
  zonaBASeleccionada = null;
}

function resetEstiloPolygonsAmba() {
  ambaPolygonsArgentina.forEach(item => item.polygon.setOptions(ESTILO_AMBA_BASE));
  _ocultarBordesZona();
  zonaBASeleccionada = null;
  document.querySelectorAll(".ba-interior-titulo").forEach(el => el.classList.remove("ba-interior-activa"));
  _ocultarTodasListasZonaBA();
}

function _ocultarTodasListasZonaBA() {
  ["norte","oeste","sur","interior"].forEach(k => {
    const el = document.getElementById(`zona-lista-${k}`);
    if (el) el.style.display = "none";
  });
}

function resaltarZonaBA(zona) {
  // Toggle: click mismo zona la deselecciona
  if (zonaBASeleccionada === zona) {
    resetEstiloPolygonsAmba();
    document.querySelectorAll(".zona-ba-titulo").forEach(el => el.classList.remove("zona-ba-activa"));
    document.querySelectorAll(".ba-interior-titulo").forEach(el => el.classList.remove("ba-interior-activa"));
    infoWindowGlobal.close();
    _ocultarTodasListasZonaBA();
    zonaBASeleccionada = null;
    return;
  }
  zonaBASeleccionada = zona;
  if (infoWindowGlobal) infoWindowGlobal.close();
  ambaPolygonsArgentina.forEach(item => {
    item.polygon.setOptions(item.zona === zona ? ESTILO_AMBA_RESALT : ESTILO_AMBA_OPACO);
  });
  // Dibujar borde exterior precalculado (todas las zonas, incluido interior)
  _cargarZonaBorders(() => _mostrarBordeZona(zona));

  // Hacer zoom a los límites de la zona seleccionada
  const bounds = new google.maps.LatLngBounds();
  ambaPolygonsArgentina.forEach(item => {
    if (item.zona !== zona) return;
    item.polygon.getPaths().forEach(path => {
      path.forEach(latLng => bounds.extend(latLng));
    });
  });
  if (!bounds.isEmpty()) {
    const padding = esMobile()
      ? { top: 20, right: 20, bottom: Math.round(window.innerHeight * 0.72), left: 20 }
      : { top: 60, right: 60, bottom: 60, left: 60 };
    map.fitBounds(bounds, padding);
    // Para interior (área muy grande) hacer un zoom extra después del fitBounds
    if (zona === "interior") {
      setTimeout(() => map.setZoom(map.getZoom() + 1), 300);
    }
    // Mostrar infowindow del Sheet centrado en la zona (solo para norte/oeste/sur)
    const datosZona = clientesZonasBA[zona];
    if (datosZona) {
      const centro = bounds.getCenter();
      setTimeout(() => _mostrarInfoWindowZonaBA(datosZona, zona, centro), 400);
    }
  }

  // Marcar el título activo en el panel
  document.querySelectorAll(".zona-ba-titulo").forEach(el => el.classList.remove("zona-ba-activa"));
  const activo = document.querySelector(`.zona-ba-titulo[data-zona="${zona}"]`);
  if (activo) activo.classList.add("zona-ba-activa");
  // Interior activo: también marcar con clase especial
  if (zona === "interior") {
    document.querySelectorAll(".ba-interior-titulo").forEach(el => el.classList.add("ba-interior-activa"));
  } else {
    document.querySelectorAll(".ba-interior-titulo").forEach(el => el.classList.remove("ba-interior-activa"));
  }

  // Mostrar lista de la zona seleccionada, ocultar las demás
  _ocultarTodasListasZonaBA();
  const listaEl = document.getElementById(`zona-lista-${zona}`);
  if (listaEl) {
    listaEl.style.display = "block";
    // Scroll suave al encabezado de zona en el panel
    if (activo) setTimeout(() => activo.scrollIntoView({ behavior: "smooth", block: "nearest" }), 50);
  }
}

function _mostrarInfoWindowZonaBA(c, zona, pos) {
  const ZONA_LABEL = { norte: "ZONA NORTE", oeste: "ZONA OESTE", sur: "ZONA SUR", interior: "INTERIOR" };
  const eficiencia = [
    c.qx       && c.qx       !== "0" ? `<span class="cliente-sheet-badge cliente-sheet-badge--ef">QX: ${c.qx}</span>`             : "",
    c.amb      && c.amb      !== "0" ? `<span class="cliente-sheet-badge cliente-sheet-badge--ef">AMB: ${c.amb}</span>`            : "",
    c.salaEndo && c.salaEndo !== "0" ? `<span class="cliente-sheet-badge cliente-sheet-badge--ef">SALA ENDO: ${c.salaEndo}</span>` : "",
    c.ce       && c.ce       !== "0" ? `<span class="cliente-sheet-badge cliente-sheet-badge--ef">CE: ${c.ce}</span>`              : "",
  ].filter(Boolean).join("");
  const caps = [
    c.qx2      && c.qx2      !== "0" ? `<span class="cliente-sheet-badge">QX: ${c.qx2}</span>`             : "",
    c.amb2     && c.amb2     !== "0" ? `<span class="cliente-sheet-badge">AMB: ${c.amb2}</span>`            : "",
    c.salaEndo2 && c.salaEndo2 !== "0" ? `<span class="cliente-sheet-badge">SALA ENDO: ${c.salaEndo2}</span>` : "",
    c.ce2      && c.ce2      !== "0" ? `<span class="cliente-sheet-badge">CE: ${c.ce2}</span>`              : "",
  ].filter(Boolean).join("");

  const contenido = `
    <div class="popup-container">
      <strong class="popup-nombre">${c.nombre}</strong>
      <p class="popup-direccion">${ZONA_LABEL[zona] || zona.toUpperCase()}</p>
      ${eficiencia || caps || c.facturacion ? `
        <button class="popup-btn-desglose" onclick="toggleDesglose(this)">Ver desglose <span class="popup-btn-flecha">&#9660;</span></button>
        <div id="nomDesglose" class="popup-desglose">
          ${eficiencia ? `<div class="cliente-sheet-label" style="margin-top:8px;color:#1a1a1a;">Eficiencia</div><div class="cliente-sheet-caps">${eficiencia}</div>` : ""}
          ${caps ? `<div class="cliente-sheet-label" style="margin-top:8px;color:#1a1a1a;">Capacidad instalada</div><div class="cliente-sheet-caps">${caps}</div>` : ""}
          ${c.facturacion ? `<div class="cliente-sheet-facturacion" style="margin-top:8px;">💰 ${c.facturacion}</div>` : ""}
        </div>
      ` : ""}
    </div>
  `;
  infoWindowGlobal.setContent(contenido);
  infoWindowGlobal.setPosition(pos);
  infoWindowGlobal.open(map);
  google.maps.event.addListenerOnce(infoWindowGlobal, 'domready', function () {
    liberarAlturaInfoWindow();
    setTimeout(centrarInfoWindow, 150);
  });
}

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
    // Si ya se está mostrando Argentina (carga lazy), mostrar la capa; si no, ocultarla
    if (regionActiva === "argentina" || regionActiva === "expansion") {
      argentinaDataLayer.setMap(map);
    } else {
      argentinaDataLayer.setMap(null);
    }

    argentinaDataLayer.addListener("click", function (event) {
      const provinciaId = getProvinciaId(event.feature);
      if (!provinciaId) return;
      if (regionActiva === "expansion") {
        const sectorId = getSectorDeProvinciaId(provinciaId);
        if (sectorId) seleccionarSector(sectorId);
      } else if (modoMultiSeleccion) {
        seleccionarProvincia(provinciaId);
      } else {
        // Si la provincia ya está seleccionada y se está viendo el detalle de prestadores, no hacer nada
        if (provinciaSeleccionadaId === provinciaId && !document.querySelector('.prov-resumen-card')) return;
        mostrarResumenProvincia(provinciaId);
      }
    });

    argentinaLoaded = true;
  });
}

function getProvinciaId(feature) {
  return feature.getProperty("provincia") || null;
}

function estiloArgentina(feature, seleccionado) {
  return seleccionado ? ESTILO_SELECCIONADO_ARGENTINA : ESTILO_BASE_ARGENTINA;
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

function getGrupoProvincias(provinciaId) {
  return [provinciaId];
}

// ============================================
// MULTI-SELECCIÓN DE PROVINCIAS
// ============================================
function toggleModoMultiSeleccion() {
  modoMultiSeleccion = !modoMultiSeleccion;
  provinciasSeleccionadas.clear();
  ocultarBarraMultiSeleccion();

  comparacionBoxAbierto = modoMultiSeleccion;

  // Resetear estilos
  if (argentinaDataLayer) {
    argentinaDataLayer.setStyle(feature => estiloArgentina(feature, false));
  }

  // Re-renderizar el panel para actualizar los onclick con el modo correcto
  mostrarTodasLasLocalidades();

  // Ocultar/mostrar la card de Argentina: solo se oculta al entrar en modo Comparar
  const argCard = document.querySelector('.pob-argentina-card');
  if (argCard) argCard.style.display = modoMultiSeleccion ? 'none' : '';
  if (modoMultiSeleccion && todasProvinciasMostradas) deseleccionarTodaArgentina();
}

function actualizarBotonMultiSeleccion() {
  const btn = document.getElementById('btn-multi-seleccion');
  if (!btn) return;
  if (modoMultiSeleccion) {
    btn.classList.add('btn-multi-activo');
    btn.innerHTML = '<span class="btn-icon">✕</span> Salir';
  } else {
    btn.classList.remove('btn-multi-activo');
    btn.innerHTML = '<span class="btn-icon">⊕</span> Comparar';
  }
}

function actualizarEstilosMultiSeleccion() {
  if (!argentinaDataLayer) return;
  argentinaDataLayer.setStyle(feature => {
    const id = getProvinciaId(feature);
    return estiloArgentina(feature, provinciasSeleccionadas.has(id));
  });
}

function calcularTotalMultiSeleccion() {
  let total = 0;
  provinciasSeleccionadas.forEach(id => {
    (clientesProvinciasSheets[id] || []).forEach(c => {
      const raw = (c.facturacion || "").replace(/U\$S/g, "").replace(/\s/g, "").replace(/,/g, "");
      const val = parseFloat(raw);
      if (!isNaN(val) && val > 0) total += val;
    });
    // Fallback a nomencladores JSON si no hay Sheet
    if (!(clientesProvinciasSheets[id] || []).length) {
      const datos = getProvinciasDataActivo();
      ((datos[id] || {}).localidades || []).forEach(loc => {
        (loc.nomencladores || []).forEach(n => {
          if (n.tipo === "total facturado") {
            const val = parseFloat((n.cantidad || "").replace(/[^0-9.]/g, ""));
            if (!isNaN(val)) total += val;
          }
        });
      });
    }
  });
  return total;
}

function mostrarInfoWindowMultiSeleccion() {
  if (!infoWindowGlobal) return;

  if (provinciasSeleccionadas.size === 0) {
    infoWindowGlobal.close();
    return;
  }

  const datos = getProvinciasDataActivo();

  // Calcular centro geográfico promediando los centroides
  let latSum = 0, lngSum = 0, count = 0;
  provinciasSeleccionadas.forEach(id => {
    const c = CENTROIDES_ARGENTINA[id] || PROVINCIA_CENTRO_OVERRIDE[id];
    if (c) { latSum += c.lat; lngSum += c.lng; count++; }
  });
  const centro = count > 0
    ? { lat: latSum / count, lng: lngSum / count }
    : { lat: -38.5, lng: -65 };

  // Armar datos por provincia
  let totalPrestadores = 0;
  let totalFac = 0;

  const filas = Array.from(provinciasSeleccionadas).map(id => {
    const nombre = PROVINCIAS_DISPLAY[id] || toTitleCase(id);

    // Prestadores
    const locsFiltradas = filtrarPorCategoria((datos[id] || {}).localidades || []);
    const prest = locsFiltradas.length;
    totalPrestadores += prest;

    // Facturación
    let fac = 0;
    const sheetData = clientesProvinciasSheets[id] || [];
    if (sheetData.length) {
      sheetData.forEach(c => {
        const raw = (c.facturacion || "").replace(/U\$S/g, "").replace(/\s/g, "").replace(/,/g, "");
        const val = parseFloat(raw);
        if (!isNaN(val) && val > 0) fac += val;
      });
    } else {
      locsFiltradas.forEach(loc => {
        (loc.nomencladores || []).forEach(n => {
          if (n.tipo === "total facturado") {
            const val = parseFloat((n.cantidad || "").replace(/[^0-9.]/g, ""));
            if (!isNaN(val)) fac += val;
          }
        });
      });
    }
    totalFac += fac;

    const facStr = fac > 0
      ? `USD ${fac.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : "—";
    return `
      <tr>
        <td style="padding:3px 8px 3px 0;font-weight:600;white-space:nowrap">${nombre}</td>
        <td style="padding:3px 6px;text-align:right;white-space:nowrap">${prest} prest.</td>
        <td style="padding:3px 0 3px 6px;text-align:right;white-space:nowrap;color:#27ae60;font-weight:600">${facStr}</td>
      </tr>`;
  }).join("");

  const totalFacStr = totalFac > 0
    ? `USD ${totalFac.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : "—";

  const contenido = `
    <div style="font-family:sans-serif;font-size:13px;min-width:220px;max-width:320px">
      <div style="font-weight:700;font-size:14px;color:#6a0dad;margin-bottom:8px;border-bottom:1px solid #ede0f9;padding-bottom:6px">
        📊 Comparación de provincias
      </div>
      <table style="width:100%;border-collapse:collapse">
        <thead>
          <tr style="font-size:11px;color:#888;border-bottom:1px solid #f0e4f7">
            <th style="text-align:left;padding-bottom:4px;font-weight:600">Provincia</th>
            <th style="text-align:right;padding-bottom:4px;font-weight:600">Prest.</th>
            <th style="text-align:right;padding-bottom:4px;font-weight:600">Facturación</th>
          </tr>
        </thead>
        <tbody>${filas}</tbody>
        <tfoot>
          <tr style="border-top:2px solid #d4a8f0;font-size:13px">
            <td style="padding:5px 8px 3px 0;font-weight:700;color:#2c3e50">TOTAL</td>
            <td style="padding:5px 6px 3px;text-align:right;font-weight:700;color:#2c3e50">${totalPrestadores} prest.</td>
            <td style="padding:5px 0 3px 6px;text-align:right;font-weight:700;color:#27ae60">${totalFacStr}</td>
          </tr>
        </tfoot>
      </table>
    </div>`;

  infoWindowGlobal.setContent(contenido);
  infoWindowGlobal.setPosition(new google.maps.LatLng(centro.lat, centro.lng));
  infoWindowGlobal.open(map);
}

function mostrarBarraMultiSeleccion() {
  let barra = document.getElementById('barra-multi');
  if (!barra) {
    barra = document.createElement('div');
    barra.id = 'barra-multi';
    document.getElementById('panelBody').prepend(barra);
  }

  const argCard = document.querySelector('.pob-argentina-card');

  if (provinciasSeleccionadas.size === 0) {
    barra.innerHTML = `
      <div class="multi-barra-vacia">
        <div class="multi-hint-icon">🗺️</div>
        <div class="multi-hint">Hacé click en las provincias del mapa para compararlas</div>
        <div class="multi-hint-sub">Podés seleccionar varias a la vez</div>
      </div>`;
    return;
  }

  const datos = getProvinciasDataActivo();
  let totalPrestadores = 0;
  let totalFac = 0;
  let totalVol = 0;
  let totalPobEf = 0;

  const filas = Array.from(provinciasSeleccionadas).map(id => {
    const nombre = PROVINCIAS_DISPLAY[id] || toTitleCase(id);

    const locsFiltradas = filtrarPorSector(filtrarPorCategoria((datos[id] || {}).localidades || []));
    const prest = locsFiltradas.length;
    totalPrestadores += prest;

    const pob = POBLACION_ARGENTINA[id] || 0;
    const cobPrivada = COBERTURA_PRIVADA[id] || 0.65;
    const pobEf = filtroSectorActivo === "privado" ? pob * cobPrivada
                : filtroSectorActivo === "publico" ? pob * (1 - cobPrivada)
                : pob;
    totalPobEf += pobEf;
    const ratio = pobEf > 0 ? (prest / pobEf) * 100000 : 0;
    const ratioStr = ratio > 0 ? ratio.toFixed(2).replace('.', ',') : null;

    // Facturación desde Sheet filtrada por sector, fallback a nomencladores
    let fac = 0;
    const sheetData = (clientesProvinciasSheets[id] || []).filter(c => {
      if (!filtroSectorActivo) return true;
      return (c.sector || "privado") === filtroSectorActivo;
    });
    if (sheetData.length) {
      sheetData.forEach(c => {
        const raw = (c.facturacion || "").replace(/U\$S/g, "").replace(/\s/g, "").replace(/,/g, "");
        const val = parseFloat(raw);
        if (!isNaN(val) && val > 0) fac += val;
      });
    } else {
      locsFiltradas.forEach(loc => {
        (loc.nomencladores || []).forEach(n => {
          if (n.tipo === "total facturado") {
            const val = parseFloat((n.cantidad || "").replace(/[^0-9.]/g, ""));
            if (!isNaN(val)) fac += val;
          }
        });
      });
    }
    totalFac += fac;

    // Volúmenes totales desde nomencladores de cada localidad
    let vol = 0;
    locsFiltradas.forEach(loc => {
      (loc.nomencladores || []).forEach(n => {
        if (n.tipo === "volumen total") {
          const val = parseFloat((n.cantidad || "").toString().replace(/[^0-9.]/g, ""));
          if (!isNaN(val) && val > 0) vol += val;
        }
      });
    });
    totalVol += vol;

    const facStr = fac > 0
      ? `USD ${fac.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : "—";
    const volStr = vol > 0 ? vol.toLocaleString('es-AR') : "—";

    return `
      <div class="multi-prov-card">
        <div class="multi-prov-top">
          <span class="multi-prov-nombre">${nombre}</span>
          <button class="multi-btn-ver-prov" onclick="verDetalleProvincia('${id}')" title="Ver prestadores">↗</button>
        </div>
        <div class="multi-prov-stats">
          <span class="multi-stat-prest"><span class="multi-stat-val">${prest}</span> prest.</span>
          ${ratioStr ? `<span class="multi-stat-sep">·</span><span class="multi-stat-ratio">${ratioStr}/100k</span>` : ''}
          ${vol > 0 ? `<span class="multi-stat-sep">·</span><span class="multi-stat-vol"><span class="multi-stat-val">${volStr}</span> vol.</span>` : ''}
          ${fac > 0 ? `<span class="multi-stat-sep">·</span><span class="multi-stat-fac">${facStr}</span>` : ''}
        </div>
      </div>`;
  }).join("");

  const totalFacStr = totalFac > 0
    ? `USD ${totalFac.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : "—";
  const totalVolStr = totalVol > 0 ? totalVol.toLocaleString('es-AR') : "—";
  const totalRatio = totalPobEf > 0 ? (totalPrestadores / totalPobEf) * 100000 : 0;
  const totalRatioStr = totalRatio > 0 ? totalRatio.toFixed(2).replace('.', ',') : null;

  barra.innerHTML = `
    <div class="multi-tabla-header">
      <span>📊 Comparación de provincias</span>
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
        <span class="multi-stat-prest"><strong>${totalPrestadores}</strong> prest.</span>
        ${totalRatioStr ? `<span class="multi-stat-sep">·</span><span class="multi-stat-ratio"><strong>${totalRatioStr}</strong>/100k</span>` : ''}
        ${totalVol > 0 ? `<span class="multi-stat-sep">·</span><span class="multi-stat-vol"><strong>${totalVolStr}</strong> vol.</span>` : ''}
        ${totalFac > 0 ? `<span class="multi-stat-sep">·</span><span class="multi-stat-fac"><strong>${totalFacStr}</strong></span>` : ''}
      </span>
    </div>
    <button class="multi-btn-limpiar" onclick="limpiarMultiSeleccion()">Limpiar selección</button>
  `;
}

function ocultarBarraMultiSeleccion() {
  const barra = document.getElementById('barra-multi');
  if (barra) barra.remove();
  const argCard = document.querySelector('.pob-argentina-card');
  if (argCard) argCard.style.display = '';
}

function toggleDesgloseSectorPanel() {
  if (!sectorFiltroArgentina) return;
  const sector = sectoresExpansion[sectorFiltroArgentina];
  const contenido = _buildSectorInfoWindowContent(sectorFiltroArgentina);
  const tmp = document.createElement('div');
  tmp.innerHTML = contenido;
  const body = tmp.querySelector('.popup-container');
  abrirModalDesglose(sector.nombre, body ? body.innerHTML : contenido);
  // Expandir el desglose automáticamente
  requestAnimationFrame(() => {
    const btn = document.querySelector('#desglose-modal-body .popup-btn-desglose');
    if (btn) btn.click();
  });
}

function mostrarResumenSector(sectorId) {
  const sector = sectoresExpansion[sectorId];
  if (!sector) return;
  const { cap, vol, facTotal, prestTotal } = calcularTotalesSector(sectorId);
  const capTotal = Object.values(cap).reduce((s, v) => s + v, 0);
  const volTotal = Object.values(vol).reduce((s, v) => s + v, 0);
  const fmt    = n => n > 0 ? n.toLocaleString('es-AR') : '—';
  const fmtUSD = n => n > 0 ? `USD ${n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—';

  const pobSectorEf = sector.provincias.reduce((sum, provId) => {
    const pob = POBLACION_ARGENTINA[provId] || 0;
    const cobPrivada = COBERTURA_PRIVADA[provId] || 0.65;
    return sum + (filtroSectorActivo === "privado" ? pob * cobPrivada
                : filtroSectorActivo === "publico" ? pob * (1 - cobPrivada)
                : pob);
  }, 0);
  const sectorRatio = pobSectorEf > 0 ? ((prestTotal / pobSectorEf) * 100000).toFixed(2).replace('.', ',') : null;

  const filasCap = Object.entries(cap).map(([cod, v]) =>
    `<tr><td>${cod}</td><td>${fmt(v)}</td></tr>`
  ).join('');
  const filasVol = Object.entries(vol).map(([cod, v]) =>
    `<tr><td>${cod}</td><td>${fmt(v)}</td></tr>`
  ).join('');

  const card = document.createElement('div');
  card.id = 'sector-resumen-card';
  card.className = 'prov-resumen-card';
  card.innerHTML = `
    <div class="prov-resumen-header">
      <div class="prov-resumen-titulo">
        <span class="prov-resumen-nombre">${sector.nombre}</span>
        ${prestTotal > 0 ? `<span class="pob-prest pob-prest-total">${prestTotal} prest.</span>` : ''}
      </div>
      <div class="sector-filtro-mini">
        <button class="sector-filtro-mini-btn ${!filtroSectorActivo ? 'sector-filtro-mini-activo' : ''}" onclick="filtrarSectorArgentina(null)">Todo</button>
        <button class="sector-filtro-mini-btn ${filtroSectorActivo === 'privado' ? 'sector-filtro-mini-activo' : ''}" onclick="filtrarSectorArgentina('privado')">Priv.</button>
        <button class="sector-filtro-mini-btn ${filtroSectorActivo === 'publico' ? 'sector-filtro-mini-activo' : ''}" onclick="filtrarSectorArgentina('publico')">Púb.</button>
      </div>
    </div>
    ${pobSectorEf > 0 ? `<div class="prov-resumen-pob">👥 ${formatPoblacion(Math.round(pobSectorEf))} hab.</div>` : ''}
    <div class="prov-resumen-stats">
      ${capTotal > 0 ? `
      <div class="prov-resumen-stat">
        <span class="prov-resumen-stat-label">⚡ Cap. instalada</span>
        <span class="prov-resumen-stat-valor">${fmt(capTotal)}</span>
      </div>` : ''}
      ${volTotal > 0 ? `
      <div class="prov-resumen-stat">
        <span class="prov-resumen-stat-label">📦 Volumen total</span>
        <span class="prov-resumen-stat-valor prov-vol">${fmt(volTotal)}</span>
      </div>` : ''}
      ${facTotal > 0 ? `
      <div class="prov-resumen-stat prov-resumen-stat-fac">
        <span class="prov-resumen-stat-label">💰 Total facturado</span>
        <span class="prov-resumen-stat-valor prov-fac">${fmtUSD(facTotal)}</span>
      </div>` : ''}
      ${sectorRatio ? `
      <div class="prov-resumen-stat">
        <span class="prov-resumen-stat-label">📈 Ratio prest./pob.</span>
        <span class="prov-resumen-stat-valor" style="color:#1a6fa8">${sectorRatio}/100k</span>
      </div>` : ''}
    </div>
    <button class="prov-resumen-btn-detalle" onclick="toggleDesgloseSectorPanel()">
      Ver desglose →
    </button>
    <button class="btn-comparar-sector ${modoMultiSector ? 'btn-comparar-sector-activo' : ''}" onclick="toggleModoMultiSector()">
      ${modoMultiSector ? '✕ Salir de comparación' : '⊕ Comparar sectores'}
    </button>
  `;

  // Insertar antes del primer regionalizacion-box
  const panelBody = document.getElementById('panelBody');
  const firstBox = panelBody.querySelector('.regionalizacion-box');
  if (firstBox) {
    firstBox.insertAdjacentElement('beforebegin', card);
  } else {
    panelBody.prepend(card);
  }
}

function cerrarResumenProvincia() {
  provinciaSeleccionadaId = null;
  marcadoresActivos.forEach(m => m.setMap(null));
  marcadoresActivos = [];
  if (infoWindowGlobal) infoWindowGlobal.close();
  if (argentinaDataLayer) aplicarEstiloBaseArgentina();
  if (map && (regionActiva === "argentina" || regionActiva === "expansion")) {
    map.setCenter({ lat: -38.5, lng: -65 });
    map.setZoom(4);
  }
  mostrarTodasLasLocalidades();
}

function mostrarResumenProvincia(provinciaId) {
  ocultarFloatingSector();
  // Limpiar pines previos (toda Argentina o provincia anterior)
  marcadoresActivos.forEach(m => m.setMap(null));
  marcadoresActivos = [];
  if (infoWindowGlobal) infoWindowGlobal.close();
  if (todasProvinciasMostradas) {
    todasProvinciasMostradas = false;
  }
  // Cerrar Regionalizar y limpiar sector al seleccionar una provincia
  if (regionalizacionAbierto) {
    regionalizacionAbierto = false;
    sectorBoxAbierto = false;
    sectorFiltroArgentina = null;
    if (argentinaDataLayer) argentinaDataLayer.setStyle(feature => estiloArgentina(feature, false));
  }
  const datos = getProvinciasDataActivo();
  const locsFiltradas = filtrarPorCategoria((datos[provinciaId] || {}).localidades || []);
  const prest = locsFiltradas.length;
  const pob = POBLACION_ARGENTINA[provinciaId] || 0;
  const nombre = provinciaId === "CIUDAD AUTONOMA DE BUENOS AIRES"
    ? "Capital Federal"
    : provinciaId === "BUENOS AIRES"
    ? "Buenos Aires"
    : PROVINCIAS_DISPLAY[provinciaId] || toTitleCase(provinciaId);

  // Facturación, volumen y capacidad
  // Prioridad: 1) filas individuales del Sheet, 2) fila PROVINCIAS, 3) nomencladores JSON
  let fac = 0, vol = 0, cap = 0;
  const sheetData = clientesProvinciasSheets[provinciaId] || [];
  if (sheetData.length) {
    sheetData.forEach(c => {
      const valFac = parseFloat((c.facturacion || "").replace(/U\$S/g,"").replace(/\s/g,"").replace(/,/g,""));
      if (!isNaN(valFac) && valFac > 0) fac += valFac;
      const valVol = parseFloat((c.volTotal || "0").toString().replace(/[^0-9.]/g, ""));
      if (!isNaN(valVol) && valVol > 0) vol += valVol;
      cap += (parseFloat(c.qx2) || 0) + (parseFloat(c.amb2) || 0)
           + (parseFloat(c.salaEndo2) || 0) + (parseFloat(c.ce2) || 0);
    });
  } else {
    // Fallback 2: fila PROVINCIAS
    const directos = clientesProvinciasDirectos[provinciaId] || [];
    if (directos.length) {
      directos.forEach(c => {
        const valFac = parseFloat((c.facturacion || "").replace(/U\$S/g,"").replace(/\s/g,"").replace(/,/g,""));
        if (!isNaN(valFac) && valFac > 0) fac += valFac;
        const valVol = parseFloat((c.volTotal || "0").toString().replace(/[^0-9.]/g, ""));
        if (!isNaN(valVol) && valVol > 0) vol += valVol;
        cap += (parseFloat(c.qx2) || 0) + (parseFloat(c.amb2) || 0)
             + (parseFloat(c.salaEndo2) || 0) + (parseFloat(c.ce2) || 0);
      });
    } else {
      // Fallback 3: nomencladores del JSON
      locsFiltradas.forEach(loc => {
        (loc.nomencladores || []).forEach(n => {
          const v = parseFloat((n.cantidad || "").toString().replace(/[^0-9.]/g, ""));
          if (isNaN(v) || v <= 0) return;
          if (n.tipo === "total facturado") fac += v;
          if (n.tipo === "volumen total")   vol += v;
          if (n.tipo === "capacidad")       cap += v;
        });
      });
    }
  }

  const facStr = fac > 0
    ? `USD ${fac.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : "—";
  const volStr = vol > 0 ? vol.toLocaleString('es-AR') : "—";
  const capStr = cap > 0 ? cap.toLocaleString('es-AR') : "—";

  const panelBody = document.getElementById('panelBody');
  panelBody.innerHTML = `
    <div class="prov-resumen-card">
      <div class="prov-resumen-header">
        <div class="prov-resumen-titulo">
          <span class="prov-resumen-nombre">${nombre}</span>
          ${prest > 0 ? `<span class="pob-prest pob-prest-total">${prest} prest.</span>` : ""}
        </div>
        <button class="prov-resumen-volver" onclick="cerrarResumenProvincia()">✕</button>
      </div>
      ${pob ? `<div class="prov-resumen-pob">👥 ${formatPoblacion(pob)} hab.</div>` : ""}
      <div class="prov-resumen-stats">
        ${cap > 0 ? `
        <div class="prov-resumen-stat">
          <span class="prov-resumen-stat-label">⚡ Cap. instalada</span>
          <span class="prov-resumen-stat-valor">${capStr}</span>
        </div>` : ""}
        ${vol > 0 ? `
        <div class="prov-resumen-stat">
          <span class="prov-resumen-stat-label">📦 Volumen total</span>
          <span class="prov-resumen-stat-valor prov-vol">${volStr}</span>
        </div>` : ""}
        ${fac > 0 ? `
        <div class="prov-resumen-stat prov-resumen-stat-fac">
          <span class="prov-resumen-stat-label">💰 Total facturado</span>
          <span class="prov-resumen-stat-valor prov-fac">${facStr}</span>
        </div>` : ""}
      </div>
      <button class="prov-resumen-btn-detalle" onclick="mostrarInfoPanelProvincia('${provinciaId}')">
        Ver prestadores →
      </button>
    </div>
  `;

  // Sombreado de la provincia seleccionada
  provinciaSeleccionadaId = provinciaId;
  if (argentinaDataLayer) {
    const grupo = new Set(getGrupoProvincias(provinciaId));
    argentinaDataLayer.setStyle(function (feature) {
      const seleccionado = grupo.has(getProvinciaId(feature));
      return estiloArgentina(feature, seleccionado);
    });
  }

  // Zoom al centroide de la provincia
  const centro = CENTROIDES_ARGENTINA[provinciaId] || PROVINCIA_CENTRO_OVERRIDE[provinciaId];
  if (centro && map) {
    map.setCenter({ lat: centro.lat, lng: centro.lng });
    const zoom = provinciaId === "CIUDAD AUTONOMA DE BUENOS AIRES" ? 12
                : provinciaId === "TUCUMAN" ? 8
                : provinciaId === "BUENOS AIRES" ? 7
                : 6;
    map.setZoom(zoom);
  }
  abrirPanelMobile();
}

function verDetalleProvincia(provinciaId) {
  // Muestra el panel de detalle de la provincia, con botón para volver a la comparación
  mostrarInfoPanelProvincia(provinciaId);

  // Inyectar botón "Volver a comparación" al inicio del panel
  const panelBody = document.getElementById('panelBody');
  const btnVolver = document.createElement('button');
  btnVolver.className = 'btn-volver-comparacion';
  btnVolver.innerHTML = '← Volver a comparación';
  btnVolver.onclick = () => {
    provinciaSeleccionadaId = null;
    marcadoresActivos.forEach(m => m.setMap(null));
    marcadoresActivos = [];
    mostrarTodasLasLocalidades();
  };
  panelBody.insertBefore(btnVolver, panelBody.firstChild);

  // Hacer zoom a la provincia en el mapa
  const centro = CENTROIDES_ARGENTINA[provinciaId] || PROVINCIA_CENTRO_OVERRIDE[provinciaId];
  if (centro) {
    map.setCenter({ lat: centro.lat, lng: centro.lng });
    map.setZoom(6);
  }
}

function actualizarListadoMultiSeleccion() {
  document.querySelectorAll('.pob-row[data-prov]').forEach(row => {
    const prov = row.dataset.prov;
    const sel = provinciasSeleccionadas.has(prov);
    const nombreEl = row.querySelector('.pob-nombre');
    const nombreBase = row.dataset.nombre;
    if (sel) {
      row.classList.add('pob-row-seleccionada');
      if (nombreEl) nombreEl.textContent = '✓ ' + nombreBase;
    } else {
      row.classList.remove('pob-row-seleccionada');
      if (nombreEl) nombreEl.textContent = nombreBase;
    }
  });
}

function limpiarMultiSeleccion() {
  provinciasSeleccionadas.clear();
  actualizarEstilosMultiSeleccion();
  actualizarListadoMultiSeleccion();
  mostrarBarraMultiSeleccion();
}

// ============================================
// FILTRO DE SECTOR EN MAPA ARGENTINA
// ============================================
function toggleRegionalizacion() {
  regionalizacionAbierto = !regionalizacionAbierto;
  sectorBoxAbierto = regionalizacionAbierto;
  // Si se abre Regionalizar, cerrar Comparar
  if (regionalizacionAbierto && comparacionBoxAbierto) {
    comparacionBoxAbierto = false;
    if (modoMultiSeleccion) toggleModoMultiSeleccion();
  }
  // Al cerrar: limpiar sector activo
  if (!regionalizacionAbierto && sectorFiltroArgentina) {
    sectorFiltroArgentina = null;
    ocultarLabelSector();
    const card = document.getElementById('sector-resumen-card');
    if (card) card.remove();
    if (argentinaDataLayer) argentinaDataLayer.setStyle(feature => estiloArgentina(feature, false));
    map.setCenter({ lat: -38.5, lng: -65 });
    map.setZoom(4);
  }
  if (regionalizacionAbierto && todasProvinciasMostradas) deseleccionarTodaArgentina();
  mostrarTodasLasLocalidades();
  const estaAlgoAbierto = regionalizacionAbierto || comparacionBoxAbierto;
  const argCard = document.querySelector('.pob-argentina-card');
  if (argCard) argCard.style.display = estaAlgoAbierto ? 'none' : '';
}

function toggleComparacionBox() {
  comparacionBoxAbierto = !comparacionBoxAbierto;
  // Si se abre Comparar, cerrar Regionalizar
  if (comparacionBoxAbierto && regionalizacionAbierto) {
    regionalizacionAbierto = false;
    sectorBoxAbierto = false;
    if (sectorFiltroArgentina) {
      sectorFiltroArgentina = null;
      ocultarLabelSector();
      const card = document.getElementById('sector-resumen-card');
      if (card) card.remove();
      if (argentinaDataLayer) argentinaDataLayer.setStyle(feature => estiloArgentina(feature, false));
    }
  }
  const estaAlgoAbierto = regionalizacionAbierto || comparacionBoxAbierto;
  const argCard = document.querySelector('.pob-argentina-card');
  if (argCard) argCard.style.display = estaAlgoAbierto ? 'none' : '';
  if (comparacionBoxAbierto && todasProvinciasMostradas) deseleccionarTodaArgentina();
  if (comparacionBoxAbierto !== modoMultiSeleccion) toggleModoMultiSeleccion();
  mostrarTodasLasLocalidades();
  // Re-query después del re-render
  const argCardFresh = document.querySelector('.pob-argentina-card');
  if (argCardFresh) argCardFresh.style.display = estaAlgoAbierto ? 'none' : '';
}

function toggleSectorBox() {
  sectorBoxAbierto = !sectorBoxAbierto;
  const contenido = document.getElementById("sector-box-contenido");
  const flecha = document.querySelector(".sector-box-flecha");
  if (contenido) contenido.style.display = sectorBoxAbierto ? "block" : "none";
  if (flecha) flecha.textContent = sectorBoxAbierto ? "▼" : "▶";
}

function calcularTotalesSector(sectorId) {
  const sector = sectoresExpansion[sectorId];
  const datos = provinciasData;

  // Acumuladores por código
  const cap  = { QX: 0, AMB: 0, "SALA/ENDO": 0, CE: 0 };
  const vol  = { QX: 0, AMB: 0, "SALA/ENDO": 0, CE: 0 };
  let facTotal = 0;
  let prestTotal = 0;
  const vistos = new Set();

  sector.provincias.forEach(provId => {
    // Facturación desde Sheet (fuente principal), filtrada por sector
    const sheetRows = (clientesProvinciasSheets[provId] || []).filter(c => {
      if (!filtroSectorActivo) return true;
      return (c.sector || "privado") === filtroSectorActivo;
    });
    sheetRows.forEach(c => {
      const raw = (c.facturacion || "").replace(/U\$S/g, "").replace(/\s/g, "").replace(/,/g, "");
      const val = parseFloat(raw);
      if (!isNaN(val) && val > 0) facTotal += val;
    });

    const locsRaw = ((datos[provId] || {}).localidades || []);
    const locs = filtrarPorSector(filtrarPorCategoria(locsRaw));
    locs.forEach(loc => {
      const key = normalizarNombre(loc.nombre);
      if (vistos.has(key)) return;
      vistos.add(key);
      prestTotal++;

      (loc.nomencladores || []).forEach(n => {
        const v = parseFloat((n.cantidad || "").toString().replace(/[^0-9.]/g, ""));
        if (isNaN(v) || v <= 0) return;

        if (n.tipo === "capacidad" && cap.hasOwnProperty(n.codigo)) {
          cap[n.codigo] += v;
        }
        if (n.tipo === "volumen" && vol.hasOwnProperty(n.codigo)) {
          vol[n.codigo] += v;
        }
        // Facturación desde JSON como fallback (si no hay Sheet)
        if (n.tipo === "total facturado" && !sheetRows.length) {
          facTotal += v;
        }
      });
    });
  });

  return { cap, vol, facTotal, prestTotal };
}

function _buildSectorInfoWindowContent(sectorId) {
  const sector = sectoresExpansion[sectorId];
  const { cap, vol, facTotal, prestTotal } = calcularTotalesSector(sectorId);

  const fmt    = n => n > 0 ? n.toLocaleString('es-AR') : '0';
  const fmtUSD = n => n > 0 ? `U$S ${n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—';

  const capTotal = Object.values(cap).reduce((s, v) => s + v, 0);
  const volTotal = Object.values(vol).reduce((s, v) => s + v, 0);

  // Filas de tabla — mismo formato que popup de ubicaciones
  const filasCap = Object.entries(cap)
    .map(([cod, v]) => `<tr><td>${cod}</td><td>${fmt(v)}</td></tr>`)
    .join('');

  const filasVol = Object.entries(vol)
    .map(([cod, v]) => `<tr><td>${cod}</td><td>${fmt(v)}</td></tr>`)
    .join('');

  // Armar el interior del desglose igual que nomDesglose en popup de marcadores
  let desgloseHtml = '';
  if (capTotal > 0) {
    desgloseHtml += `<div class="popup-seccion-titulo">Capacidad instalada</div>
      <table class="popup-tabla"><tbody>${filasCap}</tbody></table>`;
  }
  if (volTotal > 0) {
    desgloseHtml += `<div class="popup-seccion-titulo">Volumen</div>
      <table class="popup-tabla"><tbody>${filasVol}</tbody></table>
      <div class="popup-seccion-total-vol">📊 Volúmenes totales: <strong>${fmt(volTotal)}</strong></div>`;
  }
  if (facTotal > 0) {
    desgloseHtml += `<div class="popup-seccion-fac">💰 Facturación estimada: <strong>${fmtUSD(facTotal)}</strong></div>`;
  }
  const pobSectorEfDg = sector.provincias.reduce((sum, provId) => {
    const pob = POBLACION_ARGENTINA[provId] || 0;
    const cobPrivada = COBERTURA_PRIVADA[provId] || 0.65;
    return sum + (filtroSectorActivo === "privado" ? pob * cobPrivada
                : filtroSectorActivo === "publico" ? pob * (1 - cobPrivada)
                : pob);
  }, 0);
  const ratioDesglose = pobSectorEfDg > 0
    ? ((prestTotal / pobSectorEfDg) * 100000).toFixed(2).replace('.', ',')
    : null;
  if (ratioDesglose) {
    desgloseHtml += `<div class="popup-seccion-fac" style="color:#1a6fa8">📈 Ratio prest./pob.: <strong>${ratioDesglose}/100k hab.</strong></div>`;
  }

  // HTML final — idéntica estructura al popup de ubicaciones
  return `
    <div class="popup-container">
      <strong class="popup-nombre">${sector.nombre}</strong>
      <p class="popup-direccion">${prestTotal} prestadores</p>
      ${desgloseHtml ? `
        <button class="popup-btn-desglose" onclick="toggleDesglose(this)">Ver desglose <span class="popup-btn-flecha">&#9660;</span></button>
        <div id="nomDesglose" class="popup-desglose">${desgloseHtml}</div>
      ` : ''}
    </div>`;
}

function mostrarFloatingSector(sectorId) {
  // Deshabilitado: el desglose se muestra inline en el panel izquierdo
}

function ocultarFloatingSector() {
  if (infoWindowSector) infoWindowSector.close();
  if (_markerAnclaSector) _markerAnclaSector.setMap(null);
  ocultarLabelSector();
}

function mostrarLabelSector(sectorId) {
  ocultarLabelSector();
  const sector = sectoresExpansion[sectorId];
  if (!sector) return;
  const mapDiv = document.getElementById('map');
  if (!mapDiv) return;
  const label = document.createElement('div');
  label.id = 'sector-mapa-label';
  label.textContent = sector.nombre;
  mapDiv.appendChild(label);
}

function ocultarLabelSector() {
  const el = document.getElementById('sector-mapa-label');
  if (el) el.remove();
  const modal = document.getElementById('sector-desglose-modal');
  if (modal) modal.remove();
}

function toggleFsSeccion(header) {
  const detalle = header.nextElementSibling;
  const flecha = header.querySelector('.fs-flecha');
  const abierto = detalle.style.display !== 'none';
  detalle.style.display = abierto ? 'none' : 'block';
  if (flecha) flecha.textContent = abierto ? '▸' : '▾';
}

function seleccionarSectorArgentina(sectorId) {
  // Modo comparación de sectores
  if (modoMultiSector) {
    if (sectorId === null) return;
    if (sectoresComparados.has(sectorId)) {
      sectoresComparados.delete(sectorId);
    } else {
      sectoresComparados.add(sectorId);
    }
    actualizarEstilosMultiSector();
    mostrarTodasLasLocalidades();
    const argCard = document.querySelector('.pob-argentina-card');
    if (argCard) argCard.style.display = 'none';
    mostrarBarraMultiSector();
    return;
  }

  // Cerrar cualquier InfoWindow o modal previo
  if (infoWindowSector) infoWindowSector.close();
  const modalPrev = document.getElementById('sector-desglose-modal');
  if (modalPrev) modalPrev.remove();
  cerrarModalDesglose();

  // Toggle: si ya está seleccionado, deseleccionar
  sectorFiltroArgentina = sectorFiltroArgentina === sectorId ? null : sectorId;

  // Actualizar estilos en el mapa
  if (argentinaDataLayer) {
    argentinaDataLayer.setStyle(feature => {
      const provId = getProvinciaId(feature);
      if (!sectorFiltroArgentina) return estiloArgentina(feature, false);
      const sector = sectoresExpansion[sectorFiltroArgentina];
      const enSector = sector && sector.provincias.includes(provId);
      return enSector ? estiloArgentina(feature, true) : {
        fillColor: "#cccccc",
        fillOpacity: 0.2,
        strokeColor: "#aaaaaa",
        strokeWeight: 0.8,
        strokeOpacity: 0.5
      };
    });
  }

  // Re-renderizar el panel manteniendo el box abierto
  regionalizacionAbierto = true;
  sectorBoxAbierto = true;
  mostrarTodasLasLocalidades();

  // Mantener la card de Argentina oculta mientras Regionalizar esté abierto
  const argCard = document.querySelector('.pob-argentina-card');
  if (argCard) argCard.style.display = 'none';
  if (todasProvinciasMostradas) deseleccionarTodaArgentina();

  // Mostrar/ocultar resumen del sector en el panel y label en el mapa
  if (sectorFiltroArgentina) {
    mostrarResumenSector(sectorFiltroArgentina);
    mostrarLabelSector(sectorFiltroArgentina);
  } else {
    const card = document.getElementById('sector-resumen-card');
    if (card) card.remove();
    ocultarLabelSector();
  }

  // Zoom al sector y abrir modal automáticamente
  if (sectorFiltroArgentina) {
    const sectorActual = sectorFiltroArgentina;
    const bounds = new google.maps.LatLngBounds();
    sectoresExpansion[sectorActual].provincias.forEach(provId => {
      const c = CENTROIDES_ARGENTINA[provId];
      if (c) bounds.extend({ lat: c.lat, lng: c.lng });
    });
    if (!bounds.isEmpty()) {
      const padding = esMobile()
        ? { top: 20, right: 20, bottom: Math.round(window.innerHeight * 0.5), left: 20 }
        : { top: 60, right: 60, bottom: 60, left: 60 };
      map.fitBounds(bounds, padding);
    }
  } else {
    map.setCenter({ lat: -38.5, lng: -65 });
    map.setZoom(4);
  }
}

// ============================================
// SELECCIONAR PROVINCIA (ARGENTINA)
// ============================================
function seleccionarProvincia(provinciaId) {
  // Si estamos en modo multi-selección, toggle la provincia
  if (modoMultiSeleccion) {
    if (provinciasSeleccionadas.has(provinciaId)) {
      provinciasSeleccionadas.delete(provinciaId);
    } else {
      provinciasSeleccionadas.add(provinciaId);
    }
    actualizarEstilosMultiSeleccion();
    actualizarListadoMultiSeleccion();
    mostrarBarraMultiSeleccion();
    return;
  }

  if (provinciaSeleccionadaId === provinciaId) return;

  provinciaSeleccionadaId = provinciaId;
  comunaSeleccionadaId = null;
  partidoSeleccionadoId = null;

  ocultarEtiquetasPoblacion();

  if (infoWindowGlobal) infoWindowGlobal.close();

  // Resetear sombreado de zonas BA si venía de Buenos Aires
  resetEstiloPolygonsAmba();

  todasProvinciasMostradas = false;
  marcadoresActivos.forEach(m => m.setMap(null));
  marcadoresActivos = [];

  const grupo = new Set(getGrupoProvincias(provinciaId));

  argentinaDataLayer.setStyle(function (feature) {
    const seleccionado = grupo.has(getProvinciaId(feature));
    return estiloArgentina(feature, seleccionado);
  });

  // Aplicar override de centro siempre (independiente de si ya estaba seleccionada)
  const _overrideCentro = PROVINCIA_CENTRO_OVERRIDE[provinciaId];
  if (_overrideCentro) {
    _provinciaCentroLatLng = new google.maps.LatLng(_overrideCentro.lat, _overrideCentro.lng);
  }

  if (true) {
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
    if (bounds.isEmpty() && provinciaId === "CIUDAD AUTONOMA DE BUENOS AIRES") {
      // CABA todavía no terminó de cargar, usar bounds conocidos
      bounds.extend({ lat: -34.705, lng: -58.532 });
      bounds.extend({ lat: -34.527, lng: -58.335 });
    }
    if (!bounds.isEmpty()) {
      if (!_overrideCentro) {
        _provinciaCentroLatLng = bounds.getCenter();
      }
      const padding = esMobile()
        ? { top: 20, right: 20, bottom: Math.round(window.innerHeight * 0.72), left: 20 }
        : { top: 40, right: 40, bottom: 40, left: 40 };
      map.fitBounds(bounds, padding);
    }
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
}

// ============================================
// SELECCIONAR TODA ARGENTINA (card resumen)
// ============================================
function seleccionarTodaArgentina() {
  // Limpiar selección de provincia individual
  provinciaSeleccionadaId = null;
  provinciaAnteriorId     = null;
  if (infoWindowGlobal) infoWindowGlobal.close();

  // Limpiar marcadores activos
  marcadoresActivos.forEach(m => m.setMap(null));
  marcadoresActivos = [];

  // Pintar TODAS las provincias con el estilo seleccionado
  if (argentinaDataLayer) {
    argentinaDataLayer.setStyle(function() {
      return ESTILO_SELECCIONADO_ARGENTINA;
    });
  }

  // Recopilar todas las localidades de todas las provincias
  const datos = getProvinciasDataActivo();
  const todasLasLocalidades = [];
  const vistas = new Set();

  Object.values(datos).forEach(prov => {
    if (!prov || !Array.isArray(prov.localidades)) return;
    prov.localidades.forEach(loc => {
      const key = normalizarNombre(loc.nombre);
      if (!vistas.has(key) && loc.lat && loc.lng) {
        vistas.add(key);
        todasLasLocalidades.push(loc);
      }
    });
  });

  todasProvinciasMostradas = true;

  // Mostrar todos los marcadores (respeta filtroSectorActivo si está activo)
  agregarMarcadores(todasLasLocalidades);

  // Zoom a Argentina continental (excluye Antártida y Malvinas)
  setTimeout(() => {
    map.setCenter({ lat: -40.0, lng: -65.0 });
    map.setZoom(5);
  }, 50);

  // Refrescar panel para mostrar el botón ✕
  mostrarTodasLasLocalidades();
}

function deseleccionarTodaArgentina() {
  todasProvinciasMostradas = false;
  provinciaSeleccionadaId = null;
  provinciaAnteriorId = null;

  // Limpiar marcadores
  marcadoresActivos.forEach(m => m.setMap(null));
  marcadoresActivos = [];
  if (infoWindowGlobal) infoWindowGlobal.close();

  // Resetear estilos del mapa
  if (argentinaDataLayer) {
    argentinaDataLayer.setStyle(feature => estiloArgentina(feature, false));
  }
  resetEstiloPolygonsAmba();

  // Volver al zoom general de Argentina
  map.setCenter({ lat: -38.5, lng: -65 });
  map.setZoom(4);

  // Refrescar panel (quita el botón ✕)
  mostrarTodasLasLocalidades();
}

function getLocalidadesDeProvincia(provinciaId) {
  const localidades = [];
  const vistas = new Set();
  const datos = getProvinciasDataActivo();

  if (datos[provinciaId] && Array.isArray(datos[provinciaId].localidades)) {
    datos[provinciaId].localidades.forEach(loc => {
      const key = normalizarNombre(loc.nombre);
      if (!vistas.has(key)) { vistas.add(key); localidades.push(loc); }
    });
  }

  return filtrarPorCategoria(localidades);
}

function mostrarInfoPanelProvincia(provinciaId) {
  // Solo resetear el filtro si cambió de provincia
  if (provinciaAnteriorId !== provinciaId) {
    resetFiltroSector();
    provinciaAnteriorId = provinciaId;
  }

  const provincia = getProvinciasDataActivo()[provinciaId];
  const localidades = getLocalidadesDeProvincia(provinciaId);

  const grupo = getGrupoProvincias(provinciaId);
  let pobTotal = 0;
  grupo.forEach(id => { pobTotal += POBLACION_ARGENTINA[id] || 0; });

  // Sumar facturación: primero desde clientesProvinciasSheets (USD), sino desde nomencladores JSON
  let facturacionTotal = 0;
  let facturacionPrivado = 0;
  let facturacionPublico = 0;

  const datos = getProvinciasDataActivo();

  // Construir lookup de sector por nombre normalizado desde los JSON
  const sectorPorNombre = {};
  grupo.forEach(id => {
    ((datos[id] || {}).localidades || []).forEach(loc => {
      sectorPorNombre[normalizarNombre(loc.nombre)] = loc.sector || "privado";
    });
  });

  // Fuente 1: Sheet (tiene todos los valores correctos en USD)
  const tieneSheet = grupo.some(id => (clientesProvinciasSheets[id] || []).length > 0);
  if (tieneSheet) {
    grupo.forEach(id => {
      (clientesProvinciasSheets[id] || []).forEach(c => {
        const raw = (c.facturacion || "").replace(/U\$S/g, "").replace(/\s/g, "").replace(/,/g, "");
        const val = parseFloat(raw);
        if (!isNaN(val) && val > 0) {
          facturacionTotal += val;
          const sector = (c.sector || "privado").toLowerCase();
          if (sector === "privado") facturacionPrivado += val;
          else if (sector === "publico") facturacionPublico += val;
        }
      });
    });
  } else {
    // Fuente 2: fila PROVINCIAS del Sheet
    const tieneDirecto = grupo.some(id => (clientesProvinciasDirectos[id] || []).length > 0);
    if (tieneDirecto) {
      grupo.forEach(id => {
        (clientesProvinciasDirectos[id] || []).forEach(c => {
          const val = parseFloat((c.facturacion || "").replace(/U\$S/g,"").replace(/\s/g,"").replace(/,/g,""));
          if (!isNaN(val) && val > 0) {
            facturacionTotal += val;
            const sector = (c.sector || "privado").toLowerCase();
            if (sector === "privado") facturacionPrivado += val;
            else if (sector === "publico") facturacionPublico += val;
          }
        });
      });
    } else {
      // Fuente 3: nomencladores del JSON
      const vistasFac = new Set();
      grupo.forEach(id => {
        ((datos[id] || {}).localidades || []).forEach(loc => {
          const key = normalizarNombre(loc.nombre);
          if (vistasFac.has(key)) return;
          vistasFac.add(key);
          (loc.nomencladores || []).forEach(n => {
            if (n.tipo === "total facturado") {
              const val = parseFloat((n.cantidad || "").replace(/[^0-9.,]/g, "").replace(/,/g, ""));
              if (!isNaN(val) && val > 0) {
                facturacionTotal += val;
                const sector = loc.sector || "privado";
                if (sector === "privado") facturacionPrivado += val;
                else if (sector === "publico") facturacionPublico += val;
              }
            }
          });
        });
      });
    }
  }

  const nombre = provinciaId === "CIUDAD AUTONOMA DE BUENOS AIRES"
    ? "Capital Federal"
    : provinciaId === "BUENOS AIRES"
    ? "Buenos Aires"
    : (provincia ? provincia.nombre : toTitleCase(provinciaId));
  const pobHtml = pobTotal
    ? `<div class="provincia-poblacion">👥 ${formatPoblacion(pobTotal)} habitantes</div>`
    : "";
  // Determinar facturación a mostrar según filtro de sector
  let facturacionMostrar = facturacionTotal;
  let labelFacturacion = "Facturación estimada";

  if (filtroSectorActivo === "privado") {
    facturacionMostrar = facturacionPrivado;
    labelFacturacion = "Facturación Privados";
  } else if (filtroSectorActivo === "publico") {
    facturacionMostrar = facturacionPublico;
    labelFacturacion = "Facturación Públicos";
  }

  const facHtml = facturacionMostrar > 0
    ? `<div class="provincia-facturacion">💰 ${labelFacturacion}: USD ${facturacionMostrar.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>`
    : "";

  // Calcular volúmenes y capacidad directo desde Sheet, con desglose por sector
  let volTotal = 0, volPrivado = 0, volPublico = 0;
  let capTotal = 0, capPrivado = 0, capPublico = 0;
  const sheetParaStats = grupo.flatMap(id => clientesProvinciasSheets[id] || []);
  if (sheetParaStats.length) {
    sheetParaStats.forEach(c => {
      const sector = (c.sector || "privado").toLowerCase();
      const v = parseFloat((c.volTotal || "0").toString().replace(/[^0-9.]/g, "")) || 0;
      const cap = (parseFloat(c.qx2) || 0) + (parseFloat(c.amb2) || 0)
                + (parseFloat(c.salaEndo2) || 0) + (parseFloat(c.ce2) || 0);
      volTotal += v; capTotal += cap;
      if (sector === "privado") { volPrivado += v; capPrivado += cap; }
      else if (sector === "publico") { volPublico += v; capPublico += cap; }
    });
  } else {
    // Fallback: nomencladores del JSON
    const localidadesParaStats = filtrarPorCategoria((datos[provinciaId] || {}).localidades || []);
    localidadesParaStats.forEach(loc => {
      (loc.nomencladores || []).forEach(n => {
        const v = parseFloat((n.cantidad || "").toString().replace(/[^0-9.]/g, ""));
        if (isNaN(v) || v <= 0) return;
        if (n.tipo === "volumen total") volTotal += v;
        if (n.tipo === "capacidad")     capTotal += v;
      });
    });
  }

  // Aplicar filtro de sector a vol y cap
  const volMostrar = filtroSectorActivo === "privado" ? volPrivado
                   : filtroSectorActivo === "publico" ? volPublico
                   : volTotal;
  const capMostrar = filtroSectorActivo === "privado" ? capPrivado
                   : filtroSectorActivo === "publico" ? capPublico
                   : capTotal;

  const locOrdenadas = [...localidades].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));

  // Calcular totales por sector ANTES de filtrar
  const conteoSector = { privado: 0, publico: 0 };
  locOrdenadas.forEach(loc => {
    const sector = loc.sector || "privado";
    if (conteoSector.hasOwnProperty(sector)) {
      conteoSector[sector]++;
    }
  });

  // Aplicar filtro de sector
  const locFiltradasPorSector = filtrarPorSector(locOrdenadas);

  // Para Buenos Aires: clasificar por zona AMBA (Norte/Oeste/Sur) o Interior
  function getZonaLocalidad(loc) {
    if (!getZonaLocalidad._lookup) {
      const lookup = new Map();
      // Partidos del 1er/2do cordón (con barrios detallados)
      Object.entries(ZONA_AMBA).forEach(([pId, zona]) => {
        const p = partidosData[pId];
        if (!p) return;
        lookup.set(normalizarNombre(p.nombre), zona);
        (p.barrios || []).forEach(b => lookup.set(normalizarNombre(b), zona));
      });
      // Partidos del 3er cordón (nombre de ciudad = nombre del partido)
      const tercer = { "escobar": "norte", "pilar": "norte", "general rodriguez": "oeste", "marcos paz": "oeste", "presidente peron": "sur", "san vicente": "sur" };
      Object.entries(tercer).forEach(([n, z]) => lookup.set(n, z));
      getZonaLocalidad._lookup = lookup;
    }
    const lookup = getZonaLocalidad._lookup;

    function matchToken(texto) {
      const n = normalizarNombre(texto || "");
      for (const [token, zona] of lookup) {
        if (new RegExp("(?:^|\\s)" + token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "(?:\\s|$)", "i").test(n)) {
          return zona;
        }
      }
      return null;
    }

    // 1. Ciudad extraída del código postal argentino (ej: "B1704EIP Ramos Mejía" → "Ramos Mejía")
    //    Evita falsos positivos por nombres de calles como "Mariano Moreno"
    const cpMatch = (loc.direccion || "").match(/[A-Z]\d{4}[A-Za-z]*\s+([^,]+)/i);
    if (cpMatch) {
      const z = matchToken(cpMatch[1].trim());
      if (z) return z;
    }

    // 2. Nombre de la facility (ej: "Clínica Modelo de Morón")
    const z2 = matchToken(loc.nombre);
    if (z2) return z2;

    return "interior";
  }

  // Clientes del sheet con PROVINCIA/ZONA = "PROVINCIAS"
  const clientesSheet = clientesProvinciasSheets[provinciaId] || [];
  window._clienteSheetData = {};
  const clientesHtml = clientesSheet.length > 0
    ? clientesSheet.map((c, idx) => {
        const id = `cs_${provinciaId.replace(/\s/g,'_')}_${idx}`;

        // Para "AMBA TOTAL" en Buenos Aires: combinar con INTERIOR
        const esAmbaBsAs = provinciaId === "BUENOS AIRES" && c.nombre.toUpperCase() === "AMBA TOTAL";
        const interior = esAmbaBsAs ? clientesZonasBA.interior : null;

        function sumarNum(a, b) {
          const va = parseFloat((a || "").replace(/[^0-9.]/g, ""));
          const vb = parseFloat((b || "").replace(/[^0-9.]/g, ""));
          const total = (!isNaN(va) ? va : 0) + (!isNaN(vb) ? vb : 0);
          return total > 0 ? String(total) : "0";
        }
        function sumarFac(a, b) {
          const va = parseFloat((a || "").replace(/[^0-9.]/g, ""));
          const vb = parseFloat((b || "").replace(/[^0-9.]/g, ""));
          const total = (!isNaN(va) ? va : 0) + (!isNaN(vb) ? vb : 0);
          return total > 0 ? `USD ${total.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "";
        }

        const displayNombre = esAmbaBsAs ? "BUENOS AIRES" : c.nombre;
        const displayTipo   = esAmbaBsAs ? "AMBA + INTERIOR" : (c.tipo || "");

        const qx2      = esAmbaBsAs ? sumarNum(c.qx2,      interior?.qx2)      : c.qx2;
        const amb2     = esAmbaBsAs ? sumarNum(c.amb2,     interior?.amb2)     : c.amb2;
        const salaEndo2= esAmbaBsAs ? sumarNum(c.salaEndo2,interior?.salaEndo2): c.salaEndo2;
        const ce2      = esAmbaBsAs ? sumarNum(c.ce2,      interior?.ce2)      : c.ce2;
        const facTotal = esAmbaBsAs ? sumarFac(c.facturacion, interior?.facturacion) : (c.facturacion || "");

        const eficiencia = [
          c.qx       && c.qx       !== "0" ? `<span class="cliente-sheet-badge cliente-sheet-badge--ef">QX: ${c.qx}</span>`             : "",
          c.amb      && c.amb      !== "0" ? `<span class="cliente-sheet-badge cliente-sheet-badge--ef">AMB: ${c.amb}</span>`            : "",
          c.salaEndo && c.salaEndo !== "0" ? `<span class="cliente-sheet-badge cliente-sheet-badge--ef">SALA ENDO: ${c.salaEndo}</span>` : "",
          c.ce       && c.ce       !== "0" ? `<span class="cliente-sheet-badge cliente-sheet-badge--ef">CE: ${c.ce}</span>`              : "",
        ].filter(Boolean).join("");
        const caps = [
          qx2       && qx2       !== "0" ? `<span class="cliente-sheet-badge">QX: ${qx2}</span>`             : "",
          amb2      && amb2      !== "0" ? `<span class="cliente-sheet-badge">AMB: ${amb2}</span>`            : "",
          salaEndo2 && salaEndo2 !== "0" ? `<span class="cliente-sheet-badge">SALA ENDO: ${salaEndo2}</span>` : "",
          ce2       && ce2       !== "0" ? `<span class="cliente-sheet-badge">CE: ${ce2}</span>`              : "",
        ].filter(Boolean).join("");

        window._clienteSheetData[id] = {
          nombre: displayNombre,
          tipo: displayTipo,
          eficiencia,
          caps,
          facturacion: facTotal,
          poblacion: pobTotal || 0,
          nombreProvincia: nombre,
          sanatoriosPrivados: conteoSector.privado,
          sanatoriosPublicos: conteoSector.publico,
          sanatoriosTotal: conteoSector.privado + conteoSector.publico
        };
        return `
          <div class="localidad-item" onclick="abrirInfoClienteSheet('${id}')" style="cursor:pointer;">
            <strong>${displayNombre}</strong>
            <small>${displayTipo ? `<span class="badge">${displayTipo}</span>` : ""}</small>
          </div>`;
      }).join("")
    : "";

  function renderLoc(loc) {
    return `
      <div class="localidad-item" onclick="centrarEnMarcador(${loc.lat}, ${loc.lng})">
        <strong>${loc.nombre}</strong>
        <small>📌 ${loc.direccion} &nbsp;•&nbsp; <span class="badge">${loc.tipo}</span></small>
      </div>`;
  }

  // Construir HTML del filtro de sector con botones tipo tabs
  const totalLocales = locOrdenadas.length;

  // Calcular porcentajes
  const totalSectores = conteoSector.privado + conteoSector.publico;
  const porcentajePrivado = totalSectores > 0 ? ((conteoSector.privado / totalSectores) * 100).toFixed(1) : 0;
  const porcentajePublico = totalSectores > 0 ? ((conteoSector.publico / totalSectores) * 100).toFixed(1) : 0;

  // Resumen de sanatorios en la provincia para sección de clientes
  const sanatoriosResumenHtml = `
    <div class="sanatorios-resumen-provincia">
      <div class="sanatorios-resumen-titulo">📊 Sanatorios en esta provincia</div>
      <div class="sanatorios-resumen-contenido">
        <div class="sanatorios-resumen-total">Total: <strong>${totalSectores}</strong> sanatorios</div>
        <div class="sanatorios-resumen-desglose">
          <div class="sanatorios-resumen-item">
            <span class="sanatorios-resumen-label">Privados:</span>
            <span class="sanatorios-resumen-valor">${conteoSector.privado}</span>
            <span class="sanatorios-resumen-porcentaje">${porcentajePrivado}%</span>
          </div>
          <div class="sanatorios-resumen-item">
            <span class="sanatorios-resumen-label">Públicos:</span>
            <span class="sanatorios-resumen-valor">${conteoSector.publico}</span>
            <span class="sanatorios-resumen-porcentaje">${porcentajePublico}%</span>
          </div>
        </div>
      </div>
    </div>
  `;

  const filtroHtml = totalLocales > 0 ? `
    <div class="sector-filter-container">
      <label>Filtrar por sector:</label>
      <div class="sector-filter-buttons">
        <button class="sector-btn ${!filtroSectorActivo ? 'sector-btn-active' : ''}" onclick="aplicarFiltroSector('')">
          Todo
        </button>
        <button class="sector-btn ${filtroSectorActivo === 'privado' ? 'sector-btn-active' : ''}" onclick="aplicarFiltroSector('privado')">
          Privado
        </button>
        <button class="sector-btn ${filtroSectorActivo === 'publico' ? 'sector-btn-active' : ''}" onclick="aplicarFiltroSector('publico')">
          Público
        </button>
        <button class="sector-btn sector-btn-vighi ${filtroVighiActivo ? 'sector-btn-active' : ''}" onclick="toggleFiltroVighi()">
          Vighi
        </button>
      </div>
    </div>
  ` : "";

  // HTML de estadísticas de sector
  const sectorStatsHtml = `
    <div class="sector-stats">
      <div class="sector-stat-item">
        <span class="sector-stat-label">Privados:</span>
        <span class="sector-stat-value">${conteoSector.privado}</span>
        <span class="sector-stat-percent">${porcentajePrivado}%</span>
      </div>
      <div class="sector-stat-item">
        <span class="sector-stat-label">Públicos:</span>
        <span class="sector-stat-value">${conteoSector.publico}</span>
        <span class="sector-stat-percent">${porcentajePublico}%</span>
      </div>
    </div>
  `;

  let localidadesHtml = "";
  if (locFiltradasPorSector.length === 0) {
    localidadesHtml = filtroSectorActivo
      ? `<p class="sin-datos">Sin localidades en el sector seleccionado.</p>`
      : `<p class="sin-datos">Sin localidades registradas para esta provincia.</p>`;
  } else if (provinciaId === "BUENOS AIRES") {
    // Agrupar por zona AMBA (usando localidades ya filtradas por sector)
    const grupos = { norte: [], oeste: [], sur: [], interior: [] };
    locFiltradasPorSector.forEach(loc => { grupos[getZonaLocalidad(loc)].push(loc); });
    const ZONA_CFG = [
      { key: "norte",    label: "ZONA NORTE",    cls: "amba-zona-norte" },
      { key: "oeste",    label: "ZONA OESTE",    cls: "amba-zona-oeste" },
      { key: "sur",      label: "ZONA SUR",      cls: "amba-zona-sur"   },
      { key: "interior", label: "INTERIOR",      cls: "ba-interior"     },
    ];
    ZONA_CFG.forEach(({ key, label, cls }) => {
      if (grupos[key].length === 0) return;
      const claseBase = key !== "interior"
        ? `amba-zona-grupo-titulo amba-zona-grupo-${key}`
        : `amba-zona-grupo-titulo ba-interior-titulo`;
      const total = grupos[key].length;

      // Calcular privados y públicos para esta zona
      const zonaPrivados = grupos[key].filter(loc => (loc.sector || "privado") === "privado").length;
      const zonaPublicos = grupos[key].filter(loc => (loc.sector || "privado") === "publico").length;
      const porcentajeZonaPrivado = total > 0 ? ((zonaPrivados / total) * 100).toFixed(1) : 0;
      const porcentajeZonaPublico = total > 0 ? ((zonaPublicos / total) * 100).toFixed(1) : 0;

      const sectorInfoHtml = `<span class="zona-sector-info">Privados: ${zonaPrivados} (${porcentajeZonaPrivado}%) | Públicos: ${zonaPublicos} (${porcentajeZonaPublico}%)</span>`;

      localidadesHtml += `<div class="${claseBase} zona-ba-titulo" data-zona="${key}" style="cursor:pointer;" onclick="resaltarZonaBA('${key}')">${label} <span class="zona-ba-total">(${total})</span> <span class="zona-ba-flecha">▶</span></div>`;
      localidadesHtml += `<div class="zona-sector-breakdown">${sectorInfoHtml}</div>`;
      localidadesHtml += `<div id="zona-lista-${key}" class="zona-ba-lista">`;
      localidadesHtml += grupos[key].map(renderLoc).join("");
      localidadesHtml += `</div>`;
    });
  } else {
    localidadesHtml = locFiltradasPorSector.map(renderLoc).join("");
  }

  const seccionLabel = categoriaActiva === "consultorios" ? "Consultorios" : "Sanatorios";

  const tieneInfoDirecta = (clientesProvinciasDirectos[provinciaId] || []).length > 0;

  const volStr = volMostrar > 0 ? volMostrar.toLocaleString('es-AR') : null;
  const capStr = capMostrar > 0 ? capMostrar.toLocaleString('es-AR') : null;
  const facCardStr = facturacionMostrar > 0
    ? `USD ${facturacionMostrar.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : null;
  const prestTotal = locOrdenadas.length;

  document.getElementById("panelBody").innerHTML = `
    <div class="pob-argentina-card" style="cursor:default">
      <div class="pob-argentina-top">
        <span class="pob-argentina-titulo">📍 ${nombre}</span>
        <div class="pob-argentina-top-right">
          ${prestTotal > 0 ? `<span class="pob-prest pob-prest-total pob-argentina-prest">${prestTotal} prest.</span>` : ""}
          <button class="btn-cerrar-argentina" onclick="volverAlListado()" title="Volver">✕</button>
        </div>
      </div>
      ${pobTotal ? `<div class="pob-argentina-pob">${formatPoblacion(pobTotal)} hab.</div>` : ""}
      ${facCardStr ? `
      <div class="pob-argentina-bottom">
        <span class="pob-argentina-fac-label">💰 ${labelFacturacion}</span>
        <span class="pob-argentina-fac-valor">${facCardStr}</span>
      </div>` : ""}
      ${(volStr || capStr) ? `
      <div class="prov-card-desglose-btn" onclick="toggleDesgloseCard(this)">
        Ver desglose <span class="prov-card-flecha">▾</span>
      </div>
      <div class="prov-card-desglose" style="display:none">
        ${capStr ? `<div class="prov-card-stat"><span>⚡ Capacidad instalada</span><span>${capStr}</span></div>` : ""}
        ${volStr ? `<div class="prov-card-stat"><span>📦 Volumen total</span><span class="prov-vol">${volStr}</span></div>` : ""}
        ${facCardStr ? `<div class="prov-card-stat"><span>💰 Facturación USD</span><span class="prov-fac">${facCardStr}</span></div>` : ""}
      </div>` : ""}
    </div>
    ${filtroHtml}
    ${locFiltradasPorSector.length > 0 ? `<div class="seccion-titulo">${seccionLabel}</div>` : ""}
    ${localidadesHtml}
  `;

  // Obtener todas las localidades sin filtro de sector para los pins
  const datosParaPins = getProvinciasDataActivo();
  const todasLasLocalidadesParaPins = [];
  const vistasParaPins = new Set();
  const grupoParaPins = getGrupoProvincias(provinciaId);
  grupoParaPins.forEach(id => {
    const prov = datosParaPins[id];
    if (prov && Array.isArray(prov.localidades)) {
      prov.localidades.forEach(loc => {
        if (!vistasParaPins.has(loc.nombre)) {
          vistasParaPins.add(loc.nombre);
          todasLasLocalidadesParaPins.push(loc);
        }
      });
    }
  });

  // Agregar marcadores al mapa (respetando filtro de sector activo)
  agregarMarcadores(filtrarPorSector(filtrarPorCategoria(todasLasLocalidadesParaPins)));

  abrirPanelMobile();
}
function abrirInfoWindowProvincia(provinciaId) {
  const entries = clientesProvinciasDirectos[provinciaId] || [];
  if (entries.length === 0) return;
  const c = entries[0];

  const eficiencia = [
    c.qx       && c.qx       !== "0" ? `<span class="cliente-sheet-badge cliente-sheet-badge--ef">QX: ${c.qx}</span>` : "",
    c.amb      && c.amb      !== "0" ? `<span class="cliente-sheet-badge cliente-sheet-badge--ef">AMB: ${c.amb}</span>` : "",
    c.salaEndo && c.salaEndo !== "0" ? `<span class="cliente-sheet-badge cliente-sheet-badge--ef">SALA ENDO: ${c.salaEndo}</span>` : "",
    c.ce       && c.ce       !== "0" ? `<span class="cliente-sheet-badge cliente-sheet-badge--ef">CE: ${c.ce}</span>` : "",
  ].filter(Boolean).join("");

  const caps = [
    c.qx2      && c.qx2      !== "0" ? `<span class="cliente-sheet-badge">QX: ${c.qx2}</span>` : "",
    c.amb2     && c.amb2     !== "0" ? `<span class="cliente-sheet-badge">AMB: ${c.amb2}</span>` : "",
    c.salaEndo2 && c.salaEndo2 !== "0" ? `<span class="cliente-sheet-badge">SALA ENDO: ${c.salaEndo2}</span>` : "",
    c.ce2      && c.ce2      !== "0" ? `<span class="cliente-sheet-badge">CE: ${c.ce2}</span>` : "",
  ].filter(Boolean).join("");

  const rawFac = (c.facturacion || "").replace(/U\$S/g,"").replace(/\s/g,"").replace(/,/g,"");
  const valFac = parseFloat(rawFac);
  const facStr = !isNaN(valFac) && valFac > 0
    ? `USD ${valFac.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : c.facturacion || "";

  const contenido = `
    <div class="popup-container">
      <strong class="popup-nombre">${c.nombre}</strong>
      ${c.tipo ? `<p class="popup-direccion">${c.tipo}</p>` : ""}
      ${eficiencia || caps || facStr ? `
        <button class="popup-btn-desglose" onclick="toggleDesglose(this)">Ver desglose <span class="popup-btn-flecha">&#9660;</span></button>
        <div id="nomDesglose" class="popup-desglose">
          ${eficiencia ? `<div class="cliente-sheet-label" style="margin-top:8px;color:#1a1a1a;">Eficiencia</div><div class="cliente-sheet-caps">${eficiencia}</div>` : ""}
          ${caps ? `<div class="cliente-sheet-label" style="margin-top:8px;color:#1a1a1a;">Capacidad instalada</div><div class="cliente-sheet-caps">${caps}</div>` : ""}
          ${facStr ? `<div class="cliente-sheet-facturacion" style="margin-top:8px;">💰 ${facStr}</div>` : ""}
        </div>
      ` : ""}
    </div>
  `;
  const pos = _provinciaCentroLatLng || map.getCenter();
  infoWindowGlobal.setContent(contenido);
  infoWindowGlobal.setPosition(pos);
  infoWindowGlobal.open(map);
  google.maps.event.addListenerOnce(infoWindowGlobal, 'domready', function() {
    liberarAlturaInfoWindow();
    setTimeout(centrarInfoWindow, 150);
  });
}

function abrirInfoClienteSheet(id) {
  var data = window._clienteSheetData && window._clienteSheetData[id];
  if (!data) return;
  const pobStr = data.poblacion ? `👥 ${formatPoblacion(data.poblacion)} hab. · ${data.nombreProvincia}` : "";
  var contenido = `
    <div class="popup-container">
      <strong class="popup-nombre">${data.nombre}</strong>
      ${data.tipo ? `<p class="popup-direccion">${data.tipo}</p>` : ""}
      ${pobStr ? `<p class="popup-direccion" style="color:#6a0dad;font-weight:600;margin-top:2px;">${pobStr}</p>` : ""}
      ${data.eficiencia || data.caps || data.facturacion || data.sanatoriosTotal ? `
        <button class="popup-btn-desglose" onclick="toggleDesglose(this)">Ver desglose <span class="popup-btn-flecha">&#9660;</span></button>
        <div id="nomDesglose" class="popup-desglose">
          ${data.eficiencia ? `<div class="cliente-sheet-label" style="margin-top:8px;color:#1a1a1a;">Eficiencia</div><div class="cliente-sheet-caps">${data.eficiencia}</div>` : ""}
          ${data.caps ? `<div class="cliente-sheet-label" style="margin-top:8px;color:#1a1a1a;">Capacidad instalada</div><div class="cliente-sheet-caps">${data.caps}</div>` : ""}
          ${data.facturacion ? `<div class="cliente-sheet-facturacion" style="margin-top:8px;">💰 ${data.facturacion}</div>` : ""}
          ${data.sanatoriosTotal ? `
            <div class="cliente-sheet-label" style="margin-top:8px;color:#1a1a1a;">Sanatorios en esta provincia</div>
            <div class="cliente-sheet-sanatorios">
              <div style="display:flex;gap:8px;font-size:12px;margin-top:6px;">
                <div style="flex:1;text-align:center;padding:6px;background:#f0f4fc;border-radius:4px;">
                  <div style="color:#6b5b7f;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.2px;">Privados</div>
                  <div style="color:#a020a8;font-weight:700;font-size:16px;margin-top:2px;">${data.sanatoriosPrivados}</div>
                  <div style="color:#9070a8;font-size:10px;margin-top:2px;">${data.sanatoriosTotal > 0 ? ((data.sanatoriosPrivados / data.sanatoriosTotal) * 100).toFixed(1) : 0}%</div>
                </div>
                <div style="flex:1;text-align:center;padding:6px;background:#f0f4fc;border-radius:4px;">
                  <div style="color:#6b5b7f;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.2px;">Públicos</div>
                  <div style="color:#a020a8;font-weight:700;font-size:16px;margin-top:2px;">${data.sanatoriosPublicos}</div>
                  <div style="color:#9070a8;font-size:10px;margin-top:2px;">${data.sanatoriosTotal > 0 ? ((data.sanatoriosPublicos / data.sanatoriosTotal) * 100).toFixed(1) : 0}%</div>
                </div>
              </div>
            </div>
          ` : ""}
        </div>
      ` : ""}
    </div>
  `;
  const pos = _provinciaCentroLatLng || map.getCenter();
  infoWindowGlobal.setContent(contenido);
  infoWindowGlobal.setPosition(pos);
  infoWindowGlobal.open(map);
  google.maps.event.addListenerOnce(infoWindowGlobal, 'domready', function() {
    liberarAlturaInfoWindow();
    setTimeout(centrarInfoWindow, 150);
  });
}
