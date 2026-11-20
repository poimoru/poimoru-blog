(() => {
  'use strict';
  const toc = document.querySelector('.article-content .toc');
  if (!toc) return;

  document.querySelectorAll('.article-side-toc .draft-toc-sublist').forEach(list => list.remove());
  toc.querySelectorAll('.draft-toc-sublist').forEach((list, index) => {
    const link = list.previousElementSibling;
    const row = document.createElement('div');
    row.className = 'draft-toc-row';
    link.before(row);
    const button = document.createElement('button');
    button.className = 'draft-toc-toggle';
    button.type = 'button';
    list.id = `draft-toc-topics-${index + 1}`;
    button.setAttribute('aria-controls', list.id);
    const setExpanded = expanded => {
      button.setAttribute('aria-expanded', String(expanded));
      button.setAttribute('aria-label', `${link.textContent}の小見出しを${expanded ? '閉じる' : '開く'}`);
    };
    setExpanded(false);
    button.addEventListener('click', () => setExpanded(button.getAttribute('aria-expanded') === 'false'));
    row.append(link, button);
  });
})();
