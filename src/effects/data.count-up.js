export default {
  id: 'count-up', group: 'data', name: '数字滚动', lib: '原生 JS',
  desc: '关键数据从 0 滚到目标值，提案里讲"剂量/含量"必备。',
  deps: '无',
  note: '必须用 easeOutExpo 收尾——匀速滚动像进度条，缓出才像"揭晓结果"。数字容器要设 font-variant-numeric: tabular-nums，否则滚动时宽度跳动。',
  code: `function countUp(el, to, dur = 1400) {
  const t0 = performance.now();
  const ease = t => 1 - Math.pow(2, -10 * t);   // easeOutExpo
  function tick(now) {
    const p = Math.min((now - t0) / dur, 1);
    el.textContent = Math.round(to * ease(p)).toLocaleString('en-US');
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
countUp(document.querySelector('.num'), 458);`,
  init(el) {
    el.innerHTML = `<div style="text-align:center">
      <div id="num" style="font-size:34px;font-weight:700;
        background:linear-gradient(90deg,#BFEA1A,#3CCBFF);-webkit-background-clip:text;
        background-clip:text;color:transparent;font-variant-numeric:tabular-nums">0</div>
      <div style="font-size:11px;color:#8892a6;margin-top:4px">项严选标准</div></div>`;
    const num = el.querySelector('#num');
    let timer, raf;
    const run = () => {
      const t0 = performance.now(), to = 458, dur = 1500;
      const ease = t => 1 - Math.pow(2, -10 * t);
      const tick = now => {
        const p = Math.min((now - t0) / dur, 1);
        num.textContent = Math.round(to * ease(p)).toLocaleString('en-US');
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };
    run();
    timer = setInterval(run, 2400);
    return () => { clearInterval(timer); cancelAnimationFrame(raf); };
  }
};
