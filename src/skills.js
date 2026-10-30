/* ============================================================
   skills.html —— 技能库（前端可用的 Skill 文档浏览）
   零依赖：内置迷你 Markdown 渲染器，技能文档以 .md 原样存于 skills/
   ============================================================ */
import { CATS, SKILLS } from './skills-data.js';

/* ---------- Markdown → HTML（够用子集，转义优先） ---------- */
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// 行内：先抽行内码保护，再处理粗体/斜体/链接/图片
function inline(raw) {
  const stash = [];
  let s = raw.replace(/`([^`]+)`/g, (_, c) => {
    // 先转义再入栈：行内码常含 <q-form> 之类标签，不转义会被浏览器当元素吃掉
    stash.push('<code>' + esc(c) + '</code>');
    return '\u0000' + (stash.length - 1) + '\u0000';
  });
  s = esc(s);
  s = s.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img alt="$1" src="$2" style="max-width:100%;border-radius:8px">');
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/(^|[\s(])\*([^*\n]+)\*/g, '$1<em>$2</em>');
  s = s.replace(/\u0000(\d+)\u0000/g, (_, i) => stash[+i]);
  return s;
}

function md2html(md) {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  let html = '', i = 0;
  const listStack = []; // 记录当前开着的 ul/ol

  const closeList = depth => {
    while (listStack.length && listStack.length > depth) {
      html += '</' + listStack.pop() + '>';
    }
  };

  while (i < lines.length) {
    let ln = lines[i];

    // 代码块
    const fence = ln.match(/^```(\w*)/);
    if (fence) {
      closeList(0);
      const lang = fence[1];
      const buf = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) { buf.push(lines[i]); i++; }
      i++; // 跳过收尾 ```
      html += '<pre><code' + (lang ? ' data-lang="' + lang + '"' : '') + '>' + esc(buf.join('\n')) + '</code></pre>';
      continue;
    }

    // 空行
    if (/^\s*$/.test(ln)) { closeList(0); i++; continue; }

    // 分隔线
    if (/^\s*([-*_])\s*\1\s*\1[\s\S]*$/.test(ln) && /^[\s\-*_]+$/.test(ln)) {
      closeList(0); html += '<hr>'; i++; continue;
    }

    // 标题
    const h = ln.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      closeList(0);
      const lv = h[1].length;
      html += '<h' + lv + '>' + inline(h[2].replace(/\s*#+\s*$/, '')) + '</h' + lv + '>';
      i++; continue;
    }

    // 表格（| 开头且下一行为分隔行）
    if (/^\s*\|/.test(ln) && i + 1 < lines.length && /^\s*\|[\s:|-]+\|\s*$/.test(lines[i + 1])) {
      closeList(0);
      const cells = l => l.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim());
      const head = cells(ln);
      i += 2;
      html += '<table><thead><tr>' + head.map(c => '<th>' + inline(c) + '</th>').join('') + '</tr></thead><tbody>';
      while (i < lines.length && /^\s*\|/.test(lines[i])) {
        html += '<tr>' + cells(lines[i]).map(c => '<td>' + inline(c) + '</td>').join('') + '</tr>';
        i++;
      }
      html += '</tbody></table>';
      continue;
    }

    // 引用
    if (/^\s*>\s?/.test(ln)) {
      closeList(0);
      const buf = [];
      while (i < lines.length && /^\s*>\s?/.test(lines[i])) { buf.push(lines[i].replace(/^\s*>\s?/, '')); i++; }
      html += '<blockquote>' + buf.map(b => '<p>' + inline(b) + '</p>').join('') + '</blockquote>';
      continue;
    }

    // 列表（- * + 或数字.）
    const li = ln.match(/^(\s*)(?:([-*+])|(\d+)[.)])\s+(.*)$/);
    if (li) {
      const indent = li[1].length;
      const depth = Math.floor(indent / 2) + 1;
      const type = li[2] ? 'ul' : 'ol';
      // 关掉更深和同层不同类型的
      while (listStack.length > depth) html += '</' + listStack.pop() + '>';
      if (listStack.length === depth && listStack[depth - 1] !== type) { html += '</' + listStack.pop() + '>'; }
      while (listStack.length < depth) { html += '<' + type + '>'; listStack.push(type); }
      html += '<li>' + inline(li[4]) + '</li>';
      i++; continue;
    }

    // 普通段落（连续非空行合并）
    closeList(0);
    const buf = [];
    while (i < lines.length && !/^\s*$/.test(lines[i]) && !/^(#{1,6})\s/.test(lines[i]) &&
           !/^```/.test(lines[i]) && !/^\s*>\s?/.test(lines[i]) && !/^\s*\|/.test(lines[i]) &&
           !/^(\s*)(?:([-*+])|(\d+)[.)])\s+/.test(lines[i])) {
      buf.push(lines[i]); i++;
    }
    if (buf.length) html += '<p>' + buf.map(inline).join('<br>') + '</p>';
  }
  closeList(0);
  return html;
}

/* ---------- 剥掉 frontmatter（--- 块），单独返回说明 ---------- */
function stripFrontmatter(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return { note: '', body: raw };
  const fm = m[1];
  const d = fm.match(/description:\s*"([^"]*)/);
  return { note: d ? d[1].replace(/\\n/g, ' ') : '', body: raw.slice(m[0].length) };
}

/* ---------- 状态 ---------- */
let activeCat = 'all';
let query = '';
const rawCache = new Map();

const $ = s => document.querySelector(s);
const grid = $('#skillGrid');
const countEl = $('#skillCount');
const emptyEl = $('#skillEmpty');
const navEl = $('#skillNav');

function match(s) {
  if (activeCat !== 'all' && s.cat !== activeCat) return false;
  if (!query) return true;
  const q = query.toLowerCase();
  return (s.name + ' ' + s.zh + ' ' + s.desc + ' ' + s.id).toLowerCase().includes(q);
}

function renderNav() {
  const cats = [['all', '全部技能']].concat(Object.entries(CATS));
  navEl.innerHTML = cats.map(([k, label]) => {
    const n = k === 'all' ? SKILLS.length : SKILLS.filter(s => s.cat === k).length;
    return '<button data-cat="' + k + '"' + (k === activeCat ? ' class="on"' : '') + '>' +
      '<span>' + label + '</span><em>' + n + '</em></button>';
  }).join('');
}

function renderGrid() {
  const list = SKILLS.filter(match);
  countEl.textContent = '显示 ' + list.length + ' / ' + SKILLS.length + ' 个技能';
  emptyEl.hidden = list.length > 0;
  grid.innerHTML = list.map(s =>
    '<article class="skill-card" data-id="' + s.id + '" tabindex="0">' +
      '<span class="tag">' + CATS[s.cat] + '</span>' +
      '<h3>' + s.name + '</h3>' +
      '<p class="zh">' + s.zh + '</p>' +
      '<p>' + (s.desc || '—') + '</p>' +
      '<div class="meta"><span>' + s.id + '.md</span><span>' + Math.max(1, Math.round(s.bytes / 1024)) + ' KB</span></div>' +
    '</article>').join('');
}

/* ---------- 阅读弹层 ---------- */
const modal = $('#skillModal');
const cacheRaw = id => {
  if (!rawCache.has(id)) {
    return fetch('skills/' + id + '.md').then(r => r.text()).then(t => { rawCache.set(id, t); return t; });
  }
  return Promise.resolve(rawCache.get(id));
};

function openSkill(id) {
  const meta = SKILLS.find(s => s.id === id);
  if (!meta) return;
  $('#smTitle').textContent = meta.name;
  $('#smSub').textContent = meta.zh + ' · ' + CATS[meta.cat];
  $('#smRaw').href = 'skills/' + id + '.md';
  $('#smCopy').dataset.id = id;
  const body = $('#smBody');
  body.innerHTML = '<p style="color:#8892a6;padding:20px 0">加载中…</p>';
  modal.classList.add('on');
  document.body.style.overflow = 'hidden';

  cacheRaw(id).then(raw => {
    const { note, body: md } = stripFrontmatter(raw);
    body.innerHTML = '<div class="md">' +
      (note ? '<p class="fm-note">skill 描述：' + note + '</p>' : '') +
      md2html(md) + '</div>';
    body.scrollTop = 0;
    rawCache.set(id, raw);
  }).catch(e => {
    body.innerHTML = '<p style="color:#f66">加载失败：' + e.message + '</p>';
  });
}

function closeModal() {
  modal.classList.remove('on');
  document.body.style.overflow = '';
}

/* ---------- 事件 ---------- */
navEl.addEventListener('click', e => {
  const b = e.target.closest('button[data-cat]');
  if (!b) return;
  activeCat = b.dataset.cat;
  renderNav(); renderGrid();
});

$('#skillSearch').addEventListener('input', e => { query = e.target.value.trim(); renderGrid(); });

grid.addEventListener('click', e => {
  const c = e.target.closest('.skill-card');
  if (c) openSkill(c.dataset.id);
});
grid.addEventListener('keydown', e => {
  if (e.key === 'Enter') { const c = e.target.closest('.skill-card'); if (c) openSkill(c.dataset.id); }
});

$('#smClose').addEventListener('click', closeModal);
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && modal.classList.contains('on')) closeModal(); });

$('#smCopy').addEventListener('click', function () {
  const id = this.dataset.id;
  cacheRaw(id).then(raw => {
    navigator.clipboard.writeText(raw).then(() => {
      const t = this.textContent; this.textContent = '已复制 ✓';
      setTimeout(() => this.textContent = t, 1400);
    });
  });
});

renderNav();
renderGrid();

/* 深链：skills.html?skill=frontend-design 直接打开某个技能 */
const deepLink = new URLSearchParams(location.search).get('skill');
if (deepLink && SKILLS.some(s => s.id === deepLink)) openSkill(deepLink);
