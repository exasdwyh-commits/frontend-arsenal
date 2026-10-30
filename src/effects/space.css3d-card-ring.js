export default {
  id: 'css3d-card-ring', group: 'space', name: 'CSS 3D 环形卡片（CSS3DRenderer 思路）', lib: '纯 CSS',
  desc: '八张卡片围成圆环，整体缓慢旋转，按住可拨动转盘。',
  deps: '无',
  note: 'CSS3DRenderer 的本质是给每个对象写 matrix3d()，父级 transform-style: preserve-3d 断一代就塌成平面（加 overflow:hidden、filter、opacity<1 都会断）。要圆环透视正确，perspective 放在祖级、perspective-origin 居中，圆环半径建议 ≥ 卡片宽的 1.2 倍。',
  code: `.ring{ perspective: 900px; height: 100%; display:grid; place-items:center; }
.disc{
  width: 120px; height: 74px;
  position: relative;
  transform-style: preserve-3d;
  transform: rotateX(-12deg) rotateY(var(--ry, 0deg));
}
.disc .card{
  position: absolute; inset: 0;
  border-radius: 10px;
  background: linear-gradient(140deg,#1e2440,#101319);
  border: 1px solid #33405a;
  backface-visibility: hidden;
  /* 第 n 张：绕 Y 轴转 i*45 度，再沿 Z 推到半径处 */
  transform: rotateY(calc(var(--i) * 45deg)) translateZ(150px);
}
/* JS */
disc.style.setProperty('--ry', ry + 'deg');   // 每帧 += 0.15，松手惯性衰减`,
  init(el) {
    el.innerHTML = `<div class="ring" style="
      perspective:900px;height:100%;display:grid;place-items:center;overflow:hidden">
      <div id="disc" style="width:118px;height:72px;position:relative;transform-style:preserve-3d;
        transform:rotateX(-14deg) rotateY(0deg)"></div>
    </div>`;
    const disc = el.querySelector('#disc');
    const labels = ['PLAN', 'BUILD', 'SHIP', 'MEASURE', 'ITER', 'SCALE', 'OPS', 'GROW'];
    const cards = labels.map((t, i) => {
      const d = document.createElement('div');
      d.style.cssText = `
        position:absolute;inset:0;border-radius:9px;display:flex;align-items:center;
        justify-content:center;font:600 10px/1 ui-monospace,monospace;letter-spacing:.08em;
        color:#bcd0ff;background:linear-gradient(140deg,#1d2440,#0f1218);
        border:1px solid #2c3a5c;backface-visibility:hidden;
        box-shadow:0 6px 18px rgba(0,0,0,.4);
        transform:rotateY(${i * 45}deg) translateZ(152px)`;
      d.textContent = t;
      disc.appendChild(d);
      return d;
    });

    let ry = 0, v = 0.16, drag = false, lx = 0, raf = 0;
    const down = e => { drag = true; lx = e.clientX; };
    const move = e => {
      if (!drag) return;
      const dx = e.clientX - lx; lx = e.clientX;
      v = dx * 0.45;                       // 拖拽直接给角速度
      ry += v;
    };
    const up = () => { drag = false; };
    el.addEventListener('pointerdown', down);
    addEventListener('pointermove', move);
    addEventListener('pointerup', up);

    const loop = () => {
      if (!drag) {
        v += (0.16 - v) * 0.03;            // 回落到基础自转速度
        ry += v;
        v *= 0.985;                        // 惯性衰减 ≈ 3s 归零
      }
      disc.style.transform = `rotateX(-14deg) rotateY(${ry}deg)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener('pointerdown', down);
      removeEventListener('pointermove', move);
      removeEventListener('pointerup', up);
      cards.length = 0;
    };
  }
};
