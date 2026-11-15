export default {
  id: 'diffusion-denoise', group: 'particle', name: '扩散去噪', lib: 'LTX-2 / 生成式视频的中间态',
  desc: '从纯噪声开始，一步比一步清楚——模型生成画面的过程，肉眼看得见。',
  deps: '无（真扩散要几十亿参数，这里只做"节奏"的同构演示）',
  note: '生成类动画好看的关键不是"随机"，而是"每步消掉的噪声越来越少"：线性衰减会前半段几乎没变化、后半段突然成型，观感很假。用 1 - (1-t)^2 这种曲线，前几步大刀阔斧、后几步精修，正好对上真实采样器的观感。像素级重绘很贵，务必"一步一画"，不要每帧都重算整张画布。',
  code: `// 第 s 步：保留 (1 - p) 的噪声，p 随步数非线性上升
const p = 1 - Math.pow(1 - s / STEPS, 2);
for (let i = 0; i < px.length; i += 4) {
  const keep = Math.random() < p ? 0 : 1;   // 这一步还留多少噪点
  px[i]     = keep ? tr[i]     : (Math.random() * 230) | 0;
  px[i + 1] = keep ? tr[i + 1] : (Math.random() * 230) | 0;
  px[i + 2] = keep ? tr[i + 2] : (Math.random() * 230) | 0;
}
ctx.putImageData(img, 0, 0);               // 一步一次，不是每帧`,
  init(el) {
    const W = 264, H = 132;
    el.innerHTML = `<div style="position:absolute;inset:0;display:grid;place-items:center;gap:8px">
      <div style="position:relative;width:${W}px;height:${H}px">
        <canvas width="${W}" height="${H}" style="display:block;border-radius:8px;
          box-shadow:0 0 0 1px rgba(255,255,255,.1) inset"></canvas>
        <span class="dd-step" style="position:absolute;left:8px;bottom:7px;padding:3px 6px;border-radius:4px;
          background:rgba(6,8,14,.72);color:#cfd6e4;
          font:9px/1 ui-monospace,Consolas,monospace;letter-spacing:.12em"></span>
      </div>
    </div>`;
    const cv = el.querySelector('canvas');
    const tag = el.querySelector('.dd-step');
    const ctx = cv.getContext('2d', { willReadFrequently: true });
    if (!ctx) return () => {};

    /* 目标画面：一张"产品封面"的抽象构成，纯代码画 */
    const off = document.createElement('canvas');
    off.width = W; off.height = H;
    const o = off.getContext('2d');
    const bgGrad = o.createLinearGradient(0, 0, W, H);
    bgGrad.addColorStop(0, '#1a1440');
    bgGrad.addColorStop(.55, '#0c1020');
    bgGrad.addColorStop(1, '#123a4d');
    o.fillStyle = bgGrad; o.fillRect(0, 0, W, H);
    const orb = o.createRadialGradient(W * .32, H * .38, 2, W * .32, H * .38, 62);
    orb.addColorStop(0, 'rgba(255,212,121,.95)');
    orb.addColorStop(1, 'rgba(255,212,121,0)');
    o.fillStyle = orb; o.fillRect(0, 0, W, H);
    const orb2 = o.createRadialGradient(W * .74, H * .68, 2, W * .74, H * .68, 56);
    orb2.addColorStop(0, 'rgba(60,203,255,.9)');
    orb2.addColorStop(1, 'rgba(60,203,255,0)');
    o.fillStyle = orb2; o.fillRect(0, 0, W, H);
    o.strokeStyle = 'rgba(195,234,58,.85)';
    o.lineWidth = 2;
    o.beginPath(); o.moveTo(18, H - 34);
    for (let x = 0; x <= W; x += 8) {
      o.lineTo(x + 8, H - 34 - Math.sin(x / 26) * 13 - Math.cos(x / 9) * 4);
    }
    o.stroke();
    o.fillStyle = 'rgba(255,255,255,.14)';
    for (let i = 0; i < 5; i++) o.fillRect(18, 18 + i * 9, 44 - i * 6, 3);

    const tr = o.getImageData(0, 0, W, H).data;
    const img = ctx.createImageData(W, H);
    const px = img.data;
    const STEPS = 14;
    let s = 0, timer = 0;

    const render = () => {
      const t = s / STEPS;
      const p = 1 - Math.pow(1 - t, 2);          /* 前粗后细 */
      for (let i = 0; i < px.length; i += 4) {
        if (Math.random() < p) {                 /* 这一步留下的色块 */
          px[i] = tr[i]; px[i + 1] = tr[i + 1]; px[i + 2] = tr[i + 2];
        } else {
          const n = 40 + Math.random() * 175;
          px[i] = n * 0.92; px[i + 1] = n * 0.95; px[i + 2] = n;
        }
        px[i + 3] = 255;
      }
      ctx.putImageData(img, 0, 0);
      tag.textContent = 'STEP ' + s + ' / ' + STEPS;
    };

    const tick = () => {
      if (s >= STEPS) {
        /* 停一拍再从头去噪，看得出"每一轮都是一次生成" */
        s = 0;
        tag.textContent = 'STEP 0 / ' + STEPS;
        timer = setTimeout(render, 260);
        return;
      }
      s++;
      render();
      if (s >= STEPS) timer = setTimeout(tick, 1500);
      else timer = setTimeout(tick, 90 + s * 26);   /* 越往后越慢：精修 */
    };
    render();
    timer = setTimeout(tick, 420);
    return () => clearTimeout(timer);
  }
};
