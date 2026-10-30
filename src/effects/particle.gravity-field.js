export default {
  id: 'gravity-field', group: 'particle', name: '引力场轨道', lib: 'Canvas 2D',
  desc: '粒子绕中心做椭圆轨道运动，鼠标靠近时被吸引或排斥，做数据核心/能量场。',
  deps: '无（tsParticles 用 attract + orbit 模式）',
  note: '轨道半径要用 pow(random, 1.6) 分布，均匀分布会让粒子全挤在外圈。速度必须按 1/R 缩放，否则内圈粒子会慢得像停住——真实轨道是越近越快。',
  code: `// tsParticles 等效配置
{
  particles: {
    move: {
      enable: true,
      speed: 2,
      attract: { enable: true, rotate: { x: 600, y: 1200 } },  // orbit 关键
      orbit: { enable: true, rotation: { value: 45 }, opacity: 0.4 }
    }
  },
  interactivity: {
    modes: { grab: { distance: 180, links: { opacity: .5 } } }
  }
}

/* 手写版：每个粒子的状态 */
{ a: 随机角, R: 20 + pow(random,1.6)*110, speed: 0.3+rnd*0.9 }
// 每帧：a += speed * (30 / R)        ← 1/R 缩放是轨道真实感的关键
//       x = cx + cos(a) * R
//       y = cy + sin(a) * R * 0.42   ← 压扁成椭圆，视角感`,
  init(el) {
    const cv = document.createElement('canvas');
    cv.width = 280; cv.height = 150;
    el.appendChild(cv);
    const c = cv.getContext('2d');
    const W = cv.width, H = cv.height;
    const cx = W / 2, cy = H / 2;
    const rnd = (() => { let s = 7; return () => (s = s * 16807 % 2147483647) / 2147483647; })();
    const ps = Array.from({ length: 150 }, () => ({
      a: rnd() * Math.PI * 2,
      R: 18 + Math.pow(rnd(), 1.6) * 105,
      sp: 0.3 + rnd() * 0.9,
      sz: 0.6 + rnd() * 1.4,
      hue: rnd()
    }));
    let raf, t = 0, mx = -999, my = -999;
    const mv = e => {
      const r = cv.getBoundingClientRect();
      mx = (e.clientX - r.left) * W / r.width;
      my = (e.clientY - r.top) * H / r.height;
    };
    el.addEventListener('mousemove', mv);
    const loop = () => {
      t += 0.016;
      c.clearRect(0, 0, W, H);
      // 中心光核
      const g = c.createRadialGradient(cx, cy, 0, cx, cy, 42);
      g.addColorStop(0, 'rgba(95,59,255,.55)');
      g.addColorStop(1, 'rgba(95,59,255,0)');
      c.fillStyle = g;
      c.beginPath(); c.arc(cx, cy, 42, 0, 7); c.fill();
      for (const p of ps) {
        p.a += p.sp * (30 / p.R) * 0.028;              // 1/R 缩放
        let x = cx + Math.cos(p.a + t * 0.15) * p.R;
        let y = cy + Math.sin(p.a + t * 0.15) * p.R * 0.42;
        const dx = x - mx, dy = y - my, d = Math.hypot(dx, dy);
        if (d < 40 && d > 0) { x += dx / d * 8; y += dy / d * 8; }
        c.beginPath(); c.arc(x, y, p.sz, 0, 7);
        c.fillStyle = p.hue > .5
          ? `rgba(60,203,255,${.35 + p.sz * .25})`
          : `rgba(160,140,255,${.3 + p.sz * .22})`;
        c.fill();
      }
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => { cancelAnimationFrame(raf); el.removeEventListener('mousemove', mv); };
  }
};
