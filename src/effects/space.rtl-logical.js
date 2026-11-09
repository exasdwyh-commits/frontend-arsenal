export default {
  id: 'rtl-logical', group: 'space', name: 'RTL 逻辑镜像',
  lib: 'Astryx',
  desc: '同一套布局在 LTR/RTL 之间一键翻转，不写两份样式：所有物理方向属性换成逻辑属性（margin-inline-start、inset-inline-end、text-align:start、圆角 border-start-start-radius），dir 属性一切换整行镜像；方向性图标只镜像一次，物理内容（头像/图表/时钟）保持不动。机制提炼自 Astryx（meta/astryx，Meta 开源设计系统）公开文档 bidirectionality.md 的 DR1–DR6 规则，原生 CSS/JS 独立实现。',
  note: '三个坑：① 物理属性不跟 dir 翻——margin-left/right、left/right、text-align:left、border-top-left-radius 全要换成 margin-inline-start、inset-inline-end、text-align:start、border-start-start-radius，漏一个那一处就"翻到一半"；② 镜像只做一次——成对符号（()<>「」）Unicode bidi 算法已经翻了，手动再 scaleX(-1) 就是双重镜像，而箭头/进度条这类方向图标 bidi 不管，才需要按语义翻（DR4）；③ transform:translateX 不会随 dir 翻转，位移动画方向必须按当前方向算或改用逻辑位移，键盘/滚动方向也要跟视觉走（RTL 下"下一项"在左边，方向键逻辑要反转，DR6）。',

  scenes: { places: ['面板', '列表', '官网'], goals: ['风格统一', '内容呈现'], triggers: ['点击'], projects: ['通用', '设计系统', '国际化应用'] },
  code: `/* RTL 逻辑镜像（提炼自 meta/astryx bidirectionality.md DR1–DR6，vanilla 复刻） */
/* 坑①：全部用逻辑属性，dir 一切换就镜像，不写第二份样式 */
.item        { margin-inline-start: 12px;      /* = margin-left(LTR) / margin-right(RTR) */
  padding-inline-end: 10px;
  text-align: start;                          /* = left / right 跟方向走 */
  border-start-start-radius: 8px; }           /* = top-left 圆角跟方向走 */
.badge       { inset-inline-end: 8px; }       /* = right:8px(LTR) / left:8px(RTL) */

/* 坑②：方向性图标按语义翻一次；bidi 已翻的成对符号、物理内容不翻（DR4/DR5） */
[dir="rtl"] .chevron { transform: scaleX(-1); }   /* › 跟方向走 */
[dir="rtl"] .avatar  { transform: none; }         /* 头像/图表/时钟保持 */

/* 坑③：位移动画方向要按方向算（translateX 不自动翻） */
card.style.transform = 'translateX(' + (dir === 'rtl' ? -1 : 1) * 24 + 'px)';
/* 键盘/滚动同理：RTL 下 ArrowLeft = 下一项（DR6） */`,

  init(el) {
    const STYLE = `<style data-fx="rtl-logical">
      .rl{width:100%;box-sizing:border-box;background:#2b2b2b;padding:16px;
        font-family:system-ui,-apple-system,"Segoe UI",sans-serif;color:#d8d8d8}
      .rl-bar{display:flex;align-items:center;gap:12px;margin-bottom:11px;flex-wrap:wrap}
      .rl-lb{font-size:10px;letter-spacing:.06em;text-transform:uppercase;color:#9a9a9a}
      .rl-seg{display:flex;border-radius:5px;overflow:hidden;box-shadow:inset 0 0 0 1px rgba(0,0,0,.35)}
      .rl-seg button{border:0;padding:5px 11px;font:500 11px/1 system-ui,sans-serif;cursor:pointer;
        background:rgba(255,255,255,.12);color:#c9c9c9}
      .rl-seg button.on{background:#5F3BFF;color:#fff}
      .rl-dir{font:500 10.5px/1 ui-monospace,Menlo,Consolas,monospace;color:#8f8f8f;
        background:rgba(0,0,0,.22);border-radius:5px;padding:5px 9px}
      /* auto-fit 随容器换栏：窄卡片单列、详情弹窗双列（媒体查询看的是视口不是容器，会误判） */
      .rl-panes{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px}
      .rl-pane{background:#414141;border-radius:8px;padding:12px 14px}
      .rl-cap{font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:#9a9a9a;margin-bottom:9px}
      .rl-cap .warn{color:#ffb454}
      /* ---- 逻辑属性版：dir 一切换整块镜像 ---- */
      .rl-list{position:relative;border-radius:6px;overflow:hidden;box-shadow:inset 0 0 0 1px rgba(0,0,0,.25)}
      .rl-row{display:flex;align-items:center;gap:9px;padding:7px 0;font-size:11.5px;cursor:pointer;
        transition:background .12s ease-out}
      .rl-row:hover{background:rgba(255,255,255,.07)}
      .rl-row+.rl-row{box-shadow:inset 0 1px 0 rgba(0,0,0,.2)}
      .rl-row .av{width:22px;height:22px;border-radius:50%;flex:none;
        background:linear-gradient(135deg,#7ab8ff,#5F3BFF)}         /* 物理内容：不翻 */
      .rl-row .tx{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .rl-row .meta{font-size:9.5px;color:#8a8a8a}
      .rl-list .rl-row:first-of-type .meta{margin-inline-end:40px}   /* 首行时间戳给“3 新”徽标让位 */
      .rl-row .chev{flex:none;color:#9a9a9a;transition:transform .25s ease-out}   /* 方向图标：翻 */
      .rl-badge{position:absolute;top:6px;font-size:9px;border-radius:3px;padding:1px 6px;
        inset-inline-end:7px;background:rgba(95,59,255,.5);color:#fff}  /* inset-inline-end 跟方向 */
      .rl-pager{display:flex;align-items:center;gap:7px;margin-top:9px}
      .rl-pg{height:24px;min-width:26px;padding:0 8px;border:0;border-radius:4px;cursor:pointer;
        font:500 11px/1 system-ui,sans-serif;background:rgba(255,255,255,.14);color:#e8e8e8;
        display:inline-flex;align-items:center;gap:4px;
        margin-inline-start:0}                      /* 页码间距跟方向 */
      .rl-pg+.rl-pg{margin-inline-start:5px}        /* = margin-left(LTR)/margin-right(RTL) */
      .rl-pg:disabled{opacity:.4;cursor:default}
      .rl-pg .ic{transition:transform .25s ease-out}
      .rl-prog{margin-top:9px;height:5px;border-radius:3px;background:rgba(0,0,0,.35);position:relative}
      .rl-prog i{position:absolute;inset-block:0;inset-inline-start:0;width:62%;border-radius:3px;
        background:#7ab8ff;transition:width .3s ease-out}   /* inset-inline-start 从起始边长 */
      .rl-phys{background:#414141;border-radius:8px;padding:12px 14px}
      .rl-phys .bad-row{display:flex;align-items:center;gap:8px;font-size:11.5px;
        margin-left:14px;                          /* 物理属性：dir 翻转后纹丝不动 */
        padding-left:10px;border-left:2px solid #ffb454}
      .rl-warn{font-size:9.5px;color:#ffb454;margin-top:7px}
      .rl-hint{font-size:10.5px;color:#8a8a8a;line-height:1.8;margin-top:11px}
    </style>`;
    el.insertAdjacentHTML('beforeend', STYLE + `
      <div class="rl">
        <div class="rl-bar">
          <span class="rl-lb">方向</span>
          <span class="rl-seg" data-seg>
            <button class="on" data-v="ltr">LTR ←</button>
            <button data-v="rtl">→ RTL</button>
          </span>
          <span class="rl-dir" data-dir>dir="ltr"</span>
        </div>
        <div class="rl-panes">
          <div class="rl-pane">
            <div class="rl-cap">逻辑属性版：一键整体镜像</div>
            <div class="rl-list" data-good dir="ltr">
              <span class="rl-badge">3 新</span>
              <div class="rl-row"><span class="av"></span><span class="tx">设计评审 · 星期三 14:00</span><span class="meta">2 分钟前</span><span class="chev">›</span></div>
              <div class="rl-row"><span class="av"></span><span class="tx">组件库发布 v2.4</span><span class="meta">1 小时前</span><span class="chev">›</span></div>
              <div class="rl-row"><span class="av"></span><span class="tx">图标集更新 · 120 枚</span><span class="meta">昨天</span><span class="chev">›</span></div>
              <div class="rl-pager">
                <button class="rl-pg" data-prev><span class="ic">‹</span>上一页</button>
                <button class="rl-pg" data-next>下一页<span class="ic">›</span></button>
                <span class="rl-dir" data-page style="margin-inline-start:auto">1 / 6</span>
              </div>
              <div class="rl-prog"><i></i></div>
            </div>
          </div>
          <div class="rl-phys">
            <div class="rl-cap"><span class="warn">反例</span> 物理属性版：翻不动的漏网之鱼</div>
            <div class="bad-row">margin-left / padding-left / border-left 写死</div>
            <div class="rl-warn">↑ 切到 RTL 后：这行还是从左边起，与整体镜像脱节——物理属性不认 dir。</div>
            <div class="rl-hint" style="margin-top:12px">DR5：头像、时钟、品牌标记等物理内容不翻；› 箭头、进度条、"上一页"方向才跟方向走（DR4 只镜像一次）。</div>
          </div>
        </div>
        <div class="rl-hint">切换方向：列表行序、徽标位置（inset-inline-end）、页码间距（margin-inline-start）、进度条生长边（inset-inline-start）、箭头图标全部自动镜像；头像与文字方向保持原样。点"下一页"观察翻页方向也跟着变（DR6）。</div>
      </div>`);

    const pane = el.querySelector('[data-good]');
    const dirLabel = el.querySelector('[data-dir]');
    const pageLabel = el.querySelector('[data-page]');
    const prog = pane.querySelector('.rl-prog i');
    const chevs = pane.querySelectorAll('.chev');
    const nextIc = pane.querySelector('[data-next] .ic');
    const prevIc = pane.querySelector('[data-prev] .ic');
    const cleanups = [];
    let dir = 'ltr', page = 1;
    const PAGES = 6;

    const applyDir = () => {
      pane.setAttribute('dir', dir);            // 逻辑属性全部跟这个属性走
      dirLabel.textContent = 'dir="' + dir + '"';
      // DR4：方向图标只镜像一次；DR5：头像等物理内容 transform:none
      chevs.forEach((c) => { c.style.transform = dir === 'rtl' ? 'scaleX(-1)' : ''; });
      // DR6：翻页方向按视觉来——RTL 下 "下一页" 的箭头在左边
      nextIc.textContent = dir === 'rtl' ? '‹' : '›';
      prevIc.textContent = dir === 'rtl' ? '›' : '‹';
      // 坑③：translateX 不自动翻，位移方向按当前方向算
      pane.animate(
        [{ transform: 'translateX(' + (dir === 'rtl' ? 18 : -18) + 'px)', opacity: .4 },
         { transform: 'none', opacity: 1 }],
        { duration: 260, easing: 'cubic-bezier(.2,.8,.3,1)' }
      );
    };
    const upd = () => {
      pageLabel.textContent = page + ' / ' + PAGES;
      prog.style.width = (page / PAGES * 100) + '%';
      pane.querySelector('[data-prev]').disabled = page === 1;
      pane.querySelector('[data-next]').disabled = page === PAGES;
    };

    const seg = el.querySelector('[data-seg]');
    const onSeg = (e) => {
      const b = e.target.closest('button'); if (!b) return;
      for (const x of seg.children) x.classList.toggle('on', x === b);
      dir = b.dataset.v; applyDir();
    };
    seg.addEventListener('click', onSeg);
    cleanups.push(() => seg.removeEventListener('click', onSeg));

    const onPrev = () => { page = Math.max(1, page - 1); upd(); };   // 逻辑"上一页"始终成立
    const onNext = () => { page = Math.min(PAGES, page + 1); upd(); };
    pane.querySelector('[data-prev]').addEventListener('click', onPrev);
    pane.querySelector('[data-next]').addEventListener('click', onNext);
    cleanups.push(() => {
      pane.querySelector('[data-prev]').removeEventListener('click', onPrev);
      pane.querySelector('[data-next]').removeEventListener('click', onNext);
    });

    applyDir(); upd();
    return () => { for (const c of cleanups) c(); el.innerHTML = ''; };
  }
};
