import beginnerGraphMaker from './categories/maths/algebra/beginner-graph-maker/index.js';
import { makerPage, bindMaker } from './categories/maths/algebra/beginner-graph-maker/page.js';
import fractionSimplifier from './categories/maths/fractions/fraction-simplifier/index.js';
import graphingCalculator from './categories/maths/algebra/graphing-calculator/index.js';
import { graphPage, bindGraph } from './categories/maths/algebra/graphing-calculator/page.js';
import { categories, tools } from './categories/index.js';
import { fractionPage, bindFraction } from './categories/maths/fractions/fraction-simplifier/page.js';

const toolPages = new Map([
  [fractionSimplifier.path, { page: fractionPage, bind: bindFraction }],
  [graphingCalculator.path, { page: graphPage, bind: bindGraph }],
  [beginnerGraphMaker.path, { page: makerPage, bind: bindMaker }]
]);

const main = document.querySelector('main');
const sidebar = document.querySelector('#sidebar');
const menu = document.querySelector('#menu');
const arrow = '<span class="arrow" aria-hidden="true">↗</span>';

function badge(category) {
  return `<span class="category-icon ${category.theme}" aria-hidden="true">${category.icon}</span>`;
}

function searchForm() {
  return `<form class="search-box" role="search" action="/search">
    <span class="magnifier" aria-hidden="true"></span>
    <label class="sr-only" for="query">Search tools</label>
    <input id="query" name="q" type="search" placeholder="Search for a tool…" autocomplete="off">
  </form>`;
}

function breadcrumbs(...items) {
  return `<nav class="breadcrumbs" aria-label="Breadcrumb"><a href="/" data-route>Home</a>
    ${items.map(item => `<span aria-hidden="true">/</span>${typeof item === 'string'
      ? `<span aria-current="page">${item}</span>`
      : `<a href="${item.path}" data-route>${item.name}</a>`}`).join('')}</nav>`;
}

function toolCard(tool) {
  return `<a class="tool-card" href="${tool.path}" data-route>
    <span class="tool-icon" aria-hidden="true"><b>${tool.icon ?? '½'}</b></span>
    <span><strong>${tool.name}</strong><small>${tool.category.name} · ${tool.group.name}</small></span>${arrow}
  </a>`;
}

function homePage() {
  return `<section class="hero">
    <div class="hero-copy">
      <span class="logo hero-logo" aria-hidden="true"><i></i></span>
      <h1>Everything you need, <em>all in one toolbox.</em></h1>
      <p>Find useful online tools for maths and writing, all in one place.</p>
    </div>
    <div class="hero-art" aria-hidden="true">
      <div class="art-grid"></div>
      <div class="art-orbit"></div>
      <span class="spark spark-one">✦</span><span class="spark spark-two">✧</span>
      <span class="art-tile tile-maths">÷</span>
      <span class="art-tile tile-logo"><span class="logo"><i></i></span></span>
      <span class="art-tile tile-writing">Aa</span>
    </div>
  </section>
  <section class="workspace panel" aria-labelledby="workspace-title">
    <h2 id="workspace-title">Toolbox workspace</h2>
    <p>Have an idea for a tool we should add? Submit it as a bug report on GitHub.</p>
    <div class="actions">
      <a class="primary" href="https://github.com/Electron8448/Toolbox">View workspace ↗</a>
      <a class="secondary" href="https://github.com/Electron8448/Toolbox/issues/new?title=Tool%20suggestion%3A%20">Submit a bug report ↗</a>
    </div>
  </section>`;
}

function emptyState(icon, title, description) {
  return `<div class="empty"><span class="category-icon ${icon === 'Aa' ? 'writing' : 'maths'}" aria-hidden="true">${icon}</span>
    <h2>${title}</h2><p>${description}</p></div>`;
}

