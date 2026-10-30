export default {
  id: 'ease-shelf', group: 'entrance', name: '缓动货架', lib: 'Anime.js v4',
  desc: '同一段位移并排跑 9 条缓动曲线，一屏对比出"廉价感"和"高级感"的差别。',
  deps: 'animejs@4 (可选，无库自动降级到内置实现)',
  note: 'Anime v4 的 ease 名是 outExpo / outQuint 这种 PascalCase，v3 的 easeOutExpo 在 v4 里直接报错；Back 的 overshoot 默认 1.7，超过 3 会冲出容器，Elastic 的 amplitude 被 clamp 在 1~10。',
  code: `import { animate, stagger } from 'animejs';
animate('.bar', {
  x: [0, 180],
  duration: 1200,
  ease: 'outExpo',          // v4 名字：outQuad / outCubic / outQuint / outExpo / outCirc / outBack / outElastic / outBounce
  delay: stagger(80),       // 每条曲线错开 80ms
  loop: true,
  alternate: true
});
// 自定义：ease: 'outBack(2)'  overshoot；'outElastic(1, .4)'  amplitude, period
// 纯函数版：import { eases } from 'animejs'; eases.outExpo(t)`,
  init(el, { ensure }) {
    const EASES = [
      ['linear', t => t],
      ['outQuad', t => 1 - (1 - t) * (1 - t)],
      ['outCubic', t => 1 - Math.pow(1 - t, 3)],
      ['outQuint', t => 1 - Math.pow(1 - t, 5)],
      ['outExpo', t => t === 1 ? 1 : 1 - Math.pow(2, -10 * t)],
      ['outCirc', t => Math.sqrt(1 - Math.pow(t - 1, 2))],
      ['outBack', (o => t => 1 + (o + 1) * Math.pow(t - 1, 3) + o * Math.pow(t - 1, 2))(1.7)],
      ['outElastic', (a => t => t === 0 || t === 1 ? t :
        Math.pow(2, -10 * t) * Math.sin((t - a / 4) * (2 * Math.PI) / a) + 1)(0.3)],
      ['outBounce', t => {
        const n = 7.5625, d = 2.75;
        if (t < 1 / d) return n * t * t;
        if (t < 2 / d) return n * (t -= 1.5 / d) * t + .75;
        if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + .9375;
        return n * (t -= 2.625 / d) * t + .984375;
      }]
    ];
    const W = Math.min(300, el.clientWidth || 300);
    el.innerHTML = '<div id="shelf" style="width:' + W + 'px;padding:6px 0"></div>';
    const shelf = el.querySelector('#shelf');
    shelf.innerHTML = EASES.map(e =>
      '<div style="display:flex;align-items:center;height:15px;gap:6px">' +
      '<span style="width:44px;font:9px/1 ui-monospace,monospace;color:#6b7790;text-align:right">' + e[0] + '</span>' +
      '<div class="ez-track" style="position:relative;flex:1;height:1px;background:#232936">' +
      '<i class="ez-dot" style="position:absolute;left:0;top:-3px;width:7px;height:7px;border-radius:2px;' +
      'background:linear-gradient(135deg,#7f5bff,#3fd0ff);box-shadow:0 0 8px #5F3BFF"></i></div></div>'
    ).join('');
    const dots = shelf.querySelectorAll('.ez-dot');
    const travel = () => (shelf.querySelector('.ez-track').clientWidth - 7);
    let raf = 0, start = performance.now();
    const DUR = 1100, HOLD = 640, CYCLE = DUR + HOLD;
    const tick = now => {
      const p = ((now - start) % CYCLE) / DUR;
      const t = Math.min(p, 1);
      const max = travel();
      for (let i = 0; i < EASES.length; i++) dots[i].style.transform = 'translateX(' + (max * EASES[i][1](t)).toFixed(2) + 'px)';
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }
};
