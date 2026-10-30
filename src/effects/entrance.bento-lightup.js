export default {
  id: 'bento-lightup', group: 'entrance', name: 'Bento 逐格点亮', lib: 'SVG + 原生 JS',
  desc: '暗场里一墙 bento 卡随节拍逐格通电：一道「彗星」流光先描一圈边，格内内容随后提亮上浮弹出。移植自 video-shotcraft 的 Bento Light Up（Apache-2.0）。',
  deps: '无',
  note: '边框流光用「彗星段」实现——一段占 pathLength=100 的短 dash（约 22%）沿 rect 跑，跑完后淡去，同时一条 strokeDashoffset 从 100→0 的常亮细边接力留下，读作「描完退火成边框」。pathLength 归一化后 dash 数学全是百分比，跟实际周长解耦。内容用 opacity+translateY 提亮上浮（back-out 过冲）。整面别一上来全亮——暗态先铺满，逐格通电的对比才在。',
  code: `/* 彗星段：短 dash 沿 rect 跑一圈（pathLength=100 归一化） */
<rect pathLength="100" stroke-dasharray="22 78"
      stroke-dashoffset="22 - head"/>   /* head=100*draw，draw 0→1 */

/* 常亮细边：随彗星走过逐段出现，跑完退火保留 */
<rect pathLength="100" stroke-dasharray="100"
      stroke-dashoffset="100*(1-draw)" opacity="ring*strokeFade"/>

/* 内容：描边过半后接力，back-out 上浮弹出 */
lit   = interp(f,[s+6,s+14],[0,1], outCubic);
rise  = interp(f,[s+6,s+14],[0,1], bezier(.3,1.4,.5,1));   // 过冲
opacity = .18 + .82*lit;
ty    = 20*(1-rise);

/* 点亮瞬间一层暖光脉冲（裁在圆角内，pulse 后归零） */
pulse = lit*(1-lit)*4;`,
  init(el) {
    const STYLE = '<style data-fx="bento-lightup">' +
      '.bl{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:5px;overflow:hidden}' +
      '.bl-title{font-size:10px;font-weight:700;color:#f1efe9;letter-spacing:-.02em;margin-bottom:2px}' +
      '.bl-grid{display:grid;grid-template-columns:1.25fr .875fr .875fr;gap:5px;width:230px}' +
      '.bl-row2{display:grid;grid-template-columns:.875fr .875fr 1.25fr;gap:5px;width:230px;margin-top:5px}' +
      '.bl-cell{position:relative;height:36px;border-radius:7px;box-sizing:border-box;overflow:visible}' +
      '.bl-fill{position:absolute;inset:0;border-radius:7px;background:linear-gradient(160deg,#22261c,#0f110c);opacity:.18;transition:none}' +
      '.bl-content{position:absolute;inset:0;border-radius:7px;padding:5px 7px;box-sizing:border-box;font-family:system-ui,sans-serif;opacity:.18}' +
      '.bl-hd{font-size:5px;font-weight:600;color:#8b93a8;letter-spacing:.08em;text-transform:uppercase}' +
      '.bl-big{font-size:14px;font-weight:750;color:#f1efe9;letter-spacing:-.03em;margin-top:1px}' +
      '.bl-pulse{position:absolute;inset:0;border-radius:7px;pointer-events:none;background:radial-gradient(90% 70% at 50% 0%,rgba(232,180,94,.3),rgba(232,180,94,0) 70%);opacity:0}' +
      '.bl-svg{position:absolute;left:0;top:0;overflow:visible;pointer-events:none}' +
      '.bl-cap{font-size:8px;color:#6b6480;letter-spacing:.1em;text-transform:uppercase;margin-top:4px}' +
      '</style>';

    // 两行宽窄互补
    const ROW1 = [['TODAY', '6'], ['RENDER', '3'], ['WEEK', '24']];
    const ROW2 = [['SHOTS', '12'], ['FILMS', '8'], ['FRAMES', '240']];
    const W1 = ['1.25fr', '.875fr', '.875fr'];
    const W2 = ['.875fr', '.875fr', '1.25fr'];

    let idx = 0;
    const cell = (d, w) => {
      const i = idx++;
      return '<div class="bl-cell" data-i="' + i + '" style="grid-column:span 1">' +
        '<div class="bl-fill"></div>' +
        '<div class="bl-content"><div class="bl-hd">' + d[0] + '</div><div class="bl-big">' + d[1] + '</div></div>' +
        '<div class="bl-pulse"></div>' +
        '<svg class="bl-svg" width="100%" height="100%"><rect x=".75" y=".75" width="calc(100% - 1.5px)" height="calc(100% - 1.5px)" rx="7" fill="none" stroke="#e8b45e" stroke-width="1.5" pathLength="100" stroke-dasharray="100" stroke-dashoffset="100" class="bl-ring" opacity="0"/>' +
        '<rect x="1.5" y="1.5" width="calc(100% - 3px)" height="calc(100% - 3px)" rx="7" fill="none" stroke="#e8b45e" stroke-width="4" stroke-linecap="round" pathLength="100" stroke-dasharray="22 78" class="bl-comet" opacity="0"/>' +
        '<rect x="1.5" y="1.5" width="calc(100% - 3px)" height="calc(100% - 3px)" rx="7" fill="none" stroke="#ffe3ae" stroke-width="1.8" stroke-linecap="round" pathLength="100" stroke-dasharray="10 90" class="bl-comet2" opacity="0"/></svg>' +
      '</div>';
    };

    let g1 = '', g2 = '';
    ROW1.forEach(d => g1 += cell(d));
    ROW2.forEach(d => g2 += cell(d));

    el.insertAdjacentHTML('beforeend', STYLE +
      '<div class="bl"><div class="bl-title">Every shot, tuned in one place.</div>' +
      '<div class="bl-grid">' + g1 + '</div>' +
      '<div class="bl-row2">' + g2 + '</div>' +
      '<div class="bl-cap">彗星描边 → 逐格通电</div></div>');

    const cells = [...el.querySelectorAll('.bl-cell')];
    const FIRST = 16, GAP = 10, DUR = 120;
    const clamp01 = x => x < 0 ? 0 : x > 1 ? 1 : x;
    const outCubic = u => 1 - Math.pow(1 - clamp01(u), 3);
    const outQuad = u => 1 - Math.pow(1 - clamp01(u), 2);
    const bez = (u, c) => 1 + (c + 1) * Math.pow(clamp01(u) - 1, 3) + c * Math.pow(clamp01(u) - 1, 2);

    let raf, start = 0;
    const tick = now => {
      if (!start) start = now;
      const f = ((now - start) / 1000 * 30) % (DUR + 10);

      cells.forEach((c, i) => {
        const s = FIRST + i * GAP;
        const draw = outCubic((f - s) / 8);
        const strokeFade = 1 - 0.6 * outQuad((f - (s + 12)) / 14);
        const ring = outQuad((f - (s + 2)) / 8);
        const lit = outCubic((f - (s + 6)) / 8);
        const rise = bez((f - (s + 6)) / 8, 1.4);
        const pulse = lit * (1 - lit) * 4;

        const content = c.querySelector('.bl-content');
        const fill = c.querySelector('.bl-fill');
        const pu = c.querySelector('.bl-pulse');
        const ringEl = c.querySelector('.bl-ring');
        const comets = [c.querySelector('.bl-comet'), c.querySelector('.bl-comet2')];

        const op = (0.18 + 0.82 * lit);
        const ty = 20 * (1 - rise);
        content.style.opacity = op.toFixed(3);
        content.style.transform = 'translateY(' + ty.toFixed(1) + 'px)';
        fill.style.opacity = op.toFixed(3);
        fill.style.transform = 'translateY(' + ty.toFixed(1) + 'px)';
        pu.style.opacity = (pulse * 0.8).toFixed(3);

        const cometFade = 1 - clamp01((f - (s + 8)) / 8);
        if (draw > 0) {
          ringEl.setAttribute('stroke-dashoffset', (100 * (1 - draw)).toFixed(1));
          ringEl.setAttribute('opacity', (ring * strokeFade).toFixed(3));
          const head = 100 * draw;
          comets[0].setAttribute('stroke-dashoffset', (22 - head).toFixed(1));
          comets[0].setAttribute('opacity', (cometFade * 0.8).toFixed(3));
          comets[1].setAttribute('stroke-dashoffset', (22 - head).toFixed(1));
          comets[1].setAttribute('opacity', cometFade.toFixed(3));
        } else {
          ringEl.setAttribute('opacity', '0');
          comets[0].setAttribute('opacity', '0');
          comets[1].setAttribute('opacity', '0');
        }
      });

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => { cancelAnimationFrame(raf); el.innerHTML = ''; };
  }
};
