export default {
  id: 'intent-fill', group: 'feedback', name: '意图填空', lib: '原生 JS',
  desc: '点快捷意图只填草稿、不直接发送——把"误触即执行"的坑从设计上堵掉。',
  deps: '无',
  note: '这是交互原则而非纯视觉：任何会触发写操作/消耗额度的按钮，点了只能填草稿。填充后必须 requestAnimationFrame 把焦点交回输入框，否则用户还得再点一次才能继续打字。',
  code: `// 快捷意图：只填草稿，绝不自动发送
intent.addEventListener('click', () => {
  const from = panel.getBoundingClientRect().height;   // 先记高度
  input.value = intent.dataset.text;
  requestAnimationFrame(() => {
    input.focus();                                     // 焦点交回
    input.setSelectionRange(input.value.length, input.value.length);
    const to = panel.getBoundingClientRect().height;
    panel.animate([{ height: from + 'px' }, { height: to + 'px' }],
      { duration: 220, easing: 'cubic-bezier(.22,1,.36,1)' });
  });
});`,
  init(el) {
    el.innerHTML = `<div style="width:230px">
      <div style="display:flex;justify-content:space-between;align-items:center;
        margin-bottom:6px;font-size:9.5px;color:#5b6478">
        <span>从一个目标开始</span><span>只填草稿，不自动发送</span></div>
      <div id="ifGrid" style="display:grid;grid-template-columns:repeat(2,1fr);gap:6px">
        ${[['竞品对比', '对比我们与BesBio的AKK含量'],
           ['成本反推', '按BOM反推每瓶成本与毛利'],
           ['合规检查', '检查宣称是否触碰普通食品红线'],
           ['卖点提炼', '从458项检测里提炼3条卖点']].map(([k, v]) => `
          <button data-text="${v}" style="min-height:26px;padding:5px 9px;border-radius:8px;
            border:1px solid #242a38;background:#141922;color:#8892a6;font-size:10px;
            text-align:left;cursor:pointer;transition:.15s">${k}</button>`).join('')}
      </div>
      <div id="ifPanel" style="margin-top:6px;border:1px solid #33405a;border-radius:9px;
        background:#0e1118;padding:7px 10px;font-size:10.5px;color:#5b6478;
        min-height:28px;display:flex;align-items:center">点击上方意图填入草稿…</div>
    </div>`;
    const panel = el.querySelector('#ifPanel');
    const btns = [...el.querySelectorAll('#ifGrid button')];
    let autoTimer;
    const fill = b => {
      if (!b) return;
      const from = panel.getBoundingClientRect().height;
      panel.textContent = b.dataset.text;
      panel.style.color = '#e8ecf4';
      btns.forEach(x => x.style.borderColor = '#242a38');
      b.style.borderColor = '#5F3BFF';
      requestAnimationFrame(() => {
        const to = panel.getBoundingClientRect().height;
        if (Math.abs(to - from) > 1) {
          panel.animate([{ height: from + 'px' }, { height: to + 'px' }],
            { duration: 220, easing: 'cubic-bezier(.22,1,.36,1)' });
        }
      });
    };
    const cl = e => {
      const b = e.target.closest('button');
      if (b) { clearInterval(autoTimer); autoTimer = null; fill(b); }
    };
    el.addEventListener('click', cl);
    // 无人操作时自动轮播，让机制一眼可见
    let n = 0;
    const startAuto = () => {
      autoTimer = setInterval(() => { fill(btns[n % btns.length]); n++; }, 1600);
    };
    const first = setTimeout(() => { fill(btns[0]); startAuto(); }, 300);
    return () => {
      el.removeEventListener('click', cl);
      clearInterval(autoTimer); clearTimeout(first);
    };
  }
};
