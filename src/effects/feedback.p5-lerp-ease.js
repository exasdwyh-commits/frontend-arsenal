export default {
  id: 'p5-lerp-ease', group: 'feedback', name: '帧率无关缓动', lib: 'p5.js',
  desc: '把 lerp 改成 pow(1-k, dt/16.67)：60Hz 和 144Hz 屏幕上同一段动画的快慢完全一致。',
  deps: '无',
  note: '最经典的坑：lerp(x, target, 0.1) 写在 draw() 里，144Hz 屏上速度会快 2.4 倍。必须用 lerp(x, target, 1 - pow(1 - 0.1, dt / 16.667)) 做帧率归一。另外 map() 第五个参数 withinBounds 默认 false，不传就会出现指针悬停时颜色值溢出到非法 rgb。',
  code: `// p5：帧率归一化的指数缓动
let x = 0;
function draw() {
  const dt = Math.min(64, deltaTime);                 // 切标签页回来会有一个超大 dt，必须夹住
  const k = 1 - Math.pow(1 - 0.15, dt / 16.667);      // 0.15 = 每 60Hz 帧的插值比例
  x = lerp(x, target, k);
  if (abs(target - x) < 0.01) x = target;             // 收敛后吸附，否则永远追不到
}
// map 的 withinBounds 一定要传 true（p5 默认 false）：
// c = lerpColor(lo, hi, map(x, 0, w, 0, 1, true))`,
  init(el) {
    const DPR = Math.min(2, el.ownerDocument.defaultView.devicePixelRatio || 1);
    const W = Math.min(300, el.clientWidth || 300), H = 130;
    const doc = el.ownerDocument;
    const cv = doc.createElement('canvas');
    cv.width = W * DPR; cv.height = H * DPR;
    cv.style.width = W + 'px'; cv.style.height = H + 'px'; cv.style.display = 'block';
    const ctx = cv.getContext('2d');
    ctx.scale(DPR, DPR);
    el.innerHTML = ''; el.appendChild(cv);
    let raf = 0;
    const destroy = () => cancelAnimationFrame(raf);
    const ROWS = [
      { label: '0.10', x: 0, kBase: 0.10, hue: 262 },
      { label: '0.18', x: 0, kBase: 0.18, hue: 200 },
      { label: '0.30', x: 0, kBase: 0.30, hue: 160 }
    ];
    let target = 0, dir = 1, hold = 0, last = performance.now();
    const R = 7;
    const tick = (now) => {
      const dt = Math.min(64, now - last); last = now;
      ctx.clearRect(0, 0, W, H);
      hold -= dt;
      if (hold <= 0) { dir = -dir; target = dir > 0 ? W - 24 : 12; hold = 900; }
      ROWS.forEach((r, i) => {
        const y = 24 + i * 30;
        // 帧率归一化插值：同样的 kBase，在任意刷新率下速度一致
        const k = 1 - Math.pow(1 - r.kBase, dt / 16.667);
        r.x += (target - r.x) * k;
        if (Math.abs(target - r.x) < 0.4) r.x = target;
        const p = 12 / (W - 24);
        ctx.strokeStyle = 'rgba(255,255,255,.06)';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(12, y); ctx.lineTo(W - 12, y); ctx.stroke();
        ctx.fillStyle = 'hsla(' + r.hue + ',80%,62%,.9)';
        ctx.beginPath(); ctx.arc(r.x, y, R, 0, 6.2832); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,.35)';
        ctx.font = '9px ui-monospace,monospace';
        ctx.fillText('k=' + r.label, 12, y - 12);
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return destroy;
  }
};
