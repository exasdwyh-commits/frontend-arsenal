export default {
  id: 'text-scramble', group: 'entrance', name: '文字乱码解码', lib: '原生 JS',
  desc: '字符先随机抖动再逐个落定，科技感标题的标配。',
  deps: '无',
  note: '乱码集里不要放 CJK 字符——宽度不一会让整行跳动。只用等宽 ASCII 符号（!#$%&*+<=>?@）。',
  code: `const CHARS = '!#$%&*+<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ';
function scramble(el, text, dur = 900){
  const start = performance.now();
  function tick(now){
    const p = Math.min((now - start) / dur, 1);
    const settled = Math.floor(text.length * p);
    el.textContent = text.slice(0, settled) +
      text.slice(settled).replace(/\S/g, () => CHARS[(Math.random()*CHARS.length)|0]);
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}`,
  init(el) {
    const CHARS = '!#$%&*+<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    el.innerHTML = `<div id="scr" style="font-family:'Cascadia Code',Consolas,monospace;
      font-size:16px;letter-spacing:3px;color:#3CCBFF">DECODE YOUR YOUTH</div>`;
    const n = el.querySelector('#scr');
    const TEXT = 'DECODE YOUR YOUTH';
    let raf, timer;
    const run = () => {
      const start = performance.now(), dur = 1100;
      const tick = now => {
        const p = Math.min((now - start) / dur, 1);
        const settled = Math.floor(TEXT.length * p);
        n.textContent = TEXT.slice(0, settled) +
          TEXT.slice(settled).replace(/\S/g, () => CHARS[(Math.random() * CHARS.length) | 0]);
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };
    run();
    timer = setInterval(run, 2400);
    return () => { cancelAnimationFrame(raf); clearInterval(timer); };
  }
};
