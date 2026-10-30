export default {
  id: 'height-morph', group: 'entrance', name: '高度平滑变形', lib: '原生 JS',
  desc: '折叠面板展开/收起时高度连续过渡，不是瞬间跳变。',
  deps: '无',
  note: '三条硬约束：① 连续点击必须从"当前中间高度"接着走，不能从记录值重来（否则会跳）；② 收起前若触发按钮已滚出视野，先把它拉回来，否则阅读位置丢失；③ 减少动态效果时直接切换，最终状态必须与动画结束时完全一致。',
  code: `// 时长按位移自适应：短内容更快
const dur = Math.round(Math.min(360, Math.max(220, distance * 0.6)));

el.animate(
  [{ height: from + 'px', overflow: 'hidden' },
   { height: to +   'px', overflow: 'hidden' }],
  { duration: dur, easing: 'cubic-bezier(.22,1,.36,1)' }
);

// 连续点击的起点：量当前（可能动画中途的）高度
// 而不是上一次记录的高度 —— 这是不跳的关键
const from = el.getBoundingClientRect().height;`,
  init(el) {
    el.innerHTML = `<div style="width:200px">
      <div id="hmBtn" style="width:100%;padding:9px;border-radius:9px;cursor:pointer;
        border:1px solid #33405a;background:#1c2130;color:#e8ecf4;font-size:12px">
        展开全部数值</div>
      <div id="hmBody" style="overflow:hidden;height:0;margin-top:8px;
        border:1px solid #242a38;border-radius:9px;background:#0e1118">
        <div style="padding:12px;font-size:11px;color:#8892a6;line-height:1.9">
          ${['甲 458 项', '乙 312 项', '丙 206 项', '丁 158 项', '戊 122 项'].map(t =>
            `<div style="display:flex;justify-content:space-between;
             border-bottom:1px solid #1a1f2c;padding:3px 0">
             <span>${t.split(' ')[0]}</span>
             <b style="color:#3CCBFF;font-variant-numeric:tabular-nums">${t.split(' ')[1]} ${t.split(' ')[2]}</b></div>`).join('')}
        </div>
      </div>
    </div>`;
    const btn = el.querySelector('#hmBtn');
    const body = el.querySelector('#hmBody');
    let open = false, timer;

    const morphDuration = d => Math.round(Math.min(360, Math.max(220, d * 0.6)));
    const toggle = () => {
      const from = body.getBoundingClientRect().height;   // 量当前真实高度
      open = !open;
      if (open) {
        body.style.height = 'auto';
        const to = body.getBoundingClientRect().height;
        body.style.height = '0px';
        body.animate([{ height: from + 'px' }, { height: to + 'px' }],
          { duration: morphDuration(Math.abs(to - from)), easing: 'cubic-bezier(.22,1,.36,1)' })
          .onfinish = () => { body.style.height = 'auto'; };
        btn.textContent = '收起数值';
      } else {
        body.style.height = from + 'px';
        body.offsetHeight;
        body.animate([{ height: from + 'px' }, { height: '0px' }],
          { duration: morphDuration(from), easing: 'cubic-bezier(.22,1,.36,1)' })
          .onfinish = () => { body.style.height = '0px'; };
        btn.textContent = '展开全部数值';
      }
    };
    btn.addEventListener('click', toggle);
    timer = setInterval(toggle, 2200);
    // 首次自动展开，让用户一眼看到效果
    const first = setTimeout(toggle, 400);
    return () => { clearInterval(timer); clearTimeout(first); btn.removeEventListener('click', toggle); };
  }
};
