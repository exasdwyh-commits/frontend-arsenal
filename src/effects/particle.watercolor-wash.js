export default {
  id: 'watercolor-wash', group: 'particle', name: '程序化水彩晕染', lib: 'Canvas 2D + 原生 JS',
  desc: '色块从中心晕开：fbm 噪声扰动形状边缘做毛边，靠近边界处颜料堆积变深（edge pool），叠颗粒与斑驳，最后墨线从笔尖到笔尾画出 + 溅点。移植自 baoyu-design 的 watercolor-kit 画水彩引擎（MIT）。',
  deps: '无',
  note: '水彩质感四件套，缺一就假：① 毛边 deckle——用低频 fbm 扰动每个像素到形状边界的距离，再拿它和扩张半径比大小，边界就成不规则湿边（不是给圆形加噪，是扰动 SDF）；② 边缘堆积 edgePool——离边界越近颜料越浓：dv += load*edgePool*exp(-d/edgeWidth)，这条是水彩「深边」的来源；③ 颗粒 granulation——用高频噪声乘在浓度上模拟纸纹吸色不均；④ 斑驳 mottle——低频噪声整体调深浅。晕开进度只改扩张半径，噪声场用固定 seed 预生成，保证每帧抖动一致、不是闪烁。墨线 tip-to-tail 用 arc-length 均匀取样再逐段画，别用 stroke-dashoffset（水彩笔尖要带粗细变化）。',
  code: `/* 低分辨率 buffer 算每像素 SDF+fbm，再放大到画布（0.5x 够用） */
// d = 到形状边界的带符号距离；nz = 预生成 fbm 场（固定 seed）
d0 = sdf(blob, x, y);
d  = d0 - nz[x,y]*deckle;              // ① 毛边：fbm 扰动 SDF
cover = smoothstep(r + feather, r - feather, d);  // 晕开：r 随进度长
dv = cover * load;
if (d < 0 && edgePool>0)
  dv += load*edgePool*Math.exp(-(-d)/edgeWidth)*(0.35+1.3*mottle[x,y]); // ② 深边
dv *= 1 + granulation*(0.5 - tooth[x,y])*2;                             // ③ 颗粒
// ④ 斑驳：低频 mottle 场整体调制
color = mix(paper, pigment, clamp(dv,0,1));

/* 墨线 tip-to-tail：弧长均匀取样 + 笔尖粗细 */
for (seg) { w = tipWidth(t); line(p(t), p(t+dt), w); t += speed*dt; }

/* 溅点：seeded 随机点在时间轴错峰弹出，带一点重力落点 */`,
  init(el) {
    const STYLE = '<style data-fx="watercolor-wash">' +
      '.wc{position:relative;width:100%;height:100%;overflow:hidden;background:#f6f1e6}' +
      '.wc canvas{display:block;width:100%;height:100%}' +
      '.wc-cap{position:absolute;bottom:5px;left:0;right:0;text-align:center;font-size:8px;' +
        'color:#9a8f78;letter-spacing:.1em;text-transform:uppercase;z-index:9;pointer-events:none}' +
      '</style>';
    el.insertAdjacentHTML('beforeend', STYLE +
      '<div class="wc"><canvas id="wcCv"></canvas><div class="wc-cap">毛边 · 深边 · 颗粒 · 墨线</div></div>');

    const cv = el.querySelector('#wcCv');
    const W = 280, H = 150, S = 0.5;           // 低分辨率算，放大绘
    const BW = Math.round(W * S), BH = Math.round(H * S);
    cv.width = W; cv.height = H;
    const ctx = cv.getContext('2d');
    const off = document.createElement('canvas');
    off.width = BW; off.height = BH;
    const octx = off.getContext('2d');
    const img = octx.createImageData(BW, BH);
    const px = img.data;

    // ---- seeded 值噪声 + fbm ----
    const hash = (x, y, s) => {
      let n = x * 374761393 + y * 668265263 + s * 1442695040;
      n = (n ^ (n >> 13)) * 1274126177;
      return ((n ^ (n >> 16)) >>> 0) / 4294967295;
    };
    const vnoise = (x, y, s) => {
      const xi = Math.floor(x), yi = Math.floor(y);
      const xf = x - xi, yf = y - yi;
      const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
      const a = hash(xi, yi, s), b = hash(xi + 1, yi, s);
      const c = hash(xi, yi + 1, s), d = hash(xi + 1, yi + 1, s);
      return (a + (b - a) * u) + ((c + (d - c) * u) - (a + (b - a) * u)) * v;
    };
    const fbm = (x, y, s, oct) => {
      let v = 0, amp = 0.5, fr = 1;
      for (let i = 0; i < oct; i++) { v += amp * vnoise(x * fr, y * fr, s + i * 17); amp *= 0.5; fr *= 2; }
      return v;
    };

    // ---- 预生成噪声场（固定 seed，帧间一致不闪烁）----
    const deckleF = new Float32Array(BW * BH);   // 毛边（低频）
    const mottleF = new Float32Array(BW * BH);   // 斑驳（低频）
    const toothF = new Float32Array(BW * BH);    // 颗粒（高频）
    for (let y = 0; y < BH; y++) for (let x = 0; x < BW; x++) {
      const i = y * BW + x;
      deckleF[i] = fbm(x * 0.09, y * 0.09, 5, 4) - 0.5;
      mottleF[i] = fbm(x * 0.05, y * 0.05, 91, 3);
      toothF[i] = vnoise(x * 0.9, y * 0.9, 333);
    }

    // ---- 形状：几片重叠椭圆的 blob（带符号距离近似）----
    const BLOBS = [
      { cx: 0.36, cy: 0.5, rx: 0.26, ry: 0.34, col: [58, 130, 168] },   // 蓝
      { cx: 0.6, cy: 0.44, rx: 0.2, ry: 0.28, col: [180, 120, 70] },    // 赭
      { cx: 0.5, cy: 0.66, rx: 0.22, ry: 0.2, col: [90, 150, 110] }     // 绿
    ];
    const PAPER = [246, 241, 230];

    // 墨线路径（一条 S 曲线，弧长取样）
    const curve = t => {
      const x = 0.22 + 0.56 * t;
      const y = 0.5 + 0.22 * Math.sin(t * Math.PI * 1.4) * (1 - t * 0.4);
      return [x * W, y * H];
    };
    const curveLen = 90;
    const pts = [];
    for (let i = 0; i <= curveLen; i++) pts.push(curve(i / curveLen));

    // 溅点（seeded）
    const SPLAT = [];
    let rs = 7;
    const rnd = () => { rs = (rs * 1103515245 + 12345) & 0x7fffffff; return rs / 0x7fffffff; };
    for (let i = 0; i < 14; i++)
      SPLAT.push({ x: (0.3 + rnd() * 0.44) * W, y: (0.32 + rnd() * 0.4) * H, r: 0.7 + rnd() * 2.2, at: 0.5 + rnd() * 0.45, col: i % 2 ? BLOBS[0].col : BLOBS[1].col });

    const clamp01 = x => x < 0 ? 0 : x > 1 ? 1 : x;
    const smooth = (e0, e1, x) => { const t = clamp01((x - e0) / (e1 - e0)); return t * t * (3 - 2 * t); };

    const DUR = 150;
    let raf, start = 0;
    const tick = now => {
      if (!start) start = now;
      const f = ((now - start) / 1000 * 30) % (DUR + 20);
      const p = clamp01(f / 110);                 // 0→1 主进度

      // 逐低分辨率像素：blob SDF + 毛边 + 深边 + 颗粒 + 斑驳
      for (let y = 0; y < BH; y++) {
        for (let x = 0; x < BW; x++) {
          const i = y * BW + x;
          let rSum = PAPER[0], gSum = PAPER[1], bSum = PAPER[2];
          for (let bi = 0; bi < BLOBS.length; bi++) {
            const B = BLOBS[bi];
            // 该 blob 的晕开半径（错峰：后一片晚一点）
            const bp = clamp01((p - bi * 0.12) / (1 - bi * 0.12));
            if (bp <= 0) continue;
            const R = bp * 1.05;
            const dx = (x / BW - B.cx) / B.rx, dy = (y / BH - B.cy) / B.ry;
            const d0 = (Math.sqrt(dx * dx + dy * dy) - 1) * B.rx * W * 0.5; // 带符号距离(px)
            const d = d0 - deckleF[i] * 14;                                  // ① 毛边扰动
            const feather = 7 + (1 - bp) * 10;
            let cover = smooth(R * 130 + feather, R * 130 - feather, -d);    // 晕开覆盖
            if (cover <= 0) continue;
            let dv = cover * 0.55;
            if (d < 0)                                                       // ② 深边堆积
              dv += 0.55 * 1.2 * Math.exp(d / 5) * (0.35 + 1.3 * mottleF[i]);
            dv *= 1 + 0.18 * (0.5 - toothF[i]) * 2;                          // ③ 颗粒
            dv = Math.max(0, Math.min(1, dv * (0.85 + 0.3 * mottleF[i])));   // ④ 斑驳
            rSum = rSum + (B.col[0] - rSum) * dv;
            gSum = gSum + (B.col[1] - gSum) * dv;
            bSum = bSum + (B.col[2] - bSum) * dv;
          }
          const o = i * 4;
          px[o] = rSum; px[o + 1] = gSum; px[o + 2] = bSum; px[o + 3] = 255;
        }
      }
      octx.putImageData(img, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(off, 0, 0, W, H);

      // 墨线 tip-to-tail（进度 0.55 后）
      const ip = clamp01((p - 0.55) / 0.4);
      if (ip > 0) {
        ctx.strokeStyle = 'rgba(30,28,26,0.82)';
        ctx.lineCap = 'round';
        const n = Math.floor(ip * curveLen);
        for (let i = 1; i <= n; i++) {
          const t = i / curveLen;
          const w = 2.6 * (1 - t * 0.5) + 0.6;      // 笔尖粗细变化
          ctx.lineWidth = w;
          ctx.beginPath();
          ctx.moveTo(pts[i - 1][0], pts[i - 1][1]);
          ctx.lineTo(pts[i][0], pts[i][1]);
          ctx.stroke();
        }
      }

      // 溅点（各自 at 错峰弹出）
      for (const sp of SPLAT) {
        const t = clamp01((p - sp.at) / 0.1);
        if (t <= 0) continue;
        const pop = t < 1 ? (1 + 1.4 * Math.pow(t - 1, 3) + 1.4 * Math.pow(t - 1, 2)) : 1;
        ctx.fillStyle = 'rgba(' + sp.col[0] + ',' + sp.col[1] + ',' + sp.col[2] + ',' + (0.7 * Math.min(1, t * 2)).toFixed(2) + ')';
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, Math.max(0.1, sp.r * pop), 0, 6.2832);
        ctx.fill();
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => { cancelAnimationFrame(raf); el.innerHTML = ''; };
  }
};
