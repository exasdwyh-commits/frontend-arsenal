export default {
  id: 'path-arc-length', group: 'space', name: '路径匀速运动', lib: 'Canvas 2D',
  desc: '元素沿贝塞尔曲线移动，速度恒定——不是按参数 t 采样那种"两头快中间慢"。',
  note: '按 t 采样三次贝塞尔必然快慢不均（t=0.5 附近最快）。Lottie 的做法是先用 200 段折线累计弧长建表，再把时间映射回弧长位置。这个方法叫 arc-length reparameterization，是所有"对路径动画"的基础，找不到它就只能做出抖动的假匀速。',
  code: `// 1. 建弧长表：200 段折线累计长度
function buildTable(p0, p1, p2, p3, N = 200) {
  const tbl = [{ t: 0, len: 0 }];
  let total = 0, prev = p0;
  for (let i = 1; i <= N; i++) {
    const t = i / N;
    const pt = cubicAt(p0, p1, p2, p3, t);
    total += Math.hypot(pt.x - prev.x, pt.y - prev.y);
    tbl.push({ t, len: total });
    prev = pt;
  }
  return { tbl, total };
}

// 2. 按弧长反查 t（二分）
function tAtLength(tbl, target) {
  let lo = 0, hi = tbl.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (tbl[mid].len < target) lo = mid + 1; else hi = mid;
  }
  return tbl[lo].t;
}

// 3. 匀速推进
const { tbl, total } = buildTable(...pts);
const t = tAtLength(tbl, (elapsed / duration) * total);`,
  init(el) {
    const cv = document.createElement('canvas');
    cv.width = 280; cv.height = 150;
    el.appendChild(cv);
    const c = cv.getContext('2d');
    const W = cv.width, H = cv.height;
    // 三次贝塞尔控制点
    const p0 = { x: 30, y: 120 }, p1 = { x: 40, y: 20 },
          p2 = { x: 240, y: 20 }, p3 = { x: 250, y: 120 };

    const cubicAt = (a, b, cp, d, t) => {
      const mt = 1 - t;
      const x = mt*mt*mt*a.x + 3*mt*mt*t*b.x + 3*mt*t*t*cp.x + t*t*t*d.x;
      const y = mt*mt*mt*a.y + 3*mt*mt*t*b.y + 3*mt*t*t*cp.y + t*t*t*d.y;
      return { x, y };
    };
    // 建弧长表
    const N = 200, tbl = [{ t: 0, len: 0 }];
    let total = 0, prev = p0;
    for (let i = 1; i <= N; i++) {
      const t = i / N;
      const pt = cubicAt(p0, p1, p2, p3, t);
      total += Math.hypot(pt.x - prev.x, pt.y - prev.y);
      tbl.push({ t, len: total });
      prev = pt;
    }
    const tAtLen = target => {
      let lo = 0, hi = tbl.length - 1;
      while (lo < hi) { const m = (lo + hi) >> 1; if (tbl[m].len < target) lo = m + 1; else hi = m; }
      return tbl[lo].t;
    };

    let raf, t0 = performance.now();
    const DUR = 2600;
    const loop = () => {
      const el2 = (performance.now() - t0) % (DUR + 600);
      const p = Math.min(el2 / DUR, 1);
      c.clearRect(0, 0, W, H);
      // 画路径
      c.beginPath();
      c.moveTo(p0.x, p0.y);
      c.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
      c.strokeStyle = 'rgba(95,59,255,.35)';
      c.lineWidth = 1.5;
      c.setLineDash([4, 4]);
      c.stroke();
      c.setLineDash([]);
      // 匀速位置
      const t = tAtLen(p * total);
      const pos = cubicAt(p0, p1, p2, p3, t);
      // 对比：非匀速位置（直接按 p 采样）
      const wrong = cubicAt(p0, p1, p2, p3, p);
      c.beginPath(); c.arc(wrong.x, wrong.y, 3.5, 0, 7);
      c.fillStyle = 'rgba(192,68,68,.55)'; c.fill();
      // 主球
      c.beginPath(); c.arc(pos.x, pos.y, 7, 0, 7);
      const g = c.createRadialGradient(pos.x - 2, pos.y - 2, 1, pos.x, pos.y, 9);
      g.addColorStop(0, '#BFEA1A'); g.addColorStop(1, '#3CCBFF');
      c.fillStyle = g; c.fill();
      // 图例
      c.fillStyle = '#5b6478'; c.font = '9px sans-serif';
      c.fillText('绿=匀速  红=按t采样', 8, 14);
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }
};
