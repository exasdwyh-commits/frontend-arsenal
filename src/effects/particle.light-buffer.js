export default {
  id: 'light-buffer', group: 'particle', name: '双缓冲加色光', lib: 'Canvas 2D（两张画布）',
  desc: '颜色画在一张不透明的底图上，光单独画一张用 lighter 叠上去——光是「加」上去的，不是盖上去的。',
  deps: '无',
  note: '关键不在 lighter，而在分层：底层必须是不透明、偏暗的实色，光层才有地方加；一旦两层画在同一张画布，加色会把已经画好的颜色一起漂白，最后整屏发灰。光层用低 alpha 多次叠加而不是一次高 alpha，边缘才会自然过渡。必须压曝光：多盏光叠在一起时总 alpha 要有上限，超了就是一片死白，层次全没。光层 canvas 设 pointer-events:none，不然会挡掉底下的交互。',
  code: `/* 底层：不透明、实色、不发光 */
base.fillStyle = '#0b0f18';
base.fillRect(0, 0, W, H);
base.drawImage(silhouette, 0, 0);

/* 光层：透明画布 + lighter，只做加法 */
light.globalCompositeOperation = 'lighter';
for (const orb of orbs) {
  const g = light.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.r);
  g.addColorStop(0, \`rgba(\${orb.c},.20)\`);   // 低 alpha 多次叠
  g.addColorStop(1, \`rgba(\${orb.c},0)\`);
  light.fillStyle = g;
  light.beginPath(); light.arc(orb.x, orb.y, orb.r, 0, Math.PI * 2); light.fill();
}
/* 曝光上限：总亮度到线就压，不许整片死白 */
light.globalCompositeOperation = 'source-over';
light.fillStyle = 'rgba(6,9,16,.16)';
light.fillRect(0, 0, W, H);`,
  init(el) {
    el.innerHTML = `<div style="position:absolute;inset:0;display:grid;place-items:center">
      <div style="position:relative;width:286px;height:156px;border-radius:8px;overflow:hidden">
        <canvas width="286" height="156" style="position:absolute;inset:0;display:block"></canvas>
        <canvas width="286" height="156" style="position:absolute;inset:0;display:block;pointer-events:none"></canvas>
      </div>
    </div>`;
    const base = el.querySelectorAll('canvas')[0];
    const light = el.querySelectorAll('canvas')[1];
    const b = base.getContext('2d');
    const l = light.getContext('2d');
    const W = base.width, H = base.height;
    let raf, t = 0;

    // 底层：一次画好，之后只在光层动
    const paintBase = () => {
      const g = b.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#101830');
      g.addColorStop(.62, '#0b1120');
      g.addColorStop(1, '#06080f');
      b.fillStyle = g; b.fillRect(0, 0, W, H);

      // 远景山脊：实色，不发光，光才有落点
      b.fillStyle = '#16233a';
      b.beginPath(); b.moveTo(0, H * .68);
      for (let x = 0; x <= W; x += 8) {
        b.lineTo(x, H * .68 - Math.sin(x * .021) * 16 - Math.sin(x * .047 + 2) * 7);
      }
      b.lineTo(W, H); b.lineTo(0, H); b.closePath(); b.fill();

      b.fillStyle = '#0e1828';
      b.beginPath(); b.moveTo(0, H * .82);
      for (let x = 0; x <= W; x += 8) {
        b.lineTo(x, H * .82 - Math.sin(x * .013 + 4) * 12 - Math.sin(x * .033) * 5);
      }
      b.lineTo(W, H); b.lineTo(0, H); b.closePath(); b.fill();

      // 一根实色柱子，用来对比"光加在上面"和"光盖上去"
      b.fillStyle = '#223354';
      b.fillRect(W * .5 - 7, H * .5, 14, H * .32);
    };

    const orbs = [
      { c: '95,59,255', x: 0, y: 0, r: 78, sp: .0011, ph: 0 },
      { c: '60,203,255', x: 0, y: 0, r: 62, sp: .0017, ph: 2.1 },
      { c: '255,176,90', x: 0, y: 0, r: 48, sp: .0009, ph: 4.4 }
    ];

    const loop = () => {
      t += 16;
      l.clearRect(0, 0, W, H);
      l.globalCompositeOperation = 'lighter';
      for (const o of orbs) {
        o.x = W * .5 + Math.sin(t * o.sp + o.ph) * W * .34;
        o.y = H * .56 + Math.cos(t * o.sp * 1.4 + o.ph) * 26;
        const g = l.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
        g.addColorStop(0, `rgba(${o.c},.20)`);
        g.addColorStop(.45, `rgba(${o.c},.09)`);
        g.addColorStop(1, `rgba(${o.c},0)`);
        l.fillStyle = g;
        l.beginPath(); l.arc(o.x, o.y, o.r, 0, Math.PI * 2); l.fill();
      }
      // 曝光上限：轻微压一层，避免叠成死白
      l.globalCompositeOperation = 'source-over';
      l.fillStyle = 'rgba(6,9,16,.10)';
      l.fillRect(0, 0, W, H);
      raf = requestAnimationFrame(loop);
    };

    paintBase();
    loop();
    return () => cancelAnimationFrame(raf);
  }
};
