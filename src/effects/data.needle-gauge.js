export default {
  id: 'needle-gauge', group: 'data', name: '满弧扫针自检', lib: 'SVG + 原生 JS',
  desc: '三个仪表指针错峰从 0 甩满全弧，再带阻尼回落到各自真实值、落定同帧数字弹出，像系统上电自检。移植自 video-shotcraft 的 Needle Sweep Selftest（Apache-2.0）。',
  deps: '无',
  note: '去程要"甩满全弧"（270°）再回真实值，形成落过头回摆——回程用按超调量反算的阻尼比 ζ = -ln p / √(π²+ln²p)（p=8°/行程），这样不同表的回程时间常数自动匹配、速度无折点。指针高速甩动时叠 3-4 个按角速度递减透明度的"拖影针"做角向运动模糊，停住即消失。刻度在去程扫过时依次点亮再回落（先亮量程）。表盘角度 d→SVG 角 135+d（0=右下起、跨 270°），large-arc-flag 要按 d1-d0>180 判断。',
  code: `/* 表盘角 d∈[0,270] → SVG 角 a=135+d（0=右，顺时针） */
polar = (a,r) => [CX + r*cos(a), CY + r*sin(a)];
arcPath(d0,d1,r) = 'M x0 y0 A r r 0 large x1 y1';   // large = d1-d0>180 ? 1 : 0

/* 去程甩满全弧（12f ease-out）→ 回程阻尼弹簧落真实值 */
function needle(f, s, target){
  if (f <= s)       return 0;
  if (f <= s+12)    return 270 * (1-(1-(f-s)/12)^3);   // 甩满
  if (f >= s+46)    return target;                       // 锁死
  return mix(270, target, spring(f-(s+12), stiffness, dampingFor(target)));
}
/* 阻尼比按超调 8° 反算：不同表回程一致 */
p = min(.5, 8/(270-target));
zeta = -ln(p)/sqrt(PI²+ln²p);
damping = 2*zeta*sqrt(stiffness);

/* 拖影：角速度 >4°/帧时叠 ghost 针 */
if (|d - dPrev| > 4) ghosts = [1..4].map(g => needle(d - dv*g/4, .16*(1-g/5)));`,
  init(el) {
    const STYLE = '<style data-fx="needle-gauge">' +
      '.ng{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:4px;font-family:system-ui,sans-serif}' +
      '.ng-row{display:flex;gap:6px;width:100%;justify-content:center;align-items:flex-end}' +
      '.ng-g{position:relative;width:78px;text-align:center}' +
      '.ng-val{font-size:15px;font-weight:700;color:#f3f4f7;letter-spacing:-.03em;opacity:0;transform:scale(.4);' +
        'font-variant-numeric:tabular-nums;transition:none}' +
      '.ng-val span{font-size:9px;color:#737885;margin-left:1px}' +
      '.ng-name{font-size:7px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:#737885;opacity:0;margin-top:2px}' +
      '.ng-cap{font-size:8px;color:#5a6070;letter-spacing:.1em;text-transform:uppercase;margin-top:2px}' +
      '</style>';

    const GAUGES = [
      { start: 8, target: 190, name: 'CPU' },
      { start: 12, target: 120, name: 'GPU' },
      { start: 16, target: 235, name: 'NET' }
    ];
    const CX = 46, CY = 54, R = 34;
    const polar = (a, r) => [CX + r * Math.cos(a * Math.PI / 180), CY + r * Math.sin(a * Math.PI / 180)];
    const arcPath = (d0, d1, r) => {
      const [x0, y0] = polar(135 + d0, r);
      const [x1, y1] = polar(135 + Math.max(d0 + 0.01, d1), r);
      const large = d1 - d0 > 180 ? 1 : 0;
      return 'M ' + x0.toFixed(1) + ' ' + y0.toFixed(1) + ' A ' + r + ' ' + r + ' 0 ' + large + ' 1 ' + x1.toFixed(1) + ' ' + y1.toFixed(1);
    };

    // 刻度
    const ticks = k => {
      let s = '';
      for (let i = 0; i <= 30; i++) {
        const dd = i * 9, major = i % 3 === 0, a = 135 + dd;
        const [x0, y0] = polar(a, R - 3);
        const [x1, y1] = polar(a, R - (major ? 10 : 6));
        s += '<line data-t="' + dd + '" x1="' + x0.toFixed(1) + '" y1="' + y0.toFixed(1) + '" x2="' + x1.toFixed(1) + '" y2="' + y1.toFixed(1) +
          '" stroke="' + (dd >= 225 ? '#ef4444' : '#fff') + '" stroke-width="' + (major ? 1.4 : 0.8) + '" stroke-opacity="' + (dd >= 225 ? 0.55 : 0.22) + '"/>';
      }
      return s;
    };

    const gauge = (g, k) =>
      '<div class="ng-g">' +
        '<svg width="92" height="80" viewBox="0 0 92 80" style="overflow:visible">' +
          '<path d="' + arcPath(0, 270, R) + '" fill="none" stroke="#fff" stroke-opacity=".08" stroke-width="4" stroke-linecap="round"/>' +
          '<path d="' + arcPath(225, 270, R) + '" fill="none" stroke="#ef4444" stroke-opacity=".45" stroke-width="4" stroke-linecap="round"/>' +
          '<path class="ng-lit" d="" fill="none" stroke="#f59e0b" stroke-width="4" stroke-linecap="round" stroke-opacity="0"/>' +
          ticks(k) +
          '<g class="ng-ghosts"></g>' +
          '<path class="ng-ndl" d="" fill="url(#ngN)" transform=""/>' +
          '<circle cx="' + CX + '" cy="' + CY + '" r="7" fill="#1c1d23" stroke="#fff" stroke-opacity=".12"/>' +
          '<circle cx="' + CX + '" cy="' + CY + '" r="2.4" fill="#f59e0b"/>' +
          '<defs><linearGradient id="ngN" x1="0" y1="0" x2="1" y2="0">' +
            '<stop offset="0" stop-color="#b45309"/><stop offset=".6" stop-color="#f59e0b"/><stop offset="1" stop-color="#fcd34d"/>' +
          '</linearGradient></defs>' +
        '</svg>' +
        '<div class="ng-val" data-k="' + k + '">0<span>%</span></div>' +
        '<div class="ng-name" data-k="' + k + '">' + g.name + '</div>' +
      '</div>';

    let gs = '';
    GAUGES.forEach((g, k) => gs += gauge(g, k));

    el.insertAdjacentHTML('beforeend', STYLE +
      '<div class="ng"><div class="ng-row">' + gs + '</div><div class="ng-cap">上电自检 · 甩满再回落</div></div>');

    const clamp01 = x => x < 0 ? 0 : x > 1 ? 1 : x;
    const mix = (a, b, t) => a + (b - a) * t;
    const STIFF = 120;
    const dampingFor = target => {
      const p = Math.min(0.5, 8 / (270 - target));
      const lp = Math.log(p);
      const zeta = -lp / Math.sqrt(Math.PI * Math.PI + lp * lp);
      return 2 * zeta * Math.sqrt(STIFF);
    };
    // 阻尼弹簧解析近似（欠阻尼单摆衰减）
    const springK = (u, zeta, wn) => {
      if (u <= 0) return 0;
      const wd = wn * Math.sqrt(Math.max(0.0001, 1 - zeta * zeta));
      return 1 - Math.exp(-zeta * wn * u) * (Math.cos(wd * u) + (zeta * wn / wd) * Math.sin(wd * u));
    };
    const needleAngle = (f, s, target) => {
      if (f <= s) return 0;
      if (f <= s + 12) return 270 * (1 - Math.pow(1 - (f - s) / 12, 3));
      if (f >= s + 46) return target;
      const zeta = dampingFor(target) / (2 * Math.sqrt(STIFF));
      const wn = Math.sqrt(STIFF);
      return mix(270, target, springK(f - (s + 12), zeta, wn));
    };

    const gEls = [...el.querySelectorAll('.ng-g')];
    const DUR = 100;
    let raf, start = 0;
    const tick = now => {
      if (!start) start = now;
      const f = ((now - start) / 1000 * 30) % (DUR + 10);

      GAUGES.forEach((g, k) => {
        const d = needleAngle(f, g.start, g.target);
        const dPrev = needleAngle(f - 0.5, g.start, g.target);
        const wrap = gEls[k];
        const ndl = wrap.querySelector('.ng-ndl');
        const lit = wrap.querySelector('.ng-lit');
        const ghosts = wrap.querySelector('.ng-ghosts');
        const val = wrap.querySelector('.ng-val');
        const name = wrap.querySelector('.ng-name');

        // 指针：局部沿 +x，整体 rotate(135+d)
        const needle = (deg, op, cls) => {
          const [tx, ty] = polar(135, R - 4);
          const len = Math.hypot(tx - CX, ty - CY);
          return '<path' + (cls ? ' class="' + cls + '"' : '') + ' d="M ' + (CX - 10) + ' ' + (CY - 1.8) + ' L ' + (CX + len) + ' ' + (CY - 0.6) +
            ' L ' + (CX + len + 1.5) + ' ' + CY + ' L ' + (CX + len) + ' ' + (CY + 0.6) + ' L ' + (CX - 10) + ' ' + (CY + 1.8) +
            ' Z" fill="url(#ngN)" opacity="' + op.toFixed(2) + '" transform="rotate(' + (135 + deg).toFixed(2) + ' ' + CX + ' ' + CY + ')"/>';
        };
        ndl.outerHTML = needle(d, 1, 'ng-ndl'); // 替换后保留 class，下一帧还能查到

        // 拖影
        const dv = d - dPrev;
        if (Math.abs(dv) > 4) {
          let gh = '';
          for (let gg = 1; gg <= 4; gg++) gh += needle(d - dv * gg / 4, 0.16 * (1 - gg / 5));
          ghosts.innerHTML = gh;
        } else ghosts.innerHTML = '';

        // 跟随指针的琥珀亮弧
        if (d > 0.5) { lit.setAttribute('d', arcPath(0, d, R)); lit.setAttribute('stroke-opacity', '0.5'); }
        else lit.setAttribute('stroke-opacity', '0');

        // 刻度扫过点亮
        const swept = f <= g.start + 12 ? d : 270;
        const calm = clamp01((f - (g.start + 12)) / 24);
        wrap.querySelectorAll('line').forEach(ln => {
          const dd = +ln.dataset.t;
          const base = dd >= 225 ? 0.55 : 0.22;
          const litT = swept >= dd - 0.5 ? 1 - calm : 0;
          ln.setAttribute('stroke-opacity', (base + (dd >= 225 ? 0.4 : 0.6) * litT).toFixed(3));
        });

        // 落定弹数字
        const settle = g.start + 32;
        const pop = clamp01((f - settle) / 9);
        const popBack = 1 + 1.5 * Math.pow(pop - 1, 3) + 1.5 * Math.pow(pop - 1, 2);
        const popOp = clamp01((f - settle) / 4);
        const nameOp = clamp01((f - (settle + 3)) / 10);
        val.style.opacity = popOp.toFixed(3);
        val.style.transform = 'scale(' + (0.4 + 0.6 * popBack).toFixed(3) + ')';
        val.firstChild.textContent = Math.round(g.target / 270 * 100);
        name.style.opacity = nameOp.toFixed(3);
      });

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => { cancelAnimationFrame(raf); el.innerHTML = ''; };
  }
};
