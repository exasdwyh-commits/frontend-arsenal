export default {
  id: 'hitstop', group: 'feedback', name: '命中定格', lib: '原生 rAF（暂停时间轴）',
  desc: '打中的那一瞬间把画面冻住 90ms，再抖 2~3px：重量感不是靠更慢的动画，是靠「时间停了一下」。',
  deps: '无',
  note: '定格是"停止推进时间"，不是把动画速度调慢——时间轴真的不动，观众才读得出撞击。90ms 是上限，超过 130ms 会被读成卡顿；同时抖幅压到 3px 以内，幅度一大就从"重量"变成"故障"。定格期间别重置缓动，恢复后从原相位继续，否则前面攒的速度全丢。连击要能叠加：第二次命中时重新计时，但幅度取最大值而不是相加。',
  code: `/* 时间只在一个地方推进：freeze 期间 dt 记 0 */
function frame(now) {
  const dt = now < freezeUntil ? 0 : Math.min(now - last, 34);
  last = now;
  t += dt;                                  // 定格时 t 真的停住
  const shake = freezeUntil > now
    ? (freezeUntil - now) / HITSTOP * 3       // 3px 内衰减
    : 0;
  draw(t, (Math.random() - .5) * shake, (Math.random() - .5) * shake);
  requestAnimationFrame(frame);
}

/* 命中：冻结 90ms，抖幅取 max 不累加 */
function hit() {
  freezeUntil = performance.now() + 90;
  flash = 1;
}`,
  init(el) {
    el.innerHTML = `<div style="position:absolute;inset:0;display:grid;place-items:center">
      <canvas width="286" height="156" style="display:block;border-radius:8px;cursor:crosshair"></canvas>
    </div>`;
    const cv = el.querySelector('canvas');
    const ctx = cv.getContext('2d');
    const W = cv.width, H = cv.height;
    const HITSTOP = 90;
    let raf, t = 0, last = performance.now(), freezeUntil = 0, flash = 0, hits = 0;

    const draw = (now, ox, oy) => {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#12172a'); g.addColorStop(1, '#0a0d16');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.setTransform(1, 0, 0, 1, ox, oy);

      // 轨道
      const cy = 62, amp = 78, cx = W / 2;
      ctx.strokeStyle = 'rgba(120,140,190,.16)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(cx - amp, cy); ctx.lineTo(cx + amp, cy); ctx.stroke();
      for (let i = -4; i <= 4; i++) {
        const x = cx + i * amp / 4;
        ctx.beginPath(); ctx.moveTo(x, cy - 5); ctx.lineTo(x, cy + 5); ctx.stroke();
      }

      // 目标：跟着 t 来回走
      const px = cx + Math.sin(t * .0022) * amp;
      const py = cy + Math.sin(t * .0016 + 1.2) * 14;
      ctx.strokeStyle = 'rgba(150,170,220,.35)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(px, py, 15, 0, Math.PI * 2); ctx.stroke();

      // 命中闪光：冻结期间才亮
      if (flash > 0) {
        const rg = ctx.createRadialGradient(px, py, 0, px, py, 34);
        rg.addColorStop(0, `rgba(255,255,255,${.75 * flash})`);
        rg.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = rg;
        ctx.beginPath(); ctx.arc(px, py, 34, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = '#dfe6ff';
      ctx.fillRect(px - 7, py - 7, 14, 14);
      ctx.fillStyle = 'rgba(223,230,255,.35)';
      ctx.fillRect(px + 11, py - 1, 16, 2);

      // 时间条：冻结时明显停住
      const bx = 26, bw = W - 52, by = 122;
      ctx.fillStyle = 'rgba(120,140,190,.18)'; ctx.fillRect(bx, by, bw, 4);
      ctx.fillStyle = freezeUntil > now ? '#ffd166' : '#7c8cf8';
      const prog = (t * .00008) % 1;
      ctx.fillRect(bx, by, bw * prog, 4);
      ctx.fillStyle = 'rgba(160,175,210,.7)';
      ctx.font = '10px ui-monospace,monospace';
      ctx.fillText(freezeUntil > now ? 'TIME FROZEN' : 'time', bx, by - 7);
      ctx.textAlign = 'right';
      ctx.fillText(hits + ' hits', bx + bw, by - 7);
      ctx.textAlign = 'left';
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    };

    const frame = now => {
      const dt = now < freezeUntil ? 0 : Math.min(now - last, 34);
      last = now;
      t += dt;
      flash = Math.max(0, flash - dt / 170);
      const left = freezeUntil - now;
      const shake = left > 0 ? left / HITSTOP * 3 : 0;
      draw(now, (Math.random() - .5) * shake, (Math.random() - .5) * shake);
      raf = requestAnimationFrame(frame);
    };

    const hit = e => {
      freezeUntil = performance.now() + HITSTOP;
      flash = 1;
      hits++;
    };
    cv.addEventListener('pointerdown', hit);
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      cv.removeEventListener('pointerdown', hit);
    };
  }
};
