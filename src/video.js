import { films, opus } from './video-data.js';
import { SHOTS, SHOT_CATS, SHOT_BASE } from './shot-data.js';
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

function loadSample(button, src, label, boxClass) {
  const box = document.createElement('div');
  box.className = boxClass;
  const video = document.createElement('video');
  video.controls = true;
  video.playsInline = true;
  video.preload = 'metadata';
  if (button.dataset.poster) video.poster = button.dataset.poster;
  video.src = src;
  video.setAttribute('aria-label', label || '加载样片');
  const overlay = document.createElement('div');
  overlay.className = 'film-overlay';
  overlay.innerHTML = '<span class="spin" aria-hidden="true"></span><b>正在从原项目加载样片…</b><i>样片托管在外部 GitHub Pages，网络慢时请挂代理</i>';
  box.append(video, overlay);
  button.replaceWith(box);

  const hideOverlay = () => overlay.remove();
  const buffered = () => {
    if (!video.duration || !video.buffered.length) return;
    const pct = Math.min(100, Math.round(video.buffered.end(video.buffered.length - 1) / video.duration * 100));
    const labelEl = overlay.querySelector('b');
    if (labelEl) labelEl.textContent = pct >= 100 ? '缓冲完成' : `正在加载… 已缓冲 ${pct}%`;
  };
  video.addEventListener('canplay', hideOverlay);
  video.addEventListener('progress', buffered);
  video.addEventListener('error', () => {
    overlay.classList.add('err');
    overlay.innerHTML = '<b>样片加载失败</b><i>无法访问外部 GitHub Pages，挂代理刷新后重试</i>';
  }, { once: true });
  video.play().catch(() => {});
}

grid.addEventListener('click', event => {
  const button = event.target.closest('[data-video]');
  if (!button) return;
  loadSample(button, button.dataset.video, button.getAttribute('aria-label'), 'film-box');
});

/* ---- 镜头配方（video-shotcraft 124 卡） ---- */
const escAttr = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const shortEnergy = e => e.split(/[（(：:]/)[0].trim();
const shotGrid = document.getElementById('shotGrid');
const shotCats = document.getElementById('shotCats');
const catCount = {};
SHOTS.forEach(([, cat]) => { catCount[cat] = (catCount[cat] || 0) + 1; });
let shotCat = 'all';

shotCats.innerHTML = `<button type="button" class="on" data-cat="all">全部 <b>${SHOTS.length}</b></button>` +
  Object.entries(SHOT_CATS).map(([key, zh]) => `<button type="button" data-cat="${key}">${zh} <b>${catCount[key] || 0}</b></button>`).join('');

shotGrid.innerHTML = SHOTS.map(([name, cat, summary, use, duration, energy, intention, media], i) => `
  <article class="shot-item" data-cat="${cat}" data-search="${escAttr([name, cat, SHOT_CATS[cat], summary, use, duration, energy].join(' ').toLowerCase())}">
    <div class="shot-head"><span class="shot-no">${String(i + 1).padStart(2, '0')}</span><h3>${name}</h3><span class="shot-tag">${SHOT_CATS[cat]}</span></div>
    <p class="shot-sum">${summary}</p>
    <p class="shot-use"><b>用途</b>${use}</p>
    <div class="shot-meta"><span>${duration}</span><span>${shortEnergy(energy)}</span></div>
    <details class="shot-more"><summary>为什么这样设计</summary><p>${intention}</p></details>
    <div class="shot-links"><button type="button" class="shot-play" data-video="${SHOT_BASE}${media}">▶ 样片</button><a href="${SHOT_BASE}#${name}" target="_blank" rel="noopener noreferrer">官方配方 ↗</a><a href="https://github.com/Vincentwei1021/video-shotcraft/blob/main/references/shots/${cat}/${name}.md" target="_blank" rel="noopener noreferrer">源文档 ↗</a></div>
  </article>`).join('');

shotGrid.addEventListener('click', event => {
  const button = event.target.closest('.shot-play');
  if (!button) return;
  loadSample(button, button.dataset.video, '加载镜头样片', 'shot-player');
});

function filterShots() {
  const query = document.getElementById('shotSearch').value.trim().toLowerCase();
  let visible = 0;
  shotGrid.querySelectorAll('.shot-item').forEach(card => {
    const match = (shotCat === 'all' || card.dataset.cat === shotCat) && (!query || card.dataset.search.includes(query));
    card.hidden = !match;
    if (match) visible++;
  });
  document.getElementById('shotCount').textContent = `${visible} / ${SHOTS.length} 个配方`;
  const clear = document.getElementById('shotClear');
  clear.hidden = !query && shotCat === 'all';
  clear.textContent = `显示全部 ${SHOTS.length} 个`;
  document.getElementById('shotEmpty').hidden = visible > 0;
}
document.getElementById('shotSearch').addEventListener('input', filterShots);
document.getElementById('shotClear').addEventListener('click', () => {
  document.getElementById('shotSearch').value = '';
  shotCat = 'all';
  shotCats.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.cat === 'all'));
  filterShots();
  document.getElementById('shotSearch').focus();
});
shotCats.addEventListener('click', event => {
  const button = event.target.closest('button[data-cat]');
  if (!button) return;
  shotCat = button.dataset.cat;
  shotCats.querySelectorAll('button').forEach(b => b.classList.toggle('on', b === button));
  filterShots();
});
filterShots();

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
