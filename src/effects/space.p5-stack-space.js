export default {
  id: 'p5-stack-space', group: 'space', name: '坐标栈推入弹出', lib: 'p5.js',
  desc: '用一个中心点做钟摆，同时挂 3 个不同层级的小摆——靠 push/pop 保各自坐标系，互不污染。',
  deps: '无',
  note: 'p5 的 push/pop 必须成对，尤其在 loop() 里提前 return 会让栈深度无限增长直到 canvas 变形；正确做法是每个函数自带 push 和 pop 且中间不 return。用 canvas 2D 时记住 save/restore 不保存 globalAlpha 之外的状态很安全，但 save 会连同裁剪区一起恢复，嵌套里设 clip 要自己算好层级。',
  code: `// p5：每层 push/pop 隔离坐标系，父级角度自然传递到子级
function arm(level, len) {
  push();                          // 保存父坐标系
  rotate(sin(frameCount * 0.03 + level) * 0.5);
  translate(0, len);
  fill(200, 180, 255, 200 - level * 40);
  circle(0, 0, 10 - level * 2);
  if (level < 3) arm(level + 1, len * 0.72);
  pop();                           // 必须与 push 成对，且不能提前 return
}
// 每个 arm() 只关心"相对当前原点"的坐标，深度写成常量即可
// 反例：不加 push/pop 直接 rotate()，所有兄弟节点都会被累积旋转`,
  init(el) {
    const DPR = Math.min(2, el.ownerDocument.defaultView.devicePixelRatio || 1);
    const W = Math.min(300, el.clientWidth || 300), H = 130;
    const doc = el.ownerDocument;
    const cv = doc.createElement('canvas');
    cv.width = W * DPR; cv.height = H * DPR;
    cv.style.width = W + 'px'; cv.style.height = H + 'px'; cv.style.display = 'block';
    const ctx = cv.getContext('2d');
    ctx.scale(DPR, DPR);
    el.innerHTML = ''; el.appendChild(cv);
    let raf = 0;
    const destroy = () => cancelAnimationFrame(raf);
    const arm = (level, len, phase, parentX, parentY, parentAng) => {
      // 相当于 push → 变换 → 递归 → pop
      const ang = parentAng + Math.sin(phase + level * 0.9) * (0.55 - level * 0.1);
      const x = parentX + Math.sin(ang) * len;
      const y = parentY + Math.cos(ang) * len;
      ctx.save();
      ctx.strokeStyle = 'rgba(140,120,255,' + (0.85 - level * 0.14).toFixed(2) + ')';
      ctx.lineWidth = Math.max(1, 5 - level * 1.2);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(parentX, parentY);
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.fillStyle = level === 3 ? '#3fd0ff' : 'rgba(200,190,255,.9)';
      ctx.beginPath();
      ctx.arc(x, y, Math.max(1.5, 7 - level * 1.6), 0, 6.2832);
      ctx.fill();
      // 子摆：每个子节点都基于"当前"顶点重新推栈
      if (level < 3) {
        const kids = level === 0 ? 2 : 2;
        for (let k = 0; k < kids; k++) {
          arm(level + 1, len * 0.7, phase + (k - (kids - 1) / 2) * 0.25, x, y, ang + (k - (kids - 1) / 2) * 0.22);
        }
      }
      ctx.restore();
    };
    let phase = 0;
    const tick = () => {
      phase += 0.016;
      ctx.clearRect(0, 0, W, H);
      ctx.save();                                   // 顶层栈，所有兄弟共享同一原点
      arm(0, H * 0.3, phase, W / 2, 10, 0);
      ctx.restore();
      raf = requestAnimationFrame(tick);
    };
    tick();
    return destroy;
  }
};
