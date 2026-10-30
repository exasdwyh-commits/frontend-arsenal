export default {
  id: 'light-board', group: 'entrance', name: '灯板跑马字',
  lib: 'Canvas 2D',
  desc: '文字被点阵化成一颗颗灯珠，在画布上循环滚动，像机场航显牌/老式翻页钟。移植自 Cult UI 的 Lightboard，它把整句话变成 canvas 上滚动的灯点图案。',
  deps: '无',
  note: '灯珠图案要先用离屏 canvas 把文字画一遍再 getImageData 采样成 0/1 矩阵，直接在主画布上一边画字一边画点会得到重影。滚动用"图案宽度取模"实现无缝循环：colIndex + offset 取模 patternWidth，offset 每帧 +1，别真的移动图案。采样分辨率（每行几颗灯）必须和绘制时的灯距一致，否则字会被拉扁。hover 时停的是 offset 的自增而不是 RAF 循环——直接 cancelAnimationFrame 会让灯的呼吸闪烁也一起卡死。',
  scenes: { places: ['首屏', '加载状态', '标题'], goals: ['营造氛围', '状态提示'], triggers: ['持续播放'], projects: ['品牌官网', '作品集', 'AI 产品'] },
  code: `/* 离屏画字 → getImageData 采样成灯珠矩阵 → 主画布滚动 */
const off = document.createElement('canvas');
off.width = cols; off.height = rows;
const octx = off.getContext('2d');
octx.fillStyle = '#fff';
octx.font = rows + 'px monospace';
octx.textBaseline = 'top';
octx.fillText(text, 0, 0);

const data = octx.getImageData(0, 0, cols, rows).data;
const pattern = [];
for (let y = 0; y < rows; y++) {
  pattern.push([]);
  for (let x = 0; x < cols; x++) pattern[y].push(data[(y * cols + x) * 4 + 3] > 128 ? 1 : 0);
}

/* 绘制时按列取模，图案宽度 = 无缝循环的关键 */
const draw = () => {
  ctx.clearRect(0, 0, W, H);
  for (let y = 0; y < rows; y++)
    for (let x = 0; x < cols; x++) {
      if (!pattern[y][(x + offset) % cols]) continue;
      ctx.beginPath();
      ctx.arc(x * pitch + r, y * pitch + r, r, 0, Math.PI * 2);
      ctx.fill();
    }
  offset = (offset + 1) % cols;      // 每帧只挪一列
};`,
  init(el) {
    const TEXT = 'CULT UI';
    const ROWS = 13;                 // 灯珠行数，决定字的解析度（≥12 才读得出字）
    const PITCH = 6;                 // 灯距（px，CSS 像素）
    const R = 2.1;

    const STYLE = `<style data-fx="light-board">
      .lb{display:flex;flex-direction:column;align-items:center;gap:10px}
      .lb-stage{position:relative;padding:12px 14px;border-radius:12px;cursor:pointer;
        background:radial-gradient(120% 140% at 50% 0%,#171c28,#0a0d13 72%);
        border:1px solid rgba(255,255,255,.07);
        box-shadow:inset 0 0 34px rgba(0,0,0,.65)}
      .lb-stage canvas{display:block}
      .lb-cap{font-size:9.5px;color:#4a5368;letter-spacing:.08em;text-transform:uppercase}
    </style>`;

    el.insertAdjacentHTML('beforeend', STYLE + `
      <div class="lb">
        <div class="lb-stage" id="lbStage"><canvas id="lbCv"></canvas></div>
        <div class="lb-cap">悬停停住 · 点击换字</div>
      </div>`);

    const stage = el.querySelector('#lbStage');
    const cv = el.querySelector('#lbCv');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let text = TEXT;
    let cols = 0, rows = ROWS, pitch = PITCH;
    let pattern = [];
    let offset = 0;
    let paused = false;
    let raf = 0;

    const build = () => {
      // 1) 离屏按"和主画布 1:1"的尺寸画字，再按 pitch 分格采样成灯珠矩阵
      const fontPx = rows * pitch * 0.72;
      const off = document.createElement('canvas');
      const octx = off.getContext('2d', { willReadFrequently: true });
      octx.font = fontPx + 'px ui-monospace, monospace';
      const textW = Math.ceil(octx.measureText(text).width) + 6;
      cols = Math.max(8, Math.ceil(textW / pitch));
      // 离屏尺寸 = 灯珠矩阵 × pitch（CSS 像素），画字和采样同一坐标系
      off.width = cols * pitch;
      off.height = rows * pitch;
      octx.fillStyle = '#fff';
      octx.font = fontPx + 'px ui-monospace, monospace';
      octx.textBaseline = 'middle';
      octx.fillText(text, 3, off.height / 2);

      const px = octx.getImageData(0, 0, off.width, off.height).data;
      pattern = [];
      for (let y = 0; y < rows; y++) {
        const line = [];
        for (let x = 0; x < cols; x++) {
          // 格内取最大 alpha：笔画只要扫过这格就点亮（取中心单像素会漏细笔画）
          let a = 0;
          for (let sy = 0; sy < pitch; sy++) {
            const rowBase = ((y * pitch + sy) * off.width + x * pitch) * 4;
            for (let sx = 0; sx < pitch; sx++) {
              const v = px[rowBase + sx * 4 + 3];
              if (v > a) a = v;
            }
          }
          line.push(a > 90 ? 1 : 0);
        }
        pattern.push(line);
      }

      // 2) 画布尺寸 = 灯珠矩阵尺寸（DPR 放大但逻辑尺寸不变）
      cv.width = Math.round(cols * pitch * dpr);
      cv.height = Math.round(rows * pitch * dpr);
      cv.style.width = cols * pitch + 'px';
      cv.style.height = rows * pitch + 'px';
      const ctx = cv.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = () => {
      const ctx = cv.getContext('2d');
      ctx.clearRect(0, 0, cv.width / dpr, cv.height / dpr);
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          if (!pattern[y][(x + offset) % cols]) continue;
          const hot = x === (offset + cols - 1) % cols;    // 扫过的一列最亮，做出"翻页"感
          ctx.fillStyle = hot ? 'rgba(226,228,255,.95)' : 'rgba(140,145,190,.62)';
          ctx.beginPath();
          ctx.arc(x * pitch + R, y * pitch + R, R, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    const loop = () => {
      // 停的是 offset 自增，不是 RAF：灯的底色呼吸还在
      if (!paused) offset = (offset + 1) % cols;
      draw();
      raf = requestAnimationFrame(loop);
    };

    const WORDS = ['CULT UI', 'WEBUI ATLAS', '111 EFFECTS', 'MIT LICENSE'];
    let wi = 0;

    build();
    loop();

    const onEnter = () => { paused = true; };
    const onLeave = () => { paused = false; };
    const onClick = () => { wi = (wi + 1) % WORDS.length; text = WORDS[wi]; offset = 0; build(); };

    stage.addEventListener('pointerenter', onEnter);
    stage.addEventListener('pointerleave', onLeave);
    stage.addEventListener('click', onClick);

    return () => {
      cancelAnimationFrame(raf);
      stage.removeEventListener('pointerenter', onEnter);
      stage.removeEventListener('pointerleave', onLeave);
      stage.removeEventListener('click', onClick);
      el.innerHTML = '';
    };
  }
};
