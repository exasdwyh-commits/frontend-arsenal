export default {
  id: 'exit-motion', group: 'entrance', name: '表面退场动效系统',
  lib: 'Astryx',
  desc: '对话框/浮层关闭时沿进场路线退回并淡出，而不是瞬间消失：关闭请求一发出就同帧进入"离场态"（不接指针与按键、焦点按规则交还、内容驻留到最后一帧），退场中途重开可无闪恢复，动画事件缺席也有"时长+100ms"兜底强制隐藏。机制提炼自 Astryx（meta/astryx，Meta 开源设计系统）公开规格 AST-090 Exit motion（FR1–FR12），原生 JS/CSS 独立实现，带主题开关与 animationend 阻断模拟。',
  deps: '无',
  note: '四个坑：① 别信 animationend——动画被取消、标签页转后台、系统禁用动画时它根本不报到，必须无条件挂"时长+100ms"兜底定时器且隐藏逻辑幂等（FR9，演示可勾"阻断"验证）；② 退场中重新打开绝不能"先隐藏再显示"（会闪一下），要取消动画+清兜底+摘 leaving 类，且退场时挂的 animationend/定时器回调必须按代际计数作废——否则过期回调会把刚重开的界面又藏回去，这是本效果最经典的 bug（FR8）；③ pointer-events:none 只挡鼠标，FR4 还要求按键不激活，得用 inert 或捕获阶段 keydown 拦截；aria-hidden 要等焦点离开后再设，焦点困在 aria-hidden 子树里是无效焦点（FR6）；④ 退场曲线是独立令牌 --ease-exit=cubic-bezier(.3,0,.6,.6)（慢出快走），不是把入场曲线倒放；"朝打开者收缩"的位移要在关闭瞬间按打开按钮当前坐标算——按钮可能早已滚动/移动。',

  scenes: { places: ['面板', '表单', '官网'], goals: ['操作反馈', '风格统一'], triggers: ['点击'], projects: ['通用', '设计系统', '专业工具'] },
  code: `/* 退场系统（提炼自 meta/astryx AST-090，vanilla 复刻） */
const EXIT_EASE = 'cubic-bezier(.3,0,.6,.6)';   /* FR12：独立退场曲线，不是入场倒放 */
let gen = 0, closing = false, guard;            /* 代际计数：用来作废过期回调 */

function close() {
  const g = ++gen; closing = true;
  el.classList.add('leaving');                  /* 同帧生效：FR4 不接输入 + FR11 内容驻留 */
  el.style.setProperty('--ox', toward(opener));  /* FR3：位移按打开者当前坐标算 */
  const ms = durationExit(el);                  /* FR1/FR2：0ms = 主题没开，同帧隐藏 */
  if (ms <= 0) return hide(g);
  guard = setTimeout(() => hide(g), ms + 100);  /* FR9：不信任 animationend，兜底必达 */
  el.addEventListener('animationend', () => hide(g), { once: true });
}
function hide(g) {
  if (g !== gen) return;                        /* 过期回调：重开后旧定时器一概无效 */
  clearTimeout(guard); closing = false;
  el.hidden = true; opener.focus();             /* FR6：隐藏时焦点交还打开者 */
}
function reopen() {                             /* FR8：中断恢复，绝不"隐藏再显示" */
  if (!closing) return;
  gen++; clearTimeout(guard);                   /* 作废退场期的全部回调 */
  el.getAnimations().forEach(a => a.cancel());
  el.classList.remove('leaving');               /* 原地回到打开态，无闪现 */
}`,

  init(el) {
    const STYLE = `<style data-fx="exit-motion">
      .em{width:100%;box-sizing:border-box;background:#2b2b2b;padding:16px;
        font-family:system-ui,-apple-system,"Segoe UI",sans-serif;color:#d8d8d8}
      .em-bar{display:flex;align-items:center;gap:13px;flex-wrap:wrap;margin-bottom:11px}
      .em-lb{font-size:10px;letter-spacing:.06em;text-transform:uppercase;color:#9a9a9a}
      .em-seg{display:flex;border-radius:5px;overflow:hidden;box-shadow:inset 0 0 0 1px rgba(0,0,0,.35)}
      .em-seg button{border:0;padding:5px 11px;font:500 11px/1 system-ui,sans-serif;cursor:pointer;
        background:rgba(255,255,255,.12);color:#c9c9c9}
      .em-seg button.on{background:#5F3BFF;color:#fff}
      .em-sw{display:flex;align-items:center;gap:6px;font-size:11px;color:#b6b6b6;cursor:pointer}
      .em-sw input{accent-color:#5F3BFF}
      .em-stat{margin-left:auto;font:500 10px/1.5 ui-monospace,Menlo,Consolas,monospace;color:#8f8f8f;
        background:rgba(0,0,0,.22);border-radius:5px;padding:5px 9px}
      .em-stat b{color:#e8e8e8;font-weight:500}
      /* ---- 迷你视口 ---- */
      .em-stage{position:relative;height:176px;border-radius:8px;overflow:hidden;background:#414141;
        box-shadow:inset 0 0 0 1px rgba(0,0,0,.3)}
      .em-open{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);height:27px;padding:0 14px;
        border:0;border-radius:5px;cursor:pointer;font:500 11.5px/1 system-ui,sans-serif;
        background:#5F3BFF;color:#fff;box-shadow:inset 0 1px 0 rgba(255,255,255,.35);z-index:1}
      .em-open:disabled{opacity:.55;cursor:default}
      .em-backdrop{position:absolute;inset:0;background:rgba(0,0,0,.5);z-index:2}
      .em-dialog{position:absolute;left:50%;top:50%;margin:-56px 0 0 -120px;width:240px;min-height:112px;
        box-sizing:border-box;background:#585858;border-radius:8px;padding:12px 14px;z-index:3;
        box-shadow:0 10px 26px rgba(0,0,0,.45),inset 0 1px 0 rgba(255,255,255,.16);
        display:flex;flex-direction:column;gap:7px}
      .em-backdrop,.em-dialog{opacity:1}
      .em-dialog[hidden],.em-backdrop[hidden]{display:none}   /* 作者样式的 display 会压过 UA 的 [hidden] */
      .em-dialog:focus{outline:none}                          /* 容器接焦点只为作用域，不画环 */
      .em-dialog:not(.em-leaving),.em-backdrop:not(.em-leaving){animation:emIn .22s cubic-bezier(.2,.9,.3,1.1) both}
      @keyframes emIn{from{opacity:0;transform:scale(.92)}to{opacity:1;transform:none}}
      /* 退场：FR3 沿进场路线逆行（朝打开者收缩）+ 淡出；FR12 独立退场曲线 */
      .em-dialog.em-leaving{pointer-events:none;animation:emOut var(--em-dur,0ms) cubic-bezier(.3,0,.6,.6) both}
      .em-backdrop.em-leaving{pointer-events:none;animation:emFade var(--em-dur,0ms) cubic-bezier(.3,0,.6,.6) both}
      @keyframes emOut{to{opacity:0;transform:translate(var(--ox,0px),var(--oy,0px)) scale(.9)}}
      @keyframes emFade{to{opacity:0}}
      .em-exit-on{--em-dur:180ms}                /* FR2：主题把该类表面的退场时长设 >0 才开启 */
      .em-dt{font:600 12px/1.4 system-ui,sans-serif;color:#fff}
      .em-db{font-size:10.5px;color:#c4c4c4;line-height:1.7}
      .em-db .hold{color:#ffb454}                /* FR11：驻留内容 */
      .em-da{display:flex;gap:7px;margin-top:auto;justify-content:flex-end}
      .em-btn{height:23px;padding:0 10px;border:0;border-radius:4px;cursor:pointer;
        font:500 10.5px/1 system-ui,sans-serif}
      .em-btn.pri{background:#5F3BFF;color:#fff}.em-btn.sec{background:rgba(255,255,255,.16);color:#e8e8e8}
      /* ---- 事件日志 ---- */
      .em-log{margin-top:10px;min-height:74px;font:400 10px/1.75 ui-monospace,Menlo,Consolas,monospace;
        color:#8f8f8f;background:rgba(0,0,0,.22);border-radius:6px;padding:7px 10px;overflow:hidden}
      .em-log .ev{color:#e8e8e8}.em-log .warn{color:#ffb454}.em-log .ok{color:#6ee29a}
      .em-log .dim{color:#7a7a7a}
      /* ---- 行为清单 ---- */
      .em-checks{list-style:none;margin:10px 0 0;padding:0;display:grid;
        grid-template-columns:repeat(auto-fill,minmax(232px,1fr));gap:5px 12px}
      .em-checks li{display:flex;align-items:flex-start;gap:7px;font-size:10.5px;color:#8a8a8a;line-height:1.6}
      .em-checks li .dot{flex:none;width:7px;height:7px;border-radius:50%;margin-top:4px;
        background:rgba(255,255,255,.18);box-shadow:inset 0 0 0 1px rgba(0,0,0,.3);transition:background .2s}
      .em-checks li.ok{color:#d8d8d8}
      .em-checks li.ok .dot{background:#6ee29a;box-shadow:0 0 6px rgba(110,226,154,.6)}
      .em-checks li b{color:#9a9a9a;font-weight:500}
      .em-checks li.ok b{color:#6ee29a}
      .em-hint{font-size:10.5px;color:#8a8a8a;line-height:1.8;margin-top:11px}
      @media (max-width:560px){.em-dialog{margin-left:-110px;width:220px}}
    </style>`;
    el.insertAdjacentHTML('beforeend', STYLE + `
      <div class="em em-exit-on" data-root>
        <div class="em-bar">
          <span class="em-lb">主题开关</span>
          <span class="em-seg" data-seg>
            <button class="on" data-v="on">退场开</button>
            <button data-v="off">退场关</button>
          </span>
          <label class="em-sw"><input type="checkbox" data-block> 阻断 animationend</label>
          <span class="em-stat" data-stat>—</span>
        </div>
        <div class="em-stage" data-stage>
          <button class="em-open" data-open>打开对话框</button>
          <div class="em-backdrop" data-backdrop hidden></div>
          <div class="em-dialog" data-dialog hidden role="dialog" aria-modal="true" aria-hidden="true" tabindex="-1">
            <div class="em-dt">发布确认</div>
            <div class="em-db">草稿将通知 3 位评审者。<br>
              <span class="hold" data-hold>搜索条件“发布”驻留中…</span></div>
            <div class="em-da">
              <button class="em-btn sec" data-act>取消</button>
              <button class="em-btn pri" data-act>确认</button>
            </div>
          </div>
        </div>
        <div class="em-log" data-log><span class="dim">关闭事件流：点“打开对话框”→ 再点关闭，观察同帧离场态与回调时机。</span></div>
        <ul class="em-checks" data-checks>
          <li data-k="fr3"><span class="dot"></span><span><b>FR3</b> 逆行退场：朝打开者收缩 + 背景同速淡出</span></li>
          <li data-k="fr4"><span class="dot"></span><span><b>FR4</b> 离场不接输入：点击/按键全被放行（试试点里面的按钮）</span></li>
          <li data-k="fr9"><span class="dot"></span><span><b>FR9</b> 100ms 兜底：animationend 缺席也必隐藏（勾“阻断”）</span></li>
          <li data-k="fr8"><span class="dot"></span><span><b>FR8</b> 中断恢复：退场中重开原地复原，无闪现</span></li>
          <li data-k="fr11"><span class="dot"></span><span><b>FR11</b> 内容驻留：搜索条件留到最后一帧才消失</span></li>
          <li data-k="fr1"><span class="dot"></span><span><b>FR1</b> 开关关 = 同帧隐藏：0ms 退场即关即隐</span></li>
        </ul>
        <div class="em-hint">关闭方式：点“取消/确认”、点背景或按 Esc。默认开启退场（FR2 主题开关）：关闭时对话框沿进场路线朝按钮缩回、背景同速淡出（FR3，慢出快走的 --ease-exit 曲线）。关闭瞬间去点对话框里的按钮或按 Enter——一律不激活（FR4）；勾上“阻断 animationend”后关闭，隐藏由 180+100ms 兜底定时器完成（FR9）；退场动画播到一半再点“打开对话框”，界面原地恢复不闪（FR8）。切到“退场关”（FR1 的默认态）则同帧消失，对照“东西去哪了”。</div>
      </div>`);

    const root = el.querySelector('[data-root]');
    const stage = el.querySelector('[data-stage]');
    const openBtn = el.querySelector('[data-open]');
    const dialog = el.querySelector('[data-dialog]');
    const backdrop = el.querySelector('[data-backdrop]');
    const logBox = el.querySelector('[data-log]');
    const stat = el.querySelector('[data-stat]');
    const blockCb = el.querySelector('[data-block]');
    const cleanups = [];

    let exitOn = true, closing = false, gen = 0, guard = 0, endHandler = null;
    let seen = {};   // 行为清单去重点亮

    const ok = (k) => {
      if (seen[k]) return;
      seen[k] = true;
      const li = el.querySelector('[data-k="' + k + '"]');
      if (li) li.classList.add('ok');
    };
    const log = (html, cls) => {
      const line = document.createElement('div');
      line.className = cls || 'ev';
      line.innerHTML = html;
      logBox.prepend(line);
      while (logBox.children.length > 6) logBox.lastChild.remove();
    };
    const updStat = () => {
      stat.innerHTML = exitOn
        ? '--duration-exit: <b>180ms</b> · --ease-exit: <b>cubic-bezier(.3,0,.6,.6)</b>'
        : '--duration-exit: <b>0ms</b>（FR1 默认关）';
    };
    const durMs = () => {
      if (!exitOn) return 0;
      const v = getComputedStyle(root).getPropertyValue('--em-dur');
      return parseFloat(v) || 0;
    };

    // FR3：关闭瞬间按打开按钮当前坐标算位移（按钮可能已移动）；入场 origin 固定居中不复用
    const aimAtOpener = () => {
      const d = dialog.getBoundingClientRect();
      const o = openBtn.getBoundingClientRect();
      const dx = (o.left + o.width / 2) - (d.left + d.width / 2);
      const dy = (o.top + o.height / 2) - (d.top + d.height / 2);
      const len = Math.hypot(dx, dy) || 1;
      const k = Math.min(46, len * 0.35) / len;
      dialog.style.setProperty('--ox', (dx * k).toFixed(1) + 'px');
      dialog.style.setProperty('--oy', (dy * k).toFixed(1) + 'px');
    };

    const hide = (g) => {
      if (g !== gen) return;            // 过期回调作废：重开后旧定时器/animationend 一概无效
      if (guard) { clearTimeout(guard); guard = 0; }
      if (endHandler) { dialog.removeEventListener('animationend', endHandler); endHandler = null; }
      closing = false;
      dialog.hidden = true;
      backdrop.hidden = true;
      dialog.classList.remove('em-leaving');
      backdrop.classList.remove('em-leaving');
      dialog.setAttribute('aria-hidden', 'true');
      openBtn.focus();                  // FR6：焦点在隐藏时交还打开者
      log('隐藏 → 焦点交还“打开对话框” · aria-hidden=true', 'dim');
      ok('fr11');
    };

    const close = () => {
      if (closing || dialog.hidden) return;
      const g = ++gen;
      closing = true;
      aimAtOpener();
      // 同帧进入离场态：FR4（事件监听立刻拦截）+ FR11（DOM 不动、内容驻留）
      dialog.classList.add('em-leaving');
      backdrop.classList.add('em-leaving');
      const ms = durMs();
      log('关闭请求 → onOpenChange(false)（回调在此刻，不是隐藏时）', 'ev');
      if (ms <= 0) {
        log('FR1：--duration-exit=0ms → 同帧隐藏', 'warn');
        ok('fr1');
        hide(g);
        return;
      }
      log('离场开始 ' + ms + 'ms · --ease-exit 逆行收缩 · pointer-events:none 同帧生效', 'ok');
      ok('fr3');
      guard = setTimeout(() => {
        log('FR9 兜底：animationend 始终未到 → ' + (ms + 100) + 'ms 强制隐藏', 'warn');
        ok('fr9');
        hide(g);
      }, ms + 100);
      if (!blockCb.checked) {
        endHandler = () => {
          if (g !== gen) return;
          log('animationend → 隐藏', 'dim');
          hide(g);
        };
        dialog.addEventListener('animationend', endHandler, { once: true });
      } else {
        log('animationend 已阻断，只剩兜底定时器', 'warn');
      }
    };

    const recover = () => {             // FR8：中断恢复——绝不隐藏再显示
      if (!closing) return;
      gen++;                            // 作废退场期的全部回调（最经典 bug 的解药）
      if (guard) { clearTimeout(guard); guard = 0; }
      if (endHandler) { dialog.removeEventListener('animationend', endHandler); endHandler = null; }
      dialog.getAnimations().forEach((a) => a.cancel());
      backdrop.getAnimations().forEach((a) => a.cancel());
      dialog.classList.remove('em-leaving');
      backdrop.classList.remove('em-leaving');
      closing = false;
      log('退场中重开 → 取消动画 + 作废旧回调 + 原地复原（无隐藏/显示闪烁）', 'ok');
      ok('fr8');
    };

    const onOpen = () => {
      if (closing) { recover(); return; }   // FR8：退场中再点打开 = 中断恢复
      if (!dialog.hidden) return;
      dialog.hidden = false;
      backdrop.hidden = false;
      dialog.removeAttribute('aria-hidden');
      dialog.focus();                    // 键盘焦点进对话框，Esc/Tab 才落在正确作用域
      log('打开 → aria-hidden=false，焦点进入对话框', 'dim');
    };
    openBtn.addEventListener('click', onOpen);
    cleanups.push(() => openBtn.removeEventListener('click', onOpen));

    // 关闭触发：取消/确认按钮、点背景、Esc（FR5：离场期间 Esc 仍归本表面）
    const onActs = (e) => { if (!closing) close(); };
    dialog.querySelectorAll('[data-act]').forEach((b) => {
      b.addEventListener('click', onActs);
      cleanups.push(() => b.removeEventListener('click', onActs));
    });
    const onBackdrop = () => { if (!closing) close(); };
    backdrop.addEventListener('click', onBackdrop);
    cleanups.push(() => backdrop.removeEventListener('click', onBackdrop));
    const onElKey = (e) => {
      if (e.key !== 'Escape' || dialog.hidden) return;
      if (closing) { log('FR5：退场中的 Esc 仍归本表面（不穿透到下层）', 'ok'); return; }
      close();
    };
    el.addEventListener('keydown', onElKey, true);
    cleanups.push(() => el.removeEventListener('keydown', onElKey, true));

    // FR4：捕获阶段拦截离场面上的按键（pointer-events 只挡鼠标）
    const onKey = (e) => {
      if (!closing) return;
      e.preventDefault();
      e.stopPropagation();
      log('FR4：离场中按键 ' + (e.key === 'Enter' ? 'Enter' : e.key) + ' 被拦截，不激活', 'ok');
      ok('fr4');
    };
    dialog.addEventListener('keydown', onKey, true);
    cleanups.push(() => dialog.removeEventListener('keydown', onKey, true));

    // FR4：离场态 pointer-events:none 让点击穿透——用坐标识别“点在离场面上”的点击
    const onStageClick = (e) => {
      if (!closing || e.target === openBtn) return;
      const d = dialog.getBoundingClientRect();
      if (e.clientX >= d.left && e.clientX <= d.right && e.clientY >= d.top && e.clientY <= d.bottom) {
        log('FR4：点击落在离场面上 → 已穿透放行，按钮不激活', 'ok');
        ok('fr4');
      }
    };
    stage.addEventListener('click', onStageClick);
    cleanups.push(() => stage.removeEventListener('click', onStageClick));

    const onSeg = (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      for (const x of e.currentTarget.children) x.classList.toggle('on', x === b);
      exitOn = b.dataset.v === 'on';
      root.classList.toggle('em-exit-on', exitOn);
      updStat();
      log(exitOn ? '主题开启退场：--duration-exit → 180ms' : '主题关闭退场（FR1 默认）：0ms 同帧隐藏', 'ev');
    };
    const seg = el.querySelector('[data-seg]');
    seg.addEventListener('click', onSeg);
    cleanups.push(() => seg.removeEventListener('click', onSeg));

    const onBlock = () => {
      log(blockCb.checked ? '已阻断 animationend：隐藏只能靠兜底定时器' : 'animationend 恢复', 'ev');
    };
    blockCb.addEventListener('change', onBlock);
    cleanups.push(() => blockCb.removeEventListener('change', onBlock));

    updStat();
    return () => {
      for (const c of cleanups) c();
      if (guard) clearTimeout(guard);
      el.innerHTML = '';
    };
  }
};
