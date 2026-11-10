import { films, opus } from './video-data.js';
const MG = { base: 'https://vincentwei1021.github.io/mg-styles-15/', repo: 'https://github.com/Vincentwei1021/mg-styles-15' };
const OPUS = { base: 'https://lemomo-ai.github.io/lemo-opuscar/', repo: 'https://github.com/lemomo-ai/lemo-opuscar' };
const grid = document.getElementById('filmGrid');

const tagSpans = tags => tags.split(' ').map(t => `<span>${t}</span>`).join('');

const mgCards = films.map(([slug, name, english, tags], i) => `
  <article class="film-card" data-search="${[name, english, tags].join(' ').toLowerCase()}">
    <div class="film-preview"><button class="film-play" data-video="${MG.base}videos/${slug}.mp4" data-poster="${MG.base}videos/${slug}.jpg" aria-label="加载${name}视频"><img src="${MG.base}videos/${slug}.jpg" alt="" loading="lazy"><span class="play-icon">▶</span><span class="play-caption">加载原项目样片</span></button></div>
    <div class="film-info"><div class="film-line"><span>${String(i + 1).padStart(2, '0')} / ${english}</span><span>10 SEC</span></div><h3>${name}</h3><div class="film-tags">${tagSpans(tags)}<span class="src">mg-styles-15</span></div><div class="film-links"><a href="${MG.repo}/blob/main/prompts/${slug}.md" target="_blank" rel="noopener noreferrer">提示词 ↗</a><a href="${MG.repo}/tree/main/demos/${slug}" target="_blank" rel="noopener noreferrer">源码 ↗</a></div></div>
  </article>`).join('');

const opusCards = opus.map(([slug, cn, en, film, dur, tags, line], i) => `
  <article class="film-card" data-search="${[cn, en, film, tags, line].join(' ').toLowerCase()}">
    <div class="film-preview"><button class="film-play" data-video="${OPUS.base}films/${slug}.mp4" data-poster="${OPUS.base}img/${slug}_0.jpg" aria-label="加载${cn}样片"><img src="${OPUS.base}img/${slug}_0.jpg" alt="" loading="lazy"><span class="play-icon">▶</span><span class="play-caption">加载原项目样片</span></button></div>
    <div class="film-info"><div class="film-line"><span>${String(films.length + i + 1).padStart(2, '0')} / ${en}</span><span>${dur}</span></div><h3>${cn}</h3><p class="film-desc">${line}</p><div class="film-tags">${tagSpans(tags)}<span class="src">lemo-opuscar</span></div><div class="film-links"><a href="${OPUS.repo}/blob/main/styles/${slug}/STYLE.md" target="_blank" rel="noopener noreferrer">STYLE.md ↗</a><a href="${OPUS.repo}" target="_blank" rel="noopener noreferrer">项目 ↗</a></div></div>
  </article>`).join('');

grid.innerHTML = mgCards + opusCards;

grid.addEventListener('click', event => {
  const button = event.target.closest('[data-video]');
  if (!button) return;
  const box = document.createElement('div');
  box.className = 'film-box';
  const video = document.createElement('video');
  video.controls = true;
  video.playsInline = true;
  video.preload = 'metadata';
  video.poster = button.dataset.poster;
  video.src = button.dataset.video;
  video.setAttribute('aria-label', button.getAttribute('aria-label'));
  const overlay = document.createElement('div');
  overlay.className = 'film-overlay';
  overlay.innerHTML = '<span class="spin" aria-hidden="true"></span><b>正在从原项目加载样片…</b><i>视频托管在外部 GitHub Pages，网络慢时请挂代理</i>';
  box.append(video, overlay);
  button.replaceWith(box);

  const hideOverlay = () => overlay.remove();
  const buffered = () => {
    if (!video.duration || !video.buffered.length) return;
    const pct = Math.min(100, Math.round(video.buffered.end(video.buffered.length - 1) / video.duration * 100));
    const label = overlay.querySelector('b');
    if (label) label.textContent = pct >= 100 ? '缓冲完成' : `正在加载… 已缓冲 ${pct}%`;
  };
  video.addEventListener('canplay', hideOverlay);
  video.addEventListener('progress', buffered);
  video.addEventListener('error', () => {
    overlay.classList.add('err');
    overlay.innerHTML = '<b>样片加载失败</b><i>无法访问外部 GitHub Pages，挂代理刷新后重试</i>';
  }, { once: true });
  video.play().catch(() => {});
});

function filterFilms() {
  const query = document.getElementById('filmSearch').value.trim().toLowerCase();
  const cards = grid.querySelectorAll('.film-card');
  let visible = 0;
  cards.forEach(card => {
    const match = !query || card.dataset.search.includes(query);
    card.hidden = !match;
    if (match) visible++;
    else card.querySelector('video')?.pause();
  });
  document.getElementById('filmCount').textContent = `${visible} / ${cards.length} 种风格`;
  const clear = document.getElementById('filmClear');
  clear.hidden = !query;
  clear.textContent = `显示全部 ${cards.length} 种`;
  document.getElementById('filmEmpty').hidden = visible > 0;
}
document.getElementById('filmSearch').value = new URLSearchParams(location.search).get('q') || '';
document.getElementById('filmSearch').addEventListener('input', filterFilms);
document.getElementById('filmClear').addEventListener('click', () => {
  document.getElementById('filmSearch').value = '';
  filterFilms();
  document.getElementById('filmSearch').focus();
});
filterFilms();
