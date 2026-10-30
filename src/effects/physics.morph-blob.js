export default {
  id: 'morph-blob', group: 'physics', name: '流体形变', lib: '纯 CSS',
  desc: '圆角半径连续变化，做有机形态的呼吸体。',
  deps: '无',
  note: '用 border-radius 的 8 值语法就能做出"流体"错觉，成本比 SVG 变形滤镜低一个数量级。四个角用不同比例（62/38/46/54）才有不对称的有机感。',
  code: `.blob{
  border-radius: 62% 38% 46% 54% / 54% 42% 58% 46%;
  animation: morph 7s ease-in-out infinite;
}
@keyframes morph{
  0%,100%{ border-radius: 62% 38% 46% 54% / 54% 42% 58% 46% }
  50%    { border-radius: 38% 62% 58% 42% / 42% 58% 46% 54% }
}`,
  init(el) {
    el.innerHTML = `<div style="width:104px;height:104px;
      background:linear-gradient(135deg,#5F3BFF,#3CCBFF);
      border-radius:62% 38% 46% 54% / 54% 42% 58% 46%;
      animation:blobMorph 7s ease-in-out infinite;opacity:.9"></div>`;
    const st = document.createElement('style');
    st.textContent = `@keyframes blobMorph{
      0%,100%{border-radius:62% 38% 46% 54% / 54% 42% 58% 46%}
      50%{border-radius:38% 62% 58% 42% / 42% 58% 46% 54%}}`;
    el.appendChild(st);
    return () => st.remove();
  }
};
