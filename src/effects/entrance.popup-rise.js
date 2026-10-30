export default {
  id: 'popup-rise', group: 'entrance', name: '建议窗上浮', lib: 'Web Animations',
  desc: '输入 / 触发的建议弹窗从输入框上方浮起，同时高度自适应过渡。',
  deps: '无',
  note: '弹窗出现时高度是变化的（建议项数量不同），必须做高度过渡，否则会把下面的内容顶一下。关闭时焦点必须回到触发按钮，不然键盘用户会迷路。',
  code: `// 出现：只动 opacity + transform，不碰布局
el.animate(
  [{ opacity: 0, transform: 'translateX(-50%) translateY(8px) scale(.98)' },
   { opacity: 1, transform: 'translateX(-50%)' }],
  { duration: 220, easing: 'cubic-bezier(.22,1,.36,1)' }
);

// 高度变化：先捕获旧高度，改完内容后从旧高度过渡
const from = panel.getBoundingClientRect().height;
setOpen(true);
requestAnimationFrame(() => {
  const to = panel.getBoundingClientRect().height;
  panel.animate([{ height: from + 'px' }, { height: to + 'px' }],
    { duration: 220, easing: 'cubic-bezier(.22,1,.36,1)' });
});`,
  init(el) {
    el.innerHTML = `<div style="position:relative;width:210px">
      <div id="prInput" style="display:flex;align-items:center;gap:6px;padding:9px 12px;
        border:1px solid #33405a;border-radius:9px;background:#0e1118;
        font-size:12px;color:#8892a6;cursor:pointer">/</div>
      <div id="prPopup" style="position:absolute;left:0;right:0;bottom:calc(100% + 8px);
        background:#171b25;border:1px solid #33405a;border-radius:10px;overflow:hidden;
        box-shadow:0 12px 32px rgba(0,0,0,.5);opacity:0;pointer-events:none">
        <div id="prBody" style="padding:6px">
          ${['/简报 生成每日产品简报', '/对比 竞品参数横向对比', '/成本 反推BOM毛利'].map(t => `
            <div style="padding:7px 10px;border-radius:6px;font-size:11px;
              color:#cfd6e4;background:#1c2130;margin-bottom:4px">
              <b style="color:#3CCBFF">${t.split(' ')[0]}</b>
              <span style="color:#8892a6;margin-left:6px">${t.split(' ')[1]}</span></div>`).join('')}
        </div>
      </div>
    </div>`;
    const input = el.querySelector('#prInput');
    const popup = el.querySelector('#prPopup');
    const body = el.querySelector('#prBody');
    let timer, open = false;

    const show = () => {
      const from = body.getBoundingClientRect().height;
      popup.style.pointerEvents = 'auto';
      popup.animate([{ opacity: 0, transform: 'translateY(8px) scale(.98)' },
                     { opacity: 1, transform: 'none' }],
        { duration: 220, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'forwards' });
      body.animate([{ height: from + 'px' }, { height: 'auto' }],
        { duration: 220, easing: 'cubic-bezier(.22,1,.36,1)' });
      input.textContent = '/';
      input.style.color = '#e8ecf4';
      open = true;
    };
    const hide = () => {
      popup.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(8px) scale(.98)' }],
        { duration: 160, easing: 'ease-out', fill: 'forwards' });
      popup.style.pointerEvents = 'none';
      input.textContent = '';
      input.style.color = '#8892a6';
      open = false;
    };
    timer = setInterval(() => (open ? hide() : show()), 1700);
    setTimeout(show, 300);
    return () => { clearInterval(timer); };
  }
};
