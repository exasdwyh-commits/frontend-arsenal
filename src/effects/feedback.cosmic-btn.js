export default {
  id: 'cosmic-btn', group: 'feedback', name: '宇宙环按钮',
  lib: '纯 CSS',
  desc: '一圈 conic 渐变沿按钮描边匀速转，hover 时窗口向外撑开、环从 3px 变 6px。移植自 Cult UI 的 Cosmic Button，它官网主 CTA 就是这个。跟边框光束的区别：这个是"整环等亮度旋转"，不是一段追光。',
  deps: '无',
  note: '旋转的渐变层必须 inset:-200%（5 倍于按钮），conic 的圆心才会一直钉在按钮中心；只放大一点点，旋转时颜色会整块摆动。环宽是外层的 padding(3px)，hover 改的是窗口的 inset 0 → -3px，别去改 width/height，否则按钮本体会跟着变大。两层必须反向且不等速（3s 正转 / 5s 反转），同速同向会看起来完全静止。inset 过渡要写成 top/right/bottom/left 四个属性， shorthand 在部分浏览器上不参与过渡，角上会跳。',
  scenes: { places: ['按钮', '首屏'], goals: ['交互反馈', '营造氛围'], triggers: ['悬停'], projects: ['品牌官网', 'AI 产品'] },
  code: `/* 外层 padding:3px 定环宽，窗口 inset 负值把环撑宽，渐变层 5 倍大钉住圆心 */
.cosmic{position:relative;padding:3px;border:0;border-radius:15px;background:none;cursor:pointer;
  display:inline-flex;align-items:center;justify-content:center}

.cosmic-win{position:absolute;top:0;right:0;bottom:0;left:0;border-radius:15px;overflow:hidden;
  transition:top .3s ease-out,right .3s ease-out,bottom .3s ease-out,left .3s ease-out}
.cosmic:hover .cosmic-win{top:-3px;right:-3px;bottom:-3px;left:-3px}   /* 环 3px → 6px */

.cosmic-grad{position:absolute;inset:-200%;                        /* 5 倍尺寸，圆心不动 */
  background:conic-gradient(from 0deg,#adfa1b,#c9ff63,#efffb7,#8cd413,#6f9f19,#92d61b,#adfa1b);
  animation:cosmic-spin 3s linear infinite}

/* 第二层反向慢转 + soft-light，打散色带 */
.cosmic-grad.b{background:conic-gradient(from 180deg,#efffb7 0%,transparent 30%,#adfa1b 50%,
  transparent 70%,#7fbf17 100%);animation:cosmic-spin-slow 5s linear infinite reverse;
  mix-blend-mode:overlay;opacity:.55}

.cosmic-face{position:relative;z-index:10;padding:10px 20px;border-radius:12px;background:#12151d;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.12),inset 0 -1px 0 rgba(0,0,0,.5),
             0 8px 24px rgba(0,0,0,.35)}

@keyframes cosmic-spin{to{transform:rotate(1turn)}}
@keyframes cosmic-spin-slow{to{transform:rotate(-1turn)}}`,
  init(el) {
    const STYLE = `<style data-fx="cosmic-btn">
      .cs-wrap{display:flex;flex-direction:column;align-items:center;gap:12px}
      .cs{position:relative;padding:3px;border:0;border-radius:15px;background:none;cursor:pointer;
        display:inline-flex;align-items:center;justify-content:center}
      .cs-win{position:absolute;top:0;right:0;bottom:0;left:0;border-radius:15px;overflow:hidden;
        transition:top .3s ease-out,right .3s ease-out,bottom .3s ease-out,left .3s ease-out}
      .cs:hover .cs-win{top:-3px;right:-3px;bottom:-3px;left:-3px}
      .cs-grad{position:absolute;inset:-200%;
        background:conic-gradient(from 0deg,#adfa1b,#c9ff63,#efffb7,#8cd413,#6f9f19,#92d61b,#adfa1b);
        animation:cs-spin 3s linear infinite;will-change:transform}
      .cs-grad.b{background:conic-gradient(from 180deg,#efffb7 0%,transparent 30%,#adfa1b 50%,
        transparent 70%,#7fbf17 100%);animation:cs-spin-r 5s linear infinite;
        mix-blend-mode:overlay;opacity:.55}
      @keyframes cs-spin{to{transform:rotate(1turn)}}
      @keyframes cs-spin-r{to{transform:rotate(-1turn)}}
      .cs-face{position:relative;z-index:10;padding:9px 22px;border-radius:12px;background:#141824;
        color:#eef1f7;font-size:12px;font-weight:500;letter-spacing:.03em;display:flex;align-items:center;gap:8px;
        box-shadow:inset 0 1px 0 rgba(255,255,255,.13),inset 0 -1px 0 rgba(0,0,0,.55),
                   0 8px 22px rgba(0,0,0,.4);
        transition:transform .12s ease,box-shadow .3s ease}
      .cs:hover .cs-face{box-shadow:inset 0 1px 0 rgba(255,255,255,.18),inset 0 -1px 0 rgba(0,0,0,.6),
        0 12px 32px rgba(0,0,0,.5)}
      .cs:active .cs-face{transform:scale(.98)}
      .cs-face i{color:#adfa1b;font-style:normal}
      .cs-hint{font-size:9.5px;color:#4a5368;letter-spacing:.08em;text-transform:uppercase}
    </style>`;

    el.insertAdjacentHTML('beforeend', STYLE + `
      <div class="cs-wrap">
        <button class="cs" type="button">
          <span class="cs-win"><span class="cs-grad"></span><span class="cs-grad b"></span></span>
          <span class="cs-face">开始构建 <i>→</i></span>
        </button>
        <div class="cs-hint">hover 环变宽 · 两层反向旋转</div>
      </div>`);

    return () => { el.innerHTML = ''; };
  }
};
