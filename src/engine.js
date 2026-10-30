/* ============================================================
   engine.js —— 加载器 / 舞台 / 弹窗 / 选型抽屉
   一般不用动。要改交互体验才碰这个文件。
   ============================================================ */
import { EFFECTS } from './registry.js';
import { GROUPS, GROUP_MAP } from './groups.js';
import { sceneFor, dimensions, scenePreview } from './scenes.js';

/* ---------- CDN 经典脚本加载器 ----------
   file:// 下 ES Module 的 import() 会被 CORS 拦死，
   所以第三方库一律走经典 <script>。 */
const CDN = {
  anime: 'https://cdn.jsdelivr.net/npm/animejs@3.2.2/lib/anime.min.js'
};
const scriptCache = new Map();

export function loadScript(url) {
  if (scriptCache.has(url)) return scriptCache.get(url);
  const p = new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = url;
    s.async = false;
    s.onload = () => res();
    s.onerror = () => rej(new Error('CDN 加载失败: ' + url.split('/').pop()));
    document.head.appendChild(s);
  }).then(() => { scriptCache.set(url, Promise.resolve()); })
    .catch(e => { scriptCache.delete(url); throw e; });
  scriptCache.set(url, p);
  return p;
}

export async function ensure(lib) {
  if (lib === 'anime') {
    if (window.anime) return window.anime;
    await loadScript(CDN.anime).catch(() => {});  // CDN 挂了也要降级，不能白屏
    return window.anime || null;
  }
  return null;
}

/* ---------- 状态 ---------- */
const PICK_KEY = 'webui_picked';
export const picked = new Set(JSON.parse(localStorage.getItem(PICK_KEY) || '[]'));
const savePicked = () => localStorage.setItem(PICK_KEY, JSON.stringify([...picked]));

/* 正在运行的实例：id → destroy */
const running = new Map();

/** 在容器里启动一个效果；返回 destroy */
export async function mount(fx, el) {
  el.innerHTML = '';
  const destroy = await fx.init(el, { ensure, loadScript });
  return typeof destroy === 'function' ? destroy : () => {};
}

export function unmount(id) {
  const d = running.get(id);
  if (typeof d === 'function') d();
  running.delete(id);
}

/* ---------- 渲染 ---------- */
const app  = document.getElementById('app');
const nav  = document.getElementById('nav');

nav.innerHTML = GROUPS.map(g => {
  const n = EFFECTS.filter(e => e.group === g.id).length;
  return `<button data-g="${g.id}">${g.name}<em>${n}</em></button>`;
}).join('');

