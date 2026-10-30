export default {
  id: 'p5-dpr-sharp', group: 'data', name: '高清像素网格', lib: 'p5.js',
  desc: '数据方块网格铺满卡片，DPR 2 下边缘依然锐利——把 pixelDensity 的坑一次讲清。',
  deps: '无',
  note: 'canvas.width 是物理像素、style.width 是 CSS 像素，两者比值就是 pixelDensity；只改 width 不改 style 会让 300px 的卡片被撑成 600px。DPR 上限必须夹到 2，三星/部分 Android 报 3.5~4，像素数直接翻 12 倍直接卡死。',
  code: `// p5：pixelDensity 的本质是 backing store 缩放
// p5 内部：createCanvas(w,h) 时 canvas.width = w * pixelDensity()
// 手写 canvas 时必须三步全做：
const dpr = Math.min(2, devicePixelRatio || 1);   // 别信 3、4 的 DPR
canvas.width = cssW * dpr;                        // 物理像素
canvas.height = cssH * dpr;
canvas.style.width = cssW + 'px';                 // CSS 像素 —— 漏了这行画布会被撑大
canvas.style.height = cssH + 'px';
ctx.scale(dpr, dpr);                              // 之后一律用 CSS 像素作图
// 线宽：1px 在 DPR=2 上要写 0.5，否则 2 个物理像素粗，看着发糊`,
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
    const COLS = 20, ROWS = 8, GAP = 2;
    const cw = (W - GAP * (COLS - 1)) / COLS, ch = (H - GAP * (ROWS - 1)) / ROWS;
    const cells = [];
    for (let i = 0; i < COLS * ROWS; i++) cells.push({ v: 0, tv: 0, ph: Math.random() * 6.28 });
    let t = 0, nextAt = 0;
    const tick = (now) => {
      t += 0.03;
      // 每 120ms 重算一批目标值（模拟数据推送）
      if (now > nextAt) {
        nextAt = now + 120;
        for (let k = 0; k < 14; k++) cells[Math.floor(Math.random() * cells.length)].tv = Math.random();
      }
      ctx.clearRect(0, 0, W, H);
      for (let i = 0; i < cells.length; i++) {
        const c = cells[i];
        c.v += (c.tv - c.v) * 0.12;
        const x = (i % COLS) * (cw + GAP), y = Math.floor(i / COLS) * (ch + GAP);
        const a = 0.10 + c.v * 0.82;
        const hue = 258 - c.v * 40;
        ctx.fillStyle = 'hsla(' + hue + ',75%,' + (42 + c.v * 26) + '%,' + a.toFixed(3) + ')';
        ctx.fillRect(x, y, cw, ch);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return destroy;
  }
};
