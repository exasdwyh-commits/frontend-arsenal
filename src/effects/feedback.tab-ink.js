export default {
  id: 'tab-ink', group: 'feedback', name: '标签滑动底板', lib: '原生 JS',
  desc: '选中态是一块底板，切换时从旧标签滑到新标签，而不是各标签自己改底色。',
  deps: '无',
  note: '三个坑：① 首次定位必须无过渡（否则首屏从左上角滑进来）；② 必须用 ResizeObserver 监听，换行/窗口变宽都要跟着走；③ 没量到选中项时要退回按钮底色，不能留个悬空底板。',
  code: `// JS 只量位置、写 CSS 变量，动画交给 CSS 过渡
list.style.setProperty('--ink-x', tab.offsetLeft + 'px');
list.style.setProperty('--ink-y', tab.offsetTop + 'px');
list.style.setProperty('--ink-w', tab.offsetWidth + 'px');
list.style.setProperty('--ink-h', tab.offsetHeight + 'px');
if (!list.dataset.ink) {                 // 首帧不播过渡
  list.dataset.ink = 'placed';
  requestAnimationFrame(() => (list.dataset.ink = 'ready'));
}

/* CSS */
.tabs::before{
  content:''; position:absolute; left:0; top:0;
  width: var(--ink-w, 0px); height: var(--ink-h, 0px);
  transform: translate(var(--ink-x,0), var(--ink-y,0));
  border-radius:7px; background:var(--surface); z-index:-1;
}
.tabs[data-ink="ready"]::before{ transition: transform .22s cubic-bezier(.22,1,.36,1); }`,
  init(el) {
    el.innerHTML = `<div id="tabs" style="position:relative;display:inline-flex;gap:4px;
      padding:4px;background:#0a0c11;border:1px solid #242a38;border-radius:10px;isolation:isolate">
      ${['每日简报', '提醒', '高级'].map((t, i) =>
        `<button role="tab" aria-selected="${i === 0}" style="position:relative;min-height:34px;
        padding:7px 14px;border:0;border-radius:7px;background:transparent;color:#8892a6;
        font:inherit;font-size:12px;cursor:pointer">${t}</button>`).join('')}
    </div>`;
    const list = el.querySelector('#tabs');
    const btns = [...list.querySelectorAll('button')];
    const st = document.createElement('style');
    st.textContent = `#tabs::before{content:'';position:absolute;left:0;top:0;width:var(--ink-w,0);
      height:var(--ink-h,0);transform:translate(var(--ink-x,0),var(--ink-y,0));
      background:#1c2130;border-radius:7px;box-shadow:0 2px 8px rgba(0,0,0,.4);
      z-index:-1;pointer-events:none}
      #tabs[data-ink="ready"]::before{transition:transform .28s cubic-bezier(.22,1,.36,1)}
      #tabs button[aria-selected="true"]{color:#e8ecf4;font-weight:550}
      #tabs[data-ink] button[aria-selected="true"]{background:transparent}`;
    el.appendChild(st);

    const place = () => {
      const tab = list.querySelector('[aria-selected="true"]');
      if (!tab || !tab.offsetWidth) { delete list.dataset.ink; return; }
      list.style.setProperty('--ink-x', tab.offsetLeft + 'px');
      list.style.setProperty('--ink-y', tab.offsetTop + 'px');
      list.style.setProperty('--ink-w', tab.offsetWidth + 'px');
      list.style.setProperty('--ink-h', tab.offsetHeight + 'px');
      if (!list.dataset.ink) {
        list.dataset.ink = 'placed';
        requestAnimationFrame(() => { if (list.dataset.ink === 'placed') list.dataset.ink = 'ready'; });
      }
    };
    place();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(place) : null;
    ro?.observe(list);
    btns.forEach(b => ro?.observe(b));

    let idx = 0, timer;
    const cl = e => {
      const b = e.target.closest('button');
      if (!b) return;
      btns.forEach(x => x.setAttribute('aria-selected', 'false'));
      b.setAttribute('aria-selected', 'true');
      idx = btns.indexOf(b);
      place();
    };
    list.addEventListener('click', cl);
    timer = setInterval(() => {
      btns.forEach(x => x.setAttribute('aria-selected', 'false'));
      idx = (idx + 1) % btns.length;
      btns[idx].setAttribute('aria-selected', 'true');
      place();
    }, 1900);
    return () => {
      clearInterval(timer);
      list.removeEventListener('click', cl);
      ro?.disconnect();
      st.remove();
    };
  }
};
