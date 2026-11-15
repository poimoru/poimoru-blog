const fs = require('node:fs');
const path = require('node:path');
const { categories, available, categoryUrl } = require('../assets/stories.js');
const root = path.resolve(__dirname, '..');
const origin = 'https://poimoru-blog.satorunaoi0731.workers.dev';
const template = fs.readFileSync(path.join(__dirname, 'catalog-template.html'), 'utf8');
const { header, footer } = require('./sync-site-chrome.cjs');
const check = process.argv.includes('--check');

function output(file, value) {
  const target = path.join(root, file);
  if (!check) fs.writeFileSync(target, value);
  else if (!fs.existsSync(target) || fs.readFileSync(target, 'utf8') !== value) {
    console.error('Generated file out of sync: ' + file);
    process.exitCode = 1;
  }
}

if (!check) fs.mkdirSync(path.join(root, 'categories'), { recursive: true });
for (const [id, name] of categories) {
  const all = id === 'all';
  const title = all ? 'アプリ・サービス一覧' : ['points', 'other'].includes(id) ? name : name + 'で貯める';
  const description = all ? '貯め方から探せる、ポイモルのポイ活アプリ・サービスの実測記事一覧です。'
    : title + 'ポイ活の実測記事をまとめました。';
  const url = origin + categoryUrl(id);
  const indexed = available.some(([key]) => key === id);
  const html = template.replace('{{metadata}}', [
    `<title>${title} | ポイモル</title>`,
    `<meta name="description" content="${description}">`,
    `<link rel="canonical" href="${url}">`,
    `<meta property="og:title" content="${title} | ポイモル">`,
    `<meta property="og:description" content="${description}">`,
    `<meta property="og:url" content="${url}">`,
    `<meta property="og:image" content="${origin}/maldives.jpg">`,
    indexed ? '' : '<meta name="robots" content="noindex,follow">'
  ].filter(Boolean).join('\n  '))
    .replace('{{id}}', id).replace('{{title}}', title)
    .replace('{{breadcrumbs}}', (all ? '' : '<a href="/categories/">アプリ一覧</a><span aria-hidden="true">›</span>') +
      `<span aria-current="page">${all ? 'アプリ一覧' : title}</span>`)
    .replace('<header class="site-header"></header>', header(false, all))
    .replace('<footer class="site-footer"></footer>', footer);
  output(`categories/${all ? 'index' : id}.html`, html);
}
