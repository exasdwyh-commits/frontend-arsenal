export default {
  id: 'contact-shadow', group: 'feedback', name: '接触阴影抬升', lib: '纯 CSS + 原生 JS',
  desc: '卡片抬起时，桌面留下一层会「变大变虚变淡并偏移」的接触影——纸片离桌的距离是被影子证明的，不是被缩放暗示的。移植自 video-shotcraft 的 Contact Shadow Lift（Apache-2.0）。',
  deps: '无',
  note: '影子必须是独立躺在桌面 z=0 的一层，卡本体不带 box-shadow。抬升时接触核（小而实、几乎贴边）和环境影（大而软）同步演化：blur 变大、opacity 变低、向背光方向平移。两层缺一不可——只有接触核太硬，只有环境影太飘。transform 用 translate3d 抬起（配祖级 perspective）才真有纵深，纯 translate+scale 是假 3D。落地那下给 2f 的 scale<1 微压「卡壳」，手感立刻真实。',
  code: `/* 卡抬起：本体沿法线 translateZ，影子留在桌面 */
<div style="perspective:1400px"><div style="transform-style:preserve-3d">
  <!-- 环境影：大而软，随抬升扩散、偏右下 -->
  <div class="shadow ambient"></div>
  <!-- 接触核：贴边小而实，抬起后变大变虚变淡 -->
  <div class="shadow core"></div>
  <!-- 卡本体：不带 box-shadow -->
  <div class="card" style="transform:translate3d(0,0,Zpx)"></div>
</div></div>

/* 抬升量 l:0→1 驱动两层影子 */
ambient: blur(14+40l)px, opacity .09+.13l, translate((10+40l),(16+60l));
core:    blur(3+22l)px,  opacity .32-.18l, translate((2+18l),(4+36l));

/* 落地卡壳：2f scale<1 */
if(t>=32) s=0.99; else if(t>=31) s=0.99;`,
  init(el) {
    const STYLE = '<style data-fx="contact-shadow">' +
      '.cs{position:relative;width:100%;height:100%;perspective:1200px;display:flex;align-items:center;justify-content:center;overflow:hidden}' +
      '.cs-table{position:relative;transform-style:preserve-3d;transform:rotateX(24deg);display:flex;gap:10px}' +
      '.cs-slot{position:relative;width:64px;height:84px}' +
      '.cs-card{position:absolute;inset:0;border-radius:9px;box-sizing:border-box;overflow:hidden;' +
        'background:linear-gradient(180deg,#fff,#f8faff);border:1px solid rgba(20,24,34,.08);' +
        'padding:9px;font-family:system-ui,sans-serif;color:#17181c;will-change:transform}' +
      '.cs-glyph{width:20px;height:20px;border-radius:6px;background:rgba(91,99,211,.08);display:flex;align-items:center;justify-content:center}' +
      '.cs-glyph svg{width:12px;height:12px;stroke:#5b63d3;fill:none;stroke-width:1.9}' +
      '.cs-tag{font-size:6px;font-weight:650;letter-spacing:.12em;color:#5a5568;margin-top:9px;text-transform:uppercase}' +
      '.cs-hrs{font-size:22px;font-weight:780;letter-spacing:-.05em;line-height:.92;margin-top:3px}' +
      '.cs-note{font-size:7px;color:#5a5568;margin-top:6px;line-height:1.3}' +
      '.cs-days{position:absolute;left:9px;right:9px;bottom:8px;display:flex;gap:2px}' +
      '.cs-days i{flex:1;height:10px;border-radius:3px;background:rgba(20,24,34,.05);font-style:normal}' +
      '.cs-days i.on{background:#5b63d3}' +
      '.cs-sh{position:absolute;inset:0;border-radius:9px;pointer-events:none;will-change:transform,filter,opacity}' +
      '.cs-amb{background:rgba(20,24,34,.2)}' +
      '.cs-core{background:rgba(20,24,34,.4)}' +
      '.cs-cap{position:absolute;bottom:8px;left:0;right:0;text-align:center;font-size:8px;color:#4a5368;letter-spacing:.1em;text-transform:uppercase}' +
      '</style>';

    const cards = [
      ['Whip pan', '8f', 'A blurred hand-off.', [0, 1, 0, 1, 0, 0, 0]],
      ['Crash zoom', '12f', 'Punch in on the number.', [1, 0, 1, 0, 1, 1, 0]],
      ['Logo sting', '24f', 'Lands the mark.', [1, 1, 1, 1, 1, 0, 0]]
    ];

    let slots = '';
    cards.forEach((c, i) => {
      let days = c[3].map(on => '<i class="' + (on ? 'on' : '') + '"></i>').join('');
      slots += '<div class="cs-slot" data-i="' + i + '">' +
        '<div class="cs-sh cs-amb"></div><div class="cs-sh cs-core"></div>' +
        '<div class="cs-card">' +
          '<div class="cs-glyph"><svg viewBox="0 0 24 24"><path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5"/></svg></div>' +
          '<div class="cs-tag">' + c[0] + '</div>' +
          '<div class="cs-hrs">' + c[1] + '</div>' +
          '<div class="cs-note">' + c[2] + '</div>' +
          '<div class="cs-days">' + days + '</div>' +
        '</div></div>';
    });

    el.insertAdjacentHTML('beforeend', STYLE +
      '<div class="cs"><div class="cs-table" id="csTable">' + slots + '</div>' +
      '<div class="cs-cap">抬起时影子证明距离</div></div>');

    const slotsEl = [...el.querySelectorAll('.cs-slot')];
    const outCubic = t => 1 - Math.pow(1 - clamp01(t), 3);
    const inCubic = t => Math.pow(clamp01(t), 3);
    const clamp01 = x => x < 0 ? 0 : x > 1 ? 1 : x;

    const LIFT_Z = 40;
    // 前两张轻快点名（会落回），第三张选定（不落回）
    const SCANS = [10, 40], PICK = 70;
    const scanMotion = t => {
      if (t < 0 || t >= 34) return 0;
      const up = outCubic(t / 10), down = inCubic((t - 24) / 8);
      let lift = up - down;
      if (t >= 10 && t < 24) lift += 0.05 * Math.sin((t - 10) / 14 * Math.PI);
      return Math.max(0, lift);
    };
    const pickMotion = f => f < PICK ? 0 : (function (k) { return 1.15 * k; })(clamp01(1 - Math.exp(-5 * (f - PICK) / 14) * Math.cos((f - PICK) * 0.7)));

    const DUR = 120;
    let raf, start = 0;
    const tick = now => {
      if (!start) start = now;
      const f = ((now - start) / 1000 * 30) % (DUR + 10);

      slotsEl.forEach((s, i) => {
        const lift = Math.min(1.2, i < 2 ? scanMotion(f - SCANS[i]) : pickMotion(f));
        const card = s.querySelector('.cs-card');
        const amb = s.querySelector('.cs-amb');
        const core = s.querySelector('.cs-core');
        const z = LIFT_Z * lift;
        card.style.transform = 'translate3d(0,0,' + (2 + z).toFixed(1) + 'px)';
        // 环境影
        amb.style.filter = 'blur(' + (10 + 22 * lift).toFixed(1) + 'px)';
        amb.style.opacity = (0.14 + 0.14 * lift).toFixed(3);
        amb.style.transform = 'translate3d(' + (6 + 18 * lift).toFixed(1) + 'px,' + (8 + 24 * lift).toFixed(1) + 'px,0.5px) scale(' + (1 + 0.06 * lift).toFixed(3) + ')';
        // 接触核
        core.style.filter = 'blur(' + (2 + 12 * lift).toFixed(1) + 'px)';
        core.style.opacity = (0.3 - 0.16 * lift).toFixed(3);
        core.style.transform = 'translate3d(' + (1 + 8 * lift).toFixed(1) + 'px,' + (2 + 14 * lift).toFixed(1) + 'px,1px) scale(' + (0.99 + 0.05 * lift).toFixed(3) + ')';
      });

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => { cancelAnimationFrame(raf); el.innerHTML = ''; };
  }
};
