export default {
  id: 'matter-compound-body', group: 'physics', name: '复合刚体抛掷', lib: '物理积分',
  desc: 'L 形复合刚体被抛出后带着角动量翻滚，落地按惯量弹跳、逐次衰减。',
  deps: '无（手写刚体 + 旋转惯量 + 接触冲量）',
  note: '多部件刚体（Matter 的 Composite / Rapier 的 compound collider）必须算合成惯量 I = Σ(m_i·d_i² + I_i)，只用外接矩形会翻得太慢。弹跳系数 e>0.6 时落地会“抽帧抖动”，因为每帧只解一次接触；要么 e ≤ 0.5，要么把恢复系数与角速度一起衰减到 0.15 以下。',
  code: "// 2D 刚体：位置 + 角度 + 线速度 + 角速度 + 合成惯量\nconst body = {\n  x: W * 0.3, y: 30,\n  vx: 150, vy: -120,\n  a: 0, w: 1.6,            // 弧度 / 角速度\n  parts: [                 // 复合体：横条 + 竖条\n    { x: 0,  y: 0, w: 44, h: 12, m: 1 },\n    { x: -16, y: -14, w: 12, h: 32, m: 0.8 }\n  ]\n};\n// 合成惯量（矩形 I = m(w²+h²)/12，再平移 d²）\nbody.I = body.parts.reduce((s, p) =>\n  s + p.m * (p.w * p.w + p.h * p.h) / 12 + p.m * (p.x * p.x + p.y * p.y), 0);\n\nfunction step(dt) {\n  body.vy += 1400 * dt;\n  body.x += body.vx * dt;\n  body.y += body.vy * dt;\n  body.a += body.w * dt;\n\n  // 地面：取复合体各部件最低点\n  let deepest = -Infinity, contactX = 0;\n  for (const p of body.parts) {\n    const wx = body.x + p.x * Math.cos(body.a) - p.y * Math.sin(body.a);\n    const wy = body.y + p.x * Math.sin(body.a) + p.y * Math.cos(body.a);\n    const bottom = wy + p.h / 2;\n    if (bottom > deepest) { deepest = bottom; contactX = wx; }\n  }\n  const floor = H - 8;\n  if (deepest > floor) {\n    body.y -= deepest - floor;\n    if (body.vy > 0) {\n      body.vy *= -0.42;                     // 恢复系数\n      // 接触点力矩 → 角速度（偏心动量）\n      body.w += -(contactX - body.x) * body.vy * 0.0016 / body.I;\n      body.w *= 0.82;\n    }\n    body.vx *= 0.94;                        // 摩擦\n  }\n  body.w *= 0.999;\n}",
  init(el) {
    el.innerHTML = '';
    const cv = document.createElement('canvas');
    const W = 280, H = 150, dpr = Math.min(devicePixelRatio || 1, 2);
    cv.width = W * dpr; cv.height = H * dpr;
    cv.style.cssText = 'width:100%;height:100%;display:block;cursor:pointer';
    el.appendChild(cv);
    const g = cv.getContext('2d');
    g.scale(dpr, dpr);

    const FLOOR = H - 8;
    const mk = () => {
      const parts = [
        { x: 0, y: 0, w: 46, h: 13, m: 1.0 },
        { x: -16.5, y: -15, w: 13, h: 30, m: 0.85 },
        { x: 14, y: 12, w: 16, h: 11, m: 0.5 }
      ];
      const I = parts.reduce((s, p) => s + p.m * (p.w * p.w + p.h * p.h) / 12 + p.m * (p.x * p.x + p.y * p.y), 0);
      return { x: W * 0.28, y: 26, vx: 190, vy: -150, a: -0.2, w: 2.2, parts, I, hits: 0, spark: 0 };
    };
    let body = mk();

    const step = dt => {
      body.vy += 1500 * dt;
      body.x += body.vx * dt;
      body.y += body.vy * dt;
      body.a += body.w * dt;

      let deepest = -Infinity, contactX = 0;
      for (const p of body.parts) {
        const wx = body.x + p.x * Math.cos(body.a) - p.y * Math.sin(body.a);
        const wy = body.y + p.x * Math.sin(body.a) + p.y * Math.cos(body.a);
        const bottom = wy + p.h / 2;
        if (bottom > deepest) { deepest = bottom; contactX = wx; }
      }
      if (deepest > FLOOR) {
        body.y -= deepest - FLOOR;
        if (body.vy > 0) {
          const impact = body.vy;
          body.vy *= -0.40;
          body.w += -(contactX - body.x) * impact * 0.0022 / body.I;
          body.w *= 0.80;
          body.hits++;
          body.spark = Math.min(1, impact / 500);
        }
        body.vx *= 0.93;
        body.w *= 0.97;
      }
      // 墙壁反弹
      const lx = body.x, rx = W - body.x;
      if (lx < 14) { body.x = 14; body.vx = Math.abs(body.vx) * 0.6; body.w *= 0.8; }
      if (rx < 14) { body.x = W - 14; body.vx = -Math.abs(body.vx) * 0.6; body.w *= 0.8; }
      body.w *= 0.9995;
      body.spark *= 0.9;
    };

    const reset = () => { body = mk(); };

    const draw = () => {
      g.clearRect(0, 0, W, H);
      g.fillStyle = '#171c29'; g.fillRect(0, FLOOR, W, H - FLOOR);

      // 轨迹阴影（地面投影）
      g.save();
      g.globalAlpha = 0.18;
      g.fillStyle = '#000';
      g.beginPath();
      g.ellipse(body.x, FLOOR + 2, 26, 4, 0, 0, 6.2832); g.fill();
      g.restore();

      g.save();
      g.translate(body.x, body.y);
      g.rotate(body.a);
      body.parts.forEach((p, i) => {
        g.fillStyle = i === 0 ? '#5F7BFF' : (i === 1 ? '#4f68e0' : '#8fb0ff');
        g.fillRect(p.x - p.w / 2, p.y - p.h / 2, p.w, p.h);
        g.strokeStyle = 'rgba(210,222,255,.55)';
        g.lineWidth = 1;
        g.strokeRect(p.x - p.w / 2 + .5, p.y - p.h / 2 + .5, p.w - 1, p.h - 1);
      });
      // 质心标记
      g.fillStyle = 'rgba(255,255,255,.85)';
      g.beginPath(); g.arc(0, 0, 1.8, 0, 6.2832); g.fill();
      g.restore();

      if (body.spark > 0.02) {
        g.strokeStyle = `rgba(150,200,255,${body.spark * 0.7})`;
        g.lineWidth = 1;
        g.beginPath(); g.moveTo(body.x - 30, FLOOR + 1); g.lineTo(body.x + 30, FLOOR + 1); g.stroke();
      }
    };

    cv.addEventListener('pointerdown', reset);

    let raf = 0, last = performance.now(), acc = 0, idle = 0;
    const frame = now => {
      acc += Math.min(now - last, 50); last = now;
      let guard = 0;
      while (acc >= 8.333 && guard++ < 10) { step(0.008333); acc -= 8.333; }
      // 静止 2s 后自动重抛
      const still = Math.abs(body.vx) + Math.abs(body.vy) + Math.abs(body.w) * 20 < 34;
      idle = still && body.y > 40 ? idle + 1 : 0;
      if (idle > 120) reset();
      draw();
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      cv.removeEventListener('pointerdown', reset);
    };
  }
};
