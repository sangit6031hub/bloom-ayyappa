const fs = require('fs');
const path = require('path');
const { parse } = require('yaml');

const rootDir = path.resolve(__dirname, '..');
const docsDir = path.join(rootDir, 'docs');
const contentDir = path.join(rootDir, 'content');
const configPath = path.join(rootDir, 'config.yaml');

if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true });
}

const config = parse(fs.readFileSync(configPath, 'utf8'));
const site = config.site || {};
const vratham = config.vratham || {};
const stages = config.stages || [];

function parseFrontMatter(fileText) {
  const match = fileText.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) return { meta: {}, body: fileText };

  const meta = {};
  for (const line of match[1].split(/\n/)) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    meta[key] = value.replace(/^['"]|['"]$/g, '');
  }

  return { meta, body: fileText.slice(match[0].length) };
}

function escapeHtml(text = '') {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderMarkdownBody(markdownText = '') {
  const lines = markdownText.split(/\r?\n/);
  let html = '';
  let paragraph = [];
  let listItems = [];

  const flushParagraph = () => {
    if (!paragraph.length) return;
    html += `<p>${escapeHtml(paragraph.join(' '))}</p>`;
    paragraph = [];
  };

  const flushList = () => {
    if (!listItems.length) return;
    html += `<ul>${listItems.join('')}</ul>`;
    listItems = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }

    if (line.startsWith('# ')) {
      flushParagraph();
      flushList();
      html += `<h2>${escapeHtml(line.replace(/^#\s*/, ''))}</h2>`;
      continue;
    }

    if (line.startsWith('## ')) {
      flushParagraph();
      flushList();
      html += `<h3>${escapeHtml(line.replace(/^##\s*/, ''))}</h3>`;
      continue;
    }

    if (line.startsWith('- ')) {
      flushParagraph();
      listItems.push(`<li>${escapeHtml(line.replace(/^-\s*/, ''))}</li>`);
      continue;
    }

    paragraph.push(line);
  }

  flushParagraph();
  flushList();
  return html;
}

function getStageDocument(stageConfig) {
  const mdPath = path.join(contentDir, stageConfig.file);
  const fileText = fs.readFileSync(mdPath, 'utf8');
  const { meta, body } = parseFrontMatter(fileText);

  return {
    title: meta.title || stageConfig.title || 'Journey',
    kicker: meta.kicker || 'Journey',
    summary: meta.summary || '',
    body: body.trim()
  };
}

