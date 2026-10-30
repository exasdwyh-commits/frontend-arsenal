export default {
  id: 'karaoke-fill', group: 'data', name: '卡拉OK逐词填色', lib: '原生 JS',
  desc: '旁白读到哪个词，哪个词就被从左到右填亮，读完再退回主墨色，强调色只属于「此刻」。移植自 video-shotcraft 的 Karaoke Fill Sync（Apache-2.0）。',
  deps: '无',
  note: '逐词独立双层叠放：底层低透明未读字，上层同文本用 mask 按词内进度线性揭开——揭开百分比就是进度，无需量测词宽（量词宽在换字体/响应式下会崩）。柔边用 ±4% 的渐变过渡而非硬切口，前沿才不生硬。读指下划线的右缘跟着填充前沿走，读完用一个 retract 从左往右收掉不留线。高亮必须按词级时间戳判断，别用 setInterval 累加（会漂移）。',
  code: `/* 逐词双层：底层未读 + 上层按进度 mask 揭开 */
.kw{position:relative;display:inline-block}
.kw .base{color:rgba(23,24,28,.13)}
.kw .fill{position:absolute;inset:0;color:#5b63d3;
  -webkit-mask-image:linear-gradient(90deg,#000 A%,transparent B%);
          mask-image:linear-gradient(90deg,#000 A%,transparent B%)}

// 词内进度 p（线性跟语速）→ 柔边 mask
var FEATHER = 4;
var p = clamp((t - w.start)/(w.end - w.start), 0, 1);   // 不加缓动
var edge = p*(100 + FEATHER*2) - FEATHER;               // 柔边中心 %
mask = 'linear-gradient(90deg,#000 ' + (edge-FEATHER) + '%,transparent ' + (edge+FEATHER) + '%)';

// 读指下划线：右缘跟前沿，读完从左收
line.style.left  = (retract * p * 100) + '%';
line.style.width = (Math.max(0, p - retract*p) * 100) + '%';`,
  init(el) {
    const STYLE = '<style data-fx="karaoke-fill">' +
      '.kf{display:flex;flex-direction:column;align-items:center;gap:10px;width:100%;height:100%;justify-content:center}' +
      '.kf-line{display:flex;gap:16px;font-size:26px;font-weight:800;letter-spacing:-.01em;line-height:1.18}' +
      '.kw{position:relative;display:inline-block}' +
      '.kw .base{color:rgba(200,205,220,.18)}' +
      '.kw .fill{position:absolute;left:0;top:0;color:#6c8cff}' +
      '.kw .caret{position:absolute;bottom:-5px;height:4px;border-radius:2px;background:#6c8cff;box-shadow:0 2px 8px rgba(108,140,255,.5)}' +
      '.kf-wave{display:flex;align-items:center;justify-content:space-between;width:200px;height:20px;margin-top:6px}' +
      '.kf-wave i{width:3px;border-radius:2px;background:rgba(200,205,220,.2)}' +
      '.kf-cap{font-size:8.5px;color:#5b6478;letter-spacing:.12em;text-transform:uppercase}' +
      '</style>';

    // 词级时间表（模拟语速，词间停顿）
    const LINES = [
      [['FRAME', 0.2, 0.62], ['MOTION', 0.72, 1.45]],
      [['CRAFT', 1.62, 2.02], ['SHOTS', 2.12, 2.62]]
    ];
    const ALL = LINES.flat();

    let html = '';
    for (const words of LINES) {
      html += '<div class="kf-line">';
      for (const [text] of words) {
        html += '<span class="kw"><span class="base">' + text + '</span><span class="fill">' + text + '</span><span class="caret"></span></span>';
      }
      html += '</div>';
    }

    // 旁白波形：40 根竖条
    let wave = '';
    for (let i = 0; i < 40; i++) wave += '<i></i>';

    el.insertAdjacentHTML('beforeend', STYLE +
      '<div class="kf">' + html +
        '<div class="kf-wave" id="kfWave">' + wave + '</div>' +
        '<div class="kf-cap">读到哪词填到哪 · 词级时间戳</div>' +
      '</div>');

    const spans = [...el.querySelectorAll('.kw')];
    const bars = [...el.querySelectorAll('#kfWave i')];
    const DUR = 3.1;
    const clamp01 = x => x < 0 ? 0 : x > 1 ? 1 : x;

    // 每根波形条高度（确定性起伏）
    bars.forEach((b, i) => {
      const h = 0.2 + Math.abs(Math.sin(i * 91.7 + 13.1) * 43758.5 % 1) * 0.8;
      b.style.height = (h * 100) + '%';
    });

    let raf, start = 0;
    const tick = now => {
      if (!start) start = now;
      const t = ((now - start) / 1000) % (DUR + 0.6);

      spans.forEach((sp, i) => {
        const [, ts, te] = ALL[i];
        const p = clamp01((t - ts) / (te - ts));
        const FEATHER = 4;
        const edge = p * (100 + FEATHER * 2) - FEATHER;
        const fill = sp.querySelector('.fill');
        const caret = sp.querySelector('.caret');
        if (p > 0 && p < 1) {
          const m = 'linear-gradient(90deg,#000 ' + (edge - FEATHER).toFixed(2) + '%,transparent ' + (edge + FEATHER).toFixed(2) + '%)';
          fill.style.webkitMaskImage = m; fill.style.maskImage = m;
          fill.style.opacity = '1';
        } else if (p >= 1) { fill.style.webkitMaskImage = 'none'; fill.style.maskImage = 'none'; fill.style.opacity = '1'; }
        else fill.style.opacity = '0';

        // 读完退成主墨色
        const settle = clamp01((t - te) / 0.3);
        if (p >= 1) fill.style.color = 'rgb(' + Math.round(108 + (200 - 108) * settle) + ',' + Math.round(140 + (205 - 140) * settle) + ',' + Math.round(255 + (220 - 255) * settle) + ')';

        // 读指：读中跟随前沿，读完从左收
        const retract = clamp01((t - te) / 0.2);
        const showLine = t >= ts && retract < 1 && p < 1.2;
        caret.style.opacity = showLine ? '1' : '0';
        caret.style.left = (retract * p * 100).toFixed(2) + '%';
        caret.style.width = (Math.max(0, p - retract * p) * 100).toFixed(2) + '%';
      });

      // 波形已播部分着色
      const playhead = clamp01(t / DUR);
      bars.forEach((b, i) => b.style.background = (i / 40 <= playhead) ? '#6c8cff' : 'rgba(200,205,220,.2)');

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => { cancelAnimationFrame(raf); el.innerHTML = ''; };
  }
};
