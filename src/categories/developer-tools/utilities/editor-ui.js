import { sitePath } from '../../../routing.js';

const files = {
  html: { name: 'index.html', icon: '&lt;&gt;' },
  css: { name: 'styles.css', icon: '#' },
  javascript: { name: 'script.js', icon: 'JS' }
};

const base = new URL('../../../vendor/monaco/vs/', import.meta.url);
let engine;
function loadEditor() {
  if (engine) return engine;
  engine = new Promise((resolve, reject) => {
    const style = document.createElement('link');
    style.rel = 'stylesheet';
    style.href = new URL('editor/editor.main.css', base).href;
    document.head.append(style);

    const loader = document.createElement('script');
    loader.src = new URL('loader.js', base).href;
    loader.onload = () => {
      const amd = globalThis.require;
      amd.config({ paths: { vs: base.href.replace(/\/$/, '') } });
      amd(['vs/editor/editor.main'], module => resolve(module ?? globalThis.monaco), reject);
    };
    loader.onerror = () => reject(new Error('The full editor could not load.'));
    document.head.append(loader);
  });
  return engine;
}

export function editorWorkspace(fields, control) {
  const fileLabel = field => `<span class="file-icon ${field.name}" aria-hidden="true">${files[field.name].icon}</span>${files[field.name].name}`;
  return `<div class="editor-workbench">
    <aside class="editor-explorer" aria-label="Explorer">
      <div class="editor-explorer-title">Explorer</div>
      ${fields.map((field, index) => `<button type="button" class="editor-file" aria-pressed="${index === 0}">${fileLabel(field)}</button>`).join('')}
    </aside>
    <div class="editor-main">
      <div class="editor-toolbar" aria-label="Editor commands">
        <button type="button" data-editor-command="open">Open file</button>
        <button type="button" data-editor-command="save">Save file</button>
        <button type="button" data-editor-command="find" disabled>Find</button>
        <button type="button" data-editor-command="replace" disabled>Replace</button>
        <button type="button" data-editor-command="format" disabled>Format</button>
        <input type="file" class="editor-import" accept=".html,.htm,.css,.js,.mjs" hidden>
      </div>
      <div class="editor-tabs" role="tablist" aria-label="Open files">
        ${fields.map((field, index) => `<button type="button" role="tab" id="editor-tab-${index}" aria-controls="editor-panel-${index}" aria-selected="${index === 0}" tabindex="${index === 0 ? 0 : -1}">${fileLabel(field)}</button>`).join('')}
      </div>
      ${fields.map((field, index) => `<div class="editor-panel" role="tabpanel" id="editor-panel-${index}" aria-labelledby="editor-tab-${index}" ${index ? 'hidden' : ''}>
        <div class="editor-fallback">${control(field, index)}</div>
        <div class="editor-monaco" hidden></div>
      </div>`).join('')}
      <div class="editor-status"><span class="editor-language">HTML</span><span class="editor-position">Ln 1, Col 1</span><span>UTF-8</span></div>
      <p class="editor-message" role="status" hidden></p>
    </div>
  </div>`;
}

