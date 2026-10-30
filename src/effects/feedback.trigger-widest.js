export default {
  id: 'trigger-widest', group: 'feedback', name: '触发器预留最宽标签',
  lib: 'ProUI',
  desc: '下拉菜单的触发按钮按所有选项里最宽的那个定宽：当前选中"中"时按钮也不会缩成一小截，切换选项时布局纹丝不动。机制提炼自 ProUI（pro-ui.dev）公开文档描述的 pro-select/菜单触发器宽度策略，原生 CSS/JS 独立实现。',
  note: '核心是用一个隐藏的测量哨兵（每个选项复制一份）把容器撑到最宽项的宽度——哨兵容器用 inline-grid，所有选项叠在同一格（grid-area:1/1），容器自动取最宽项撑宽，比 JS 量宽度再写回稳，字体重排、用户缩放它都自动跟。第二个坑：哨兵写成 position:absolute 或并排 inline 都不行——前者脱离布局撑不开容器，后者宽度是所有选项加总；visibility:hidden 也不能换成 display:none（完全不参与布局）。第三个坑：当前值标签要绝对定位叠在哨兵上（在流内就会和哨兵宽度相加），容器用 inline-flex/fit-content，写死 width:100% 的话哨兵白放。',
  scenes: { places: ['工具栏', '表单', '检查器'], goals: ['风格统一', '操作反馈'], triggers: ['点击'], projects: ['专业工具', '桌面应用', '设置页'] },
  code: `/* 触发器预留最宽标签（提炼自 pro-ui.dev 公开文档，vanilla 复刻） */
/* 哨兵：inline-grid 叠格取最宽——所有选项复制一份、叠在同一格，容器被最宽项撑开 */
<span class="trigger">
  <span class="sentinels" aria-hidden="true">
    <span>极小（8px）</span><span>中</span><span>特大展示字号</span>
  </span>
  <span class="current">中</span>        <!-- 绝对定位叠在哨兵上 -->
</span>

.trigger { position:relative; display:inline-flex; align-items:center; }  /* 坑③：宽度由内容决定 */
.sentinels { display:inline-grid; visibility:hidden; }   /* 坑②：不能 absolute/并排，不能 display:none */
.sentinels > span { grid-area:1/1; white-space:nowrap; } /* 叠格，容器取最宽项 */
.current { position:absolute; left:10px; }               /* 在流内会和哨兵宽度相加 */

/* 效果：当前值无论多窄，触发器都保持最宽项的宽度，切换不抖 */`,

  init(el) {
    const STYLE = `<style data-fx="trigger-widest">
      .tw{width:100%;box-sizing:border-box;background:#2b2b2b;padding:16px;
        font-family:system-ui,-apple-system,"Segoe UI",sans-serif;color:#d8d8d8}
      .tw-panel{background:#414141;border-radius:8px;padding:18px 20px;display:flex;flex-direction:column;gap:18px}
      .tw-row{display:flex;align-items:center;gap:14px;flex-wrap:wrap}
      .tw-lb{font-size:11.5px;color:#b6b6b6;width:88px;flex:none}
      .tw-sel{position:relative;display:inline-flex;align-items:center;flex:none;cursor:pointer;
        height:26px;padding:0 10px;border-radius:5px;background:rgba(255,255,255,.15);
        box-shadow:inset 0 1px 0 rgba(255,255,255,.3),inset 0 0 0 1px rgba(0,0,0,.35);
        font:500 12px/1 system-ui,sans-serif;color:#e8e8e8;user-select:none;touch-action:none}
      .tw-sel:hover{background:rgba(255,255,255,.19)}
      /* 哨兵：inline-grid 叠格取最宽——容器被最宽选项撑开 */
      .tw-sent{display:inline-grid;visibility:hidden;pointer-events:none;
        font:500 12px/1 system-ui,sans-serif}
      .tw-sent>span{grid-area:1/1;white-space:nowrap}
      .tw-cur{position:absolute;left:10px;top:50%;transform:translateY(-50%);white-space:nowrap}
      .tw-caret{width:0;height:0;margin-left:8px;flex:none;
        border-left:4px solid transparent;border-right:4px solid transparent;border-top:4.5px solid #b0b0b0}
      .tw-menu{position:absolute;left:0;top:calc(100% + 5px);min-width:100%;z-index:5;
        background:#4d4d4d;border-radius:6px;padding:4px;display:none;
        box-shadow:0 4px 14px rgba(0,0,0,.4),inset 0 0 0 1px rgba(0,0,0,.35)}
      .tw-menu.open{display:block}
      .tw-opt{padding:6px 10px;border-radius:4px;font-size:12px;color:#d8d8d8;white-space:nowrap;cursor:pointer}
      .tw-opt:hover{background:rgba(255,255,255,.12)}
      .tw-opt.sel{background:rgba(95,59,255,.4);color:#fff}
      .tw-narrow{outline:1px dashed rgba(255,255,255,.12);outline-offset:3px}
      .tw-hint{font-size:10.5px;color:#8a8a8a;line-height:1.8;margin-top:14px}
    </style>`;

    const SETS = [
      { lb: '字号', opts: ['极小 8px', '小', '中', '大', '特大展示字号'] },
      { lb: '对齐', opts: ['左', '居中', '两端对齐'] },
      { lb: '画质', opts: ['草稿 15%', '预览 50%', '全质量 100%（无损渲染）'] },
    ];

    let html = `<div class="tw"><div class="tw-panel">`;
    for (const s of SETS) {
      const sents = s.opts.map((o) => '<span>' + o + '</span>').join('');
      const menu = s.opts.map((o, i) =>
        '<div class="tw-opt' + (i === Math.min(2, s.opts.length - 1) ? ' sel' : '') + '" data-v="' + o + '">' + o + '</div>').join('');
      html += `<div class="tw-row"><span class="tw-lb">${s.lb}</span>
        <span class="tw-sel" tabindex="0" role="combobox" aria-expanded="false">
          <span class="tw-sent" aria-hidden="true">${sents}</span><span class="tw-cur"></span><span class="tw-caret"></span>
          <span class="tw-menu">${menu}</span>
        </span></div>`;
    }
    html += `</div>
      <div class="tw-hint">虚线框标出的边界＝最宽选项的宽度。选中项切成"中"或"左"这类短词，触发器也不缩——切换选项时整行布局零位移。</div></div>`;
    el.insertAdjacentHTML('beforeend', STYLE + html);

    const cleanups = [];
    for (const sel of el.querySelectorAll('.tw-sel')) {
      const menu = sel.querySelector('.tw-menu');
      const cur = sel.querySelector('.tw-cur');
      const opts = sel.querySelectorAll('.tw-opt');
      cur.textContent = (sel.querySelector('.tw-opt.sel') || opts[0]).dataset.v;

      const open = (v) => {
        menu.classList.toggle('open', v);
        sel.setAttribute('aria-expanded', String(v));
      };
      const onToggle = (e) => { e.stopPropagation(); open(!menu.classList.contains('open')); };
      const onPick = (e) => {
        const o = e.target.closest('.tw-opt');
        if (!o) return;
        for (const x of opts) x.classList.toggle('sel', x === o);
        cur.textContent = o.dataset.v;   /* 哨兵已把宽度定死，这里换字不抖 */
        open(false);
      };
      const onKey = (e) => {
        if (e.key === 'Enter' || e.key === ' ') { onToggle(e); e.preventDefault(); }
        if (e.key === 'Escape') open(false);
      };
      const onDoc = () => open(false);

      sel.addEventListener('click', onToggle);
      menu.addEventListener('click', onPick);
      sel.addEventListener('keydown', onKey);
      document.addEventListener('click', onDoc);
      cleanups.push(() => {
        sel.removeEventListener('click', onToggle);
        menu.removeEventListener('click', onPick);
        sel.removeEventListener('keydown', onKey);
        document.removeEventListener('click', onDoc);
      });
    }

    return () => { for (const c of cleanups) c(); el.innerHTML = ''; };
  }
};
