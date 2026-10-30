export default {
  id: 'scroll-scrub', group: 'data', name: '滚动驱动进度', lib: '原生 JS',
  desc: '滚动位置直接映射为动画进度，滚多少动画走多少，回滚会倒退。',
  note: '关键在 scrub 而不是 trigger：不是"滚到就播"，而是"滚动量 = 进度"。实现必须用 getBoundingClientRect 每帧量，不能用 scrollTop 缓存——否则有 sticky 元素的容器里会算错。start/end 用百分比会让不同高度的容器提示点不同，生产要改成像素锚点。',
  code: `// GSAP ScrollTrigger 的 scrub 模式
ScrollTrigger.create({
  trigger: '.panel',
  start: 'top bottom',      // 元素顶碰到视口底 = 0%
  end: 'bottom top',        // 元素底离开视口顶 = 100%
  scrub: true,              // 不写数字=跟手；写 0.5=平滑追赶 0.5s
  onUpdate: self => setProgress(self.progress)
});

// 手写等效：每帧量位置
function onScroll() {
  const r = el.getBoundingClientRect();
  const start = window.innerHeight;              // 元素顶在此处
  const end = -r.height;                          // 元素底在此处
  const p = Math.min(1, Math.max(0, (start - r.top) / (start - end)));
  render(p);
}`,
  init(el) {
    el.innerHTML = `<div style="position:relative;width:250px;height:120px;
      background:#0a0c11;border:1px solid #242a38;border-radius:10px;overflow:hidden">
      <div id="ssBar" style="position:absolute;left:8px;top:8px;height:3px;width:0;
        background:linear-gradient(90deg,#5F3BFF,#3CCBFF);border-radius:2px"></div>
      <div id="ssNum" style="position:absolute;right:10px;top:6px;font-size:10px;
        color:#3CCBFF;font-variant-numeric:tabular-nums">0%</div>
      <div id="ssBox" style="position:absolute;left:50%;top:52%;width:44px;height:44px;
        margin:-22px;border-radius:12px;background:linear-gradient(135deg,#5F3BFF,#3CCBFF);
        opacity:.3"></div>
      <div style="position:absolute;left:8px;bottom:8px;font-size:9px;color:#5b6478">
        模拟滚动：进度 = 位移量</div>
    </div>`;
    const bar = el.querySelector('#ssBar');
    const num = el.querySelector('#ssNum');
    const box = el.querySelector('#ssBox');
    let raf, t0 = performance.now();
    const CYCLE = 4000;
    const loop = () => {
      const t = ((performance.now() - t0) % CYCLE) / CYCLE;
      // 模拟滚动：0→1→0（往返）
      const p = t < .5 ? t * 2 : (1 - t) * 2;
      const ease = p * p * (3 - 2 * p);   // smoothstep
      bar.style.width = (ease * 234) + 'px';
      num.textContent = Math.round(ease * 100) + '%';
      box.style.transform = `translateY(${(ease - .5) * 40}px) scale(${.7 + ease * .5})
        rotate(${ease * 180}deg)`;
      box.style.opacity = .3 + ease * .7;
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }
};
