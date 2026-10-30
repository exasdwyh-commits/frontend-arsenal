export default {
  id: 'radial-wave', group: 'particle', name: '点阵涟漪', lib: '原生 JS',
  desc: '一片圆点阵列被一道从中心向外的波逐个点亮，波前过后留下常亮，第二道波再反向收拢。移植自 video-shotcraft 的 Radial Wave（Apache-2.0）。',
  deps: '无',
  note: '每个点的延迟 = k·dist(cell, origin)，dist 是欧氏距离归一化到 0..1——这是「圆形波」而非「方形扫过」的关键（用 row+col 的曼哈顿距离会出菱形）。每点动画是 scale 0→1.5→1（1.5 那一下是过冲），配一个亮度脉冲。第二道波用 (1-dist) 反向延迟，读作收拢。17×9 这种密度用 DOM 就够，上百上千点才需要 canvas/WebGL。',
  code: `// 每点延迟 = 欧氏距离（归一化）→ 圆形波
dist = Math.hypot(c - CX, r - CY) / MAX_D;      // 0..1

// 第一道波：扩散点亮（带过冲）
w1 = seg(t, dist*.35, dist*.35+.18, outCubic);
// 第二道波：反向收拢
w2 = seg(t, .62 + (1-dist)*.25, .62 + (1-dist)*.25 + .15);
pulse2 = Math.sin(w2*Math.PI);

// 每点：scale 过冲 + 亮度脉冲
s = w1*(1 + .5*Math.sin(w1*Math.PI)) + pulse2*.8;
opacity = .25 + w1*.5 + pulse2*.25;`,
  init(el) {
    const STYLE = '<style data-fx="radial-wave">' +
      '.rw{position:relative;width:100%;height:100%;overflow:hidden}' +
      '.rw i{position:absolute;width:6px;height:6px;border-radius:50%;background:#6c8cff;margin:-3px 0 0 -3px;will-change:transform,opacity}' +
      '.rw-cap{position:absolute;bottom:7px;left:0;right:0;text-align:center;font-size:8px;color:#4a5368;letter-spacing:.1em;text-transform:uppercase}' +
      '</style>';

    const COLS = 15, ROWS = 8;
    const CX = (COLS - 1) / 2, CY = (ROWS - 1) / 2;
    const MAX_D = Math.hypot(CX, CY);

    let dots = '';
    const dists = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const dist = Math.hypot(c - CX, r - CY) / MAX_D;
        dists.push(dist);
        dots += '<i style="left:' + (((c + 0.5) / COLS) * 100).toFixed(2) + '%;top:' + (((r + 0.5) / ROWS) * 100).toFixed(2) + '%"></i>';
      }
    }

    el.insertAdjacentHTML('beforeend', STYLE +
      '<div class="rw" id="rw">' + dots + '<div class="rw-cap">欧氏距离 stagger · 圆形波</div></div>');

    const pts = [...el.querySelectorAll('#rw i')];
    const clamp01 = x => x < 0 ? 0 : x > 1 ? 1 : x;
    const outCubic = u => 1 - Math.pow(1 - clamp01(u), 3);
    const seg = (t, a, b) => clamp01((t - a) / (b - a));

    const DUR = 3.6;
    let raf, start = 0;
    const tick = now => {
      if (!start) start = now;
      const t = ((now - start) / 1000) % (DUR + 0.5);

      for (let i = 0; i < pts.length; i++) {
        const dist = dists[i];
        const w1 = outCubic(seg(t, dist * 0.35, dist * 0.35 + 0.18));
        const w2 = seg(t, 0.62 + (1 - dist) * 0.25, 0.62 + (1 - dist) * 0.25 + 0.15);
        const pulse2 = Math.sin(w2 * Math.PI);
        const s = w1 * (1 + 0.5 * Math.sin(w1 * Math.PI)) + pulse2 * 0.8;
        const op = 0.25 + w1 * 0.5 + pulse2 * 0.25;
        pts[i].style.transform = 'scale(' + s.toFixed(3) + ')';
        pts[i].style.opacity = op.toFixed(3);
        if (pulse2 > 0.3) { pts[i].style.background = '#b9f2ff'; pts[i].style.boxShadow = '0 0 8px #7fd8ff'; }
        else { pts[i].style.background = '#6c8cff'; pts[i].style.boxShadow = 'none'; }
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => { cancelAnimationFrame(raf); el.innerHTML = ''; };
  }
};
