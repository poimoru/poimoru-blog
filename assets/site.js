/* ポイモルブログ 共通スクリプト v3 */
(function () {
  'use strict';

  var lastFocusedElement = null;

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

    var original = button.textContent;
    try {
      await navigator.clipboard.writeText(codeElement.textContent.trim());
      button.textContent = 'コピーしました';
      setCopyStatus('招待コードをコピーしました');
    } catch (error) {
      button.textContent = 'コピーできませんでした';
      setCopyStatus('招待コードをコピーできませんでした');
    }
    window.setTimeout(function () {
      button.textContent = original;
    }, 1600);
  }

  function setupCopyButtons() {
    document.querySelectorAll('.copy-btn').forEach(function (button) {
      button.removeAttribute('onclick');
      button.addEventListener('click', function () {
        copyInvite(button);
      });
    });
  }

  async function updateMaldivesMeter() {
    var fill = document.getElementById('meter-fill') || document.querySelector('.meter-fill');
    if (!fill) return;

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
      var current = Number(json.table.rows[0].c[0].v);
      if (!Number.isFinite(current)) throw new Error('meter value invalid');

      var target = 1000000;
      var pct = Math.min(100, current / target * 100).toFixed(1);
      fill.style.width = pct + '%';
      fill.parentElement.setAttribute('aria-valuenow', pct);

      var pctElement = document.getElementById('meter-pct') ||
        document.querySelector('.meter-label span:last-child');
      if (pctElement) pctElement.textContent = pct + '%';

      var note = document.getElementById('meter-note') || document.querySelector('.meter-note');
      if (note) {
        note.textContent = '累計 ' + Math.round(current).toLocaleString() +
          'pt ／ 目標 ' + target.toLocaleString() + 'pt';
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

  function closeToc(overlay, fab) {
    overlay.hidden = true;
    overlay.classList.remove('open');
    document.body.classList.remove('modal-open');
    fab.setAttribute('aria-expanded', 'false');
    if (lastFocusedElement) lastFocusedElement.focus();
  }

  function openToc(overlay, sheet, fab) {
    lastFocusedElement = document.activeElement;
    overlay.hidden = false;
    overlay.classList.add('open');
    document.body.classList.add('modal-open');
    fab.setAttribute('aria-expanded', 'true');
    var closeButton = sheet.querySelector('.toc-close');
    if (closeButton) closeButton.focus();
  }

  function trapDialogFocus(event, sheet, overlay, fab) {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeToc(overlay, fab);
      return;
    }
    if (event.key !== 'Tab') return;

    var focusable = Array.from(sheet.querySelectorAll('a[href], button:not([disabled])'));
    if (!focusable.length) return;
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function buildFloatingToc() {
    var content = document.querySelector('.article-content');
    if (!content) return;
    var headings = content.querySelectorAll('h2[id]');
    if (headings.length < 2) return;

    var fab = document.createElement('button');
    fab.className = 'toc-fab';
    fab.type = 'button';
    fab.textContent = '目次';
    fab.setAttribute('aria-label', '記事の目次を開く');
    fab.setAttribute('aria-expanded', 'false');
    fab.setAttribute('aria-controls', 'mobile-toc-dialog');

    var overlay = document.createElement('div');
    overlay.className = 'toc-overlay';
    overlay.hidden = true;

    var sheet = document.createElement('div');
    sheet.className = 'toc-sheet';
    sheet.id = 'mobile-toc-dialog';
    sheet.setAttribute('role', 'dialog');
    sheet.setAttribute('aria-modal', 'true');
    sheet.setAttribute('aria-labelledby', 'mobile-toc-title');

    var header = document.createElement('div');
    header.className = 'toc-sheet-header';
    var title = document.createElement('p');
    title.className = 'toc-title';
    title.id = 'mobile-toc-title';
    title.textContent = '記事の目次';
    var closeButton = document.createElement('button');
    closeButton.className = 'toc-close';
    closeButton.type = 'button';
    closeButton.setAttribute('aria-label', '目次を閉じる');
    closeButton.textContent = '×';
    header.appendChild(title);
    header.appendChild(closeButton);

    var list = document.createElement('ol');
    headings.forEach(function (heading) {
      var item = document.createElement('li');
      var link = document.createElement('a');
      link.href = '#' + heading.id;
      link.textContent = heading.textContent;
      link.addEventListener('click', function () { closeToc(overlay, fab); });
      item.appendChild(link);
      list.appendChild(item);
    });

    sheet.appendChild(header);
    sheet.appendChild(list);
    overlay.appendChild(sheet);

    fab.addEventListener('click', function () { openToc(overlay, sheet, fab); });
    closeButton.addEventListener('click', function () { closeToc(overlay, fab); });
    overlay.addEventListener('click', function (event) {
      if (event.target === overlay) closeToc(overlay, fab);
    });
    sheet.addEventListener('keydown', function (event) {
      trapDialogFocus(event, sheet, overlay, fab);
    });

    document.body.appendChild(fab);
    document.body.appendChild(overlay);
  }

  function buildBackToTop() {
    var button = document.createElement('button');
    button.className = 'back-to-top';
    button.type = 'button';
    button.textContent = '↑';
    button.hidden = true;
    button.setAttribute('aria-label', 'ページの先頭へ戻る');
    button.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        button.hidden = window.scrollY <= 600;
        ticking = false;
      });
    }, { passive: true });
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
    buildFloatingToc();
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
