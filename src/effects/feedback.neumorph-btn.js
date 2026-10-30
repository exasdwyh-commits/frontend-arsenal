export default {
  id: 'neumorph-btn', group: 'feedback', name: '新拟态三态按钮',
  lib: '纯 CSS',
  desc: '靠"内凹底边 + 外投影"一套双色阴影做出凸起实体感，按下时阴影减弱像被按进面板。移植自 Cult UI 的 Neumorph Button。',
  deps: '无',
  note: '深色主题别用白阴影做新拟态，会脏；cult-ui 的深色配方是底边 inset 用更深的同色（#171310），外投影带暖色不透明度（rgba(58,33,8,.58)），两层一个负责"厚度"一个负责"离地"。hover 加深阴影、active 减弱阴影，阴影变化要和 transform 的 scale 同时做，否则看着像单纯放大。active:transition 必须关掉，否则松手阴影会慢慢弹回来，失去"咔哒"感。',
  scenes: { places: ['按钮'], goals: ['交互反馈'], triggers: ['悬停', '点击'], projects: ['管理后台', '品牌官网'] },
  code: `/* 三层：底边 inset（厚度）+ 外投影（离地）+ 背景 */
.btn{
  background:#36322F;color:#fff;border:0;padding:12px 22px;border-radius:9px;
  box-shadow:inset 0 -2.1px 0 #171310, 0 1.2px 6.3px rgba(58,33,8,.58);
  transition:box-shadow .2s ease,transform .2s cubic-bezier(.2,1.3,.4,1);
}
.btn:hover{box-shadow:inset 0 -2.5px 0 #171310, 0 1.4px 7.6px rgba(58,33,8,.64);transform:scale(1.02)}
.btn:active{
  background:#2A2724;transform:scale(.98);transition:none;      /* 关掉过渡才有"咔哒" */
  box-shadow:inset 0 -1.5px 0 #171310, 0 .5px 2px rgba(58,33,8,.7);
}`,
  init(el) {
    const STYLE = `<style data-fx="neumorph-btn">
      .nu-wrap{display:flex;flex-direction:column;gap:7px;align-items:center}
      .nu{border:0;padding:9px 22px;font-size:11.5px;letter-spacing:.12em;text-transform:uppercase;
        font-weight:600;cursor:pointer;border-radius:9px;background:#36322F;color:#fff;
        box-shadow:inset 0 -2.1px 0 #171310,0 1.2px 6.3px rgba(58,33,8,.58);
        transition:box-shadow .18s ease,transform .22s cubic-bezier(.2,1.35,.4,1),background .18s}
      .nu:hover{background:#4a4542;
        box-shadow:inset 0 -2.5px 0 #171310,0 1.4px 7.6px rgba(58,33,8,.66);transform:scale(1.03)}
      .nu:active{background:#2A2724;transform:scale(.975);transition:none;
        box-shadow:inset 0 -1.5px 0 #14100d,0 .5px 2px rgba(58,33,8,.72)}
      .nu.primary{background:#2C7BE5;box-shadow:inset 0 -2.1px 0 #1A68D1,0 1.2px 6.3px rgba(28,100,242,.58)}
      .nu.primary:hover{background:#3D8DF5;box-shadow:inset 0 -2.5px 0 #2C7BE5,0 1.4px 7.6px rgba(28,100,242,.66)}
      .nu.primary:active{background:#1A68D1;box-shadow:inset 0 -1.5px 0 #1554AB,0 .5px 2px rgba(28,100,242,.72)}
      .nu.danger{background:#E6492D;box-shadow:inset 0 -2.1px 0 #D63A1F,0 1.2px 6.3px rgba(214,58,31,.58)}
      .nu.danger:hover{background:#F05B41;box-shadow:inset 0 -2.5px 0 #E6492D,0 1.4px 7.6px rgba(214,58,31,.66)}
      .nu.danger:active{background:#D63A1F;box-shadow:inset 0 -1.5px 0 #B22E17,0 .5px 2px rgba(214,58,31,.72)}
      .nu-hint{font-size:9.5px;color:#4a5368;letter-spacing:.08em;text-transform:uppercase}
    </style>`;

    el.insertAdjacentHTML('beforeend', STYLE + `
      <div class="nu-wrap">
        <button class="nu">保存草稿</button>
        <button class="nu primary">部署生产</button>
        <button class="nu danger">删除项目</button>
        <div class="nu-hint">active 时 transition:none，才有咔哒感</div>
      </div>`);

    return () => { el.innerHTML = ''; };
  }
};