function categoryPage(category) {
  return `${breadcrumbs(category.name)}
    <header class="page-heading">${badge(category)}<h1>${category.name}</h1><p>${category.description}</p></header>
    ${category.groups.length ? category.groups.map(group => `<section class="tool-group">
      <h2>${group.name}</h2>
      ${tools.filter(tool => tool.group === group).map(toolCard).join('')}
    </section>`).join('') : emptyState('Aa', 'No writing tools yet', 'Writing tools will appear here when they’re available.')}`;
}

function searchPage() {
  return `${breadcrumbs('Search')}<header class="page-heading"><h1>Search tools</h1>
    <p>Find tools by name across all Toolbox categories.</p></header>
    ${searchForm()}
    <p class="sr-only" id="search-status" role="status"></p>
    <section class="search-results" aria-label="Search results"></section>`;
}

function bindSearch() {
  const input = document.querySelector('#query');
  const results = document.querySelector('.search-results');
  const status = document.querySelector('#search-status');
  input.value = new URLSearchParams(location.search).get('q') ?? '';
  function update() {
    const term = input.value.trim().toLowerCase();
    const matches = tools.filter(tool => tool.name.toLowerCase().includes(term));
    status.textContent = term ? `${matches.length} matching ${matches.length === 1 ? 'tool' : 'tools'}` : '';
    results.innerHTML = !term
      ? emptyState('⌕', 'Search by tool name', 'Start typing to find a tool across Maths and Writing.')
      : matches.length ? matches.map(toolCard).join('')
      : emptyState('⌕', 'No matching tools', 'Check the spelling or try a shorter search.');
  }
  input.addEventListener('input', () => {
    const params = new URLSearchParams();
    if (input.value) params.set('q', input.value);
    history.replaceState(null, '', '/search' + (params.size ? '?' + params : ''));
    update();
  });
  input.form.addEventListener('submit', event => event.preventDefault());
  update();
}

function render() {
  const path = location.pathname.replace(/\/$/, '') || '/';
  const category = categories.find(item => item.path === path);
  const tool = tools.find(item => item.path === path);
  const toolPage = toolPages.get(path);
  main.className = path === '/' ? 'shell home' : 'shell inner';
  main.innerHTML = category ? categoryPage(category) : toolPage ? toolPage.page(tool, breadcrumbs)
    : path === '/search' ? searchPage() : homePage();
  document.title = path === '/' ? 'Toolbox' : `${category?.name ?? tool?.name ?? 'Search'} | Toolbox`;
  sidebar.querySelectorAll('nav a').forEach(link => {
    const currentPath = tool?.category.path ?? path;
    if (link.pathname === currentPath) link.setAttribute('aria-current', link.pathname === path ? 'page' : 'location');
    else link.removeAttribute('aria-current');
  });
  toolPage?.bind();
  if (path === '/search') bindSearch();
}

function closeMenu() {
  if (sidebar.open) sidebar.close();
  menu.setAttribute('aria-expanded', 'false');
  menu.setAttribute('aria-label', 'Open menu');
}

function navigate(url, focusSearch = false) {
  closeMenu();
  if (url !== location.pathname + location.search) history.pushState(null, '', url);
  render();
  window.scrollTo(0, 0);
  (focusSearch ? document.querySelector('#query') : main).focus({ preventScroll: true });
}

menu.addEventListener('click', () => {
  if (sidebar.open) return closeMenu();
  sidebar.showModal();
  menu.setAttribute('aria-expanded', 'true');
  menu.setAttribute('aria-label', 'Close menu');
});
sidebar.querySelector('.close-menu').addEventListener('click', closeMenu);
sidebar.addEventListener('cancel', event => {
  event.preventDefault();
  closeMenu();
});
sidebar.addEventListener('click', event => {
  if (event.target === sidebar) {
    const bounds = sidebar.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right) closeMenu();
  }
});
document.addEventListener('click', event => {
  const link = event.target.closest('a[data-route]');
  if (!link || event.defaultPrevented || event.button !== 0 ||
      event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  navigate(link.pathname + link.search, link.pathname === '/search');
});
window.addEventListener('popstate', () => {
  closeMenu();
  render();
});
render();
