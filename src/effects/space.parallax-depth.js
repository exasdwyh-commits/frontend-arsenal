export default {
  id: 'parallax-depth', group: 'space', name: '视差景深', lib: '纯 CSS',
  desc: '多层元素按不同速率位移，制造空间纵深。',
  deps: '无',
  note: '三层就够：背景 0.2x、主体 1x、前景 1.8x。加到五层以上用户感知不到，只增加渲染负担。',
  code: `.layer{ position:absolute; will-change:transform; }
/* JS 中按速率分层位移 */
bg.style.transform  = \`translate(\${x*0.2}px, \${y*0.2}px)\`;
mid.style.transform = \`translate(\${x*1.0}px, \${y*1.0}px)\`;
fg.style.transform  = \`translate(\${x*1.8}px, \${y*1.8}px)\`;`,
  init(el) {
    el.innerHTML = `<div style="position:absolute;inset:0;overflow:hidden">
      <div class="pl" style="position:absolute;inset:-20px;background:
        radial-gradient(circle at 30% 40%,#241a55,transparent 60%),
        radial-gradient(circle at 70% 70%,#0f3a52,transparent 60%)"></div>
      <div class="pl" style="position:absolute;left:50%;top:50%;width:78px;height:78px;
        margin:-39px;border-radius:16px;background:linear-gradient(135deg,#5F3BFF,#3CCBFF)"></div>
      <div class="pl" style="position:absolute;left:20%;top:22%;width:6px;height:6px;
        border-radius:50%;background:#fff;box-shadow:0 0 12px #fff"></div>
      <div class="pl" style="position:absolute;right:22%;bottom:20%;width:4px;height:4px;
        border-radius:50%;background:#BFEA1A;box-shadow:0 0 10px #BFEA1A"></div>
    </div>`;
    const ls = [...el.querySelectorAll('.pl')];
    const rates = [.2, 1, 1.8, 1.8];
    const mv = e => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) / r.width * 34;
      const y = (e.clientY - r.top - r.height / 2) / r.height * 34;
      ls.forEach((n, i) => n.style.transform = `translate(${x * rates[i]}px,${y * rates[i]}px)`);
    };
    el.addEventListener('mousemove', mv);
    return () => el.removeEventListener('mousemove', mv);
  }
};
