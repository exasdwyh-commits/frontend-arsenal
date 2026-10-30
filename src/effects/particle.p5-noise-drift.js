export default {
  id: 'p5-noise-drift', group: 'particle', name: '柏林噪声漂浮', lib: 'p5.js',
  desc: '每个光点的方向由 noise(x, y, 时间) 决定，天然形成成团的涡流，而不是乱飞。',
  deps: '无（p5 的 noise 算法已内联，只用了 2KB）',
  note: 'p5 的 noise() 返回值域是 0~1（不是 -1~1），必须 map 到 [-1,1] 才有双向漂移；采样步长太小（<0.002）会让所有粒子同步成一个巨大的呼吸，一般取 0.005~0.02。perlin_octaves 默认 4，改成 8 颜值提升但耗时翻倍。',
  code: `// p5：noise() 结果 0~1，要用 map 归一到 [-1,1]
function draw() {
  const t = frameCount * 0.006;                 // 时间轴独立于坐标轴
  for (const p of pts) {
    const a = map(noise(p.x * 0.006, p.y * 0.006, t), 0, 1, 0, TWO_PI * 2);
    p.vx = lerp(p.vx, cos(a) * 0.6, 0.08);      // 惯性让转向不突变
    p.vy = lerp(p.vy, sin(a) * 0.6, 0.08);
    p.x += p.vx; p.y += p.vy;
    if (p.x < 0) p.x += width; if (p.x > width) p.x -= width;
  }
  noiseDetail(4, 0.5);                           // octaves / falloff，影响"团块感"
  noiseSeed(42);                                 // 固定随机表，刷新图案一致
}`,
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
    /* ---- p5 noise 移植（PERLIN_SIZE 4095 + scaled cosine 插值）---- */
    const PERLIN_SIZE = 4095, YWRAPB = 4, YWRAP = 16, ZWRAPB = 8, ZWRAP = 256;
    const perlin = new Array(PERLIN_SIZE + 1);
    for (let i = 0; i <= PERLIN_SIZE; i++) perlin[i] = Math.random();
    const sc = i => 0.5 * (1 - Math.cos(i * Math.PI));
    const noise = (x, y = 0, z = 0, oct = 4) => {
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
    const N = 160;
    const pts = [];
    for (let i = 0; i < N; i++) pts.push({ x: Math.random() * W, y: Math.random() * H, vx: 0, vy: 0, s: 0.6 + Math.random() * 1.4 });
    let t = 0;
    const tick = () => {
      t += 0.016;
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgba(14,17,24,.22)';        // 拖尾：不清屏只压暗
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < N; i++) {
        const p = pts[i];
        const a = (noise(p.x * 0.006, p.y * 0.006, t * 0.12) * 4) * Math.PI * 2;
        p.vx += (Math.cos(a) * 0.55 - p.vx) * 0.06;
        p.vy += (Math.sin(a) * 0.55 - p.vy) * 0.06;
        p.x += p.vx; p.y += p.vy;
        if (p.x < -4) p.x = W + 4; if (p.x > W + 4) p.x = -4;
        if (p.y < -4) p.y = H + 4; if (p.y > H + 4) p.y = -4;
        const nv = noise(p.x * 0.02, p.y * 0.02, t * 0.3);
        ctx.fillStyle = 'rgba(' + Math.round(120 + nv * 80) + ',150,255,' + (0.25 + nv * 0.55).toFixed(2) + ')';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.s * (0.7 + nv * 0.8), 0, 6.2832);
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    return destroy;
  }
};
