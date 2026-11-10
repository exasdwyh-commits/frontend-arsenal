export default {
  id: 'overlay-dismiss', group: 'feedback', name: '浮层关闭与滚动锁定',
  lib: 'Floating UI',
  desc: '关闭要说出理由：Esc → escape-key（IME 合成中不关）、浮层外按下 → outside-press（pointerdown 是 eager、click 是 lazy，lazy 要用"起点或终点在浮层内就不关"护住拖拽选择）、点触发器 → reference-press。滚动锁定用模块级 lockCount——第一个浮层装锁（body overflow:hidden + 滚动条宽度补 padding、RTL 选左侧、iOS 用 position:fixed 负偏移回锚），最后一个才解锁，嵌套浮层绝不提前放锁。机制提炼自 floating-ui（MIT）公开文档 FloatingOverlay/useDismiss，原生 JS 独立实现。',

  deps: '无',
  note: '七个坑：① lockCount 必须是模块级共享计数，不是每个浮层自查 body——嵌套两个浮层时内层关闭若直接解锁，背景立刻可滚，外层还开着；② 锁的第一瞬间滚动条消失会让布局横跳，必须用 innerWidth - documentElement.clientWidth 量出滚动条宽度补到 body 的 padding 上；RTL 下要补 paddingLeft——判定看 documentElement.getBoundingClientRect().left + scrollLeft 是否为 0；③ 只有 iOS 不认 body 的 overflow:hidden——技法是 body position:fixed + top/left 设为负的滚动偏移（再减 visualViewport 偏移避开工具栏），解锁时必须 window.scrollTo({behavior:\'instant\'}) 回位，用默认平滑滚动会看到页面滑回去；④ eager（pointerdown）对鼠标和触摸都立即关，会打断"从浮层内起手的拖拽选择"；lazy（click）虽然等抬手，但必须同时检查起点和终点——只查终点时，从外面按下拖进浮层内松手仍会被误关；⑤ Esc 关闭前要查 isComposing，中文输入法组词中按 Esc 是取消组词不是关浮层；⑥ 点在滚动条上不算"点了外面"——要按 target 的 overflow 样式和 client/scrollWidth 判定；⑦ 点触发器关闭的 reason 是 reference-press 而不是 outside-press，日志/埋点里两者混用会让"用户主动收起"和"误触外部"分不开。',

  scenes: { places: ['菜单', '面板', '专业工具'], goals: ['操作反馈', '风格统一'], triggers: ['点击', '键盘'], projects: ['通用', '设计系统', '专业工具'] },
  code: `/* 关闭语义 + 滚动锁定（提炼自 floating-ui docs，vanilla 复刻） */
// ---- 关闭理由：reason 决定埋点语义，不能混 ----
onEscape: if (!event.isComposing) close(event, 'escape-key');  // IME 组词中 Esc 是取消组词
onOutside: close(event, 'outside-press');
onTrigger: close(event, 'reference-press');                    // 点触发器收起 ≠ 误触外部
// ---- eager vs lazy ----
// pointerdown：eager（鼠标+触摸都按下即关）→ 会打断浮层内起手的拖拽选择
// click：lazy（等抬手）→ 必须护住"起点或终点在浮层内"，只查终点会误关拖拽
if (event === 'click' && startedOrEndedInside) return;         // 拖拽进出浮层都不关
// ---- 滚动锁定：模块级计数，第一个装锁最后一个解锁 ----
let lockCount = 0;
function lock() {
  if (++lockCount > 1) return;               // 已锁：只计数，不重复装
  const sw = innerWidth - documentElement.clientWidth;   // 滚动条宽度
  const rtl = documentElement.getBoundingClientRect().left + scrollLeft; // RTL → 补左
  body.overflow = 'hidden';
  body[rtl ? 'paddingLeft' : 'paddingRight'] = sw + 'px'; // 补偿，防布局横跳
  // iOS 不认 overflow:hidden → position:fixed + 负滚动偏移回锚（减 visualViewport 偏移）
}
function unlock() {
  if (--lockCount > 0) return;               // 还有浮层开着：继续锁
  restoreStyles(); window.scrollTo({left: x, top: y, behavior: 'instant'});
}`,

  init(el) {
    const STYLE = `<style data-fx="overlay-dismiss">
      .ov{width:100%;box-sizing:border-box;background:#2b2b2b;padding:14px;
        font-family:system-ui,-apple-system,"Segoe UI",sans-serif;color:#d8d8d8}
      .ov-bar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:10px}
      .ov-lb{font-size:10px;letter-spacing:.06em;text-transform:uppercase;color:#9a9a9a}
      .ov-seg{display:flex;border-radius:5px;overflow:hidden;box-shadow:inset 0 0 0 1px rgba(0,0,0,.35)}
      .ov-seg button{border:0;padding:5px 10px;font:500 10.5px/1 ui-monospace,Menlo,Consolas,monospace;
        cursor:pointer;background:rgba(255,255,255,.12);color:#c9c9c9}
      .ov-seg button.on{background:#5F3BFF;color:#fff}
      .ov-btn{border:0;border-radius:6px;padding:8px 14px;cursor:pointer;
        font:600 11.5px/1 system-ui,sans-serif;background:#5F3BFF;color:#fff;
        box-shadow:inset 0 1px 0 rgba(255,255,255,.3)}
      .ov-btn.alt{background:rgba(255,255,255,.14);color:#d8d8d8}
      .ov-btn:disabled{opacity:.45;cursor:default}
      .ov-sw{display:flex;align-items:center;gap:5px;font-size:11px;color:#b6b6b6;cursor:pointer}
      .ov-sw input{accent-color:#5F3BFF}
      .ov-stat{margin-left:auto;font:500 10px/1.6 ui-monospace,Menlo,Consolas,monospace;color:#8f8f8f;
        background:rgba(0,0,0,.22);border-radius:5px;padding:5px 9px}
      .ov-stat b{color:#e8e8e8;font-weight:500}
      .ov-stat .on{color:#6ee29a}.ov-stat .wait{color:#ffb454}
      /* ---- 浮层本体：fixed inset:0 + overflow:auto（可当滚动容器） ---- */
      .ov-layer{position:fixed;top:0;right:0;bottom:0;left:0;z-index:9999;display:none}
      .ov-layer.show{display:block}
      .ov-back{position:absolute;inset:0;background:rgba(0,0,0,.45)}
      .ov-panel{position:absolute;background:#1d1d1d;border-radius:8px;padding:13px 15px;
        box-shadow:0 12px 34px rgba(0,0,0,.55),inset 0 0 0 1px rgba(255,255,255,.1);
        font-size:11.5px;line-height:1.7;color:#c9c9c9}
      .ov-panel h4{margin:0 0 7px;font-size:12.5px;color:#fff}
      .ov-menu{position:absolute;left:14px;top:56px;width:176px;padding:6px}
      .ov-menu .mi{display:block;width:100%;text-align:left;border:0;border-radius:5px;
        padding:7px 10px;background:transparent;color:#c9c9c9;font:500 11.5px/1.4 system-ui,sans-serif;
        cursor:pointer}
      .ov-menu .mi:hover{background:rgba(255,255,255,.12)}
      .ov-dialog{left:50%;top:50%;transform:translate(-50%,-50%);width:264px}
      .ov-dialog .row{display:flex;gap:8px;margin-top:10px;justify-content:flex-end}
      .ov-dialog select,.ov-dialog input{background:#2f2f2f;border:1px solid #454545;color:#e8e8e8;
        border-radius:5px;padding:5px 7px;font-size:11px}
      .ov-tall{height:120px;overflow:auto;background:#333;border-radius:6px;padding:7px;
        font-size:10.5px;color:#9a9a9a;margin-top:8px}
      .ov-log{margin-top:9px;min-height:54px;font:400 10px/1.7 ui-monospace,Menlo,Consolas,monospace;
        color:#8f8f8f;background:rgba(0,0,0,.22);border-radius:6px;padding:6px 9px}
      .ov-log .ev{color:#e8e8e8}.ov-log .warn{color:#ffb454}.ov-log .ok{color:#6ee29a}
      .ov-hint{font-size:10.5px;color:#8a8a8a;line-height:1.8;margin-top:9px}
      @media (max-width:560px){.ov-dialog{width:220px}}
    </style>`;

    el.insertAdjacentHTML('beforeend', STYLE + `
      <div class="ov" data-root>
        <div class="ov-bar">
          <button class="ov-btn" data-open="menu">打开菜单</button>
          <button class="ov-btn alt" data-open="dialog">打开对话框</button>
          <span class="ov-lb">outsidePressEvent</span>
          <span class="ov-seg" data-seg>
            <button class="on" data-v="pointerdown">pointerdown</button>
            <button data-v="mousedown">mousedown</button>
            <button data-v="click">click</button>
          </span>
          <label class="ov-sw"><input type="checkbox" data-k="lock" checked> lockScroll</label>
          <span class="ov-stat" data-stat>lockCount=<b>0</b> · pad=<b>0px</b></span>
        </div>
        <div class="ov-tall" data-tall>
          页面本身可滚动：打开浮层时 body 锁定（滚动条消失但 padding 补偿，布局不横跳），
          关闭时解锁并 instant 回位。此处放长文本只为让外层页面出现滚动条。<br>
          滚动条宽度 = window.innerWidth - documentElement.clientWidth，锁的瞬间量好补进 body padding。
        </div>
        <!-- 浮层层：各自 fixed inset:0；两个都开时 lockCount=2 -->
        <div class="ov-layer" data-layer="menu">
          <div class="ov-back" data-back></div>
          <div class="ov-panel ov-menu" role="menu">
            <h4>右键菜单</h4>
            <button class="mi" role="menuitem">复制图层</button>
            <button class="mi" role="menuitem">粘贴样式</button>
            <button class="mi" role="menuitem">转为组件</button>
            <button class="mi" role="menuitem" disabled style="opacity:.4">删除（禁用）</button>
          </div>
        </div>
        <div class="ov-layer" data-layer="dialog">
          <div class="ov-back" data-back></div>
          <div class="ov-panel ov-dialog" role="dialog" aria-modal="true" aria-label="导出设置">
            <h4>导出设置</h4>
            <label>格式 <select><option>PNG</option><option>WebP</option></select></label>
            <label style="margin-left:8px">倍率 <input type="text" value="2x" size="3"></label>
            <div class="ov-tall" style="height:66px">从浮层内按住拖到外面松手（click 模式）→ 起点在浮层内，不关。<br>Esc → escape-key；点遮罩/外部 → outside-press；再点触发器 → reference-press。</div>
            <div class="row">
              <button class="ov-btn alt" data-close="cancel">取消</button>
              <button class="ov-btn" data-close="ok">导出</button>
            </div>
          </div>
        </div>
        <div class="ov-log" data-log><span style="color:#7a7a7a">打开菜单/对话框，试 Esc、点外部、点触发器、拖拽进出、开两个嵌套。</span></div>
        <div class="ov-hint">outsidePressEvent 三态：pointerdown（eager，鼠标+触摸按下即关，会打断浮层内起手的拖拽）、mousedown（eager 仅鼠标、触摸 lazy）、click（lazy 等抬手，须护住"起点或终点在浮层内"）。勾 lockScroll 后页面滚动被锁：第一个浮层装锁、最后一个才解锁（lockCount 见状态栏），滚动条宽度补进 body padding 所以布局不横跳；点在滚动条上不算点外面。Esc 在 IME 组词中不关（isComposing）。</div>
      </div>`);

    const stat = el.querySelector('[data-stat]');
    const logBox = el.querySelector('[data-log]');
    const seg = el.querySelector('[data-seg]');
    const layers = {
      menu: el.querySelector('[data-layer="menu"]'),
      dialog: el.querySelector('[data-layer="dialog"]'),
    };
    const triggers = {
      menu: el.querySelector('[data-open="menu"]'),
      dialog: el.querySelector('[data-open="dialog"]'),
    };
    const opts = { lock: true };
    let pressEvent = 'pointerdown';
    const open = { menu: false, dialog: false };
    let startedInside = false, lastReason = '';

    const log = (html, cls) => {
      const line = document.createElement('div');
      line.className = cls || 'ev';
      line.innerHTML = html;
      logBox.prepend(line);
      while (logBox.children.length > 4) logBox.lastChild.remove();
    };

    // ---------- 滚动锁定：模块级计数 + 滚动条补偿 + iOS fixed 技法 ----------
    let lockCount = 0;
    let restore = null;

    function enableScrollLock() {
      const bodyStyle = document.body.style;
      const docEl = document.documentElement;
      const isIOS = /iP(hone|ad|od)|iOS/.test(navigator.platform) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      // RTL：scrollbarX 非 0 → 补左侧
      const scrollbarX = Math.round(docEl.getBoundingClientRect().left) + docEl.scrollLeft;
      const paddingProp = scrollbarX ? 'paddingLeft' : 'paddingRight';
      const scrollbarWidth = window.innerWidth - docEl.clientWidth;
      const scrollX = window.scrollX, scrollY = window.scrollY;
      const prev = {
        overflow: bodyStyle.overflow, pad: bodyStyle[paddingProp],
        position: bodyStyle.position, top: bodyStyle.top, left: bodyStyle.left, right: bodyStyle.right,
      };
      bodyStyle.overflow = 'hidden';
      if (scrollbarWidth) bodyStyle[paddingProp] = scrollbarWidth + 'px';  // 补偿防横跳
      if (isIOS) {
        // iOS 不认 body overflow:hidden → fixed + 负滚动偏移回锚（减 visualViewport 偏移）
        const vv = window.visualViewport;
        const offsetLeft = vv ? vv.offsetLeft : 0, offsetTop = vv ? vv.offsetTop : 0;
        Object.assign(bodyStyle, {
          position: 'fixed',
          top: (-(scrollY - Math.floor(offsetTop))) + 'px',
          left: (-(scrollX - Math.floor(offsetLeft))) + 'px',
          right: '0',
        });
      }
      log('enableScrollLock：pad-' + (paddingProp === 'paddingLeft' ? 'L' : 'R') + '=' +
        scrollbarWidth + 'px · isIOS=' + isIOS + (isIOS ? ' → position:fixed 负偏移' : ''), 'ok');
      return () => {
        Object.assign(bodyStyle, {
          overflow: prev.overflow, [paddingProp]: prev.pad,
          position: prev.position, top: prev.top, left: prev.left, right: prev.right,
        });
        if (isIOS) window.scrollTo({ left: scrollX, top: scrollY, behavior: 'instant' });
      };
    }

    const syncLock = () => {
      // 勾选 lockScroll 时若已有浮层开着 → 补装锁（按当前打开数计数）
      if (opts.lock && lockCount === 0 && anyOpen()) {
        lockCount = openCount();
        restore = enableScrollLock();
        log('lockScroll 开启 → 装锁 lockCount=' + lockCount, 'ok');
      }
      const bodyPad = parseFloat(document.body.style.paddingRight || document.body.style.paddingLeft || 0) || 0;
      stat.innerHTML = 'lockCount=<b>' + lockCount + '</b> · pad=<b>' + bodyPad + 'px</b>' +
        ' · scrollY=<b>' + Math.round(window.scrollY) + '</b>' +
        ' · press=<b class="' + (pressEvent === 'click' ? 'wait' : 'on') + '">' + pressEvent + '</b>' +
        (lastReason ? ' · last=<b>' + lastReason + '</b>' : '');
    };

    const anyOpen = () => open.menu || open.dialog;
    const openCount = () => (open.menu ? 1 : 0) + (open.dialog ? 1 : 0);

    // ---------- 浮层开合 ----------
    function setOpen(name, v, reason) {
      if (open[name] === v) return;
      open[name] = v;
      layers[name].classList.toggle('show', v);
      if (v) {
        // lockCount 逐个递增（与 FloatingOverlay 模块级计数一致）：第一个装锁，后续只计数
        if (opts.lock) {
          lockCount++;
          if (lockCount === 1) {
            restore = enableScrollLock();
            log('lockCount 0→1：装锁（第一个浮层负责）', 'ok');
          } else {
            log('lockCount → ' + lockCount + '（嵌套浮层只计数不重装）', 'warn');
          }
        }
        log('open ' + name, 'ev');
      } else {
        log('close ' + name + ' · reason=<b>' + reason + '</b>', reason === 'outside-press' ? 'warn' : 'ok');
        lastReason = reason;
        if (opts.lock && lockCount > 0) {
          lockCount--;
          if (lockCount === 0) {
            if (restore) restore();
            restore = null;
            log('lockCount →0：最后一个浮层关闭，解除锁定 + instant 回位', 'ok');
          } else {
            log('lockCount 仍为 ' + lockCount + '（还有浮层开着）→ 继续锁', 'warn');
          }
        }
      }
      syncLock();
    }

    const closeAll = (reason) => {
      setOpen('menu', false, reason);
      setOpen('dialog', false, reason);
    };

    // ---------- 关闭语义 ----------
    // Esc：IME 组词中不关
    const onKey = (e) => {
      if (e.key !== 'Escape' || !anyOpen()) return;
      if (e.isComposing) { log('Escape 但 isComposing=true → 取消组词，不关浮层', 'warn'); return; }
      closeAll('escape-key');
    };
    document.addEventListener('keydown', onKey);

    // eager：pointerdown / mousedown 按下即判
    const onEagerDown = (e) => {
      if (!anyOpen() || pressEvent === 'click') return;
      if (pressEvent === 'mousedown' && e.pointerType !== 'mouse' && e.type === 'pointerdown') return;
      const target = e.target;
      for (const name in open) {
        if (!open[name]) continue;
        if (layers[name].contains(target)) { startedInside = true; return; }  // 浮层内按下：不算 outside
        if (triggers[name].contains(target)) return;                          // 触发器单独处理 reference-press
      }
      if (!el.contains(target) && !target.closest('.ov-layer')) {
        closeAll('outside-press');
        log('eager ' + pressEvent + ' → 按下即关（reason=outside-press）', 'warn');
      }
    };
    document.addEventListener('pointerdown', onEagerDown, true);

    // lazy：click 抬手才判，护住"起点或终点在浮层内"
    const onClick = (e) => {
      const target = e.target;
      // 点触发器 → reference-press（主动收起 ≠ 误触外部）
      for (const name in open) {
        if (open[name] && triggers[name].contains(target)) {
          setOpen(name, false, 'reference-press');
          return;
        }
      }
      if (!anyOpen()) return;
      // 滚动条点击不算点外面
      if (target === document.documentElement) {
        log('点在滚动条上 → 不算 outside，不关', 'ok');
        return;
      }
      for (const name in open) {
        if (open[name] && layers[name].contains(target)) return;   // 终点在浮层内
      }
      if (pressEvent === 'click' && startedInside) {
        log('lazy click：起点在浮层内（拖拽进出）→ 不关', 'ok');    // 起点或终点任一在内即保护
        startedInside = false;
        return;
      }
      startedInside = false;
      if (pressEvent !== 'click') return;                          // eager 模式已在 pointerdown 处理
      if (!el.contains(target) && !target.closest('.ov-layer')) {
        closeAll('outside-press');
        log('lazy click → 抬手时在外部（reason=outside-press）', 'warn');
      }
    };
    document.addEventListener('click', onClick, true);

    // 浮层内按下（起点记录，供 lazy 拖拽保护）
    const onDownInside = (e) => {
      if (e.target.closest('.ov-layer')) startedInside = true;
    };
    document.addEventListener('pointerdown', onDownInside, true);

    // ---------- 控件 ----------
    el.querySelector('[data-open="menu"]').addEventListener('click', () => {
      setOpen('dialog', false, 'reference-press');
      setOpen('menu', !open.menu, open.menu ? 'reference-press' : 'open');
      if (open.menu) log('open menu' + (opts.lock ? ' · lockCount=' + lockCount : ' · 无锁'), 'ev');
    });
    el.querySelector('[data-open="dialog"]').addEventListener('click', () => {
      const was = open.dialog;
      setOpen('dialog', !was, was ? 'reference-press' : 'open');
      if (!was && open.menu) log('嵌套：两个浮层同开 → lockCount=2，关掉一个不解锁', 'warn');
      if (!was) log('open dialog' + (opts.lock ? ' · lockCount=' + lockCount : ' · 无锁'), 'ev');
    });
    el.querySelectorAll('[data-close]').forEach((b) =>
      b.addEventListener('click', () => setOpen('dialog', false, 'button-' + b.dataset.close)));
    el.querySelectorAll('[data-back]').forEach((b) =>
      b.addEventListener('click', () => {
        const layer = b.closest('.ov-layer');
        for (const name in layers) if (layers[name] === layer) setOpen(name, false, 'outside-press');
        log('点遮罩（backdrop）→ outside-press', 'warn');
      }));

    const onSeg = (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;
      for (const x of e.currentTarget.children) x.classList.toggle('on', x === btn);
      pressEvent = btn.dataset.v;
      const lazy = pressEvent === 'click';
      log('outsidePressEvent=' + pressEvent + ' → ' +
        (pressEvent === 'pointerdown' ? 'eager（鼠标+触摸按下即关）'
          : pressEvent === 'mousedown' ? 'eager 仅鼠标、触摸 lazy' : 'lazy（等抬手，护拖拽）'),
        lazy ? 'ok' : 'warn');
      syncLock();
    };
    seg.addEventListener('click', onSeg);

    const onOpt = (e) => {
      opts[e.target.dataset.k] = e.target.checked;
      if (!opts.lock && lockCount > 0) {
        lockCount = 0;
        if (restore) restore();
        restore = null;
        log('lockScroll 关闭 → 立即解除锁定', 'warn');
      }
      syncLock();
    };
    el.querySelectorAll('[data-k]').forEach((cb) => cb.addEventListener('change', onOpt));

    const onWinScroll = () => { if (lockCount === 0) syncLock(); };
    window.addEventListener('scroll', onWinScroll, { passive: true });
    window.addEventListener('resize', onWinScroll);

    syncLock();

    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onEagerDown, true);
      document.removeEventListener('click', onClick, true);
      document.removeEventListener('pointerdown', onDownInside, true);
      seg.removeEventListener('click', onSeg);
      el.querySelectorAll('[data-k]').forEach((cb) => cb.removeEventListener('change', onOpt));
      window.removeEventListener('scroll', onWinScroll);
      window.removeEventListener('resize', onWinScroll);
      // 离场必解锁，否则页面滚不动
      if (lockCount > 0 && restore) restore();
      lockCount = 0;
      restore = null;
      el.innerHTML = '';
    };
  }
};
