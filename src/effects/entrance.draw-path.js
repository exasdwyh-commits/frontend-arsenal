export default {
  id: 'draw-path', group: 'entrance', name: 'SVG 描边书写', lib: 'Anime.js v4',
  desc: '一笔一笔把图标"写"出来：先画主描边，再顺手把箭头点亮。',
  deps: 'animejs@4 (可选)',
  note: '必须先把 pathLength 归一化成 100，否则 dasharray 要依赖各浏览器 getTotalLength 的差异，Firefox 与 Chrome 会有 1~2px 的收尾残留；stroke-linecap: round 时首尾端点会露出一个圆头，anime v4 内部会临时切成 butt 再切回来。',
  code: `import { animate, createTimeline, stagger } from 'animejs';

// 关键：把所有 path 的 pathLength 归一到 100
document.querySelectorAll('#ico path').forEach(p => p.setAttribute('pathLength', '100'));

const tl = createTimeline({ autoplay: true })
  .add('#ico path', {
    strokeDasharray: ['0 100', '100 0'],    // v4 可直接写 'draw'
    strokeDashoffset: [0, 0],
    duration: 900,
    ease: 'inOutSine',
    delay: stagger(260)                     // 多笔画逐个写
  }, 0)
  .add('#ico .fill', { opacity: [0, 1], duration: 400, ease: 'outQuad' }, '<<+=300');
// 逆向擦除：strokeDashoffset: [0, -100]  或在 timeline 上 reverse()`,
  init(el) {
    el.innerHTML = '<svg id="ico" viewBox="0 0 120 60" width="200" height="100" fill="none" ' +
      'style="overflow:visible">' +
      '<path d="M10 46 Q10 14 40 14 Q66 14 66 32 Q66 48 42 48 L24 48" ' +
      'stroke="#7f5bff" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" pathLength="100"/>' +
      '<path d="M86 30 L108 30 M98 18 L110 30 L98 42" ' +
      'stroke="#3fd0ff" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" pathLength="100"/>' +
      '<circle class="cf" cx="98" cy="30" r="22" stroke="#2a3350" stroke-width="1.5" fill="none"/>' +
      '</svg>';
    const paths = Array.from(el.querySelectorAll('#ico path'));
    paths.forEach(p => p.setAttribute('pathLength', '100'));
    const inOutSine = t => -(Math.cos(Math.PI * t) - 1) / 2;
    let raf = 0, start = performance.now();
    const D = 900, GAP = 260, HOLD = 900;
    const TOTAL = D + GAP * (paths.length - 1) + HOLD;
    const tick = now => {
      const e = (now - start) % TOTAL;
      let done = true;
      paths.forEach((p, i) => {
        const t = Math.max(0, Math.min(1, (e - i * GAP) / D));
        if (t < 1) done = false;
        const v = inOutSine(t) * 100;
        // dasharray 只留可见段，避免 round 端点漏色
        p.setAttribute('stroke-dasharray', Math.max(0.01, v).toFixed(2) + ' 100');
        p.setAttribute('stroke-dashoffset', '0');
        p.style.strokeLinecap = (t <= 0 || t >= 1) ? 'butt' : 'round';
      });
      const c = el.querySelector('.cf');
      c.style.opacity = done ? String(0.5 + 0.5 * Math.sin(now / 300) * 0) : '0.25';
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }
};
