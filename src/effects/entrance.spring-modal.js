export default {
  id: 'spring-modal', group: 'entrance', name: '弹簧弹出', lib: '纯 CSS',
  desc: '弹窗带过冲缓动出现，比线性放大更有质感。',
  deps: '无',
  note: 'cubic-bezier 的第二控制点 y 值超过 1 才会"过冲"（回弹）。1.56 是 Radix/Framer 系列默认值，再大就像果冻。',
  code: `.modal{
  transform: scale(.92); opacity: 0;
  transition: transform .42s cubic-bezier(.34,1.56,.64,1),
              opacity .2s ease-out;
}
.modal.open{ transform: scale(1); opacity: 1; }`,
  init(el) {
    el.innerHTML = `<div id="sp" style="width:130px;padding:14px;border-radius:12px;
      background:#1c2130;border:1px solid #33405a;text-align:center;
      transform:scale(.92);opacity:0;
      transition:transform .42s cubic-bezier(.34,1.56,.64,1),opacity .2s ease-out">
      <div style="font-size:12px;color:#e8ecf4">方案已生成</div>
      <div style="font-size:10px;color:#8892a6;margin-top:4px">spring overshoot</div>
    </div>`;
    const n = el.querySelector('#sp');
    let timer;
    const run = () => {
      n.style.transform = 'scale(.92)'; n.style.opacity = '0';
      requestAnimationFrame(() => {
        n.style.transform = 'scale(1)'; n.style.opacity = '1';
      });
    };
    setTimeout(run, 200);
    timer = setInterval(run, 2200);
    return () => clearInterval(timer);
  }
};
