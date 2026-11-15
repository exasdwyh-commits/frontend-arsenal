export default {
  id: 'photo-to-3d', group: 'space', name: '图片立体化', lib: 'CSS 3D（TRELLIS / Hunyuan3D-2 的浏览器等价物）',
  desc: '一张平面图被"挤出"成有厚度的盒子：拖它就转，松手自己慢慢回正。',
  deps: '无（真·图生 3D 要跑模型，这里是把同一张图贴到六个面）',
  note: '这条路能做的只是"假厚度"：正面用原图，侧面用同一张图压暗过一层，拐角靠 border 收边。真正的图生 3D（TRELLIS、Hunyuan3D-2）输出的是带纹理网格，得在服务端或 GPU 上跑，浏览器只负责加载 glb。做交互时把 transform-style:preserve-3d 加在父级，加在子级没用；面片要 backface-visibility:hidden，否则背面的图会透过来。',
  code: `.stage{perspective:900px}
.box{transform-style:preserve-3d;transition:transform .6s cubic-bezier(.2,.8,.2,1)}
.face{position:absolute;inset:0;backface-visibility:hidden}
/* 六个面就是同一张图旋转 + 位移：厚度 = 两次 translateZ 的差 */
.front {transform:translateZ(22px)}
.back  {transform:rotateY(180deg) translateZ(22px);filter:brightness(.35)}
.right {transform:rotateY(90deg)  translateZ(66px);filter:brightness(.6)}
.left  {transform:rotateY(-90deg) translateZ(66px);filter:brightness(.6)}`,
  init(el) {
    el.innerHTML = `<div style="position:absolute;inset:0;display:grid;place-items:center;overflow:hidden">
      <div class="p3-stage" style="perspective:900px;width:100%;height:100%;display:grid;place-items:center;cursor:grab">
        <div class="p3-box" style="position:relative;width:132px;height:88px;transform-style:preserve-3d;
          transform:rotateX(-16deg) rotateY(-24deg);transition:transform .5s cubic-bezier(.2,.8,.2,1)">
        </div>
      </div>
    </div>`;
    const stage = el.querySelector('.p3-stage');
    const box = el.querySelector('.p3-box');

    /* 一张"照片"用渐变画：不引资源，六个面共用同一个 background */
    const art = 'radial-gradient(circle at 30% 26%,#ffd479,transparent 42%),' +
      'radial-gradient(circle at 74% 72%,#3ccbff,transparent 46%),' +
      'linear-gradient(148deg,#2a1f5e,#0b0e1a 62%,#123049)';

    const face = (t, extra) => {
      const d = document.createElement('div');
      d.style.cssText = 'position:absolute;inset:0;border-radius:6px;border:1px solid rgba(255,255,255,.16);' +
        'background:' + art + ';background-size:cover;backface-visibility:hidden;' + extra;
      d.style.transform = t;
      box.appendChild(d);
      return d;
    };
    const D = 22;                                  /* 厚度的一半 */
    const W = 132, H = 88;
    face('translateZ(' + D + 'px)', 'box-shadow:0 0 0 1px rgba(255,255,255,.08) inset');
    face('rotateY(180deg) translateZ(' + D + 'px)', 'filter:brightness(.3)');
    /* 侧面：横向拉成厚度宽的窄条 */
    const sideStyle = 'width:' + (D * 2) + 'px;left:auto;right:auto;top:0;height:' + H + 'px;' +
      'background:#26314a;filter:brightness(.62)';
    const mkSide = (t, color) => {
      const d = document.createElement('div');
      d.style.cssText = 'position:absolute;border-radius:2px;border:1px solid rgba(255,255,255,.1);' +
        sideStyle + ';background:' + color + ';backface-visibility:hidden;transform-origin:center;' + t;
      box.appendChild(d);
    };
    mkSide('left:50%;margin-left:-' + D + 'px;transform:rotateY(90deg) translateZ(' + (W / 2) + 'px)', '#1b2438');
    mkSide('left:50%;margin-left:-' + D + 'px;transform:rotateY(-90deg) translateZ(' + (W / 2) + 'px)', '#1b2438');
    const topBottom = (t, color) => {
      const d = document.createElement('div');
      d.style.cssText = 'position:absolute;left:0;width:' + W + 'px;height:' + (D * 2) + 'px;' +
        'border-radius:2px;border:1px solid rgba(255,255,255,.08);background:' + color +
        ';backface-visibility:hidden;' + t;
      box.appendChild(d);
    };
    topBottom('top:50%;margin-top:-' + D + 'px;transform:rotateX(90deg) translateZ(' + (H / 2) + 'px)', '#1b2438');
    topBottom('top:50%;margin-top:-' + D + 'px;transform:rotateX(-90deg) translateZ(' + (H / 2) + 'px)', '#141b2b');

    let rx = -16, ry = -24, spin = 0, drag = false, px = 0, py = 0, raf = 0, idle = 0;
    const paint = () => { box.style.transform = 'rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg)'; };

    const down = e => {
      drag = true; idle = 0; px = e.clientX; py = e.clientY;
      box.style.transition = 'none';
      stage.style.cursor = 'grabbing';
      stage.setPointerCapture?.(e.pointerId);
    };
    const move = e => {
      if (!drag) return;
      ry += (e.clientX - px) * 0.6;
      rx = Math.max(-58, Math.min(58, rx - (e.clientY - py) * 0.45));
      px = e.clientX; py = e.clientY;
      paint();
    };
    const up = () => {
      if (!drag) return;
      drag = false;
      /* 松手回正：把角度收敛回"能看清正面"的姿势 */
      box.style.transition = 'transform .6s cubic-bezier(.2,.8,.2,1)';
      ry = -24; rx = -16; paint();
      stage.style.cursor = 'grab';
    };
    stage.addEventListener('pointerdown', down);
    stage.addEventListener('pointermove', move);
    stage.addEventListener('pointerup', up);
    stage.addEventListener('pointercancel', up);

    /* 没人碰的时候慢慢转，说明它是有厚度的 */
    const loop = () => {
      if (!drag) {
        idle += 1;
        if (idle > 90) {                       /* 回正后停 1.5s 再自转 */
          spin += 0.35;
          box.style.transition = 'transform .2s linear';
          ry = -24 + Math.sin(spin * Math.PI / 180) * 34;
          paint();
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      stage.removeEventListener('pointerdown', down);
      stage.removeEventListener('pointermove', move);
      stage.removeEventListener('pointerup', up);
      stage.removeEventListener('pointercancel', up);
    };
  }
};
