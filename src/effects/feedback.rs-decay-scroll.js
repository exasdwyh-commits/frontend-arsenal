export default {
  id: 'rs-decay-scroll', group: 'feedback', name: '惯性滑行', lib: 'react-spring',
  desc: '松手后按 config.decay 指数衰减继续滑，速度越快滑越远——不用自己算摩擦。',
  deps: 'react-spring (可选)',
  note: 'decay 是"没有终点的动画"，pos 会无限逼近但永远不 finish；用它替代滚动容器时绝不能等 onRest。decay: 0.998 是默认值，越靠近 1 越滑（1 就永远不停），0.9 左右几乎松手即停。',
  code: `import { useSpring, animated, config } from 'react-spring';

const [s, api] = useSpring(() => ({ x: 0, config: { decay: 0.998, velocity: 0 } }));

// 拖动时记录释放速度（px/ms）
api.start({ x: releasePos, velocity: releaseVelocity, config: { decay: 0.998 } });
// 低配移动端：0.99 更"黏"、耗电更低；config: { decay: true } 等价 0.998

// 底层公式（SpringValue.ts）：
//   e = exp(-(1 - decay) * elapsed)
//   pos = from + (v0 / (1 - decay)) * (1 - e)
//   vel = v0 * e
// 所以理论总位移 = v0 / (1 - decay)：v0=2px/ms 时最多滑 1000px，记得自己 clamp`,
  init(el) {
    const W = Math.min(280, el.clientWidth || 280);
    el.innerHTML = '<div id="dc" style="width:' + W + 'px;border-radius:10px;background:#12161f;' +
      'border:1px solid #232936;padding:10px 0;overflow:hidden;cursor:grab">' +
      '<div id="dcRow" style="display:flex;gap:8px;padding-left:10px;will-change:transform">' +
      [0,1,2,3,4,5].map(i => '<i style="flex:0 0 54px;height:64px;border-radius:8px;background:linear-gradient(160deg,hsl(' + (250 + i * 14) + ',60%,26%),#151a26);border:1px solid #2a3350"></i>').join('') +
      '</div></div>';
    const root = el.querySelector('#dc'), row = el.querySelector('#dcRow');
    let pos = 0, vel = 0, dragging = false, lastX = 0, lastT = 0, dragVel = 0, raf = 0, last = performance.now();
    const MAX = 0, MIN = -(row.scrollWidth - W + 20);
    const DECAY = 0.995;
    const setPos = p => { pos = Math.max(MIN, Math.min(MAX, p)); row.style.transform = 'translateX(' + pos.toFixed(2) + 'px)'; };
    const onDown = e => { dragging = true; lastX = e.clientX; lastT = performance.now(); dragVel = 0; root.style.cursor = 'grabbing'; };
    const onMove = e => {
      if (!dragging) return;
      const now = performance.now(), dx = e.clientX - lastX, dt = Math.max(1, now - lastT);
      setPos(pos + dx);
      dragVel = dragVel * 0.6 + (dx / dt) * 0.4;   // px/ms 平滑速度
      lastX = e.clientX; lastT = now;
    };
    const onUp = () => { if (!dragging) return; dragging = false; root.style.cursor = 'grab'; vel = Math.max(-3.2, Math.min(3.2, dragVel)); };
    root.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    const tick = () => {
      const now = performance.now(), dt = Math.min(40, now - last); last = now;
      if (!dragging) {
        // decay 积分：e=exp(-(1-decay)*elapsed)，这里等价为一阶衰减
        vel *= Math.exp(-(1 - DECAY) * dt);
        if (Math.abs(vel) > 0.02) {
          const next = pos + vel * dt;
          if (next > MAX || next < MIN) { setPos(next); vel = 0; } else setPos(next);
        }
      }
      raf = requestAnimationFrame(tick);
    };
    setPos(0);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      root.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }
};
