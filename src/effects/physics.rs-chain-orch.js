export default {
  id: 'rs-chain-orch', group: 'physics', name: '分段总控编排', lib: 'react-spring',
  desc: 'useChain 的思路：卡从左边进 → 到中间放大 → 变亮 → 收缩成点，四段共用一条时间预算。',
  deps: 'react-spring (可选)',
  note: 'useChain 的 timeSteps 是 0~1 的百分比不是毫秒，写 [0, 300, 600] 会让所有段挤在 timeFrame 之后；没传 timeSteps 时会退化成 Promise 串行（上一段真正静止才启动下一段），弹簧收尾长会导致空等。',
  code: `import { useChain, useSpringRef, useSpring } from 'react-spring';
// timeSteps 是比例，不是毫秒：sum <= timeFrame
const ref1 = useSpringRef(), ref2 = useSpringRef();
const [a, api1] = useSpring(() => ({ ref: ref1, x: -120, config: { tension: 170, friction: 26 } }));
const [b, api2] = useSpring(() => ({ ref: ref2, scale: 1, opacity: 1 }));

useChain([ref1, ref2], [0, 0.45], 1400);   // 0ms 起步，45% * 1400 = 630ms 启动第二段

api1.start({ from: { x: -120 }, to: { x: 0 } });
api2.start({ scale: 1.08 });  // 排队，等 ref1 起跑后按时间步触发
// 串联时注意：每段的 config 越"软"，前面等待越久；想让格子更紧就把 timeFrame 调小`,
  init(el) {
    const W = Math.min(260, el.clientWidth || 260);
    el.innerHTML = '<div id="co" style="position:relative;width:' + W + 'px;height:100px">' +
      '<div id="coCard" style="position:absolute;left:50%;top:50%;width:120px;height:68px;margin:-34px 0 0 -60px;' +
      'border-radius:10px;background:linear-gradient(150deg,#2c2170,#141824);border:1px solid #3a4560;' +
      'box-shadow:0 8px 30px rgba(95,59,255,.25);display:flex;align-items:center;justify-content:center;' +
      'color:#e8ecf4;font:600 12px/1 -apple-system,system-ui;will-change:transform,opacity">PAY</div></div>';
    const card = el.querySelector('#coCard');
    // 四段：位移 → 放大 → 高亮 → 收缩；每段都有自己的弹簧参数
    const SEGS = [
      { d: 620, t: 170, f: 26, fn: p => { card.style.transform = 'translateX(' + (-140 * (1 - p)).toFixed(2) + 'px)'; card.style.opacity = Math.min(1, p * 2).toFixed(2); } },
      { d: 420, t: 180, f: 12, fn: p => { card.style.transform = 'translateX(0) scale(' + (1 + Math.sin(Math.PI * p) * 0.1).toFixed(3) + ')'; } },
      { d: 380, t: 210, f: 20, fn: p => { card.style.boxShadow = '0 0 ' + (8 + 40 * p).toFixed(0) + 'px rgba(63,208,255,' + (0.2 + 0.5 * p).toFixed(2) + ')'; card.style.borderColor = 'rgba(63,208,255,' + (0.3 + 0.7 * p).toFixed(2) + ')'; } },
      { d: 460, t: 280, f: 60, fn: p => { const s = 1 - Math.min(1, p) * 0.86; card.style.transform = 'translateX(0) scale(' + s.toFixed(3) + ')'; card.style.opacity = (1 - p * 0.2).toFixed(2); } }
    ];
    const spring01 = (tension, friction) => { const s = { pos: 0, vel: 0 }; return (dt) => { const n = Math.max(1, Math.round(dt)); for (let i = 0; i < n; i++) { s.vel += (-tension * 1e-6 * (s.pos - 1) - friction * 1e-3 * s.vel); s.pos += s.vel; } s.pos = Math.min(1.3, s.pos); return s.pos; }; };
    const springs = SEGS.map(s => spring01(s.t, s.f));
    let raf = 0, last = performance.now(), idx = 0, t = 0, hold = 0;
    const tick = () => {
      const now = performance.now();
      const dt = Math.min(40, now - last); last = now;
      if (hold > 0) { hold -= dt; raf = requestAnimationFrame(tick); return; }
      const seg = SEGS[idx];
      const p = springs[idx](dt);
      seg.fn(Math.min(1, p));
      t += dt;
      if (t >= seg.d) { t = 0; idx++; if (idx >= SEGS.length) { idx = 0; hold = 700; card.style.transform = 'none'; card.style.opacity = '0'; card.style.boxShadow = '0 8px 30px rgba(95,59,255,.25)'; } }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }
};
