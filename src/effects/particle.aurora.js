export default {
  id: 'aurora', group: 'particle', name: '极光帘幕', lib: 'Canvas 2D',
  desc: '多层正弦曲线叠加出流动丝带，比粒子更轻、比渐变更有形态。',
  deps: '无',
  note: '用三条不同频率的正弦叠加，再套 globalCompositeOperation="lighter" 就是极光。频率比取无理数（1 : 1.618 : 2.414）曲线才不会周期性重复。',
  code: `ctx.globalCompositeOperation = 'lighter';   // 叠加发光的关键
for (let layer = 0; layer < 3; layer++) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, 'rgba(95,59,255,0)');
  g.addColorStop(.5, \`rgba(60,203,255,\${.1 + layer * .04})\`);
  g.addColorStop(1, 'rgba(95,59,255,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  for (let x = 0; x <= w; x += 6) {
    const y = h * .5
      + Math.sin(x * .012 + t + layer) * 22
      + Math.sin(x * .031 + t * 1.7 + layer) * 10;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath(); ctx.fill();
}`,
  init(el) {
    const cv = document.createElement('canvas');
    cv.width = 280; cv.height = 150;
    el.appendChild(cv);
    const ctx = cv.getContext('2d');
    const W = cv.width, H = cv.height;
    let raf, t = 0;
    const colors = [[95, 59, 255], [60, 203, 255], [191, 234, 26]];
    const loop = () => {
      t += .014;
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter';
      for (let layer = 0; layer < 3; layer++) {
        const g = ctx.createLinearGradient(0, 0, 0, H);
        const c = colors[layer];
        g.addColorStop(0, `rgba(${c[0]},${c[1]},${c[2]},0)`);
        g.addColorStop(.45, `rgba(${c[0]},${c[1]},${c[2]},${.14 + layer * .05})`);
        g.addColorStop(1, `rgba(${c[0]},${c[1]},${c[2]},0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(0, H * .55);
        for (let x = 0; x <= W; x += 6) {
          const y = H * .55
            + Math.sin(x * .012 + t + layer) * 22
            + Math.sin(x * .031 + t * 1.618 + layer) * 10
            + Math.sin(x * .007 + t * .414 + layer) * 16;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath(); ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }
};
