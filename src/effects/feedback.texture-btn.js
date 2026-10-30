export default {
  id: 'texture-btn', group: 'feedback', name: '双层纹理按钮',
  lib: '纯 CSS',
  desc: '外层一圈渐变描边包住内层面，1px 的彩色边靠 padding 造出来，不是 border。移植自 Cult UI 的 Texture Button，是它全站按钮的默认形态。',
  deps: '无',
  note: '那圈彩边不是 border 而是外层元素的 padding:1px + 渐变背景，被内层盖住只留 1px。写成 border 会在 hover 改色时出现 2px 的跳动。外层还要一层 border:1px solid rgba(0,0,0,.4) 打底，否则渐变边缘和背景糊在一起。三态（默认/hover/active）都改内层渐变，别改外层，外层一动彩边厚度就变了。',
  scenes: { places: ['按钮'], goals: ['交互反馈'], triggers: ['悬停', '点击'], projects: ['品牌官网', '管理后台', 'AI 产品'] },
  code: `/* 外层负责彩边，内层负责面色，三态只改内层 */
.outer{
  padding:1px;                                /* 这就是 1px 彩边的来源 */
  border:1px solid rgba(0,0,0,.4);
  border-radius:12px;
  background:linear-gradient(180deg,rgba(255,255,255,.45),rgba(255,255,255,.1));
}
.inner{
  border-radius:10px;padding:8px 16px;color:#fff;
  background:linear-gradient(180deg,#2a3040,#12151d);
  transition:background .3s ease,transform .12s ease;
}
.outer:hover .inner{background:linear-gradient(180deg,#333a4d,#1a1f2b)}
.outer:active .inner{transform:translateY(1px);background:#0d1016}`,
  init(el) {
    const STYLE = `<style data-fx="texture-btn">
      .tx-wrap{display:flex;flex-direction:column;gap:10px;align-items:center}
      .tx-outer{padding:1px;border:1px solid rgba(0,0,0,.45);border-radius:12px;cursor:pointer;
        background:linear-gradient(180deg,rgba(255,255,255,.5),rgba(255,255,255,.12));
        box-shadow:0 1px 1px rgba(0,0,0,.35);transition:background .3s ease}
      .tx-outer.accent{background:linear-gradient(180deg,#8fa6ff,#5f3bff)}
      .tx-outer:hover{background:linear-gradient(180deg,rgba(255,255,255,.72),rgba(255,255,255,.2))}
      .tx-outer.accent:hover{background:linear-gradient(180deg,#a8baff,#7455ff)}
      .tx-inner{border-radius:10px;padding:8px 22px;font-size:12px;letter-spacing:.02em;
        display:flex;align-items:center;gap:8px;
        background:linear-gradient(180deg,#232a39,#0f131b);color:rgba(255,255,255,.9);
        box-shadow:inset 0 1px 0 rgba(255,255,255,.06),inset 0 -2px 3px rgba(0,0,0,.35);
        transition:background .3s ease,transform .1s ease,box-shadow .3s ease}
      .tx-outer:hover .tx-inner{background:linear-gradient(180deg,#2d3546,#171c27)}
      .tx-outer.accent .tx-inner{background:linear-gradient(180deg,#6a4dff,#4a2ee0);color:#fff}
      .tx-outer:active .tx-inner{transform:translateY(1px);box-shadow:inset 0 2px 4px rgba(0,0,0,.5)}
      .tx-hint{font-size:9.5px;color:#4a5368;letter-spacing:.08em;text-transform:uppercase}
    </style>`;

    el.insertAdjacentHTML('beforeend', STYLE + `
      <div class="tx-wrap">
        <div class="tx-outer"><div class="tx-inner">开始构建</div></div>
        <div class="tx-outer accent"><div class="tx-inner">升级方案 <span style="opacity:.7">→</span></div></div>
        <div class="tx-hint">三层：外渐变 / 内面色 / active 下压</div>
      </div>`);

    return () => { el.innerHTML = ''; };
  }
};
