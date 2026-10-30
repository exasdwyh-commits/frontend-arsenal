export default {
  id: 'thinking-dots', group: 'data', name: '思考点阵', lib: '纯 CSS',
  desc: '三点依次弹起，AI 在思考时最低成本的进度反馈。',
  deps: '无',
  note: '每个点的 animation-delay 必须错开周期的 1/6 左右（这里 0.16s / 1.2s），错太少看不出波浪，错太多像随机闪。translateY 上限 3px，再大就变成"在跳"。',
  code: `.dot{ display:inline-block; width:6px; height:6px; border-radius:50%;
  background:currentColor; animation: dot 1.2s infinite; }
.dot:nth-child(2){ animation-delay:.16s }
.dot:nth-child(3){ animation-delay:.32s }

@keyframes dot{
  0%, 60%, 100%{ transform:translateY(0) scale(.8); opacity:.35 }
  30%          { transform:translateY(-3px) scale(1); opacity:1 }
}`,
  init(el) {
    el.innerHTML = `<div style="display:flex;gap:9px;align-items:center;color:#3CCBFF">
      <span class="tdot"></span><span class="tdot"></span><span class="tdot"></span>
      <span style="font-size:11px;color:#5b6478;margin-left:6px">写入中</span></div>`;
    const st = document.createElement('style');
    st.textContent = `.tdot{display:inline-block;width:6px;height:6px;border-radius:50%;
      background:currentColor;animation:tdot 1.2s infinite}
      .tdot:nth-child(2){animation-delay:.16s}.tdot:nth-child(3){animation-delay:.32s}
      @keyframes tdot{0%,60%,100%{transform:translateY(0) scale(.8);opacity:.35}
      30%{transform:translateY(-3px) scale(1);opacity:1}}`;
    el.appendChild(st);
    return () => st.remove();
  }
};
