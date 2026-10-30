export default {
  id: 'grid-stagger', group: 'entrance', name: '网格波纹错位', lib: 'Anime.js v4',
  desc: '36 个瓦片按二维距离从中心向外错开，不是普通的从左到右依次淡入。',
  deps: 'animejs@4 (可选)',
  note: 'grid 必须是一维数组 [列, 行]，写 [6][6] 会静默失效变成顺序错位；from: "center" 对偶数网格用 (n-1)/2 计算，中点落在格线上，会同时出现 4 个源点。总数超过 200 个 DOM 节点时改用 canvas。',
  code: `import { animate, stagger } from 'animejs';
animate('.tile', {
  scale: [0.2, 1],
  opacity: [0, 1],
  rotate: () => Math.random() * 90,
  duration: 700,
  ease: 'outBack',
  delay: stagger(45, { grid: [6, 6], from: 'center' })   // 也可 from: [0, 0] / 'last' / index / 'random'
});
// 距离按欧氏距离归一化后乘以 45ms，最远格子的延迟 = 45 * 最大距离数
// stagger 也可以直接驱动值：x: stagger([0, 240], { grid: [6,6], from: 'center' })`,
  init(el) {
    const COLS = 6, ROWS = 6, GAP = 4, CELL = 22;
    const W = COLS * (CELL + GAP) - GAP, H = ROWS * (CELL + GAP) - GAP;
    const cx = (COLS - 1) / 2, cy = (ROWS - 1) / 2;
    const dist = [];
    for (let i = 0; i < COLS * ROWS; i++) {
      const dx = cx - (i % COLS), dy = cy - Math.floor(i / COLS);
      dist.push(Math.sqrt(dx * dx + dy * dy));
    }
    const maxD = Math.max.apply(null, dist);
    el.innerHTML = '<div id="grid" style="width:' + W + 'px;height:' + H + 'px;display:grid;' +
      'grid-template-columns:repeat(' + COLS + ',' + CELL + 'px);gap:' + GAP + 'px">' +
      dist.map(() => '<i style="border-radius:3px;background:linear-gradient(145deg,#5F3BFF,#2b1a7a);' +
        'box-shadow:inset 0 0 0 1px rgba(255,255,255,.06)"></i>').join('') + '</div>';
    const tiles = Array.from(el.querySelectorAll('#grid i'));
    let raf = 0, start = performance.now();
    const STEP = 45, DUR = 700, HOLD = 500;
    const easeOutBack = t => { const c = 1.7; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
    const TOTAL = maxD * STEP + DUR;
    const tick = now => {
      const e = (now - start) % (TOTAL + HOLD);
      for (let i = 0; i < tiles.length; i++) {
        const d = dist[i] * STEP;
        const t = Math.max(0, Math.min(1, (e - d) / DUR));
        const s = 0.2 + 0.8 * easeOutBack(t);
        tiles[i].style.opacity = Math.min(1, t * 3);
        tiles[i].style.transform = 'scale(' + s.toFixed(3) + ')';
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }
};
