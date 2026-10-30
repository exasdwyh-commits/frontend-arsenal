export default {
  id: 'spring-card', group: 'feedback', name: '弹簧物理卡片', lib: 'React Spring 原理',
  desc: '卡片跟随带惯性，松手后自然回弹，不做线性位移。',
  deps: '@react-spring/web（生产用）',
  note: '这里用原生弹簧积分演示同一物理模型。生产直接 useSpring，省掉手写积分，还能和 React 状态双向绑定。',
  code: `import { useSpring, animated } from '@react-spring/web';

const [sp, api] = useSpring(() => ({
  x: 0, y: 0, config: { tension: 180, friction: 18 }
}));
<animated.div
  onPointerMove={e => api.start({ x: e.movementX, y: e.movementY })}
  onPointerLeave={() => api.start({ x: 0, y: 0 })}
  style={{ transform: sp.x.to(x => \`translate3d(\${x}px,0,0)\`) }} />`,
  init(el) {
    el.innerHTML = `<div id="spr" style="width:130px;height:86px;border-radius:12px;
      background:linear-gradient(135deg,#2a1f5c,#12151d);border:1px solid #3a2f6b;
      display:flex;align-items:center;justify-content:center;color:#a99bff;
      font-size:11px;will-change:transform">follow me</div>`;
    const c = el.querySelector('#spr');
    let x = 0, y = 0, vx = 0, vy = 0, tx = 0, ty = 0, raf;
    const mv = e => {
      const r = c.getBoundingClientRect();
      tx = (e.clientX - r.left - r.width / 2) * .45;
      ty = (e.clientY - r.top - r.height / 2) * .45;
    };
    const lv = () => { tx = 0; ty = 0; };
    el.addEventListener('mousemove', mv);
    el.addEventListener('mouseleave', lv);
    const loop = () => {
      const k = .18, d = .78;
      vx = (vx + (tx - x) * k) * d;
      vy = (vy + (ty - y) * k) * d;
      x += vx; y += vy;
      c.style.transform = `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0)`;
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => { cancelAnimationFrame(raf);
      el.removeEventListener('mousemove', mv); el.removeEventListener('mouseleave', lv); };
  }
};
