export default {
  id: 'donut-ring', group: 'data', name: '环形进度', lib: 'SVG',
  desc: 'SVG 圆环描边生长，做完成度/达标率最直观。',
  deps: '无',
  note: 'stroke-dasharray 设为周长，stroke-dashoffset 从周长动画到目标值。旋转 -90° 是因为 SVG 圆从 3 点钟方向开始画，不转的话进度条从右边起。',
  code: `<circle r="42" cx="50" cy="50"
  fill="none" stroke="#5F3BFF" stroke-width="8"
  stroke-dasharray="263.9"          /* 2πr */
  stroke-dashoffset="263.9"
  transform="rotate(-90 50 50)"      /* 从 12 点开始 */
  style="transition: stroke-dashoffset 1.2s cubic-bezier(.16,1,.3,1)" />`,
  init(el) {
    const R = 42, C = 2 * Math.PI * R;
    el.innerHTML = `<div style="position:relative;width:110px;height:110px">
      <svg viewBox="0 0 100 100" style="width:100%;height:100%">
        <circle cx="50" cy="50" r="${R}" fill="none" stroke="#242a38" stroke-width="8"/>
        <circle id="ring" cx="50" cy="50" r="${R}" fill="none" stroke="url(#gg)"
          stroke-width="8" stroke-linecap="round"
          stroke-dasharray="${C}" stroke-dashoffset="${C}"
          transform="rotate(-90 50 50)"
          style="transition:stroke-dashoffset 1.2s cubic-bezier(.16,1,.3,1)"/>
        <defs><linearGradient id="gg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#5F3BFF"/><stop offset="1" stop-color="#3CCBFF"/>
        </linearGradient></defs>
      </svg>
      <div id="pct" style="position:absolute;inset:0;display:flex;align-items:center;
        justify-content:center;font-size:19px;font-weight:700;color:#e8ecf4;
        font-variant-numeric:tabular-nums">0%</div>
    </div>`;
    const ring = el.querySelector('#ring'), pct = el.querySelector('#pct');
    let timer;
    const run = () => {
      ring.style.transition = 'none';
      ring.style.strokeDashoffset = C;
      pct.textContent = '0%';
      requestAnimationFrame(() => {
        ring.style.transition = 'stroke-dashoffset 1.2s cubic-bezier(.16,1,.3,1)';
        ring.style.strokeDashoffset = C * (1 - .78);
        let n = 0;
        const iv = setInterval(() => { n += 3; pct.textContent = Math.min(n, 78) + '%';
          if (n >= 78) clearInterval(iv); }, 42);
      });
    };
    setTimeout(run, 150);
    timer = setInterval(run, 2600);
    return () => clearInterval(timer);
  }
};
