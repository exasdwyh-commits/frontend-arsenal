export default {
  id: 'portrait-alive', group: 'space', name: '静图复活', lib: 'LivePortrait 的浏览器等价物（纯 CSS/JS 微动）',
  desc: '一张不会动的人像被"点活"：呼吸、随机眨眼、眼珠跟着指针、头轻微转向。',
  deps: '无（真·人像驱动要跑模型，这里是把"活着"的那几个信号手工做出来）',
  note: '让人像"活"的不是大动作，是三层滞后：眼珠先动（几乎无延迟）、头随后（约 80ms 追上）、呼吸从不与两者同步。眨眼必须随机间隔（2~6s），固定节奏比不眨更像机器人。幅度是硬上限：头部超过 6° 立刻变假，眼珠位移超过瞳孔半径的一半就会"翻白眼"。真实驱动（LivePortrait）是把这些信号从一段视频里学出来再迁移，浏览器这层只负责把参数转成 transform。',
  code: `/* 三层滞后：眼珠跟手、头部慢追、呼吸不同步 */
eye.style.transform = \`translate(\${nx * 2.4}px, \${ny * 2}px)\`;
headY += (targetY - headY) * .12;         // 头部慢追，约 80ms 到位
head.style.transform =
  \`rotateY(\${headY}deg) rotateX(\${headX}deg) scale(\${1 + Math.sin(t / 670) * .006})\`;
/* 眨眼：随机 2~6s，眼皮 scaleY 0→1→0，90ms 一闭 */
setTimeout(blink, 2000 + Math.random() * 4000);`,
  init(el) {
    el.innerHTML = `<div class="pa-stage" style="position:absolute;inset:0;display:grid;place-items:center;
      perspective:760px;overflow:hidden">
      <div class="pa-card" style="position:relative;width:190px;height:190px;border-radius:14px;
        background:linear-gradient(165deg,#141a2b,#0b0e17 60%);
        box-shadow:0 0 0 1px rgba(255,255,255,.08),0 18px 40px -18px rgba(0,0,0,.9);
        display:grid;place-items:center;transform-style:preserve-3d">
        <div class="pa-body" style="position:absolute;bottom:10px;left:50%;width:112px;height:66px;
          margin-left:-56px;border-radius:56px 56px 12px 12px;
          background:linear-gradient(180deg,#26314a,#1a2336);
          box-shadow:inset 0 1px 0 rgba(255,255,255,.08)"></div>
        <div class="pa-head" style="position:relative;width:112px;height:132px;border-radius:56px 56px 46px 46px;
          background:linear-gradient(178deg,#e8c9a8,#cf9f7c 62%,#b98866);
          box-shadow:inset 0 -10px 22px rgba(120,70,45,.35),0 10px 24px -12px rgba(0,0,0,.8);
          transform-style:preserve-3d;margin-bottom:26px">
          <div class="pa-hair" style="position:absolute;left:-6px;right:-6px;top:-8px;height:56px;
            border-radius:62px 62px 26px 26px;
            background:linear-gradient(180deg,#2a1f1c,#3b2a24 70%,#33231f)"></div>
          <div class="pa-ear pa-ear-l" style="position:absolute;left:-7px;top:64px;width:14px;height:22px;
            border-radius:9px;background:linear-gradient(180deg,#d9ae8b,#c1957a)"></div>
          <div class="pa-ear pa-ear-r" style="position:absolute;right:-7px;top:64px;width:14px;height:22px;
            border-radius:9px;background:linear-gradient(180deg,#d9ae8b,#c1957a)"></div>
          <div class="pa-eye pa-l" style="position:absolute;left:24px;top:62px;width:24px;height:12px;
            border-radius:50%;background:#f6f1ea;overflow:hidden;box-shadow:inset 0 1px 2px rgba(0,0,0,.18)">
            <i style="position:absolute;left:50%;top:50%;width:9px;height:9px;margin:-4.5px 0 0 -4.5px;
              border-radius:50%;background:#2a2118;display:block"></i></div>
          <div class="pa-eye pa-r" style="position:absolute;right:24px;top:62px;width:24px;height:12px;
            border-radius:50%;background:#f6f1ea;overflow:hidden;box-shadow:inset 0 1px 2px rgba(0,0,0,.18)">
            <i style="position:absolute;left:50%;top:50%;width:9px;height:9px;margin:-4.5px 0 0 -4.5px;
              border-radius:50%;background:#2a2118;display:block"></i></div>
          <div class="pa-lid pa-lid-l" style="position:absolute;left:24px;top:62px;width:24px;height:12px;
            border-radius:50% 50% 40% 40%;background:linear-gradient(180deg,#e2bf9e,#d3a985);
            transform-origin:top center;transform:scaleY(0)"></div>
          <div class="pa-lid pa-lid-r" style="position:absolute;right:24px;top:62px;width:24px;height:12px;
            border-radius:50% 50% 40% 40%;background:linear-gradient(180deg,#e2bf9e,#d3a985);
            transform-origin:top center;transform:scaleY(0)"></div>
          <div class="pa-mouth" style="position:absolute;left:50%;bottom:26px;width:26px;height:8px;
            margin-left:-13px;border-radius:0 0 14px 14px;
            background:linear-gradient(180deg,#8d4f4a,#b4635c);opacity:.85"></div>
        </div>
        <span class="pa-hud" style="position:absolute;left:10px;bottom:8px;
          font:9px/1 ui-monospace,Consolas,monospace;letter-spacing:.1em;color:#7b8494"></span>
      </div>
    </div>`;

    const stage = el.querySelector('.pa-stage');
    const card = el.querySelector('.pa-card');
    const head = el.querySelector('.pa-head');
    const hud = el.querySelector('.pa-hud');
    const lids = [el.querySelector('.pa-lid-l'), el.querySelector('.pa-lid-r')];
    const pupils = [el.querySelector('.pa-eye.pa-l i'), el.querySelector('.pa-eye.pa-r i')];

    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let tx = 0, ty = 0, hx = 0, hy = 0, ex = 0, ey = 0;
    let blinkT = 0, raf = 0, alive = true;
    const blinkAt = [];

    const move = e => {
      const r = card.getBoundingClientRect();
      /* 归一化到 [-1,1]，头部只取 6 成、眼珠取满 */
      tx = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width - .5) * 2));
      ty = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height - .5) * 2));
    };
    const leave = () => { tx = 0; ty = 0; };
    stage.addEventListener('pointermove', move);
    stage.addEventListener('pointerleave', leave);

    /* 眨眼：随机间隔，眼皮从 0 压到 1 再回去；两边永远同步 */
    const blink = () => {
      if (!alive) return;
      lids.forEach(l => { l.style.transition = 'transform .075s ease-in'; l.style.transform = 'scaleY(1)'; });
      setTimeout(() => {
        if (!alive) return;
        lids.forEach(l => { l.style.transition = 'transform .13s ease-out'; l.style.transform = 'scaleY(0)'; });
      }, 90);
      blinkT = 2200 + Math.random() * 3800;
      blinkAt.push(Date.now());
      if (blinkAt.length > 3) blinkAt.shift();
      setTimeout(blink, blinkT);
    };
    if (!reduce) setTimeout(blink, 1400 + Math.random() * 1200);

    const loop = now => {
      /* 头：慢追（0.12）；眼珠：快追（0.35）。两层不同步是"活"的关键 */
      hx += (ty * 4.2 - hx) * .12;
      hy += (tx * 5.4 - hy) * .12;
      ex += (tx * 2.4 - ex) * .35;
      ey += (ty * 2.0 - ey) * .35;
      const breath = Math.sin(now / 670) * .006;
      head.style.transform =
        `rotateX(${hx.toFixed(2)}deg) rotateY(${hy.toFixed(2)}deg) translateZ(0) scale(${(1 + breath).toFixed(4)})`;
      pupils.forEach(p => { p.style.transform = `translate(${ex.toFixed(2)}px,${ey.toFixed(2)}px)`; });
      if (hud && now % 12 < 2) {
        hud.textContent = `HEAD ${hy >= 0 ? '+' : ''}${hy.toFixed(1)}° / ${hx >= 0 ? '+' : ''}${hx.toFixed(1)}°` +
          (blinkT ? ` · BLINK ${(blinkT / 1000).toFixed(1)}s` : '');
      }
      raf = requestAnimationFrame(loop);
    };
    if (reduce) {
      hud.textContent = '动效已关 · 只留静态人像';
    } else {
      raf = requestAnimationFrame(loop);
    }
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      stage.removeEventListener('pointermove', move);
      stage.removeEventListener('pointerleave', leave);
    };
  }
};
