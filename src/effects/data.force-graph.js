export default {
  id: 'force-graph', group: 'data', name: '力导向图', lib: 'D3（d3-force 思路，原生实现）',
  desc: '节点互相排斥、连线像弹簧，整张图自己找到一个不打架的排布。',
  deps: '无（d3-force 可直接用，这里手写是为了看清每一步）',
  note: '三个力要一起调：斥力决定"散开多大"，弹簧决定"收得多紧"，向心力决定"别飘出画布"。alpha 衰减太快会僵住、太慢永远在抖——0.02/帧 是个能停下来的值。每帧 O(n²) 的斥力在 n>150 时就要换成四叉树，否则主线程直接爆。',
  code: `const F = { rep: 900, linkK: .045, linkL: 46, center: .012, damp: .86 };
for (let i = 0; i < nodes.length; i++) {
  for (let j = i + 1; j < nodes.length; j++) {
    const dx = nodes[j].x - nodes[i].x, dy = nodes[j].y - nodes[i].y;
    const d2 = dx * dx + dy * dy || 1;
    const f = F.rep / d2;                 // 平方反比：近了猛推，远了不管
    const ux = dx / Math.sqrt(d2), uy = dy / Math.sqrt(d2);
    nodes[i].vx -= ux * f; nodes[i].vy -= uy * f;   // 作用力与反作用力
    nodes[j].vx += ux * f; nodes[j].vy += uy * f;
  }
}
for (const l of links) {                  // 连线当弹簧：拉长才用力，短了不推
  const a = nodes[l.a], b = nodes[l.b];
  const dx = b.x - a.x, dy = b.y - a.y;
  const d = Math.hypot(dx, dy) || 1;
  const f = (d - F.linkL) * F.linkK;
  a.vx += dx / d * f; a.vy += dy / d * f;
  b.vx -= dx / d * f; b.vy -= dy / d * f;
}`,
  init(el) {
    const NS = 'http://www.w3.org/2000/svg';
    const W = 320, H = 170;
    el.innerHTML = `<div style="position:absolute;inset:0;display:grid;place-items:center">
      <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" aria-hidden="true"></svg>
    </div>`;
    const svg = el.querySelector('svg');
    const N = [
      { r: 7, hub: true }, { r: 5 }, { r: 5 }, { r: 4 }, { r: 4 },
      { r: 3.5 }, { r: 3.5 }, { r: 3 }, { r: 3 }
    ].map((n, i) => ({
      ...n, i, x: W / 2 + Math.cos(i) * 30, y: H / 2 + Math.sin(i) * 30, vx: 0, vy: 0
    }));
    const L = [[0, 1], [0, 2], [0, 3], [1, 4], [2, 5], [2, 6], [3, 7], [7, 8]]
      .map(([a, b]) => ({ a, b }));
    const gL = document.createElementNS(NS, 'g');
    const gN = document.createElementNS(NS, 'g');
    svg.appendChild(gL); svg.appendChild(gN);
    const lines = L.map(() => {
      const ln = document.createElementNS(NS, 'line');
      ln.setAttribute('stroke', 'rgba(120,140,180,.55)');
      ln.setAttribute('stroke-width', '1');
      gL.appendChild(ln);
      return ln;
    });
    const dots = N.map(n => {
      const c = document.createElementNS(NS, 'circle');
      c.setAttribute('r', String(n.r));
      c.setAttribute('fill', n.hub ? '#c3ea3a' : '#6b7bff');
      c.setAttribute('opacity', n.hub ? '1' : '.82');
      gN.appendChild(c);
      return c;
    });

    const F = { rep: 2600, linkK: .05, linkL: 46, center: .012, damp: .86 };
    let raf = 0, hot = 0, holdT = 0;
    const heat = () => { hot = 1; holdT = 0; };
    const step = () => {
      for (let i = 0; i < N.length; i++) {
        for (let j = i + 1; j < N.length; j++) {
          const dx = N[j].x - N[i].x, dy = N[j].y - N[i].y;
          const d2 = dx * dx + dy * dy || 1;
          const d = Math.sqrt(d2);
          const f = (F.rep * hot) / d2;
          const ux = dx / d, uy = dy / d;
          N[i].vx -= ux * f; N[i].vy -= uy * f;
          N[j].vx += ux * f; N[j].vy += uy * f;
        }
      }
      for (const l of L) {
        const a = N[l.a], b = N[l.b];
        const dx = b.x - a.x, dy = b.y - a.y;
        const d = Math.hypot(dx, dy) || 1;
        const f = (d - F.linkL) * F.linkK * (0.35 + hot * 0.65);
        a.vx += dx / d * f; a.vy += dy / d * f;
        b.vx -= dx / d * f; b.vy -= dy / d * f;
      }
      for (const n of N) {
        n.vx += (W / 2 - n.x) * F.center * (0.4 + hot * 0.6);
        n.vy += (H / 2 - n.y) * F.center * (0.4 + hot * 0.6);
        n.vx *= F.damp; n.vy *= F.damp;
        n.x = Math.min(W - n.r - 2, Math.max(n.r + 2, n.x + n.vx));
        n.y = Math.min(H - n.r - 2, Math.max(n.r + 2, n.y + n.vy));
      }
      hot = Math.max(0.18, hot * 0.985);
      N.forEach((n, i) => {
        dots[i].setAttribute('cx', n.x.toFixed(1));
        dots[i].setAttribute('cy', n.y.toFixed(1));
      });
      L.forEach((l, i) => {
        lines[i].setAttribute('x1', N[l.a].x.toFixed(1));
        lines[i].setAttribute('y1', N[l.a].y.toFixed(1));
        lines[i].setAttribute('x2', N[l.b].x.toFixed(1));
        lines[i].setAttribute('y2', N[l.b].y.toFixed(1));
      });
      raf = requestAnimationFrame(step);
    };
    /* 稳定后每隔一会儿"再热一次"，看得出它在自己找平衡，而不是一张死图 */
    const beat = setInterval(heat, 4200);
    heat();
    raf = requestAnimationFrame(step);
    return () => { cancelAnimationFrame(raf); clearInterval(beat); };
  }
};
