export default {
  id: 'gravity-drop', group: 'physics', name: '重力坠落', lib: '原生物理积分',
  desc: '元素受重力下落并弹性回弹，做"到货/落地"类提示。',
  deps: '无（复杂场景用 Rapier）',
  note: '阻尼系数 0.72 是手感分水岭：大于 0.85 会弹到天荒地老，小于 0.6 完全没有弹性观感。触地判定要留 1~2px 容差，否则会抖。',
  code: `let y = -60, vy = 0;
const G = 0.9, DAMP = 0.72;      // 阻尼决定回弹次数
function tick() {
  vy += G; y += vy;
  if (y > floor) {
    y = floor; vy *= -DAMP;
    if (Math.abs(vy) < 1) vy = 0;   // 静止阈值，避免无限微抖
  }
  el.style.transform = \`translateY(\${y}px)\`;
  requestAnimationFrame(tick);
}`,
  init(el) {
    el.innerHTML = `<div style="position:absolute;inset:0;overflow:hidden">
      <div id="ball" style="position:absolute;left:50%;top:10px;margin-left:-14px;
        width:28px;height:28px;border-radius:50%;
        background:linear-gradient(135deg,#BFEA1A,#3CCBFF);
        box-shadow:0 0 20px rgba(191,234,26,.5)"></div>
      <div style="position:absolute;left:0;right:0;bottom:24px;height:1px;background:#2b3346"></div>
    </div>`;
    const b = el.querySelector('#ball');
    let y = 0, vy = 0, raf, resetT;
    const floor = 88;
    const loop = () => {
      vy += .9; y += vy;
      if (y > floor) {
        y = floor; vy *= -.72;
        if (Math.abs(vy) < 1.2) {
          vy = 0;
          clearTimeout(resetT);
          resetT = setTimeout(() => { y = 0; vy = 0; }, 700);
        }
      }
      b.style.transform = `translateY(${y}px)`;
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => { cancelAnimationFrame(raf); clearTimeout(resetT); };
  }
};
