'use strict';

const base = '/articles/';
const stories = [
  {id:'chokkinzu', title:'チョッキンズは月いくら稼げる？', date:'2026-07-25', tags:['放置']},
  {id:'torima', title:'トリマの稼ぎ方とガチャの実測結果', date:'2026-06-07', tags:['歩数','移動']},
  {id:'odipo', title:'おぢポの稼ぎ方とスクラッチの実測結果', date:'2026-06-07', tags:['歩数']},
  {id:'linewalk', title:'LINE WALKの稼ぎ方とアイテムの使いどころ', date:'2026-06-07', tags:['歩数','移動','放置']},
  {id:'kartie-point', title:'カルティポイントのスピンを実測', date:'2026-06-07', tags:['歩数','移動']}
];
const sections = [['steps','歩数'],['travel','移動'],['idle','放置']];
const get = id => document.getElementById(id);
const arrow = '<svg aria-hidden="true"><use href="#i-arrow"></use></svg>';
const img = story => '<img src="/articles/images/og-' + (story.id === 'kartie-point' ? 'kartie' : story.id) + '.png" alt="" loading="lazy">';
const url = story => base + story.id + '.html';

async function updateMeter() {
  const endpoint = 'https://docs.google.com/spreadsheets/d/1sVYNqqg2ysLfiyTG_RbbTpBPpytwR2sOgMTCLEVgfOQ/gviz/tq';
  const params = new URLSearchParams({tqx:'out:json', sheet:'ダッシュボード', range:'B2'});
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);
  try {
    const response = await fetch(endpoint + '?' + params, {signal:controller.signal});
    if (!response.ok) throw new Error('Meter request failed');
    const match = (await response.text()).match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\)/);
    const current = match && JSON.parse(match[1]).table?.rows?.[0]?.c?.[0]?.v;
    if (typeof current !== 'number' || !Number.isFinite(current)) throw new Error('Invalid meter value');
    const target = 1000000;
    const pct = Math.min(100, Math.max(0, current / target * 100)).toFixed(1);
    const fill = get('meter-fill');
    fill.style.width = pct + '%';
    fill.parentElement.setAttribute('aria-valuenow', pct);
    get('meter-pct').textContent = pct + '%';
    get('meter-note').textContent = '累計 ' + Math.round(current).toLocaleString('ja-JP') +
      '円 ／ 目標 ' + target.toLocaleString('ja-JP') + '円';
  } catch {
    get('meter-note').textContent = '進捗は次回読み込み時に更新されます';
  } finally {
    clearTimeout(timeout);
  }
}
updateMeter();

get('collections').innerHTML = sections.map(([id, tag]) => {
  const cards = stories.filter(story => story.tags.includes(tag)).slice(0, 3);
  return `<section class="collection" id="${id}"><div class="section-head"><h3>${tag}で貯める</h3><button class="text-button search-open" type="button" data-category="${tag}">もっと見る ${arrow}</button></div><div class="story-grid">${cards.map(story => `<a class="story" href="${url(story)}">${img(story)}<h4>${story.title}</h4></a>`).join('')}</div></section>`;
}).join('');
get('latest').innerHTML = stories.slice(0, 3).map(story => `<a class="latest-row" href="${url(story)}">${img(story)}<div><strong>${story.title}</strong><time datetime="${story.date}">更新 ${story.date.replaceAll('-', '.')}</time></div></a>`).join('');

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

const menu = document.querySelector('.mobile-menu');
function setMenu(open) {
  get('nav').classList.toggle('open', open);
  menu.setAttribute('aria-expanded', String(open));
}
menu.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
get('nav').addEventListener('click', event => {
  if (event.target.closest('a')) setMenu(false);
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
    setMenu(false);
    menu.focus();
  }
});

const header = document.querySelector('.site-header');
function scrollPosition() {
  const page = document.scrollingElement || document.documentElement;
  return Math.max(0, Math.min(page.scrollTop, page.scrollHeight - page.clientHeight));
}
let previousY = scrollPosition();
window.addEventListener('scroll', () => {
  const y = scrollPosition();
  const delta = y - previousY;
  previousY = y;
  if (!delta && y !== 0) return;
  const hide = y >= header.offsetHeight && delta > 0;
  header.classList.toggle('is-hidden', hide);
  if (hide && menu.getAttribute('aria-expanded') === 'true') setMenu(false);
}, {passive:true});
