export default {
  id: 'rapier-ragdoll-2d', group: 'physics', name: '2D 布娃娃（关节角度限制）', lib: '物理积分',
  desc: '小人由头、躯干、四肢用关节连起来，鼠标一拽整体瘫软摆动，关节不会折反。',
  deps: '无（手写 Verlet + 距离/角度双重约束）',
  note: '关节限制（Rapier 的 jointLimits / Matter 的 angularStiffness）不能只靠距离约束——距离锁不住“膝盖反折”。正确顺序：先解距离（把两端拉到正确长度），再做限制步把角度夹回 [min,max]（比如肘 5°~150°），限制步放在最后一次距离迭代之后，否则下一轮又被拉回反折。',
  code: "// 骨骼树：每段 = 两个质点 + 关节角度限制\nconst J = [ // {a, b, parent, min, max}\n  { a: 'hip',  b: 'chest', parent: null,  min: -0.35, max: 0.35 },\n  { a: 'chest',b: 'neck',  parent: null,  min: -0.3,  max: 0.3  },\n  { a: 'hip',  b: 'lKnee', parent: 'torso', min: 0.0, max: 1.9 },\n  { a: 'lKnee',b: 'lFoot', parent: 'thighL', min: 0.0, max: 2.1 },\n  { a: 'hip',  b: 'rKnee', parent: 'torso', min: -1.9, max: 0 },\n  { a: 'rKnee',b: 'rFoot', parent: 'thighR', min: -2.1, max: 0 },\n];\n// 每步：1) Verlet 积分  2) 距离约束 ×8  3) 角度限制 ×4（夹在最后一次距离之后）\nfunction limitAngle(j) {\n  const ang = Math.atan2(P[j.b].y - P[j.a].y, P[j.b].x - P[j.a].x);\n  const base = parentAngle(j) + Math.PI;\n  let rel = ang - base;\n  while (rel > Math.PI) rel -= 2 * Math.PI;\n  while (rel < -Math.PI) rel += 2 * Math.PI;\n  const clamped = Math.max(j.min, Math.min(j.max, rel));\n  if (Math.abs(clamped - rel) < 1e-4) return;\n  const L = Math.hypot(P[j.b].x - P[j.a].x, P[j.b].y - P[j.a].y);\n  const target = base + clamped;\n  P[j.b].x = P[j.a].x + Math.cos(target) * L;\n  P[j.b].y = P[j.a].y + Math.sin(target) * L;\n}",
  init(el) {
    el.innerHTML = '';
    const cv = document.createElement('canvas');
    const W = 280, H = 150, dpr = Math.min(devicePixelRatio || 1, 2);
    cv.width = W * dpr; cv.height = H * dpr;
    cv.style.cssText = 'width:100%;height:100%;display:block;cursor:grab;touch-action:none';
    el.appendChild(cv);
    const g = cv.getContext('2d');
    g.scale(dpr, dpr);

    // 质点
    const A = {};
    const mk2 = (x, y) => ({ x, y, px: x, py: y });
    const reset = () => {
      const cx = W / 2, hipY = H - 62;
      A.head  = mk2(cx, hipY - 52);
      A.neck  = mk2(cx, hipY - 34);
      A.chest = mk2(cx, hipY - 16);
      A.hip   = mk2(cx, hipY);
      A.lHand = mk2(cx - 26, hipY - 10);
      A.lElb  = mk2(cx - 15, hipY - 22);
      A.rHand = mk2(cx + 26, hipY - 10);
      A.rElb  = mk2(cx + 15, hipY - 22);
      A.lKnee = mk2(cx - 10, hipY + 20);
      A.lFoot = mk2(cx - 12, hipY + 40);
      A.rKnee = mk2(cx + 10, hipY + 20);
      A.rFoot = mk2(cx + 12, hipY + 40);
    };
    reset();

    // 段：名字 + 两端 + 长度
    const bones = [
      ['head', 'neck'], ['neck', 'chest'], ['chest', 'hip'],
      ['chest', 'lElb'], ['lElb', 'lHand'],
      ['chest', 'rElb'], ['rElb', 'rHand'],
      ['hip', 'lKnee'], ['lKnee', 'lFoot'],
      ['hip', 'rKnee'], ['rKnee', 'rFoot'],
      ['head', 'lHand'], ['head', 'rHand']       // 头手软约束，防手穿头
    ].map(([a, b]) => {
      const L = Math.hypot(A[a].x - A[b].x, A[a].y - A[b].y);
      return { a, b, L, soft: a === 'head' && b !== 'neck' };
    });

    // 角度限制：relative to parent bone
    const limits = [
      { root: 'hip', via: 'chest', tip: 'lKnee', min: 0.1, max: 1.9 },   // 左大腿
      { root: 'lKnee', via: 'hip', tip: 'lFoot', min: -2.0, max: -0.1 }, // 左小腿（只往后弯）
      { root: 'hip', via: 'chest', tip: 'rKnee', min: -1.9, max: -0.1 },
      { root: 'rKnee', via: 'hip', tip: 'rFoot', min: 0.1, max: 2.0 },
      { root: 'chest', via: 'lElb', tip: 'lHand', min: -0.2, max: 2.3 }, // 肘
      { root: 'chest', via: 'rElb', tip: 'rHand', min: -2.3, max: 0.2 }
    ];

    const angle = (p, q) => Math.atan2(q.y - p.y, q.x - p.x);
    const applyLimit = lim => {
      const R = A[lim.root], V = A[lim.via], T = A[lim.tip];
      const base = angle(R, V);
      let rel = angle(R, T) - base;
      while (rel > Math.PI) rel -= 2 * Math.PI;
      while (rel < -Math.PI) rel += 2 * Math.PI;
      const c = Math.max(lim.min, Math.min(lim.max, rel));
      if (Math.abs(c - rel) < 1e-3) return;
      const L = Math.hypot(T.x - R.x, T.y - R.y) || 1;
      T.x = R.x + Math.cos(base + c) * L;
      T.y = R.y + Math.sin(base + c) * L;
    };

    let grab = null, raf = 0, last = 0, acc = 0;
    const toLocal = e => {
      const r = cv.getBoundingClientRect();
      return { x: (e.clientX - r.left) / r.width * W, y: (e.clientY - r.top) / r.height * H };
    };
    const down = e => {
      const m = toLocal(e);
      let best = null, bd = 30;
      for (const k in A) {
        const d = Math.hypot(A[k].x - m.x, A[k].y - m.y);
        if (d < bd) { bd = d; best = k; }
      }
      grab = best;
      cv.style.cursor = best ? 'grabbing' : 'grab';
    };
    const move = e => {
      if (!grab) return;
      const m = toLocal(e);
      A[grab].x = m.x; A[grab].y = m.y;
    };
    const up = () => { grab = null; cv.style.cursor = 'grab'; };
    cv.addEventListener('pointerdown', down);
    addEventListener('pointermove', move);
    addEventListener('pointerup', up);
    cv.addEventListener('dblclick', reset);

    const step = () => {
      // 1) Verlet 积分
      for (const k in A) {
        if (k === grab) continue;
        const p = A[k];
        const vx = (p.x - p.px) * 0.986, vy = (p.y - p.py) * 0.986;
        p.px = p.x; p.py = p.y;
        p.x += vx; p.y += vy + 1.05;
      }
      // 2) 距离约束
      for (let it = 0; it < 8; it++) {
        for (const b of bones) {
          const p = A[b.a], q = A[b.b];
          const dx = q.x - p.x, dy = q.y - p.y;
          const d = Math.hypot(dx, dy) || 1e-6;
          const diff = (d - b.L) / d * (b.soft ? 0.18 : 0.5);
          const wa = p.px !== undefined && b.a !== grab ? 1 : 0;
          const wb = b.b !== grab ? 1 : 0;
          p.x += dx * diff * wa; p.y += dy * diff * wa;
          q.x -= dx * diff * wb; q.y -= dy * diff * wb;
        }
      }
      // 3) 角度限制：必须放在最后一次距离解算之后
      for (let it = 0; it < 4; it++) for (const l of limits) applyLimit(l);

      // 地面 / 边界
      for (const k in A) {
        const p = A[k];
        if (p.y > H - 6) { p.y = H - 6; p.x -= (p.x - p.px) * 0.4; }
        if (p.x < 6) p.x = 6;
        if (p.x > W - 6) p.x = W - 6;
      }
    };

    const draw = () => {
      g.clearRect(0, 0, W, H);
      g.fillStyle = '#171c29'; g.fillRect(0, H - 5, W, 5);
      g.lineCap = 'round';
      for (const b of bones) {
        if (b.soft) continue;
        const p = A[b.a], q = A[b.b];
        const taut = Math.hypot(q.x - p.x, q.y - p.y) / b.L;
        g.strokeStyle = taut > 1.06 ? '#ffb454' : '#6f88ff';
        g.lineWidth = b.a === 'chest' || b.b === 'chest' ? 5 : 4;
        g.beginPath(); g.moveTo(p.x, p.y); g.lineTo(q.x, q.y); g.stroke();
      }
      // 头
      g.fillStyle = '#a9bbff';
      g.beginPath(); g.arc(A.head.x, A.head.y, 8, 0, 6.2832); g.fill();
      // 关节
      g.fillStyle = '#e6ecff';
      for (const k of ['hip', 'chest', 'lElb', 'rElb', 'lKnee', 'rKnee']) {
        g.beginPath(); g.arc(A[k].x, A[k].y, 2, 0, 6.2832); g.fill();
      }
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
      cv.removeEventListener('dblclick', reset);
    };
  }
};
