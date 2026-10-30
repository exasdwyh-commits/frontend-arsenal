export default {
  id: 'rs-spring-presets', group: 'feedback', name: '六档弹簧手感知', lib: 'react-spring',
  desc: 'default / gentle / wobbly / stiff / slow / molasses 六组官方预设同屏震动，直接选出该用哪一档。',
  deps: 'react-spring (可选)',
  note: 'react-spring 的 tension/friction 是"两两耦合"的：单独调大 tension 只会更快更硬，想加弹必须同时降 friction。官方默认 {tension:170, friction:26} 已经是阻尼比接近 0.9 的"无弹"值，很多人以为默认有回弹其实是错觉。',
  code: `import { useSpring, animated, config } from 'react-spring';

// 官方预设（packages/core/src/constants.ts）
const PRESETS = {
  default:  { tension: 170, friction: 26 },
  gentle:   { tension: 120, friction: 14 },
  wobbly:   { tension: 180, friction: 12 },
  stiff:    { tension: 210, friction: 20 },
  slow:     { tension: 280, friction: 60 },
  molasses: { tension: 280, friction: 120 },
};

const [s, api] = useSpring(() => ({ y: 0, config: config.wobbly }));
// 触发：api.start({ y: 24, config: config.stiff })
// 强制无过冲：api.start({ y: 24, config: { ...config.wobbly, clamp: true } })
// 单步积分（SpringValue.ts 核心）：
//   a = (-tension*1e-6*(pos-to) - friction*1e-3*vel) / mass
//   vel += a; pos += vel     // 每 1ms 一步`,
  init(el) {
    const PRESETS = [
      ['default', 170, 26], ['gentle', 120, 14], ['wobbly', 180, 12],
      ['stiff', 210, 20], ['slow', 280, 60], ['molasses', 280, 120]
    ];
    const W = Math.min(300, el.clientWidth || 300);
    el.innerHTML = '<div id="rsp" style="width:' + W + 'px"></div>';
    const root = el.querySelector('#rsp');
    root.innerHTML = PRESETS.map(p =>
      '<div style="display:flex;align-items:center;gap:8px;height:20px">' +
      '<span style="width:52px;font:9px/1 ui-monospace,monospace;color:#6b7790">' + p[0] + '</span>' +
      '<div style="position:relative;flex:1;height:1px;background:#232936">' +
      '<i style="position:absolute;left:0;top:-4px;width:9px;height:9px;border-radius:50%;' +
      'background:#7f5bff;box-shadow:0 0 8px #5F3BFF"></i></div></div>'
    ).join('');
    const dots = Array.from(root.querySelectorAll('i'));
    // 每档一个独立弹簧状态，同一目标值触发，观察不同的超调
    const st = PRESETS.map(() => ({ pos: 0, vel: 0 }));
    const TO = 1, MASS = 1;
    const travelPx = () => root.querySelector('div > div').clientWidth - 9;
    let raf = 0, last = performance.now(), holdUntil = 0, dir = 1;
    const tick = now => {
      const dt = Math.min(48, now - last); last = now;
      const px = travelPx();
      if (now > holdUntil) { dir = -dir; holdUntil = now + 900; }
      const target = dir > 0 ? TO : 0;
      // 每 1ms 一步，和 react-spring 内部一致的积分方式
      const steps = Math.max(1, Math.round(dt));
      for (let i = 0; i < st.length; i++) {
        const s = st[i], [, tension, friction] = PRESETS[i];
        for (let n = 0; n < steps; n++) {
          const springForce = -tension * 0.000001 * (s.pos - target);
          const dampForce = -friction * 0.001 * s.vel;
          s.vel += (springForce + dampForce) / MASS;
          s.pos += s.vel;
        }
        dots[i].style.transform = 'translateX(' + (px * s.pos).toFixed(2) + 'px)';
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }
};
