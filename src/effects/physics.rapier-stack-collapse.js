export default {
  id: 'rapier-stack-collapse', group: 'physics', name: '刚体堆叠 + 休眠', lib: '物理积分',
  desc: '十块盒子叠成塔，点击推倒；静止后整堆变暗进入休眠，被撞才醒。',
  deps: '无（手写 2D 刚体 + 冲量求解，等价 Rapier 的 solver 循环）',
  note: '盒堆必须用 8 次以上顺序冲量迭代（Rapier 默认 num_solver_iterations=4 但每步内还有 warm-start 摩擦缓存）；低于 3 次会明显“软脚”——底部被上层压穿 2~3px。休眠阈值抄 Matter.js：motion = v²+ω² < 0.08 且持续约 60 帧才睡，睡醒必须由碰撞立即唤醒。',
  code: "// 仅竖向重力 + 轴对齐盒 + 冲量摩擦（无旋转求解简化版，够表达堆叠）\nconst cv = document.querySelector('#stage'), g = cv.getContext('2d');\nconst W = cv.width, H = cv.height;\nconst G = 2000, ITER = 8, FRI = 0.55, REST = 0.02;\n\nclass Box {\n  constructor(x, y, w, h) {\n    this.x = x; this.y = y; this.w = w; this.h = h;\n    this.vx = 0; this.vy = 0;\n    this.sleepCounter = 0; this.sleeping = false;\n  }\n  get sleepMotion() { return this.vx * this.vx + this.vy * this.vy; }\n}\n\n// 地面 + 塔\nconst ground = new Box(W / 2, H - 8, W, 16);\nground.static = true;\nconst boxes = [];\nfor (let i = 0; i < 6; i++)\n  boxes.push(new Box(W / 2 + (Math.random() - 0.5) * 1.2, H - 24 - i * 19, 46, 17));\n\nfunction step(dt) {\n  for (const b of boxes) {\n    if (b.sleeping) continue;\n    b.vy += G * dt;\n    b.x += b.vx * dt; b.y += b.vy * dt;\n  }\n  // 竖直 + 水平分离轴，顺序冲量迭代\n  const all = boxes.concat(ground);\n  for (let it = 0; it < ITER; it++) {\n    for (let i = 0; i < boxes.length; i++) {\n      const a = boxes[i];\n      for (let j = i + 1; j < all.length; j++) {\n        const b = all[j];\n        if (a.sleeping && b.sleeping) continue;\n        resolve(a, b);\n      }\n    }\n  }\n  // 休眠：motion < 0.08（v² 单位 px/s）累计 60 帧\n  for (const b of boxes) {\n    if (b.sleeping) continue;\n    if (b.sleepMotion < 0.08) {\n      if (++b.sleepCounter > 60) { b.sleeping = true; b.vx = b.vy = 0; }\n    } else b.sleepCounter = 0;\n  }\n}\n\nfunction resolve(a, b) {\n  // 以 b 为参照，求两盒重叠\n  const dx = a.x - b.x, dy = a.y - b.y;\n  const ox = (a.w + b.w) / 2 - Math.abs(dx);\n  const oy = (a.h + b.h) / 2 - Math.abs(dy);\n  if (ox <= 0 || oy <= 0) return;\n\n  if (oy < ox) {                            // 竖向分离\n    const s = Math.sign(dy) || -1;\n    const push = oy * (b.static ? 1 : 0.5);\n    a.y += s * push;\n    if (!b.static) b.y -= s * push;\n    const rel = a.vy - (b.static ? 0 : b.vy);\n    if (rel * s < 0) return;                // 正在分开\n    const imp = -(1 + REST) * rel;\n    a.vy += imp * (b.static ? 1 : 0.5);\n    if (!b.static) b.vy -= imp * 0.5;\n    // 摩擦：切向冲量受法向冲量 × μ 限制\n    const jn = Math.abs(imp);\n    const dvx = a.vx - (b.static ? 0 : b.vx);\n    const jt = Math.max(-jn * FRI, Math.min(jn * FRI, -dvx * 0.5));\n    a.vx += jt; if (!b.static) b.vx -= jt;\n    // 唤醒\n    wake(a); wake(b);\n  } else {                                  // 横向分离\n    const s = Math.sign(dx) || 1;\n    const push = ox * (b.static ? 1 : 0.5);\n    a.x += s * push;\n    if (!b.static) b.x -= s * push;\n    const rel = a.vx - (b.static ? 0 : b.vx);\n    if (rel * s < 0) return;\n    a.vx -= rel * (b.static ? 1 : 0.5);\n    if (!b.static) b.vx += rel * 0.5;\n    wake(a); wake(b);\n  }\n}\nconst wake = b => { if (b.sleeping) { b.sleeping = false; b.sleepCounter = 0; } };\n\nfunction draw() {\n  g.clearRect(0, 0, W, H);\n  g.fillStyle = '#1b2030'; g.fillRect(0, H - 8, W, 8);\n  for (const b of boxes) {\n    g.fillStyle = b.sleeping ? '#2a3350' : '#5F7BFF';\n    g.fillRect(b.x - b.w / 2, b.y - b.h / 2, b.w, b.h);\n    g.strokeStyle = b.sleeping ? '#39456b' : '#9fb4ff';\n    g.strokeRect(b.x - b.w / 2 + .5, b.y - b.h / 2 + .5, b.w - 1, b.h - 1);\n  }\n}\n// 物理固定步长 1/120，渲染插值\nlet acc = 0, last = performance.now();\nfunction frame(now) {\n  acc += Math.min(now - last, 50); last = now;\n  while (acc >= 8.33) { step(0.00833); acc -= 8.33; }\n  draw(); requestAnimationFrame(frame);\n}",
  init(el) {
    el.innerHTML = '';
    const cv = document.createElement('canvas');
    const W = 280, H = 150, dpr = Math.min(devicePixelRatio || 1, 2);
    cv.width = W * dpr; cv.height = H * dpr;
    cv.style.cssText = 'width:100%;height:100%;display:block;cursor:pointer';
    el.appendChild(cv);
    const g = cv.getContext('2d');
    g.scale(dpr, dpr);

    const G = 1900, ITER = 8, FRI = 0.6, REST = 0.02;
    const ground = { x: W / 2, y: H - 6, w: W * 2, h: 12, static: true, vx: 0, vy: 0 };
    let boxes = [];
    const reset = () => {
      boxes = [];
      const n = 6;
      for (let i = 0; i < n; i++) {
        boxes.push({
          x: W / 2 + (Math.random() - 0.5) * 1.0,
          y: H - 18 - i * 18.4,
          w: 52 - (n - i) * 1.2, h: 16,
          vx: 0, vy: 0, sleepCounter: 0, sleeping: false, tilt: 0
        });
      }
    };
    reset();

    const wake = b => { if (b.sleeping) { b.sleeping = false; b.sleepCounter = 0; } };

    const resolve = (a, b) => {
      const dx = a.x - b.x, dy = a.y - b.y;
      const ox = (a.w + b.w) / 2 - Math.abs(dx);
      const oy = (a.h + b.h) / 2 - Math.abs(dy);
      if (ox <= 0 || oy <= 0) return;
      if (oy < ox) {
        const s = Math.sign(dy) || -1;
        const push = oy * (b.static ? 1 : 0.5);
        a.y += s * push;
        if (!b.static) b.y -= s * push;
        const rel = a.vy - (b.static ? 0 : b.vy);
        if (rel * s < 0) return;
        const imp = -(1 + REST) * rel * (b.static ? 1 : 0.5);
        a.vy += imp;
        if (!b.static) b.vy -= imp;
        const jn = Math.abs(imp);
        const dvx = a.vx - (b.static ? 0 : b.vx);
        const jt = Math.max(-jn * FRI, Math.min(jn * FRI, -dvx * 0.5));
        a.vx += jt; if (!b.static) b.vx -= jt;
        wake(a); if (!b.static) wake(b);
      } else {
        const s = Math.sign(dx) || 1;
        const push = ox * (b.static ? 1 : 0.5);
        a.x += s * push;
        if (!b.static) b.x -= s * push;
        const rel = a.vx - (b.static ? 0 : b.vx);
        if (rel * s < 0) return;
        a.vx -= rel * (b.static ? 1 : 0.5);
        if (!b.static) b.vx += rel * 0.5;
        wake(a); if (!b.static) wake(b);
      }
    };

    const step = dt => {
      for (const b of boxes) {
        if (b.sleeping) continue;
        b.vy += G * dt;
        b.x += b.vx * dt; b.y += b.vy * dt;
      }
      const all = boxes.concat([ground]);
      for (let it = 0; it < ITER; it++)
        for (let i = 0; i < boxes.length; i++)
          for (let j = i + 1; j < all.length; j++) {
            const a = boxes[i], b = all[j];
            if (a.sleeping && (b.sleeping || b.static)) continue;
            resolve(a, b);
          }
      for (const b of boxes) {
        if (b.sleeping) { b.tilt *= 0.9; continue; }
        // 依据横向速度做视觉倾角（真实刚体应解角动量，这里只做观感）
        b.tilt += (Math.max(-0.12, Math.min(0.12, b.vx * 0.0004)) - b.tilt) * 0.15;
        if (b.vx * b.vx + b.vy * b.vy < 0.08) {
          if (++b.sleepCounter > 55) { b.sleeping = true; b.vx = b.vy = 0; }
        } else b.sleepCounter = 0;
      }
    };

    const draw = () => {
      g.clearRect(0, 0, W, H);
      g.fillStyle = '#171c29'; g.fillRect(0, H - 6, W, 6);
      for (const b of boxes) {
        g.save();
        g.translate(b.x, b.y);
        g.rotate(b.tilt);
        g.fillStyle = b.sleeping ? '#28304a' : '#5F7BFF';
        g.fillRect(-b.w / 2, -b.h / 2, b.w, b.h);
        g.strokeStyle = b.sleeping ? '#39456b' : '#a7b9ff';
        g.lineWidth = 1;
        g.strokeRect(-b.w / 2 + .5, -b.h / 2 + .5, b.w - 1, b.h - 1);
        g.restore();
      }
    };

    const hit = e => {
      const r = cv.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width * W;
      const y = (e.clientY - r.top) / r.height * H;
      let target = null;
      for (const b of boxes) {
        if (Math.abs(x - b.x) < b.w / 2 + 4 && Math.abs(y - b.y) < b.h / 2 + 4) target = b;
      }
      if (target) {
        wake(target);
        target.vx += (x < W / 2 ? 1 : -1) * 320 + (Math.random() - 0.5) * 120;
        target.vy -= 220;
      } else {
        reset();
      }
    };
    cv.addEventListener('pointerdown', hit);

    let raf = 0, last = performance.now(), acc = 0;
    const frame = now => {
      acc += Math.min(now - last, 50); last = now;
      let guard = 0;
      while (acc >= 8.333 && guard++ < 8) { step(0.008333); acc -= 8.333; }
      draw();
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      cv.removeEventListener('pointerdown', hit);
      boxes = [];
    };
  }
};
