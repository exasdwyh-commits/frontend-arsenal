export default {
  id: 'magnetic-btn', group: 'feedback', name: '磁吸按钮', lib: '原生 JS',
  desc: '鼠标靠近时按钮被"吸"过去，高端品牌官网标配。',
  deps: '无',
  note: '位移系数压到 0.35 倍距离，超过就变成失控。回弹必须交给 CSS 的 spring 曲线，直接用 JS 设回 0 会僵。',
  code: `btn.addEventListener('mousemove', e => {
  const r = btn.getBoundingClientRect();
  const dx = (e.clientX - r.left - r.width / 2)  * 0.35;
  const dy = (e.clientY - r.top  - r.height / 2) * 0.35;
  btn.style.transform = \`translate(\${dx}px,\${dy}px)\`;
});
btn.addEventListener('mouseleave', () => {
  btn.style.transform = 'translate(0,0)';   // 交给 CSS spring 曲线回弹
});`,
  init(el) {
    el.innerHTML = `<button id="mag" style="padding:13px 30px;border-radius:99px;
      border:1px solid #3a4560;background:linear-gradient(135deg,#1a1f2c,#12151d);
      color:#e8ecf4;font-size:13px;cursor:pointer;transition:transform .35s cubic-bezier(.2,1.4,.35,1)">
      加入方案</button>`;
    const b = el.querySelector('#mag');
    const mv = e => {
      const r = b.getBoundingClientRect();
      b.style.transition = 'transform .1s ease-out';
      b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .35}px,${(e.clientY - r.top - r.height / 2) * .35}px)`;
    };
    const lv = () => {
      b.style.transition = 'transform .5s cubic-bezier(.2,1.4,.35,1)';
      b.style.transform = 'translate(0,0)';
    };
    el.addEventListener('mousemove', mv);
    el.addEventListener('mouseleave', lv);
    return () => { el.removeEventListener('mousemove', mv); el.removeEventListener('mouseleave', lv); };
  }
};
