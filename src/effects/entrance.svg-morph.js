export default {
  id: 'svg-morph', group: 'entrance', name: 'SVG 路径变形', lib: 'anime.js / MorphSVG 思路（原生采样实现）',
  desc: '一个图形直接"长"成另一个形状，中间每一帧都是合法路径——不是两图交叉淡化。',
  deps: '无',
  note: '两条路径的命令数、顺序不同，就不能直接插值 d，必须先按长度采样成同样多的点再点对点插值。采样 48~96 个点足够：少了拐角变圆，多了每帧拼的字符串太长。起点必须对齐（同方向、同起始位置），否则图形会"拧"着过去。getTotalLength 要等元素真的进了文档才准，不能对游离节点取长度。',
  code: `/* 任意路径 → N 个等距采样点，两条路径就有了同构的数据 */
function sample(pathEl, N) {
  const L = pathEl.getTotalLength();
  return Array.from({ length: N }, (_, i) => pathEl.getPointAtLength(L * i / (N - 1)));
}
/* 逐点插值，再拼回一条合法路径 */
const d = pts.map((p, i) => (i ? 'L' : 'M') + p.x.toFixed(1) + ' ' + p.y.toFixed(1)).join(' ');
path.setAttribute('d', d);`,
  init(el) {
    const NS = 'http://www.w3.org/2000/svg';
    const W = 260, H = 160, N = 72;

    el.innerHTML = `<div style="position:absolute;inset:0;display:grid;place-items:center">
      <div style="position:relative;width:${W}px;height:${H}px">
        <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" aria-hidden="true">
          <defs>
            <linearGradient id="svgm-g" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stop-color="#c3ea3a"/><stop offset="1" stop-color="#3ccbff"/>
            </linearGradient>
          </defs>
          <g class="m-ref" visibility="hidden"></g>
          <path class="m-out" fill="url(#svgm-g)" fill-opacity=".16"
            stroke="url(#svgm-g)" stroke-width="1.6" stroke-linejoin="round"></path>
        </svg>
        <span class="m-hud" style="position:absolute;left:0;bottom:-2px;
          font:9.5px/1 ui-monospace,Consolas,monospace;letter-spacing:.14em;color:#8b93a4"></span>
      </div>
    </div>`;

    const svg = el.querySelector('svg');
    const refG = svg.querySelector('.m-ref');
    const out = svg.querySelector('.m-out');
    const hud = el.querySelector('.m-hud');

    /* 两个形状：五角星 / 圆角方块。都用同一套坐标空间 */
    const cx = W / 2, cy = H / 2 - 4;
    let star = '';
    for (let i = 0; i < 10; i++) {
      const r = i % 2 ? 21 : 52;
      const a = -Math.PI / 2 + i * Math.PI / 5;
      star += (i ? 'L' : 'M') + (cx + Math.cos(a) * r).toFixed(1) + ' ' + (cy + Math.sin(a) * r).toFixed(1);
    }
    star += 'Z';
    const box = `M ${cx - 58} ${cy - 42} L ${cx + 58} ${cy - 42} Q ${cx + 74} ${cy - 42} ${cx + 74} ${cy - 26}
      L ${cx + 74} ${cy + 26} Q ${cx + 74} ${cy + 42} ${cx + 58} ${cy + 42}
      L ${cx - 58} ${cy + 42} Q ${cx - 74} ${cy + 42} ${cx - 74} ${cy + 26}
      L ${cx - 74} ${cy - 26} Q ${cx - 74} ${cy - 42} ${cx - 58} ${cy - 42} Z`;

    const mk = d => {
      const p = document.createElementNS(NS, 'path');
      p.setAttribute('d', d);
      refG.appendChild(p);
      return p;
    };
    /* 元素必须先入文档，getTotalLength / getPointAtLength 才准 */
    const sample = (pathEl, n) => {
      const L = pathEl.getTotalLength();
      return Array.from({ length: n }, (_, i) => pathEl.getPointAtLength(L * i / (n - 1)));
    };
    const A = sample(mk(star), N);
    const B = sample(mk(box), N);
    /* 起点对齐：找出让两串点"总距离最小"的旋转偏移，
       否则星角会去对方块的中边，途中看起来是拧毛巾 */
    let best = 0, bestCost = Infinity;
    for (let s = 0; s < N; s++) {
      let cost = 0;
      for (let i = 0; i < N; i++) {
        const j = (i + s) % N;
        cost += Math.hypot(A[i].x - B[j].x, A[i].y - B[j].y);
      }
      if (cost < bestCost) { bestCost = cost; best = s; }
    }
    const B2 = Array.from({ length: N }, (_, i) => B[(i + best) % N]);

    const paint = t => {
      const e = t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; /* easeInOutCubic */
      let d = '';
      for (let i = 0; i < N; i++) {
        const x = A[i].x + (B2[i].x - A[i].x) * e;
        const y = A[i].y + (B2[i].y - A[i].y) * e;
        d += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
      }
      out.setAttribute('d', d + 'Z');
      hud.textContent = `STAR ⇄ BOX · ${N} 采样点 · ${Math.round(e * 100)}%`;
    };

    let raf = 0, start = 0;
    const CYCLE = 1900, PAUSE = 520;
    const loop = now => {
      if (!start) start = now;
      const span = CYCLE + PAUSE;
      const k = Math.floor((now - start) / span);
      const p = (now - start) % span;
      /* 前 55% 变形，剩下的一直停在目标形状上喘一口气；下一轮反向回来 */
      const t = p < CYCLE ? Math.min(1, p / (CYCLE * .55)) : 1;
      paint(k % 2 ? 1 - t : t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }
};
