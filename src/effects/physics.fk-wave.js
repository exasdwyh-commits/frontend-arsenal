export default {
  id: 'fk-wave', group: 'physics', name: '链式跟随', lib: 'Anime.js v4',
  desc: '一根多节链子追鼠标：每节都追上一节的当前位置，天然产生甩尾和惯性。',
  deps: 'animejs@4 (可选)',
  note: '别用 stagger 做链条——stagger 是固定延迟，节点一多后半段就"拖泥带水"且不跟手。正确做法是每帧 lerp 到上一节当前位置，系数 0.2~0.35 之间；超过 0.5 会抖，低于 0.1 像被胶水粘住。',
  code: `import { animate, timeline, createTimeline, utils } from 'animejs';

// 每一帧把第 i 节 lerp 到第 i-1 节，i=0 跟随指针
function follow(chain, target, k = 0.28) {
  let px = target.x, py = target.y;
  for (const seg of chain) {
    px += (seg.x - px) * (1 - k);   // 注意方向：值是"离目标还差多少"
    py += (seg.y - py) * (1 - k);
    seg.el.style.transform = 'translate(' + (px - seg.baseX) + 'px,' + (py - seg.baseY) + 'px)';
    seg.x = px; seg.y = py;
  }
}
// 官方等效写法（v4）：给每节一个 JSON 目标 proxy，
// animate(chain[i], { x: () => chain[i-1].x, duration: 1000, ease: 'outQuad' }) 会自动逐帧求值`,
  init(el) {
    const N = 9, R = 7;
    const W = Math.min(300, el.clientWidth || 300);
    el.innerHTML = '<div id="chain" style="position:relative;width:' + W + 'px;height:110px"></div>';
    const root = el.querySelector('#chain');
    const segs = [];
    for (let i = 0; i < N; i++) {
      const d = document.createElement('i');
      const t = i / (N - 1);
      d.style.cssText = 'position:absolute;left:0;top:0;border-radius:50%;pointer-events:none;' +
        'width:' + (R * 2 - t * 8) + 'px;height:' + (R * 2 - t * 8) + 'px;' +
        'background:radial-gradient(circle at 35% 35%,#b9a5ff,#5F3BFF 60%,#2a1a7a);' +
        'opacity:' + (1 - t * 0.55) + ';box-shadow:0 0 ' + (10 - t * 6) + 'px rgba(95,59,255,.7)';
      root.appendChild(d);
      segs.push({ el: d, x: W / 2, y: 55 });
    }
    // 头部：沿 Lissajous 曲线模拟指针（无鼠标时也能看）
    let mouse = { x: null, y: null }, phase = 0, raf = 0;
    const onMove = e => {
      const r = root.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    };
    const onLeave = () => { mouse.x = null; mouse.y = null; };
    root.addEventListener('mousemove', onMove);
    root.addEventListener('mouseleave', onLeave);
    const tick = () => {
      phase += 0.018;
      const autoX = W / 2 + Math.sin(phase) * W * 0.3;
      const autoY = 55 + Math.sin(phase * 2) * 26;
      const tx = mouse.x == null ? autoX : mouse.x;
      const ty = mouse.y == null ? autoY : mouse.y;
      let px = tx, py = ty;
      for (let i = 0; i < segs.length; i++) {
        const s = segs[i];
        const k = 0.3;                       // 越小越"重"
        s.x += (px - s.x) * k;
        s.y += (py - s.y) * k;
        px = s.x; py = s.y;                  // 下一节追这一节的实时位置 → 天然甩尾
        const sc = 1 + Math.min(0.5, Math.hypot(tx - s.x, ty - s.y) / 120) * 0.25;
        s.el.style.transform = 'translate(' + (s.x - R) + 'px,' + (s.y - R) + 'px) scale(' + sc.toFixed(3) + ')';
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); root.removeEventListener('mousemove', onMove); root.removeEventListener('mouseleave', onLeave); };
  }
};
