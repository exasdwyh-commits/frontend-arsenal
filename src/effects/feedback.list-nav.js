export default {
  id: 'list-nav', group: 'feedback', name: '组合导航与首字母跳转',
  lib: 'Floating UI',
  desc: '一个 Tab 停靠点管整组控件：roving tabindex 让只有 active 项 tabIndex=0、其余 -1，方向键在组内移动（可循环/横竖/网格多列），Home/End 跳首尾；连敲字母走 typeahead——750ms 内累积匹配串、前缀命中跳转、超时清空，disabled 项按 null 跳过。机制提炼自 floating-ui（MIT）公开文档 useListNavigation/Composite/useTypeahead，原生 JS 独立实现，带虚拟焦点与网格演示。',
  deps: '无',
  note: '六个坑：① 真实焦点模型下列表项必须自身可 focus（tabindex）且带 role，否则方向键移过去焦点落在容器上；虚拟焦点模型用 aria-activedescendant，此时每个项必须有唯一 id——两种模型不能混；② roving 的规则是 active 项 tabIndex=0、其余 -1，activeIndex 为 null 时不得留下任何 tabbable 项；③ typeahead 有 750ms 复位窗口，且只该用于 menu/select——可输入的 combobox 里打字是搜索，不是跳转，两套逻辑会打架；④ 匹配从 activeIndex 之后开始找（带环绕），null 项 = disabled 跳过，所以 disabled 项要给 null 而不是省略，否则索引错位；⑤ allowEscape（越界后取消选中）必须配 loop:true，否则无处可去；⑥ 键盘打开菜单时默认聚焦首个 tabbable（不是 focusable）项，鼠标打开则不抢焦点——focusItemOnOpen 的 auto 推断就靠这个区分，写反了鼠标点开会丢焦点。',

  scenes: { places: ['菜单', '面板', '专业工具'], goals: ['操作反馈', '风格统一'], triggers: ['键盘'], projects: ['通用', '设计系统', '专业工具'] },
  code: `/* roving tabindex + typeahead（提炼自 floating-ui docs，vanilla 复刻） */
// roving：整组只有一个 Tab 停靠点
items.forEach((it, i) => it.tabIndex = i === active ? 0 : -1);
// 方向键移动：loop 环绕 / cols 网格换行 / disabledIndices 跳过
onArrow(key => {
  active = nextIndex(active, key, {loop, cols, orientation, disabled});
  items[active].focus();                       // 真实焦点模型
  items[active].scrollIntoView({block:'nearest'});
  // 虚拟焦点模型则不动 DOM focus：容器 aria-activedescendant = 项的唯一 id
});
// typeahead：750ms 窗口内累积，前缀匹配（null = disabled 跳过）
onChar(ch => {
  buf += ch.toLowerCase();
  const hit = findMatch(buf, active);          // 从 activeIndex 之后找，带环绕
  if (hit != null) onNavigate(hit);
  clearTimeout(t); t = setTimeout(() => buf = '', 750);
});
// 打字跳转与方向键共用 activeIndex 同步，绝不能各存一份状态`,

  init(el) {
    const STYLE = `<style data-fx="list-nav">
      .ln{width:100%;box-sizing:border-box;background:#2b2b2b;padding:14px;
        font-family:system-ui,-apple-system,"Segoe UI",sans-serif;color:#d8d8d8}
      .ln-bar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:10px}
      .ln-lb{font-size:10px;letter-spacing:.06em;text-transform:uppercase;color:#9a9a9a}
      .ln-seg{display:flex;border-radius:5px;overflow:hidden;box-shadow:inset 0 0 0 1px rgba(0,0,0,.35)}
      .ln-seg button{border:0;padding:5px 11px;font:500 11px/1 system-ui,sans-serif;cursor:pointer;
        background:rgba(255,255,255,.12);color:#c9c9c9}
      .ln-seg button.on{background:#5F3BFF;color:#fff}
      .ln-sw{display:flex;align-items:center;gap:5px;font-size:11px;color:#b6b6b6;cursor:pointer}
      .ln-sw input{accent-color:#5F3BFF}
      .ln-stat{margin-left:auto;font:500 10px/1.6 ui-monospace,Menlo,Consolas,monospace;color:#8f8f8f;
        background:rgba(0,0,0,.22);border-radius:5px;padding:5px 9px}
      .ln-stat b{color:#e8e8e8;font-weight:500}
      .ln-stat .hit{color:#6ee29a}
      .ln-body{display:flex;gap:14px;flex-wrap:wrap}
      /* ---- 列表本体：一个 Tab 停靠点 ---- */
      .ln-list{flex:1;min-width:230px;display:flex;flex-direction:column;gap:3px;
        background:#414141;border-radius:8px;padding:8px;box-shadow:inset 0 0 0 1px rgba(0,0,0,.3)}
      .ln-list.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:5px}
      .ln-item{position:relative;border:0;border-radius:5px;padding:7px 10px;text-align:left;cursor:pointer;
        font:500 11.5px/1.4 system-ui,sans-serif;background:rgba(255,255,255,.07);color:#c9c9c9;outline:none}
      .ln-list.horizontal{flex-direction:row;flex-wrap:wrap}
      .ln-item:focus-visible{box-shadow:inset 0 0 0 2px #5F3BFF}
      .ln-item.active{background:#5F3BFF;color:#fff}
      .ln-item.dis{opacity:.4;cursor:default}
      .ln-item .tag{position:absolute;right:7px;top:50%;transform:translateY(-50%);
        font:500 9px/1 ui-monospace,monospace;color:rgba(255,255,255,.55)}
      /* ---- typeahead 缓冲显示 ---- */
      .ln-side{width:212px;display:flex;flex-direction:column;gap:8px}
      .ln-ta{background:#414141;border-radius:8px;padding:9px 11px;box-shadow:inset 0 0 0 1px rgba(0,0,0,.3)}
      .ln-ta .k{font-size:10px;letter-spacing:.05em;text-transform:uppercase;color:#9a9a9a}
      .ln-ta .buf{font:600 17px/1.5 ui-monospace,Menlo,Consolas,monospace;color:#fff;min-height:26px;word-break:break-all}
      .ln-ta .buf .cur{color:#5F3BFF}
      .ln-ta .bar{height:3px;border-radius:2px;background:rgba(255,255,255,.14);overflow:hidden;margin-top:5px}
      .ln-ta .bar i{display:block;height:100%;width:0;background:#6ee29a;transition:width .08s linear}
      .ln-ta .md{font-size:10px;color:#8a8a8a;line-height:1.6;margin-top:6px}
      .ln-log{font:400 10px/1.7 ui-monospace,Menlo,Consolas,monospace;color:#8f8f8f;
        background:rgba(0,0,0,.22);border-radius:6px;padding:6px 9px;min-height:56px}
      .ln-log .ev{color:#e8e8e8}.ln-log .warn{color:#ffb454}.ln-log .ok{color:#6ee29a}
      .ln-hint{font-size:10.5px;color:#8a8a8a;line-height:1.8;margin-top:9px}
      @media (max-width:560px){.ln-side{width:100%}}
    </style>`;

    const ITEMS = [
      { t: '新建面板', k: 'n', en: 'new' }, { t: '打开模板库', k: 'l', en: 'library' },
      { t: '导入草稿', k: 'i', en: 'import', dis: true },
      { t: '导出切图', k: 'e', en: 'export' }, { t: '导出视频', k: 'v', en: 'video', dis: true },
      { t: '图层对齐', k: 'a', en: 'align' },
      { t: '自动布局', k: 'g', en: 'grid' }, { t: '组件变体', k: 'c', en: 'component' },
      { t: '发布预览', k: 'p', en: 'publish' },
      { t: '撤销历史', k: 'h', en: 'history' },
    ];

    el.insertAdjacentHTML('beforeend', STYLE + `
      <div class="ln" data-root>
        <div class="ln-bar">
          <span class="ln-lb">方向</span>
          <span class="ln-seg" data-seg>
            <button class="on" data-v="vertical">纵</button>
            <button data-v="horizontal">横</button>
            <button data-v="grid">网格3列</button>
          </span>
          <label class="ln-sw"><input type="checkbox" data-k="loop"> loop 环绕</label>
          <label class="ln-sw"><input type="checkbox" data-k="virtual"> 虚拟焦点</label>
          <span class="ln-stat" data-stat>active=<b>0</b> · tabbable=<b>1</b></span>
        </div>
        <div class="ln-body">
          <div class="ln-list" data-list role="listbox" tabindex="-1" aria-label="导航示例">
            ${ITEMS.map((it, i) =>
              `<button class="ln-item${it.dis ? ' dis' : ''}" role="option" ` +
              `id="ln-i${i}" data-i="${i}" ${it.dis ? 'aria-disabled="true" disabled' : ''} ` +
              `tabindex="${i === 0 ? 0 : -1}">${it.t}` +
              `<span class="tag">${it.dis ? 'dis' : 'k=' + it.k}</span></button>`).join('')}
          </div>
          <div class="ln-side">
            <div class="ln-ta">
              <div class="k">typeahead 缓冲（750ms 窗口）</div>
              <div class="buf" data-buf>—</div>
              <div class="bar"><i data-bar></i></div>
              <div class="md">连敲字母跳转；条满即复位。匹配从 active 之后找、带环绕，disabled 跳过。</div>
            </div>
            <div class="ln-log" data-log><span style="color:#7a7a7a">Tab 进组 → 方向键移动 / 连敲字母跳转。</span></div>
          </div>
        </div>
        <div class="ln-hint">整组只占一个 Tab 停靠点（active 项 tabIndex=0，其余 -1）：Tab 进来停在当前项，再 Tab 出组。方向键在组内移动并同步 activeIndex，Home/End 跳首尾；disabled 项按 null 跳过不占位。连敲字母走 typeahead——750ms 内累积匹配串，前缀命中即跳，超时清空。勾"虚拟焦点"切换到 aria-activedescendant 模型：DOM 焦点留在列表容器，高亮项由 activedescendant 指示。</div>
      </div>`);

    const list = el.querySelector('[data-list]');
    const items = Array.from(el.querySelectorAll('.ln-item'));
    const stat = el.querySelector('[data-stat]');
    const logBox = el.querySelector('[data-log]');
    const bufBox = el.querySelector('[data-buf]');
    const bar = el.querySelector('[data-bar]');
    const seg = el.querySelector('[data-seg]');
    const opts = { loop: false, virtual: false };
    let orientation = 'vertical', active = 0, buf = '', taTimer = 0, barTimer = 0;

    const log = (html, cls) => {
      const line = document.createElement('div');
      line.className = cls || 'ev';
      line.innerHTML = html;
      logBox.prepend(line);
      while (logBox.children.length > 4) logBox.lastChild.remove();
    };

    const isDis = (i) => !items[i] || items[i].classList.contains('dis');
    const render = () => {
      items.forEach((it, i) => {
        const on = i === active;
        it.classList.toggle('active', on);
        // roving tabindex：active=0 其余 -1；activeIndex 为 null 时不留任何 tabbable 项
        it.tabIndex = on ? 0 : -1;
        if (opts.virtual) it.setAttribute('aria-selected', on ? 'true' : 'false');
        else it.removeAttribute('aria-selected');
      });
      if (opts.virtual) list.setAttribute('aria-activedescendant', items[active].id);
      else list.removeAttribute('aria-activedescendant');
      const tabbable = items.filter((it) => it.tabIndex === 0).length;
      stat.innerHTML = 'active=<b>' + active + '</b> · tabbable=<b>' + tabbable + '</b>' +
        ' · <span class="hit">' + (opts.virtual ? 'virtual' : 'real') + ' focus</span>' +
        ' · buf=<b>' + (buf || '∅') + '</b>';
    };

    const focusActive = () => {
      if (opts.virtual) {
        // 虚拟焦点：DOM 焦点留在容器，不落到项上
        list.focus({ preventScroll: true });
      } else {
        items[active].focus({ preventScroll: true });
      }
      items[active].scrollIntoView({ block: 'nearest', inline: 'nearest' });
    };

    // 方向键移动：cols 换行 / loop 环绕 / disabled 跳过
    const nextIndex = (from, key) => {
      const n = items.length;
      const step = (i) => i + (key === 'ArrowDown' || key === 'ArrowRight' ? 1 : -1);
      const sameLine = (i) =>
        key === 'ArrowLeft' || key === 'ArrowRight' ? true
          : orientation !== 'grid';   // 纵列/横行里上下键不换"列"，直接移动
      let i = from;
      for (let c = 0; c < n + 1; c++) {
        i = step(i);
        if (i < 0 || i >= n) {
          if (!opts.loop) return -1;        // allowEscape：越界取消选中
          i = (i + n) % n;
        }
        if (!isDis(i)) return i;
        if (orientation === 'grid' && key === 'ArrowDown' && i % 3 === from % 3 && c > 2) {
          // 网格纵向到底：由 loop 决定是否回绕
        }
        if (!sameLine(i)) continue;
      }
      return -1;
    };

    const move = (to, why) => {
      if (to < 0) {
        log(why + '：越界且 loop 关闭 → 取消选中（allowEscape）', 'warn');
        return;
      }
      active = to;
      render();
      focusActive();
      log(why + ' → active=' + active + '「' + ITEMS[active].t + '」', 'ok');
    };

    // ---- typeahead：750ms 窗口累积，前缀匹配，从 active 之后找、带环绕 ----
    // 匹配串 = 英文别名 + 中文标签（别名在前，首字母才能命中；中文打不出首字母）
    const labelOf = (i) => {
      const it = ITEMS[i];
      return (it.en + ' ' + it.t).toLowerCase();
    };
    const findMatch = (s) => {
      const n = items.length;
      for (let c = 1; c <= n; c++) {
        const i = (active + c) % n;
        if (isDis(i)) continue;             // null/跳过语义
        if (labelOf(i).startsWith(s)) return i;
      }
      // 自身也允许匹配（连续敲同一字母时至少命中自己）
      return labelOf(active).startsWith(s) ? active : -1;
    };

    const showBuf = () => {
      bufBox.innerHTML = buf
        ? buf.split('').map((ch, i) => i === buf.length - 1 ? '<span class="cur">' + ch + '</span>' : ch).join('')
        : '—';
      stat.innerHTML = 'active=<b>' + active + '</b> · tabbable=<b>' +
        items.filter((it) => it.tabIndex === 0).length + '</b>' +
        ' · <span class="hit">' + (opts.virtual ? 'virtual' : 'real') + ' focus</span>' +
        ' · buf=<b>' + (buf || '∅') + '</b>';
    };

    const onType = (ch) => {
      buf += ch.toLowerCase();
      const hit = findMatch(buf);
      showBuf();
      if (hit >= 0) {
        active = hit;
        render();
        focusActive();
        log('typeahead「' + buf + '」→ ' + ITEMS[hit].t, 'ok');
      } else {
        log('typeahead「' + buf + '」无命中', 'warn');
      }
      clearTimeout(taTimer);
      taTimer = setTimeout(() => { buf = ''; showBuf(); }, 750);
      // 缓冲条：750ms 内回缩
      clearTimeout(barTimer);
      bar.style.transition = 'none';
      bar.style.width = '100%';
      requestAnimationFrame(() => {
        bar.style.transition = 'width 750ms linear';
        bar.style.width = '0%';
      });
    };

    // ---- 键盘 ----
    const onKey = (e) => {
      const k = e.key;
      if (k === 'ArrowDown' || k === 'ArrowUp' || k === 'ArrowLeft' || k === 'ArrowRight') {
        e.preventDefault();
        const to = nextIndex(active, k);
        move(to < 0 ? active : to, k);
      } else if (k === 'Home') {
        e.preventDefault();
        for (let i = 0; i < items.length; i++) if (!isDis(i)) return move(i, 'Home');
      } else if (k === 'End') {
        e.preventDefault();
        for (let i = items.length - 1; i >= 0; i--) if (!isDis(i)) return move(i, 'End');
      } else if (k.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        onType(k);
      }
    };
    list.addEventListener('keydown', onKey);

    const onListClick = (e) => {
      const it = e.target.closest('.ln-item');
      if (!it || it.classList.contains('dis')) return;
      active = +it.dataset.i;
      render();
      focusActive();
      log('pointer → active=' + active, 'ev');
    };
    list.addEventListener('click', onListClick);

    const onSeg = (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;
      for (const x of e.currentTarget.children) x.classList.toggle('on', x === btn);
      orientation = btn.dataset.v;
      list.classList.toggle('grid', orientation === 'grid');
      list.classList.toggle('horizontal', orientation === 'horizontal');
      log('orientation=' + orientation + '（cols=' + (orientation === 'grid' ? 3 : 1) + '）', 'ev');
    };
    seg.addEventListener('click', onSeg);

    const onOpt = (e) => {
      const k = e.target.dataset.k;
      opts[k] = e.target.checked;
      if (k === 'virtual') {
        render();
        log('焦点模型 → ' + (opts.virtual ? 'aria-activedescendant 虚拟焦点（DOM 焦点停容器）' : '真实 DOM 焦点'), 'ev');
      } else {
        log('loop=' + opts.loop, 'ev');
      }
      render();
    };
    el.querySelectorAll('[data-k]').forEach((cb) => cb.addEventListener('change', onOpt));

    render();
    log('roving 就绪：只有 active 项 tabIndex=0', 'ev');

    return () => {
      list.removeEventListener('keydown', onKey);
      list.removeEventListener('click', onListClick);
      seg.removeEventListener('click', onSeg);
      el.querySelectorAll('[data-k]').forEach((cb) => cb.removeEventListener('change', onOpt));
      clearTimeout(taTimer);
      clearTimeout(barTimer);
      el.innerHTML = '';
    };
  }
};
