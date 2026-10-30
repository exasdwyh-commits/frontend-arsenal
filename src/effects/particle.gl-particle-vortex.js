export default {
  id: 'gl-particle-vortex', group: 'particle', name: '星轨螺旋（拖尾残影）', lib: 'Canvas 2D',
  desc: '粒子绕中心螺旋坠落，用半透明清屏留下拖尾，像长曝光的星轨。',
  deps: '无',
  note: '拖尾不能每帧 clearRect，而是铺一层 rgba(bg, alpha)：alpha 0.12~0.25 是甜区；0.05 以下残影会糊成一块死色，0.4 以上几乎没有尾巴。粒子按半径给不同角速度（ω ∝ 1/r）才有“掉进漩涡”的加速感，等角速度看起来像刚体转盘。',
  code: "const cv = document.querySelector('#stage'), g = cv.getContext('2d');\nconst W = cv.width, H = cv.height;\nconst CX = W / 2, CY = H / 2;\nconst P = Array.from({ length: 260 }, () => spawn(true));\n\nfunction spawn(init) {\n  return {\n    r: init ? 8 + Math.random() * (W * 0.5) : W * 0.45,\n    a: Math.random() * Math.PI * 2,\n    w: 0.0,\n    life: init ? 1 : 0,\n    hue: 200 + Math.random() * 60\n  };\n}\n\nfunction tick() {\n  // 残影：一次半透明覆盖 = 拖尾长度\n  g.fillStyle = 'rgba(8,10,16,0.18)';\n  g.fillRect(0, 0, W, H);\n  g.globalCompositeOperation = 'lighter';\n\n  for (const p of P) {\n    // 角速度 ∝ 1/r，内圈更快 → 螺旋加速\n    const omega = 520 / (p.r + 40);\n    p.a += omega * 0.016;\n    p.r -= 0.55 + 26 / (p.r + 20);      // 越靠内坠落越快\n    p.life = Math.min(1, p.life + 0.06);\n\n    if (p.r < 6) Object.assign(p, spawn(false));\n\n    const x = CX + Math.cos(p.a) * p.r;\n    const y = CY + Math.sin(p.a) * p.r * 0.42;   // 压扁 = 透视倾角\n    const s = 0.8 + (1 - p.r / (W * 0.5)) * 1.6;\n    g.fillStyle = `hsla(\\${p.hue},90%,72%,\\${0.5 * p.life})`;\n    g.beginPath();\n    g.arc(x, y, s, 0, 6.2832);\n    g.fill();\n  }\n  g.globalCompositeOperation = 'source-over';\n}\n\nconst timer = setInterval(tick, 16);",
  init(el) {
    el.innerHTML = '';
    const cv = document.createElement('canvas');
    const W = 280, H = 150, dpr = Math.min(devicePixelRatio || 1, 2);
    cv.width = W * dpr; cv.height = H * dpr;
    cv.style.cssText = 'width:100%;height:100%;display:block';
    el.appendChild(cv);
    const g = cv.getContext('2d');
    g.scale(dpr, dpr);
    g.fillStyle = '#080a10'; g.fillRect(0, 0, W, H);

    const CX = W / 2, CY = H / 2;
    const RMAX = W * 0.46;
    const spawn = init => ({
      r: init ? 8 + Math.random() * RMAX : RMAX * (0.8 + Math.random() * 0.2),
      a: Math.random() * Math.PI * 2,
      life: init ? Math.random() : 0,
      hue: 195 + Math.random() * 70,
      size: 0.7 + Math.random() * 1.1
    });
    const P = Array.from({ length: 240 }, () => spawn(true));

    function tick() {
      g.fillStyle = 'rgba(8,10,16,0.19)';
      g.fillRect(0, 0, W, H);
      g.globalCompositeOperation = 'lighter';
      for (const p of P) {
        const omega = 420 / (p.r + 34);
        p.a += omega * 0.016;
        p.r -= 0.5 + 22 / (p.r + 18);
        p.life = Math.min(1, p.life + 0.05);
        if (p.r < 5) Object.assign(p, spawn(false));

        const x = CX + Math.cos(p.a) * p.r;
        const y = CY + Math.sin(p.a) * p.r * 0.40;
        const s = p.size * (0.85 + (1 - p.r / RMAX) * 1.5);
        g.fillStyle = `hsla(${p.hue}, 92%, 72%, ${0.52 * p.life})`;
        g.beginPath();
        g.arc(x, y, s, 0, 6.2832);
        g.fill();
      }
      // 中心核
      const core = g.createRadialGradient(CX, CY, 0, CX, CY, 16);
      core.addColorStop(0, 'rgba(140,220,255,0.55)');
      core.addColorStop(1, 'rgba(140,220,255,0)');
      g.fillStyle = core;
      g.fillRect(CX - 16, CY - 16, 32, 32);
      g.globalCompositeOperation = 'source-over';
    }

    let raf = 0, last = 0;
    const loop = ts => {
      if (ts - last >= 16) { tick(); last = ts; }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(raf);
  }
};
