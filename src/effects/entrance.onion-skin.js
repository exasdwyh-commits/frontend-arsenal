export default {
  id: 'onion-skin', group: 'entrance', name: '洋葱皮逐帧', lib: 'OpenToonz（动画检查器）',
  desc: '当前帧实色，前后两帧只剩淡淡残影——一眼看出这一帧比上一帧多走了多少。',
  deps: '无',
  note: '残影必须"降透明度 + 换色相"两件事一起做：只降透明度会跟背景糊成一片，只换色相又抢不掉注意。前后帧各留 2 帧就够，再多就只剩一团。做逐帧对比时把过渡设成 0s（帧是跳变，不是插值），这正是它和补间动画最大的区别。',
  code: `/* 一个 8 帧的走路循环：每帧只是一个位移 + 旋转 */
const poses = [...Array(8)].map((_, i) => ({
  x: Math.cos(i / 8 * Math.PI * 2) * 26,
  y: Math.abs(Math.sin(i / 8 * Math.PI * 2)) * -14,
  rot: Math.sin(i / 8 * Math.PI * 2) * 9
}));
/* 画的时候：当前帧实色，i-1/i-2 与 i+1/i+2 挂不同色相的低透明度副本 */
ghost.fill = \`hsl(\${hue} 80% 62%)\`;
ghost.opacity = 0.16 / k;      // 越远越淡
ghost.style.transition = 'none';   // 帧与帧之间是跳变`,
  init(el) {
    el.innerHTML = `<div style="position:absolute;inset:0;display:grid;place-items:center">
      <div class="os-wrap" style="position:relative;width:220px;height:130px">
        <svg width="220" height="130" viewBox="0 0 220 130" aria-hidden="true"></svg>
        <div class="os-hud" style="position:absolute;right:0;bottom:-2px;
          font:10px/1 ui-monospace,Consolas,monospace;letter-spacing:.12em;color:#8b93a4"></div>
      </div>
    </div>`;
    const svg = el.querySelector('svg');
    const hud = el.querySelector('.os-hud');
    const NS = 'http://www.w3.org/2000/svg';
    const CX = 110, CY = 96;

    const mk = (fill, op) => {
      const g = document.createElementNS(NS, 'g');
      g.setAttribute('opacity', String(op));
      const body = document.createElementNS(NS, 'rect');
      body.setAttribute('x', '-9'); body.setAttribute('y', '-30');
      body.setAttribute('width', '18'); body.setAttribute('height', '30');
      body.setAttribute('rx', '7'); body.setAttribute('fill', fill);
      const legs = document.createElementNS(NS, 'path');
      legs.setAttribute('d', 'M-4 0l-8 22M4 0l8 22');
      legs.setAttribute('stroke', fill); legs.setAttribute('stroke-width', '4');
      legs.setAttribute('stroke-linecap', 'round'); legs.setAttribute('fill', 'none');
      g.appendChild(body); g.appendChild(legs);
      svg.appendChild(g);
      return g;
    };
    /* 由远到近画，当前帧最后画（盖在最上面） */
    const ghosts = [];
    for (let k = 2; k >= 1; k--) {
      ghosts.push({ k, g: mk('hsl(' + (k === 1 ? 190 : 250) + ' 70% 60%)', 0.1 / k + 0.06) });
      ghosts.push({ k: -k, g: mk('hsl(' + (k === -1 ? 190 : 250) + ' 70% 60%)', 0.1 / k + 0.06) });
    }
    const cur = mk('#e8eef9', 1);

    const POSE = i => {
      const a = (i / 8) * Math.PI * 2;
      return { x: Math.cos(a) * 30, y: Math.abs(Math.sin(a)) * -16, r: Math.sin(a) * 10 };
    };
    const put = (g, pose, op) => {
      g.setAttribute('opacity', String(op));
      g.setAttribute('transform', 'translate(' + (CX + pose.x).toFixed(1) + ' ' + (CY + pose.y).toFixed(1) +
        ') rotate(' + pose.r.toFixed(1) + ')');
    };

    let f = 0, raf = 0, acc = 0, last = 0;
    const FPS = 6;                     /* 故意只有 6 帧/秒：逐帧动画本来就该"跳" */
    const loop = now => {
      const dt = last ? now - last : 16;
      last = now;
      acc += dt;
      if (acc >= 1000 / FPS) {
        acc = 0;
        f = (f + 1) % 8;
      }
      for (const gh of ghosts) put(gh.g, POSE((f + gh.k + 8) % 8), 0.1 / Math.abs(gh.k) + 0.05);
      put(cur, POSE(f), 1);
      hud.textContent = 'FRAME ' + (f + 1) + ' / 8';
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }
};
