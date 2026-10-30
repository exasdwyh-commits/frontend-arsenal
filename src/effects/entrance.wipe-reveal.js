export default {
  id: 'wipe-reveal', group: 'entrance', name: '遮罩擦除', lib: '纯 CSS',
  desc: '用 clip-path 做蒙版擦除，比淡入更有"揭幕"的仪式感。',
  deps: '无',
  note: 'clip-path 走 GPU 合成，比动画 width/height 便宜一个数量级。奢侈品广告的入场几乎都用 inset() 从右往左擦。',
  code: `.wipe{
  clip-path: inset(0 100% 0 0);
  animation: wipe .9s cubic-bezier(.77,0,.18,1) forwards;
}
@keyframes wipe{ to{ clip-path: inset(0 0 0 0); } }`,
  init(el) {
    el.innerHTML = `<div class="wipe" style="font-size:26px;font-weight:700;letter-spacing:-1px;
      background:linear-gradient(90deg,#5F3BFF,#3CCBFF);-webkit-background-clip:text;
      background-clip:text;color:transparent;padding:10px 22px">DECODE</div>
      <style>@keyframes wipe{to{clip-path:inset(0 0 0 0)}}</style>`;
    const n = el.querySelector('.wipe');
    const run = () => {
      n.style.animation = 'none'; void n.offsetWidth;
      n.style.animation = 'wipe .9s cubic-bezier(.77,0,.18,1) forwards';
    };
    run();
    const t = setInterval(run, 1600);
    return () => clearInterval(t);
  }
};
