export default {
  id: 'bg-animate-btn', group: 'feedback', name: '整面渐变按钮',
  lib: '纯 CSS',
  desc: '按钮的"颜色"本身就是一张旋转的 conic 渐变，上面只盖一层透明的塑料高光。移植自 Cult UI 的 BG Animate Button。跟宇宙环按钮同族但逻辑相反：这个整面都是渐变，那个只有描边是渐变。',
  deps: '无',
  note: '渐变层要 inset:-1000%（21 倍尺寸）且用 margin:auto 居中，圆心才锁在按钮中心；尺寸不够大时旋转会整块摆色。最反直觉的一点：表层那个"按钮面"必须是透明背景、只写 inset 高光和外投影——它一旦有 background，渐变就被完全盖住，看起来就是个普通按钮。渐变本身要首尾同色（#85d797 → #1a806b → #85d797），否则旋转时接缝处会闪一下。',
  scenes: { places: ['按钮'], goals: ['交互反馈', '营造氛围'], triggers: ['持续播放', '悬停'], projects: ['品牌官网', 'AI 产品', '作品集'] },
  code: `/* 渐变层 21 倍大 + margin auto 居中；表层透明只盖高光 */
.btn-anim{position:relative;display:inline-block;overflow:hidden;border-radius:14px;cursor:pointer}

.btn-anim .spin{position:absolute;inset:-1000%;margin:auto;display:block;   /* 21 倍尺寸 */
  background:conic-gradient(from 90deg at 50% 50%,#85d797 0%,#1a806b 50%,#85d797 100%);
  animation:btn-rot 4s linear infinite}

.btn-anim .face{position:relative;padding:10px 24px;border-radius:14px;font-weight:700;color:#06110b;
  box-shadow:0 3px 5px rgba(0,0,0,.2),inset 0 .5px 1px rgba(255,255,255,.1),
             inset 0 -2px 3px rgba(0,0,0,.4)}   /* 没有 background：塑料感全靠阴影 */

@keyframes btn-rot{to{transform:rotate(1turn)}}`,
  init(el) {
    const PALETTES = [
      { key: 'forest', g: '#85d797 0%,#1a806b 50%,#85d797 100%', ink: '#06110b', label: '部署' },
      { key: 'sunset', g: '#fe5d75 0%,#f5af19 50%,#fe5d75 100%', ink: '#2b0d05', label: '发布' },
      { key: 'nebula', g: '#A77BFE 0%,#8860D0 50%,#A77BFE 100%', ink: '#ffffff', label: '升级' },
    ];

    const STYLE = `<style data-fx="bg-animate-btn">
      .bga-wrap{display:flex;flex-direction:column;align-items:center;gap:12px}
      .bga-row{display:flex;gap:10px}
      .bga{position:relative;display:inline-block;overflow:hidden;border:0;padding:0;border-radius:14px;
        cursor:pointer;background:none;flex:none}
      .bga.spin-f .spin{animation-duration:2s}
      .bga.spin-s .spin{animation-duration:8s}
      .bga .spin{position:absolute;inset:-1000%;margin:auto;display:block;
        animation:bga-rot 4s linear infinite;will-change:transform}
      .bga .face{position:relative;display:block;padding:9px 16px;border-radius:14px;white-space:nowrap;
        font-size:11.5px;font-weight:700;letter-spacing:.02em;
        box-shadow:0 3px 5px rgba(0,0,0,.25),inset 0 .5px 1px rgba(255,255,255,.12),
                   inset 0 -2px 3px rgba(0,0,0,.45);
        transition:transform .12s ease,box-shadow .2s ease}
      .bga:hover .face{box-shadow:0 5px 9px rgba(0,0,0,.32),inset 0 1px 2px rgba(255,255,255,.2),
        inset 0 -2px 4px rgba(0,0,0,.5)}
      .bga:active .face{transform:translateY(1px) scale(.985)}
      @keyframes bga-rot{to{transform:rotate(1turn)}}
      .bga-hint{font-size:9.5px;color:#4a5368;letter-spacing:.08em;text-transform:uppercase}
    </style>`;

    el.insertAdjacentHTML('beforeend', STYLE + `
      <div class="bga-wrap">
        <div class="bga-row">
          ${PALETTES.map(p => `<button class="bga" type="button">
            <span class="spin" style="background:conic-gradient(from 90deg at 50% 50%,${p.g})"></span>
            <span class="face" style="color:${p.ink}">${p.label}</span>
          </button>`).join('')}
          <button class="bga spin-s" type="button">
            <span class="spin" style="background:conic-gradient(from 90deg at 50% 50%,#a1c4fd 0%,#c2e9fb 50%,#a1c4fd 100%)"></span>
            <span class="face" style="color:#0a1a2b">预览</span>
          </button>
        </div>
        <div class="bga-hint">面层透明 · 转速 2s / 4s / 8s</div>
      </div>`);

    return () => { el.innerHTML = ''; };
  }
};
