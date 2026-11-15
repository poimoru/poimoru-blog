const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const youtube = 'https://www.youtube.com/channel/UCXGq8bNq4kqBSEIodf85qVw';
const brandLink = (url, logo, label) =>
  `<a href="${url}" class="brand-link" target="_blank" rel="noopener"><img src="/assets/${logo}.png" alt="">${label}</a>`;
const socials = brandLink(youtube, 'youtube-logo', 'YouTube');
const header = (home, catalog) => `<header class="site-header">
  <div class="header-inner">
    <a href="/" class="site-title"><img src="/icon.png" width="256" height="248" alt="">歩いてモルディブへ行く男</a>
    <nav id="navMenu" aria-label="メインナビゲーション">
      <a class="nav-top" href="/"${home ? ' aria-current="page"' : ''}>トップ</a>
      <a href="/categories/"${catalog ? ' aria-current="page"' : ''}>アプリ一覧</a>
      <a href="/#profile">運営者情報</a>
      ${socials}
    </nav>
    ${home ? '<button class="site-search search-open" type="button" aria-label="記事を検索"><svg aria-hidden="true"><use href="#i-search"/></svg></button>' : catalog ? '<a class="site-search" href="#query" aria-label="記事を検索"><span aria-hidden="true">⌕</span></a>' : '<a class="site-search" href="/categories/#query" aria-label="記事を探す"><span aria-hidden="true">⌕</span></a>'}
    <button class="hamburger" type="button" aria-label="メニューを開く" aria-controls="navMenu" aria-expanded="false">☰</button>
  </div>
</header>`;
const footer = `<footer class="site-footer">
  <p class="footer-links">
    <a href="/">トップ</a>
    <a href="/categories/">アプリ一覧</a>
    <a href="/#profile">運営者情報</a>
    <a href="/privacy.html">プライバシーポリシー</a>
    <a href="/disclaimer.html">免責事項</a>
    <a href="mailto:contact.poimoru@gmail.com">お問い合わせ</a>
  </p>
  <p>収益は個人の実績であり、成果を保証するものではありません。当サイトはアフィリエイト広告を利用しています。</p>
</footer>`;
const profile = `<div class="author-social">
        ${socials}
      </div>`;

module.exports = { header, footer };
if (require.main !== module) return;

const files = ['index.html', 'privacy.html', 'disclaimer.html', ...['articles', 'categories'].flatMap(dir =>
  fs.readdirSync(path.join(root, dir)).filter(file => file.endsWith('.html')).map(file => `${dir}/${file}`))];
for (const file of files) {
  const full = path.join(root, file);
  const original = fs.readFileSync(full, 'utf8');
  if (!/<header\b[^>]*>[\s\S]*?<\/header>/.test(original) || !/<footer\b[^>]*>[\s\S]*?<\/footer>/.test(original)) {
    throw new Error(`Missing site header or footer: ${file}`);
  }
  const next = original.replace(/<header\b[^>]*>[\s\S]*?<\/header>/, header(file === 'index.html', file === 'categories/index.html'))
    .replace(/<footer\b[^>]*>[\s\S]*?<\/footer>/, footer)
    .replace(/<div class="author-social">[\s\S]*?<\/div>/, profile);
  if (next === original) continue;
  if (process.argv.includes('--check')) {
    console.error(`Site chrome out of sync: ${file}`);
    process.exitCode = 1;
  } else {
    fs.writeFileSync(full, next);
  }
}
