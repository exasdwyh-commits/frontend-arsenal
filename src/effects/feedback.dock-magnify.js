export default {
  id: 'dock-magnify', group: 'feedback', name: 'Dock 距离衰减放大',
  lib: '原生 JS',
  desc: '指针扫过时，只有附近的图标按距离衰减放大上浮，远端纹丝不动。移植自 Cult UI 的 macOS Dock，是"局部响应"最省的实现方式。',
  deps: '无',
  note: '别在 pointermove 里读 getBoundingClientRect（它含 transform，放大后读到的位置是错的，还会每帧强制布局）。用 offsetLeft + offsetWidth/2 缓存中心点，指针坐标减一次 dock 的矩形即可。放大必须配 transform-origin: bottom center，否则图标是往下沉。相邻图标放大后会互相覆盖，z-index 要跟着 scale 一起抬。',
  scenes: { places: ['导航', '工具栏'], goals: ['交互反馈'], triggers: ['悬停'], projects: ['品牌官网', '作品集', 'AI 产品'] },
  code: `const R = 130, AMP = 0.85;          // 影响半径 / 最大放大倍数
const centers = [...dock.children].map(t => t.offsetLeft + t.offsetWidth / 2);
const dockRect = dock.getBoundingClientRect();

dock.addEventListener('pointermove', e => {
  const x = e.clientX - dockRect.left;
  [...dock.children].forEach((t, i) => {
    const d = Math.abs(x - centers[i]);
    // 余弦衰减：距离 0 时满格，距离 R 时刚好归零，边缘没有折角
    const s = 1 + AMP * Math.max(0, Math.cos((d / R) * Math.PI / 2));
    t.style.transform = 'translateY(' + (-(s - 1) * 26) + 'px) scale(' + s + ')';
    t.style.zIndex = Math.round(s * 10);
  });
});

dock.addEventListener('pointerleave', () => {
  [...dock.children].forEach(t => { t.style.transform = ''; t.style.zIndex = ''; });
});

/* CSS
.dock-item{transform-origin:bottom center;
  transition:transform .16s cubic-bezier(.2,.9,.25,1)}
*/`,
  init(el) {
    const GLYPHS = ['◈', '✦', '◍', '▲', '✳', '❖'];
    const STYLE = `<style data-fx="dock-magnify">
      .dock-wrap{display:flex;flex-direction:column;align-items:center;gap:10px}
      .dock{display:flex;align-items:flex-end;gap:7px;padding:8px 9px;border-radius:15px;
        background:linear-gradient(180deg,rgba(28,34,48,.92),rgba(16,20,29,.92));
        border:1px solid rgba(255,255,255,.09);backdrop-filter:blur(8px);
        box-shadow:0 14px 28px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.08)}
      .dock-item{width:30px;height:30px;border-radius:9px;display:flex;align-items:center;justify-content:center;
        font-size:14px;color:#cfd6e6;cursor:pointer;transform-origin:bottom center;
        transition:transform .16s cubic-bezier(.2,.9,.25,1),box-shadow .16s;
        background:linear-gradient(160deg,#2a3245,#171c27);border:1px solid rgba(255,255,255,.07);
        will-change:transform}
      .dock-item:nth-child(3){color:#8b6cff}
      .dock-item:nth-child(5){color:#3ddc97}
      .dock-hint{font-size:9.5px;color:#4a5368;letter-spacing:.08em;text-transform:uppercase}
      .dock-dot{position:absolute;margin-top:34px;width:3px;height:3px;border-radius:99px;background:#5f3bff}
    </style>`;

    el.insertAdjacentHTML('beforeend', STYLE + `
      <div class="dock-wrap">
        <div class="dock" id="dock">${GLYPHS.map(g => `<div class="dock-item">${g}</div>`).join('')}</div>
        <div class="dock-hint">指针扫过试放大</div>
      </div>`);

    const dock = el.querySelector('#dock');
    const items = [...dock.children];
    const R = 118;
    const AMP = 0.85;

    let centers = [];
    let dockLeft = 0;

    // 用 offsetLeft（不受 transform 影响）缓存中心点，比每帧 getBoundingClientRect 便宜一个数量级
    const measure = () => {
      const dr = dock.getBoundingClientRect();
      dockLeft = dr.left;
      centers = items.map(t => t.offsetLeft + t.offsetWidth / 2);
    };

    const reset = () => items.forEach(t => { t.style.transform = ''; t.style.zIndex = ''; });

    const onMove = e => {
      const x = e.clientX - dockLeft;
      for (let i = 0; i < items.length; i++) {
        const d = Math.abs(x - centers[i]);
        const s = 1 + AMP * Math.max(0, Math.cos((d / R) * Math.PI / 2));
        const t = items[i];
        t.style.transform = `translateY(${(-(s - 1) * 26).toFixed(2)}px) scale(${s.toFixed(3)})`;
        t.style.zIndex = String(Math.round(s * 10));
      }
    };

    const onEnter = () => measure();
    dock.addEventListener('pointerenter', onEnter);
    dock.addEventListener('pointermove', onMove);
    dock.addEventListener('pointerleave', reset);
    window.addEventListener('resize', measure);

    measure();

    return () => {
      dock.removeEventListener('pointerenter', onEnter);
      dock.removeEventListener('pointermove', onMove);
      dock.removeEventListener('pointerleave', reset);
      window.removeEventListener('resize', measure);
      el.innerHTML = '';
    };
  }
};
