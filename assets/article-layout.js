(() => {
  'use strict';
  const { stories, names, categoryUrl, articleUrl, imageUrl, escape } = PoimoruCatalog;
  const id = location.pathname.split('/').pop().replace(/\.html$/, '');
  const current = stories.find(story => story[0] === id);
  const main = document.getElementById('main-content');
  const sidebar = document.querySelector('.container > .sidebar');
  if (!main || !sidebar) return;
  document.body.classList.add('article-page');

  const code = document.getElementById('inviteCode')?.textContent.trim();
  const copyMarkup = code ? `<button class="copy-btn article-copy" type="button"><span data-copy-label>招待コードをコピー</span><code>${escape(code)}</code></button>` : '';
  if (code) {
    document.body.classList.add('article-has-code');
    const action = document.createElement('div');
    action.className = 'article-floating';
    action.innerHTML = copyMarkup;
    document.body.append(action);
    const update = () => { action.hidden = window.scrollY <= 200; };
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  const toc = main.querySelector('.toc');
  const sticky = document.createElement('div');
  sticky.className = 'article-sticky';
  const sideToc = toc?.cloneNode(true);
  if (sideToc) {
    sideToc.classList.add('sidebar-card', 'article-side-toc');
    sideToc.setAttribute('aria-label', 'サイドバーの目次');
    sticky.append(sideToc);
  }
  if (code) {
    const invite = document.createElement('section');
    invite.className = 'sidebar-card article-side-invite';
    invite.innerHTML = '<h2 class="section-title">招待コード</h2>' + copyMarkup;
    sticky.append(invite);
  }
  if (sticky.children.length) sidebar.append(sticky);

  if (!current) return;
  const tags = current[3];
  const cover = document.createElement('img');
  cover.className = 'article-cover';
  cover.src = imageUrl(id);
  cover.width = 1200;
  cover.height = 630;
  cover.alt = '';
  main.querySelector('.article-header')?.append(cover);
  const overlap = story => story[3].filter(tag => tags.includes(tag)).length;
  const related = stories.filter(story => story[0] !== id)
    .sort((a, b) => overlap(b) - overlap(a)).slice(0, 3);
  const tagLinks = tags.map(tag => `<a href="${categoryUrl(tag)}">${names.get(tag)}</a>`).join('');
  const cards = related.map(([slug, title, date, storyTags]) =>
    `<li><a class="article-related-link" href="${articleUrl(slug)}">
      <img src="${imageUrl(slug)}" width="1200" height="630" loading="lazy" alt="">
      <div><small>${storyTags.map(tag => names.get(tag)).join('・')}</small><strong>${escape(title)}</strong>
        <time datetime="${date}">更新 ${date.replaceAll('-', '.')}</time></div>
    </a></li>`).join('');
  const next = document.createElement('section');
  next.className = 'article-next';
  next.setAttribute('aria-label', '関連記事とカテゴリ');
  next.innerHTML = `<nav class="article-tags" aria-label="この記事のカテゴリ">${tagLinks}</nav>
    ${cards ? '<h2>次に読む記事</h2><ul>' + cards + '</ul>' : ''}
    <a class="article-all" href="/categories/">アプリ一覧へ</a>`;
  main.append(next);
})();