nav.addEventListener('click', e => {
  const b = e.target.closest('button');
  if (!b) return;
  document.getElementById('g-' + b.dataset.g)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

app.innerHTML = GROUPS.map(g => {
  const list = EFFECTS.filter(e => e.group === g.id);
  if (!list.length) return '';
  return `<section class="group" id="g-${g.id}">
    <div class="ghead"><h2>${g.name}</h2><span class="cnt">${list.length} 个效果</span></div>
    <p class="gdesc">${g.desc}</p>
    <div class="grid">${list.map(e => `
      <div class="card${picked.has(e.id) ? ' picked' : ''}" data-id="${e.id}">
        <div class="stage" data-stage="${e.id}">
          <div class="ph">点击加载<br><span style="color:#5F3BFF">${e.lib}</span></div>
        </div>
        <div class="meta">
          <div class="row1"><b>${e.name}</b><span class="lib">${e.lib}</span></div>
          <p>${e.desc}</p>
          <div class="tags">${sceneFor(e) ? [...(sceneFor(e).places || []), ...(sceneFor(e).goals || [])].map(t => `<span>${t}</span>`).join('') : '<span class="untagged">场景待整理</span>'}</div>
          <div class="acts">
            <button class="primary" data-pick="${e.id}">${picked.has(e.id) ? '已选' : '选它'}</button>
            <button data-code="${e.id}">代码</button>
          </div>
        </div>
      </div>`).join('')}</div>
  </section>`;
}).join('');

/* 卡片舞台：点击才加载 */
const byId = Object.fromEntries(EFFECTS.map(e => [e.id, e]));
document.querySelectorAll('[data-stage]').forEach(stage => {
  const id = stage.dataset.stage;
  stage.addEventListener('click', async () => {
    if (running.has(id)) return;
    const fx = byId[id];
    try {
      const d = await mount(fx, stage);
      running.set(id, d);
    } catch (err) {
      stage.innerHTML = `<div class="ph">加载失败<br>
        <span style="color:#c04">${err.message}</span><br>
        <span style="color:#4a5368">需联网访问 CDN</span></div>`;
    }
  });
});

/* ---------- 选它 / 看代码 ---------- */
document.addEventListener('click', e => {
  const pickBtn = e.target.closest('[data-pick]');
  if (pickBtn) {
    const id = pickBtn.dataset.pick;
    if (picked.has(id)) picked.delete(id); else picked.add(id);
    savePicked();
    pickBtn.closest('.card').classList.toggle('picked', picked.has(id));
    pickBtn.textContent = picked.has(id) ? '已选' : '选它';
    renderDrawer();
    return;
  }
  const codeBtn = e.target.closest('[data-code]');
  if (codeBtn) openModal(codeBtn.dataset.code);
});

/* ---------- 弹窗 ---------- */
const modal = document.getElementById('modal');
let modalDestroy = null;

async function openModal(id) {
  const fx = byId[id];
  document.getElementById('mTitle').textContent = fx.name;
  document.getElementById('mSub').textContent = fx.desc;
  document.getElementById('mDeps').textContent = '依赖：' + fx.deps;
  document.getElementById('mCode').textContent = fx.code;
  document.getElementById('mNote').textContent = '实战注意：' + fx.note;
  const st = document.getElementById('mStage');
  const panel = document.getElementById('scenePanel');
  panel.hidden = !['skeleton-shimmer', 'magnetic-btn'].includes(id);
  panel.innerHTML = panel.hidden ? '' : `<div class="scene-heading"><div><b>场景预览</b><p>在界面中观察效果的应用方式</p></div><div class="scene-tabs">${id === 'skeleton-shimmer' ? '<button data-scene="list">动态列表</button><button data-scene="table">数据表格</button>' : '<button data-scene="brand">品牌首屏</button>'}</div></div><div id="sceneCanvas"></div>`;
  let sceneDestroy = null;
  panel.onclick = async event => {
    const button = event.target.closest('[data-scene]');
    if (!button) return;
    if (sceneDestroy) sceneDestroy();
    panel.querySelectorAll('[data-scene]').forEach(item => item.classList.toggle('on', item === button));
    const canvas = panel.querySelector('#sceneCanvas');
    canvas.innerHTML = scenePreview(id, button.dataset.scene);
    if (id === 'magnetic-btn') sceneDestroy = await mount(fx, canvas.querySelector('.scene-effect'));
  };
  panel.querySelector('[data-scene]')?.click();
  modal.classList.add('on');
  try {
    const destroy = await mount(fx, st);
    modalDestroy = () => { destroy(); if (sceneDestroy) sceneDestroy(); };
  } catch (err) {
    st.innerHTML = `<div class="ph">加载失败：${err.message}</div>`;
  }
}

function closeModal() {
  modal.classList.remove('on');
  if (modalDestroy) modalDestroy();
  modalDestroy = null;
  document.getElementById('mStage').innerHTML = '';
  history.replaceState(null, '', location.pathname + location.search);
}

document.getElementById('mClose').onclick = closeModal;
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

const copyBtn = document.getElementById('mCopy');
copyBtn.onclick = async () => {
  try {
    await navigator.clipboard.writeText(document.getElementById('mCode').textContent);
    copyBtn.textContent = '已复制 ✓';
    copyBtn.classList.add('ok');
    setTimeout(() => { copyBtn.textContent = '复制代码'; copyBtn.classList.remove('ok'); }, 1400);
  } catch { copyBtn.textContent = '复制失败，请手动选中'; }
};

/* ---------- 选型抽屉 ---------- */
const drawer = document.getElementById('drawer');

function renderDrawer() {
  document.getElementById('dCount').textContent = picked.size;
  document.getElementById('dChips').innerHTML = [...picked].map(id => {
    const fx = byId[id];
    return `<span class="chip">${fx.name}<button data-rm="${id}">×</button></span>`;
  }).join('');
  drawer.classList.toggle('on', picked.size > 0);
}

document.getElementById('dChips').addEventListener('click', e => {
  const b = e.target.closest('[data-rm]');
  if (!b) return;
  picked.delete(b.dataset.rm);
  savePicked();
  document.querySelectorAll('.card').forEach(c => {
    const on = picked.has(c.dataset.id);
    c.classList.toggle('picked', on);
    const pb = c.querySelector('[data-pick]');
    if (pb) pb.textContent = on ? '已选' : '选它';
  });
  renderDrawer();
});

document.getElementById('dClear').onclick = () => {
  picked.clear();
  savePicked();
  document.querySelectorAll('.card').forEach(c => {
    c.classList.remove('picked');
    const pb = c.querySelector('[data-pick]');
    if (pb) pb.textContent = '选它';
  });
  renderDrawer();
};

document.getElementById('dCopy').onclick = async () => {
  const lines = [
    '# WebUI 效果选型清单', '',
    `导出时间：${new Date().toLocaleString('zh-CN')}`,
    `共 ${picked.size} 个效果`, '',
    '| 分组 | 效果 | 场景位置 | 库/方案 | 依赖 |', '|---|---|---|---|---|'
  ];
  [...picked].forEach(id => {
    const fx = byId[id];
    lines.push(`| ${GROUP_MAP[fx.group].name} | ${fx.name} | ${(sceneFor(fx)?.places || []).join('、') || '待整理'} | ${fx.lib} | \`${fx.deps}\` |`);
  });
  lines.push('', '## 实战提醒');
  [...picked].forEach(id => {
    const fx = byId[id];
    lines.push(`- **${fx.name}**：${fx.note}`);
  });
  try {
    await navigator.clipboard.writeText(lines.join('\n'));
    const b = document.getElementById('dCopy');
    b.textContent = '已复制到剪贴板 ✓';
    setTimeout(() => b.textContent = '导出选型清单', 1600);
  } catch {}
};

renderDrawer();

/* ---------- 搜索与场景筛选 ---------- */
document.getElementById('cnt').textContent = `${EFFECTS.length} 个效果 / ${GROUPS.length} 组`;
document.getElementById('subCount').textContent = `按效果意图选型 · ${EFFECTS.length} 个已验证机制`;
const filtersEl = document.getElementById('filters');
const taggedCount = EFFECTS.filter(sceneFor).length;
filtersEl.innerHTML = dimensions.map(([key, label]) => {
  const values = [...new Set(EFFECTS.flatMap(fx => sceneFor(fx)?.[key] || []))].sort((a, b) => a.localeCompare(b, 'zh-CN'));
  return `<label>${label}<select data-filter="${key}"><option value="">全部${label}</option>${values.map(value => `<option value="${value}">${value}</option>`).join('')}</select></label>`;
}).join('');
function applyFilters() {
  const q = document.getElementById('q').value.trim().toLowerCase();
  const selections = [...filtersEl.querySelectorAll('select')].filter(select => select.value);
  let count = 0;
  document.querySelectorAll('.card').forEach(c => {
    const fx = byId[c.dataset.id];
    const scenes = sceneFor(fx);
    const text = [fx.name, fx.lib, fx.desc, fx.group, GROUP_MAP[fx.group].name, fx.deps, ...dimensions.flatMap(([key]) => scenes?.[key] || [])].join(' ').toLowerCase();
    const hit = (!q || text.includes(q)) && selections.every(select => scenes?.[select.dataset.filter]?.includes(select.value));
    c.style.display = hit ? '' : 'none';
    if (hit) count++;
  });
  document.querySelectorAll('section.group').forEach(s => {
    const any = [...s.querySelectorAll('.card')].some(c => c.style.display !== 'none');
    s.style.display = any ? '' : 'none';
  });
  document.getElementById('filterStatus').textContent = `显示 ${count} / ${EFFECTS.length} 个效果 · ${taggedCount} 个已整理场景标签`;
  document.getElementById('empty').hidden = count !== 0;
}
function resetFilters() {
  document.getElementById('q').value = '';
  filtersEl.querySelectorAll('select').forEach(select => { select.value = ''; });
  applyFilters();
}
filtersEl.addEventListener('change', applyFilters);
document.getElementById('q').addEventListener('input', applyFilters);
document.getElementById('resetFilters').addEventListener('click', resetFilters);
document.getElementById('emptyReset').addEventListener('click', resetFilters);
applyFilters();

/* ---------- 深链：#效应id 直接开弹窗，方便发给别人 ---------- */
if (location.hash) {
  const id = location.hash.slice(1);
  if (byId[id]) openModal(id);
}

/* ---------- 卸载清理 ---------- */
window.addEventListener('beforeunload', () => running.forEach(d => typeof d === 'function' && d()));
