export default {
  id: 'release-no-flash', group: 'feedback', name: '松手不闪按压态',
  lib: 'ProUI',
  desc: '切换按钮按下后松手会闪一下——浏览器在提交点击状态前提前一帧丢掉 :active，按压填充和"已激活"填充之间露出一帧底色。解法是松手后把按压填充再按住一帧，跨过那个空窗再交给新状态。机制提炼自 ProUI（pro-ui.dev）公开文档描述的切换按钮无闪烁处理，原生 JS/CSS 独立实现。',
  note: '根源不是动画问题而是浏览器时序问题：pointerup 先于 click 触发，:active 在 pointerup 那一刻就没了，而 aria-pressed/class 要等 click 才翻转——中间必空一帧，加 transition 只会把这个空窗拉长成可见的"闪"。解法是在 pointerup 时手动给元素挂 held 类（把按压填充留住），等 click 提交状态后再摘。第二个坑：不要用 setTimeout(0) 摘 held——0ms 回调仍在同一帧内，必须等至少一个 rAF（或 requestPostAnimationFrame）确保新状态已经绘制。第三个坑：pointercancel 和鼠标移出控件再松手（lostpointercapture）也要摘 held，否则按钮会卡在按压态。',
  scenes: { places: ['工具栏', '面板', '表单'], goals: ['操作反馈', '风格统一'], triggers: ['点击'], projects: ['专业工具', '桌面应用', '编辑器'] },
  code: `/* 松手不闪按压态（提炼自 pro-ui.dev 公开文档，vanilla 复刻） */
/* 坑①：pointerup 先于 click，:active 当场就没了，状态翻转要等 click —— 必空一帧 */
btn.addEventListener('pointerup', () => {
  btn.classList.add('held');        /* 手动留住按压填充，跨过空窗 */
});
btn.addEventListener('click', () => {
  pressed = !pressed;               /* 提交新状态 */
  btn.setAttribute('aria-pressed', pressed);
  /* 坑②：必须等新状态画完再摘 held —— setTimeout(0) 仍在同一帧，要用 rAF */
  requestAnimationFrame(() =>
    requestAnimationFrame(() => btn.classList.remove('held')));
});
/* 坑③：cancel / 掠夺捕获丢失也要摘，否则卡在按压态 */
btn.addEventListener('pointercancel', drop);
btn.addEventListener('lostpointercapture', drop);`,

  init(el) {
    const STYLE = `<style data-fx="release-no-flash">
      .rf{width:100%;box-sizing:border-box;background:#2b2b2b;padding:16px;
        font-family:system-ui,-apple-system,"Segoe UI",sans-serif;color:#d8d8d8}
      .rf-panel{background:#414141;border-radius:8px;padding:18px 20px;display:flex;flex-direction:column;gap:16px}
      .rf-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
      .rf-cap{font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:#9a9a9a;width:100%}
      .rf-btn{position:relative;height:30px;padding:0 14px;border:0;border-radius:5px;cursor:pointer;
        font:500 12px/1 system-ui,sans-serif;color:#e8e8e8;
        background:rgba(255,255,255,.15);
        box-shadow:inset 0 1px 0 rgba(255,255,255,.35),inset 0 0 0 1px rgba(0,0,0,.35);
        transition:background .12s ease-out;user-select:none;touch-action:none}
      .rf-btn:hover{background:rgba(255,255,255,.19)}
      /* 按压填充：held 类把它留住跨过松手空窗 */
      .rf-btn:active,.rf-btn.held{background:rgba(255,255,255,.28)}
      /* 已激活：实色，与按压填充同族亮度——交棒时看不出换人 */
      .rf-btn[aria-pressed="true"]{background:#5F3BFF;color:#fff;
        box-shadow:inset 0 1px 0 rgba(255,255,255,.4),inset 0 0 0 1px rgba(0,0,0,.4)}
      .rf-btn[aria-pressed="true"]:active,.rf-btn[aria-pressed="true"].held{background:#7355ff}
      /* 对照组：不加 held，松手闪一帧底色 */
      .rf-naive:active,.rf-naive.held{background:rgba(255,255,255,.28)}
      .rf-dot{width:8px;height:8px;border-radius:50%;background:#5a5a5a;transition:background .12s}
      .rf-dot.on{background:#6ee29a}
      .rf-hint{font-size:10.5px;color:#8a8a8a;line-height:1.8;margin-top:14px}
      .rf-count{font:500 11px/1 ui-monospace,Menlo,Consolas,monospace;color:#7a7a7a;
        background:rgba(255,255,255,.06);border-radius:4px;padding:4px 8px;margin-left:auto}
    </style>`;
    el.insertAdjacentHTML('beforeend', STYLE + `
      <div class="rf">
        <div class="rf-panel">
          <div class="rf-row"><span class="rf-cap">修复版：held 类跨过松手空窗（连点观察）</span>
            <button class="rf-btn" data-fixed aria-pressed="false">网格吸附</button>
            <button class="rf-btn" data-fixed aria-pressed="false">像素预览</button>
            <span class="rf-dot" data-dot></span><span class="rf-dot" data-dot2></span>
            <span class="rf-count" data-n>0 次切换</span>
          </div>
          <div class="rf-row"><span class="rf-cap">对照组（裸 :active）：松手瞬间闪一帧底色</span>
            <button class="rf-btn" data-naive aria-pressed="false">网格吸附</button>
            <button class="rf-btn" data-naive aria-pressed="false">像素预览</button>
          </div>
        </div>
        <div class="rf-hint">快速连点两组按钮对比：上面切换时颜色连续（按压填充 → 激活实色平滑交棒），下面每次松手都会闪一下底色——那是浏览器提前一帧丢 :active 留下的空窗。</div>
      </div>`);

    const nEl = el.querySelector('[data-n]');
    const dot1 = el.querySelector('[data-dot]');
    const dot2 = el.querySelector('[data-dot2]');
    let count = 0;
    const cleanups = [];

    const wire = (btn, fixed, idx) => {
      let pressed = btn.getAttribute('aria-pressed') === 'true';
      const dropHeld = () => btn.classList.remove('held');

      const onUp = () => { if (fixed) btn.classList.add('held'); };
      const onClick = () => {
        pressed = !pressed;
        btn.setAttribute('aria-pressed', String(pressed));
        if (fixed) {
          /* 双 rAF：等新状态真正画完再摘 held（setTimeout(0) 仍同帧，坑②） */
          requestAnimationFrame(() =>
            requestAnimationFrame(dropHeld));
        }
        if (!btn.hasAttribute('data-naive')) {
          count++;
          nEl.textContent = count + ' 次切换';
          (idx === 0 ? dot1 : dot2).classList.toggle('on', pressed);
        }
      };
      const onCancel = dropHeld;
      const onLost = dropHeld;

      btn.addEventListener('pointerup', onUp);
      btn.addEventListener('click', onClick);
      btn.addEventListener('pointercancel', onCancel);
      btn.addEventListener('lostpointercapture', onLost);
      cleanups.push(() => {
        btn.removeEventListener('pointerup', onUp);
        btn.removeEventListener('click', onClick);
        btn.removeEventListener('pointercancel', onCancel);
        btn.removeEventListener('lostpointercapture', onLost);
      });
    };

    el.querySelectorAll('[data-fixed]').forEach((b, i) => wire(b, true, i));
    el.querySelectorAll('[data-naive]').forEach((b) => wire(b, false, 0));

    return () => { for (const c of cleanups) c(); el.innerHTML = ''; };
  }
};
