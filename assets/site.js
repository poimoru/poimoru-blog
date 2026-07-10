/* ============================================================
   ポイモルブログ 共有スクリプト v2（2026-07-09）
   全ページ共通。<script src="/assets/site.js" defer></script> で読み込む
   ============================================================ */

/* ---- ハンバーガーメニュー ---- */
function toggleNav() {
  var nav = document.getElementById('navMenu');
  if (nav) nav.classList.toggle('open');
}

/* ---- 招待コードのコピー ---- */
function copyInvite() {
  var el = document.getElementById('inviteCode');
  if (!el) return;
  var code = el.textContent.trim();
  navigator.clipboard.writeText(code).then(function () {
    var b = document.querySelector('.copy-btn');
    if (!b) return;
    var orig = b.textContent;
    b.textContent = '✅ コピーしました!';
    setTimeout(function () { b.textContent = orig; }, 1500);
  });
}

/* ---- モルディブメーター（Sheetsから進捗を取得） ---- */
async function updateMaldivesMeter() {
  var fill = document.getElementById('meter-fill') || document.querySelector('.meter-fill');
  if (!fill) return;
  var sheetId = '1sVYNqqg2ysLfiyTG_RbbTpBPpytwR2sOgMTCLEVgfOQ';
  var url = 'https://docs.google.com/spreadsheets/d/' + sheetId +
            '/gviz/tq?tqx=out:json&sheet=ダッシュボード&range=B2';
  try {
    var res = await fetch(url);
    var text = await res.text();
    var jsonStr = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\)/)[1];
    var json = JSON.parse(jsonStr);
    var current = json.table.rows[0].c[0].v;
    var target = 1000000;
    var pct = (current / target * 100).toFixed(1);

    fill.style.width = pct + '%';
    var pctEl = document.getElementById('meter-pct') ||
                document.querySelector('.meter-label span:last-child');
    if (pctEl) pctEl.textContent = pct + '%';
    var noteEl = document.getElementById('meter-note') || document.querySelector('.meter-note');
    if (noteEl) noteEl.textContent =
      '累計 ' + Math.round(current).toLocaleString() + 'pt ／ 目標 ' + target.toLocaleString() + 'pt';
  } catch (e) { /* 取得失敗時はHTMLの初期値のまま */ }
}

/* ---- テーブルを横スクロール用ラッパーで包む ---- */
function wrapTables() {
  document.querySelectorAll('.article-content table').forEach(function (tbl) {
    if (tbl.parentElement.classList.contains('table-wrap')) return;
    var wrap = document.createElement('div');
    wrap.className = 'table-wrap';
    tbl.parentNode.insertBefore(wrap, tbl);
    wrap.appendChild(tbl);
  });
}

/* ---- フローティング目次（モバイル） ---- */
function buildFloatingToc() {
  var content = document.querySelector('.article-content');
  if (!content) return;
  var heads = content.querySelectorAll('h2[id]');
  if (heads.length < 2) return;

  var fab = document.createElement('button');
  fab.className = 'toc-fab';
  fab.textContent = '📑 目次';
  fab.setAttribute('aria-label', '目次を開く');

  var overlay = document.createElement('div');
  overlay.className = 'toc-overlay';
  var sheet = document.createElement('div');
  sheet.className = 'toc-sheet';
  var title = document.createElement('p');
  title.className = 'toc-title';
  title.innerHTML = '📑 目次<button class="toc-close" aria-label="閉じる">✕</button>';
  var ol = document.createElement('ol');
  heads.forEach(function (h) {
    var li = document.createElement('li');
    var a = document.createElement('a');
    a.href = '#' + h.id;
    a.textContent = h.textContent;
    a.addEventListener('click', function () { overlay.classList.remove('open'); });
    li.appendChild(a);
    ol.appendChild(li);
  });
  sheet.appendChild(title);
  sheet.appendChild(ol);
  overlay.appendChild(sheet);

  fab.addEventListener('click', function () { overlay.classList.add('open'); });
  overlay.addEventListener('click', function (e) { if (e.target === overlay) overlay.classList.remove('open'); });
  title.querySelector('.toc-close').addEventListener('click', function () { overlay.classList.remove('open'); });

  document.body.appendChild(fab);
  document.body.appendChild(overlay);
}

/* ---- ページトップへ戻る ---- */
function buildBackToTop() {
  var btn = document.createElement('button');
  btn.className = 'back-to-top';
  btn.textContent = '↑';
  btn.setAttribute('aria-label', 'ページの先頭へ戻る');
  btn.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  document.body.appendChild(btn);
  window.addEventListener('scroll', function () {
    btn.style.display = window.scrollY > 600 ? 'block' : 'none';
  }, { passive: true });
}

document.addEventListener('DOMContentLoaded', function () {
  var burger = document.querySelector('.hamburger');
  if (burger) burger.addEventListener('click', toggleNav);
  wrapTables();
  buildFloatingToc();
  buildBackToTop();
  updateMaldivesMeter();
});
