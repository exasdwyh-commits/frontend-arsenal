export default {
  id: 'flip-resize', group: 'space', name: 'FLIP 位置变形', lib: 'Web Animations',
  desc: '元素在列表/网格之间换位置时，用 transform 从旧位置滑过去，不做生硬跳转。',
  deps: '无',
  note: 'FLIP 只动 transform，所以不会触发重排——这是它比直接动 left/top 强一个量级的原因。三个必须跳过动画的情况：宽高为 0、位移小于 0.5px、缩放小于 1%。少了这三个判断会看到"闪一下"。',
  code: `function flip(el, mutate, dur = 560) {
  const first = el.getBoundingClientRect();
  mutate();                                  // 立刻改 DOM
  const last = el.getBoundingClientRect();

  const dx = first.left - last.left;
  const dy = first.top  - last.top;
  const sx = first.width  / last.width;
  const sy = first.height / last.height;

  // 差异太小就别动画，否则会闪
  if (!last.width || !last.height) return;
  if (Math.abs(dx) < .5 && Math.abs(dy) < .5 &&
      Math.abs(sx - 1) < .01 && Math.abs(sy - 1) < .01) return;

  el.animate([
    { transformOrigin: 'top left',
      transform: \`translate(\${dx}px, \${dy}px) scale(\${sx}, \${sy})\` },
    { transformOrigin: 'top left', transform: 'none' }
  ], { duration: dur, easing: 'cubic-bezier(.32,.72,0,1)' });
}`,
  init(el) {
    el.innerHTML = `<div style="display:flex;gap:8px;align-items:flex-start">
      <div id="flipStage" style="position:relative;width:150px;height:120px;
        background:#0a0c11;border:1px solid #242a38;border-radius:10px"></div>
      <div id="flipBtn" style="padding:8px 12px;border-radius:8px;cursor:pointer;font-size:11px;
        border:1px solid #33405a;background:#1c2130;color:#e8ecf4">换位</div>
    </div>`;
    const stage = el.querySelector('#flipStage');
    const btn = el.querySelector('#flipBtn');
    const box = document.createElement('div');
    box.style.cssText = `position:absolute;width:48px;height:48px;border-radius:10px;
      background:linear-gradient(135deg,#5F3BFF,#3CCBFF);left:12px;top:12px;
      display:flex;align-items:center;justify-content:center;color:#fff;font-size:10px`;
    box.textContent = '卡片';
    stage.appendChild(box);

    let big = false, timer;
    const flip = (target, mutate, dur = 560) => {
      const first = target.getBoundingClientRect();
      mutate();
      const last = target.getBoundingClientRect();
      const dx = first.left - last.left, dy = first.top - last.top;
      const sx = first.width / last.width, sy = first.height / last.height;
      if (!last.width || !last.height) return;
      if (Math.abs(dx) < .5 && Math.abs(dy) < .5 &&
          Math.abs(sx - 1) < .01 && Math.abs(sy - 1) < .01) return;
      target.animate([
        { transformOrigin: 'top left', transform: `translate(${dx}px,${dy}px) scale(${sx},${sy})` },
        { transformOrigin: 'top left', transform: 'none' }
      ], { duration: dur, easing: 'cubic-bezier(.32,.72,0,1)' });
    };
    const go = () => {
      flip(box, () => {
        big = !big;
        if (big) { box.style.left = '74px'; box.style.top = '52px'; box.style.width = '64px'; box.style.height = '64px'; }
        else { box.style.left = '12px'; box.style.top = '12px'; box.style.width = '48px'; box.style.height = '48px'; }
      });
    };
    btn.addEventListener('click', go);
    timer = setInterval(go, 1800);
    return () => { clearInterval(timer); btn.removeEventListener('click', go); };
  }
};
