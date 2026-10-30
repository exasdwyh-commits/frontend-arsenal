export default {
  id: 'direction-tabs', group: 'feedback', name: '方向感知标签',
  lib: '原生 JS',
  desc: '切标签时内容从"点的那边"滑进来、往"点的那边"滑出去，底板用 FLIP 跟着跳。移植自 Cult UI 的 Direction Aware Tabs，比无脑淡入多交代了一层空间关系。',
  deps: '无',
  note: '方向由索引差的正负决定（newIdx > oldIdx 为 +1），不是由指针位置决定——用户点右边的标签期望内容从右进。退场的旧面板要拿同一个方向值取反（新面板 x: +300*d 进，旧面板 x: -300*d 出），两个面板各自设 transform，绝不能共用一个 transition。交换期间两块内容必须同时 absolute，否则容器高度跳成两者之和——但 absolute 之后容器就没有内容高度了，高度必须每次 scrollHeight 量完写死像素，设回 auto 会直接塌成 0。底板用 FLIP：先读旧矩形，改类后读新矩形，用 transform 反向补偿再归零，别动 left/top。',
  scenes: { places: ['导航', '卡片'], goals: ['交互反馈', '内容呈现'], triggers: ['点击'], projects: ['管理后台', 'AI 产品', '品牌官网'] },
  code: `/* 方向 = 索引差符号；新旧面板同时过渡，各自相反方向 */
const go = next => {
  const dir = next > active ? 1 : -1;
  const from = panes[active], to = panes[next];

  to.style.transform = 'translateX(' + (300 * dir) + 'px)';
  to.style.opacity = '0';
  to.style.filter = 'blur(4px)';
  to.classList.add('on');

  requestAnimationFrame(() => {
    to.style.transform = 'translateX(0)';
    to.style.opacity = '1';
    to.style.filter = 'blur(0)';
    from.style.transform = 'translateX(' + (-300 * dir) + 'px)';
    from.style.opacity = '0';
    from.style.filter = 'blur(4px)';
    from.classList.remove('on');
  });

  panel.style.height = to.scrollHeight + 'px';   // 量一次写死，结束后设 auto
};

/* CSS
.wrap{position:relative;transition:height .4s cubic-bezier(.175,.885,.32,1.1)}
.pane{position:absolute;inset:0;transition:transform .4s cubic-bezier(.175,.885,.32,1.1),
  opacity .4s,filter .4s}
*/`,
  init(el) {
    const TABS = [
      { label: '概览', body: '本周 24 个任务完成，2 个阻塞。' },
      { label: '调用', body: '1,204 次工具调用，平均 340ms，失败率 0.8%。' },
      { label: '成本', body: '输入 12.4M tokens，缓存命中 71%，环比降 9%。' },
    ];

    const STYLE = `<style data-fx="direction-tabs">
      .dt{display:flex;flex-direction:column;align-items:center;gap:11px;width:214px}
      .dt-bar{position:relative;display:flex;gap:2px;padding:3px;border-radius:99px;
        background:#252c3c;box-shadow:inset 0 1px 2px rgba(0,0,0,.55),inset 0 0 0 1px rgba(255,255,255,.04)}
      .dt-bub{position:absolute;top:3px;left:0;height:calc(100% - 6px);border-radius:99px;z-index:0;
        background:#333c50;box-shadow:inset 0 0 0 1px rgba(255,255,255,.09),0 1px 2px rgba(0,0,0,.4);
        transition:transform .4s cubic-bezier(.175,.885,.32,1.1),width .4s cubic-bezier(.175,.885,.32,1.1);
        will-change:transform,width}
      .dt-btn{position:relative;z-index:1;border:0;background:none;cursor:pointer;padding:5px 13px;
        font-size:10.5px;letter-spacing:.02em;border-radius:99px;color:#98a2b8;
        transition:color .25s ease}
      .dt-btn.on{color:#fff}
      .dt-btn:hover{color:#cfd6e6}
      .dt-panel{position:relative;width:100%;overflow:hidden;transition:height .4s cubic-bezier(.175,.885,.32,1.1)}
      .dt-pane{position:absolute;top:0;left:0;right:0;padding:11px 13px;border-radius:10px;font-size:10.5px;
        line-height:1.65;color:#c3cbdb;background:#171c27;border:1px solid #242a38;
        transition:transform .4s cubic-bezier(.175,.885,.32,1.1),opacity .4s ease,filter .4s ease;
        will-change:transform,opacity,filter}
      .dt-hint{font-size:9.5px;color:#4a5368;letter-spacing:.08em;text-transform:uppercase}
    </style>`;

    el.insertAdjacentHTML('beforeend', STYLE + `
      <div class="dt">
        <div class="dt-bar" id="dtBar">
          <div class="dt-bub" id="dtBub"></div>
          ${TABS.map((t, i) => `<button class="dt-btn${i === 0 ? ' on' : ''}" data-i="${i}">${t.label}</button>`).join('')}
        </div>
        <div class="dt-panel" id="dtPanel">
          ${TABS.map((t, i) => `<div class="dt-pane${i === 0 ? '' : ''}" data-i="${i}">${t.body}</div>`).join('')}
        </div>
        <div class="dt-hint">方向由点击位置决定</div>
      </div>`);

    const bar = el.querySelector('#dtBar');
    const bub = el.querySelector('#dtBub');
    const panel = el.querySelector('#dtPanel');
    const btns = [...bar.querySelectorAll('.dt-btn')];
    const panes = [...panel.querySelectorAll('.dt-pane')];

    let active = 0;
    let busy = null;

    // FLIP：先读旧矩形 → 换 active → 读新矩形 → transform 反向补偿再归零
    const moveBubble = i => {
      const oldRect = bub.getBoundingClientRect();
      bub.style.width = btns[i].offsetWidth + 'px';
      bub.style.transform = 'translateX(' + btns[i].offsetLeft + 'px)';
      return oldRect;
    };

    const setHeight = pane => {
      // 子面板是 absolute，容器 auto 高度 = 0，必须每次写死像素
      panel.style.height = pane.scrollHeight + 'px';
    };

    panes.forEach((p, i) => {
      p.style.transform = 'translateX(' + (i === 0 ? 0 : 300) + 'px)';
      p.style.opacity = i === 0 ? '1' : '0';
      p.style.filter = i === 0 ? 'blur(0)' : 'blur(4px)';
      p.classList.toggle('on', i === 0);
    });
    moveBubble(0);
    setHeight(panes[0]);

    const go = next => {
      if (next === active || busy === next) return;
      busy = next;
      const dir = next > active ? 1 : -1;
      const from = panes[active], to = panes[next];

      to.classList.add('on');
      to.style.transform = 'translateX(' + (300 * dir) + 'px)';
      to.style.opacity = '0';
      to.style.filter = 'blur(4px)';

      requestAnimationFrame(() => {
        to.style.transform = 'translateX(0)';
        to.style.opacity = '1';
        to.style.filter = 'blur(0)';
        from.style.transform = 'translateX(' + (-300 * dir) + 'px)';
        from.style.opacity = '0';
        from.style.filter = 'blur(4px)';
        setHeight(to);
      });

      btns.forEach((b, i) => b.classList.toggle('on', i === next));
      moveBubble(next);

      setTimeout(() => {
        from.classList.remove('on');
        setHeight(to);
        active = next;
        busy = null;
      }, 440);
    };

    const onClick = e => {
      const b = e.target.closest('.dt-btn');
      if (b) go(Number(b.dataset.i));
    };
    bar.addEventListener('click', onClick);

    // 自动来回演示，方便在舞台里看到双向
    let timer = setInterval(() => go((active + 1) % TABS.length), 2800);

    return () => {
      clearInterval(timer);
      bar.removeEventListener('click', onClick);
      el.innerHTML = '';
    };
  }
};
