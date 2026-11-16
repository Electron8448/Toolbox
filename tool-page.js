function control(field, index) {
  const id = 'tool-input-' + index;
  const common = `id="${id}" name="${field.name}"`;
  const required = field.optional ? '' : 'required';
  let input;
  if (field.type === 'textarea') {
    input = `<textarea ${common} rows="7" ${required}></textarea>`;
  } else if (field.type === 'select') {
    input = `<select ${common}>${field.choices.map(([value, label]) =>
      `<option value="${value}">${label}</option>`).join('')}</select>`;
  } else {
    input = `<input ${common} type="${field.type}" ${field.type === 'number' ? 'step="any"' : 'autocomplete="off"'} ${required}>`;
  }
  const condition = field.when ? ` data-when="${field.when.join('|')}"` : '';
  return `<div class="field"${condition}><label for="${id}">${field.label}</label>${input}</div>`;
}

export function standardPage(tool, breadcrumbs) {
  return `${breadcrumbs(tool.category, tool.group, tool.name)}
    <header class="page-heading"><span class="category-icon ${tool.category.theme}" aria-hidden="true">${tool.category.icon}</span>
      <h1>${tool.name}</h1><p>${tool.description}</p></header>
    <form class="panel standard-tool">
      ${tool.note ? `<p class="tool-note">${tool.note}</p>` : ''}
      ${tool.fields.map(control).join('')}
      <p class="error" role="alert"></p>
      <div class="actions"><button class="primary">Run tool</button><button class="secondary" type="reset">Reset</button></div>
    </form>
    <section class="panel standard-result" hidden>
      <h2>Result</h2><pre aria-live="polite"></pre>
      <div class="actions"><button class="secondary" type="button">Copy result</button><span role="status"></span></div>
    </section>`;
}

export function bindStandard(tool) {
  const form = document.querySelector('.standard-tool');
  const result = document.querySelector('.standard-result');
  const output = result.querySelector('pre');
  const error = form.querySelector('.error');
  const message = result.querySelector('[role=status]');
  function updateFields() {
    for (const wrapper of form.querySelectorAll('[data-when]')) {
      const [name, ...choices] = wrapper.dataset.when.split('|');
      wrapper.hidden = !choices.includes(form.elements.namedItem(name).value);
      wrapper.querySelector('input').disabled = wrapper.hidden;
    }
  }
  form.addEventListener('change', updateFields);
  form.addEventListener('input', () => {
    error.textContent = '';
    result.hidden = true;
  });
  form.addEventListener('reset', () => {
    error.textContent = '';
    result.hidden = true;
    queueMicrotask(updateFields);
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    error.textContent = '';
    result.hidden = true;
    const values = Object.fromEntries(tool.fields.filter(field => !form.elements.namedItem(field.name).disabled)
      .map(field => [field.name, field.type === 'number' ? form.elements.namedItem(field.name).valueAsNumber : form.elements.namedItem(field.name).value]));
    try {
      const value = tool.run(values);
      output.textContent = value;
      message.textContent = '';
      result.hidden = false;
    } catch (failure) {
      error.textContent = failure.message;
    }
  });
  result.querySelector('button').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(output.textContent);
      message.textContent = 'Copied.';
    } catch {
      message.textContent = 'Select the result and copy it manually.';
    }
  });
  updateFields();
}
