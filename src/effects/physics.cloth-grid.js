export default {
  id: 'cloth-grid', group: 'physics', name: '布料网格', lib: 'matter-js / 约束求解（原生 verlet）',
  desc: '一块被钉住上沿的布：拖动一角，整片跟着软下去，松手回弹还在抖。',
  deps: '无（matter-js 的 Constraint + Verlet 求解同一套东西）',
  note: '只连上下左右的邻居会"塌"成一条线，必须补对角约束抗剪切。约束每次迭代都改位置而不是给力，迭代 4 次左右就能稳；少了像橡皮筋，多了像硬纸板。拖拽时直接把点的位置设成指针坐标并把上一帧位置也设过去（速度归零），比加弹簧力稳定得多，不会甩飞。固定步长很重要：帧率一抖，重力积分就变，布会自己飘。',
  code: `/* verlet：位置 + 上一帧位置就是全部状态，速度是隐含的 */
p.x += (p.x - p.px) * DAMP; p.y += (p.y - p.py) * DAMP;
p.px = oldX; p.py = oldY;
p.y += G;                                  // 重力
/* 约束：把两点拉回静止长度，各走一半 */
for (let k = 0; k < 4; k++) {
  for (const c of links) {
    const dx = c.b.x - c.a.x, dy = c.b.y - c.a.y;
    const d = Math.hypot(dx, dy) || 1;
    const diff = (d - c.len) / d * .5;
    if (c.a.pin) { c.b.x -= dx * diff * 2; c.b.y -= dy * diff * 2; }
    else if (c.b.pin) { c.a.x += dx * diff * 2; c.a.y += dy * diff * 2; }
    else {
      c.a.x += dx * diff; c.a.y += dy * diff;
      c.b.x -= dx * diff; c.b.y -= dy * diff;
    }
  }
}`,
  init(el) {
    const W = 300, H = 168;
    el.innerHTML = `<div style="position:absolute;inset:0;display:grid;place-items:center">
      <canvas width="${W}" height="${H}" style="display:block;border-radius:8px;
        background:radial-gradient(circle at 50% 0%,rgba(195,234,58,.07),transparent 70%);
        cursor:grab;touch-action:none"></canvas>
    </div>`;
    const cv = el.querySelector('canvas');
    const ctx = cv.getContext('2d');
    if (!ctx) return () => {};

    const COLS = 13, ROWS = 9;
    const SP = (W - 60) / (COLS - 1);
    const X0 = 30, Y0 = 26;
    const G = 0.34, DAMP = 0.985, ITER = 4;

    const pts = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        pts.push({
          x: X0 + c * SP, y: Y0 + r * SP, px: X0 + c * SP, py: Y0 + r * SP,
          pin: r === 0 && c % 3 === 0, /* 只钉几个点，布才会在两点之间垂出弧 */
          i: r * COLS + c
        });
      }
    }
    const links = [];
    const addLink = (a, b) => links.push({ a, b, len: Math.hypot(b.x - a.x, b.y - a.y) });
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const p = pts[r * COLS + c];
        if (c + 1 < COLS) addLink(p, pts[r * COLS + c + 1]);
        if (r + 1 < ROWS) addLink(p, pts[(r + 1) * COLS + c]);
        /* 对角：不给就会塌成一条线（剪切无法抵抗） */
        if (r + 1 < ROWS && c + 1 < COLS) addLink(p, pts[(r + 1) * COLS + c + 1]);
        if (r + 1 < ROWS && c - 1 >= 0) addLink(p, pts[(r + 1) * COLS + c - 1]);
      }
    }

    let grabbed = null, raf = 0;
    const local = e => {
      const r = cv.getBoundingClientRect();
      return { x: (e.clientX - r.left) * (W / r.width), y: (e.clientY - r.top) * (H / r.height) };
    };
    const down = e => {
      const m = local(e);
      let bestD = 26 * 26, best = null;
      for (const p of pts) {
        if (p.pin) continue;
        const d = (p.x - m.x) ** 2 + (p.y - m.y) ** 2;
        if (d < bestD) { bestD = d; best = p; }
      }
      grabbed = best;
      cv.style.cursor = grabbed ? 'grabbing' : 'grab';
      if (grabbed) { grabbed.x = grabbed.px = m.x; grabbed.y = grabbed.py = m.y; e.preventDefault(); }
    };
    const move = e => {
      if (!grabbed) return;
      const m = local(e);
      /* 直接改位置 + 同步上一帧：速度归零，不会把布甩飞 */
      grabbed.px = grabbed.x; grabbed.py = grabbed.y;
      grabbed.x = m.x; grabbed.y = m.y;
      e.preventDefault();
    };
    const up = () => { grabbed = null; cv.style.cursor = 'grab'; };
    cv.addEventListener('pointerdown', down);
    cv.addEventListener('pointermove', move);
    cv.addEventListener('pointerup', up);
    cv.addEventListener('pointercancel', up);

    const step = () => {
      for (const p of pts) {
        if (p.pin) continue;
        if (p === grabbed) continue;
        const vx = (p.x - p.px) * DAMP, vy = (p.y - p.py) * DAMP;
        p.px = p.x; p.py = p.y;
        p.x += vx; p.y += vy + G;
        /* 边界：撞到画布边缘就停在边上，速度自然衰减 */
        if (p.y > H - 6) { p.y = H - 6; p.py = p.y + vy * .2; }
        if (p.x < 4) { p.x = 4; p.px = p.x; }
        if (p.x > W - 4) { p.x = W - 4; p.px = p.x; }
      }
      for (let k = 0; k < ITER; k++) {
        for (const c of links) {
          const dx = c.b.x - c.a.x, dy = c.b.y - c.a.y;
          const d = Math.hypot(dx, dy) || 1;
          const diff = (d - c.len) / d * .5;
          if (c.a.pin) { c.b.x -= dx * diff * 2; c.b.y -= dy * diff * 2; }
          else if (c.b.pin) { c.a.x += dx * diff * 2; c.a.y += dy * diff * 2; }
          else {
            c.a.x += dx * diff; c.a.y += dy * diff;
            c.b.x -= dx * diff; c.b.y -= dy * diff;
          }
        }
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      /* 先铺一层极淡的布面，让"有块布"这件事在暗背景上成立 */
      for (let r = 0; r < ROWS - 1; r++) {
        for (let c = 0; c < COLS - 1; c++) {
          const a = pts[r * COLS + c], b = pts[r * COLS + c + 1];
          const d = pts[(r + 1) * COLS + c + 1], e = pts[(r + 1) * COLS + c];
          ctx.beginPath();
          ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.lineTo(d.x, d.y); ctx.lineTo(e.x, e.y);
          ctx.closePath();
          ctx.fillStyle = 'rgba(195,234,58,.045)';
          ctx.fill();
        }
      }
      ctx.lineWidth = 1;
      for (const c of links) {
        const diag = Math.abs(c.b.i - c.a.i) !== 1 && Math.abs(c.b.i - c.a.i) !== COLS;
        if (diag) continue; /* 对角只参与求解，不画：画出来是渔网不是布 */
        const stretch = Math.min(1, Math.abs(Math.hypot(c.b.x - c.a.x, c.b.y - c.a.y) - c.len) / 8);
        ctx.strokeStyle = `rgba(${195 - stretch * 110},${234 - stretch * 90},${58 + stretch * 190},${.34 + stretch * .5})`;
        ctx.beginPath();
        ctx.moveTo(c.a.x, c.a.y);
        ctx.lineTo(c.b.x, c.b.y);
        ctx.stroke();
      }
      for (const p of pts) {
        if (!p.pin) continue;
        ctx.fillStyle = 'rgba(195,234,58,.9)';
        ctx.beginPath(); ctx.arc(p.x, p.y, 2.2, 0, Math.PI * 2); ctx.fill();
      }
      if (grabbed) {
        ctx.strokeStyle = 'rgba(255,255,255,.9)';
        ctx.beginPath(); ctx.arc(grabbed.x, grabbed.y, 6, 0, Math.PI * 2); ctx.stroke();
      }
    };

    const loop = () => { step(); draw(); raf = requestAnimationFrame(loop); };
    /* 预演 140 步：第一帧就是"已经垂下来"的布，
       否则用户会先看到一块平板突然塌下去（像加载了两次） */
    for (let i = 0; i < 140; i++) step();
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      cv.removeEventListener('pointerdown', down);
      cv.removeEventListener('pointermove', move);
      cv.removeEventListener('pointerup', up);
      cv.removeEventListener('pointercancel', up);
    };
  }
};
