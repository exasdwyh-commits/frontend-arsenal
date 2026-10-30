import { films } from './video-data.js';
const base = 'https://vincentwei1021.github.io/mg-styles-15/';
const repo = 'https://github.com/Vincentwei1021/mg-styles-15';
const grid = document.getElementById('filmGrid');
grid.innerHTML = films.map(([slug, name, english, tags], index) => `
  <article class="film-card" data-search="${[name, english, tags].join(' ').toLowerCase()}">
    <div class="film-preview"><button class="film-play" data-slug="${slug}" aria-label="加载${name}视频"><img src="${base}videos/${slug}.jpg" alt="" loading="lazy"><span class="play-icon">▶</span><span class="play-caption">加载原项目样片</span></button></div>
    <div class="film-info"><div class="film-line"><span>${String(index + 1).padStart(2, '0')} / ${english}</span><span>10 SEC</span></div><h3>${name}</h3><div class="film-tags">${tags.split(' ').map(tag => `<span>${tag}</span>`).join('')}</div><div class="film-links"><a href="${repo}/blob/main/prompts/${slug}.md" target="_blank" rel="noopener noreferrer">提示词 ↗</a><a href="${repo}/tree/main/demos/${slug}" target="_blank" rel="noopener noreferrer">源码 ↗</a></div></div>
  </article>`).join('');

grid.addEventListener('click', event => {
  const button = event.target.closest('[data-slug]');
  if (!button) return;
  const video = document.createElement('video');
  video.controls = true;
  video.playsInline = true;
  video.preload = 'metadata';
  video.poster = `${base}videos/${button.dataset.slug}.jpg`;
  video.src = `${base}videos/${button.dataset.slug}.mp4`;
  video.setAttribute('aria-label', button.getAttribute('aria-label'));
  button.replaceWith(video);
  video.play().catch(() => {});
});

function filterFilms() {
  const query = document.getElementById('filmSearch').value.trim().toLowerCase();
  let visible = 0;
  grid.querySelectorAll('.film-card').forEach(card => {
    const match = !query || card.dataset.search.includes(query);
    card.hidden = !match;
    if (match) visible++;
    else card.querySelector('video')?.pause();
  });
  document.getElementById('filmCount').textContent = `${visible} / ${films.length} 种风格`;
  document.getElementById('filmEmpty').hidden = visible > 0;
}
document.getElementById('filmSearch').value = new URLSearchParams(location.search).get('q') || '';
document.getElementById('filmSearch').addEventListener('input', filterFilms);
filterFilms();
