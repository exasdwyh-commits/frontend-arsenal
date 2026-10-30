export default {
  id: 'elastic-drag', group: 'physics', name: '弹性拖拽', lib: 'Pointer Events',
  desc: '拖动时跟手，松手后按速度甩出并回弹到原位。',
  deps: '无',
  note: '必须用 setPointerCapture，否则鼠标移出元素就断连（onmousemove 的经典坑）。松手速度要用最近两帧的位移算，不能取全程平均。',
  code: `el.addEventListener('pointerdown', e => {
  el.setPointerCapture(e.pointerId);   // 关键：移出元素也不断连
  let last = { x: e.clientX, y: e.clientY, t: performance.now() };
  let vx = 0, vy = 0;

  el.onpointermove = ev => {
    const now = performance.now();
    vx = (ev.clientX - last.x) / (now - last.t) * 16;  // 按帧折算速度
    vy = (ev.clientY - last.y) / (now - last.t) * 16;
    el.style.transform = \`translate(\${ev.clientX - startX}px,\${ev.clientY - startY}px)\`;
    last = { x: ev.clientX, y: ev.clientY, t: now };
  };
  el.onpointerup = () => { /* 用 vx/vy 做惯性回弹 */ };
});`,
  init(el) {
    el.innerHTML = `<div id="drag" style="width:76px;height:76px;border-radius:20px;
      background:linear-gradient(135deg,#5F3BFF,#3CCBFF);cursor:grab;
      display:flex;align-items:center;justify-content:center;
      color:#fff;font-size:10px;touch-action:none;user-select:none;
      box-shadow:0 10px 30px rgba(95,59,255,.35)">拖我</div>`;
    const d = el.querySelector('#drag');
    let x = 0, y = 0, vx = 0, vy = 0, sx = 0, sy = 0, ptx = 0, pty = 0, pt = 0, raf, dragging = false;

    const spring = () => {
      vx += (0 - x) * .08; vy += (0 - y) * .08;
      vx *= .86; vy *= .86;
      x += vx; y += vy;
      d.style.transform = `translate(${x.toFixed(2)}px,${y.toFixed(2)}px)`;
      if (Math.abs(x) < .1 && Math.abs(y) < .1 && Math.abs(vx) < .1 && Math.abs(vy) < .1) {
        x = y = vx = vy = 0;
        d.style.transform = 'translate(0,0)';
        return;
      }
      raf = requestAnimationFrame(spring);
    };
    const down = e => {
      cancelAnimationFrame(raf);
      dragging = true;
      d.setPointerCapture(e.pointerId);
      sx = e.clientX - x; sy = e.clientY - y;
      ptx = e.clientX; pty = e.clientY; pt = performance.now();
      d.style.cursor = 'grabbing';
    };
    const move = e => {
      if (!dragging) return;
      const now = performance.now(), dt = Math.max(now - pt, 1);
      vx = (e.clientX - ptx) / dt * 16;
      vy = (e.clientY - pty) / dt * 16;
      x = e.clientX - sx; y = e.clientY - sy;
      d.style.transform = `translate(${x}px,${y}px)`;
      ptx = e.clientX; pty = e.clientY; pt = now;
    };
    const up = () => {
      if (!dragging) return;
      dragging = false;
      d.style.cursor = 'grab';
      raf = requestAnimationFrame(spring);
    };
    d.addEventListener('pointerdown', down);
    d.addEventListener('pointermove', move);
    d.addEventListener('pointerup', up);
    d.addEventListener('pointercancel', up);
    return () => {
      cancelAnimationFrame(raf);
      d.removeEventListener('pointerdown', down);
      d.removeEventListener('pointermove', move);
      d.removeEventListener('pointerup', up);
      d.removeEventListener('pointercancel', up);
    };
  }
};
