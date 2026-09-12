// Builds the static pages of guraleapilates.com from the content files in src/content into dist/.
// Phase 1: content comes from JSON files. Phase 2: the same renderers will read from Firestore (admin panel).
import { readFileSync, writeFileSync, mkdirSync, cpSync, rmSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'src');
const dist = join(root, 'dist');
const site = JSON.parse(readFileSync(join(src, 'content', 'site.json'), 'utf8'));
const articlesDir = join(src, 'content', 'articles');
const articles = readdirSync(articlesDir)
  .filter((f) => f.endsWith('.json'))
  .map((f) => JSON.parse(readFileSync(join(articlesDir, f), 'utf8')))
  .filter((a) => a.published)
  .sort((a, b) => b.date.localeCompare(a.date));

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const year = new Date().getFullYear();
const pages = [];

const waIcon = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7a11.4 11.4 0 0 1-4.4-3.9c-.3-.5-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .6l-.4.6-.3.4c-.1.1-.2.3-.1.5.2.3.7 1.2 1.5 1.9 1 .9 1.9 1.2 2.2 1.3.2.1.4.1.5-.1l.8-.9c.2-.2.4-.2.6-.1l1.9.9c.2.1.4.2.4.3.1.1.1.6-.1 1.2z"/></svg>';

function formHtml(heading = site.form.heading) {
  const f = site.form;
  return `<form class="lead-form" data-lead-form novalidate>
  ${heading ? `<h2 class="form-title">${esc(heading)}</h2>` : ''}
  <label>${esc(f.name)}<input type="text" name="name" autocomplete="name" required></label>
  <label>${esc(f.phone)}<input type="tel" name="phone" autocomplete="tel" inputmode="tel" required></label>
  <label>${esc(f.callback)}<select name="callbackTime" required><option value="" disabled selected>${esc(f.callbackPlaceholder)}</option>${f.callbackOptions.map((o) => `<option value="${esc(o)}">${esc(o)}</option>`).join('')}</select></label>
  <button type="submit" class="btn">${esc(f.submit)}</button>
  <p class="form-status" aria-live="polite"></p>
</form>`;
}

function blocksHtml(blocks) {
  return blocks.map((b) => {
    if (b.lines) return `<p>${b.lines.map(esc).join('<br>')}</p>`;
    if (b.h2) return `<h2>${esc(b.h2)}</h2>`;
    if (b.h3) return `<h3>${esc(b.h3)}</h3>`;
    if (b.ul) return `<ul>${b.ul.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>`;
    if (b.p) return `<p>${esc(b.p)}</p>`;
    return '';
  }).join('\n');
}

function articleCard(a, r) {
  return `<article class="card">
  <a href="${r}articles/${a.slug}/"><img src="${r}assets/images/${a.image}" alt="${esc(a.imageAlt)}" loading="lazy" width="600" height="600"></a>
  <div class="card-body"><span class="tag">${esc(a.category)}</span><h3><a href="${r}articles/${a.slug}/">${esc(a.title)}</a></h3></div>
</article>`;
}

function add(path, { title, description, body, jsonld = [], form = false, wide = false }) {
  pages.push({ path, title, description, body, jsonld, form, wide });
}

