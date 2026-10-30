export default {
  id: 'sparkline', group: 'data', name: '折线自绘', lib: 'SVG',
  desc: '折线从起点"画"出来，走势图出场最省事的做法。',
  deps: '无',
  note: '用 stroke-dasharray + dashoffset 做描边动画，比逐点绘制简单十倍。面积填充要单独一层，否则描边动画会连填充一起"生长"。',
  code: `const len = path.getTotalLength();      // 不需要手算长度
path.style.strokeDasharray = len;
path.style.strokeDashoffset = len;
path.getBoundingClientRect();           // 强制重排，动画才会触发
path.style.transition = 'stroke-dashoffset 1.4s ease-out';
path.style.strokeDashoffset = 0;`,
  init(el) {
    const pts = [40, 34, 38, 26, 29, 18, 22, 12, 16, 8];
    const W = 200, H = 80, step = W / (pts.length - 1);
    const d = pts.map((p, i) => `${i ? 'L' : 'M'}${(i * step).toFixed(1)},${(p * 1.6 + 4).toFixed(1)}`).join(' ');
    el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" style="width:200px;height:80px">
      <defs><linearGradient id="sf" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#3CCBFF" stop-opacity=".28"/>
        <stop offset="1" stop-color="#3CCBFF" stop-opacity="0"/>
      </linearGradient></defs>
      <path id="area" d="${d} L${W},${H} L0,${H} Z" fill="url(#sf)"
        style="opacity:0;transition:opacity .6s ease .5s"/>
      <path id="line" d="${d}" fill="none" stroke="#3CCBFF" stroke-width="2"
        stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
    const line = el.querySelector('#line'), area = el.querySelector('#area');
    const len = line.getTotalLength();
    let timer;
    const run = () => {
      line.style.transition = 'none';
      line.style.strokeDasharray = len;
      line.style.strokeDashoffset = len;
      area.style.opacity = 0;
      line.getBoundingClientRect();
      line.style.transition = 'stroke-dashoffset 1.4s cubic-bezier(.16,1,.3,1)';
      line.style.strokeDashoffset = 0;
      area.style.opacity = 1;
    };
    setTimeout(run, 120);
    timer = setInterval(run, 2800);
    return () => clearInterval(timer);
  }
};
