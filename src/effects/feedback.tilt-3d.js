export default {
  id: 'tilt-3d', group: 'feedback', name: '3D 倾斜卡片', lib: '纯 CSS',
  desc: '卡片随鼠标角度做透视倾斜，加高光扫过，产品卡必备。',
  deps: '无',
  note: '父级必须有 perspective，倾斜角度上限控制在 12°，再大文字就开始糊。transform-style:preserve-3d 能让内部元素分层浮动。',
  code: `.wrap{ perspective: 800px; }
.tilt{
  transform-style: preserve-3d;
  transition: transform .12s ease-out;
}
/* JS */
const rx = -(y - r.height/2) / r.height * 12;   // 上限 12°
const ry =  (x - r.width/2)  / r.width  * 12;
card.style.transform = \`rotateX(\${rx}deg) rotateY(\${ry}deg)\`;`,
  init(el) {
    el.innerHTML = `<div style="perspective:800px;width:170px;height:100px">
      <div id="tl" style="width:100%;height:100%;border-radius:12px;
        background:linear-gradient(135deg,#1f2440,#12151d);border:1px solid #33405a;
        display:flex;align-items:center;justify-content:center;
        transform-style:preserve-3d;transition:transform .12s ease-out;
        box-shadow:0 12px 40px rgba(95,59,255,.18)">
        <span style="font-size:12px;color:#cfd6e4;transform:translateZ(24px)">CELLCODE</span>
      </div></div>`;
    const wrap = el.firstElementChild;
    const card = el.querySelector('#tl');
    const mv = e => {
      const r = card.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      const rx = -(y - r.height / 2) / r.height * 12;
      const ry = (x - r.width / 2) / r.width * 12;
      card.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
    };
    const lv = () => card.style.transform = 'rotateX(0) rotateY(0)';
    wrap.addEventListener('mousemove', mv);
    wrap.addEventListener('mouseleave', lv);
    return () => { wrap.removeEventListener('mousemove', mv); wrap.removeEventListener('mouseleave', lv); };
  }
};
