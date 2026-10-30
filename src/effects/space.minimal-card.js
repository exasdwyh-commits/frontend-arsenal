export default {
  id: 'minimal-card', group: 'space', name: '极简卡片',
  lib: '纯 CSS',
  desc: '一张卡片全靠"多层描边环 + 三段递进投影"做出实体感，没有任何动画也能站得住。移植自 Cult UI 的 Minimal Card，它是该库所有卡片的底座。跟折页展开是一对：一个靠结构，一个靠光影。',
  deps: '无',
  note: '图的三重环是三个 0 模糊的 box-shadow 叠出来的（0 0 0 1px 细线 / 0 0 0 3px 卡面同色 / 0 0 0 4px 外框），不是 border 也不是 outline——好处是不占布局、能带圆角，坏处是父级一旦 overflow:hidden 就整圈被裁掉，卡内层必须留出 4px 以上的 padding。卡面那道 inset 0 0 0 1px rgba(255,255,255,.1) 是暗色主题的"内描边"，亮色主题要换成深色且透明度更低，照抄会在浅底上糊成脏边。三段递进投影（2px/4px/8px 同透明度）不能省成一段大模糊，那会失去层次。',
  scenes: { places: ['卡片', '列表'], goals: ['内容呈现', '营造氛围'], triggers: ['悬停'], projects: ['品牌官网', '作品集', '管理后台'] },
  code: `/* 图的三重环：0 模糊 box-shadow，不占布局、带圆角 */
.mc-media{position:relative;border-radius:16px;height:84px;
  box-shadow:0 0 0 1px rgba(0,0,0,.07),      /* 贴边细线 */
             0 0 0 3px #12151d,              /* 环 = 卡面同色，制造"嵌进去" */
             0 0 0 4px rgba(0,0,0,.08)}      /* 最外一道框 */

/* 卡面：暗色配方 = 1px 内高光 + 1px 内描边 + 三段递进投影 */
.mc{
  border-radius:24px;padding:8px;background:#12151d;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.03),
             inset 0 0 0 1px rgba(255,255,255,.03),
             0 0 0 1px rgba(0,0,0,.1),
             0 2px 2px rgba(0,0,0,.1),
             0 4px 4px rgba(0,0,0,.1),
             0 8px 8px rgba(0,0,0,.1);
  transition:background .25s ease,box-shadow .25s ease;
}
.mc:hover{background:#161b26;box-shadow:inset 0 1px 0 rgba(255,255,255,.05),
  inset 0 0 0 1px rgba(255,255,255,.05),
  0 0 0 1px rgba(0,0,0,.12),0 3px 3px rgba(0,0,0,.12),
  0 6px 6px rgba(0,0,0,.12),0 12px 12px rgba(0,0,0,.12)}`,
  init(el) {
    const STYLE = `<style data-fx="minimal-card">
      .mc-wrap{display:flex;flex-direction:column;align-items:center;gap:6px}
      .mc{width:178px;border-radius:20px;padding:6px;background:#12151d;cursor:pointer;
        box-shadow:inset 0 1px 0 rgba(255,255,255,.035),inset 0 0 0 1px rgba(255,255,255,.035),
                   0 0 0 1px rgba(0,0,0,.1),0 2px 2px rgba(0,0,0,.1),
                   0 4px 4px rgba(0,0,0,.1),0 8px 8px rgba(0,0,0,.1);
        transition:background .25s ease,box-shadow .25s ease,transform .25s ease}
      .mc:hover{background:#171d29;transform:translateY(-1px);
        box-shadow:inset 0 1px 0 rgba(255,255,255,.06),inset 0 0 0 1px rgba(255,255,255,.055),
                   0 0 0 1px rgba(0,0,0,.12),0 3px 3px rgba(0,0,0,.12),
                   0 6px 6px rgba(0,0,0,.12),0 12px 12px rgba(0,0,0,.14)}
      .mc-media{position:relative;border-radius:14px;height:44px;margin-bottom:6px;overflow:hidden;
        box-shadow:0 0 0 1px rgba(0,0,0,.07),0 0 0 3px #12151d,0 0 0 4px rgba(0,0,0,.08);
        transition:box-shadow .25s ease}
      .mc:hover .mc-media{box-shadow:0 0 0 1px rgba(0,0,0,.09),0 0 0 3px #171d29,0 0 0 4px rgba(0,0,0,.1)}
      .mc-art{position:absolute;inset:0;
        background:
          radial-gradient(56px 40px at 26% 32%,rgba(139,108,255,.95),transparent 70%),
          radial-gradient(48px 34px at 74% 66%,rgba(31,182,255,.85),transparent 72%),
          radial-gradient(70px 44px at 55% 96%,rgba(255,93,59,.6),transparent 70%),
          linear-gradient(160deg,#20283a,#0f131b);
        transition:transform .5s cubic-bezier(.2,.9,.2,1)}
      .mc:hover .mc-art{transform:scale(1.05)}
      .mc-t{margin:0 4px 1px;font-size:10.5px;font-weight:600;color:#e8ecf4;letter-spacing:.01em}
      .mc-d{margin:0 4px 4px;font-size:9px;color:#7c869c;line-height:1.45}
      .mc-foot{display:flex;align-items:center;gap:6px;margin:0 4px 1px;font-size:8.5px;
        letter-spacing:.1em;text-transform:uppercase;color:#5f6b85}
      .mc-foot i{width:4px;height:4px;border-radius:99px;background:#3ddc97;
        box-shadow:0 0 5px #3ddc97;font-style:normal}
      .mc-hint{font-size:9px;color:#4a5368;letter-spacing:.08em;text-transform:uppercase}
    </style>`;

    el.insertAdjacentHTML('beforeend', STYLE + `
      <div class="mc-wrap">
        <div class="mc">
          <div class="mc-media"><div class="mc-art"></div></div>
          <h3 class="mc-t">Atlas 头像组</h3>
          <p class="mc-d">三重描边环 + 三段递进投影，纯静态也有体积。</p>
          <div class="mc-foot"><i></i>Shipped</div>
        </div>
        <div class="mc-hint">悬停：环随卡面一起换色</div>
      </div>`);

    return () => { el.innerHTML = ''; };
  }
};
