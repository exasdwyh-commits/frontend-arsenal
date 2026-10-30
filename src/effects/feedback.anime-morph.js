export default {
  id: 'anime-morph', group: 'feedback', name: '按钮状态回弹', lib: 'Anime.js v4',
  desc: '点击后宽度、圆角、配色、内容同时切换，用弹簧收尾做成"橡皮"手感。',
  deps: 'animejs@4 (可选)',
  note: '同时动 width 会触发 layout 重排，单帧超过 3 个按钮同时 morph 就开始掉帧；更稳的写法是只动 transform: scaleX 再给内层反向缩放。另外 ease 必须是单个 ease 函数，写数组长度不一致会静默只取第一个。',
  code: `import { animate, utils } from 'animejs';

btn.onclick = () => {
  const done = btn.dataset.state === 'done';
  btn.dataset.state = done ? 'idle' : 'done';
  animate(btn, {
    width: done ? '120px' : '176px',
    borderRadius: done ? '8px' : '24px',
    backgroundColor: done ? '#5F3BFF' : '#1a1f2c',   // 自动走颜色插值
    ease: 'outBack(2.2)',
    duration: 520,
    onComplete: () => { label.textContent = done ? '立即购买' : '已加入 ✓'; }
  });
};
// v4 里 utils.set / utils.get 可以读写任意属性；颜色支持 rgb/hsl/hex 互转`,
  init(el) {
    el.innerHTML = '<button id="mb" data-state="idle" style="position:relative;height:40px;width:128px;' +
      'border:1px solid #3a4560;border-radius:20px;background:#1a1f2c;color:#e8ecf4;' +
      'font:600 12px/1 -apple-system,system-ui;cursor:pointer;overflow:hidden">立即购买</button>';
    const btn = el.querySelector('#mb');
    let on = false, w0 = 128, w1 = 176, raf = 0, from = 0, to = 0, t0 = 0, running = false;
    const outBack = (c => t => 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2))(2.2);
    const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
    const c0 = [26, 31, 44], c1 = [95, 59, 255];
    const step = now => {
      const p = Math.min(1, (now - t0) / 520);
      const e = outBack(p);
      const w = from + (to - from) * e;
      btn.style.width = Math.max(96, w).toFixed(1) + 'px';
      btn.style.borderRadius = (8 + 16 * (1 - (to - from) / (w1 - w0) > 0 ? 1 - Math.abs(e) * ((to === w1) ? 1 : 0) : 1)).toFixed(1) + 'px';
      const k = Math.max(0, Math.min(1, e));
      const [r, g, b] = mix(c0, c1, k);
      btn.style.background = 'rgb(' + r + ',' + g + ',' + b + ')';
      btn.style.transform = 'scale(' + (1 + Math.max(0, e - 1) * 0.12).toFixed(3) + ')';
      if (p < 1) raf = requestAnimationFrame(step); else { running = false; btn.style.transform = 'scale(1)'; }
    };
    const fire = () => {
      on = !on;
      from = parseFloat(btn.style.width) || (on === false ? w1 : w0);
      w0 = 128; w1 = 176;
      to = on ? w1 : w0;
      btn.textContent = on ? '已加入 ✓' : '立即购买';
      t0 = performance.now();
      if (!running) { running = true; raf = requestAnimationFrame(step); }
    };
    btn.addEventListener('click', fire);
    let cycle = 0;
    const auto = setInterval(() => {
      // 自动演示：只在用户长时间没点的时候跑
      if (performance.now() - (btn._last || 0) > 2500) fire();
    }, 2600);
    btn.addEventListener('pointerdown', () => { btn._last = performance.now(); });
    // 首帧给个宽度基线
    btn.style.width = w0 + 'px';
    return () => { clearInterval(auto); cancelAnimationFrame(raf); btn.removeEventListener('click', fire); };
  }
};
