export default {
  id: 'slider-inset', group: 'feedback', name: '滑轨减宽度滑块',
  lib: 'ProUI',
  desc: '滑块的滑轨宽度减去 thumb 自身宽度：这样 thumb 中心滑到轨道最左端时正好压满最小值，不会有一小截 thumb 露在轨道外面、数值也到不了真正的 min。机制提炼自 ProUI（pro-ui.dev）公开文档描述的 pro-slider 几何处理，原生 CSS/JS 独立实现。',
  note: '核心坑是坐标系错配：轨道是按 0–100% 填满算位置，thumb 却是有物理宽度的实体，两端各会多出半个 thumb。正解是给轨道容器留出 inset（padding 左右各 thumb/2，或 track 宽度 = 容器宽 − thumb 宽），位置计算再走 inset 内的百分比。第二个坑：拖拽时用 getBoundingClientRect 换算 pointer 位置，容器若带 transform 缩放，rect 是缩放后的布局坐标，必须除以缩放比还原，否则拖起来数值和光标对不上。第三个坑：:active 态给 thumb 放大时要把 transform-origin 钉在中心并接受 overflow，放大态 thumb 越界是正常的物理溢出，不要为了不溢出而缩小可拖区。',
  scenes: { places: ['检查器', '表单', '面板'], goals: ['操作反馈', '效率'], triggers: ['拖拽', '点击'], projects: ['专业工具', '编辑器', '桌面应用'] },
  code: `/* 滑轨减宽度滑块（提炼自 pro-ui.dev 公开文档，vanilla 复刻） */
/* 坑①：轨道只铺容器内 inset 区——宽度 = 容器 − thumb 宽，两端不露头 */
.slider { position:relative; height:20px; padding:0 10px; /* 10px = thumb/2 */
  box-sizing:border-box; display:flex; align-items:center; }
.slider-track { position:relative; width:100%; height:4px; border-radius:2px;
  background:rgba(0,0,0,.35); }
.slider-thumb { position:absolute; top:50%; width:20px; height:20px; margin-left:-10px;
  border-radius:50%; background:#fff; transform:translateY(-50%); cursor:grab; }
/* 位置百分比只在 inset 后的 track 里算，left: t*100% 就是真实值 */
thumb.style.left = (t * 100) + '%';

/* 坑②：pointer 位置换算要走 track 的 rect，不要用容器的 */
const r = track.getBoundingClientRect();
let t = (e.clientX - r.left) / r.width;
t = Math.min(1, Math.max(0, t));

/* 坑③：:active 放大 thumb 属于物理溢出，不要为不溢出缩小可拖区 */`,

  init(el) {
    const STYLE = `<style data-fx="slider-inset">
      .si{width:100%;box-sizing:border-box;background:#2b2b2b;padding:16px;
        font-family:system-ui,-apple-system,"Segoe UI",sans-serif;color:#d8d8d8}
      .si-panel{background:#414141;border-radius:8px;padding:16px 18px;display:flex;flex-direction:column;gap:14px}
      .si-row{display:flex;align-items:center;gap:12px}
      .si-lb{font-size:11.5px;color:#b6b6b6;width:58px;flex:none}
      .si-slot{flex:1;min-width:0}
      .si-v{font:500 11.5px/1 ui-monospace,Menlo,Consolas,monospace;font-variant-numeric:tabular-nums;
        background:rgba(0,0,0,.26);border-radius:4px;padding:5px 8px;color:#fff;width:52px;text-align:right;flex:none}
      .si-slider{position:relative;height:20px;padding:0 10px;box-sizing:border-box;display:flex;align-items:center;
        cursor:pointer;touch-action:none;outline-offset:3px}
      .si-track{position:relative;width:100%;height:4px;border-radius:2px;background:rgba(0,0,0,.35);
        box-shadow:inset 0 1px 0 rgba(0,0,0,.3),inset 0 0 0 1px rgba(0,0,0,.25)}
      .si-fill{position:absolute;left:0;top:0;bottom:0;border-radius:2px;background:#7ab8ff}
      .si-thumb{position:absolute;top:50%;left:0;width:20px;height:20px;margin-left:-10px;margin-top:-10px;
        border-radius:50%;cursor:grab;
        background:radial-gradient(circle at 50% 30%,#fff,#dcdcdc);
        box-shadow:inset 0 0 0 1px rgba(0,0,0,.25),0 1px 2px rgba(0,0,0,.35);
        transition:transform .1s ease-out}
      .si-thumb:hover{transform:scale(1.08)}
      .si-slider:active .si-thumb{cursor:grabbing;transform:scale(1.18)}
      .si-cap{font-size:10.5px;color:#8a8a8a;line-height:1.8;margin-top:14px}
      .si-cap b{color:#a8a8a8;font-weight:600}
      .si-edge{position:absolute;top:0;bottom:0;width:1px;background:rgba(255,255,255,.14);pointer-events:none}
    </style>`;
    el.insertAdjacentHTML('beforeend', STYLE + `
      <div class="si">
        <div class="si-panel">
          <div class="si-row"><span class="si-lb">亮度</span><span class="si-slot"><span class="si-slider" data-min="0" data-max="100" data-val="62" data-u="%" tabindex="0"><span class="si-track"><span class="si-fill"></span><span class="si-thumb"></span></span></span></span><span class="si-v">62%</span></div>
          <div class="si-row"><span class="si-lb">对比度</span><span class="si-slot"><span class="si-slider" data-min="-50" data-max="50" data-val="-12" data-u="" tabindex="0"><span class="si-track"><span class="si-fill"></span><span class="si-thumb"></span></span></span></span><span class="si-v">-12</span></div>
          <div class="si-row"><span class="si-lb">饱和度</span><span class="si-slot"><span class="si-slider" data-min="0" data-max="200" data-val="100" data-u="%" tabindex="0"><span class="si-track"><span class="si-fill"></span><span class="si-thumb"></span></span></span></span><span class="si-v">100%</span></div>
        </div>
        <div class="si-cap">滑轨宽度减去 thumb 宽——thumb 中心压到最左端＝真 min、最右端＝真 max，两端不露头。<b>拖到头试试</b>，值正好落在边界上。</div>
      </div>`);

    const sliders = el.querySelectorAll('.si-slider');
    const rows = el.querySelectorAll('.si-row');
    const clean = [];

    sliders.forEach((sl, i) => {
      const track = sl.querySelector('.si-track');
      const fill = sl.querySelector('.si-fill');
      const thumb = sl.querySelector('.si-thumb');
      const valEl = rows[i].querySelector('.si-v');
      const min = +sl.dataset.min, max = +sl.dataset.max;
      const unit = sl.dataset.u || '';
      let val = +sl.dataset.val, dragging = false;

      const paint = () => {
        const t = (val - min) / (max - min);
        thumb.style.left = (t * 100) + '%';       /* inset 后 track 内的百分比 */
        fill.style.width = (t * 100) + '%';
        valEl.textContent = Math.round(val) + unit;
      };
      paint();

      /* 边界刻线：直观看到 min/max 落点 */
      const eL = document.createElement('span');
      eL.className = 'si-edge'; eL.style.left = '0';
      const eR = document.createElement('span');
      eR.className = 'si-edge'; eR.style.right = '0';
      sl.appendChild(eL); sl.appendChild(eR);

      const fromEvent = (e) => {
        const r = track.getBoundingClientRect();   /* 坑②：用 track 的 rect */
        let t = (e.clientX - r.left) / r.width;
        t = Math.min(1, Math.max(0, t));
        val = min + t * (max - min);
        paint();
      };
      const onDown = (e) => {
        dragging = true;
        sl.setPointerCapture(e.pointerId);
        fromEvent(e);
        e.preventDefault();
      };
      const onMove = (e) => { if (dragging) fromEvent(e); };
      const onUp = (e) => {
        dragging = false;
        try { sl.releasePointerCapture(e.pointerId); } catch (_) {}
      };
      const onKey = (e) => {
        const s = (max - min) / 100;
        if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { val = Math.min(max, val + s); paint(); e.preventDefault(); }
        if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { val = Math.max(min, val - s); paint(); e.preventDefault(); }
      };

      sl.addEventListener('pointerdown', onDown);
      sl.addEventListener('pointermove', onMove);
      sl.addEventListener('pointerup', onUp);
      sl.addEventListener('pointercancel', onUp);
      sl.addEventListener('keydown', onKey);
      clean.push(() => {
        sl.removeEventListener('pointerdown', onDown);
        sl.removeEventListener('pointermove', onMove);
        sl.removeEventListener('pointerup', onUp);
        sl.removeEventListener('pointercancel', onUp);
        sl.removeEventListener('keydown', onKey);
      });
    });

    return () => { for (const c of clean) c(); el.innerHTML = ''; };
  }
};
