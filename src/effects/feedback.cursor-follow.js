export default {
  id: 'cursor-follow', group: 'feedback', name: '光标拖影', lib: '原生 JS',
  desc: '主光标加一个延迟跟随的柔光圈，科技感立现。',
  deps: '无',
  note: '视觉层必须 pointer-events:none，否则会把整页的点击全吃掉——这是最常见的翻车点，而且很难查。',
  code: `.glow{
  position: fixed; width:180px; height:180px; border-radius:50%;
  background: radial-gradient(circle, rgba(95,59,255,.35), transparent 70%);
  pointer-events: none;           /* 关键：不吃点击 */
  transform: translate(-50%,-50%);
  transition: transform .18s ease-out;
}`,
  init(el) {
    el.innerHTML = `<div id="glow" style="position:absolute;width:120px;height:120px;
      border-radius:50%;background:radial-gradient(circle,rgba(95,59,255,.5),transparent 70%);
      pointer-events:none;left:50%;top:50%;transform:translate(-50%,-50%);
      transition:transform .18s ease-out"></div>`;
    const g = el.querySelector('#glow');
    const mv = e => {
      const r = el.getBoundingClientRect();
      g.style.transform = `translate(${e.clientX - r.left}px,${e.clientY - r.top}px) translate(-50%,-50%)`;
    };
    el.addEventListener('mousemove', mv);
    return () => el.removeEventListener('mousemove', mv);
  }
};
