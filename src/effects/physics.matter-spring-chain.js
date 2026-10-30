export default {
  id: 'matter-spring-chain', group: 'physics', name: '弹簧约束链（stiffness × damping）', lib: '物理积分',
  desc: '三个滑块用弹簧串起来，拖拽时弹簧拉伸回弹，松手过冲两次才停。',
  deps: '无（手写弹簧 — 阻尼积分，等价 Matter.Constraint）',
  note: '抄 Matter.Constraint：stiffness<1 时它会把刚度乘 timeScale²（时间步一变刚度就变），所以固定步长是硬要求。stiffness 0.02~0.3 是弹簧手感，≥1 是刚性绳；damping 必须 < 2√k·m 才不过冲振荡，超了会变成“黏在终点”。',
  code: "// Matter：force = (len - rest) / len * stiffness，damping 顺带吃掉法向相对速度\nconst cv = document.querySelector('#stage'), g = cv.getContext('2d');\nconst W = cv.width, H = cv.height;\n\nconst K = 0.16;          // stiffness\nconst DAMP = 0.12;       // damping\nconst nodes = Array.from({ length: 4 }, (_, i) => ({\n  x: 40 + i * 64, y: 70, vx: 0, vy: 0,\n  pinned: i === 0, home: 40 + i * 64\n}));\nconst REST = 62;\n\nfunction tick() {\n  for (let it = 0; it < 4; it++) {\n    for (let i = 0; i < nodes.length - 1; i++) {\n      const a = nodes[i], b = nodes[i + 1];\n      const dx = b.x - a.x, dy = b.y - a.y;\n      const len = Math.hypot(dx, dy) || 1e-6;\n      const diff = (len - REST) / len;\n      const fx = dx * diff * K, fy = dy * diff * K;\n\n      // 法向相对速度 → damping（Matter 就是这一步，不是乘法衰减）\n      const nx = dx / len, ny = dy / len;\n      const rv = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;\n      const dvx = nx * rv * DAMP, dvy = ny * rv * DAMP;\n\n      if (!a.pinned) { a.vx += fx * 0.5; a.vy += fy * 0.5; a.vx += dvx * 0.5; a.vy += dvy * 0.5; }\n      if (!b.pinned) { b.vx -= fx * 0.5; b.vy -= fy * 0.5; b.vx -= dvx * 0.5; b.vy -= dvy * 0.5; }\n    }\n  }\n  for (const n of nodes) {\n    if (n.pinned) continue;\n    n.vy += 0.0;                 // 无重力，纯横向拖拽\n    n.vx *= 0.972; n.vy *= 0.94;  // 全局阻尼，没有它永远不会停\n    n.x += n.vx; n.y += n.vy;\n    n.y = Math.max(24, Math.min(H - 24, n.y));\n    n.x = Math.max(18, Math.min(W - 18, n.x));\n  }\n}",
  init(el) {
    el.innerHTML = '';
    const cv = document.createElement('canvas');
    const W = 280, H = 150, dpr = Math.min(devicePixelRatio || 1, 2);
    cv.width = W * dpr; cv.height = H * dpr;
    cv.style.cssText = 'width:100%;height:100%;display:block;cursor:grab;touch-action:none';
    el.appendChild(cv);
    const g = cv.getContext('2d');
    g.scale(dpr, dpr);

    const K = 0.14, DAMP = 0.14, REST = 64;
    const nodes = Array.from({ length: 4 }, (_, i) => ({
      x: 46 + i * REST, y: H / 2, vx: 0, vy: 0, pinned: i === 0
    }));
    let grab = -1, raf = 0, last = 0, acc = 0;

    const toLocal = e => {
      const r = cv.getBoundingClientRect();
      return { x: (e.clientX - r.left) / r.width * W, y: (e.clientY - r.top) / r.height * H };
    };
    const down = e => {
      const m = toLocal(e);
      grab = nodes.findIndex((n, i) => i > 0 && Math.hypot(n.x - m.x, n.y - m.y) < 22);
      cv.style.cursor = grab > 0 ? 'grabbing' : 'grab';
    };
    const move = e => {
      if (grab < 0) return;
      const m = toLocal(e), n = nodes[grab];
      n.vx = (m.x - n.x) * 0.5;
      n.vy = (m.y - n.y) * 0.5;
      n.x = m.x; n.y = m.y;
    };
    const up = () => { grab = -1; cv.style.cursor = 'grab'; };
    cv.addEventListener('pointerdown', down);
    addEventListener('pointermove', move);
    addEventListener('pointerup', up);

    const step = () => {
      // 顺序冲量：先算全部力再积分，避免 later 节点吃到旧速度
      const f = nodes.map(() => [0, 0]);
      for (let i = 0; i < nodes.length - 1; i++) {
        const a = nodes[i], b = nodes[i + 1];
        const dx = b.x - a.x, dy = b.y - a.y;
        const len = Math.hypot(dx, dy) || 1e-6;
        const diff = (len - REST) / len;
        let fx = dx * diff * K, fy = dy * diff * K;
        const nx = dx / len, ny = dy / len;
        const rv = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
        fx += nx * rv * DAMP; fy += ny * rv * DAMP;
        f[i][0] += fx * 0.5;  f[i][1] += fy * 0.5;
        f[i+1][0] -= fx * 0.5; f[i+1][1] -= fy * 0.5;
      }
      for (let i = 1; i < nodes.length; i++) {
        const n = nodes[i];
        if (i === grab) continue;
        n.vx = (n.vx + f[i][0]) * 0.975;
        n.vy = (n.vy + f[i][1]) * 0.945;
        n.x += n.vx; n.y += n.vy;
        n.x = Math.max(16, Math.min(W - 16, n.x));
        n.y = Math.max(20, Math.min(H - 20, n.y));
      }
      nodes[0].x = 46; nodes[0].y = H / 2;
    };

    const draw = () => {
      g.clearRect(0, 0, W, H);
      for (let i = 0; i < nodes.length - 1; i++) {
        const a = nodes[i], b = nodes[i + 1];
        const dx = b.x - a.x, dy = b.y - a.y;
        const len = Math.hypot(dx, dy) || 1;
        const stretch = Math.min(1, Math.abs(len - REST) / REST * 2.2);
        // 画成锯齿弹簧
        g.strokeStyle = `hsl(${222 - stretch * 200}, 85%, ${66 - stretch * 10}%)`;
        g.lineWidth = 2;
        const segs = 9, nx = -dy / len, ny = dx / len;
        g.beginPath(); g.moveTo(a.x, a.y);
        for (let s = 1; s < segs; s++) {
          const t = s / segs, amp = 4.5 * (1 - stretch * 0.4);
          g.lineTo(a.x + dx * t + nx * amp * (s % 2 ? 1 : -1),
                   a.y + dy * t + ny * amp * (s % 2 ? 1 : -1));
        }
        g.lineTo(b.x, b.y); g.stroke();
      }
      nodes.forEach((n, i) => {
        g.fillStyle = n.pinned ? '#3a4460' : '#5F7BFF';
        g.beginPath(); g.arc(n.x, n.y, n.pinned ? 5 : 7, 0, 6.2832); g.fill();
        if (!n.pinned) {
          g.strokeStyle = 'rgba(190,205,255,.7)'; g.lineWidth = 1; g.stroke();
        }
      });
    };

    const frame = ts => {
      acc += Math.min(ts - last || 16, 50); last = ts;
      let guard = 0;
      while (acc >= 16.67 && guard++ < 3) { step(); acc -= 16.67; }
      draw();
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      cv.removeEventListener('pointerdown', down);
      removeEventListener('pointermove', move);
      removeEventListener('pointerup', up);
    };
  }
};
