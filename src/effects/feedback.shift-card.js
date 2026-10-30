export default {
  id: 'shift-card', group: 'feedback', name: '内容错位卡',
  lib: '原生 JS',
  desc: 'hover 时卡内三层同时换位：主视觉淡出、抽屉从底部顶起、隐藏的副标题补进标题区。移植自 Cult UI 的 Shift Card，一张卡在不加高度的情况下给出两套信息。',
  deps: '无',
  note: '底部抽屉是 absolute + bottom 锚定，高度 38 → 涨开时向上"揭开"，所以中间那层必须先于抽屉淡出（抽屉 delay 0.1s，淡出 delay 0.04s），反过来会看到两层字叠在一起。抽屉必须 overflow:hidden，否则过渡中途多出来的行会露在卡外面。高度不能写死成两个数字：内容一换行数值就错，要 scrollHeight 量一次再 transition height，结束后设回 auto。三层的 transform 只用 translateY，别动 top，会掉进每帧重排。',
  scenes: { places: ['卡片'], goals: ['内容呈现', '交互反馈'], triggers: ['悬停'], projects: ['AI 产品', '品牌官网', '作品集'] },
  code: `/* 抽屉用 measured height 过渡，中间层先淡出再被盖住 */
const drawer = card.querySelector('.drawer');
const setDrawer = open => {
  const inner = drawer.firstElementChild;
  if (open) {
    drawer.style.height = inner.offsetHeight + 'px';   // 先量再过渡
    drawer.style.opacity = '1';
    card.querySelector('.middle').style.opacity = '0';
  } else {
    drawer.style.height = '38px';
    card.querySelector('.middle').style.opacity = '1';
  }
};
card.addEventListener('pointerenter', () => setDrawer(true));
card.addEventListener('pointerleave', () => setDrawer(false));

/* CSS
.drawer{position:absolute;left:0;right:0;bottom:-6px;overflow:hidden;
  height:38px;transition:height .3s cubic-bezier(0,.7,.2,1) .1s,opacity .3s .1s}
.middle{transition:opacity .18s ease .04s}   // 比抽屉早 60ms，避免叠字
*/`,
  init(el) {
    const STYLE = `<style data-fx="shift-card">
      .sc{display:flex;flex-direction:column;align-items:center;gap:10px}
      .sc-card{position:relative;width:196px;height:132px;border-radius:12px;padding:10px;
        background:linear-gradient(180deg,#171c27,#10141c);cursor:pointer;overflow:hidden;
        box-shadow:inset 0 1px 0 rgba(255,255,255,.05),inset 0 0 0 1px rgba(255,255,255,.04),
                   0 0 0 1px rgba(0,0,0,.35),0 6px 14px rgba(0,0,0,.35);
        transition:transform .25s cubic-bezier(.2,.9,.25,1),box-shadow .25s ease;
        display:flex;flex-direction:column;justify-content:space-between}
      .sc-card:hover{transform:scale(1.02);box-shadow:inset 0 1px 0 rgba(255,255,255,.07),
        inset 0 0 0 1px rgba(255,255,255,.06),0 0 0 1px rgba(0,0,0,.4),0 10px 22px rgba(0,0,0,.45)}
      .sc-head{position:relative;height:30px}
      .sc-top{font-size:12px;font-weight:600;color:#e8ecf4;letter-spacing:.01em}
      .sc-sub{position:absolute;left:0;top:15px;font-size:9.5px;color:#8b6cff;letter-spacing:.06em;
        text-transform:uppercase;opacity:0;transform:translateY(4px);
        transition:opacity .22s ease,transform .28s cubic-bezier(.2,1,.3,1)}
      .sc-card:hover .sc-sub{opacity:1;transform:none;transition-delay:.14s}
      .sc-mid{font-size:10px;color:#7c869c;line-height:1.6;padding-bottom:26px;
        transition:opacity .18s ease .04s}
      .sc-card:hover .sc-mid{opacity:0}
      .sc-drawer{position:absolute;left:0;right:0;bottom:0;height:38px;overflow:hidden;opacity:0;
        transition:height .3s cubic-bezier(0,.7,.2,1) .1s,opacity .28s ease .1s;
        background:linear-gradient(180deg,rgba(139,108,255,.12),rgba(139,108,255,.03));
        border-top:1px solid rgba(139,108,255,.22)}
      .sc-card:hover .sc-drawer{opacity:1}
      .sc-row{display:flex;align-items:center;gap:7px;padding:8px 10px;font-size:10px;color:#cfd6e6}
      .sc-row i{width:5px;height:5px;border-radius:99px;background:#3ddc97;flex:none;
        box-shadow:0 0 6px #3ddc97;font-style:normal}
      .sc-row i.warn{background:#f5af19;box-shadow:0 0 6px #f5af19}
      .sc-row span{margin-left:auto;color:#5f6b85;font-size:9px}
      .sc-hint{font-size:9.5px;color:#4a5368;letter-spacing:.08em;text-transform:uppercase}
    </style>`;

    el.insertAdjacentHTML('beforeend', STYLE + `
      <div class="sc">
        <div class="sc-card" id="scCard">
          <div class="sc-head">
            <div class="sc-top">重构 auth 流程</div>
            <div class="sc-sub">Suggested by agent</div>
          </div>
          <div class="sc-mid">3 处 token 校验时机不一致，合并到同一个中间件可以少 40 行。</div>
          <div class="sc-drawer">
            <div style="height:96px">
              <div class="sc-row"><i></i>合并校验中间件 <span>-40 行</span></div>
              <div class="sc-row"><i class="warn"></i>改 2 处调用点 <span>+6 行</span></div>
              <div class="sc-row"><i></i>补 3 个回归用例 <span>+52 行</span></div>
            </div>
          </div>
        </div>
        <div class="sc-hint">悬停：抽屉顶起 · 中层让位</div>
      </div>`);

    const card = el.querySelector('#scCard');
    const drawer = card.querySelector('.sc-drawer');
    const inner = drawer.firstElementChild;

    const setOpen = open => {
      if (open) {
        drawer.style.height = inner.offsetHeight + 'px';
        drawer.style.opacity = '1';
        card.querySelector('.sc-mid').style.opacity = '0';
      } else {
        drawer.style.height = '38px';
        drawer.style.opacity = '';
        card.querySelector('.sc-mid').style.opacity = '';
      }
    };

    const onEnter = () => setOpen(true);
    const onLeave = () => setOpen(false);
    card.addEventListener('pointerenter', onEnter);
    card.addEventListener('pointerleave', onLeave);

    return () => {
      card.removeEventListener('pointerenter', onEnter);
      card.removeEventListener('pointerleave', onLeave);
      el.innerHTML = '';
    };
  }
};
