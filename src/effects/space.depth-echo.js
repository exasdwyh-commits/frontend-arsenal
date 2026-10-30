export default {
  id: 'depth-echo', group: 'space', name: '克隆纵队', lib: '纯 CSS + 原生 JS',
  desc: '一张主卡向纵深「复印」出一列克隆体，越远越淡越虚只剩轮廓，停一拍再全体吸回合体。移植自 video-shotcraft 的 Cloner Depth Echo（Apache-2.0）。',
  deps: '无',
  note: '纵深靠真 3D 透视（perspective 放祖级），克隆体只做 translateZ 后退——透视会自动把它排向消失点并缩小，不用手写 scale。越远的克隆把填充褪掉、只留描边（WebkitTextStroke + color:transparent），读作 C4D Cloner 的线框回声。排开用弹簧错峰、吸回用全体同步强 ease-in（一个越走越快一个带过冲，对比才明显）。注意：opacity 只能挂叶子层，挂到 preserve-3d 容器会把整组拍平。',
  code: `/* 主卡 + 克隆纵队：只 translateZ 后退，透视自动缩小排布 */
<div style="perspective:1200px">
  <div style="transform-style:preserve-3d">
    <div class="card" style="transform:translate3d(dx,dy,-Z*idx)"></div>
  </div>
</div>

/* 越远越虚：填充褪掉、只留描边 */
.card.clone{ color:transparent; -webkit-text-stroke:1.5px #b8ff5e;
  opacity:1 - (idx/N)*0.72; filter:blur(idx/N*1.6px); }

/* 排开=弹簧错峰，吸回=同步强 ease-in */
spread = spring(f, SPREAD + (idx-1)*EACH, {damping:15});  // 每个晚 2.2f
merge  = ramp(f, MERGE, 10, easeIn);                       // 全体一起
depth  = spread * (1 - merge);                              // 0=本体,1=排开位`,
  init(el) {
    const STYLE = '<style data-fx="depth-echo">' +
      '.de{position:relative;width:100%;height:100%;perspective:900px;overflow:hidden;display:flex;align-items:center;justify-content:center}' +
      '.de-stage{position:relative;transform-style:preserve-3d;transform:translateX(46px) rotateY(-14deg) rotateX(6deg)}' +
      '.de-card{position:absolute;left:-60px;top:-40px;width:120px;height:80px;border-radius:10px;box-sizing:border-box;' +
        'background:linear-gradient(160deg,#20241a,#0f110c);border:1.5px solid rgba(255,255,255,.12);' +
        'padding:9px 11px;font-family:system-ui,sans-serif;color:#e8ecf4;will-change:transform,opacity}' +
      '.de-hero{z-index:5;box-shadow:0 18px 40px -14px rgba(0,0,0,.8)}' +
      '.de-clone{color:transparent;-webkit-text-stroke:1.5px #b8ff5e;background:linear-gradient(160deg,rgba(40,46,30,.85),rgba(18,22,14,.85));border-color:rgba(184,255,94,.85)}' +
      '.de-tag{display:inline-block;font-size:8px;font-weight:700;padding:2px 5px;border-radius:5px;background:#b8ff5e;color:#1a2010;font-family:ui-monospace,monospace}' +
      '.de-num{font-size:20px;font-weight:750;margin-top:6px;letter-spacing:-.04em}' +
      '.de-num small{font-size:10px;color:#8b93a8}' +
      '.de-line{margin-top:5px;height:16px}' +
      '.de-cap{position:absolute;bottom:8px;left:0;right:0;text-align:center;font-size:8px;color:#4a5368;letter-spacing:.1em;text-transform:uppercase}' +
      '</style>';

    const N = 5, GAP_Z = 52, SPREAD = 20, EACH = 3, MERGE = 90, MERGE_DUR = 10, LAND = MERGE + MERGE_DUR;

    // 折线
    const pts = [0.6, 0.55, 0.62, 0.48, 0.5, 0.4, 0.44, 0.32, 0.36, 0.28, 0.3, 0.22];
    let poly = pts.map((v, i) => ((i / (pts.length - 1)) * 100).toFixed(1) + ',' + (v * 16).toFixed(1)).join(' ');

    const card = (region, clone) =>
      '<div class="de-card ' + (clone === 0 ? 'de-hero' : 'de-clone') + '" data-clone="' + clone + '">' +
        '<span class="de-tag">' + region + '</span>' +
        '<div class="de-num">' + (clone === 0 ? '30<small>fps</small>' : '30') + '</div>' +
        '<svg class="de-line" viewBox="0 0 100 16" preserveAspectRatio="none"><polyline points="' + poly + '" fill="none" stroke="#b8ff5e" stroke-width="1.5" stroke-linejoin="round"/></svg>' +
      '</div>';

    let cards = card('S01', 0);
    for (let k = N; k >= 1; k--) cards += card('S0' + (k + 1), k);

    el.insertAdjacentHTML('beforeend', STYLE +
      '<div class="de"><div class="de-stage" id="deStage">' + cards + '</div>' +
      '<div class="de-cap">排开 → 停一拍 → 吸回合体</div></div>');

    const stage = el.querySelector('#deStage');
    const clones = [...el.querySelectorAll('.de-card')].filter(c => c.classList.contains('de-clone'));
    // 按 clone 值排序（DOM 里是从远到近，取 1..N）
    const byIdx = {}; clones.forEach(c => byIdx[+c.dataset.clone] = c);

    const clamp01 = x => x < 0 ? 0 : x > 1 ? 1 : x;
    const ramp = (f, s, d) => clamp01((f - s) / d);
    // 弹簧近似
    const spring = (f, s) => { const u = ramp(f, s, 12); return u >= 1 ? 1 : 1 - Math.exp(-6 * u) * Math.cos(u * 8); };
    const easeIn = u => u * u;

    const DUR = 130;
    let raf, start = 0;
    const tick = now => {
      if (!start) start = now;
      const f = ((now - start) / 1000 * 30) % (DUR + 10);

      const merge = easeIn(ramp(f, MERGE, MERGE_DUR));
      for (let idx = 1; idx <= N; idx++) {
        const c = byIdx[idx]; if (!c) continue;
        const sp = spring(f, SPREAD + (idx - 1) * EACH);
        const d = sp * (1 - merge);
        if (d <= 0.002) { c.style.opacity = '0'; continue; }
        const z = -GAP_Z * idx * d;
        const dx = -26 * idx * d;
        const dy = -3 * idx * d;
        const op = (1 - (idx / N) * 0.5) * clamp01(sp * 2.5) * (1 - merge * 0.4);
        // 速度拖影
        const v = Math.abs((spring(f + 0.5, SPREAD + (idx - 1) * EACH) * (1 - easeIn(ramp(f + 0.5, MERGE, MERGE_DUR)))) - d) * GAP_Z * idx;
        c.style.transform = 'translate3d(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px,' + z.toFixed(1) + 'px)';
        c.style.opacity = op.toFixed(3);
        c.style.filter = 'blur(' + (Math.min(4, v * 0.05) + (idx / N) * 0.7).toFixed(2) + 'px)';
      }

      // 合体：主卡脉冲 + 描边光
      const popT = clamp01((f - LAND) / 16);
      const pop = f >= LAND ? Math.sin(popT * Math.PI) * Math.pow(1 - popT, 0.6) : 0;
      const rim = f >= LAND ? Math.max(0, 1 - (f - LAND) / 14) : 0;
      const hero = el.querySelector('.de-hero');
      hero.style.transform = 'scale(' + (1 + 0.06 * pop).toFixed(4) + ')';
      hero.style.boxShadow = '0 18px 40px -14px rgba(0,0,0,.8), 0 0 ' + (20 * rim).toFixed(1) + 'px rgba(184,255,94,' + (0.5 * rim).toFixed(3) + ')';

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => { cancelAnimationFrame(raf); el.innerHTML = ''; };
  }
};
