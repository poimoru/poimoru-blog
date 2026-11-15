/* ポイモルブログ 共通スクリプト v3 */
(function () {
  'use strict';

  function setNav(open) {
    var nav = document.getElementById('navMenu');
    var button = document.querySelector('.hamburger');
    if (!nav || !button) return;

    nav.classList.toggle('open', open);
    button.setAttribute('aria-expanded', String(open));
    button.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
  }

  function setupNavigation() {
    var button = document.querySelector('.hamburger');
    var nav = document.getElementById('navMenu');
    if (!button || !nav) return;

    button.addEventListener('click', function () {
      setNav(button.getAttribute('aria-expanded') !== 'true');
    });
    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) setNav(false);
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') setNav(false);
    });
    document.addEventListener('click', function (event) {
      if (!nav.classList.contains('open')) return;
      if (!nav.contains(event.target) && !button.contains(event.target)) setNav(false);
    });

    var header = nav.closest('.site-header');
    if (!header) return;
    var lastY = Math.max(0, window.scrollY);
    window.addEventListener('scroll', function () {
      var y = Math.max(0, window.scrollY);
      var delta = y - lastY;
      if (y <= 64 || delta < -5 || nav.classList.contains('open')) {
        header.classList.remove('is-hidden');
      } else if (y > 128 && delta > 5) {
        header.classList.add('is-hidden');
      }
      if (Math.abs(delta) > 5 || y <= 64) lastY = y;
    }, { passive: true });
  }

  function setCopyStatus(message) {
    var status = document.getElementById('copy-status');
    if (!status) {
      status = document.createElement('span');
      status.id = 'copy-status';
      status.className = 'visually-hidden';
      status.setAttribute('role', 'status');
      status.setAttribute('aria-live', 'polite');
      document.body.appendChild(status);
    }
    status.textContent = message;
  }

  async function copyInvite(button) {
    var codeElement = document.getElementById('inviteCode');
    if (!codeElement || !button) return;

    var label = button.querySelector('[data-copy-label]') || button;
    var original = label.textContent;
    if (button.dataset.copying) return;
    button.dataset.copying = 'true';
    try {
      await navigator.clipboard.writeText(codeElement.textContent.trim());
      label.textContent = 'コピーしました';
      setCopyStatus('招待コードをコピーしました');
    } catch (error) {
      label.textContent = 'コピーできませんでした';
      setCopyStatus('招待コードをコピーできませんでした');
    }
    window.setTimeout(function () {
      label.textContent = original;
      delete button.dataset.copying;
    }, 1600);
  }

  function setupCopyButtons() {
    document.querySelectorAll('.copy-btn[onclick]').forEach(button => button.removeAttribute('onclick'));
    document.addEventListener('click', function (event) {
      var button = event.target.closest('.copy-btn');
      if (button) copyInvite(button);
    });
  }

  async function updateMaldivesMeter() {
    var fill = document.getElementById('meter-fill') || document.querySelector('.meter-fill');
    var progress = document.getElementById('catalog-meter');
    if (!fill && !progress) return;

    var sheetId = '1sVYNqqg2ysLfiyTG_RbbTpBPpytwR2sOgMTCLEVgfOQ';
    var url = 'https://docs.google.com/spreadsheets/d/' + sheetId +
      '/gviz/tq?tqx=out:json&sheet=ダッシュボード&range=B2';
    var controller = new AbortController();
    var timeout = window.setTimeout(function () { controller.abort(); }, 4000);

    try {
      var response = await fetch(url, { signal: controller.signal });
      if (!response.ok) throw new Error('meter request failed');
      var text = await response.text();
      var match = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\)/);
      if (!match) throw new Error('meter response invalid');
      var json = JSON.parse(match[1]);
      var current = json.table.rows[0].c[0].v;
      if (!Number.isFinite(current)) throw new Error('meter value invalid');

      var target = 1000000;
      var pct = Math.min(100, Math.max(0, current / target * 100)).toFixed(1);
      if (progress) progress.value = pct;
      if (fill) {
        fill.style.width = pct + '%';
        fill.parentElement.setAttribute('aria-valuenow', pct);
      }

      var pctElement = document.getElementById('meter-pct') ||
        document.querySelector('.meter-label span:last-child');
      if (pctElement) pctElement.textContent = pct + '%';

      var note = document.getElementById('meter-note') || document.querySelector('.meter-note');
      if (note) {
        note.textContent = '累計 ' + Math.round(current).toLocaleString() +
          '円 ／ 目標 ' + target.toLocaleString() + '円';
      }
    } catch (error) {
      var noteElement = document.getElementById('meter-note') || document.querySelector('.meter-note');
      if (noteElement && noteElement.textContent.indexOf('読み込み中') !== -1) {
        noteElement.textContent = '進捗は次回読み込み時に更新されます';
      }
    } finally {
      window.clearTimeout(timeout);
    }
  }

  function wrapTables() {
    document.querySelectorAll('.article-content table').forEach(function (table) {
      if (table.parentElement.classList.contains('table-wrap')) return;
      var wrapper = document.createElement('div');
      wrapper.className = 'table-wrap';
      wrapper.tabIndex = 0;
      wrapper.setAttribute('role', 'region');
      wrapper.setAttribute('aria-label', 'データ表。横にスクロールできます');
      table.parentNode.insertBefore(wrapper, table);
      wrapper.appendChild(table);
    });
  }

  function buildBackToTop() {
    var button = document.createElement('button');
    button.className = 'back-to-top';
    button.type = 'button';
    button.textContent = '↑';
    button.hidden = true;
    button.setAttribute('aria-label', 'ページの先頭へ戻る');
    button.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'instant' });
    });

    function updateVisibility() {
      button.hidden = window.scrollY <= 600;
    }
    window.addEventListener('scroll', updateVisibility, { passive: true });
    updateVisibility();
    document.body.appendChild(button);
  }

  function improveExternalLinks() {
    document.querySelectorAll('a[target="_blank"]').forEach(function (link) {
      if (!link.getAttribute('aria-label')) {
        link.setAttribute('aria-label', link.textContent.trim() + '（新しいタブで開きます）');
      }
    });
  }

  function initialize() {
    wrapTables();
    setupNavigation();
    setupCopyButtons();
    buildBackToTop();
    improveExternalLinks();
    updateMaldivesMeter();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
  } else {
    initialize();
  }
})();
