export default {
  id: 'fold-card', group: 'space', name: '折页展开',
  lib: '纯 CSS 3D',
  desc: '一张纸从对折状态一层层摊平，折面自带明暗变化。移植自 Cult UI 的 Folded Card，比 height 过渡更有"物理感"，适合展开详情、收据、票券。',
  deps: '无',
  note: '折到背面的那一面默认会消失，必须 backface-visibility: visible，否则像被撕掉；但背面是镜像的，折叠层里不能放文字，内容要等展开后再淡入（本效果用 opacity 藏）。transform-style: preserve-3d 只对子级生效，加在折面自己身上没用。折痕缝隙靠相邻面各压 1px 内阴影遮住，别用 border，会叠成双线。',
  scenes: { places: ['卡片', '弹窗'], goals: ['内容呈现', '交互反馈'], triggers: ['悬停', '点击'], projects: ['品牌官网', '作品集', '管理后台'] },
  code: `/* 三块等高的面，各自从自己的上边缘翻折 */
.fold-wrap{position:relative;width:180px;height:108px;
  perspective:700px;transform-style:preserve-3d}

.fold{position:absolute;left:0;width:100%;height:36px;
  transform-origin:top center;backface-visibility:visible;
  transform:rotateX(-180deg);                 /* 对折到上一块背面 */
  transition:transform .55s cubic-bezier(.3,1.08,.4,1);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.07),
             inset 0 -1px 0 rgba(0,0,0,.55);  /* 遮折痕缝 */
}

.fold:nth-child(1){transform:rotateX(0)}      /* 第一块不动 */
.fold:nth-child(2){top:36px}
.fold:nth-child(3){top:72px;transition-delay:.09s}

.fold-wrap.open .fold{transform:rotateX(0)}

/* 背面是镜像：折叠层里的内容折叠时藏起来，展开后再淡入 */
.fold .body{opacity:0;transition:opacity .3s ease .16s}
.fold-wrap.open .fold .body{opacity:1}`,
  init(el) {
    const STYLE = `<style data-fx="fold-card">
      .fold-stage{display:flex;flex-direction:column;align-items:center;gap:10px}
      .fold-wrap{position:relative;width:176px;height:108px;perspective:700px;
        transform-style:preserve-3d;cursor:pointer}
      .fold{position:absolute;left:0;width:100%;height:36px;transform-origin:top center;
        backface-visibility:visible;transform:rotateX(-180deg);
        background:linear-gradient(180deg,#242c3e,#1a2030);
        box-shadow:inset 0 1px 0 rgba(255,255,255,.09),inset 0 -1px 0 rgba(0,0,0,.65);
        transition:transform .55s cubic-bezier(.3,1.08,.4,1),box-shadow .5s ease;
        border-radius:2px;overflow:hidden;box-sizing:border-box}
      .fold:nth-child(1){z-index:3;transform:rotateX(0);background:linear-gradient(180deg,#2a3348,#1e2536);
        box-shadow:inset 0 1px 0 rgba(255,255,255,.12),inset 0 -1px 0 rgba(0,0,0,.65),
                   0 8px 18px rgba(0,0,0,.45)}
      .fold:nth-child(2){z-index:2;top:36px}
      .fold:nth-child(3){z-index:1;top:72px;transition-delay:.09s}
      .fold-wrap.open .fold{transform:rotateX(0)}
      .fold-wrap.open .fold:nth-child(1){box-shadow:inset 0 1px 0 rgba(255,255,255,.12),
        inset 0 -1px 0 rgba(0,0,0,.65)}
      .f1{display:flex;align-items:center;gap:7px;padding:0 12px;box-sizing:border-box}
      .f1 i{width:5px;height:5px;border-radius:99px;background:#8b6cff;box-shadow:0 0 7px #8b6cff;flex:none}
      .f1 b{font-size:11px;color:#dfe5f0;font-weight:600;letter-spacing:.01em}
      .f1 span{margin-left:auto;font-size:8.5px;letter-spacing:.14em;color:#5f6b85;text-transform:uppercase}
      .body{height:100%;display:flex;flex-direction:column;justify-content:center;gap:6px;padding:0 12px;
        box-sizing:border-box;opacity:0;transition:opacity .28s ease}
      .fold-wrap.open .body{opacity:1}
      .fold:nth-child(2) .body{transition-delay:.14s}
      .fold:nth-child(3) .body{transition-delay:.24s}
      .body i{display:block;height:3px;border-radius:2px;background:rgba(255,255,255,.16)}
      .body i:nth-child(2){width:72%}
      .body i:nth-child(3){width:44%;background:rgba(139,108,255,.55)}
      .fold-hint{font-size:9.5px;color:#4a5368;letter-spacing:.08em;text-transform:uppercase}
    </style>`;

    el.insertAdjacentHTML('beforeend', STYLE + `
      <div class="fold-stage">
        <div class="fold-wrap" id="foldWrap">
          <div class="fold f1"><i></i><b>Release note</b><span>v2.4</span></div>
          <div class="fold"><div class="body"><i></i><i></i><i></i></div></div>
          <div class="fold"><div class="body"><i></i><i></i></div></div>
        </div>
        <div class="fold-hint">悬停展开</div>
      </div>`);

    const wrap = el.querySelector('#foldWrap');
    const toggle = () => wrap.classList.toggle('open');
    let timer = setInterval(toggle, 2200);

    const onEnter = () => { clearInterval(timer); wrap.classList.add('open'); };
    const onLeave = () => {
      wrap.classList.remove('open');
      clearInterval(timer);
      timer = setInterval(toggle, 2200);
    };

    wrap.addEventListener('pointerenter', onEnter);
    wrap.addEventListener('pointerleave', onLeave);

    return () => {
      clearInterval(timer);
      wrap.removeEventListener('pointerenter', onEnter);
      wrap.removeEventListener('pointerleave', onLeave);
      el.innerHTML = '';
    };
  }
};
