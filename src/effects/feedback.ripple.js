export default {
  id: 'ripple', group: 'feedback', name: '点击涟漪', lib: '纯 CSS',
  desc: '点击位置扩散水波，Material 系最经典的反馈。',
  deps: '无',
  note: '涟漪必须从点击坐标算，不能用元素中心。动画结束要 remove 节点，否则快速连点会堆出几十个 DOM。',
  code: `btn.addEventListener('click', e => {
  const r = btn.getBoundingClientRect();
  const d = Math.max(r.width, r.height) * 2;
  const s = document.createElement('span');
  s.style.cssText = \`position:absolute;left:\${e.clientX-r.left-d/2}px;
    top:\${e.clientY-r.top-d/2}px;width:\${d}px;height:\${d}px;border-radius:50%;
    background:rgba(255,255,255,.35);transform:scale(0);pointer-events:none;\`;
  btn.appendChild(s);
  s.animate([{transform:'scale(0)',opacity:.6},{transform:'scale(1)',opacity:0}],
            {duration:600,easing:'ease-out'}).onfinish = () => s.remove();
});`,
  init(el) {
    el.innerHTML = `<button id="rp" style="position:relative;overflow:hidden;
      padding:14px 34px;border-radius:10px;border:none;cursor:pointer;
      background:linear-gradient(135deg,#5F3BFF,#3b1fd6);color:#fff;font-size:13px">
      点击我</button>`;
    const btn = el.querySelector('#rp');
    const cl = e => {
      const r = btn.getBoundingClientRect();
      const d = Math.max(r.width, r.height) * 2;
      const s = document.createElement('span');
      s.style.cssText = `position:absolute;left:${e.clientX - r.left - d / 2}px;
        top:${e.clientY - r.top - d / 2}px;width:${d}px;height:${d}px;border-radius:50%;
        background:rgba(255,255,255,.4);transform:scale(0);pointer-events:none;`;
      btn.appendChild(s);
      s.animate([{ transform: 'scale(0)', opacity: .65 }, { transform: 'scale(1)', opacity: 0 }],
        { duration: 620, easing: 'ease-out' }).onfinish = () => s.remove();
    };
    btn.addEventListener('click', cl);
    return () => btn.removeEventListener('click', cl);
  }
};