export function bindEditor(form, fields) {
  const tabs = [...form.querySelectorAll('[role="tab"]')];
  const panels = [...form.querySelectorAll('[role="tabpanel"]')];
  const filesButtons = [...form.querySelectorAll('.editor-file')];
  const inputs = panels.map(panel => panel.querySelector('textarea'));
  const picker = form.querySelector('.editor-import');
  const position = form.querySelector('.editor-position');
  const language = form.querySelector('.editor-language');
  const message = form.querySelector('.editor-message');
  const storageKey = 'toolbox:editor:' + sitePath('/');
  const editors = [];
  let monaco;
  let active = 0;
  let disposed = false;

  try {
    const draft = JSON.parse(localStorage.getItem(storageKey) ?? '{}');
    fields.forEach((field, index) => {
      if (typeof draft?.[field.name] === 'string') inputs[index].value = draft[field.name];
    });
  } catch {}

  function saveDraft() {
    try {
      const draft = Object.fromEntries(fields.map((field, index) => [field.name, inputs[index].value]));
      localStorage.setItem(storageKey, JSON.stringify(draft));
    } catch {
      announce('Local storage is unavailable. Save your files to keep your work.');
    }
  }

  function announce(text) {
    message.textContent = text;
    message.hidden = !text;
  }

  function cursor(index) {
    if (index !== active) return;
    const current = editors[index]?.editor.getPosition();
    if (current) {
      position.textContent = `Ln ${current.lineNumber}, Col ${current.column}`;
    } else {
      const input = inputs[index];
      const lines = input.value.slice(0, input.selectionStart).split('\n');
      position.textContent = `Ln ${lines.length}, Col ${lines.at(-1).length + 1}`;
    }
  }

  function mount(index) {
    if (!monaco || editors[index]) return;
    const field = fields[index];
    const host = panels[index].querySelector('.editor-monaco');
    const uri = monaco.Uri.parse('file:///toolbox/' + files[field.name].name);
    const model = monaco.editor.createModel(inputs[index].value, field.name, uri);
    host.hidden = false;
    const editor = monaco.editor.create(host, {
      model,
      theme: 'vs-dark',
      ariaLabel: field.label + ' editor',
      automaticLayout: true,
      fontFamily: '"Cascadia Code", Consolas, monospace',
      fontSize: 14,
      minimap: { enabled: !matchMedia('(max-width: 640px)').matches },
      scrollBeyondLastLine: false,
      tabSize: 2,
      wordWrap: 'off'
    });
    editors[index] = { editor, model };
    panels[index].querySelector('.editor-fallback').hidden = true;
    model.onDidChangeContent(() => {
      inputs[index].value = model.getValue();
      saveDraft();
    });
    editor.onDidChangeCursorPosition(() => cursor(index));
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => form.requestSubmit());
  }

  function activate(index, focus = false) {
    active = index;
    tabs.forEach((tab, i) => {
      const selected = i === index;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      panels[i].hidden = !selected;
      filesButtons[i].setAttribute('aria-pressed', String(selected));
    });
    mount(index);
    const editor = editors[index]?.editor;
    editor?.layout();
    if (focus) (editor ?? inputs[index]).focus();
    language.textContent = fields[index].label;
    cursor(index);
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activate(index));
    filesButtons[index].addEventListener('click', () => activate(index, true));
    tab.addEventListener('keydown', event => {
      const keys = { ArrowLeft: (index + tabs.length - 1) % tabs.length, ArrowRight: (index + 1) % tabs.length, Home: 0, End: tabs.length - 1 };
      if (!Object.hasOwn(keys, event.key)) return;
      event.preventDefault();
      activate(keys[event.key]);
      tabs[keys[event.key]].focus();
    });
    inputs[index].addEventListener('input', () => { saveDraft(); cursor(index); });
    inputs[index].addEventListener('select', () => cursor(index));
  });

  function replaceFile(index, value) {
    inputs[index].value = value;
    const current = editors[index];
    if (current) {
      current.editor.pushUndoStop();
      current.editor.executeEdits('toolbox', [{ range: current.model.getFullModelRange(), text: value }]);
      current.editor.pushUndoStop();
    }
    saveDraft();
  }

  const formats = { html: 0, htm: 0, css: 1, js: 2, mjs: 2 };
  picker.addEventListener('change', async () => {
    const file = picker.files[0];
    picker.value = '';
    if (!file) return;
    const extension = file.name.split('.').at(-1).toLowerCase();
    if (!Object.hasOwn(formats, extension)) return announce('Choose an HTML, CSS or JavaScript file.');
    if (file.size > 2_000_000) return announce('Choose a source file smaller than 2 MB.');
    const index = formats[extension];
    try {
      const text = await file.text();
      if (disposed) return;
      if (inputs[index].value && !window.confirm('Replace the contents of ' + files[fields[index].name].name + '?')) return;
      activate(index, true);
      replaceFile(index, text);
      announce('Opened ' + file.name + '.');
    } catch {
      announce('This file could not be read.');
    }
  });

  const actions = {
    'open': () => picker.click(),
    'save': () => {
      const url = URL.createObjectURL(new Blob([inputs[active].value], { type: 'text/plain;charset=utf-8' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = files[fields[active].name].name;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      announce('Saved ' + link.download + '.');
    },
    'find': () => editors[active]?.editor.getAction('actions.find')?.run(),
    'replace': () => editors[active]?.editor.getAction('editor.action.startFindReplaceAction')?.run(),
    'format': async () => {
      const editor = editors[active]?.editor;
      try {
        await editor?.getAction('editor.action.formatDocument')?.run();
        editor?.focus();
      } catch {
        announce('The file could not be formatted. Check for syntax errors.');
      }
    }
  };
  for (const button of form.querySelectorAll('[data-editor-command]')) {
    button.addEventListener('click', () => actions[button.dataset.editorCommand]());
  }

  form.addEventListener('reset', () => queueMicrotask(() => {
    inputs.forEach((input, index) => replaceFile(index, input.value));
    announce('');
    activate(active);
  }));
  form.addEventListener('keydown', event => {
    if (!event.defaultPrevented && event.key === 'Enter' && (event.ctrlKey || event.metaKey) && !event.target.closest('.editor-monaco')) {
      event.preventDefault();
      form.requestSubmit();
    }
  });

  activate(0);
  loadEditor().then(api => {
    if (disposed || !form.isConnected) return;
    monaco = api;
    activate(active);
    form.querySelectorAll('[data-editor-command]:disabled').forEach(button => { button.disabled = false; });
  }).catch(() => {
    if (!disposed) announce('The full editor could not load. You can still edit, preview and save your files.');
  });

  return () => {
    disposed = true;
    for (const { editor, model } of editors.filter(Boolean)) {
      editor.dispose();
      model.dispose();
    }
  };
}
