const fs = require('fs');
const https = require('https');

// URL del Sheet en CSV
const SHEETS_URL = "https://docs.google.com/spreadsheets/d/1LWynrRdnZSB9kaYPBZsRtswAAHDJIQHDwrRRdR2jwa8/gviz/tq?tqx=out:csv&gid=269143430";

function normalizarNombre(n) {
  return (n || "").toLowerCase().trim()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, " ").replace(/\s+/g, " ").trim();
}

function parsearCSV(texto) {
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

function descargarSheet() {
  return new Promise((resolve, reject) => {
    https.get(SHEETS_URL, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function actualizarJSONs() {
  try {
    console.log("Descargando datos del Sheet...");
    const csvData = await descargarSheet();
    const filas = parsearCSV(csvData);

    // Saltar header y crear mapa de nombre -> sector
    const sectorMap = {};
    for (let i = 1; i < filas.length; i++) {
      const fila = filas[i];
      if (fila.length < 4) continue;
      const nombre = fila[0].trim();
      const sector = fila[3].trim().toLowerCase();

      if (nombre && (sector === 'público' || sector === 'privado')) {
        const key = normalizarNombre(nombre);
        sectorMap[key] = sector === 'público' ? 'publico' : 'privado';
      }
    }

    console.log(`Encontrados ${Object.keys(sectorMap).length} registros del Sheet`);

    // Actualizar JSONs
    const archivos = [
      'DatosJson/sanatorios.json',
      'DatosJson/consultorios.json',
      'DatosJson/sanatoriosAmba.json',
      'DatosJson/consultoriosAmba.json',
      'DatosJson/sanatoriosArgentina.json',
      'DatosJson/consultoriosArgentina.json'
    ];

    for (const archivo of archivos) {
      const ruta = `./${archivo}`;
      if (!fs.existsSync(ruta)) {
        console.log(`⊘ ${archivo} no existe`);
        continue;
      }

      const contenido = JSON.parse(fs.readFileSync(ruta, 'utf8'));
      let actualizados = 0;

      // Recorrer todas las provincias/comunas/partidos
      Object.values(contenido).forEach(region => {
        (region.localidades || []).forEach(loc => {
          const key = normalizarNombre(loc.nombre);
          if (sectorMap[key]) {
            loc.sector = sectorMap[key];
            actualizados++;
          } else if (!loc.sector) {
            loc.sector = 'privado'; // default
          }
        });
      });

      fs.writeFileSync(ruta, JSON.stringify(contenido, null, 2));
      console.log(`✓ ${archivo}: ${actualizados} localidades actualizadas`);
    }

    console.log("\n✓ Actualización completada");
  } catch (err) {
    console.error("Error:", err.message);
  }
}

actualizarJSONs();
