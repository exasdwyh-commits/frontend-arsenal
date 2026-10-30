export default {
  id: 'bar-grow', group: 'data', name: '条形生长', lib: '纯 CSS',
  desc: '柱状图从基线生长，配合延迟做逐条揭示。',
  deps: '无',
  note: '用 transform:scaleY 而不是 height——后者每帧触发重排，十条以上必卡。transform-origin 必须设在 bottom，否则柱子从中间往两边长。',
  code: `.bar{
  transform: scaleY(0);
  transform-origin: bottom;          /* 关键：从基线长 */
  animation: grow .85s cubic-bezier(.22,1,.36,1) forwards;
}
.bar:nth-child(2){ animation-delay:.1s }
.bar:nth-child(3){ animation-delay:.2s }
@keyframes grow{ to{ transform: scaleY(1) } }`,
  init(el) {
    const hs = [.45, .7, .55, .92, .35];
    el.innerHTML = `<div style="display:flex;gap:10px;align-items:flex-end;height:96px">
      ${hs.map((h, i) => `<div class="bar" style="width:18px;height:${h * 100}%;
        border-radius:4px 4px 0 0;background:linear-gradient(180deg,#3CCBFF,#5F3BFF);
        transform:scaleY(0);transform-origin:bottom;
        animation:barGrow .85s cubic-bezier(.22,1,.36,1) ${i * .1}s infinite alternate">
      </div>`).join('')}</div>`;
    const st = document.createElement('style');
    st.textContent = '@keyframes barGrow{from{transform:scaleY(0)}to{transform:scaleY(1)}}';
    el.appendChild(st);
    return () => st.remove();
  }
};
