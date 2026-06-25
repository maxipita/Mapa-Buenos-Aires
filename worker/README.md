# Proxy del Sheet de facturación (Cloudflare Worker)

Los datos son públicos para todos los visitantes del sitio. Este Worker
existe solo para que la URL real del Google Sheet (con su ID) no quede
expuesta en el código fuente del cliente, y para agregar caché de borde
(30s) en vez de pegarle directo a Sheets desde cada navegador.

## Deploy

1. Instalar Wrangler (una vez):
   ```
   npm install -g wrangler
   ```
2. Login con la cuenta de Cloudflare:
   ```
   wrangler login
   ```
3. Desde esta carpeta (`worker/`), editar `wrangler.toml` y poner el dominio
   real del sitio en `ALLOWED_ORIGIN` (ej. `https://tuusuario.github.io`).
4. Configurar el secret (no va en el repo, Cloudflare lo guarda cifrado):
   ```
   wrangler secret put SHEETS_CSV_URL
   ```
   Pegar el valor que hoy está en `mapa-shared.js` (la URL completa
   `https://docs.google.com/spreadsheets/d/.../gviz/tq?tqx=out:csv&gid=...`).
5. Deploy:
   ```
   wrangler deploy
   ```
6. Wrangler va a imprimir la URL final, algo como:
   `https://vighi-sheet-proxy.<tu-subdominio>.workers.dev`

   Esa es la URL que hay que pegar en `WORKER_BASE_URL` en `mapa-shared.js`.

## Verificación rápida

```
curl https://vighi-sheet-proxy.<tu-subdominio>.workers.dev/sheet-data
```
Debe devolver el CSV completo (con facturación incluida — es público a propósito).

## Si el Sheet cambia de URL/gid

```
wrangler secret put SHEETS_CSV_URL
```
y volver a pegar la URL nueva. No hace falta tocar el código del cliente.
