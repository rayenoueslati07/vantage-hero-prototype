/* Minimal static server for the Vantage Office hero prototype (no dependencies).
 * Usage: node serve.js [port]   → http://localhost:5173
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const PORT = Number(process.argv[2] || process.env.PORT || 5173);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.cur': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.pdf': 'application/pdf',
};

http.createServer((req, res) => {
  let url = decodeURIComponent(req.url.split('?')[0]);

  // the live site fetches /api/config.php for contact details – answer with an empty config
  if (url === '/api/config.php') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end('{}');
  }
  if (url === '/') url = '/index.html';

  let file = path.normalize(path.join(ROOT, url));
  if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end(); }

  // extensionless routes of the original site (hakkimizda, proje …) → serve the homepage shell
  if (!path.extname(file) && !fs.existsSync(file)) file = path.join(ROOT, 'index.html');

  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) { res.writeHead(404); return res.end('Not found'); }
    const type = TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-cache', 'Content-Length': st.size });
    fs.createReadStream(file).pipe(res);
  });
}).listen(PORT, () => {
  console.log(`Vantage hero prototype → http://localhost:${PORT}`);
});
