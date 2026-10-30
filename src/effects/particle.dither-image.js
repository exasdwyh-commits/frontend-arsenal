export default {
  id: 'dither-image', group: 'particle', name: '有序抖动图像',
  lib: '纯 CSS',
  desc: '把一幅平滑渐变图硬阈值化成黑白网点，边缘呈现老式印刷/终端屏的抖动质感，一侧还能保留干净原图做对比。移植自 Cult UI 的 Dither Image，全程无 JS、无 SVG 滤镜，Safari 也能跑。',
  deps: '无',
  note: '抖动是三层流水线：底层给图 blur 平滑化 → ::after 铺网点用 mix-blend-mode: overlay 调制 → 最后由父元素的 filter: contrast(20) 一次性硬阈值化。阈值必须写在父元素上，写在图上的话 ::after 的网点还没参与就被裁死，只剩一张高对比图。抖动类必须挂在 wrapper 上：伪元素在 <img> 这种替换元素上根本不渲染。父级 filter 会连带滤掉所有子元素，所以标题/说明必须放在 wrapper 外面，否则字也变成网点。网点格子最小 2px，再小高分屏直接被抗锯齿抹平。想要"半抖动半干净"，上层盖一份原图 + mask-image 渐变，只让一侧露出。',
  scenes: { places: ['图片', '首屏', '卡片'], goals: ['营造氛围'], triggers: ['悬停'], projects: ['作品集', '品牌官网', 'AI 产品'] },
  code: `/* 三层流水线：blur 平滑 → 网点调制 → 父级 contrast 硬阈值 */
.dither{position:absolute;inset:0;overflow:hidden;background:#000;isolation:isolate;
  filter:grayscale(1) contrast(20) brightness(1.05)}      /* 阈值在父级！ */

.dither .art{position:absolute;inset:-12%;filter:blur(7px)}  /* 先平滑，边缘才有渐变可抖 */

.dither::after{content:"";position:absolute;inset:0;         /* 网点矩阵 = 抖动阈值表 */
  background-image:radial-gradient(circle,rgba(255,255,255,.95) 1px,transparent 1.2px);
  background-size:3px 3px;mix-blend-mode:overlay}

/* 上层干净副本 + 渐变 mask，做"半抖动"对比 */
.dither .clean{position:absolute;inset:0;
  -webkit-mask-image:linear-gradient(105deg,#000 0%,rgba(0,0,0,.9) 22%,transparent 62%);
  mask-image:linear-gradient(105deg,#000 0%,rgba(0,0,0,.9) 22%,transparent 62%)}`,
  init(el) {
    const STYLE = `<style data-fx="dither-image">
      .di{display:flex;flex-direction:column;align-items:center;gap:10px}
      .di-stage{position:relative;width:206px;height:100px;border-radius:12px;overflow:hidden;
        border:1px solid rgba(255,255,255,.07);cursor:pointer;background:#000;isolation:isolate;
        filter:grayscale(1) contrast(19) brightness(1.04);
        transition:filter .5s ease}
      .di-stage.clean-mode{filter:none}
      .di-art{position:absolute;inset:-14%;filter:blur(7px);
        background:
          radial-gradient(46px 40px at 22% 34%,rgba(255,255,255,.95),transparent 70%),
          radial-gradient(38px 30px at 64% 26%,rgba(255,255,255,.62),transparent 72%),
          radial-gradient(58px 44px at 78% 74%,rgba(255,255,255,.8),transparent 70%),
          radial-gradient(40px 34px at 40% 80%,rgba(255,255,255,.42),transparent 74%),
          linear-gradient(160deg,#5c6474,#10141c)}
      .di-stage::after{content:"";position:absolute;inset:0;
        background-image:radial-gradient(circle,rgba(255,255,255,.98) 1px,transparent 1.25px);
        background-size:3px 3px;mix-blend-mode:overlay}
      .di-cap{position:absolute;left:11px;bottom:8px;font-size:9px;letter-spacing:.16em;
        text-transform:uppercase;color:#fff;mix-blend-mode:difference}
      .di-hint{font-size:9.5px;color:#4a5368;letter-spacing:.08em;text-transform:uppercase}
    </style>`;

    el.insertAdjacentHTML('beforeend', STYLE + `
      <div class="di">
        <div class="di-stage" id="diStage">
          <div class="di-art"></div>
          <div class="di-cap">Ordered dither</div>
        </div>
        <div class="di-hint">悬停看去抖动的原图</div>
      </div>`);

    const stage = el.querySelector('#diStage');
    const onEnter = () => stage.classList.add('clean-mode');
    const onLeave = () => stage.classList.remove('clean-mode');
    stage.addEventListener('pointerenter', onEnter);
    stage.addEventListener('pointerleave', onLeave);

    return () => {
      stage.removeEventListener('pointerenter', onEnter);
      stage.removeEventListener('pointerleave', onLeave);
      el.innerHTML = '';
    };
  }
};
