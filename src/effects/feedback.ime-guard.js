export default {
  id: 'ime-guard', group: 'feedback', name: 'IME 组合守卫',
  lib: 'Astryx',
  desc: '输入框的键盘处理器在输入法组合期间必须"让路"：中文候选词还没上屏时，Enter 是"提交候选"不是"确认选择"，Esc 是"取消候选"不是"清空输入"，方向键是"选候选"不是"移列表"。机制提炼自 Astryx（meta/astryx，Meta 开源设计系统）公开文档 IME_GUARD_DESIGN.md 描述的 isImeKeyEvent 判定，原生 JS 独立实现，含裸奔版对照。',
  note: '三个坑：① 判定必须两个条件都查——`e.isComposing || e.keyCode === 229`，229 是老版 Chrome/WebKit 在组合期间给所有键发的键码，只查 isComposing 在这些浏览器上会漏；② Esc 的语义冲突最隐蔽——组合中按 Esc 是"删掉正在打的候选"，守卫不 return 掉的话你的"清空输入"处理器会把用户整段输入一起删了；③ 选中项不能绑在 input 事件上——组合期间每敲一个字母都触发 input，要么等 compositionend 后再处理，要么由放行后的 keydown 处理；另外组合中触发 blur（点别处）会丢候选，onBlur 里也要查 isComposing 再决定是否提交。',

  scenes: { places: ['表单', '搜索', '面板'], goals: ['操作反馈', '效率'], triggers: ['键盘'], projects: ['专业工具', '编辑器', '设置页'] },
  code: `/* IME 组合守卫（提炼自 meta/astryx IME_GUARD_DESIGN.md，vanilla 复刻） */
/* 坑①：两个条件都查——229 是老 WebKit 组合期所有键的键码 */
const isImeKeyEvent = (e) => e.isComposing || e.keyCode === 229;

input.addEventListener('keydown', (e) => {
  if (isImeKeyEvent(e)) return;   /* 组合中的键归输入法：Enter=提交候选、Esc=取消候选 */

  if (e.key === 'Enter') select(active);   /* 只有真·回车才选中 */
  if (e.key === 'Escape') clear();         /* 坑②：不 return 的话组合中按 Esc 会连输入一起清掉 */
  if (e.key === 'ArrowDown') move(1);
});

/* 坑③：选中项别绑 input——组合期间每敲一字母都触发，等 compositionend */
input.addEventListener('compositionend', () => {
  /* 此时候选已上屏，可以安全地把 input 的最终值用于过滤/提交 */
});`,

  init(el) {
    const STYLE = `<style data-fx="ime-guard">
      .ig{width:100%;box-sizing:border-box;background:#2b2b2b;padding:16px;
        font-family:system-ui,-apple-system,"Segoe UI",sans-serif;color:#d8d8d8}
      .ig-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px}
      .ig-col{background:#414141;border-radius:8px;padding:12px 14px}
      .ig-cap{font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:#9a9a9a;margin-bottom:8px;
        display:flex;align-items:center;gap:6px}
      .ig-cap .bad{color:#ff8f8f}.ig-cap .good{color:#6ee29a}
      .ig-inwrap{position:relative}
      .ig-in{width:100%;box-sizing:border-box;height:28px;padding:0 8px;border:0;border-radius:5px;
        background:rgba(0,0,0,.28);color:#fff;font:400 12px/1 system-ui,sans-serif;
        box-shadow:inset 0 0 0 1px rgba(0,0,0,.3)}
      .ig-in:focus{outline:0;box-shadow:inset 0 0 0 1px rgba(122,184,255,.7)}
      .ig-badge{position:absolute;right:6px;top:50%;transform:translateY(-50%);font-size:9px;
        background:#ffb454;color:#3a2a00;border-radius:3px;padding:2px 5px;display:none}
      .ig-composing .ig-badge{display:block}
      .ig-list{margin-top:7px;border-radius:5px;overflow:hidden;box-shadow:inset 0 0 0 1px rgba(0,0,0,.25)}
      .ig-item{display:flex;align-items:center;gap:7px;padding:6px 9px;font-size:11.5px;color:#c9c9c9;cursor:pointer}
      .ig-item+.ig-item{box-shadow:inset 0 1px 0 rgba(0,0,0,.18)}
      .ig-item.on{background:rgba(95,59,255,.42);color:#fff}
      .ig-item .tag{margin-left:auto;font-size:9px;color:#8a8a8a}
      .ig-log{margin-top:9px;min-height:44px;font:400 10px/1.7 ui-monospace,Menlo,Consolas,monospace;color:#8f8f8f;
        background:rgba(0,0,0,.2);border-radius:5px;padding:7px 9px;overflow:hidden}
      .ig-log b{color:#e8e8e8;font-weight:500}
      .ig-log .warn{color:#ffb454}
      .ig-log .ignore{color:#6ee29a}
      .ig-row{display:flex;align-items:center;gap:8px;margin-top:11px;flex-wrap:wrap}
      .ig-sim{display:flex;align-items:center;gap:6px;font-size:11px;color:#b6b6b6;cursor:pointer}
      .ig-sim input{accent-color:#5F3BFF}
      .ig-hint{font-size:10.5px;color:#8a8a8a;line-height:1.8;margin-top:10px}
    </style>`;
    el.insertAdjacentHTML('beforeend', STYLE + `
      <div class="ig">
        <div class="ig-grid">
          <div class="ig-col">
            <div class="ig-cap"><span class="bad">裸</span> 无守卫：组合键直通列表逻辑</div>
            <div class="ig-inwrap"><input class="ig-in" placeholder="搜索设置…（可打中文）" data-box><span class="ig-badge">组合中</span></div>
            <div class="ig-list" data-list></div>
          </div>
          <div class="ig-col">
            <div class="ig-cap"><span class="good">守</span> 有守卫：组合期间按键让给输入法</div>
            <div class="ig-inwrap"><input class="ig-in" placeholder="搜索设置…（可打中文）" data-box><span class="ig-badge">组合中</span></div>
            <div class="ig-list" data-list></div>
          </div>
        </div>
        <div class="ig-row">
          <label class="ig-sim"><input type="checkbox" data-sim> 模拟组合状态（没中文输入法时勾上，再按 ↑↓ / Enter / Esc）</label>
        </div>
        <div class="ig-log" data-log>事件日志：按下键后这里显示 isComposing / keyCode 判定结果。</div>
        <div class="ig-hint">输入框内打中文或勾选模拟：裸奔版的 ↑↓ 会移动列表选中、Enter 会选中项、Esc 会清空输入——但这些键在组合期间本该归输入法；守卫版全部让路（绿色 IGNORE），只处理上屏之后的真按键。</div>
      </div>`);

    const ITEMS = ['自动保存', '深色模式', '开机启动', '消息通知', '代理设置'];
    const log = el.querySelector('[data-log]');
    const sim = el.querySelector('[data-sim]');
    const cleanups = [];
    let simulating = false;

    const isImeKeyEvent = (e) => e.isComposing || e.keyCode === 229;   // 坑①

    const writeLog = (who, key, composing, code, verdict) => {
      log.innerHTML = '<b>' + who + '</b> keydown <b>' + key + '</b> isComposing=' + composing +
        (code !== null ? ' keyCode=' + code : '') + ' → <span class="' + verdict.cls + '">' + verdict.txt + '</span>';
    };

    el.querySelectorAll('[data-box]').forEach((box, idx) => {
      const guarded = idx === 1;
      const col = box.closest('.ig-col');
      const list = col.querySelector('[data-list]');
      let active = 0;
      const paint = () => {
        list.innerHTML = ITEMS.map((t, i) =>
          '<div class="ig-item' + (i === active ? ' on' : '') + '">' + t + '<span class="tag">' +
          (i === active ? '选中' : '') + '</div>').join('');
      };
      paint();

      // 真实组合事件驱动徽标；模拟开关强制置位
      const syncCompose = () => {
        const composing = simulating || box.isComposing === true;
        col.classList.toggle('ig-composing', composing);
        return composing;
      };
      const onStart = () => syncCompose();
      const onEnd = () => { box.isComposing = false; syncCompose(); };

      const onKey = (e) => {
        // 模拟模式下把所有键伪装成组合期事件（真 isComposing 属性只读，用派生判定）
        const composing = simulating || e.isComposing || e.keyCode === 229;
        const eff = { isComposing: composing, keyCode: composing && e.keyCode !== 229 ? 229 : e.keyCode };

        if (guarded) {
          if (isImeKeyEvent(eff)) {
            writeLog('守卫', e.key, eff.isComposing, eff.keyCode, { cls: 'ignore', txt: 'IGNORE — 让给输入法' });
            e.preventDefault();
            return;   // 坑②：Esc/Enter/方向键在组合期间一律不进业务逻辑
          }
        } else if (composing) {
          // 裸奔版：组合键照样执行业务逻辑（对照组的 bug）
          writeLog('裸奔', e.key, eff.isComposing, eff.keyCode, { cls: 'warn', txt: '直通业务逻辑 — 会抢输入法的键' });
        } else {
          writeLog(guarded ? '守卫' : '裸奔', e.key, false, e.keyCode, { cls: '', txt: '放行' });
        }

        if (e.key === 'ArrowDown') { active = (active + 1) % ITEMS.length; paint(); e.preventDefault(); }
        else if (e.key === 'ArrowUp') { active = (active - 1 + ITEMS.length) % ITEMS.length; paint(); e.preventDefault(); }
        else if (e.key === 'Enter') {
          log.innerHTML += ' → <b>选中「' + ITEMS[active] + '」</b>' +
            (composing ? ' <span class="warn">（此刻本该是提交候选！）</span>' : '');
        }
        else if (e.key === 'Escape') {
          box.value = '';
          log.innerHTML += ' → <b>清空输入</b>' +
            (composing ? ' <span class="warn">（此刻本该是取消候选！）</span>' : '');
        }
      };

      box.addEventListener('keydown', onKey);
      box.addEventListener('compositionstart', onStart);
      box.addEventListener('compositionend', onEnd);
      cleanups.push(() => {
        box.removeEventListener('keydown', onKey);
        box.removeEventListener('compositionstart', onStart);
        box.removeEventListener('compositionend', onEnd);
      });
    });

    const onSim = () => {
      simulating = sim.checked;
      el.querySelectorAll('.ig-col').forEach((c) => c.classList.toggle('ig-composing', simulating));
      log.textContent = simulating
        ? '模拟组合中：现在按 ↑↓ / Enter / Esc，看两列判定差异。'
        : '事件日志：按下键后这里显示 isComposing / keyCode 判定结果。';
    };
    sim.addEventListener('change', onSim);
    cleanups.push(() => sim.removeEventListener('change', onSim));

    return () => { for (const c of cleanups) c(); el.innerHTML = ''; };
  }
};
