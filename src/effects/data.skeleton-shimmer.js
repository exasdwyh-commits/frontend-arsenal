export default {
  id: 'skeleton-shimmer', group: 'data', name: '骨架屏扫光', lib: '纯 CSS',
  desc: '加载占位块上有一道高光扫过，告诉用户"正在等工作"而不是"坏了"。',
  deps: '无',
  note: '扫光用 transform:translateX 而不是 background-position——前者走合成层，后者每帧重绘。伪元素必须 overflow:hidden 的父级裁剪，否则光带会跑到卡片外面。',
  code: `.skel{ position:relative; overflow:hidden; background:#1a1f2c; border-radius:6px; }
.skel::after{
  content:''; position:absolute; inset:0;
  transform: translateX(-100%);
  background: linear-gradient(90deg,
    transparent, rgba(255,255,255,.08) 45%,
    rgba(255,255,255,.14) 50%, transparent);
  animation: shimmer 1.6s infinite;
}
@keyframes shimmer{ to{ transform: translateX(100%); } }`,
  init(el) {
    el.innerHTML = `<div style="width:190px;display:flex;flex-direction:column;gap:8px">
      <div style="display:flex;gap:8px;align-items:center">
        <div class="sk" style="width:30px;height:30px;border-radius:50%"></div>
        <div style="flex:1;display:flex;flex-direction:column;gap:5px">
          <div class="sk" style="height:9px;width:60%"></div>
          <div class="sk" style="height:9px;width:40%"></div>
        </div>
      </div>
      <div class="sk" style="height:9px;width:100%"></div>
      <div class="sk" style="height:9px;width:88%"></div>
      <div class="sk" style="height:9px;width:72%"></div>
      <div class="sk" style="height:44px;width:100%;border-radius:8px"></div>
    </div>`;
    const st = document.createElement('style');
    st.textContent = `.sk{position:relative;overflow:hidden;background:#1a1f2c;border-radius:6px}
      .sk::after{content:'';position:absolute;inset:0;transform:translateX(-100%);
        background:linear-gradient(90deg,transparent,rgba(255,255,255,.07) 45%,
        rgba(255,255,255,.13) 50%,transparent);animation:skShimmer 1.6s infinite}
      @keyframes skShimmer{to{transform:translateX(100%)}}`;
    el.appendChild(st);
    return () => st.remove();
  }
};
