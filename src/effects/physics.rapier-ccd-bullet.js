export default {
  id: 'rapier-ccd-bullet', group: 'physics', name: 'CCD 连续碰撞 vs 穿模', lib: '物理积分',
  desc: '两颗子弹射向薄墙：关掉 CCD 的那颗整块穿墙飞走，开着的那颗被弹回。',
  deps: '无（手写射线扫掠 + CCD 判定）',
  note: 'Rapier 的判据是 max_point_velocity × dt > 0.5 × ccd_thickness（取碰撞体最薄轴）才开 CCD。薄墙厚 6px、60fps 下速度超过 180px/s 就必须开，否则一帧位移超过墙厚直接穿过去。别用“每秒步数”兜底——半径小于墙厚的球即使 8 子步也会漏。',
  code: "// 每帧：先算本帧位移，再沿位移做 swept test（球 vs AABB 的线段求交）\nfunction sweptSphereVsWall(cx, cy, r, vx, vy, dt, wall) {\n  // 扫掠胶囊 = 球沿线段移动，AABB 膨胀 r 后做线段求交\n  const minx = wall.x - wall.w / 2 - r, maxx = wall.x + wall.w / 2 + r;\n  const miny = wall.y - wall.h / 2 - r, maxy = wall.y + wall.h / 2 + r;\n  const dx = vx * dt, dy = vy * dt;\n\n  // Liang–Barsky / slab 法\n  let t0 = 0, t1 = 1;\n  const clip = (p, q) => {         // p*t <= q\n    if (Math.abs(p) < 1e-9) return q >= 0;\n    const t = q / p;\n    if (p < 0) { if (t > t1) return false; if (t > t0) t0 = t; }\n    else       { if (t < t0) return false; if (t < t1) t1 = t; }\n    return true;\n  };\n  if (!clip(-dx, cx - minx)) return null;\n  if (!clip(dx, maxx - cx)) return null;\n  if (!clip(-dy, cy - miny)) return null;\n  if (!clip(dy, maxy - cy)) return null;\n  return t0;                        // 撞击时刻占本帧的比例\n}\n\n// 开启 CCD：\nconst t = sweptSphereVsWall(b.x, b.y, b.r, b.vx, b.vy, dt, wall);\nif (t !== null) {                   // 本帧会撞 → 只推进到撞击点，速度反向\n  b.x += b.vx * dt * t;\n  b.y += b.vy * dt * t;\n  b.vx *= -0.92;\n  b.flash = 1;\n} else {\n  b.x += b.vx * dt;\n  b.y += b.vy * dt;\n}\n// 关闭 CCD（对照组）：只做位置回退，高速必穿\nb.x += b.vx * dt; b.y += b.vy * dt;",
  init(el) {
    el.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.style.cssText = 'position:relative;width:100%;height:100%';
    el.appendChild(wrap);
    const cv = document.createElement('canvas');
    const W = 280, H = 150, dpr = Math.min(devicePixelRatio || 1, 2);
    cv.width = W * dpr; cv.height = H * dpr;
    cv.style.cssText = 'width:100%;height:100%;display:block';
    wrap.appendChild(cv);
    const g = cv.getContext('2d');
    g.scale(dpr, dpr);
    const tag = document.createElement('div');
    tag.style.cssText = `position:absolute;inset:0;pointer-events:none;
      font:10px/1.5 ui-monospace,monospace;color:#8b93a7;padding:6px 8px`;
    wrap.appendChild(tag);

    const walls = [
      { x: W * 0.5, y: W * 0 - 0 + H * 0.26, w: 5, h: 150 },
      { x: W * 0.5, y: H * 0.76, w: 5, h: 150 }
    ];
    const mkBullet = (y, ccd, speed) => ({
      x: 16, y, r: 2.6, vx: speed, vy: 0, ccd, trail: [], flash: 0, bounce: 0
    });
    const bullets = [mkBullet(W * 0.5 - 34, false, 1400), mkBullet(W * 0.5 + 22, true, 1400)];

    const sweep = (cx, cy, r, vx, vy, dt, wall) => {
      const minx = wall.x - wall.w / 2 - r, maxx = wall.x + wall.w / 2 + r;
      const miny = wall.y - wall.h / 2 - r, maxy = wall.y + wall.h / 2 + r;
      const dx = vx * dt, dy = vy * dt;
      let t0 = 0, t1 = 1;
      const clip = (p, q) => {
        if (Math.abs(p) < 1e-9) return q >= 0;
        const t = q / p;
        if (p < 0) { if (t > t1) return false; if (t > t0) t0 = t; }
        else { if (t < t0) return false; if (t < t1) t1 = t; }
        return true;
      };
      if (!clip(-dx, cx - minx)) return null;
      if (!clip(dx, maxx - cx)) return null;
      if (!clip(-dy, cy - miny)) return null;
      if (!clip(dy, maxy - cy)) return null;
      return t0;
    };

    const FIXED = 1 / 120;
    const step = () => {
      for (const b of bullets) {
        const wall = walls[0];
        let hit = null;
        if (b.ccd) {
          const t = sweep(b.x, b.y, b.r, b.vx, b.vy, FIXED, wall);
          if (t !== null) hit = t;
        }
        if (hit !== null) {
          b.x += b.vx * FIXED * hit;
          b.vx *= -0.94;
          b.flash = 1;
          b.bounce++;
        } else {
          b.x += b.vx * FIXED;
        }
        b.y += b.vy * FIXED;
        b.trail.push(b.x, b.y);
        if (b.trail.length > 46) b.trail.splice(0, 2);
        b.flash *= 0.9;
        // 出界重置（关 CCD 那颗会一路飞出去）
        if (b.x > W + 20 || b.x < -20) {
          b.x = 16; b.y = b.ccd ? W * 0 - 0 + H * 0 + (b.y) : b.y;
          b.vx = 1400;
          b.trail.length = 0;
          if (b.bounce > 2) b.bounce = 0;
        }
      }
    };

    const draw = () => {
      g.clearRect(0, 0, W, H);
      // 墙
      for (const w of walls) {
        g.fillStyle = '#242c40';
        g.fillRect(w.x - w.w / 2, w.y - w.h / 2, w.w, w.h);
        g.fillStyle = '#3a4666';
        g.fillRect(w.x - w.w / 2, w.y - w.h / 2, 1, w.h);
      }
      for (const b of bullets) {
        // 轨迹
        for (let i = 0; i < b.trail.length; i += 2) {
          const a = (i / b.trail.length) * 0.65;
          g.fillStyle = b.ccd ? `rgba(90,210,255,${a})` : `rgba(255,120,140,${a})`;
          g.fillRect(b.trail[i] - 1, b.trail[i + 1] - 0.5, 2.4, 1);
        }
        g.fillStyle = b.ccd ? '#5ad2ff' : '#ff6b86';
        g.beginPath(); g.arc(b.x, b.y, b.r + b.flash * 2.5, 0, 6.2832); g.fill();
      }
      tag.innerHTML = `<span style="color:#ff6b86">● CCD off · 穿墙</span><br>
        <span style="color:#5ad2ff">● CCD on · 弹回</span>`;
    };

    let raf = 0, last = performance.now(), acc = 0;
    const frame = now => {
      acc += Math.min(now - last, 50); last = now;
      let guard = 0;
      while (acc >= 8.333 && guard++ < 10) { step(); acc -= 8.333; }
      draw();
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => cancelAnimationFrame(raf);
  }
};
