export default {
  id: 'smart-anchor', group: 'space', name: '智能锚点定位',
  lib: 'Floating UI',
  desc: '浮层贴着锚点但绝不越界：中间件管线按 offset→flip→shift→arrow 顺序执行——主轴溢出翻到对侧、对齐轴夹回边界内、箭头按最终 placement 落静态边并把动态轴夹进浮层；autoUpdate 只在挂载期监听祖先滚动/窗口缩放/ResizeObserver，锚点用 transform 动画时这些全都不触发，只有 animationFrame 每帧量矩形才跟得住。机制提炼自 floating-ui（MIT，32.8k★）公开文档 computePosition/middleware/flip/shift/arrow/autoUpdate，原生 JS 独立实现，带边界内滚动与锚点动画开关演示。',
  deps: '无',
  note: '七个坑：① 浮层定位前必须先铺好初始布局——position:absolute + width:max-content + top:0 left:0，否则量到的是被容器撑坏的宽高，且溢出会触发重排造成测量抖动；② 浮层必须处于可见状态才能测量，display:none 下调 computePosition 得到 0×0；③ 中间件顺序即语义：offset 永远在最前、arrow/hide 在最后，flip 改变 placement 会让后续中间件整轮重跑（reset lifecycle），带 -start/-end 对齐时 flip 必须排在 shift 之前，否则对齐翻转会被平移抢先；④ arrow 的 middlewareData 只有一维有值，判断必须用 != null——0 是合法坐标，用 !x 会把贴边箭头判成缺失；⑤ limitShift 的停止条件是"浮层对边与锚点对边对齐"，不是简单 clamp 到边界，否则锚点会脱离浮层（detached）；⑥ rootBoundary 默认 viewport 用的是视觉视口（visualViewport），双指缩放/键盘弹出会变，右键菜单这类要锚死布局视口得显式传 layoutViewport/document；⑦ ResizeObserver 只报尺寸变化不报 transform 位移，IntersectionObserver 的 layoutShift 同理，纯位移动画必须开 animationFrame（代价是每帧 ~1ms 的全量重算）。',

  scenes: { places: ['面板', '菜单', '官网'], goals: ['操作反馈', '风格统一'], triggers: ['悬停', '点击'], projects: ['通用', '设计系统', '专业工具'] },
  code: `/* 定位管线（提炼自 floating-ui docs，vanilla 复刻） */
function compute(ref, flt, placement, opts) {
  // 先铺初始布局三件套再测量（absolute / max-content / top:0 left:0）
  let {side, align} = parse(placement);      // side: top|bottom|left|right
  let x, y;
  const place = () => { /* 主轴 = ref 边 ± offset；对齐轴贴 ref 边 */ };
  place();
  // flip：detectOverflow(浮层, 边界 inset padding) → 主轴溢出换对侧；
  // flipAlignment：对齐轴溢出 → -start/-end 互换；placement 变了要整轮重跑
  if (opts.flip && overflowMain(side)) { side = OPPOSITE[side]; place(); }
  // shift：把对齐轴夹回边界内；limitShift 到"对边与 ref 对齐"就停（不是裸 clamp）
  if (opts.shift) x = limitShiftClamp(x, flt.w, b, ref);
  // arrow：静态边 = 最终 placement 的对侧；动态轴取 ref 中线夹进浮层
  // middlewareData.arrow 一维 undefined，判断必须 != null（0 是合法值）
  return {x, y, side, shiftX, centerOffset};
}
// autoUpdate 只在挂载期挂监听、卸载必清理（否则多浮层时严重掉帧）：
// 祖先滚动 + window resize + ResizeObserver(尺寸) + IntersectionObserver(layoutShift)
// 锚点做 transform 动画时上面四个全都不触发 → 只有 animationFrame 每帧量 rect 跟得住`,

  init(el) {
    const STYLE = `<style data-fx="smart-anchor">
      .sa{width:100%;box-sizing:border-box;background:#2b2b2b;padding:14px;
        font-family:system-ui,-apple-system,"Segoe UI",sans-serif;color:#d8d8d8}
      .sa-bar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:10px}
      .sa-lb{font-size:10px;letter-spacing:.06em;text-transform:uppercase;color:#9a9a9a}
      .sa-seg{display:flex;border-radius:5px;overflow:hidden;box-shadow:inset 0 0 0 1px rgba(0,0,0,.35)}
      .sa-seg button{border:0;padding:5px 11px;font:500 11px/1 system-ui,sans-serif;cursor:pointer;
        background:rgba(255,255,255,.12);color:#c9c9c9}
      .sa-seg button.on{background:#5F3BFF;color:#fff}
      .sa-sw{display:flex;align-items:center;gap:5px;font-size:11px;color:#b6b6b6;cursor:pointer}
      .sa-sw input{accent-color:#5F3BFF}
      .sa-stat{margin-left:auto;font:500 10px/1.6 ui-monospace,Menlo,Consolas,monospace;color:#8f8f8f;
        background:rgba(0,0,0,.22);border-radius:5px;padding:5px 9px;max-width:100%}
      .sa-stat b{color:#e8e8e8;font-weight:500}
      .sa-stat .hit{color:#6ee29a}
      /* ---- 可滚动边界舞台：浮层以 strategy:absolute 挂在内容层，坐标系跟内容走 ---- */
      .sa-stage{position:relative;height:264px;border-radius:8px;overflow:auto;background:#414141;
        box-shadow:inset 0 0 0 1px rgba(0,0,0,.3)}
      .sa-inner{position:relative;width:150%;height:520px;padding:14px;box-sizing:border-box}
      .sa-grid{position:absolute;inset:0;
        background-image:linear-gradient(rgba(255,255,255,.05) 1px,transparent 1px),
          linear-gradient(90deg,rgba(255,255,255,.05) 1px,transparent 1px);
        background-size:32px 32px;pointer-events:none}
      .sa-ref{position:absolute;left:170px;top:34px;height:27px;padding:0 13px;border:0;border-radius:5px;
        cursor:default;font:500 11.5px/1 system-ui,sans-serif;background:#5F3BFF;color:#fff;
        box-shadow:inset 0 1px 0 rgba(255,255,255,.35);z-index:1}
      .sa-ref.dance{animation:saDance 3.2s ease-in-out infinite alternate}
      @keyframes saDance{from{transform:translate(0,0)}to{transform:translate(300px,150px)}}
      .sa-float{position:absolute;top:0;left:0;width:max-content;max-width:230px;box-sizing:border-box;
        background:#1d1d1d;border-radius:7px;padding:9px 12px;z-index:2;
        box-shadow:0 8px 22px rgba(0,0,0,.5),inset 0 0 0 1px rgba(255,255,255,.09);pointer-events:none}
      .sa-float .t{font:600 11.5px/1.5 system-ui,sans-serif;color:#fff}
      .sa-float .d{font-size:10px;color:#a8a8a8;line-height:1.6;margin-top:2px}
      .sa-arrow{position:absolute;width:9px;height:9px;background:#1d1d1d;transform:rotate(45deg);
        box-shadow:inset 1px 1px 0 rgba(255,255,255,.09)}
      .sa-bound{position:absolute;border:1px dashed rgba(255,255,255,.28);border-radius:6px;
        pointer-events:none;z-index:0}
      .sa-log{margin-top:9px;min-height:40px;font:400 10px/1.7 ui-monospace,Menlo,Consolas,monospace;
        color:#8f8f8f;background:rgba(0,0,0,.22);border-radius:6px;padding:6px 9px}
      .sa-log .ev{color:#e8e8e8}.sa-log .warn{color:#ffb454}.sa-log .ok{color:#6ee29a}
      .sa-hint{font-size:10.5px;color:#8a8a8a;line-height:1.8;margin-top:9px}
      @media (max-width:560px){.sa-ref{left:90px}}
    </style>`;

    el.insertAdjacentHTML('beforeend', STYLE + `
      <div class="sa" data-root>
        <div class="sa-bar">
          <span class="sa-lb">placement</span>
          <span class="sa-seg" data-seg>
            <button class="on" data-v="bottom">bottom</button>
            <button data-v="top">top</button>
            <button data-v="left">left</button>
            <button data-v="right">right</button>
          </span>
          <label class="sa-sw"><input type="checkbox" data-k="flip" checked> flip</label>
          <label class="sa-sw"><input type="checkbox" data-k="shift" checked> shift</label>
          <label class="sa-sw"><input type="checkbox" data-k="limit"> limitShift</label>
          <label class="sa-sw"><input type="checkbox" data-k="dance"> 锚点动画</label>
          <label class="sa-sw"><input type="checkbox" data-k="raf"> animationFrame</label>
          <span class="sa-stat" data-stat>—</span>
        </div>
        <div class="sa-stage" data-stage>
          <div class="sa-inner" data-inner>
            <div class="sa-grid"></div>
            <div class="sa-bound" data-bound></div>
            <button class="sa-ref" data-ref tabindex="-1">锚点</button>
            <div class="sa-float" data-float>
              <div class="t">智能浮层</div>
              <div class="d">管线实时计算：翻转 → 平移 → 箭头归位。</div>
              <div class="sa-arrow" data-arrow></div>
            </div>
          </div>
        </div>
        <div class="sa-log" data-log><span style="color:#7a7a7a">滚动舞台 / 拖窗口 / 切 placement，看触发源与管线修正。</span></div>
        <div class="sa-hint">虚线是检测边界（舞台可视区内缩 8px padding）。滚动舞台让锚点贴边：flip 先换侧（日志亮 warn），shift 再把对齐轴夹回边界；勾 limitShift 后平移在"浮层对边与锚点对边对齐"处即停，浮层不会滑到脱离锚点。关 flip 可看到溢出原样保留，关 shift 可看到对齐轴出界。勾"锚点动画"但不开 animationFrame：transform 位移不触发 scroll/resize/ResizeObserver，浮层原地脱钩；再勾 animationFrame 则每帧 ~1ms 重算紧跟。</div>
      </div>`);

    const stage = el.querySelector('[data-stage]');
    const inner = el.querySelector('[data-inner]');
    const ref = el.querySelector('[data-ref]');
    const flt = el.querySelector('[data-float]');
    const arrow = el.querySelector('[data-arrow]');
    const bound = el.querySelector('[data-bound]');
    const stat = el.querySelector('[data-stat]');
    const logBox = el.querySelector('[data-log]');
    const seg = el.querySelector('[data-seg]');
    const OPPOSITE = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' };
    const OFF = 6, PAD = 8, HALF = 4.5;
    const opts = { flip: true, shift: true, limit: false, dance: false, raf: false };
    let placement = 'bottom', rafId = 0, ro = null, n = 0, prevWhy = '', prevFlipped = false;

    const log = (html, cls) => {
      const line = document.createElement('div');
      line.className = cls || 'ev';
      line.innerHTML = html;
      logBox.prepend(line);
      while (logBox.children.length > 4) logBox.lastChild.remove();
    };

    function update(why) {
      n++;
      const r = ref.getBoundingClientRect();
      const fw = flt.offsetWidth, fh = flt.offsetHeight;   // 测量前浮层必须可见（display:none 量出 0×0）
      const ir = inner.getBoundingClientRect();
      const sr = stage.getBoundingClientRect();
      // 边界与锚点全部换算到 inner 内容坐标系（ir 随滚动移动，天然带偏移）
      const b = { l: sr.left - ir.left + PAD, r: sr.right - ir.left - PAD, t: sr.top - ir.top + PAD, b: sr.bottom - ir.top - PAD };
      const rc = { l: r.left - ir.left, t: r.top - ir.top, w: r.width, h: r.height };
      rc.r = rc.l + rc.w; rc.b = rc.t + rc.h;
      let side = placement, x = 0, y = 0, flipped = false;

      const place = () => {
        if (side === 'bottom') { x = rc.l + rc.w / 2 - fw / 2; y = rc.b + OFF; }
        else if (side === 'top') { x = rc.l + rc.w / 2 - fw / 2; y = rc.t - OFF - fh; }
        else if (side === 'left') { x = rc.l - OFF - fw; y = rc.t + rc.h / 2 - fh / 2; }
        else { x = rc.r + OFF; y = rc.t + rc.h / 2 - fh / 2; }
      };
      // 主轴溢出量（flip 只看主轴；对齐轴交给 shift）
      const mainOver = () => side === 'bottom' ? Math.max(0, y + fh - b.b)
        : side === 'top' ? Math.max(0, b.t - y)
        : side === 'left' ? Math.max(0, b.l - x) : Math.max(0, x + fw - b.r);
      place();

      let flipNote = '';
      if (opts.flip && mainOver() > 0) {
        const cur = mainOver(), keep = { s: side, x, y };
        side = OPPOSITE[side]; place();
        if (mainOver() > cur) { side = keep.s; x = keep.x; y = keep.y; }   // bestFit：都放不下取溢出更小侧
        else flipped = true;
        flipNote = flipped ? ' ←flip' : ' ←bestFit';
      }

      let sh = 0;
      if (opts.shift) {
        if (side === 'bottom' || side === 'top') {
          let nx = Math.min(Math.max(x, b.l), b.r - fw);
          if (opts.limit) nx = Math.min(Math.max(nx, rc.l - fw), rc.r);   // 对边对齐即停
          sh = Math.round(nx - x); x = nx;
        } else {
          let ny = Math.min(Math.max(y, b.t), b.b - fh);
          if (opts.limit) ny = Math.min(Math.max(ny, rc.t - fh), rc.b);
          sh = Math.round(ny - y); y = ny;
        }
      }

      // arrow：动态轴取锚点中线并夹进浮层；静态边 = 最终 placement 的对侧
      let aOff = 0;
      arrow.style.left = arrow.style.right = arrow.style.top = arrow.style.bottom = '';
      if (side === 'bottom' || side === 'top') {
        const target = rc.l + rc.w / 2 - x;
        const t = Math.min(Math.max(target, 6 + HALF), fw - 6 - HALF);
        aOff = Math.round(target - t);
        arrow.style.left = (t - HALF) + 'px';
        if (side === 'bottom') arrow.style.top = -HALF + 'px';
        else arrow.style.bottom = -HALF + 'px';
      } else {
        const target = rc.t + rc.h / 2 - y;
        const t = Math.min(Math.max(target, 6 + HALF), fh - 6 - HALF);
        aOff = Math.round(target - t);
        arrow.style.top = (t - HALF) + 'px';
        if (side === 'right') arrow.style.left = -HALF + 'px';
        else arrow.style.right = -HALF + 'px';
      }

      flt.style.left = x + 'px';
      flt.style.top = y + 'px';
      bound.style.left = b.l + 'px'; bound.style.top = b.t + 'px';
      bound.style.width = (b.r - b.l) + 'px'; bound.style.height = (b.b - b.t) + 'px';

      stat.innerHTML = 'side=<b>' + side + '</b>' + flipNote +
        ' · shift:<b>' + (sh > 0 ? '+' : '') + sh + 'px</b>' +
        ' · arrow偏差:<b>' + aOff + 'px</b>' +
        ' · n=<b>' + n + '</b> · 触发:<b>' + why + '</b>';
      if (why !== prevWhy) {
        log('update ← <span class="ev">' + why + '</span> → ' + side + flipNote +
          (sh ? ' · shift ' + (sh > 0 ? '+' : '') + sh + 'px' : ''), flipped ? 'warn' : 'ev');
        prevWhy = why;
      }
      if (flipped !== prevFlipped) {
        log(flipped ? 'flip：主轴溢出 → 换到 ' + side + '（OPPOSITE[' + placement + ']）' : 'flip：回到首选侧 ' + placement, flipped ? 'warn' : 'ok');
        prevFlipped = flipped;
      }
    }

    // ---- autoUpdate：只在挂载期监听，卸载必清理 ----
    const onScroll = () => update('ancestorScroll');
    const onResize = () => update('windowResize');
    stage.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    if ('ResizeObserver' in window) {
      ro = new ResizeObserver(() => update('elementResize'));
      ro.observe(ref);
    }
    const rafLoop = () => { update('animationFrame'); rafId = requestAnimationFrame(rafLoop); };
    const syncRaf = () => {
      if (opts.raf && !rafId) rafId = requestAnimationFrame(rafLoop);
      if (!opts.raf && rafId) { cancelAnimationFrame(rafId); rafId = 0; }
    };

    const onSeg = (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;
      for (const x of e.currentTarget.children) x.classList.toggle('on', x === btn);
      placement = btn.dataset.v;
      update('placement');
    };
    seg.addEventListener('click', onSeg);

    const onOpt = (e) => {
      const k = e.target.dataset.k;
      opts[k] = e.target.checked;
      if (k === 'dance') ref.classList.toggle('dance', opts.dance);
      if (k === 'raf') syncRaf();
      if (k === 'dance' && opts.dance && !opts.raf) {
        log('transform 位移：scroll / resize / ResizeObserver 全不触发 → 浮层脱钩（勾 animationFrame 解）', 'warn');
      }
      update('option:' + k);
    };
    el.querySelectorAll('[data-k]').forEach((cb) => cb.addEventListener('change', onOpt));

    update('init');

    return () => {
      stage.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      if (ro) ro.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
      seg.removeEventListener('click', onSeg);
      el.querySelectorAll('[data-k]').forEach((cb) => cb.removeEventListener('change', onOpt));
      el.innerHTML = '';
    };
  }
};
