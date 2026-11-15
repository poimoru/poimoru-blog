'use strict';

const { stories, names, available, categoryUrl, articleUrl, imageUrl, escape } = PoimoruCatalog;
const filters = document.querySelector('#filters');
const results = document.querySelector('#results');
const query = document.querySelector('#query');
const pagination = document.querySelector('#pagination');
const pageSize = 10;
const params = new URLSearchParams(location.search);
const requestedPage = Number(params.get('page'));
query.value = params.get('q') || '';
const normalize = value => value.normalize('NFKC').toLowerCase().trim();
const active = document.body.dataset.category || 'all';

for (const [id, label] of available) {
  const link = document.createElement('a');
  link.href = categoryUrl(id);
  link.textContent = label;
  if (id === active) link.setAttribute('aria-current', 'page');
  filters.append(link);
}

function renderPagination(page, totalPages) {
  pagination.hidden = totalPages < 2;
  pagination.replaceChildren();
  if (pagination.hidden) return;

  function addLink(label, number, ariaLabel, rel) {
    const url = new URL(location.href);
    url.search = '';
    if (query.value.trim()) url.searchParams.set('q', query.value.trim());
    if (number > 1) url.searchParams.set('page', String(number));
    url.hash = '';
    const link = document.createElement('a');
    link.href = url.href;
    link.textContent = label;
    link.setAttribute('aria-label', ariaLabel);
    if (number === page) link.setAttribute('aria-current', 'page');
    if (rel) link.rel = rel;
    pagination.append(link);
  }

  if (page > 1) addLink('前へ', page - 1, '前のページ', 'prev');
  const numbers = totalPages <= 5
    ? Array.from({length: totalPages}, (_, i) => i + 1)
    : [...new Set([1, Math.max(2, Math.min(page - 1, totalPages - 3)),
      Math.max(3, Math.min(page, totalPages - 2)),
      Math.max(4, Math.min(page + 1, totalPages - 1)), totalPages])];
  let previous = 0;
  for (const number of numbers) {
    if (number - previous > 1) {
      const gap = document.createElement('span');
      gap.textContent = '…';
      gap.setAttribute('aria-hidden', 'true');
      pagination.append(gap);
    }
    addLink(String(number), number, number + 'ページ目');
    previous = number;
  }
  if (page < totalPages) addLink('次へ', page + 1, '次のページ', 'next');
}

function render(requested = 1) {
  const words = normalize(query.value).split(/\s+/).filter(Boolean);
  const hits = stories.filter(([id, title, , tags, summary]) =>
    (active === 'all' || tags.includes(active)) &&
    words.every(word => normalize([id, title, summary].join(' ')).includes(word))
  );
  const totalPages = Math.ceil(hits.length / pageSize);
  const page = Number.isSafeInteger(requested) ? Math.max(1, Math.min(requested, totalPages)) : 1;
  const visible = hits.slice((page - 1) * pageSize, page * pageSize);
  document.querySelector('#count').textContent = hits.length + '件';
  results.innerHTML = visible.length ? visible.map(([id, title, date, tags, summary]) => `
    <article class="story">
      <a class="story-link" href="${articleUrl(id)}">
        <div class="thumb"><img src="${imageUrl(id)}" width="1200" height="630" loading="lazy" alt=""></div>
        <div class="story-copy">
          <ul class="tags" aria-label="貯め方">${tags.map(tag => `<li>${names.get(tag)}</li>`).join('')}</ul>
          <h3>${escape(title)}</h3>
          <p class="summary">${escape(summary)}</p>
          <time datetime="${date}">更新 ${date.replaceAll('-', '.')}</time>
        </div>
      </a>
    </article>`).join('') : words.length
      ? '<div class="empty"><p>該当する記事はありません。</p><button type="button" id="reset">検索をクリア</button></div>'
      : '<div class="empty"><p>このカテゴリにはまだ公開記事がありません。</p><a href="/categories/">すべての記事を見る</a></div>';
  renderPagination(page, totalPages);
}
results.addEventListener('click', event => {
  if (event.target.id !== 'reset') return;
  query.value = '';
  render();
  query.focus();
});
query.addEventListener('input', () => render());
document.querySelector('#open-search')?.addEventListener('click', () => query.focus());
render(requestedPage);
