export default {
  id: 'echo-trail', group: 'particle', name: '时间残影', lib: 'Canvas 2D（解析式回采样）',
  desc: '残影不是「留下来的尾巴」，而是把本体过去几个时刻的位置重新算一遍画出来——本体一停，它们就收拢消失。',
  deps: '无',
  note: '残影要用「当前位置 + 衰减系数」反推过去的位置，而不是拿一张画布只擦一半做拖影：缓冲式残影在停手后还会留一串慢慢变淡的脏尾巴，且帧率一变长度就变。这里本体按固定系数逼近目标，过去 d 毫秒的位置可用同一个系数精确回算，所以任意一帧都能重放，导出也不会漂。反推是除以衰减（f>1），不是乘——算错方向残影会跑到本体前面，看着像「预判」而不是拖影。采样间隔决定尾巴长度（42ms × 7 个刚好读得出方向）；残影透明度要随「与本体距离」衰减，否则收拢时会叠成一坨更亮的点，看起来像没消失。',
  code: `/* 本体每帧逼近目标：head += (target - head) * K */
head.x += (target.x - head.x) * K;

/* 残影 = 用同一个 K 反推 d 毫秒前的位置，不存历史（f > 1） */
for (let i = 1; i <= 7; i++) {
  const d = i * 42;                              // ms
  const f = Math.min(2.2, Math.pow(1 / (1 - K), d / 16.7));  // 反推，越早越大
  const x = target.x + (head.x - target.x) * f;
  const y = target.y + (head.y - target.y) * f;
  const gap = Math.hypot(x - head.x, y - head.y);
  if (gap < 1) continue;                         // 停住时自动消失
  dot(x, y, .34 * (1 - i / 9) * Math.min(1, gap / 3), 7 - i * .5);
}`,
  init(el) {
    el.innerHTML = `<div style="position:absolute;inset:0;display:grid;place-items:center">
      <canvas width="286" height="156" style="display:block;border-radius:8px;cursor:crosshair"></canvas>
    </div>`;
    const cv = el.querySelector('canvas');
    const ctx = cv.getContext('2d');
    const W = cv.width, H = cv.height;
    const K = 0.11;
    let raf, auto = true, hold = false, tick = 0;
    const target = { x: W * .5, y: H * .5 };
    const head = { x: W * .5, y: H * .5 };

    const dot = (x, y, a, r) => {
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, `rgba(190,210,255,${a})`);
      g.addColorStop(.55, `rgba(124,140,248,${a * .8})`);
      g.addColorStop(1, 'rgba(95,59,255,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    };

    const loop = () => {
      tick += 16.7;
      if (auto) {
        target.x = W * .5 + Math.sin(tick * .0021) * W * .33;
        target.y = H * .5 + Math.sin(tick * .0034 + 1.1) * H * .27;
      }
      head.x += (target.x - head.x) * K;
      head.y += (target.y - head.y) * K;

      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#0b0f1a'); g.addColorStop(1, '#060810');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

      // 目标点：残影最终收拢的地方
      ctx.strokeStyle = 'rgba(120,140,190,.22)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(target.x, target.y, 9, 0, Math.PI * 2); ctx.stroke();

      // 过去 7 个时刻：位置由「当前状态 + 系数」反推（f > 1）
      for (let i = 7; i >= 1; i--) {
        const f = Math.min(2.2, Math.pow(1 / (1 - K), (i * 42) / 16.7));
        const x = target.x + (head.x - target.x) * f;
        const y = target.y + (head.y - target.y) * f;
        const gap = Math.hypot(x - head.x, y - head.y);
        if (gap < 1) continue;
        dot(x, y, .34 * (1 - i / 9) * Math.min(1, gap / 3), 7 - i * .5);
      }
      dot(head.x, head.y, .95, 8);

      ctx.fillStyle = 'rgba(150,165,200,.6)';
      ctx.font = '10px ui-monospace,monospace';
      ctx.fillText(hold ? 'HOLD · 残影收拢' : 'move · 解析式回采样', 12, H - 12);
      raf = requestAnimationFrame(loop);
    };

    const move = e => {
      const r = cv.getBoundingClientRect();
      target.x = (e.clientX - r.left) * W / r.width;
      target.y = (e.clientY - r.top) * H / r.height;
      auto = false; hold = false;
    };
    const down = e => { move(e); hold = true; auto = false; };
    const up = () => { hold = false; auto = true; };
    const leave = () => { hold = false; auto = true; };
    cv.addEventListener('pointermove', move);
    cv.addEventListener('pointerdown', down);
    cv.addEventListener('pointerup', up);
    cv.addEventListener('pointerleave', leave);
    loop();

    return () => {
      cancelAnimationFrame(raf);
      cv.removeEventListener('pointermove', move);
      cv.removeEventListener('pointerdown', down);
      cv.removeEventListener('pointerup', up);
      cv.removeEventListener('pointerleave', leave);
    };
  }
};
