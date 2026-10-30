export default {
  id: 'scrub-number', group: 'feedback', name: '像素计步拖拽数值',
  lib: 'ProUI',
  desc: '专业软件的数字输入：在数值上横向拖拽改数，每 4px 计一步；关键是"从按下那一刻的像素统算步数"，不是逐帧累加——拖回按下处，旧数值精确复原。Shift 五倍速、Alt 五分之一速，双击可直接键入。机制提炼自 ProUI（pro-ui.dev）公开文档描述的 pro-number-input 行为，原生 JS 独立实现。',
  note: '最大的坑是逐帧累加（value += dx/4）：浮点误差会一路漂移，拖回来数值回不到原点，用户看到的是"松手后数字自己跳了一下"。正解是记录按下像素和按下时的值，每帧用 startVal + steps*step 统算，数学上严格可逆。第二个坑：拖拽期间必须 setPointerCapture 并 preventDefault，否则鼠标滑出控件边界事件就断了，数值卡在半路。第三个坑：步长和像素的比值（4px/步）决定手感——太小像搓不动，太大一甩就飞，改之前先想想用户调的量级。',
  scenes: { places: ['检查器', '表单', '工具栏'], goals: ['操作反馈', '效率'], triggers: ['拖拽', '键盘'], projects: ['专业工具', '编辑器', '桌面应用'] },
  code: `/* 像素计步拖拽数值（提炼自 pro-ui.dev 公开文档，vanilla 复刻） */
/* 核心：从按下像素统算，不逐帧累加 —— 拖回原处数值精确复原 */
let startPx = null, startVal = 0;
const SPEED = 4;                       /* 4px 一步 */
const step = 0.01;

field.addEventListener('pointerdown', e => {
  startPx = e.clientX; startVal = value;
  field.setPointerCapture(e.pointerId);  /* 坑②：出界不断事件 */
  e.preventDefault();
});
field.addEventListener('pointermove', e => {
  if (startPx === null) return;
  const mult = e.shiftKey ? 5 : e.altKey ? 0.2 : 1;
  /* 坑①：统算而非累加，浮点误差不累积 */
  const steps = Math.round((e.clientX - startPx) / SPEED);
  value = startVal + steps * step * mult;
  render();
});
field.addEventListener('pointerup',   () => startPx = null);
field.addEventListener('pointercancel', () => startPx = null);`,

  init(el) {
    const STYLE = `<style data-fx="scrub-number">
      .sn{width:100%;box-sizing:border-box;background:#2b2b2b;padding:16px;
        font-family:system-ui,-apple-system,"Segoe UI",sans-serif;color:#d8d8d8}
      .sn-panel{background:#414141;border-radius:8px;padding:16px 18px;display:flex;flex-direction:column;gap:10px}
      .sn-row{display:flex;align-items:center;justify-content:space-between;gap:14px}
      .sn-lb{font-size:12px;color:#b9b9b9}
      .sn-f{display:flex;align-items:center;gap:6px}
      .sn-v{font:500 12px/1 ui-monospace,Menlo,Consolas,monospace;font-variant-numeric:tabular-nums;
        background:rgba(0,0,0,.28);border-radius:5px;padding:6px 10px;min-width:74px;text-align:right;
        color:#fff;cursor:ew-resize;user-select:none;touch-action:none;
        box-shadow:inset 0 0 0 1px rgba(0,0,0,.35),inset 0 1px 0 rgba(255,255,255,.12)}
      .sn-v:hover{background:rgba(0,0,0,.36)}
      .sn-v.scrubbing{color:#8fd0ff;box-shadow:inset 0 0 0 1px rgba(60,203,255,.5),inset 0 1px 0 rgba(255,255,255,.12)}
      .sn-v input{width:58px;background:transparent;border:0;outline:0;color:#fff;text-align:right;
        font:inherit;font-variant-numeric:tabular-nums}
      .sn-u{font-size:10.5px;color:#818181;width:16px}
      .sn-hint{font-size:10.5px;color:#8a8a8a;line-height:1.7;margin-top:12px}
      .sn-badge{display:inline-block;font-size:10px;color:#7a7a7a;background:rgba(255,255,255,.07);
        border-radius:4px;padding:2px 6px;margin-left:8px}
    </style>`;
    el.insertAdjacentHTML('beforeend', STYLE + `
      <div class="sn">
        <div class="sn-panel">
          <div class="sn-row"><span class="sn-lb">曝光</span><span class="sn-f"><span class="sn-v" data-min="-2" data-max="2" data-step="0.01" data-val="0.35" tabindex="0">0.35</span><span class="sn-u">EV</span></span></div>
          <div class="sn-row"><span class="sn-lb">对比度</span><span class="sn-f"><span class="sn-v" data-min="-100" data-max="100" data-step="1" data-val="8" tabindex="0">+8</span><span class="sn-u"></span></span></div>
          <div class="sn-row"><span class="sn-lb">缩放</span><span class="sn-f"><span class="sn-v" data-min="10" data-max="640" data-step="1" data-val="100" tabindex="0">100</span><span class="sn-u">%</span></span></div>
        </div>
        <div class="sn-hint">横向拖拽数字：4px 一步，拖回松手处数值精确复原（统算不累加）。Shift 加速 5×，Alt 减速 1/5，双击改为键入，方向键 ±1 步。</div>
      </div>`);

    const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
    const fields = el.querySelectorAll('.sn-v');
    const cleanups = [];

    for (const f of fields) {
      const min = +f.dataset.min, max = +f.dataset.max, step = +f.dataset.step;
      let val = +f.dataset.val;
      let startPx = null, startVal = 0, raf = 0, pending = null;

      const fmt = (v) => {
        if (step >= 1) return (v > 0 ? '+' : '') + Math.round(v);
        return v.toFixed(2);
      };
      const paint = () => { f.firstChild.nodeValue = fmt(val); };
      paint();

      const applyDrag = (e) => {
        const steps = Math.round((e.clientX - startPx) / 4);   /* 统算核心 */
        const mult = e.shiftKey ? 5 : e.altKey ? 0.2 : 1;
        val = clamp(startVal + steps * step * mult, min, max);
        if (!raf) raf = requestAnimationFrame(() => { raf = 0; paint(); });
      };

      const onDown = (e) => {
        if (e.detail >= 2 || f.querySelector('input')) return;  /* 双击走键入 */
        startPx = e.clientX; startVal = val;
        f.classList.add('scrubbing');
        f.setPointerCapture(e.pointerId);
        e.preventDefault();
      };
      const onMove = (e) => { if (startPx !== null) { pending = e; applyDrag(pending); } };
      const onUp = (e) => {
        if (startPx === null) return;
        startPx = null;
        f.classList.remove('scrubbing');
        try { f.releasePointerCapture(e.pointerId); } catch (_) {}
      };
      const onDbl = () => {
        const inp = document.createElement('input');
        inp.value = fmt(val);
        f.textContent = '';
        f.appendChild(inp);
        inp.focus(); inp.select();
        const done = (commit) => {
          if (commit) {
            const n = parseFloat(inp.value.replace(/[+,%]/g, ''));
            if (!isNaN(n)) val = clamp(n, min, max);
          }
          f.textContent = fmt(val);
        };
        inp.addEventListener('keydown', (ev) => {
          ev.stopPropagation();
          if (ev.key === 'Enter') done(true);
          if (ev.key === 'Escape') done(false);
        });
        inp.addEventListener('blur', () => done(true));
      };
      const onKey = (e) => {
        if (e.key === 'ArrowUp' || e.key === 'ArrowRight') { val = clamp(val + step, min, max); paint(); e.preventDefault(); }
        if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') { val = clamp(val - step, min, max); paint(); e.preventDefault(); }
      };

      f.addEventListener('pointerdown', onDown);
      f.addEventListener('pointermove', onMove);
      f.addEventListener('pointerup', onUp);
      f.addEventListener('pointercancel', onUp);
      f.addEventListener('dblclick', onDbl);
      f.addEventListener('keydown', onKey);
      cleanups.push(() => {
        cancelAnimationFrame(raf);
        f.removeEventListener('pointerdown', onDown);
        f.removeEventListener('pointermove', onMove);
        f.removeEventListener('pointerup', onUp);
        f.removeEventListener('pointercancel', onUp);
        f.removeEventListener('dblclick', onDbl);
        f.removeEventListener('keydown', onKey);
      });
    }

    return () => { for (const c of cleanups) c(); el.innerHTML = ''; };
  }
};
