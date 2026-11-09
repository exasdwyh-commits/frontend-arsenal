export default {
  id: 'reduced-motion-tiers', group: 'entrance', name: '减少动效分档',
  lib: 'Astryx',
  desc: '系统要求"减少动效"时不是删动画，而是分三档处理：正常档全量动效；减少档下粗指针（触屏）只做 ≤200ms 纯淡入淡出、细指针（鼠标/键盘）立即变化；在位数值与悬停/选中颜色任何档都立即生效。机制提炼自 Astryx（meta/astryx，Meta 开源设计系统）公开文档 reduced-motion.md 的 DR1–DR3 规则，原生 JS/CSS 独立实现，带档位模拟开关。',
  note: '三个坑：① 只写 @media (prefers-reduced-motion: reduce) 不够——产品常要求页内也有"减少动效"开关，两份来源叠加时要取最严档（页内开关能开也能关系统档，判定必须合并成一个状态）；② JS 驱动的动画（rAF/WAAPI/弹簧库）CSS 媒体查询管不到，必须用 matchMedia 监听同一偏好再改 JS 参数，两套动画驱动共用一个开关，漏一边就出现"CSS 静了 JS 还在弹"；③ 减少 ≠ 删除：位移/缩放/弹簧全部去掉，但状态变化必须保留可见反馈——触屏 ≤200ms 淡变、细指针立即变、在位数值直接改，全砍成瞬变用户会以为没点上。',

  scenes: { places: ['官网', '设置页', '面板'], goals: ['风格统一', '操作反馈'], triggers: ['点击', '滚动'], projects: ['通用', '设计系统', '移动端'] },
  code: `/* 减少动效分档（提炼自 meta/astryx reduced-motion.md DR1–DR3，vanilla 复刻） */
/* 坑①：系统媒体查询 + 页内开关，两份来源取最严档 */
const mqReduce = matchMedia('(prefers-reduced-motion: reduce)');
const mqCoarse = matchMedia('(pointer: coarse)');
const reduced = () => mqReduce.matches || pageSwitchOn;   // 任一为真即减少

/* 坑②：CSS 管不到 JS 动画——matchMedia 同一开关同步给 rAF/弹簧参数 */
const applyTier = () => {
  const r = reduced();
  const coarse = mqCoarse.matches || simulateCoarse;
  if (!r)            setAnim({ dur: 420, travel: 'translateY(14px) scale(.96)', spring: 180 });
  else if (coarse)   setAnim({ dur: 200, travel: 'none', spring: 0 });   // DR2：纯淡变 ≤200ms
  else               setAnim({ dur: 0,   travel: 'none', spring: 0 });   // DR3：立即变化
};
mqReduce.addEventListener('change', applyTier);
mqCoarse.addEventListener('change', applyTier);

/* 坑③：在位数值/悬停颜色不属过渡，任何档立即生效——别把它们也做成动画 */
/* <span class="count">42</span> → 文本直接改，无 transition */`,

  init(el) {
    const STYLE = `<style data-fx="reduced-motion-tiers">
      .rm{width:100%;box-sizing:border-box;background:#2b2b2b;padding:16px;
        font-family:system-ui,-apple-system,"Segoe UI",sans-serif;color:#d8d8d8}
      .rm-bar{display:flex;align-items:center;gap:14px;flex-wrap:wrap;margin-bottom:12px}
      .rm-grp{display:flex;align-items:center;gap:7px}
      .rm-lb{font-size:10px;letter-spacing:.06em;text-transform:uppercase;color:#9a9a9a}
      .rm-seg{display:flex;border-radius:5px;overflow:hidden;box-shadow:inset 0 0 0 1px rgba(0,0,0,.35)}
      .rm-seg button{border:0;padding:5px 10px;font:500 11px/1 system-ui,sans-serif;cursor:pointer;
        background:rgba(255,255,255,.12);color:#c9c9c9}
      .rm-seg button.on{background:#5F3BFF;color:#fff}
      .rm-stat{margin-left:auto;font:500 10.5px/1.5 ui-monospace,Menlo,Consolas,monospace;color:#8f8f8f;
        background:rgba(0,0,0,.22);border-radius:5px;padding:5px 9px}
      .rm-stat b{color:#e8e8e8;font-weight:500}
      .rm-stage{background:#414141;border-radius:8px;padding:14px}
      .rm-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(96px,1fr));gap:9px;min-height:150px}
      .rm-card{position:relative;background:#5a5a5a;border-radius:6px;padding:9px;font-size:10.5px;color:#e8e8e8;
        box-shadow:inset 0 1px 0 rgba(255,255,255,.16),0 2px 5px rgba(0,0,0,.3);
        display:flex;flex-direction:column;justify-content:space-between;min-height:64px;
        transition:background .15s ease-out}   /* 悬停颜色任何档立即生效（DR3） */
      .rm-card:hover{background:#6a6a6a}
      .rm-card .n{font:600 15px/1 ui-monospace,Menlo,Consolas,monospace}   /* 在位数值直接改 */
      .rm-card .x{position:absolute;top:5px;right:6px;font-size:9px;color:#b0b0b0;cursor:pointer}
      /* 动效参数全部走 CSS 变量，JS 只改变量 */
      .rm-anim{animation:rmIn var(--rm-dur,420ms) var(--rm-ease,cubic-bezier(.2,.9,.3,1.15)) both;
        animation-name:rmIn;--rm-travel:translateY(14px) scale(.96)}
      @keyframes rmIn{from{opacity:0;transform:var(--rm-travel,translateY(14px) scale(.96))}to{opacity:1;transform:none}}
      .rm-anim{animation-duration:var(--rm-dur,420ms)}
      .rm-row{display:flex;gap:9px;margin-top:11px;flex-wrap:wrap}
      .rm-btn{height:27px;padding:0 12px;border:0;border-radius:5px;cursor:pointer;
        font:500 11.5px/1 system-ui,sans-serif;background:rgba(255,255,255,.15);color:#e8e8e8;
        box-shadow:inset 0 1px 0 rgba(255,255,255,.3),inset 0 0 0 1px rgba(0,0,0,.35)}
      .rm-btn:hover{background:rgba(255,255,255,.2)}
      .rm-count{font:500 11px/1 ui-monospace,Menlo,Consolas,monospace;color:#6ee29a}
      .rm-hint{font-size:10.5px;color:#8a8a8a;line-height:1.8;margin-top:11px}
    </style>`;
    el.insertAdjacentHTML('beforeend', STYLE + `
      <div class="rm">
        <div class="rm-bar">
          <span class="rm-grp"><span class="rm-lb">偏好</span>
            <span class="rm-seg" data-pref>
              <button class="on" data-v="system">系统</button>
              <button data-v="reduce">减少</button>
              <button data-v="full">正常</button>
            </span></span>
          <span class="rm-grp"><span class="rm-lb">指针</span>
            <span class="rm-seg" data-ptr>
              <button class="on" data-v="auto">自动</button>
              <button data-v="coarse">粗(触屏)</button>
              <button data-v="fine">细(鼠标)</button>
            </span></span>
          <span class="rm-stat" data-stat>—</span>
        </div>
        <div class="rm-stage">
          <div class="rm-cards" data-cards></div>
          <div class="rm-row">
            <button class="rm-btn" data-add>+ 加卡片</button>
            <button class="rm-btn" data-del>− 减卡片</button>
            <span class="rm-count" data-count>0 张 · 点击计数立即跳变</span>
          </div>
        </div>
        <div class="rm-hint">切到"减少"档再点加减：正常档卡片弹簧落位；减少档下粗指针只做 200ms 淡变、细指针立即出现——但计数文本与悬停高亮任何档都是瞬间生效（DR3 例外）。</div>
      </div>`);

    const cards = el.querySelector('[data-cards]');
    const count = el.querySelector('[data-count]');
    const stat = el.querySelector('[data-stat]');
    const mqReduce = matchMedia('(prefers-reduced-motion: reduce)');
    const mqCoarse = matchMedia('(pointer: coarse)');
    let pref = 'system', ptr = 'auto', n = 0, uid = 0;
    const cleanups = [];

    const tier = () => {
      const r = pref === 'reduce' || (pref === 'system' && mqReduce.matches);
      const coarse = ptr === 'coarse' || (ptr === 'auto' && mqCoarse.matches);
      return { r, coarse };
    };
    const applyTier = () => {
      const { r, coarse } = tier();
      const root = el.querySelector('.rm');
      // 坑①：CSS 变量驱动样式动画；坑②：同一判定同步 JS（本例动画走 CSS，JS 只读状态展示）
      if (!r) {
        root.style.setProperty('--rm-dur', '420ms');
        root.style.setProperty('--rm-travel', 'translateY(14px) scale(.96)');
      } else if (coarse) {
        root.style.setProperty('--rm-dur', '200ms');       // DR2：≤200ms 纯淡变
        root.style.setProperty('--rm-travel', 'none');
      } else {
        root.style.setProperty('--rm-dur', '0ms');         // DR3：立即变化
        root.style.setProperty('--rm-travel', 'none');
      }
      stat.innerHTML = '档位 <b>' + (r ? (coarse ? '减少·粗指针 → 200ms 淡变' : '减少·细指针 → 立即') :
        '正常 → 420ms 弹簧落位') + '</b>';
    };

    const render = (entering) => {
      cards.innerHTML = '';
      for (let i = 0; i < n; i++) {
        const c = document.createElement('div');
        c.className = 'rm-card' + (entering && entering === i ? ' rm-anim' : '');
        c.innerHTML = '<span class="x">×</span><span class="n">' + (i + 1) + '</span><span>卡片</span>';
        c.querySelector('.x').addEventListener('click', () => { n = Math.max(0, n - 1); render(); upd(); });
        cards.appendChild(c);
      }
    };
    const upd = () => { count.textContent = n + ' 张 · 点击计数立即跳变'; };   // 在位数值：任何档直接改

    el.querySelector('[data-add]').addEventListener('click', () => {
      const i = n; n = Math.min(8, n + 1); render(i); upd();
    });
    el.querySelector('[data-del]').addEventListener('click', () => {
      n = Math.max(0, n - 1); render(); upd();
    });

    const wireSeg = (sel, fn) => {
      const seg = el.querySelector(sel);
      const onClick = (e) => {
        const b = e.target.closest('button'); if (!b) return;
        for (const x of seg.children) x.classList.toggle('on', x === b);
        fn(b.dataset.v); applyTier();
      };
      seg.addEventListener('click', onClick);
      cleanups.push(() => seg.removeEventListener('click', onClick));
    };
    wireSeg('[data-pref]', (v) => { pref = v; });
    wireSeg('[data-ptr]', (v) => { ptr = v; });

    const onSys = () => applyTier();
    mqReduce.addEventListener('change', onSys);
    mqCoarse.addEventListener('change', onSys);
    cleanups.push(() => { mqReduce.removeEventListener('change', onSys); mqCoarse.removeEventListener('change', onSys); });

    n = 3; render(); upd(); applyTier();
    return () => { for (const c of cleanups) c(); el.innerHTML = ''; };
  }
};
