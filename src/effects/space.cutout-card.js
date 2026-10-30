export default {
  id: 'cutout-card', group: 'space', name: '缺角卡',
  lib: '原生 JS + SVG mask',
  desc: '卡片右上角被一条曲线"啃"掉一块，缺角里浮着徽标，hover 时正文带模糊错峰浮现。移植自 Cult UI 的 Cutout Card，用一条 SVG path 就把普通矩形卡做出品牌感。',
  deps: '无',
  note: 'path 的走向决定留哪块：cult 原路径 M0 200 C…200 0 V200 H0Z 框住的是曲线到右下角的那条"角料"，直接拿来当整卡的 mask 会把卡片吃到只剩一角。要留整卡就得自己写"整矩形减去一个凹角"：M0 0 H145 C160 35 165 45 200 62 V118 H0Z，两个控制点必须往卡片中心偏才是凹坑，往角上偏就成了圆角。mask 会连 box-shadow 一起裁掉，所以投影要挪到外层用 filter: drop-shadow（它跟随 mask 后的形状）。徽标要放在 mask 元素外面当兄弟节点，才能浮在缺角里不被裁。',
  scenes: { places: ['卡片', '首屏'], goals: ['内容呈现', '营造氛围'], triggers: ['悬停'], projects: ['品牌官网', '作品集', 'AI 产品'] },
  code: `/* 一条 path 定缺角形状，mask-size 拉伸适配任意尺寸 */
.card{
  position:relative;width:200px;height:120px;border-radius:16px;background:#12151d;
  -webkit-mask-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Cpath d='M0 200C155.996 199.961 200.029 156.308 200 0V200H0Z' fill='%23000'/%3E%3C/svg%3E");
  mask-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Cpath d='M0 200C155.996 199.961 200.029 156.308 200 0V200H0Z' fill='%23000'/%3E%3C/svg%3E");
  -webkit-mask-size:100% 100%;mask-size:100% 100%;
  -webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;
}

/* hover 正文浮现：三件套一起过渡 */
.card .body{opacity:0;transform:translateY(10px);filter:blur(4px);
  transition:opacity .3s ease,transform .35s cubic-bezier(.2,1,.3,1),filter .3s ease}
.card:hover .body{opacity:1;transform:none;filter:none}`,
  init(el) {
    const MASK = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 118'%3E%3Cpath d='M0 0H145C160 35 165 45 200 62V118H0Z' fill='%23000'/%3E%3C/svg%3E";

    const STYLE = `<style data-fx="cutout-card">
      .cc-wrap{display:flex;flex-direction:column;align-items:center;gap:11px}
      .cc{position:relative;width:200px;height:118px;border-radius:16px;cursor:pointer;
        background:linear-gradient(165deg,#1a2130,#10141c);
        -webkit-mask-image:url("${MASK}");mask-image:url("${MASK}");
        -webkit-mask-size:100% 100%;mask-size:100% 100%;
        -webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;
        transition:transform .25s ease}
      .cc:hover{transform:translateY(-2px)}
      /* mask 会把 box-shadow 一起裁掉，投影改由外层 drop-shadow 跟随 mask 形状 */
      .cc-shell{position:relative;width:200px;height:118px;
        filter:drop-shadow(0 8px 18px rgba(0,0,0,.5));
        transition:filter .25s ease}
      .cc-shell:hover{filter:drop-shadow(0 12px 26px rgba(0,0,0,.6))}
      .cc-head{display:flex;align-items:flex-start;padding:12px 14px 0}
      .cc-tag{font-size:9px;letter-spacing:.14em;text-transform:uppercase;color:#8b6cff}
      .cc-badge{position:absolute;top:11px;right:13px;width:26px;height:26px;border-radius:99px;
        background:linear-gradient(160deg,#8b6cff,#5f3bff);pointer-events:none;
        box-shadow:0 3px 8px rgba(95,59,255,.45);
        display:flex;align-items:center;justify-content:center;font-size:10px;color:#fff;
        z-index:3;transition:transform .3s cubic-bezier(.2,1,.3,1)}
      .cc-shell:hover .cc-badge{transform:scale(1.1)}
      .cc-title{margin:8px 14px 0;font-size:13px;font-weight:600;color:#eef1f7;letter-spacing:.01em}
      .cc-body{position:absolute;left:14px;right:14px;bottom:12px}
      .cc-body p{margin:0 0 8px;font-size:10px;line-height:1.6;color:#7c869c;
        opacity:0;transform:translateY(10px);filter:blur(4px);
        transition:opacity .3s ease,transform .38s cubic-bezier(.2,1,.3,1),filter .3s ease}
      .cc:hover .cc-body p{opacity:1;transform:none;filter:none}
      .cc-btns{display:flex;gap:6px;opacity:0;transform:translateY(10px);filter:blur(4px);
        transition:opacity .3s ease .07s,transform .38s cubic-bezier(.2,1,.3,1) .07s,filter .3s ease .07s}
      .cc:hover .cc-btns{opacity:1;transform:none;filter:none}
      .cc-btns span{font-size:9.5px;padding:5px 11px;border-radius:7px;letter-spacing:.04em}
      .cc-btns .g{background:#8b6cff;color:#fff}
      .cc-btns .o{border:1px solid #2a3245;color:#98a2b8}
      .cc-hint{font-size:9.5px;color:#4a5368;letter-spacing:.08em;text-transform:uppercase}
    </style>`;

    el.insertAdjacentHTML('beforeend', STYLE + `
      <div class="cc-wrap">
        <div class="cc-shell" id="ccCard">
          <div class="cc">
            <div class="cc-head"><span class="cc-tag">Release</span></div>
            <h3 class="cc-title">v2.4 已发布</h3>
            <div class="cc-body">
              <p>新增 14 个组件，缺角卡是其中之一。</p>
              <div class="cc-btns"><span class="g">查看变更</span><span class="o">稍后</span></div>
            </div>
          </div>
          <div class="cc-badge">✦</div>
        </div>
        <div class="cc-hint">悬停：正文带模糊浮现</div>
      </div>`);

    return () => { el.innerHTML = ''; };
  }
};
