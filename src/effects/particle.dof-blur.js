export default {
  id: 'dof-blur', group: 'particle', name: '分层景深模糊', lib: 'CSS filter',
  desc: '前后景不同模糊半径 + 轻微位移，用最小代价做镜头景深。',
  deps: '无（生产用 PixiJS BlurFilter）',
  note: 'PixiJS 的 BlurFilter 里 quality 就是 passes 数，每 pass 采样 strength/passes。passes=4 的中值模糊成本约等于 4 次全屏采样，移动端降到 2 立刻回血。CSS 侧 blur 半径超过 8px 在低端安卓就掉帧。',
  code: `// PixiJS：quality 就是 passes，强度会被均分到每 pass
new BlurFilter({ strength: 8, quality: 4 })
// 内部：uniforms.uStrength = strength / passes
// 想更省：strength 12 + quality 2（模糊够大但只采 2 遍）

/* CSS 等效分层 */
.far  { filter: blur(6px); transform: scale(1.04); opacity:.45 }
.mid  { filter: blur(2px); opacity:.85 }
.near { filter: blur(0);   transform: scale(1.02) }`,
  init(el) {
    el.innerHTML = `<div style="position:relative;width:230px;height:110px;overflow:hidden">
      <div class="dof far" style="position:absolute;left:-10px;top:-10px;right:-10px;bottom:-10px;
        background:radial-gradient(circle at 25% 30%,#3a2a8a,transparent 55%),
        radial-gradient(circle at 75% 70%,#0f4a63,transparent 55%)"></div>
      <div class="dof mid" style="position:absolute;left:50%;top:50%;width:56px;height:56px;
        margin:-28px;border-radius:14px;background:linear-gradient(135deg,#5F3BFF,#3CCBFF)"></div>
      <div class="dof near" style="position:absolute;left:16%;bottom:14%;width:9px;height:9px;
        border-radius:50%;background:#BFEA1A;box-shadow:0 0 14px #BFEA1A"></div>
      <div class="dof near" style="position:absolute;right:18%;top:16%;width:6px;height:6px;
        border-radius:50%;background:#fff;box-shadow:0 0 12px #fff"></div>
    </div>`;
    const st = document.createElement('style');
    st.textContent = `.dof{will-change:filter,transform}
      .far{filter:blur(6px);animation:dofFar 8s ease-in-out infinite}
      .mid{filter:blur(1.4px);animation:dofMid 6s ease-in-out infinite}
      .near{filter:blur(0)}
      @keyframes dofFar{0%,100%{transform:scale(1.04) translateX(0)}50%{transform:scale(1.1) translateX(-10px)}}
      @keyframes dofMid{0%,100%{transform:translateX(0)}50%{transform:translateX(14px)}}`;
    el.appendChild(st);
    return () => st.remove();
  }
};
