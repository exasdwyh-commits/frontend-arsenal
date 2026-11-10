export default {
  id: 'tooltip-delay-group', group: 'entrance', name: '延迟组防抖浮层',
  lib: 'Floating UI',
  desc: '一组浮层共享一个延迟状态机：首次悬停等 1000ms 才开（不打扰），组内第二个浮层若在延迟期内或已打开期间被触发则进"即时相位"——1ms 开、0 关，鼠标在同组按钮间滑动零等待；任一浮层关闭后起 250ms 复位窗，窗内再触发仍即时，出窗才回到 1000ms 首开延迟。机制提炼自 floating-ui（MIT）公开文档 FloatingDelayGroup/useTransition，原生 JS 独立实现，带状态机日志与复位窗倒计时。',
  deps: '无',
  note: '六个坑：① 即时相位只在"组内已有浮层处于打开或延迟中"时生效——组的成员资格要显式共享（同一个 context），各自为政的 tooltip 永远走 1000ms 首开，划过一排图标就是一串卡顿；② 复位窗（250ms）必须在"最后一个浮层真关闭"时才起算——组内还有任何一个开着都不能复位，否则快速横穿一排按钮时状态机反复在即时/延迟间抖动；横穿切换是同一事件里先关后开、瞬时计数会短暂归零，必须区分"真关闭"与"同帧将要打开的切换"，否则每次横穿都误进复位窗；③ 状态循环是 unmounted→initial→open→closing→unmounted 四态，closing 期间浮层仍在 DOM 里做退场动画——若在 closing 直接 display:none，250ms 复位窗和退场动画会被一起截断；④ 用 transform 包一层做位移动画，浮层本体只改 opacity/transform，避免定位元素动画触发祖先滚动监听的重算风暴；⑤ 延迟期内鼠标移出必须取消计时（clearTimeout），否则人已走开浮层还弹出来；⑥ 延迟是组级单时钟，不是每个浮层各持一个 timer——各持 timer 的实现会在横穿时叠加出多个未取消的首开计时器。',

  scenes: { places: ['面板', '官网', '专业工具'], goals: ['操作反馈', '风格统一'], triggers: ['悬停'], projects: ['通用', '设计系统', '专业工具'] },
  code: `/* 组级延迟状态机（提炼自 floating-ui docs，vanilla 复刻） */
// 四态：unmounted → initial(首开延迟中) → open → closing(复位窗) → unmounted
const group = {
  delay: 1000,        // 首开延迟（组内无任何浮层时）
  instant: 1,         // 即时相位延迟（组内已有浮层打开/延迟中）
  closeDelay: 250,    // 最后一个关闭后的复位窗
  hasFloating: false, // 组内是否有浮层处于 open 或延迟中
};
function hoverIn(cb) {
  const d = group.hasFloating ? group.instant : group.delay;
  timer = setTimeout(cb, d);          // 延迟期内移出 → clearTimeout，绝不能漏
}
function hoverOut(close) {
  clearTimeout(timer);                // 人已走开：取消首开计时
  close();
  if (!anyOpenInGroup()) startResetWindow(250);  // 最后一个关 → 起复位窗
}
// 复位窗内 hasFloating 保持 true → 后续悬停仍即时；出窗才回 1000ms
// 浮层本体用 opacity + transform 过渡（duration 250），不碰 top/left 定位属性`,

  init(el) {
    const STYLE = `<style data-fx="tooltip-delay-group">
      .td{width:100%;box-sizing:border-box;background:#2b2b2b;padding:14px;
        font-family:system-ui,-apple-system,"Segoe UI",sans-serif;color:#d8d8d8}
      .td-bar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:10px}
      .td-lb{font-size:10px;letter-spacing:.06em;text-transform:uppercase;color:#9a9a9a}
      .td-sw{display:flex;align-items:center;gap:5px;font-size:11px;color:#b6b6b6;cursor:pointer}
      .td-sw input{accent-color:#5F3BFF}
      .td-stat{margin-left:auto;font:500 10px/1.6 ui-monospace,Menlo,Consolas,monospace;color:#8f8f8f;
        background:rgba(0,0,0,.22);border-radius:5px;padding:5px 9px}
      .td-stat b{color:#e8e8e8;font-weight:500}
      .td-stat .inst{color:#6ee29a}.td-stat .wait{color:#ffb454}
      /* ---- 工具栏：一排按钮共享同一个延迟组 ---- */
      .td-stage{position:relative;height:170px;border-radius:8px;background:#414141;
        box-shadow:inset 0 0 0 1px rgba(0,0,0,.3);display:flex;align-items:center;
        justify-content:center;gap:14px;padding:0 12px}
      .td-btn{position:relative;width:46px;height:46px;border:0;border-radius:9px;cursor:pointer;
        background:rgba(255,255,255,.1);color:#c9c9c9;font-size:19px;
        box-shadow:inset 0 1px 0 rgba(255,255,255,.14);transition:background .15s,transform .15s}
      .td-btn:hover{background:rgba(255,255,255,.18)}
      .td-btn.on{background:#5F3BFF;color:#fff}
      .td-btn .tip{
        position:absolute;bottom:calc(100% + 10px);left:50%;z-index:3;
        /* 初始定位三件套：absolute + max-content + top/left 归零，测量不抖 */
        transform:translate(-50%,6px) scale(.96);width:max-content;max-width:200px;box-sizing:border-box;
        background:#1d1d1d;border-radius:6px;padding:6px 10px;pointer-events:none;
        font:500 11px/1.5 system-ui,sans-serif;color:#fff;opacity:0;
        box-shadow:0 8px 22px rgba(0,0,0,.5),inset 0 0 0 1px rgba(255,255,255,.1);
        transition:opacity 250ms ease,transform 250ms ease}
      .td-btn .tip.show{opacity:1;transform:translate(-50%,0) scale(1)}
      .td-btn .tip::after{content:"";position:absolute;top:100%;left:50%;margin-left:-5px;
        border:5px solid transparent;border-top-color:#1d1d1d}
      /* 即时相位：0ms 开（靠 hasFloating 分支选 1ms），动画仍然 250ms */
      .td-btn .tip.fast{transition-duration:120ms}
      /* ---- 状态机可视化 ---- */
      .td-fsm{display:flex;align-items:center;gap:6px;margin-top:11px;flex-wrap:wrap}
      .td-node{padding:5px 11px;border-radius:5px;font:500 10px/1 ui-monospace,Menlo,Consolas,monospace;
        background:rgba(255,255,255,.08);color:#8a8a8a;box-shadow:inset 0 0 0 1px rgba(0,0,0,.25)}
      .td-node.on{background:#5F3BFF;color:#fff}
      .td-node.win{background:#3a2f66;color:#c9b8ff}
      .td-arrow{color:#6a6a6a;font-size:11px}
      .td-bar2{height:4px;border-radius:3px;background:rgba(255,255,255,.12);overflow:hidden;
        margin-top:9px;position:relative}
      .td-bar2 i{position:absolute;left:0;top:0;height:100%;width:0;background:#ffb454}
      .td-log{margin-top:9px;min-height:54px;font:400 10px/1.7 ui-monospace,Menlo,Consolas,monospace;
        color:#8f8f8f;background:rgba(0,0,0,.22);border-radius:6px;padding:6px 9px}
      .td-log .ev{color:#e8e8e8}.td-log .warn{color:#ffb454}.td-log .ok{color:#6ee29a}
      .td-hint{font-size:10.5px;color:#8a8a8a;line-height:1.8;margin-top:9px}
    </style>`;

    const BTN = [
      { i: '📄', t: '导出为 PDF' }, { i: '✂️', t: '裁切选区' }, { i: '🔄', t: '旋转 90°' },
      { i: '📐', t: '标尺与网格' }, { i: '🎨', t: '取色器' }, { i: '🔒', t: '锁定图层' },
      { i: '🗑️', t: '移入回收站' },
    ];

    el.insertAdjacentHTML('beforeend', STYLE + `
      <div class="td" data-root>
        <div class="td-bar">
          <span class="ln-lb td-lb">组延迟</span>
          <span class="td-stat" data-stat>state=<b>unmounted</b> · phase=<b>—</b></span>
          <label class="td-sw"><input type="checkbox" data-k="group" checked> 延迟组共享</label>
          <label class="td-sw"><input type="checkbox" data-k="instant" checked> 即时相位(1ms)</label>
        </div>
        <div class="td-stage" data-stage>
          ${BTN.map((b, i) => `
            <button class="td-btn" data-i="${i}" tabindex="0" aria-describedby="td-tip${i}">
              ${b.i}<span class="tip" id="td-tip${i}" role="tooltip">${b.t}</span>
            </button>`).join('')}
        </div>
        <div class="td-fsm">
          <span class="td-node" data-s="unmounted">unmounted</span><span class="td-arrow">→</span>
          <span class="td-node" data-s="initial">initial(延迟中)</span><span class="td-arrow">→</span>
          <span class="td-node" data-s="open">open</span><span class="td-arrow">→</span>
          <span class="td-node" data-s="closing">closing(复位窗)</span>
          <span class="td-arrow">↺</span>
        </div>
        <div class="td-bar2"><i data-count></i></div>
        <div class="td-log" data-log><span style="color:#7a7a7a">先悬停第一个按钮（等 1000ms），再横穿整排——组内即时相位 1ms 开。</span></div>
        <div class="td-hint">组级单时钟：组内无浮层 → 首开延迟 1000ms（橙色等待）；一旦有浮层处于 open 或延迟中，后续悬停进即时相位（1ms，绿色），横穿整排零等待。任一浮层关闭且组内全关 → 起 250ms 复位窗（窗口期内仍即时），出窗才回 1000ms。关"延迟组共享"可对比：每个按钮各自为政，横穿时每次都等满 1000ms。</div>
      </div>`);

    const stage = el.querySelector('[data-stage]');
    const stat = el.querySelector('[data-stat]');
    const logBox = el.querySelector('[data-log]');
    const countBar = el.querySelector('[data-count]');
    const nodes = {};
    el.querySelectorAll('.td-node').forEach((n) => (nodes[n.dataset.s] = n));
    const btns = Array.from(el.querySelectorAll('.td-btn'));
    const opts = { group: true, instant: true };

    // ---- 组级状态机 ----
    const DELAY = 1000, INSTANT = 1, RESET = 250;
    let state = 'unmounted';       // unmounted | initial | open | closing
    let hasFloating = false;       // 组内有浮层 open 或延迟中
    let openCount = 0, resetLeft = 0;
    let hoverTimer = 0, resetTimer = 0, countTimer = 0;
    let curBtn = null, curTip = null;

    const log = (html, cls) => {
      const line = document.createElement('div');
      line.className = cls || 'ev';
      line.innerHTML = html;
      logBox.prepend(line);
      while (logBox.children.length > 4) logBox.lastChild.remove();
    };
    const setState = (s, phase) => {
      state = s;
      for (const k in nodes) nodes[k].classList.toggle('on', k === s);
      nodes.closing.classList.toggle('win', s === 'closing');
      stat.innerHTML = 'state=<b>' + s + '</b> · phase=<b class="' +
        (phase === 'instant' ? 'inst' : phase === 'wait' ? 'wait' : '') + '">' +
        (phase || '—') + '</b> · open=<b>' + openCount + '</b>';
    };

    const closeTip = (btn, tip, why, willOpen) => {
      if (!tip) return;
      tip.classList.remove('show', 'fast');
      btn.classList.remove('on');
      openCount = Math.max(0, openCount - 1);
      if (openCount === 0) {
        if (willOpen) {
          // 同帧切换到组内另一个浮层：不进复位窗（组内切换不复位，否则状态机抖动）
          log(why + ' → 组内切换：复位窗不启动', 'ok');
        } else {
          // 最后一个真关闭 → 起 250ms 复位窗（窗内 hasFloating 保持 true）
          hasFloating = true;
          setState('closing', 'instant');
          log(why + ' → 组内全关，复位窗 ' + RESET + 'ms 起算', 'warn');
          startReset();
        }
      } else {
        setState('open', 'instant');
      }
    };

    const startReset = () => {
      clearInterval(resetTimer);
      resetLeft = RESET;
      countBar.style.width = '100%';
      countBar.style.background = '#5F3BFF';
      resetTimer = setInterval(() => {
        resetLeft -= 10;
        countBar.style.width = Math.max(0, (resetLeft / RESET) * 100) + '%';
        if (resetLeft <= 0) {
          clearInterval(resetTimer);
          countBar.style.width = '0%';
          if (openCount === 0) {
            hasFloating = false;
            setState('unmounted', '—');
            log('复位窗到期 → 回到首开延迟 ' + DELAY + 'ms', 'ok');
          }
        }
      }, 10);
    };

    const openTip = (btn, tip) => {
      curBtn = btn; curTip = tip;
      clearInterval(resetTimer);          // 新浮层已开：复位窗作废（出窗判断由 openCount 兜底）
      const instant = opts.group && opts.instant && hasFloating;
      const d = instant ? INSTANT : DELAY;
      hasFloating = true;            // 延迟一开始就算组内有浮层（initial 态）
      setState('initial', instant ? 'instant' : 'wait');
      countBar.style.background = instant ? '#6ee29a' : '#ffb454';
      if (!instant) {
        countBar.style.transition = 'none';
        countBar.style.width = '100%';
        requestAnimationFrame(() => {
          countBar.style.transition = 'width ' + DELAY + 'ms linear';
          countBar.style.width = '0%';
        });
      } else {
        countBar.style.transition = 'none';
        countBar.style.width = '0%';
      }
      log('hoverIn → 延迟 ' + d + 'ms（' + (instant ? '即时相位' : '首开') + '）' +
        (instant ? '' : ' · hasFloating=false'), instant ? 'ok' : 'warn');
      hoverTimer = setTimeout(() => {
        tip.classList.add('show');
        if (instant) tip.classList.add('fast');
        btn.classList.add('on');
        openCount++;
        setState('open', instant ? 'instant' : 'wait');
        countBar.style.transition = 'none';
        countBar.style.width = '0%';
        log('open「' + tip.textContent + '」', 'ok');
      }, d);
    };

    // ---- 事件 ----
    const onOver = (e) => {
      const btn = e.target.closest('.td-btn');
      if (!btn || btn === curBtn) return;
      // 横穿到新按钮：先关旧的，同帧要开新的 → willOpen，不进复位窗
      if (curTip) closeTip(curBtn, curTip, 'switch', true);
      openTip(btn, btn.querySelector('.tip'));
    };
    const onLeaveStage = (e) => {
      if (e.relatedTarget && stage.contains(e.relatedTarget)) return;
      clearTimeout(hoverTimer);      // 人已走开：取消首开计时，浮层绝不弹出
      if (curTip) closeTip(curBtn, curTip, 'pointerLeave', false);
      curBtn = curTip = null;
    };
    stage.addEventListener('pointerover', onOver);
    stage.addEventListener('pointerleave', onLeaveStage);

    const onFocus = (e) => {
      const btn = e.target.closest('.td-btn');
      if (!btn || btn === curBtn) return;
      if (curTip) closeTip(curBtn, curTip, 'switch', true);
      openTip(btn, btn.querySelector('.tip'));
    };
    const onBlur = (e) => {
      if (!e.target.closest('.td-btn')) return;
      clearTimeout(hoverTimer);
      if (curTip) closeTip(curBtn, curTip, 'blur', false);
      curBtn = curTip = null;
    };
    stage.addEventListener('focusin', onFocus);
    stage.addEventListener('focusout', onBlur);

    const onOpt = (e) => {
      const k = e.target.dataset.k;
      opts[k] = e.target.checked;
      if (k === 'group' && !opts.group) {
        log('组共享关闭：每个浮层各自计时（横穿每次都等满 ' + DELAY + 'ms）', 'warn');
      } else if (k === 'group') {
        log('组共享开启：单时钟 + 即时相位', 'ok');
      } else {
        log('即时相位=' + opts.instant + '（关闭后一律 ' + DELAY + 'ms 首开）', 'ev');
      }
    };
    el.querySelectorAll('[data-k]').forEach((cb) => cb.addEventListener('change', onOpt));

    setState('unmounted', '—');

    return () => {
      stage.removeEventListener('pointerover', onOver);
      stage.removeEventListener('pointerleave', onLeaveStage);
      stage.removeEventListener('focusin', onFocus);
      stage.removeEventListener('focusout', onBlur);
      el.querySelectorAll('[data-k]').forEach((cb) => cb.removeEventListener('change', onOpt));
      clearTimeout(hoverTimer);
      clearInterval(resetTimer);
      clearInterval(countTimer);
      el.innerHTML = '';
    };
  }
};
