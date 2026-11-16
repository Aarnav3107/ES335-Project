/* Shared controls and responsive chapter navigation for every page. */
document.querySelectorAll('[data-copy]').forEach(button => {
  button.addEventListener('click', async () => {
    const code = button.closest('.code-block')?.querySelector('code')?.textContent;
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      button.textContent = 'Copied';
      setTimeout(() => button.textContent = 'Copy', 1500);
    } catch {
      button.textContent = 'Select code to copy';
    }
  });
});

(() => {
  const header = document.querySelector('.site-header');
  if (header) {
    const measure = () => document.documentElement.style.setProperty('--header-height', `${header.getBoundingClientRect().height}px`);
    measure();
    if (typeof ResizeObserver !== 'undefined') new ResizeObserver(measure).observe(header);
    window.addEventListener('resize', measure);
  }
  const links = [...document.querySelectorAll('.toc a')];
  if (!links.length || typeof IntersectionObserver === 'undefined') return;
  const mark = id => links.forEach(link => {
    if (link.getAttribute('href') === `#${id}`) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
  const observer = new IntersectionObserver(entries => {
    const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
    if (visible.length) mark(visible[0].target.id);
  }, { rootMargin: '-20% 0px -60% 0px', threshold: 0 });
  for (const link of links) {
    const section = document.querySelector(link.getAttribute('href'));
    if (section) observer.observe(section);
    link.addEventListener('click', () => mark(link.getAttribute('href').slice(1)));
  }
})();
