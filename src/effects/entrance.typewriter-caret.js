export default {
  id: 'typewriter-caret', group: 'entrance', name: '打字机光标', lib: '纯 CSS',
  desc: '逐字输出 + 闪烁光标，AI 回复流式输出的视觉母版。',
  deps: '无',
  note: '光标闪烁用 steps(1) 而不是 ease——缓动会让方块的明暗过渡看起来"糊"。流式输出时千万不要用 CSS animation 做打字（无法中途追加），要用 JS 逐字 append，光标单独一层。',
  code: `/* 光标：硬切，不要缓动 */
.caret{
  display:inline-block; width:2px; height:1em; vertical-align:-.15em;
  background:currentColor; margin-left:2px;
  animation: caret 1s steps(1) infinite;
}
@keyframes caret{ 0%,49%{ opacity:1 } 50%,100%{ opacity:0 } }

/* 流式追加：JS 逐字写入，不要用 CSS 动画 */
let i = 0;
const tick = () => {
  out.textContent = full.slice(0, ++i);
  if (i < full.length) setTimeout(tick, 28 + Math.random() * 40);
};`,
  init(el) {
    const TEXT = '正在生成方案要点…';
    el.innerHTML = `<div style="display:flex;align-items:center;font-size:12.5px;color:#cfd6e4;
      font-family:'Cascadia Code',Consolas,monospace;padding:0 18px">
      <span id="tw"></span><i id="caret"></i></div>`;
    const out = el.querySelector('#tw'), caret = el.querySelector('#caret');
    const st = document.createElement('style');
    st.textContent = `#caret{display:inline-block;width:2px;height:1em;background:#3CCBFF;
      margin-left:3px;vertical-align:-.15em;animation:twCaret 1s steps(1) infinite}
      @keyframes twCaret{0%,49%{opacity:1}50%,100%{opacity:0}}`;
    el.appendChild(st);

    let i = 0, timer, running = true;
    const tick = () => {
      if (!running) return;
      out.textContent = TEXT.slice(0, ++i);
      if (i < TEXT.length) timer = setTimeout(tick, 55 + Math.random() * 55);
      else timer = setTimeout(() => { i = 0; out.textContent = ''; tick(); }, 1800);
    };
    tick();
    return () => { running = false; clearTimeout(timer); st.remove(); };
  }
};
