'use strict';

const { stories: entries, available, names, categoryUrl, articleUrl, imageUrl, escape } = PoimoruCatalog;
const stories = entries.map(([id, title, date, tags]) => ({
  id, title: escape(title), date, tags: tags.map(tag => names.get(tag))
}));
const sections = available.filter(([id]) => id !== 'all');
const get = id => document.getElementById(id);
const arrow = '<svg aria-hidden="true"><use href="#i-arrow"></use></svg>';
const img = story => `<img src="${imageUrl(story.id)}" width="1200" height="630" alt="" loading="lazy">`;
const url = story => articleUrl(story.id);
get('collections').innerHTML = sections.map(([id, tag]) => {
  const label = ['points', 'other'].includes(id) ? tag : tag + 'で貯める';
  const cards = stories.filter(story => story.tags.includes(tag)).slice(0, 3);
  return `<section class="collection" id="${id}"><div class="section-head"><h3>${label}</h3><a class="text-button" href="${categoryUrl(id)}">もっと見る ${arrow}</a></div><div class="story-grid">${cards.map(story => `<a class="story" href="${url(story)}">${img(story)}<h4>${story.title}</h4></a>`).join('')}</div></section>`;
}).join('');
get('latest').innerHTML = stories.slice(0, 3).map(story => `<a class="latest-row" href="${url(story)}">${img(story)}<div><strong>${story.title}</strong><time datetime="${story.date}">更新 ${story.date.replaceAll('-', '.')}</time></div></a>`).join('');

for (const [id, label] of sections) {
  document.querySelector('.browse-tabs').append(Object.assign(document.createElement('a'), {href: categoryUrl(id), textContent: label}));
  if (!['歩数','移動','放置'].includes(label)) {
    for (const select of [get('category'), get('side-category')]) select.add(new Option(label, label));
  }
}

const dialog = get('search-dialog');
const query = get('query');
const category = get('category');
function renderResults() {
  const words = query.value.normalize('NFKC').toLowerCase().trim().split(/\s+/).filter(Boolean);
  const hits = stories.filter(story => {
    const text = [story.id, story.title, ...story.tags].join(' ').normalize('NFKC').toLowerCase();
    return (!category.value || story.tags.includes(category.value)) && words.every(word => text.includes(word));
  });
  get('results').innerHTML = hits.length ? hits.map(story => `<a class="result-row" href="${url(story)}"><strong>${story.title}</strong><span class="meta">${story.tags.join('・')}</span></a>`).join('') : '<p>該当する記事はありません。</p>';
}
function openSearch(text = '', tag = '') {
  query.value = text;
  category.value = tag;
  renderResults();
  dialog.showModal();
  query.focus();
}
document.querySelectorAll('.search-open').forEach(button => {
  button.addEventListener('click', () => openSearch('', button.dataset.category));
});
get('side-form').addEventListener('submit', event => {
  event.preventDefault();
  openSearch(get('side-query').value, get('side-category').value);
});
query.addEventListener('input', renderResults);
category.addEventListener('change', renderResults);
