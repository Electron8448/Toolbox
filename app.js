import { simplifyFraction, equivalentPage } from './fractions.js';

const categories = [
  { name: 'Maths', path: '/maths', icon: '÷', theme: 'maths',
    description: 'Useful mathematical tools for calculations and problem-solving.',
    groups: [{ name: 'Fractions', tools: [{
      name: 'Fraction Simplifier',
      path: '/maths/fractions/fraction-simplifier',
      description: 'Reduce a fraction to its simplest form.'
    }] }] },
  { name: 'Writing', path: '/writing', icon: 'Aa', theme: 'writing',
    description: 'Tools to help with writing and working with text.', groups: [] }
];
const tools = categories.flatMap(category => category.groups.flatMap(group =>
  group.tools.map(tool => ({ ...tool, category, group }))
));
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
    <span class="tool-icon" aria-hidden="true"><b>½</b></span>
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

function fractionPage(tool) {
  return `${breadcrumbs(tool.category, tool.name)}
    <header class="page-heading"><span class="category-icon maths" aria-hidden="true">½</span>
      <h1>${tool.name}</h1><p>${tool.description}</p></header>
    <div class="fraction-layout">
      <form class="fraction-form panel" novalidate>
        <div class="field">
          <label for="fraction-query">Search for a fraction</label>
          <input id="fraction-query" name="fractionQuery" type="text" placeholder="e.g. 1/2 or 9/10" autocomplete="off" spellcheck="false" aria-describedby="fraction-error">
        </div>
        <fieldset class="stacked-entry">
          <legend>Or enter a stacked fraction</legend>
          <div class="fraction-fields">
            <input name="numerator" aria-label="Numerator" placeholder="Numerator" type="text" autocomplete="off" aria-describedby="fraction-error">
            <input name="denominator" aria-label="Denominator" placeholder="Denominator" type="text" autocomplete="off" aria-describedby="fraction-error">
          </div>
        </fieldset>
        <p id="fraction-error" class="error" role="alert"></p>
        <div class="actions"><button type="submit" class="primary">Search</button>
          <button type="reset" class="secondary">Reset</button></div>
      </form>
      <section class="result panel" aria-labelledby="result-title">
        <h2 id="result-title">Simplified fraction</h2>
        <div id="fraction-output" role="status"><p>Enter a fraction to see the result.</p></div>
      </section>
    </div>
    <section class="equivalents panel" id="equivalents" aria-labelledby="equivalents-title" hidden>
      <h2 id="equivalents-title">Equivalent fractions</h2>
      <p>Ordered by denominator, smallest first. Enter a filter to match an exact value.</p>
      <div class="filters">
        <div class="field"><label for="filter-numerator">Filter by numerator</label>
          <input id="filter-numerator" type="text" placeholder="Any numerator" autocomplete="off" aria-describedby="filter-status"></div>
        <div class="field"><label for="filter-denominator">Filter by denominator</label>
          <input id="filter-denominator" type="text" placeholder="Any denominator" autocomplete="off" aria-describedby="filter-status"></div>
      </div>
      <p id="filter-status" role="status"></p>
      <ol class="fraction-results" aria-label="Equivalent fractions"></ol>
      <button class="secondary more-fractions" type="button">Show more</button>
    </section>`;
}

function stackedFraction({ numerator, denominator }) {
  return `<span class="sr-only">${numerator} over ${denominator}</span>
    <span class="fraction" aria-hidden="true"><span>${numerator}</span><span>${denominator}</span></span>`;
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

function bindFraction() {
  const form = document.querySelector('.fraction-form');
  const { fractionQuery, numerator, denominator } = form.elements;
  const error = document.querySelector('#fraction-error');
  const output = document.querySelector('#fraction-output');
  const equivalents = document.querySelector('#equivalents');
  const topFilter = document.querySelector('#filter-numerator');
  const bottomFilter = document.querySelector('#filter-denominator');
  const status = document.querySelector('#filter-status');
  const list = document.querySelector('.fraction-results');
  const more = document.querySelector('.more-fractions');
  const pageSize = 24;
  let reduced;
  let nextMultiplier = 1n;

  function clear() {
    error.textContent = '';
    output.innerHTML = '<p>Enter a fraction to see the result.</p>';
    equivalents.hidden = true;
    form.querySelectorAll('[aria-invalid]').forEach(input => input.removeAttribute('aria-invalid'));
  }

  function showEquivalents(append = false) {
    if (!append) {
      nextMultiplier = 1n;
      list.replaceChildren();
    }
    const page = equivalentPage(reduced, topFilter.value, bottomFilter.value, nextMultiplier, pageSize);
    for (const [field, input] of [['numerator', topFilter], ['denominator', bottomFilter]]) {
      if (page.field === field) input.setAttribute('aria-invalid', 'true');
      else input.removeAttribute('aria-invalid');
    }
    if (page.fractions.length) {
      list.insertAdjacentHTML('beforeend', page.fractions.map(value => `<li>${stackedFraction(value)}</li>`).join(''));
    }
    nextMultiplier = page.nextMultiplier;
    more.hidden = nextMultiplier === null;
    status.textContent = page.error ?? (page.fractions.length
      ? (more.hidden ? '1 matching fraction.' : `Showing ${list.children.length} equivalent fractions.`)
      : 'No equivalent fractions match these filters.');
  }

  form.addEventListener('input', event => {
    clear();
    if (event.target === fractionQuery) {
      const parts = fractionQuery.value.split('/');
      numerator.value = parts.length === 2 ? parts[0].trim() : '';
      denominator.value = parts.length === 2 ? parts[1].trim() : '';
    } else {
      fractionQuery.value = numerator.value || denominator.value ? `${numerator.value}/${denominator.value}` : '';
    }
  });
  form.addEventListener('reset', () => {
    clear();
    topFilter.value = '';
    bottomFilter.value = '';
    fractionQuery.focus();
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    clear();
    const parts = fractionQuery.value.split('/');
    const result = parts.length === 2
      ? simplifyFraction(...parts)
      : { error: 'Enter one fraction in the format 1/2.' };
    if (result.error) {
      error.textContent = result.error;
      const input = document.activeElement === numerator || document.activeElement === denominator
        ? form.elements.namedItem(result.field) ?? fractionQuery
        : fractionQuery;
      input.setAttribute('aria-invalid', 'true');
      input.focus();
      return;
    }
    reduced = result;
    output.innerHTML = stackedFraction(reduced);
    equivalents.hidden = false;
    showEquivalents();
  });
  topFilter.addEventListener('input', () => showEquivalents());
  bottomFilter.addEventListener('input', () => showEquivalents());
  more.addEventListener('click', () => showEquivalents(true));
}

function render() {
  const path = location.pathname.replace(/\/$/, '') || '/';
  const category = categories.find(item => item.path === path);
  const tool = tools.find(item => item.path === path);
  main.className = path === '/' ? 'shell home' : 'shell inner';
  main.innerHTML = category ? categoryPage(category) : tool ? fractionPage(tool)
    : path === '/search' ? searchPage() : homePage();
  document.title = path === '/' ? 'Toolbox' : `${category?.name ?? tool?.name ?? 'Search'} | Toolbox`;
  sidebar.querySelectorAll('nav a').forEach(link => {
    const currentPath = tool?.category.path ?? path;
    if (link.pathname === currentPath) link.setAttribute('aria-current', link.pathname === path ? 'page' : 'location');
    else link.removeAttribute('aria-current');
  });
  if (tool) bindFraction();
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
  navigate(link.pathname, link.pathname === '/search');
});
window.addEventListener('popstate', () => {
  closeMenu();
  render();
});
render();
