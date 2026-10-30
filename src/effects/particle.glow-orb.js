export default {
  id: 'glow-orb', group: 'particle', name: '呼吸光球', lib: '纯 CSS',
  desc: '模糊 + 缩放做呼吸感，加载态和空状态的最佳填充。',
  deps: '无',
  note: 'filter:blur 很贵，必须限制在小面积元素上，别整屏用。移动端把 blur 半径减半，否则低端机直接掉到 20fps。',
  code: `.orb{
  width:110px; height:110px; border-radius:50%;
  background: radial-gradient(circle at 35% 30%, #3CCBFF, #5F3BFF 55%, #1a0f4d);
  filter: blur(2px);
  animation: breathe 3.2s ease-in-out infinite;
}
@keyframes breathe{
  0%,100%{ transform:scale(1);    opacity:.85 }
  50%    { transform:scale(1.14); opacity:1   }
}`,
  init(el) {
    el.innerHTML = `<div style="width:104px;height:104px;border-radius:50%;
      background:radial-gradient(circle at 35% 30%,#3CCBFF,#5F3BFF 55%,#1a0f4d);
      filter:blur(2px);box-shadow:0 0 60px rgba(95,59,255,.55);
      animation:orbBreathe 3.2s ease-in-out infinite"></div>`;
    const st = document.createElement('style');
    st.textContent = '@keyframes orbBreathe{0%,100%{transform:scale(1);opacity:.85}50%{transform:scale(1.14);opacity:1}}';
    el.appendChild(st);
    return () => st.remove();
  }
};