function render({ path, title, description, body, jsonld, form, wide }) {
  const depth = path === '' ? 0 : path.split('/').length;
  const r = depth ? '../'.repeat(depth) : './';
  const section = path.split('/')[0];
  const fullTitle = path === '' ? site.h1 : `${title} | ${site.name}`;
  const nav = site.nav.map((n) => `<li><a href="${r}${n.path ? n.path + '/' : ''}"${n.path === section ? ' aria-current="page"' : ''}>${esc(n.label)}</a></li>`).join('');
  const ld = jsonld.map((o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join('\n');
  return `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(fullTitle)}</title>
${description ? `<meta name="description" content="${esc(description)}">` : ''}
<link rel="canonical" href="${site.baseUrl}/${path ? path + '/' : ''}">
<meta property="og:title" content="${esc(fullTitle)}">
<meta property="og:image" content="${site.baseUrl}/assets/images/hero.jpg">
<meta property="og:locale" content="he_IL">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Assistant:wght@400;600;700&family=Rubik:wght@500;600;700&display=swap">
<link rel="stylesheet" href="${r}assets/css/site.css">
${ld}
</head>
<body>
<a class="skip" href="#main">דלג לתוכן הראשי</a>
<header class="top">
  <div class="wrap top-inner">
    <a class="logo" href="${r}">לאה גורא<span>פילאטיס מכשירים</span></a>
    <button class="menu-btn" aria-expanded="false" aria-controls="nav" aria-label="תפריט"><span></span><span></span><span></span></button>
    <nav id="nav" class="nav" aria-label="ניווט ראשי"><ul>${nav}</ul></nav>
  </div>
</header>
<main id="main" class="${wide ? '' : 'wrap narrow'}">
${body(r)}
</main>
<footer class="foot">
  <div class="wrap foot-inner">
    <p>© ${year} לאה גורא | כל הזכויות שמורות</p>
    <p><a href="${r}accessibility/">הצהרת נגישות</a> · <a href="${site.facebookUrl}" target="_blank" rel="noopener">עקבו אחרינו בפייסבוק - הסטודיו</a> · <a href="${site.instagramUrl}" target="_blank" rel="noopener">עקבו אחרינו באינסטגרם - הסטודיו</a></p>
  </div>
</footer>
<a class="wa" href="${site.whatsappUrl}" target="_blank" rel="noopener" aria-label="וואטסאפ ${site.phoneDisplay}">${waIcon}<span>${site.phoneDisplay}</span></a>
<script src="${r}assets/js/site.js" defer></script>
${form ? `<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js" defer></script>
<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js" defer></script>
<script src="${r}assets/js/lead-form.js" defer></script>` : ''}
</body>
</html>
`;
}

const business = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: site.name,
  url: site.baseUrl + '/',
  email: site.email,
  telephone: '+972505338620',
  image: site.baseUrl + '/assets/images/hero.jpg',
  address: { '@type': 'PostalAddress', addressLocality: 'רמלה', addressCountry: 'IL' },
  sameAs: [site.facebookUrl, site.instagramUrl]
};

// בית
add('', {
  description: site.description,
  jsonld: [business],
  form: true,
  wide: true,
  body: (r) => `
<section class="hero">
  <img src="${r}assets/images/hero.jpg" alt="לאה גורא בתרגיל על מיטת רפורמר בסטודיו" width="1920" height="890" fetchpriority="high">
</section>
<div class="wrap home">
  <h1>${esc(site.h1)}</h1>
  <div class="home-grid">
    <section class="panel">${formHtml()}</section>
    <section class="suits">
      <h2>למי זה מתאים?</h2>
      <ul class="pills">${site.suitable.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>
      <p>${esc(site.suitableNote)}</p>
    </section>
  </div>
  <section class="band">
    <h2><a href="${r}articles/">מאמרים וטיפים</a></h2>
    <div class="cards">${articles.slice(0, 3).map((a) => articleCard(a, r)).join('')}</div>
  </section>
  <section class="band">
    <h2><a href="${r}testimonials/">המלצות</a></h2>
    <div class="shots">${site.testimonials.slice(0, 3).map((t) => `<img src="${r}assets/images/testimonials/${t.file}" alt="${esc(t.alt)}" loading="lazy">`).join('')}</div>
  </section>
</div>`
});

// מאמרים וטיפים
const categories = ['גב תחתון', 'צוואר', 'כתפיים', 'ברכיים', 'שיווי משקל', 'רצפת אגן'];
add('articles', {
  title: 'מאמרים וטיפים',
  body: (r) => `
<h1>מאמרים וטיפים</h1>
<ul class="chips">${categories.map((c) => `<li>${esc(c)}</li>`).join('')}</ul>
<div class="cards">${articles.map((a) => articleCard(a, r)).join('')}</div>`
});

for (const a of articles) {
  add(`articles/${a.slug}`, {
    title: a.title,
    description: a.blocks.find((b) => b.lines)?.lines.join(' '),
    form: true,
    jsonld: [{ '@context': 'https://schema.org', '@type': 'Article', headline: a.title, datePublished: a.date, image: `${site.baseUrl}/assets/images/${a.image}`, author: { '@type': 'Person', name: 'לאה גורא' }, publisher: { '@type': 'Organization', name: site.name } }],
    body: (r) => `
<article class="article">
  <span class="tag">${esc(a.category)}</span>
  <h1>${esc(a.title)}</h1>
  <img class="article-img" src="${r}assets/images/${a.image}" alt="${esc(a.imageAlt)}">
  ${blocksHtml(a.blocks)}
  <p class="cta">${esc(a.cta)}</p>
  <section class="panel">${formHtml('')}</section>
</article>`
  });
}

// קצת עליי
add('about', {
  title: 'קצת עליי',
  body: (r) => `
<h1>קצת עליי</h1>
<img class="portrait" src="${r}assets/images/leah.jpg" alt="לאה גורא" width="1377" height="918">
${site.about.paragraphs.map((p) => `<p>${esc(p)}</p>`).join('\n')}`
});

// הסטודיו
add('studio', {
  title: 'הסטודיו',
  wide: true,
  body: (r) => `
<div class="wrap">
  <h1>הסטודיו</h1>
  <p>${esc(site.studio.intro)}</p>
  <div class="gallery">${site.studio.images.map((i) => `<img src="${r}assets/images/studio/${i.file}" alt="${esc(i.alt)}" loading="lazy">`).join('')}</div>
</div>`
});

// לוח שיעורים
add('schedule', {
  title: 'לוח שיעורים',
  body: () => `
<h1>לוח שיעורים</h1>
<div class="table-wrap">
  <table>
    <thead><tr>${site.schedule.days.map((d) => `<th scope="col">${esc(d)}</th>`).join('')}</tr></thead>
    <tbody>${site.schedule.rows.length ? site.schedule.rows.map((row) => `<tr>${row.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`).join('') : `<tr>${site.schedule.days.map(() => '<td></td>').join('')}</tr>`}</tbody>
  </table>
</div>
${site.schedule.rows.length ? '' : `<p class="muted">${esc(site.schedule.emptyNote)}</p>`}`
});

// המלצות
add('testimonials', {
  title: 'המלצות',
  body: (r) => `
<h1>המלצות</h1>
<div class="shots">${site.testimonials.map((t) => `<img src="${r}assets/images/testimonials/${t.file}" alt="${esc(t.alt)}" loading="lazy">`).join('')}</div>`
});

// שאלות ותשובות
add('faq', {
  title: 'שאלות ותשובות',
  jsonld: [{ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: site.faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) }],
  body: () => `
<h1>שאלות ותשובות</h1>
<dl class="faq">${site.faq.map((f) => `<div><dt>${esc(f.q)}</dt><dd>${esc(f.a)}</dd></div>`).join('')}</dl>`
});

// יצירת קשר
add('contact', {
  title: 'יצירת קשר',
  form: true,
  body: () => `
<h1>יצירת קשר</h1>
<ul class="contact">
  <li>${esc(site.area)}</li>
  <li><a href="${site.whatsappUrl}" target="_blank" rel="noopener"><strong>${site.phoneDisplay}</strong></a> · ${esc(site.whatsappNote)}</li>
  <li><a href="mailto:${site.email}">${site.email}</a></li>
</ul>
<section class="panel">${formHtml()}</section>`
});

// הצהרת נגישות
add('accessibility', {
  title: 'הצהרת נגישות',
  body: () => `
<h1>הצהרת נגישות</h1>
${site.accessibility.map((b) => (b.h2 ? `<h2>${esc(b.h2)}</h2>` : `<p>${esc(b.p)}</p>`)).join('\n')}`
});

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });
cpSync(join(src, 'assets'), join(dist, 'assets'), { recursive: true });
for (const p of pages) {
  const dir = join(dist, p.path);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), render(p), 'utf8');
}
writeFileSync(join(dist, '.nojekyll'), '');
writeFileSync(join(dist, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${site.baseUrl}/sitemap.xml\n`);
writeFileSync(join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map((p) => `  <url><loc>${site.baseUrl}/${p.path ? p.path + '/' : ''}</loc></url>`).join('\n')}\n</urlset>\n`);
console.log(`built ${pages.length} pages -> dist/`);
