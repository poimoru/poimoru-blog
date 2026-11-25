'use strict';

const PoimoruCatalog = (() => {
  const categories = [['all', 'すべて'], ['steps', '歩数'], ['travel', '移動'],
    ['idle', '放置'], ['points', 'ポイントサイト'], ['other', 'その他']];
  const names = new Map(categories);
  const stories = [
    ['kartie-introduction', 'カルティポイントの始め方と貯め方｜交換条件と使い方', '2026-11-26', ['steps', 'travel'], '歩数・移動・食事・睡眠での貯め方や交換条件、広告回数別の月間獲得額を紹介します。'],
    ['torima-introduction', 'トリマの始め方とマイルの貯め方｜歩数・移動の使い分けと交換方法', '2026-11-20', ['steps', 'travel'], '歩数・移動での貯め方から、アイテムの損益分岐点やポイント交換までを解説します。'],
    ['torima-lottery', 'トリマのガチャ確率は？3万回以上の実測結果とWチャンスの当選率', '2026-11-17', ['steps', 'travel'], 'ガチャ38,543回の当選結果と、基本報酬込みで何円相当になるかを検証しました。'],
    ['chokkinzu', 'チョッキンズは月いくら稼げる？', '2026-07-25', ['idle'], 'コインの貯め方と、じゃんけんの実測結果を紹介します。'],
    ['torima', 'トリマの稼ぎ方とガチャの実測結果', '2026-06-07', ['steps', 'travel'], '移動と歩数で貯まるマイルと、ガチャ・スロットの実測結果を紹介します。'],
    ['odipo', 'おぢポの稼ぎ方とスクラッチの実測結果', '2026-06-07', ['steps'], '歩数で貯める仕組みと、スクラッチ・ボトルの獲得データをまとめました。'],
    ['linewalk', 'LINE WALKの稼ぎ方とアイテムの使いどころ', '2026-06-07', ['steps', 'travel', 'idle'], 'コインの貯め方と、アイテムの損益分岐を解説します。'],
    ['kartie-point', 'カルティポイントのスピンを実測', '2026-06-07', ['steps', 'travel'], 'スピン1,251回の記録から、当選率と再チャレンジの期待値を検証しました。']
  ].sort((a, b) => b[2].localeCompare(a[2]));
  const available = categories.filter(([id]) => id === 'all' || stories.some(story => story[3].includes(id)));
  const categoryUrl = id => '/categories/' + (id === 'all' ? '' : id);
  const articleUrl = id => '/articles/' + id;
  const ogSlugs = { 'kartie-point': 'kartie', 'torima-introduction': 'torima' };
  const imageUrl = id => '/articles/images/og-' + (ogSlugs[id] || id) + '.png';
  const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  return { categories, names, stories, available, categoryUrl, articleUrl, imageUrl, escape };
})();

if (typeof module !== 'undefined') module.exports = PoimoruCatalog;
