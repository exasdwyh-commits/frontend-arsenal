export default {
  id: 'gradient-flow', group: 'particle', name: '流动渐变', lib: '纯 CSS',
  desc: '渐变背景缓慢位移，做产品页 hero 区域的底噪。',
  deps: '无',
  note: 'background-position 是少数能被 GPU 加速的背景属性。千万别动 background-size——那会触发全量重绘。',
  code: `.flow{
  background: linear-gradient(120deg, #1a0f4d, #5F3BFF, #3CCBFF, #1a0f4d);
  background-size: 300% 300%;
  animation: flow 9s ease infinite;
}
@keyframes flow{
  0%,100%{ background-position: 0% 50% }
  50%    { background-position: 100% 50% }
}`,
  init(el) {
    el.innerHTML = `<div style="position:absolute;inset:0;
      background:linear-gradient(120deg,#1a0f4d,#5F3BFF,#3CCBFF,#1a0f4d);
      background-size:300% 300%;animation:gFlow 9s ease infinite;opacity:.85"></div>
      <div style="position:relative;font-size:12px;color:#fff;letter-spacing:3px">FLOW</div>`;
    const st = document.createElement('style');
    st.textContent = '@keyframes gFlow{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}';
    el.appendChild(st);
    return () => st.remove();
  }
};
