import { EFFECTS } from './registry.js';
import { GROUP_MAP } from './groups.js';
import { SKILLS, CATS } from './skills-data.js';
import { films, opus } from './video-data.js';

const items = [
  ...EFFECTS.map(e => ({type:'动效代码', title:e.name, category:GROUP_MAP[e.group]?.name || e.group, description:e.desc, extra:[e.lib,e.deps,e.note], href:`effects.html#${encodeURIComponent(e.id)}`})),
  ...SKILLS.map(s => ({type:'技能', title:s.zh || s.name, category:CATS[s.cat] || s.cat, description:s.desc, extra:[s.name,s.id], href:`skills.html?skill=${encodeURIComponent(s.id)}`})),
  ...films.map(([slug,name,english,tags]) => ({type:'视频样片', title:name, category:'视频风格', description:english, extra:[tags,slug], href:`video.html?q=${encodeURIComponent(name)}#films`})),
  ...opus.map(([slug,cn,en,film,dur,tags,line]) => ({type:'视频样片', title:cn, category:'视频风格 · lemo-opuscar', description:line || en, extra:[en,tags,slug], href:`video.html?q=${encodeURIComponent(cn)}#films`}))
];
const search = document.querySelector('#search');
const filters = document.querySelector('#filters');
const list = document.querySelector('#list');
const types = ['全部', '动效代码', '视频样片', '技能'];
let type = '全部';
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
/* 滑块是一个常驻节点：render() 只换按钮，不换 thumb，
   否则每次重建都会重新归位，弹簧动画永远跑不起来 */
const thumbEl = document.createElement('span');
thumbEl.className = 'filters-thumb';
thumbEl.setAttribute('aria-hidden', 'true');

let thumbRaf = 0, thumbX = 0, thumbV = 0, thumbBoot = false, thumbTs = 0;

function drawThumb(ts) {
  thumbRaf = 0;
  const dt = thumbTs ? Math.min(64, ts - thumbTs) : 16;
  thumbTs = ts;

  const active = filters.querySelector('[aria-pressed=true]');
  if (!active) { thumbEl.style.opacity = '0'; return; }
  const target = active.offsetLeft;
  const w = active.offsetWidth;

  /* 橡皮筋：前缘先走、后缘跟随——速度拉长宽度，再回弹。
     逼近系数按 dt 换算，低帧率设备上也能一次到位，不会卡在半路。 */
  const k = 1 - Math.pow(1 - .22, dt / 16.67);
  const prevX = thumbX;
  thumbX += (target - thumbX) * k + thumbV;
  thumbV = (thumbX - prevX) * Math.pow(.72, dt / 16.67);
  const stretch = 1 + Math.min(.12, Math.abs(thumbV) * .02);

  thumbEl.style.opacity = '1';
  thumbEl.style.width = (w * stretch).toFixed(1) + 'px';
  thumbEl.style.transform = 'translateX(' + (thumbX - (w * stretch - w) / 2).toFixed(2) + 'px)';

  if (Math.abs(thumbX - target) > .4 || Math.abs(thumbV) > .05) {
    thumbRaf = requestAnimationFrame(drawThumb);
  } else {
    thumbX = target; thumbV = 0;
    thumbEl.style.width = w + 'px';
    thumbEl.style.transform = 'translateX(' + target.toFixed(2) + 'px)';
  }
}

function queueThumb() {
  const active = filters.querySelector('[aria-pressed=true]');
  if (!thumbBoot) {
    thumbBoot = true;
    thumbX = active ? active.offsetLeft : 0;
    thumbV = 0;
  }
  if (!thumbRaf) thumbRaf = requestAnimationFrame(drawThumb);
}

/* 筛选按钮只建一次：之后只改状态。
   重建 innerHTML 会丢焦点、丢旧引用，滑块也会跟着重置。 */
function buildFilters() {
  filters.classList.add('group');
  filters.appendChild(thumbEl);
  for (const t of types) {
    const b = document.createElement('button');
    b.type = 'button';
    b.dataset.type = t;
    const n = t === '全部' ? items.length : items.filter(i => i.type === t).length;
    b.innerHTML = escape(t) + ' <span>' + n + '</span>';
    filters.appendChild(b);
  }
}

function syncFilters() {
  for (const b of filters.querySelectorAll('[data-type]')) {
    b.setAttribute('aria-pressed', String(b.dataset.type === type));
  }
  queueThumb();
}

function render() {
  const words = search.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const matched = items.filter(item => (type === '全部' || item.type === type) && words.every(word => [item.title,item.category,item.description,...item.extra].join(' ').toLowerCase().includes(word)));
  const results = document.querySelector('.results');
  if (results) results.hidden = !words.length && type === '全部';
  syncFilters();
  document.querySelector('#count').textContent = `找到 ${matched.length} 项`;
  document.querySelector('#empty').hidden = matched.length > 0;
  list.innerHTML = matched.map(item => `<a class="item" href="${escape(item.href)}"><div><span class="badge">${escape(item.type)}</span><span class="category">${escape(item.category)}</span></div><h3>${escape(item.title)}</h3><p>${escape(item.description)}</p><span class="arrow" aria-hidden="true">↗</span></a>`).join('');

  /* URL 反映状态：搜索词和类型都能分享、能深链 */
  const url = new URL(location.href);
  if (search.value.trim()) url.searchParams.set('q', search.value.trim());
  else url.searchParams.delete('q');
  if (type !== '全部') url.searchParams.set('type', type);
  else url.searchParams.delete('type');
  history.replaceState(null, '', url.pathname + url.search + url.hash);
}

/* 初次进入：从 URL 读回状态 */
{
  const params = new URLSearchParams(location.search);
  const q = params.get('q');
  if (q) search.value = q;
  const t = params.get('type');
  if (t && types.includes(t)) type = t;
}

addEventListener('resize', queueThumb);
buildFilters();
if (matchMedia('(pointer:fine)').matches) {
  list.addEventListener('pointermove', event => {
    const card = event.target.closest('.item');
    if (!card) return;
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', ((event.clientX - r.left) / (r.width || 1) * 100).toFixed(1) + '%');
    card.style.setProperty('--my', ((event.clientY - r.top) / (r.height || 1) * 100).toFixed(1) + '%');
  });
}
filters.addEventListener('click', event => { const button = event.target.closest('[data-type]'); if (button) { type = button.dataset.type; render(); } });
search.addEventListener('input', render);
document.querySelector('#clear').addEventListener('click', () => { search.value = ''; type = '全部'; render(); search.focus(); });
document.addEventListener('keydown', event => { if (event.key === '/' && !/^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName)) { event.preventDefault(); search.focus(); } });
render();
