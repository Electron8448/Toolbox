import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { categories, tools } from './categories/index.js';

const pages = new Set(['/', '/search', ...categories.map(category => category.path), ...tools.map(tool => tool.path)]);
const modules = [
  'app.js',
  'categories/index.js',
  'categories/maths/index.js',
  'categories/maths/fractions/index.js',
  'categories/maths/fractions/fraction-simplifier/index.js',
  'categories/maths/fractions/fraction-simplifier/page.js',
  'categories/maths/fractions/fraction-simplifier/calculator.js',
  'categories/maths/algebra/index.js',
  'categories/maths/algebra/graphing-calculator/index.js',
  'categories/maths/algebra/graphing-calculator/page.js',
  'categories/maths/algebra/graphing-calculator/expression.js',
  'categories/maths/algebra/beginner-graph-maker/index.js',
  'categories/maths/algebra/beginner-graph-maker/page.js',
  'categories/writing/index.js'
];
const assets = new Map(modules.map(file => ['/' + file, [file, 'text/javascript']]));
assets.set('/styles.css', ['styles.css', 'text/css']);
const port = Number(process.env.PORT ?? 3000);

createServer(async (request, response) => {
  try {
    const path = new URL(request.url, 'http://localhost').pathname.replace(/\/$/, '') || '/';
    const entry = pages.has(path) ? ['index.html', 'text/html'] : assets.get(path);
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
