import { area, entry, requireValue } from '../../shared.js';

const language = (name, label) => ({ ...area(name, label), optional: true, code: true });
const dataURL = (mime, text) => 'data:' + mime + ';charset=utf-8,' + encodeURIComponent(text);

export default {
  ...entry('Code Editor', 'Write HTML, CSS and JavaScript, preview them together, and download a standalone page.', [
    language('html', 'HTML'),
    language('css', 'CSS'),
    language('javascript', 'JavaScript')
  ], ({ html, css, javascript }) => {
    requireValue([html, css, javascript].some(value => value.trim()), 'Enter HTML, CSS or JavaScript to preview.');
    const style = css ? `<link rel="stylesheet" href="${dataURL('text/css', css).replaceAll("'", '%27')}">` : '';
    const script = javascript ? `<script src="${dataURL('text/javascript', javascript).replaceAll("'", '%27')}"></script>` : '';
    const content = style + '\n' + html + '\n' + script;
    const document = '<!doctype html>\n<html lang="en"><head><meta charset="utf-8">' +
      '<meta name="viewport" content="width=device-width, initial-scale=1"><title>My Toolbox page</title>' +
      style + '</head><body>\n' + html + '\n' + script + '\n</body></html>\n';
    return {
      text: document,
      html: content,
      runScripts: true,
      blob: new Blob([document], { type: 'text/html' }),
      filename: 'index.html',
      downloadLabel: 'Download HTML'
    };
  }, 'Drafts are saved in this browser. Enter HTML for the page body, then use Run preview or Ctrl+Enter.'),
  editor: true,
  action: 'Run preview'
};
