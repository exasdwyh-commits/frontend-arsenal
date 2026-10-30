export default {
  id: 'edge-blur', group: 'particle', name: '边缘渐进模糊',
  lib: '纯 CSS',
  desc: '页面底部/顶部一条"越靠边越糊"的霜化带，滚动内容滑进去就化掉。移植自 Cult UI 的 Edge Blur，用 5 层 backdrop-filter 叠出来，比单层 12px 模糊顺得多。',
  deps: '无（backdrop-filter）',
  note: '5 层 blur(1/2/3/6/12) 叠在一起会叠加（每层的 backdrop 是前几层的合成结果），所以靠近边缘那端实际模糊度远超 12px——这正是渐进感的来源，换成单层只会得到一条糊得均匀的带子。每层都必须自己带 mask-image 渐变，mask 放容器上无效：backdrop-filter 是按元素算的，父级 mask 只裁子元素的绘制结果、不参与它的 backdrop 采样。整条带子必须 pointer-events:none，否则底部按钮全点不到。带子高度要 ≥ blur 半径的 3 倍，12px 模糊配 75px 高才够衰减。',
  scenes: { places: ['背景', '页面'], goals: ['营造氛围'], triggers: ['持续播放'], projects: ['品牌官网', '作品集', 'AI 产品'] },
  code: `/* 5 层叠加，每层自带 mask；blur 叠加 = 越靠边越糊 */
.edge{position:fixed;left:0;right:0;bottom:0;height:75px;pointer-events:none;
  isolation:isolate;z-index:40}
.edge > i{position:absolute;inset:0;display:block;
  -webkit-mask-image:linear-gradient(to top,#000,transparent);
  mask-image:linear-gradient(to top,#000,transparent)}
.edge > i:nth-child(1){backdrop-filter:blur(1px);-webkit-backdrop-filter:blur(1px)}
.edge > i:nth-child(2){backdrop-filter:blur(2px);-webkit-backdrop-filter:blur(2px)}
.edge > i:nth-child(3){backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px)}
.edge > i:nth-child(4){backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)}
.edge > i:nth-child(5){backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px)}`,
  init(el) {
    const LAYERS = [1, 2, 3, 6, 12];

    const STYLE = `<style data-fx="edge-blur">
      .eb{display:flex;flex-direction:column;align-items:center;gap:10px;width:100%}
      .eb-stage{position:relative;width:212px;height:112px;border-radius:12px;overflow:hidden;
        border:1px solid rgba(255,255,255,.07);cursor:pointer}
      .eb-bg{position:absolute;inset:0;
        background:
          radial-gradient(60px 44px at 20% 26%,rgba(139,108,255,.9),transparent 72%),
          radial-gradient(54px 40px at 70% 40%,rgba(31,182,255,.8),transparent 74%),
          radial-gradient(70px 50px at 42% 78%,rgba(255,93,59,.65),transparent 72%),
          linear-gradient(160deg,#1c2231,#0c0f16);
        background-size:220% 220%;animation:eb-drift 9s ease-in-out infinite alternate}
      @keyframes eb-drift{from{background-position:0% 0%}to{background-position:100% 100%}}
      .eb-rows{position:absolute;left:10px;right:10px;top:8px;display:flex;flex-direction:column;gap:5px}
      .eb-rows i{display:block;height:3px;border-radius:2px;background:rgba(255,255,255,.24);font-style:normal}
      .eb-rows i:nth-child(2){width:70%}
      .eb-rows i:nth-child(3){width:45%;background:rgba(139,108,255,.6)}
      .eb-frost{position:absolute;left:0;right:0;bottom:0;height:66px;pointer-events:none;
        isolation:isolate}
      .eb-frost > i{position:absolute;inset:0;display:block;
        -webkit-mask-image:linear-gradient(to top,#000,transparent);
        mask-image:linear-gradient(to top,#000,transparent)}
      .eb-tag{position:absolute;left:11px;bottom:9px;font-size:9px;letter-spacing:.16em;
        text-transform:uppercase;color:rgba(255,255,255,.85);text-shadow:0 1px 6px rgba(0,0,0,.7)}
      .eb-hint{font-size:9.5px;color:#4a5368;letter-spacing:.08em;text-transform:uppercase}
    </style>`;

    el.insertAdjacentHTML('beforeend', STYLE + `
      <div class="eb">
        <div class="eb-stage">
          <div class="eb-bg"></div>
          <div class="eb-rows"><i></i><i></i><i></i></div>
          <div class="eb-frost">
            ${LAYERS.map(b => `<i style="backdrop-filter:blur(${b}px);-webkit-backdrop-filter:blur(${b}px)"></i>`).join('')}
          </div>
          <div class="eb-tag">Scrolls into frost</div>
        </div>
        <div class="eb-hint">5 层 backdrop-filter 叠加</div>
      </div>`);

    return () => { el.innerHTML = ''; };
  }
};
