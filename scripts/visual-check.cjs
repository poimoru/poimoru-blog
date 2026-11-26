const assert = require('node:assert/strict');
const { readFile, mkdir, writeFile } = require('node:fs/promises');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require('playwright');

const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css',
  '.js': 'text/javascript', '.png': 'image/png', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg' };
const pages = ['/', '/articles/kartie-introduction', '/articles/torima-lottery'];
const viewports = { desktop: { width: 1280, height: 900 }, mobile: { width: 390, height: 844 } };
const output = path.resolve(process.env.VISUAL_OUTPUT || '/tmp/poimoru-visual');
const componentSample = `
  <h2>記事の見出し</h2><p>本文の文字サイズと余白を確認します。</p>
  <table class="kartie-verdict article-verdict">
    <thead><tr><th>項目</th><th>内容</th></tr></thead>
    <tbody><tr><th>向いている人</th><td>毎日少しずつポイントを貯めたい人。</td></tr></tbody>
  </table>
  <aside class="voice"><div><img src="/icon.png" width="38" height="38" alt="">ポイモル</div>
    <p>本文を補足する吹き出しです。</p></aside>
  <div class="invite-box kartie-quick-invite article-quick-invite">
    <div><strong>招待コード</strong> <code>SAMPLE</code></div>
    <button type="button" class="copy-btn">招待コードをコピー</button>
  </div>
  <details class="kartie-rating-details article-rating-details" open>
    <summary>評価内訳</summary><p>比較用の固定サンプルです。</p>
  </details>`;

async function serve(dir) {
  const root = path.resolve(dir);
  const server = http.createServer(async (req, res) => {
    try {
      let pathname = new URL(req.url, 'http://localhost').pathname;
      if (pathname.endsWith('/')) pathname += 'index.html';
      else if (!path.extname(pathname)) pathname += '.html';
      const file = path.resolve(root, '.' + pathname);
      if (!file.startsWith(root + path.sep) || !mime[path.extname(file)]) throw new Error('Unsupported path');
      const body = await readFile(file);
      res.writeHead(200, { 'Content-Type': mime[path.extname(file)] }).end(body);
    } catch {
      res.writeHead(404).end();
    }
  });
  await new Promise((resolve, reject) => server.listen(0, '127.0.0.1', resolve).once('error', reject));
  return { url: 'http://127.0.0.1:' + server.address().port, close: () => server.close() };
}

async function capture(browser, origin, url, viewport, check) {
  const page = await browser.newPage({ viewport, reducedMotion: 'reduce', deviceScaleFactor: 1 });
  try {
    await page.route('**/*', route => route.request().url().startsWith(origin + '/') ? route.continue() : route.abort());
    const response = await page.goto(origin + url, { waitUntil: 'load' });
    assert(response.ok(), url + ' did not load');
    await page.evaluate(() => document.fonts.ready);
    if (check) {
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), url + ' overflows viewport');
      if (url.startsWith('/articles/')) {
        const cover = page.locator('.article-cover');
        assert.equal(await cover.count(), 1, url + ' cover count');
        assert(await cover.evaluate(img => img.complete && img.naturalWidth > 0), url + ' cover did not load');
      }
    }
    const images = {};
    for (const [part, selector] of [['header', '.site-header'], ['footer', '.site-footer']]) {
      const region = page.locator(selector);
      assert.equal(await region.count(), 1, url + ' ' + part + ' count');
      images[part] = await region.screenshot({ animations: 'disabled' });
    }
    if (url === '/articles/kartie-introduction') {
      const article = page.locator('.article-content');
      await article.evaluate((node, sample) => { node.innerHTML = sample; }, componentSample);
      images.components = await article.screenshot({ animations: 'disabled' });
    }
    return images;
  } finally {
    await page.close();
  }
}

async function main() {
  const [baseDir, candidateDir = '.'] = process.argv.slice(2);
  assert(baseDir, 'Usage: node scripts/visual-check.cjs BASE_DIRECTORY [CANDIDATE_DIRECTORY]');
  await mkdir(output, { recursive: true });
  const baseline = await serve(baseDir);
  const candidate = await serve(candidateDir);
  let browser;
  let differences = 0;
  try {
    browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
    for (const [size, viewport] of Object.entries(viewports)) {
      for (const url of pages) {
        const name = (url === '/' ? 'home' : url.split('/').pop()) + '-' + size;
        const before = await capture(browser, baseline.url, url, viewport, false);
        const after = await capture(browser, candidate.url, url, viewport, true);
        for (const part of Object.keys(after)) {
          if (before[part].equals(after[part])) continue;
          differences++;
          await writeFile(path.join(output, name + '-' + part + '-before.png'), before[part]);
          await writeFile(path.join(output, name + '-' + part + '-after.png'), after[part]);
          console.error(name + ': ' + part + ' changed');
        }
      }
    }
  } finally {
    await browser?.close();
    baseline.close();
    candidate.close();
  }
  if (differences && process.env.ALLOW_VISUAL_CHANGE !== 'true') process.exitCode = 1;
  console.log('Checked ' + pages.length + ' pages at desktop and mobile widths; ' + differences + ' visual changes.');
}

main().catch(error => { console.error(error); process.exitCode = 1; });
