export default {
  id: 'rs-trail-chain', group: 'feedback', name: '拖尾链式级联', lib: 'react-spring',
  desc: 'useTrail 的实现原理：第 i 个弹簧把目标值设成第 i-1 个弹簧的当前值，于是每一节都在"追"上一节。',
  deps: 'react-spring (可选)',
  note: 'useTrail 的 delay 不是时间错位，而是"目标值互相引用"——第一项到位后第二项才开始收到真值。所以给 trail 配 config 时，如果第一项是 molasses，整条链都慢到不动；同时 reverse: true 会让 parent 索引反号（i+1），列表顺序和拖尾方向会反过来。',
  code: `import { useTrail, animated, config } from 'react-spring';

const items = ['a','b','c','d','e'];
const [trail, api] = useTrail(items.length, i => ({
  x: open ? 0 : 40,
  opacity: open ? 1 : 0,
  config: config.stiff,
  reverse: false,        // true 则从尾部开始级联
}));

return trail.map((s, i) => <animated.div style={s}>{items[i]}</animated.div>);
// 原理（hooks/useTrail.ts）：
// ctrl[i].start({ to: ctrl[i-1].springs })  ← 目标 = 上一个的实际值
// 所以整条链的"延迟"完全由 config 的收尾速度决定，与 delay 字段无关`,
  init(el) {
    const N = 7, R = 6;
    const W = Math.min(300, el.clientWidth || 300);
    el.innerHTML = '<div id="tr" style="position:relative;width:' + W + 'px;height:96px"></div>';
    const root = el.querySelector('#tr');
    for (let i = 0; i < N; i++) {
      const d = document.createElement('i');
      d.style.cssText = 'position:absolute;left:0;top:0;border-radius:50%;pointer-events:none;' +
        'width:' + (R * 2 - i) + 'px;height:' + (R * 2 - i) + 'px;' +
        'background:hsl(' + (262 - i * 8) + ',85%,' + (66 - i * 4) + '%);' +
        'opacity:' + (1 - i * 0.09) + ';box-shadow:0 0 8px rgba(95,59,255,.6)';
      root.appendChild(d);
    }
    const segEls = Array.from(root.children);
    // 每节自己的弹簧（pos 单位：px，沿圆形轨道的位置用角度）
    const springs = segEls.map(() => ({ pos: 0, vel: 0 }));
    const TENSION = 180, FRICTION = 18, MASS = 1;
    let raf = 0, last = performance.now(), phase = 0;
    const ticks = () => {
      const now = performance.now();
      const dt = Math.min(40, now - last); last = now;
      phase += dt * 0.0016;
      const cx = W / 2, cy = 46, rad = 28;
      // 驱动源：一个绕圈的头
      const leaderVal = phase;
      // 目标序列：第 0 节追 leader，第 i 节追第 i-1 节的当前位置（这就是 useTrail）
      let target = leaderVal;
      for (let i = 0; i < N; i++) {
        const s = springs[i];
        const steps = Math.max(1, Math.round(dt));
        for (let n = 0; n < steps; n++) {
          const f = -TENSION * 0.000001 * (s.pos - target) - FRICTION * 0.001 * s.vel;
          s.vel += f / MASS;
          s.pos += s.vel;
        }
        el._x = 0;
        const ang = s.pos - i * 0.34;       // 每节角度相位差 = 视觉拖尾
        const x = cx + Math.cos(ang) * rad, y = cy + Math.sin(ang) * rad;
        segEls[i].style.transform = 'translate(' + (x - R).toFixed(2) + 'px,' + (y - R).toFixed(2) + 'px)';
        target = s.pos;                      // 关键：下一节追这一节的实时位置
      }
      raf = requestAnimationFrame(ticks);
    };
    raf = requestAnimationFrame(ticks);
    return () => cancelAnimationFrame(raf);
  }
};
