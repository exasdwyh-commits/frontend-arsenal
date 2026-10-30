export default {
  id: 'disclosure-summary', group: 'feedback', name: '折叠区摘要汇报',
  lib: 'ProUI',
  desc: '检查器里的折叠分区收起后，标题行仍然汇报内部状态：显示关键值、已改项数、异常标记——不用展开就知道里面有什么。机制提炼自 ProUI（pro-ui.dev）公开文档描述的折叠面板摘要策略，原生 JS/CSS 独立实现。',
  note: '要点是摘要必须和内部状态同源更新（同一函数既写控件又写摘要），手写两份必然漂移——某天改了滑块忘了改摘要，用户就被骗进折叠区。第二个坑：摘要内容要用 textContent 注入而非拼进模板字符串，控件值可能含用户输入（文件名等），拼字符串就是 XSS 通道。第三个坑：摘要行要 text-overflow:ellipsis 且 flex:1，分区窄的时候宁可省略号也不能让摘要把标题挤换行——检查器面板经常只有 200px 宽。',
  scenes: { places: ['检查器', '面板', '设置页'], goals: ['效率', '信息呈现'], triggers: ['滚动', '点击'], projects: ['专业工具', '编辑器', '桌面应用'] },
  code: `/* 折叠区摘要汇报（提炼自 pro-ui.dev 公开文档，vanilla 复刻） */
/* 坑①：同源更新——一个函数既写内部控件又写摘要，绝不维护两份 */
function setExposure(v) {
  exposure = v;
  slider.value = v;                    /* 内部控件 */
  summary.textContent = fmt(v) + ' EV'; /* 标题行摘要，同函数同源 */
}

/* 坑②：textContent 注入，值里可能有用户输入，拼模板字符串＝XSS */
summary.textContent = name + ' · ' + fmt(v);

/* 坑③：窄面板宁可省略也不换行 */
.summary { flex:1; min-width:0; text-align:right;
  color:#9a9a9a; font-size:11px;
  white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }

/* 异常标记同理：越界/冲突时在摘要行挂一个警示点 */`,

  init(el) {
    const STYLE = `<style data-fx="disclosure-summary">
      .ds{width:100%;box-sizing:border-box;background:#2b2b2b;padding:14px;
        font-family:system-ui,-apple-system,"Segoe UI",sans-serif;color:#d8d8d8}
      .ds-insp{background:#3a3a3a;border-radius:8px;padding:4px;max-width:340px;margin:0 auto}
      .ds-sec{border-radius:6px;overflow:hidden}
      .ds-sec+.ds-sec{margin-top:2px}
      .ds-head{display:flex;align-items:center;gap:8px;width:100%;box-sizing:border-box;
        padding:8px 10px;border:0;background:transparent;cursor:pointer;text-align:left;
        font:600 11.5px/1 system-ui,sans-serif;color:#dcdcdc}
      .ds-head:hover{background:rgba(255,255,255,.06)}
      .ds-caret{width:0;height:0;flex:none;transition:transform .18s ease-out;
        border-top:4px solid transparent;border-bottom:4px solid transparent;border-left:5px solid #9a9a9a}
      .ds-sec.open .ds-caret{transform:rotate(90deg)}
      .ds-name{flex:none}
      .ds-sum{flex:1;min-width:0;text-align:right;font-weight:400;font-size:11px;color:#9a9a9a;
        white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .ds-flag{flex:none;width:7px;height:7px;border-radius:50%;background:#ffb454;display:none}
      .ds-sec.warn .ds-flag{display:block}
      .ds-body{display:grid;grid-template-rows:0fr;transition:grid-template-rows .22s ease-out}
      .ds-sec.open .ds-body{grid-template-rows:1fr}
      .ds-inner{overflow:hidden}
      .ds-pad{padding:6px 10px 10px;display:flex;flex-direction:column;gap:9px}
      .ds-row{display:flex;align-items:center;gap:10px}
      .ds-lb{font-size:11px;color:#b0b0b0;width:52px;flex:none}
      .ds-sl{flex:1;min-width:0;height:16px;display:flex;align-items:center;cursor:pointer;touch-action:none}
      .ds-track{position:relative;width:100%;height:3px;border-radius:2px;background:rgba(0,0,0,.35)}
      .ds-fill{position:absolute;left:0;top:0;bottom:0;border-radius:2px;background:#7ab8ff}
      .ds-thumb{position:absolute;top:50%;width:14px;height:14px;margin-left:-7px;margin-top:-7px;border-radius:50%;
        background:radial-gradient(circle at 50% 30%,#fff,#dcdcdc);box-shadow:0 1px 2px rgba(0,0,0,.35)}
      .ds-num{font:500 10.5px/1 ui-monospace,Menlo,Consolas,monospace;color:#fff;
        background:rgba(0,0,0,.26);border-radius:4px;padding:3px 6px;width:46px;text-align:right;flex:none}
      .ds-txt{flex:1;min-width:0;height:22px;box-sizing:border-box;padding:0 8px;border:0;border-radius:4px;
        background:rgba(0,0,0,.28);color:#fff;font:400 11px/1 system-ui,sans-serif;
        box-shadow:inset 0 0 0 1px rgba(0,0,0,.3)}
      .ds-txt:focus{outline:0;box-shadow:inset 0 0 0 1px rgba(122,184,255,.6)}
      .ds-chk{display:flex;align-items:center;gap:7px;font-size:11px;color:#b0b0b0;cursor:pointer}
      .ds-chk input{accent-color:#5F3BFF}
      .ds-hint{font-size:10.5px;color:#8a8a8a;line-height:1.8;margin-top:12px;text-align:center}
    </style>`;
    el.insertAdjacentHTML('beforeend', STYLE + `
      <div class="ds">
        <div class="ds-insp" id="dsInsp"></div>
        <div class="ds-hint">先在展开区改几个值，然后收起分区——标题行仍然汇报内部状态（关键值、改动数、异常点），不用展开就知道里面有什么。</div>
      </div>`);

    const SECS = [
      { name: '变换', rows: [
        { kind: 'slider', lb: '缩放', min: 10, max: 400, val: 100, unit: '%' },
        { kind: 'slider', lb: '旋转', min: -180, max: 180, val: 0, unit: '°' },
        { kind: 'check', lb: '等比锁定', val: true },
      ], sum: (st) => st[0] + '% · ' + st[1] + '°' },
      { name: '外观', rows: [
        { kind: 'slider', lb: '不透明', min: 0, max: 100, val: 100, unit: '%' },
        { kind: 'slider', lb: '模糊', min: 0, max: 40, val: 0, unit: 'px' },
        { kind: 'text', lb: '混合', val: '正常（Normal）' },
      ], sum: (st) => st[0] + '%' + (st[1] > 0 ? ' · 模糊' + st[1] + 'px' : '') },
      { name: '导出', rows: [
        { kind: 'text', lb: '文件名', val: 'hero-banner' },
        { kind: 'slider', lb: '质量', min: 10, max: 100, val: 82, unit: '%' },
        { kind: 'check', lb: '导出 2x', val: false },
      ], sum: (st) => st[0] + ' · ' + st[1] + '%' },
    ];
    const DEFAULTS = SECS.map((s) => s.rows.map((r) => r.kind === 'check' ? r.val : (r.kind === 'text' ? r.val : r.val)));

    const host = el.querySelector('#dsInsp');
    let uid = 0;
    const cleanups = [];

    SECS.forEach((sec, si) => {
      const secEl = document.createElement('div');
      secEl.className = 'ds-sec open';
      const bodyId = 'dsb' + (++uid);
      let rowsHtml = '';
      sec.rows.forEach((r, ri) => {
        if (r.kind === 'slider') {
          rowsHtml += `<div class="ds-row"><span class="ds-lb">${r.lb}</span>
            <span class="ds-sl" data-r="${ri}"><span class="ds-track"><span class="ds-fill"></span><span class="ds-thumb"></span></span></span>
            <span class="ds-num" data-n="${ri}"></span></div>`;
        } else if (r.kind === 'text') {
          rowsHtml += `<div class="ds-row"><span class="ds-lb">${r.lb}</span>
            <input class="ds-txt" data-t="${ri}" value="${r.val.replace(/"/g, '&quot;')}"></div>`;
        } else {
          rowsHtml += `<label class="ds-chk"><input type="checkbox" data-c="${ri}"${r.val ? ' checked' : ''}>${r.lb}</label>`;
        }
      });
      secEl.innerHTML = `
        <button class="ds-head" aria-expanded="true" aria-controls="${bodyId}">
          <span class="ds-caret"></span><span class="ds-name">${sec.name}</span>
          <span class="ds-sum"></span><span class="ds-flag" title="有改动"></span>
        </button>
        <div class="ds-body" id="${bodyId}"><div class="ds-inner"><div class="ds-pad">${rowsHtml}</div></div></div>`;
      host.appendChild(secEl);

      const head = secEl.querySelector('.ds-head');
      const sum = secEl.querySelector('.ds-sum');
      const state = DEFAULTS[si].slice();
      const orig = DEFAULTS[si].slice();

      /* 坑①+②：同源更新 + textContent 注入 */
      const paint = () => {
        sum.textContent = sec.sum(state);
        secEl.classList.toggle('warn', state.some((v, i) => String(v) !== String(orig[i])));
      };

      sec.rows.forEach((r, ri) => {
        if (r.kind === 'slider') {
          const sl = secEl.querySelector(`[data-r="${ri}"]`);
          const num = secEl.querySelector(`[data-n="${ri}"]`);
          const fill = sl.querySelector('.ds-fill');
          const thumb = sl.querySelector('.ds-thumb');
          let dragging = false;
          const upd = () => {
            const t = (state[ri] - r.min) / (r.max - r.min);
            fill.style.width = (t * 100) + '%';
            thumb.style.left = (t * 100) + '%';
            num.textContent = state[ri] + r.unit;
          };
          upd();
          const fromEv = (e) => {
            const rc = sl.querySelector('.ds-track').getBoundingClientRect();
            let t = (e.clientX - rc.left) / rc.width;
            t = Math.min(1, Math.max(0, t));
            state[ri] = Math.round(r.min + t * (r.max - r.min));
            upd(); paint();
          };
          const dn = (e) => { dragging = true; sl.setPointerCapture(e.pointerId); fromEv(e); e.preventDefault(); };
          const mv = (e) => { if (dragging) fromEv(e); };
          const up = (e) => { dragging = false; try { sl.releasePointerCapture(e.pointerId); } catch (_) {} };
          sl.addEventListener('pointerdown', dn);
          sl.addEventListener('pointermove', mv);
          sl.addEventListener('pointerup', up);
          sl.addEventListener('pointercancel', up);
          cleanups.push(() => {
            sl.removeEventListener('pointerdown', dn);
            sl.removeEventListener('pointermove', mv);
            sl.removeEventListener('pointerup', up);
            sl.removeEventListener('pointercancel', up);
          });
        } else if (r.kind === 'text') {
          const inp = secEl.querySelector(`[data-t="${ri}"]`);
          const onIn = () => { state[ri] = inp.value; paint(); };
          inp.addEventListener('input', onIn);
          cleanups.push(() => inp.removeEventListener('input', onIn));
        } else {
          const cb = secEl.querySelector(`[data-c="${ri}"]`);
          const onC = () => { state[ri] = cb.checked; paint(); };
          cb.addEventListener('change', onC);
          cleanups.push(() => cb.removeEventListener('change', onC));
        }
      });

      const onHead = () => {
        const open = secEl.classList.toggle('open');
        head.setAttribute('aria-expanded', String(open));
      };
      head.addEventListener('click', onHead);
      cleanups.push(() => head.removeEventListener('click', onHead));

      paint();
    });

    return () => { for (const c of cleanups) c(); el.innerHTML = ''; };
  }
};
