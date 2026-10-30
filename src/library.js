import { EFFECTS } from './registry.js';
import { GROUP_MAP } from './groups.js';
import { SKILLS, CATS } from './skills-data.js';
import { films } from './video-data.js';

const items = [
  ...EFFECTS.map(e => ({type:'动效代码', title:e.name, category:GROUP_MAP[e.group]?.name || e.group, description:e.desc, extra:[e.lib,e.deps,e.note], href:`index.html#${encodeURIComponent(e.id)}`})),
  ...SKILLS.map(s => ({type:'技能', title:s.zh || s.name, category:CATS[s.cat] || s.cat, description:s.desc, extra:[s.name,s.id], href:`skills.html?skill=${encodeURIComponent(s.id)}`})),
  ...films.map(([slug,name,english,tags]) => ({type:'视频样片', title:name, category:'视频风格', description:english, extra:[tags,slug], href:`video.html?q=${encodeURIComponent(name)}#films`}))
];
const search = document.querySelector('#search');
const filters = document.querySelector('#filters');
const list = document.querySelector('#list');
const types = ['全部', '动效代码', '视频样片', '技能'];
let type = '全部';
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function render() {
  const words = search.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const matched = items.filter(item => (type === '全部' || item.type === type) && words.every(word => [item.title,item.category,item.description,...item.extra].join(' ').toLowerCase().includes(word)));
  filters.innerHTML = types.map(t => `<button type="button" data-type="${t}" aria-pressed="${t === type}">${t} <span>${t === '全部' ? items.length : items.filter(i => i.type === t).length}</span></button>`).join('');
  document.querySelector('#count').textContent = `找到 ${matched.length} 项`;
  document.querySelector('#empty').hidden = matched.length > 0;
  list.innerHTML = matched.map(item => `<a class="item" href="${escape(item.href)}"><div><span class="badge">${escape(item.type)}</span><span class="category">${escape(item.category)}</span></div><h3>${escape(item.title)}</h3><p>${escape(item.description)}</p><span class="arrow" aria-hidden="true">↗</span></a>`).join('');
}
filters.addEventListener('click', event => { const button = event.target.closest('[data-type]'); if (button) { type = button.dataset.type; render(); } });
search.addEventListener('input', render);
document.querySelector('#clear').addEventListener('click', () => { search.value = ''; type = '全部'; render(); search.focus(); });
document.addEventListener('keydown', event => { if (event.key === '/' && !/^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName)) { event.preventDefault(); search.focus(); } });
render();
