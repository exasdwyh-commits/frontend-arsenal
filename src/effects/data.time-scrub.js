export default {
  id: 'time-scrub', group: 'data', name: '时间轴硬拖动', lib: 'Canvas 2D（render(t) 纯函数）',
  desc: '整段动画写成 render(t)：拖时间轴拖到哪一帧就是哪一帧，不补间、不追帧，回拖也完全一样。',
  deps: '无',
  note: '动画的身份是「t 到画面」的纯函数，不是一堆随时间累加的状态。拖动时直接把 t 写进去再 render，绝不能启动一个缓动去追目标值——那会让手和画面之间隔一层延迟，「硬 seek」就没了。所有缓动都必须在 render 内部由 t 现算（ease(t)），这样第 25 帧无论正放、倒放还是直接跳过去，像素都一样。状态机写法在倒放时会漂：加速和减速不对称，回拖的帧和来时对不上。逐帧导出同理：for (f = 0; f < N; f++) render(f / (N - 1))。',
  code: `/* 动画 = t → 画面，不保留上一帧状态 */
function render(t) {
  const k = Math.min(1, t / .7);          // 进度由 t 现算
  bars.forEach((b, i) => {
    const p = easeOutCubic(clamp((k - i * .07) / .6));
    ctx.fillRect(b.x, H - b.h * p, b.w, b.h * p);
  });
  label.textContent = '帧 ' + Math.round(t * 59);
}

/* 拖动 = 硬 seek：不缓动、不排队 */
slider.oninput = e => {
  t = +e.target.value;
  render(t);
};`,
  init(el) {
    el.innerHTML = `<div style="position:absolute;inset:0;display:grid;place-items:center">
      <div style="width:286px">
        <canvas width="286" height="126" style="display:block;border-radius:8px 8px 0 0"></canvas>
        <div style="display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:0 0 8px 8px;
          background:#111624;border-top:1px solid rgba(120,140,190,.14)">
          <button id="tsPlay" style="border:1px solid rgba(140,160,220,.28);background:#1b2133;
            color:#dfe6ff;border-radius:6px;padding:4px 9px;font:11px system-ui;cursor:pointer">播放</button>
          <input id="tsRange" type="range" min="0" max="1000" value="350"
            style="flex:1;accent-color:#7c8cf8;height:3px;cursor:pointer">
          <span id="tsLabel" style="font:10px ui-monospace,monospace;color:#8f9cb5;min-width:46px;text-align:right">帧 000</span>
        </div>
      </div>
    </div>`;
    const cv = el.querySelector('canvas');
    const ctx = cv.getContext('2d');
    const W = cv.width, H = cv.height;
    const range = el.querySelector('#tsRange');
    const label = el.querySelector('#tsLabel');
    const play = el.querySelector('#tsPlay');
    const ease = x => 1 - Math.pow(1 - x, 3);
    const clamp = x => x < 0 ? 0 : x > 1 ? 1 : x;
    const FPS = 60;
    let t = .35, raf = 0, playing = false, last = 0;

    const bars = [
      { x: 26, w: 26, h: 62 }, { x: 68, w: 26, h: 88 }, { x: 110, w: 26, h: 46 },
      { x: 152, w: 26, h: 76 }, { x: 194, w: 26, h: 100 }, { x: 236, w: 26, h: 58 }
    ];

    const render = tt => {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#101528'); g.addColorStop(1, '#0a0d16');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

      // 网格线：给拖动一个参照
      ctx.strokeStyle = 'rgba(120,140,190,.10)'; ctx.lineWidth = 1;
      for (let y = 20; y < H - 12; y += 22) {
        ctx.beginPath(); ctx.moveTo(14, y + .5); ctx.lineTo(W - 14, y + .5); ctx.stroke();
      }

      const k = Math.min(1, tt / .7);
      bars.forEach((b, i) => {
        const p = ease(clamp((k - i * .07) / .6));
        const bh = b.h * p;
        const by = H - 16 - bh;
        const bg = ctx.createLinearGradient(0, by, 0, H - 16);
        bg.addColorStop(0, 'rgba(124,140,248,.95)');
        bg.addColorStop(1, 'rgba(95,59,255,.55)');
        ctx.fillStyle = bg;
        ctx.fillRect(b.x, by, b.w, bh);
        // 顶端亮线：像素级校验拖动是否落准
        ctx.fillStyle = 'rgba(223,230,255,.85)';
        ctx.fillRect(b.x, by, b.w, 2);
      });

      // 播放头
      ctx.fillStyle = 'rgba(255,209,102,.85)';
      ctx.fillRect(14, H - 15, (W - 28) * tt, 2);
      ctx.fillStyle = 'rgba(150,165,200,.65)';
      ctx.font = '10px ui-monospace,monospace';
      ctx.fillText(`t=${tt.toFixed(2)}`, 14, 16);
      ctx.textAlign = 'right';
      ctx.fillText(`frame ${Math.round(tt * (FPS - 1)).toString().padStart(3, '0')}`, W - 14, 16);
      ctx.textAlign = 'left';

      label.textContent = '帧 ' + Math.round(tt * (FPS - 1)).toString().padStart(3, '0');
    };

    const seek = v => {
      t = v;
      range.value = String(Math.round(t * 1000));
      render(t);
    };

    const tick = now => {
      if (!playing) return;
      t = Math.min(1, t + (now - last) / 2600);
      last = now;
      seek(t);
      if (t >= 1) { playing = false; play.textContent = '重播'; return; }
      raf = requestAnimationFrame(tick);
    };

    const onRange = e => {
      playing = false;
      cancelAnimationFrame(raf);
      play.textContent = '播放';
      seek(+e.target.value / 1000);      // 硬 seek：直接渲染，不缓动
    };
    const onPlay = () => {
      if (playing) { playing = false; play.textContent = '续播'; cancelAnimationFrame(raf); return; }
      if (t >= 1) t = 0;
      playing = true; play.textContent = '暂停';
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };

    range.addEventListener('input', onRange);
    play.addEventListener('click', onPlay);
    seek(t);

    return () => {
      cancelAnimationFrame(raf);
      range.removeEventListener('input', onRange);
      play.removeEventListener('click', onPlay);
    };
  }
};
