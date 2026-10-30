export default {
  id: 'particles', group: 'particle', name: '粒子星云', lib: 'Canvas 2D',
  desc: '高密度粒子随鼠标排斥并就近连线，适合做背景氛围层。',
  deps: '无（生产可用 tsParticles）',
  note: '粒子数超过 120 就该换 PixiJS / WebGL。Canvas 2D 在 300 粒子后帧率明显掉，移动端更早。连线是"星云感"的关键，纯点阵只会像雪花。',
  code: `const pts = Array.from({ length: 110 }, () => ({
  x: Math.random() * w, y: Math.random() * h,
  vx: (Math.random() - .5) * .4, vy: (Math.random() - .5) * .4,
  r: Math.random() * 1.6 + .6
}));

function draw() {
  ctx.clearRect(0, 0, w, h);
  for (const p of pts) { /* 位移 + 鼠标排斥 */ }
  // 就近连线：星云感的关键
  for (let i = 0; i < pts.length; i++)
    for (let j = i + 1; j < pts.length; j++) {
      const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
      if (d < 34) { ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y);
        ctx.lineTo(pts[j].x, pts[j].y);
        ctx.strokeStyle = \`rgba(60,203,255,\${(1 - d / 34) * .22})\`; ctx.stroke(); }
    }
  requestAnimationFrame(draw);
}`,
  init(el) {
    const cv = document.createElement('canvas');
    cv.width = 280; cv.height = 150;
    el.appendChild(cv);
    const ctx = cv.getContext('2d');
    const W = cv.width, H = cv.height;
    const pts = Array.from({ length: 88 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35,
      r: Math.random() * 1.5 + .5
    }));
    let mx = -999, my = -999, raf;
    const mv = e => {
      const r = cv.getBoundingClientRect();
      mx = (e.clientX - r.left) * W / r.width;
      my = (e.clientY - r.top) * H / r.height;
    };
    el.addEventListener('mousemove', mv);
    const loop = () => {
      ctx.clearRect(0, 0, W, H);
      for (const p of pts) {
        p.x += p.vx; p.y += p.vy;
        const dx = p.x - mx, dy = p.y - my, d = Math.hypot(dx, dy);
        if (d < 48 && d > 0) { p.x += dx / d * 1.1; p.y += dy / d * 1.1; }
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7);
        ctx.fillStyle = 'rgba(120,150,255,.75)'; ctx.fill();
      }
      for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
        const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
        if (d < 34) {
          ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
          ctx.strokeStyle = `rgba(60,203,255,${(1 - d / 34) * .22})`;
          ctx.stroke();
        }
      }
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => { cancelAnimationFrame(raf); el.removeEventListener('mousemove', mv); };
  }
};
