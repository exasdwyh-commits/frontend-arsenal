export default {
  id: 'p5-noiseline-stack', group: 'data', name: '噪声山脊线', lib: 'p5.js',
  desc: '一层层叠起来的噪声等高线，用极细描边做出"数据地形"质感，适合做图表背景。',
  deps: '无',
  note: '每条线用 beginShape/vertex 直接画 300 个点是灾难：改成把上一帧按 1px 下移再只画最新一条（scroll-buffer 技巧），CPU 占用能降 10 倍；分辨率超过 DPR 2 时线宽会糊，strokeWeight 要用 1/DPR。',
  code: `// p5：滚动缓冲 —— 不重画全部历史，只把画布下移 1px 再画新线
function draw() {
  const ctx = drawingContext;
  ctx.drawImage(canvas, 0, 1);             // 整体下移 1px 留出顶行
  noStroke(); fill(bg); rect(0, 0, width, 1);   // 清掉顶行的残影

  for (let layer = 0; layer < 6; layer++) {
    beginShape();
    for (let x = 0; x < width; x += 2) {
      const n = noise(x * 0.012, layer * 2.1, frameCount * 0.004);
      vertex(x, layer * 14 + map(n, 0, 1, -8, 8));
    }
    endShape();
  }
}
// noiseDetail(3, .5) 让线条更平滑；octaves=4 是默认，图层多时要降到 2~3`,
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
    const PERLIN_SIZE = 4095, YWRAPB = 4, YWRAP = 16, ZWRAPB = 8, ZWRAP = 256;
    const perlin = new Array(PERLIN_SIZE + 1);
    for (let i = 0; i <= PERLIN_SIZE; i++) perlin[i] = Math.random();
    const sc = i => 0.5 * (1 - Math.cos(i * Math.PI));
    const noise = (x, y = 0, z = 0, oct = 3) => {
      x = Math.abs(x); y = Math.abs(y); z = Math.abs(z);
      let xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
      let xf = x - xi, yf = y - yi, zf = z - zi, r = 0, ampl = 0.5, n1, n2, n3, rxf, ryf;
      for (let o = 0; o < oct; o++) {
        let of = xi + (yi << YWRAPB) + (zi << ZWRAPB);
        rxf = sc(xf); ryf = sc(yf);
        n1 = perlin[of & PERLIN_SIZE]; n1 += rxf * (perlin[(of + 1) & PERLIN_SIZE] - n1);
        n2 = perlin[(of + YWRAP) & PERLIN_SIZE]; n2 += rxf * (perlin[(of + YWRAP + 1) & PERLIN_SIZE] - n2);
        n1 += ryf * (n2 - n1);
        of += ZWRAP;
        n2 = perlin[of & PERLIN_SIZE]; n2 += rxf * (perlin[(of + 1) & PERLIN_SIZE] - n2);
        n3 = perlin[(of + YWRAP) & PERLIN_SIZE]; n3 += rxf * (perlin[(of + YWRAP + 1) & PERLIN_SIZE] - n3);
        n2 += ryf * (n3 - n2);
        n1 += sc(zf) * (n2 - n1);
        r += n1 * ampl; ampl *= 0.5;
        xi <<= 1; xf *= 2; if (xf >= 1) { xi++; xf--; }
        yi <<= 1; yf *= 2; if (yf >= 1) { yi++; yf--; }
        zi <<= 1; zf *= 2; if (zf >= 1) { zi++; zf--; }
      }
      return r;
    };
    const LAYERS = 6, SPACING = H / (LAYERS + 1);
    let t0 = 0, scroll = 0;
    const drawRidge = x0 => {
      for (let L = 0; L < LAYERS; L++) {
        const n = noise(x0 * 0.014, L * 2.3, t0);
        const y = H - (L + 1) * SPACING + (n - 0.5) * SPACING * 1.4;
        const hue = 250 + L * 12;
        ctx.strokeStyle = 'hsla(' + hue + ',70%,' + (62 - L * 5) + '%,' + (0.9 - L * 0.1).toFixed(2) + ')';
        ctx.lineWidth = Math.max(0.6, 1 / DPR) * 1.2;
        ctx.beginPath();
        ctx.moveTo(x0, y - 1.6);
        ctx.lineTo(x0, y);
        ctx.stroke();
      }
    };
    // 初始铺满
    for (let x = 0; x < W; x++) drawRidge(x);
    const tick = () => {
      t0 += 0.0042;
      scroll++;
      // 滚动缓冲：整体左移 1px（数据从右往左走），再画最右一列
      const img = ctx.getImageData(1, 0, W - 1, H);
      ctx.putImageData(img, 0, 0);
      ctx.clearRect(W - 1, 0, 2, H);
      drawRidge(W - 1);
      // 只画了 6 层，右侧一列补背景
      ctx.fillStyle = '#0e1118';
      raf = requestAnimationFrame(tick);
    };
    tick();
    return destroy;
  }
};
