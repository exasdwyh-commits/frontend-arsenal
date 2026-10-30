export default {
  id: 'spring-enter', group: 'entrance', name: '物理弹簧入场', lib: 'Anime.js v4',
  desc: '用 bounce + duration 声明的弹簧（SwiftUI 同款感知时长算法），比 cubic-bezier 更"有质量"。',
  deps: 'animejs@4 (可选)',
  note: 'Anime v4 的 spring 只接受 bounce 或 duration 二选一，同时给会被 calculateSDFromBD 覆盖；bounce 范围 -1~1，负值是过阻尼（不出弹、只是慢收尾），不是"更大弹"。damping 被 clamp 到 300 以内防止求解器爆掉。',
  code: `import { animate, spring, createTimeline } from 'animejs';

animate('.card', {
  y: [40, 0],
  scale: [0.9, 1],
  opacity: [0, 1],
  ease: spring({ bounce: 0.4, duration: 700 })   // 或 { stiffness: 120, damping: 14, mass: 1 }
});

// 底层关系（Apple WWDC23 HIG）：
// stiffness = (2π / 感知时长s)²  ；bounce >= 0 时 damping = ((1-bounce)*4π)/感知时长
// 想要"阻尼感"用 bounce: -0.3，想要"果冻"用 bounce: 0.7 以上`,
  init(el) {
    const W = Math.min(260, el.clientWidth || 260);
    el.innerHTML = '<div id="sp" style="display:flex;gap:10px;justify-content:center"></div>';
    const box = el.querySelector('#sp');
    const CONF = [
      { b: 0.45, d: 760, label: 'bounce .45' },
      { b: 0.8, d: 900, label: 'bounce .8' },
      { b: -0.5, d: 620, label: 'bounce -.5' }
    ];
    const H = 92, BW = Math.min(64, (W - 20) / 3);
    box.innerHTML = CONF.map(c =>
      '<div style="width:' + BW + 'px;text-align:center">' +
      '<div class="bx" style="height:' + (H - 20) + 'px;display:flex;align-items:flex-end;justify-content:center">' +
      '<i style="display:block;width:' + (BW - 10) + 'px;height:52px;border-radius:8px;' +
      'background:linear-gradient(160deg,#3a2a8a,#161a28);border:1px solid #3a4560"></i></div>' +
      '<span style="font:8px/1.6 ui-monospace,monospace;color:#6b7790">' + c.label + '</span></div>'
    ).join('');
    const els = Array.from(box.querySelectorAll('.bx > i'));
    // Spring 求解器（anime v4 同款：undershoot 解析解 + 数值求静止时长）
    function springEase(bounce, durationMs) {
      const b = Math.max(-1, Math.min(1, bounce));
      const d = Math.max(10, Math.min(6000, durationMs)) / 1000;
      const s = Math.pow((2 * Math.PI) / d, 2);
      const dd = b >= 0 ? ((1 - b) * 4 * Math.PI) / d : (4 * Math.PI) / (d * (1 + b));
      const m = 1, w0 = Math.sqrt(s / m), zeta = dd / (2 * Math.sqrt(s * m));
      let wd, bb, kind;
      if (zeta < 1) { wd = w0 * Math.sqrt(1 - zeta * zeta); bb = zeta * w0 / wd; kind = 0; }
      else if (zeta === 1) { wd = 0; bb = w0; kind = 1; }
      else { wd = w0 * Math.sqrt(zeta * zeta - 1); bb = zeta * w0 / wd; kind = 2; }
      const solve = t => {
        if (kind === 0) return 1 - Math.exp(-t * zeta * w0) * (Math.cos(wd * t) + bb * Math.sin(wd * t));
        if (kind === 1) return 1 - (1 + bb * t) * Math.exp(-t * w0);
        return 1 - ((1 + bb) * Math.exp((-zeta * w0 + wd) * t) + (1 - bb) * Math.exp((-zeta * w0 - wd) * t)) / 2;
      };
      let t = 0, rest = 0, MAX = 12;
      while (rest < 10 && t < MAX) { rest = Math.abs(1 - solve(t)) < 0.0005 ? rest + 1 : 0; t += 0.02; }
      return { easing: solve, total: t * 1000, d };
    }
    const clocks = CONF.map(c => Object.assign(springEase(c.b, c.d), c));
    let raf = 0, start = performance.now(), cycle = Math.max.apply(null, clocks.map(c => c.total)) + 900;
    const tick = now => {
      const e = (now - start) % cycle;
      clocks.forEach((c, i) => {
        const p = Math.max(0, Math.min(1, e / c.total));
        const y = (1 - c.easing(p)) * 40, sc = 0.88 + 0.12 * c.easing(p);
        els[i].style.opacity = Math.min(1, p * 6);
        els[i].style.transform = 'translateY(' + y.toFixed(2) + 'px) scale(' + sc.toFixed(3) + ')';
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }
};
