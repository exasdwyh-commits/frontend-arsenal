export default {
  id: 'knob-gesture', group: 'feedback', name: '旋钮读手势',
  lib: 'ProUI',
  desc: '专业音频软件的旋钮不强迫用户转圈：横向拖是线性增量（精确、可长距离），绕着旋钮拖是方位角跟随（直观、快调）——拖到一半可以自由换法，光标相对旋钮的位置自动选交互模式。机制提炼自 ProUI（pro-ui.dev）公开文档描述的 pro-knob 手势逻辑，原生 JS 独立实现。',
  note: '两个坑：① 模式判定必须在 pointerdown 当场读光标位置然后锁死，不能每帧重判——绕圈拖的过程中光标会周期性穿过旋钮正下方，每帧重判会让数值在线性/方位之间疯狂抖动；② 方位角读数跨过 -180°/180° 边界时要处理环绕：用累积差值（atan2 差归一化到 ±180 再累加）而不是直接相减，否则过 12 点方向会突然跳一整圈。第三个细节：两种模式的手感增益不同（线性 1px 一步、方位角 2° 一步），混用一套增益会一边灵敏一边迟钝。',
  scenes: { places: ['面板', '工具栏', '检查器'], goals: ['操作反馈', '效率'], triggers: ['拖拽'], projects: ['音频软件', '专业工具', '桌面应用'] },
  code: `/* 旋钮读手势（提炼自 pro-ui.dev 公开文档，vanilla 复刻） */
/* 坑①：down 当场读光标位置定模式，此后锁死，绝不每帧重判 */
let mode = null, startVal = 0, lastAngle = 0, accumAngle = 0;
knob.addEventListener('pointerdown', e => {
  const r = knob.getBoundingClientRect();
  const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
  mode = Math.hypot(e.clientX - cx, e.clientY - cy) > r.width / 2 ? 'bearing' : 'linear';
  startVal = value; lastAngle = Math.atan2(e.clientY - cy, e.clientX - cx);
  accumAngle = 0;
  knob.setPointerCapture(e.pointerId);
});
knob.addEventListener('pointermove', e => {
  if (!mode) return;
  if (mode === 'linear') {
    value = startVal + (e.clientX - startPx) * 1;      /* 线性：横向增量 */
  } else {
    /* 坑②：方位角累积差，跨 -180/180 边界不跳圈 */
    const ang = Math.atan2(e.clientY - cy, e.clientX - cx);
    let d = ang - lastAngle;
    if (d > Math.PI) d -= 2 * Math.PI; else if (d < -Math.PI) d += 2 * Math.PI;
    accumAngle += d * 180 / Math.PI;
    value = startVal + accumAngle * 0.15;             /* 方位角跟随 */
    lastAngle = ang;
  }
});
/* 坑③：两模式手感应各配增益（1px 一步 / 2° 一步），混用会一灵一钝 */`,

  init(el) {
    const STYLE = `<style data-fx="knob-gesture">
      .kg{width:100%;box-sizing:border-box;background:#2b2b2b;padding:16px;
        font-family:system-ui,-apple-system,"Segoe UI",sans-serif;color:#d8d8d8;
        display:flex;flex-direction:column;align-items:center;gap:12px}
      .kg-wrap{background:#414141;border-radius:8px;padding:22px 30px;display:flex;gap:26px;align-items:flex-end}
      .kg-unit{display:flex;flex-direction:column;align-items:center;gap:10px}
      .kg-knob{position:relative;width:74px;height:74px;border-radius:50%;cursor:grab;touch-action:none;
        background:radial-gradient(circle at 50% 32%,rgba(255,255,255,.22),rgba(255,255,255,.10) 60%,rgba(0,0,0,.14));
        box-shadow:inset 0 1px 0 rgba(255,255,255,.3),inset 0 0 0 1px rgba(0,0,0,.4),0 1px 2px rgba(0,0,0,.3)}
      .kg-knob:active{cursor:grabbing}
      .kg-knob.drag-lin{box-shadow:inset 0 1px 0 rgba(255,255,255,.3),inset 0 0 0 1px rgba(0,0,0,.4),0 0 0 3px rgba(122,184,255,.5)}
      .kg-knob.drag-bear{box-shadow:inset 0 1px 0 rgba(255,255,255,.3),inset 0 0 0 1px rgba(0,0,0,.4),0 0 0 3px rgba(255,170,80,.55)}
      .kg-arc{position:absolute;inset:-7px;pointer-events:none}
      .kg-arc circle{fill:none;stroke-width:3;stroke-linecap:round;transform:rotate(-135deg);transform-origin:50% 50%}
      .kg-track{stroke:rgba(0,0,0,.32)}
      .kg-fill{stroke:#7ab8ff;transition:stroke .2s}
      .kg-knob.drag-bear~.kg-arc .kg-fill{stroke:#ffaa50}
      .kg-pt{position:absolute;left:50%;top:8px;width:5px;height:14px;margin-left:-2.5px;border-radius:3px;
        background:#e9e9e9;transform-origin:50% 29px}
      .kg-lb{font-size:11px;color:#b6b6b6}
      .kg-v{font:500 12px/1 ui-monospace,Menlo,Consolas,monospace;font-variant-numeric:tabular-nums;
        background:rgba(0,0,0,.26);border-radius:4px;padding:4px 8px;color:#fff}
      .kg-mode{font-size:10px;letter-spacing:.04em;border-radius:4px;padding:3px 8px;
        background:rgba(255,255,255,.08);color:#9a9a9a;transition:all .15s}
      .kg-mode.lin{background:rgba(122,184,255,.18);color:#8fc2ff}
      .kg-mode.bear{background:rgba(255,170,80,.2);color:#ffc08a}
      .kg-hint{font-size:10.5px;color:#8a8a8a;line-height:1.7;text-align:center;max-width:400px}
    </style>`;
    const ARC = 2 * Math.PI * 40 * 0.75;
    el.insertAdjacentHTML('beforeend', STYLE + `
      <div class="kg">
        <div class="kg-wrap" id="kgWrap"></div>
        <div class="kg-hint">按住拖：从旋钮<b>外侧</b>起手＝方位角跟随（绕圈转，黄色环），从<b>中心</b>起手＝线性增量（横拖，蓝色环）。拖到一半可以自由换法——模式在按下那一刻定死。</div>
      </div>`);

    const wrap = el.querySelector('#kgWrap');
    const PARAMS = [
      { lb: '音量', min: -60, max: 6, val: -8, unit: 'dB', digits: 1 },
      { lb: '声像', min: -100, max: 100, val: 0, unit: '', digits: 0 },
      { lb: '共振', min: 0, max: 100, val: 38, unit: '%', digits: 0 },
    ];

    const knobs = [];
    let uid = 0;
    for (const p of PARAMS) {
      const id = 'kga' + (++uid);
      const unit = document.createElement('div');
      unit.className = 'kg-unit';
      unit.innerHTML = `
        <div class="kg-knob" tabindex="0" role="slider" aria-label="${p.lb}">
          <svg class="kg-arc" viewBox="0 0 88 88">
            <circle class="kg-track" cx="44" cy="44" r="40" stroke-dasharray="${ARC} 999"/>
            <circle class="kg-fill" id="${id}" cx="44" cy="44" r="40" stroke-dasharray="0 999"/>
          </svg>
          <div class="kg-pt"></div>
        </div>
        <div class="kg-v" id="${id}v">0</div>
        <div style="display:flex;align-items:center;gap:6px">
          <span class="kg-lb">${p.lb}</span><span class="kg-mode" id="${id}m">待机</span>
        </div>`;
      wrap.appendChild(unit);

      const knobEl = unit.querySelector('.kg-knob');
      const fill = unit.querySelector('#' + id);
      const pt = unit.querySelector('.kg-pt');
      const valEl = unit.querySelector('#' + id + 'v');
      const modeEl = unit.querySelector('#' + id + 'm');

      let val = p.val, mode = null, startVal = 0, startPx = 0, lastAng = 0, accum = 0;

      const paint = () => {
        const t = (val - p.min) / (p.max - p.min);
        fill.setAttribute('stroke-dasharray', (ARC * t).toFixed(1) + ' 999');
        pt.style.transform = 'rotate(' + (-135 + 270 * t).toFixed(1) + 'deg)';
        valEl.textContent = p.digits ? val.toFixed(p.digits) : Math.round(val);
      };
      paint();

      const setMode = (m) => {
        mode = m;
        knobEl.classList.toggle('drag-lin', m === 'linear');
        knobEl.classList.toggle('drag-bear', m === 'bearing');
        modeEl.className = 'kg-mode' + (m ? (m === 'linear' ? ' lin' : ' bear') : '');
        modeEl.textContent = m === 'linear' ? '线性' : m === 'bearing' ? '方位角' : '待机';
      };

      const clamp = (v) => Math.min(p.max, Math.max(p.min, v));
      let raf = 0, pend = null;

      const apply = (e) => {
        if (!raf) raf = requestAnimationFrame(() => {
          raf = 0;
          if (mode === 'linear') {
            val = clamp(startVal + (pend.clientX - startPx) * (p.max - p.min) / 240);
          } else {
            const r = knobEl.getBoundingClientRect();
            const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
            const ang = Math.atan2(pend.clientY - cy, pend.clientX - cx);
            let d = ang - lastAng;
            if (d > Math.PI) d -= 2 * Math.PI; else if (d < -Math.PI) d += 2 * Math.PI;
            accum += d * 180 / Math.PI;
            val = clamp(startVal + accum * 0.12);
            lastAng = ang;
          }
          paint();
        });
      };

      const onDown = (e) => {
        const r = knobEl.getBoundingClientRect();
        const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        /* 模式当场定死，此后不再重判（坑①） */
        setMode(Math.hypot(e.clientX - cx, e.clientY - cy) > r.width / 2 ? 'bearing' : 'linear');
        startVal = val; startPx = e.clientX; accum = 0;
        lastAng = Math.atan2(e.clientY - cy, e.clientX - cx);
        knobEl.setPointerCapture(e.pointerId);
        e.preventDefault();
      };
      const onMove = (e) => { if (mode) { pend = e; apply(e); } };
      const onUp = (e) => {
        if (!mode) return;
        setMode(null);
        cancelAnimationFrame(raf); raf = 0;
        try { knobEl.releasePointerCapture(e.pointerId); } catch (_) {}
      };
      const onKey = (e) => {
        const s = (p.max - p.min) / 40;
        if (e.key === 'ArrowUp' || e.key === 'ArrowRight') { val = clamp(val + s); paint(); e.preventDefault(); }
        if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') { val = clamp(val - s); paint(); e.preventDefault(); }
      };

      knobEl.addEventListener('pointerdown', onDown);
      knobEl.addEventListener('pointermove', onMove);
      knobEl.addEventListener('pointerup', onUp);
      knobEl.addEventListener('pointercancel', onUp);
      knobEl.addEventListener('keydown', onKey);
      knobs.push(() => {
        cancelAnimationFrame(raf);
        knobEl.removeEventListener('pointerdown', onDown);
        knobEl.removeEventListener('pointermove', onMove);
        knobEl.removeEventListener('pointerup', onUp);
        knobEl.removeEventListener('pointercancel', onUp);
        knobEl.removeEventListener('keydown', onKey);
      });
    }

    return () => { for (const c of knobs) c(); el.innerHTML = ''; };
  }
};
