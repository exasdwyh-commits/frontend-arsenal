export default {
  id: 'fluted-glass', group: 'particle', name: '条纹玻璃',
  lib: '纯 CSS',
  desc: '竖条纹玻璃把背后的彩色揉成一条条光带，指针扫过条纹还会错位。移植自 Cult UI 的 Fluted Glass，是当下最像"实体材质"的一层毛玻璃。',
  deps: '无（backdrop-filter）',
  note: 'backdrop-filter 只能滤它背后真实绘制的内容。父链上一旦出现 filter、opacity < 1 或 will-change: transform，浏览器会把它切成独立层，玻璃直接变透明。条纹宽度低于 3px 在 1x 屏会摩尔纹，取 6–8px，高分屏再半。面板必须 isolation: isolate，否则 mix-blend-mode 会漏到整页。',
  scenes: { places: ['背景', '卡片', '首屏'], goals: ['营造氛围'], triggers: ['悬停', '持续播放'], projects: ['品牌官网', '作品集', 'AI 产品'] },
  code: `/* 背后必须有真实内容，玻璃才有东西可滤 */
.glass{
  position:absolute;inset:14px;border-radius:10px;overflow:hidden;isolation:isolate;
  backdrop-filter:blur(9px) saturate(1.5);
  background:rgba(255,255,255,.05);
  box-shadow:inset 0 0 0 1px rgba(255,255,255,.16);
}
.flutes{
  position:absolute;inset:-4px;mix-blend-mode:overlay;
  background:repeating-linear-gradient(90deg,
    rgba(255,255,255,.26) 0 1px,
    rgba(255,255,255,.02) 1px 4px,
    rgba(0,0,0,.22) 4px 5px,
    rgba(255,255,255,.10) 5px 7px);
  background-size:8px 100%;
  transition:transform .7s cubic-bezier(.2,.9,.2,1);
}
.glass:hover .flutes{transform:translateX(4px)}   /* 条纹错位 = 折射 */`,
  init(el) {
    const STYLE = `<style data-fx="fluted-glass">
      .fg-wrap{display:flex;flex-direction:column;align-items:center;gap:10px}
      .fg{position:relative;width:198px;height:108px;border-radius:14px;overflow:hidden;
        isolation:isolate;border:1px solid rgba(255,255,255,.08);cursor:pointer}
      .fg-bg{position:absolute;inset:-25%;
        background:
          radial-gradient(circle at 22% 30%, #6a3bff 0 34%, transparent 60%),
          radial-gradient(circle at 76% 26%, #1fb6ff 0 28%, transparent 58%),
          radial-gradient(circle at 60% 82%, #ff5d3b 0 30%, transparent 60%),
          radial-gradient(circle at 12% 88%, #00d68f 0 24%, transparent 58%);
        filter:blur(7px);animation:fg-drift 9s ease-in-out infinite alternate}
      @keyframes fg-drift{from{transform:translate3d(-4px,3px,0) scale(1.05)}
        to{transform:translate3d(6px,-4px,0) scale(1.12)}}
      .fg-glass{position:absolute;inset:13px;border-radius:10px;overflow:hidden;isolation:isolate;
        backdrop-filter:blur(6px) saturate(1.75) brightness(1.06);
        -webkit-backdrop-filter:blur(6px) saturate(1.75) brightness(1.06);
        background:rgba(255,255,255,.03);
        box-shadow:inset 0 0 0 1px rgba(255,255,255,.18),inset 0 12px 22px rgba(255,255,255,.06),
                   0 12px 26px rgba(0,0,0,.38);
        transition:transform .5s cubic-bezier(.2,.9,.2,1)}
      .fg-flutes{position:absolute;inset:-6px;mix-blend-mode:overlay;opacity:.9;
        background:repeating-linear-gradient(90deg,
          rgba(255,255,255,.28) 0 1px, rgba(255,255,255,.02) 1px 4px,
          rgba(0,0,0,.24) 4px 5px, rgba(255,255,255,.10) 5px 7px);
        background-size:8px 100%;
        transition:transform .7s cubic-bezier(.2,.9,.2,1)}
      .fg-flutes.b{mix-blend-mode:screen;opacity:.45;
        background:repeating-linear-gradient(90deg,
          rgba(255,255,255,.22) 0 1px, transparent 1px 14px);
        background-size:15px 100%;transition-delay:.05s}
      .fg:hover .fg-flutes{transform:translateX(4px)}
      .fg:hover .fg-flutes.b{transform:translateX(-3px)}
      .fg:hover .fg-glass{transform:translateY(-1px)}
      .fg-label{position:absolute;left:14px;bottom:12px;font-size:9px;letter-spacing:.18em;
        color:rgba(255,255,255,.82);text-transform:uppercase;text-shadow:0 1px 6px rgba(0,0,0,.5)}
      .fg-hint{font-size:9.5px;color:#4a5368;letter-spacing:.08em;text-transform:uppercase}
    </style>`;

    el.insertAdjacentHTML('beforeend', STYLE + `
      <div class="fg-wrap">
        <div class="fg">
          <div class="fg-bg"></div>
          <div class="fg-glass">
            <div class="fg-flutes"></div>
            <div class="fg-flutes b"></div>
            <span class="fg-label">Fluted glass</span>
          </div>
        </div>
        <div class="fg-hint">悬停看条纹错位</div>
      </div>`);

    return () => { el.innerHTML = ''; };
  }
};
