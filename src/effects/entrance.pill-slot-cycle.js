export default {
  id: 'pill-slot-cycle', group: 'entrance', name: '词槽老虎机', lib: '原生 JS + CSS 3D',
  desc: '固定句干末尾的词槽像老虎机：旧词上飞淡出、新词从下带纵向运动模糊翻入，连换几拍后句子落定。移植自 video-shotcraft 的 Pill Slot Cycle（Apache-2.0）。',
  deps: '无',
  note: '槽宽度用一个 visibility:hidden 的「当前词」撑住，绝对定位的新旧词在它之上飞进飞出——这样句子左端纹丝不动，不会因词长不同而抖动。绕滚筒翻入靠 transform-origin 分上下：入场 origin 在顶（rotateX -38°→0，像翻上来），出场 origin 在底（0→34°，像翻下去），配 perspective 才有滚筒感。纵向运动模糊按真实速度算（相邻两帧位移差），静止时必须归 0，否则糊死。词长不一的槽要用 inline-block + 绝对定位叠放，别让 flex 去排。',
  code: `/* 槽 = 隐藏占位撑宽 + 绝对定位的旧/新词叠放飞进飞出 */
<div style="position:relative;display:inline-block;perspective:1400px">
  <span style="visibility:hidden">当前词</span>          /* 撑槽宽，句子不抖 */
  <div class="old" style="transform-origin:50% 100%;
       transform:translateY(Ypx) rotateX(34deg)">旧词</div>  /* 向上翻出 */
  <div class="new" style="transform-origin:50% 0;
       transform:translateY(Ypx) rotateX(-38deg)">新词</div> /* 从下翻入 */
</div>

/* 纵向运动模糊：速度驱动，静止归 0 */
v = Math.abs(y(f+0.5) - y(f-0.5));
if (v > 0.3) filter = 'blur(0 ' + Math.min(14, v*0.5) + 'px)';

/* 每拍 BEAT 帧换一词，旧词出场 8 帧、新词入场 8 帧 */
idx = Math.min(floor((f-INTRO)/BEAT), N-1);`,
  init(el) {
    const STYLE = '<style data-fx="pill-slot-cycle">' +
      '.ps{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:8px;font-family:system-ui,sans-serif;overflow:hidden;background:linear-gradient(180deg,#f5f1e8,#efe9dc)}' +
      '.ps-line{display:flex;align-items:center;gap:8px;font-size:19px;font-weight:800;color:#1b1916;letter-spacing:-.03em;white-space:nowrap}' +
      '.ps-stem{opacity:0;filter:blur(6px)}' +
      '.ps-slot{position:relative;display:inline-block;perspective:900px}' +
      '.ps-ghost{visibility:hidden}' +
      '.ps-word{position:absolute;left:0;top:0;display:inline-flex;align-items:center;gap:7px;' +
        'padding:5px 12px 5px 7px;border-radius:999px;background:linear-gradient(180deg,#fff,#fafafb);' +
        'border:1px solid rgba(20,22,28,.1);box-shadow:inset 0 1px 0 #fff,0 6px 14px -6px rgba(16,18,24,.25);' +
        'font-weight:700;color:#17181c;white-space:nowrap;will-change:transform,opacity}' +
      '.ps-ico{width:18px;height:18px;border-radius:6px;background:rgba(91,99,211,.1);display:flex;align-items:center;justify-content:center}' +
      '.ps-ico svg{width:12px;height:12px;stroke:#5b63d3;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}' +
      '.ps-cap{font-size:8.5px;color:#8a8578;letter-spacing:.1em;text-transform:uppercase}' +
      '.ps-svg{position:absolute;width:0;height:0}' +
      '</style>';

    // 六拍词 + 收束
    const WORDS = [
      ['Board it', 'M3 5h18v14H3zM12 5v14M3 12h18'],
      ['Capture', 'M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2'],
      ['Camera', 'M3 7h11v9H3zM14 10l5-3v9l-5-3'],
      ['On beat', 'M5 10v4M9 7v10M12 4v16M15 8v8M19 10v4'],
      ['Sound', 'M4 9h3l4-3v12l-4-3H4zM15 9a4 4 0 0 1 0 6'],
      ['Render', 'M3 6h18v12H3zM10 9v6l5-3z']
    ];
    const STEM = 'One skill to';
    const FINALE = 'do it all.';
    const BEAT = 15, INTRO = 10, SWAP = 7;

    const ico = d => '<span class="ps-ico"><svg viewBox="0 0 24 24"><path d="' + d + '"/></svg></span>';
    let ghosts = '', words = '';
    WORDS.forEach((w, i) => {
      ghosts += '<span class="ps-ghost">' + ico(w[1]) + w[0] + '</span>';
      words += '<span class="ps-word" data-i="' + i + '">' + ico(w[1]) + w[0] + '</span>';
    });

    el.insertAdjacentHTML('beforeend', STYLE +
      '<div class="ps"><div class="ps-line"><span class="ps-stem" id="psStem">' + STEM + '</span>' +
      '<span class="ps-slot">' + ghosts + words +
        '<span class="ps-word" id="psFin" style="opacity:0">' + FINALE + '</span>' +
      '</span></div><div class="ps-cap">句干不动 · 词槽翻滚换字</div></div>');

    const stem = el.querySelector('#psStem');
    const fin = el.querySelector('#psFin');
    const wordEls = [...el.querySelectorAll('.ps-word[data-i]')];
    const clamp01 = x => x < 0 ? 0 : x > 1 ? 1 : x;
    const snappy = u => 1 - Math.pow(1 - clamp01(u), 3);
    const exit = u => Math.pow(clamp01(u), 2.4);

    const CYCLE = INTRO + WORDS.length * BEAT + 40;
    let raf, start = 0;
    const tick = now => {
      if (!start) start = now;
      const f = ((now - start) / 1000 * 30) % CYCLE;

      // 句干入场
      const st = snappy((f - 0) / INTRO);
      stem.style.opacity = st.toFixed(3);
      stem.style.filter = st < 0.98 ? 'blur(' + ((1 - st) * 6).toFixed(2) + 'px)' : 'none';

      const rel = f - INTRO;
      const cycleEnd = WORDS.length * BEAT;
      const finale = f >= cycleEnd;

      wordEls.forEach((w, i) => {
        if (finale) { w.style.opacity = '0'; return; }
        const t = rel - i * BEAT;
        if (t < -SWAP || t > BEAT + 1) { w.style.opacity = '0'; return; }
        // 入场 0→SWAP，然后驻留到下一拍
        const inU = snappy(t / SWAP);
        const y = (1 - inU) * 70;
        const v = Math.abs((1 - snappy((t + 0.5) / SWAP)) * 70 - (1 - snappy((t - 0.5) / SWAP)) * 70);
        const blur = Math.min(9, v * 0.5);
        const rot = -38 * (1 - inU);
        const scale = 0.94 + 0.06 * inU;
        w.style.opacity = Math.min(1, inU * 1.6).toFixed(3);
        w.style.transformOrigin = '50% 0';
        w.style.transform = 'translateY(' + y.toFixed(1) + 'px) rotateX(' + rot.toFixed(1) + 'deg) scale(' + scale.toFixed(3) + ')';
        w.style.filter = blur > 0.4 ? 'blur(0 ' + blur.toFixed(2) + 'px)' : 'none';
      });

      // 收束：最后一词飞出，"do it all." 从下落位（带过冲）
      if (finale) {
        const u = clamp01((f - cycleEnd) / 14);
        const back = 1 + 1.4 * Math.pow(u - 1, 3) + 1.4 * Math.pow(u - 1, 2);
        fin.style.opacity = Math.min(1, u * 1.4).toFixed(3);
        fin.style.transform = 'translateY(' + ((1 - back) * 55).toFixed(1) + 'px)';
      } else fin.style.opacity = '0';

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => { cancelAnimationFrame(raf); el.innerHTML = ''; };
  }
};
