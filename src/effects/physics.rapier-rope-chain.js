export default {
  id: 'rapier-rope-chain', group: 'physics', name: '绳索链条（距离关节）', lib: '物理积分',
  desc: '五十节链子钉在上方，拖动可甩动，末端配重让链条下垂成弧。',
  deps: '无（手写 Verlet + 距离约束，等价 Rapier 的 rope joint）',
  note: 'Verlet 链的“刚度”只等于约束迭代次数：1~2 次是橡皮筋，10 次以上才像铁链，20 次开始明显耗 CPU。每帧必须先保存上一位置再积分，顺序反了速度记不住；阻尼别用速度乘衰减，直接用 pos += (pos - prev) * (1 - damp)，damp 取 0.01~0.04。',
  code: "const cv = document.querySelector('#stage'), g = cv.getContext('2d');\nconst W = cv.width, H = cv.height;\nconst N = 44, SEG = 4.6;                   // 节数 / 每节长度\nconst P = [];                              // Verlet 质点\nfor (let i = 0; i < N; i++) P.push({ x: W / 2, y: 14 + i * SEG, px: W / 2, py: 14 + i * SEG });\nlet anchor = { x: W / 2, y: 14 }, mouse = null;\n\nfunction physics() {\n  // 1) 保存上一位置 + 重力积分\n  for (const p of P) {\n    if (p === P[0]) { p.x = anchor.x; p.y = anchor.y; p.px = anchor.x; p.py = anchor.y; continue; }\n    const vx = (p.x - p.px) * 0.985;\n    const vy = (p.y - p.py) * 0.985;\n    p.px = p.x; p.py = p.y;\n    p.x += vx;\n    p.y += vy + 0.9;                       // 重力（px/帧²，60fps 下约 3240px/s²）\n  }\n  // 2) 距离约束：迭代次数 = 刚度\n  for (let it = 0; it < 12; it++) {\n    for (let i = 0; i < N - 1; i++) {\n      const a = P[i], b = P[i + 1];\n      let dx = b.x - a.x, dy = b.y - a.y;\n      const d = Math.hypot(dx, dy) || 1e-6;\n      const diff = (d - SEG) / d * 0.5;\n      if (i === 0) { b.x -= dx * diff * 2; b.y -= dy * diff * 2; }\n      else {\n        a.x += dx * diff; a.y += dy * diff;\n        b.x -= dx * diff; b.y -= dy * diff;\n      }\n    }\n  }\n  // 3) 鼠标抓取（抓最近一节）\n  if (mouse) { const p = P[mouse.i]; p.x = mouse.x; p.y = mouse.y; }\n}",
  init(el) {
    el.innerHTML = '';
    const cv = document.createElement('canvas');
    const W = 280, H = 150, dpr = Math.min(devicePixelRatio || 1, 2);
    cv.width = W * dpr; cv.height = H * dpr;
    cv.style.cssText = 'width:100%;height:100%;display:block;cursor:grab;touch-action:none';
    el.appendChild(cv);
    const g = cv.getContext('2d');
    g.scale(dpr, dpr);

    const N = 46, SEG = 3.6, GRAV = 0.85, DAMP = 0.985, ITER = 14;
    const P = [];
    for (let i = 0; i < N; i++) {
      P.push({ x: W * 0.5, y: 12 + i * SEG, px: W * 0.5, py: 12 + i * SEG });
    }
    const anchor = { x: W * 0.5, y: 12 };
    let grab = -1;

    const toLocal = e => {
      const r = cv.getBoundingClientRect();
      return { x: (e.clientX - r.left) / r.width * W, y: (e.clientY - r.top) / r.height * H };
    };
    const down = e => {
      const m = toLocal(e);
      let best = -1, bd = 26;
      P.forEach((p, i) => { if (i === 0) return; const d = Math.hypot(p.x - m.x, p.y - m.y); if (d < bd) { bd = d; best = i; } });
      grab = best;
      cv.style.cursor = best >= 0 ? 'grabbing' : 'grab';
    };
    const move = e => {
      if (grab < 0) return;
      const m = toLocal(e);
      P[grab].x = m.x; P[grab].y = m.y;
      P[grab].px = m.x; P[grab].py = m.y;     // 抓住时速度归零，防炸
    };
    const up = () => { grab = -1; cv.style.cursor = 'grab'; };
    cv.addEventListener('pointerdown', down);
    addEventListener('pointermove', move);
    addEventListener('pointerup', up);

    const step = () => {
      for (let i = 1; i < N; i++) {
        const p = P[i];
        const vx = (p.x - p.px) * DAMP, vy = (p.y - p.py) * DAMP;
        p.px = p.x; p.py = p.y;
        p.x += vx; p.y += vy + GRAV;
      }
      P[0].x = anchor.x; P[0].y = anchor.y; P[0].px = anchor.x; P[0].py = anchor.y;
      for (let it = 0; it < ITER; it++) {
        for (let i = 0; i < N - 1; i++) {
          const a = P[i], b = P[i + 1];
          const dx = b.x - a.x, dy = b.y - a.y;
          const d = Math.hypot(dx, dy) || 1e-6;
          const diff = (d - SEG) / d * 0.5;
          if (i === 0) { b.x -= dx * diff * 2; b.y -= dy * diff * 2; }
          else {
            a.x += dx * diff; a.y += dy * diff;
            b.x -= dx * diff; b.y -= dy * diff;
          }
        }
        if (grab > 0) { P[grab].x = P[grab].px; } // 保持被抓住的位置
      }
    };

    let raf = 0, last = 0, acc = 0;
    const frame = ts => {
      acc += Math.min(ts - last, 50); last = ts;
      let guard = 0;
      while (acc >= 16.67 && guard++ < 3) { step(); acc -= 16.67; }

      g.clearRect(0, 0, W, H);
      // 锚点
      g.fillStyle = '#3a4460'; g.beginPath(); g.arc(anchor.x, anchor.y, 3, 0, 6.2832); g.fill();
      // 链条：渐变粗细
      for (let i = 0; i < N - 1; i++) {
        const a = P[i], b = P[i + 1], k = i / (N - 1);
        g.strokeStyle = `hsl(${225 - k * 40}, 80%, ${62 - k * 22}%)`;
        g.lineWidth = 3.4 - k * 1.7;
        g.lineCap = 'round';
        g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke();
      }
      // 末端配重
      const tail = P[N - 1];
      g.fillStyle = '#8fb4ff';
      g.beginPath(); g.arc(tail.x, tail.y, 5, 0, 6.2832); g.fill();
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      cv.removeEventListener('pointerdown', down);
      removeEventListener('pointermove', move);
      removeEventListener('pointerup', up);
      P.length = 0;
    };
  }
};