function renderPageShell({
  title,
  heading,
  kicker,
  bodyHtml,
  sectionTitle,
  sideItems,
  cssPath,
  logoPath,
  pageType = 'stage'
}) {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="${escapeHtml(sectionTitle || title || 'Ayyappa Vratham Guide')}" />
    <title>${escapeHtml(title)}</title>
    <link rel="stylesheet" href="${cssPath}" />
  </head>
  <body>
    <header class="site-header">
      <div class="topbar"><span class="eyebrow">${escapeHtml(site.eyebrow || 'Ayyappa Devotee Journey')}</span></div>
      <div class="hero-inner">
        <img class="logo" src="${logoPath}" alt="Ayyappa logo" />
        <div class="hero-copy">
          <p class="eyebrow">${escapeHtml(site.hero?.eyebrow || 'Sabarimala Mandala Vratham')}</p>
          <h1>${escapeHtml(heading || title)}</h1>
          <p class="hero-summary">${escapeHtml(site.hero?.summary || 'A journey-based guide to the Mandala Vratham.')}</p>
        </div>
      </div>
    </header>

    <main class="docs-shell">
      <aside class="side-panel">
        <div class="side-block">
          <p class="side-label">${escapeHtml(site.nav_label || 'Journey Map')}</p>
          <ul>${sideItems}</ul>
        </div>
      </aside>

      <article class="content-panel">
        <section class="stage intro-stage">
          <div class="stage-header">
            <span class="stage-index">${String(pageType === 'overview' ? 0 : 1).padStart(2, '0')}</span>
            <div>
              <p class="kicker">${escapeHtml(kicker || 'Overview')}</p>
              <h2>${escapeHtml(sectionTitle || title)}</h2>
            </div>
          </div>
          <div class="stage-body">${bodyHtml}</div>
        </section>
      </article>
    </main>
  </body>
</html>`;
}

function renderHomePage() {
  const sideItems = stages.map((stage) => `<li><a href="docs/${stage.slug}.html">${escapeHtml(stage.title)}</a></li>`).join('');

  const sections = stages
    .map((stage, index) => {
      const doc = getStageDocument(stage);
      return `
        <section class="stage intro-stage">
          <div class="stage-header">
            <span class="stage-index">${String(index + 1).padStart(2, '0')}</span>
            <div>
              <p class="kicker">${escapeHtml(doc.kicker || 'Journey')}</p>
              <h2>${escapeHtml(doc.title)}</h2>
            </div>
          </div>
          <div class="stage-body">${renderMarkdownBody(doc.body)}</div>
        </section>
      `;
    })
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="${escapeHtml(site.description || site.title || 'Ayyappa Vratham Guide')}" />
    <title>${escapeHtml(site.title || 'Ayyappa Vratham Guide')}</title>
    <link rel="stylesheet" href="./styles.css" />
  </head>
  <body>
    <header class="site-header">
      <div class="topbar"><span class="eyebrow">${escapeHtml(site.eyebrow || 'Ayyappa Devotee Journey')}</span></div>
      <div class="hero-inner">
        <img class="logo" src="./ayyappa.png" alt="Ayyappa logo" />
        <div class="hero-copy">
          <p class="eyebrow">${escapeHtml(site.hero?.eyebrow || 'Sabarimala Mandala Vratham')}</p>
          <h1>${escapeHtml(site.hero?.title || 'From vow to darshan')}</h1>
          <p class="hero-summary">${escapeHtml(site.hero?.summary || 'A journey-based guide to the Mandala Vratham.')}</p>
        </div>
      </div>
    </header>

    <main class="docs-shell">
      <aside class="side-panel">
        <div class="side-block">
          <p class="side-label">${escapeHtml(site.nav_label || 'Journey Map')}</p>
          <ul>${sideItems}</ul>
        </div>
      </aside>

      <article class="content-panel">${sections}</article>
    </main>
  </body>
</html>`;
}

function renderStagePage(stageConfig, index) {
  const doc = getStageDocument(stageConfig);
  const sideItems = stages.map((stage) => `<li><a href="${stage.slug === stageConfig.slug ? '#' : `${stage.slug}.html`}">${escapeHtml(stage.title)}</a></li>`).join('');

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="${escapeHtml(doc.summary || doc.title)}" />
    <title>${escapeHtml(doc.title)}</title>
    <link rel="stylesheet" href="../styles.css" />
  </head>
  <body>
    <header class="site-header">
      <div class="topbar"><span class="eyebrow">${escapeHtml(site.eyebrow || 'Ayyappa Devotee Journey')}</span></div>
      <div class="hero-inner">
        <img class="logo" src="../ayyappa.png" alt="Ayyappa logo" />
        <div class="hero-copy">
          <p class="eyebrow">${escapeHtml(site.hero?.eyebrow || 'Sabarimala Mandala Vratham')}</p>
          <h1>${escapeHtml(doc.title)}</h1>
          <p class="hero-summary">${escapeHtml(site.hero?.summary || 'A journey-based guide to the Mandala Vratham.')}</p>
        </div>
      </div>
    </header>

    <main class="docs-shell">
      <aside class="side-panel">
        <div class="side-block">
          <p class="side-label">${escapeHtml(site.nav_label || 'Journey Map')}</p>
          <ul>${sideItems}</ul>
        </div>
      </aside>

      <article class="content-panel">
        <section class="stage intro-stage">
          <div class="stage-header">
            <span class="stage-index">${String(index + 1).padStart(2, '0')}</span>
            <div>
              <p class="kicker">${escapeHtml(doc.kicker || 'Journey')}</p>
              <h2>${escapeHtml(doc.title)}</h2>
            </div>
          </div>
          <div class="stage-body">${renderMarkdownBody(doc.body)}</div>
        </section>
      </article>
    </main>
  </body>
</html>`;
}

fs.writeFileSync(path.join(rootDir, 'index.html'), renderHomePage(), 'utf8');

stages.forEach((stage, index) => {
  fs.writeFileSync(path.join(docsDir, `${stage.slug}.html`), renderStagePage(stage, index), 'utf8');
});

console.log(`Built ${stages.length} YAML-driven MD stages and the landing page.`);
