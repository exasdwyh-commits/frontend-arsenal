export default {
  id: 'rs-transition-list', group: 'entrance', name: '列表增删过渡', lib: 'react-spring',
  desc: '条目自动增删，进场的从上方滑入、出场的向下淡出，且不会因为 key 抖动而闪。',
  deps: 'react-spring (可选)',
  note: 'useTransition 的 key 一旦不是稳定值（比如用 index），删中间项时整列会"错位重播"。另外 leave 阶段的 force=true 会让弹簧丢掉速度，出场的回落会突然变线性——想要自然的退出要传 force: false 并让 from 与 to 反向。',
  code: `import { useTransition, animated, config } from 'react-spring';

const [items, setItems] = useState([1,2,3]);
const transitions = useTransition(items, {
  keys: item => item.id,             // 稳定 key，不要用 index
  from: { opacity: 0, height: 0, y: -12 },
  enter: { opacity: 1, height: 34, y: 0 },
  leave: { opacity: 0, height: 0, y: 14 },
  trail: 60,                          // 增删时的错位
  config: config.gentle,
  expires: true,                       // 移除后不再占用 DOM
});
return transitions((style, item) => (
  <animated.div style={{ ...style, overflow: 'hidden' }}>{item.label}</animated.div>
));`,
  init(el) {
    const W = Math.min(260, el.clientWidth || 260);
    el.innerHTML = '<div id="tl" style="width:' + W + 'px;height:110px;position:relative"></div>';
    const root = el.querySelector('#tl');
    const LABELS = ['拉取需求', '生成分镜', '渲染预览', '导出成片', '同步团队'];
    let rid = 0, alive = new Map();   // id -> {node, y, vy, targetY, h, op, isLeaving}
    const ROW = 21;
    const onScreen = () => {
      root.innerHTML = '';
      let n = 0;
      alive.forEach(v => { v.node.style.opacity = '0'; });
      alive = new Map();
      const n0 = 3;
      for (let i = 0; i < n0; i++) addRow(LABELS[i]);
    };
    function addRow(label) {
      const id = ++rid;
      const node = document.createElement('div');
      node.textContent = label;
      node.style.cssText = 'position:absolute;left:0;right:0;height:19px;line-height:19px;padding-left:8px;' +
        'font:11px/19px -apple-system,system-ui;color:#cfd6e4;border-left:2px solid #5F3BFF;' +
        'background:#161a24;border-radius:0 4px 4px 0;overflow:hidden;will-change:transform,opacity';
      root.appendChild(node);
      alive.set(id, { node, label, y: -12, vy: 0, h: 0, op: 0, leaving: false, idx: alive.size });
      return id;
    }
    const STATES = { tension: 120, friction: 14 };
    let raf = 0, last = performance.now(), acc = 0, step = 0;
    const tick = () => {
      const now = performance.now();
      const dt = Math.min(40, now - last); last = now;
      acc += dt;
      // 每 1.8s 做一次增/删，交替
      if (acc > 1700) {
        acc = 0; step++;
        const ids = Array.from(alive.keys());
        if (step % 3 === 1 && ids.length > 1) {
          const victim = ids[Math.floor(ids.length / 2)];
          if (alive.has(victim)) alive.get(victim).leaving = true;
        } else if (alive.size < 4) {
          addRow(LABELS[(step + 2) % LABELS.length]);
        }
      }
      // 布局：按插入顺序定位，leaving 项仍占位直到高度收完
      let y = 0;
      const order = Array.from(alive.entries()).sort((a, b) => a[0] - b[0]);
      const steps = Math.max(1, Math.round(dt));
      order.forEach(([id, v]) => {
        const toH = v.leaving ? 0 : ROW;
        const toY = v.leaving ? 12 : 0;
        const toOp = v.leaving ? 0 : 1;
        if (!v._init) { v._init = true; v.startY = -12; v.y = -12; v.op = 0; v.h = 0; v.vy = 0; v.vh = 0; }
        for (let n = 0; n < steps; n++) {
          v.vy += (-STATES.tension * 1e-6 * (v.y - toY) - STATES.friction * 1e-3 * v.vy);
          v.y += v.vy;
          v.vh += (-STATES.tension * 1e-6 * (v.h - toH) - STATES.friction * 1e-3 * v.vh);
          v.h += v.vh;
        }
        v.op += (toOp - v.op) * Math.min(1, dt / 120);
        v.node.style.transform = 'translateY(' + (y + v.y).toFixed(2) + 'px)';
        v.node.style.height = Math.max(0, v.h).toFixed(2) + 'px';
        v.node.style.lineHeight = Math.max(0, v.h).toFixed(2) + 'px';
        v.node.style.opacity = Math.max(0, v.op).toFixed(3);
        v.node.style.background = v.leaving ? '#1c1218' : '#161a24';
        y += Math.max(0, v.h) + 4;
        if (v.leaving && Math.abs(v.h) < 0.2 && Math.abs(v.vy) < 0.02) { v.node.remove(); alive.delete(id); }
      });
      raf = requestAnimationFrame(tick);
    };
    onScreen();
    acc = 0; last = performance.now();
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); root.innerHTML = ''; };
  }
};
