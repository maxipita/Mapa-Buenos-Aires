// ============================================
// PROXY DEL GOOGLE SHEET DE FACTURACIÓN
// ============================================
// Los datos son públicos para todos los visitantes del sitio (decisión del
// negocio). Este Worker existe solo para que la URL real del Google Sheet
// (con su ID) no quede expuesta en el código fuente del cliente, y para
// agregar caché de borde (30s) en vez de pegarle directo a Sheets desde
// cada navegador.
//
// Secret requerido (wrangler secret put SHEETS_CSV_URL):
//   SHEETS_CSV_URL -> la URL gviz/tq?tqx=out:csv del Sheet
// Variable de entorno (no secreta, en wrangler.toml):
//   ALLOWED_ORIGINS -> lista separada por comas de orígenes permitidos
//                      (ej. "https://tuusuario.github.io,http://localhost:3000")

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const cors = corsHeaders(request, env);

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: cors });
    }

    if (url.pathname === "/sheet-data" && request.method === "GET") {
      return await handleSheetData(env, cors);
    }

    return json({ error: "Not found" }, 404, cors);
  },
};

function corsHeaders(request, env) {
  const allowed = (env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
  const origin = request.headers.get("Origin") || "";
  const allowOrigin = allowed.includes(origin) ? origin : allowed[0] || "";
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

async function handleSheetData(env, cors) {
  const upstream = await fetch(env.SHEETS_CSV_URL, {
    cf: { cacheTtl: 30, cacheEverything: true },
  });
  if (!upstream.ok) {
    return json({ error: "No se pudo leer el Sheet" }, 502, cors);
  }

  const csv = await upstream.text();
  return new Response(csv, {
    status: 200,
    headers: { ...cors, "Content-Type": "text/csv; charset=utf-8" },
  });
}

function json(obj, status, cors) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}
