export default {
  id: 'card-stack', group: 'space', name: '卡片堆叠', lib: '纯 CSS',
  desc: '卡片层叠如手牌，悬停时整叠散开，适合并列方案展示。',
  deps: '无',
  note: '堆叠必须靠 z-index + translate 双管，只调 translate 会出现遮挡错序。散开角度每张差 6° 最自然。',
  code: `.stack:hover .card:nth-child(1){ transform: rotate(-12deg) translateX(-58px) }
.stack:hover .card:nth-child(2){ transform: rotate(-4deg)  translateX(-20px) }
.stack:hover .card:nth-child(3){ transform: rotate(4deg)   translateX(20px)  }
.stack:hover .card:nth-child(4){ transform: rotate(12deg)  translateX(58px)  }
.card{ transition: transform .45s cubic-bezier(.2,1.3,.4,1); }`,
  init(el) {
    const colors = ['#5F3BFF', '#3CCBFF', '#BFEA1A', '#C89B63'];
    el.innerHTML = `<div id="stk" style="position:relative;width:200px;height:100px;cursor:pointer">
      ${colors.map((c, i) => `<div class="cd" style="position:absolute;left:50%;top:0;
        width:56px;height:84px;margin-left:-28px;border-radius:8px;
        background:linear-gradient(160deg,${c}33,#12151d);border:1px solid ${c}66;
        transform:rotate(${(i - 1.5) * 3}deg) translateX(${(i - 1.5) * 6}px);
        transition:transform .45s cubic-bezier(.2,1.3,.4,1);z-index:${i};
        box-shadow:0 6px 20px rgba(0,0,0,.4)">
        <div style="width:100%;height:3px;background:${c};border-radius:8px 8px 0 0"></div>
      </div>`).join('')}
    </div>`;
    const stk = el.querySelector('#stk');
    const cds = [...el.querySelectorAll('.cd')];
    const on = () => cds.forEach((n, i) => {
      n.style.transform = `rotate(${(i - 1.5) * 8}deg) translateX(${(i - 1.5) * 38}px) translateY(${Math.abs(i - 1.5) * -4}px)`;
    });
    const off = () => cds.forEach((n, i) => {
      n.style.transform = `rotate(${(i - 1.5) * 3}deg) translateX(${(i - 1.5) * 6}px)`;
    });
    stk.addEventListener('mouseenter', on);
    stk.addEventListener('mouseleave', off);
    return () => { stk.removeEventListener('mouseenter', on); stk.removeEventListener('mouseleave', off); };
  }
};
