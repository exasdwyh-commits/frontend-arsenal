export default {
  id: 'focus-trap', group: 'feedback', name: '浮层焦点管理',
  lib: 'Floating UI',
  desc: '模态浮层里的焦点只进不出：打开时焦点进浮层（guards 用 contains 自己判断而不是捕获标记，避免嵌套浮层互相打架），Tab 在浮层内循环（首尾哨兵接住越界），关闭时 returnFocus 归还给打开前的元素；浮层没有可聚焦项时焦点落容器本身，配合 visuallyHiddenDismiss 让读屏器能走到关闭按钮。机制提炼自 floating-ui（MIT）公开文档 FloatingFocusManager，原生 JS 独立实现，带哨兵循环与归还演示。',

  deps: '无',
  note: '七个坑：① guards 判定"焦点是否在浮层内"要用 contains(浮层) 而不是布尔标记位——嵌套两个浮层时，外层的标记会被内层的开合重置，焦点在内层却被外层判成"跑到外面去了"而错误归还；② returnFocus 必须存"打开前真正持有焦点的元素"而不是随手存触发按钮；但它为 body/已卸载时不能去 focus 已 display:none 的浮层容器——隐藏后再 focus 会静默失败、焦点掉回 body，要回退到永远可见的触发按钮（对齐 FloatingUI 默认归还 reference）；③ 首个可聚焦项的默认聚焦是 afterNextPaint（下一帧）而非同步——同步 focus 会让浏览器把滚动位置一起拽过去，浮层刚出现就被 scrollIntoView 顶一截；④ 浮层内没有任何可聚焦项时焦点必须落浮层容器（tabindex=-1），否则焦点留在背后页面，Tab 第一下就穿帮；⑤ 禁止用 inert/aria-hidden 之外的方式"藏"背景——但 inert 会连带把浮层也 inert 掉（浮层常挂在 body 下），背景和浮层必须分开标记；⑥ VisuallyHidden 的关闭按钮要留在 DOM 里：读屏器靠它退出，display:none 会让读屏器认为这个对话框没有出口；⑦ 兄弟浮层各自的 Escape 处理器不能 stopPropagation——同节点后续监听器会被整段挡掉，同一页面的其他浮层就收不到关闭信号。',

  scenes: { places: ['面板', '对话框', '专业工具'], goals: ['操作反馈', '风格统一'], triggers: ['键盘'], projects: ['通用', '设计系统', '专业工具'] },
  code: `/* 焦点只进不出（提炼自 floating-ui docs，vanilla 复刻） */
// guards：焦点是否在浮层内 —— 用 contains，不用布尔标记（嵌套安全）
const inside = (el) => !el || floating.contains(el) || floating === el;
// 打开：存"打开前真正持有焦点的元素"（可能是 body），afterNextPaint 再聚焦
const returnFocus = document.activeElement;
requestAnimationFrame(() => (autoFocusTarget || floating).focus());
// Tab 循环：首尾哨兵接住越界，或在 keydown 里自行 wrap
onTab(e => {
  const f = focusables();               // 浮层内可聚焦项（跳过 disabled/aria-hidden）
  if (!f.length) { floating.focus(); return; }  // 无可聚焦项 → 焦点落容器
  const first = f[0], last = f[f.length - 1];
  if (!inside(e.shiftKey ? last : first)) { /* 嵌套让位 */ return; }
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
});
// 关闭：returnFocus 归还（body 则回退容器），期间焦点不外泄
function close() { returnFocus ? returnFocus.focus() : floating.focus(); }
// 读屏器出口：visuallyHidden 关闭按钮留在 DOM（display:none = 没有出口）`,

  init(el) {
    const STYLE = `<style data-fx="focus-trap">
      .ft{width:100%;box-sizing:border-box;background:#2b2b2b;padding:14px;
        font-family:system-ui,-apple-system,"Segoe UI",sans-serif;color:#d8d8d8}
      .ft-bar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:10px}
      .ft-lb{font-size:10px;letter-spacing:.06em;text-transform:uppercase;color:#9a9a9a}
      .ft-btn{border:0;border-radius:6px;padding:8px 14px;cursor:pointer;
        font:600 11.5px/1 system-ui,sans-serif;background:#5F3BFF;color:#fff;
        box-shadow:inset 0 1px 0 rgba(255,255,255,.3)}
      .ft-btn.alt{background:rgba(255,255,255,.14);color:#d8d8d8}
      .ft-sw{display:flex;align-items:center;gap:5px;font-size:11px;color:#b6b6b6;cursor:pointer}
      .ft-sw input{accent-color:#5F3BFF}
      .ft-stat{margin-left:auto;font:500 10px/1.6 ui-monospace,Menlo,Consolas,monospace;color:#8f8f8f;
        background:rgba(0,0,0,.22);border-radius:5px;padding:5px 9px}
      .ft-stat b{color:#e8e8e8;font-weight:500}
      .ft-stat .in{color:#6ee29a}.ft-stat .out{color:#ffb454}
      /* ---- 舞台：背景有一排可聚焦项，浮层盖在上面 ---- */
      .ft-stage{position:relative;border-radius:8px;background:#414141;padding:14px;
        box-shadow:inset 0 0 0 1px rgba(0,0,0,.3)}
      .ft-bg{display:flex;gap:7px;flex-wrap:wrap}
      .ft-bg button{border:0;border-radius:5px;padding:7px 11px;cursor:pointer;
        font:500 11px/1 system-ui,sans-serif;background:rgba(255,255,255,.1);color:#b0b0b0}
      .ft-layer{position:absolute;inset:0;z-index:5;display:none;border-radius:8px;
        background:rgba(0,0,0,.5);padding:14px}
      .ft-layer.show{display:flex;align-items:center;justify-content:center}
      .ft-dlg{position:relative;background:#1d1d1d;border-radius:9px;padding:16px 17px;width:250px;
        box-shadow:0 14px 36px rgba(0,0,0,.55),inset 0 0 0 1px rgba(255,255,255,.11)}
      .ft-dlg h4{margin:0 0 4px;font-size:13px;color:#fff}
      .ft-dlg p{margin:0 0 11px;font-size:10.5px;color:#9a9a9a;line-height:1.7}
      .ft-dlg input{width:100%;box-sizing:border-box;background:#2f2f2f;border:1px solid #454545;
        color:#e8e8e8;border-radius:5px;padding:6px 9px;font-size:11.5px;margin-bottom:9px}
      .ft-dlg input:focus{outline:none;border-color:#5F3BFF}
      .ft-row{display:flex;gap:8px;justify-content:flex-end}
      .ft-row button{border:0;border-radius:5px;padding:7px 13px;cursor:pointer;
        font:600 11px/1 system-ui,sans-serif}
      .ft-row .primary{background:#5F3BFF;color:#fff}
      .ft-row .ghost{background:rgba(255,255,255,.13);color:#c9c9c9}
      /* 哨兵：不可见但可聚焦，接住 Tab 越界 */
      .ft-sentinel{position:absolute;width:1px;height:1px;opacity:0;pointer-events:none}
      /* 读屏器出口：留在 DOM，视觉隐藏（display:none = 读屏器没有出口） */
      .ft-vh{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);
        white-space:nowrap;border:0;padding:0;margin:-1px}
      .ft-vh:focus{position:static;width:auto;height:auto;clip:auto;overflow:visible;
        background:#5F3BFF;color:#fff;padding:4px 9px;border-radius:5px;z-index:6}
      .ft-log{margin-top:9px;min-height:54px;font:400 10px/1.7 ui-monospace,Menlo,Consolas,monospace;
        color:#8f8f8f;background:rgba(0,0,0,.22);border-radius:6px;padding:6px 9px}
      .ft-log .ev{color:#e8e8e8}.ft-log .warn{color:#ffb454}.ft-log .ok{color:#6ee29a}
      .ft-hint{font-size:10.5px;color:#8a8a8a;line-height:1.8;margin-top:9px}
    </style>`;

    el.insertAdjacentHTML('beforeend', STYLE + `
      <div class="ft" data-root>
        <div class="ft-bar">
          <button class="ft-btn" data-open>打开模态浮层</button>
          <label class="ft-sw"><input type="checkbox" data-k="inert" checked> inert 背景</label>
          <label class="ft-sw"><input type="checkbox" data-k="empty"> 空焦点项模式</label>
          <label class="ft-sw"><input type="checkbox" data-k="blur"> 打开前 blur 到 body</label>
          <span class="ft-stat" data-stat>focus=<b>—</b> · guards=<b>—</b></span>
        </div>
        <div class="ft-stage" data-stage>
          <div class="ft-bg" data-bg>
            <button>背景按钮 A</button><button>背景按钮 B</button><button>背景按钮 C</button>
            <button>背景按钮 D</button>
          </div>
          <div class="ft-layer" data-layer>
            <div class="ft-dlg" data-dlg role="dialog" aria-modal="true" aria-label="重命名图层" tabindex="-1">
              <button class="ft-sentinel" data-s="first" tabindex="0" aria-hidden="true"></button>
              <h4>重命名图层</h4>
              <p>Tab 只在浮层内循环；关闭时焦点归还给打开它的按钮。</p>
              <div data-form>
                <input type="text" value="Group 12" aria-label="图层名称">
                <div class="ft-row">
                  <button class="ghost" data-close>取消</button>
                  <button class="primary" data-close>保存</button>
                </div>
              </div>
              <button class="ft-vh" data-close>关闭对话框（读屏器出口）</button>
              <button class="ft-sentinel" data-s="last" tabindex="0" aria-hidden="true"></button>
            </div>
          </div>
        </div>
        <div class="ft-log" data-log><span style="color:#7a7a7a">打开浮层 → Tab/Shift+Tab 看循环与 guards；Esc 或取消看焦点归还。</span></div>
        <div class="ft-hint">打开时焦点在下一帧进浮层首项（afterNextPaint，不触发滚动顶格）；Tab 到末项再按 Tab 循环回首项，Shift+Tab 反向同理（哨兵 + keydown 双保险）。guards 用 contains 判定，焦点被浏览器/扩展拽到浮层外会被抓回来并记日志。inert 背景：打开期间背景按钮全部不可达（inert + aria-hidden）。空焦点项模式：焦点落浮层容器（tabindex=-1），Tab 不外泄但读屏器失去出口——visuallyHidden 按钮被隐藏的反例。勾"blur 到 body"演示 returnFocus 兜底：归还目标是 body 时回退到触发按钮（FloatingUI 默认归还 reference），不让焦点凭空消失。</div>
      </div>`);

    const stat = el.querySelector('[data-stat]');
    const logBox = el.querySelector('[data-log]');
    const layer = el.querySelector('[data-layer]');
    const dlg = el.querySelector('[data-dlg]');
    const bg = el.querySelector('[data-bg]');
    const form = el.querySelector('[data-form]');
    const vhBtn = el.querySelector('.ft-vh');
    const opener = el.querySelector('[data-open]');
    const opts = { inert: true, empty: false, blur: false };
    let isOpen = false, returnFocus = null;

    const log = (html, cls) => {
      const line = document.createElement('div');
      line.className = cls || 'ev';
      line.innerHTML = html;
      logBox.prepend(line);
      while (logBox.children.length > 4) logBox.lastChild.remove();
    };
    const nameOf = (e) => {
      if (!e || e === document.body) return 'body';
      if (e === dlg) return '浮层容器';
      return (e.textContent || e.tagName || '?').trim().slice(0, 16) || e.tagName;
    };
    const syncStat = (note) => {
      const ae = document.activeElement;
      const inDlg = dlg.contains(ae) || ae === dlg;
      stat.innerHTML = 'focus=<b class="' + (inDlg ? 'in' : 'out') + '">' + nameOf(ae) + '</b>' +
        ' · guards=<b>' + (isOpen ? (inDlg ? 'inside' : 'CAUGHT') : '—') + '</b>' +
        (note ? ' · <b>' + note + '</b>' : '');
    };

    const focusables = () => {
      if (opts.empty) return [];
      return Array.from(dlg.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), select, textarea, [href], [tabindex]:not([tabindex="-1"])'
      )).filter((n) => n.offsetParent !== null || n.classList.contains('ft-sentinel'));
    };

    // ---------- 打开：存归还目标 → 下一帧聚焦 ----------
    function openDlg() {
      if (isOpen) return;
      returnFocus = document.activeElement;          // 真正持有焦点的元素（可能是 body）
      if (opts.blur) { document.activeElement.blur(); returnFocus = document.body; }
      log('open · returnFocus 存为 <b>' + nameOf(returnFocus) + '</b>', 'ev');
      isOpen = true;
      layer.classList.add('show');
      form.style.display = opts.empty ? 'none' : '';
      vhBtn.style.display = opts.empty ? 'none' : '';   // 空模式连读屏出口也藏 → 反例
      if (opts.inert) {
        bg.setAttribute('inert', '');
        bg.setAttribute('aria-hidden', 'true');
        log('背景 inert + aria-hidden → 只剩浮层可达', 'ok');
      }
      // afterNextPaint：下一帧再聚焦，避免同步 focus 把滚动拽过去
      requestAnimationFrame(() => {
        if (!isOpen) return;
        const f = focusables();
        if (f.length) {
          f[0].focus({ preventScroll: true });
          log('initialFocus → 第一个可聚焦项「' + nameOf(f[0]) + '」', 'ok');
        } else {
          dlg.focus({ preventScroll: true });        // 无可聚焦项 → 焦点落容器
          log('无内部可聚焦项 → 焦点落浮层容器（tabindex=-1），Tab 不外泄；但读屏器没有出口', 'warn');
        }
        syncStat();
      });
      setTimeout(() => syncStat(), 0);
    }

    function closeDlg(reason) {
      if (!isOpen) return;
      isOpen = false;
      layer.classList.remove('show');
      if (opts.inert) { bg.removeAttribute('inert'); bg.removeAttribute('aria-hidden'); }
      log('close · reason=' + reason, 'ok');
      // returnFocus 同步归还（关闭不需要 afterNextPaint）
      // body/已卸载 → 兜底聚焦触发按钮：对齐 FloatingUI 默认归还 reference，
      // 且触发按钮永远可见——先 hide 再 focus 不可见容器会静默失败、焦点掉回 body
      if (returnFocus && returnFocus !== document.body && document.contains(returnFocus)) {
        returnFocus.focus({ preventScroll: true });
        log('returnFocus → ' + nameOf(returnFocus), 'ok');
      } else {
        opener.focus({ preventScroll: true });
        log('returnFocus 是 body/已卸载 → 兜底聚焦触发按钮（FloatingUI 默认归还 reference）', 'warn');
      }
      returnFocus = null;
      layer.classList.remove('show');
      syncStat();
    }

    // ---------- Tab 循环 + guards ----------
    const onKey = (e) => {
      if (!isOpen) return;
      const ae = document.activeElement;
      // guards：焦点被拽到浮层外 → 抓回来（contains 判定，嵌套安全）
      if (!dlg.contains(ae) && ae !== dlg && !el.contains(ae)) {
        const f = focusables();
        (f[0] || dlg).focus({ preventScroll: true });
        log('guards：焦点跑到浮层外（' + nameOf(ae) + '）→ 抓回', 'warn');
        return;
      }
      // 不 stopPropagation：本效果与其他浮层是兄弟关系，各自独立响应 Escape
      if (e.key === 'Escape') { closeDlg('escape-key'); return; }
      if (e.key !== 'Tab') return;
      const f = focusables();
      if (!f.length) { e.preventDefault(); dlg.focus({ preventScroll: true }); return; }
      const first = f[0], last = f[f.length - 1];
      if (!e.shiftKey && (ae === last || ae === dlg)) {
        e.preventDefault();
        first.focus({ preventScroll: true });
        log('Tab 在末项 → 循环回首项「' + nameOf(first) + '」', 'ok');
      } else if (e.shiftKey && (ae === first || ae === dlg)) {
        e.preventDefault();
        last.focus({ preventScroll: true });
        log('Shift+Tab 在首项 → 循环至末项「' + nameOf(last) + '」', 'ok');
      }
      setTimeout(() => syncStat(), 0);
    };
    document.addEventListener('keydown', onKey, true);

    const onFocusIn = (e) => {
      if (!isOpen) return;
      if (!dlg.contains(e.target) && e.target !== dlg && !el.contains(e.target)) {
        const f = focusables();
        (f[0] || dlg).focus({ preventScroll: true });
        log('focusin guards：外部焦点（' + nameOf(e.target) + '）→ 抓回浮层', 'warn');
      }
      syncStat();
    };
    document.addEventListener('focusin', onFocusIn, true);

    // ---------- 控件 ----------
    opener.addEventListener('click', openDlg);
    el.querySelectorAll('[data-close]').forEach((b) =>
      b.addEventListener('click', () => closeDlg('button-' + b.textContent.trim().slice(0, 4))));

    const onOpt = (e) => {
      const k = e.target.dataset.k;
      opts[k] = e.target.checked;
      if (k === 'empty') log('空焦点项模式=' + opts.empty + (opts.empty ? '（焦点落容器，读屏出口一并隐藏=反例）' : ''), opts.empty ? 'warn' : 'ev');
      if (k === 'blur') log('打开前 blur 到 body=' + opts.blur + '（returnFocus 兜底演示）', 'ev');
      if (k === 'inert' && isOpen) {
        if (opts.inert) { bg.setAttribute('inert', ''); bg.setAttribute('aria-hidden', 'true'); }
        else { bg.removeAttribute('inert'); bg.removeAttribute('aria-hidden'); }
      }
    };
    el.querySelectorAll('[data-k]').forEach((cb) => cb.addEventListener('change', onOpt));

    syncStat();

    return () => {
      document.removeEventListener('keydown', onKey, true);
      document.removeEventListener('focusin', onFocusIn, true);
      el.querySelectorAll('[data-k]').forEach((cb) => cb.removeEventListener('change', onOpt));
      if (opts.inert) { bg.removeAttribute('inert'); bg.removeAttribute('aria-hidden'); }
      el.innerHTML = '';
    };
  }
};
