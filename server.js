import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';

const pages = new Set(['/', '/maths', '/writing', '/search', '/maths/fractions/fraction-simplifier']);
const assets = {
  '/styles.css': ['styles.css', 'text/css'],
  '/app.js': ['app.js', 'text/javascript'],
  '/fractions.js': ['fractions.js', 'text/javascript']
};
const port = Number(process.env.PORT ?? 3000);

createServer(async (request, response) => {
  try {
    const path = new URL(request.url, 'http://localhost').pathname.replace(/\/$/, '') || '/';
    const entry = pages.has(path) ? ['index.html', 'text/html'] : assets[path];
    if (!Array.isArray(entry)) {
      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Page not found');
      return;
    }
    const [file, type] = entry;
    const body = await readFile(new URL(file, import.meta.url));
    response.writeHead(200, { 'Content-Type': type + '; charset=utf-8' });
    response.end(body);
  } catch {
    response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Unable to load page');
  }
}).listen(port, '127.0.0.1', () => console.log('Toolbox is running at http://127.0.0.1:' + port));
