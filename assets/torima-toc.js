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

  document.querySelectorAll('.article-content .table-wrap').forEach(wrapper => {
    wrapper.querySelectorAll('tbody th').forEach(cell => {
      if (cell.children.length) return;
      const parts = cell.textContent.split(/(?=＋Wチャンス|Wチャンス)|(?<=のみ)/);
      cell.replaceChildren(...parts.filter(Boolean).map(part => {
        const span = document.createElement('span');
        span.className = 'table-label-part';
        span.textContent = part;
        return span;
      }));
    });
    wrapper.querySelectorAll('td').forEach(cell => {
      Array.from(cell.childNodes).forEach(node => {
        if (node.nodeType !== Node.TEXT_NODE || !node.textContent.includes('円相当')) return;
        const span = document.createElement('span');
        span.className = 'table-yen';
        span.textContent = node.textContent;
        node.replaceWith(span);
      });
    });
    const updateEdge = () => wrapper.classList.toggle(
      'has-more-right', wrapper.scrollWidth - wrapper.clientWidth - wrapper.scrollLeft > 2
    );
    wrapper.addEventListener('scroll', updateEdge, { passive: true });
    if ('ResizeObserver' in window) new ResizeObserver(updateEdge).observe(wrapper);
    updateEdge();
  });
})();
