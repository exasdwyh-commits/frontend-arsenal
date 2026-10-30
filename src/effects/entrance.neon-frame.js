export default {
  id: 'neon-frame', group: 'entrance', name: '霓虹框先行', lib: 'SVG + 原生 JS',
  desc: '两颗白热亮头从框左缘中点上下分头奔画，在右缘相撞闪一下，框出内容位置后内容再由暗转亮。移植自 video-shotcraft 的 Neon Frame Forerun（Apache-2.0）。',
  deps: '无',
  note: '灯管辉光用「四层同路径描边」叠出来（宽软晕/中晕/色芯/白热芯），比 filter:blur 便宜且锐利，关键是 opacity 逐层递减。两颗亮头用同一个 path 配不同 stroke-dasharray/dashoffset——一个从 0 正着画、一个从 1000 反着画，pathLength=1000 归一化后 dash 数学才好算。荧光管启辉/熄灭用一段固定数组的确定性闪烁（不是随机），保证每次播放一致。',
  code: `// 四层描边 = 一条灯管（宽软晕→白热芯）
<path d="框路径" stroke="渐变" stroke-width="34" opacity=".07"/>
<path d="框路径" stroke="渐变" stroke-width="14" opacity=".18"/>
<path d="框路径" stroke="渐变" stroke-width="5"  opacity=".9"/>
<path d="框路径" stroke="#fff6fd" stroke-width="1.6" opacity=".85"/>

// 两亮头：正反两路 dash 同时推进，在右缘相撞
<path pathLength="1000" stroke-dasharray="half 1000" stroke-dashoffset="0"/>
<path pathLength="1000" stroke-dasharray="half 1000" stroke-dashoffset="-(1000-half)"/>
// half = trace*500，trace 从 0→1（swift 缓动，起步快、末尾制动）

// 荧光管启辉（确定性闪烁）
var STRIKE=[0,.7,.15,.9,.35,1];
function strike(f,on){ return f<on?0:(f-on>=STRIKE.length?1:STRIKE[Math.floor(f-on)]); }`,
  init(el) {
    const STYLE = '<style data-fx="neon-frame">' +
      '.nf{position:relative;width:210px;height:120px;display:flex;align-items:center;justify-content:center}' +
      '.nf-svg{position:absolute;inset:-14px;overflow:visible}' +
      '.nf-inner{position:relative;z-index:2;text-align:center;opacity:0;filter:brightness(.05);transition:none}' +
      '.nf-t{font-size:14px;font-weight:700;color:#17141f;letter-spacing:-.01em}' +
      '.nf-sub{font-size:9px;color:#9a95a8;margin-top:4px}' +
      '.nf-card{display:flex;gap:6px;margin-top:8px;justify-content:center}' +
      '.nf-stat{background:#fff;border-radius:8px;padding:6px 9px;box-shadow:0 0 0 1px rgba(30,20,50,.09)}' +
      '.nf-num{font-size:16px;font-weight:750;color:#17141f}' +
      '.nf-lab{font-size:7px;color:#9a95a8}' +
      '</style>';

    const FW = 210, FH = 120;
    const PERIM = 2 * (FW + FH);
    // 框路径：左缘中点出发、先向上顺时针
    const D = 'M 0 ' + (FH / 2) + ' L 0 0 L ' + FW + ' 0 L ' + FW + ' ' + FH + ' L 0 ' + FH + ' Z';

    el.insertAdjacentHTML('beforeend', STYLE +
      '<div class="nf">' +
        '<svg class="nf-svg" viewBox="-16 -16 ' + (FW + 32) + ' ' + (FH + 32) + '">' +
          '<defs><linearGradient id="nfG" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="' + FW + '" y2="' + FH + '">' +
            '<stop offset="0" stop-color="#b48cff"/><stop offset=".55" stop-color="#e07ae0"/><stop offset="1" stop-color="#ff6fb5"/>' +
          '</linearGradient>' +
          '<radialGradient id="nfH"><stop offset="0" stop-color="#fff"/><stop offset=".25" stop-color="#ffe6fb" stop-opacity=".9"/><stop offset="1" stop-color="#ff6fb5" stop-opacity="0"/></radialGradient></defs>' +
          '<g id="nfTrace" fill="none" stroke-linejoin="miter">' +
            '<path id="nfA" d="' + D + '" pathLength="1000" stroke="url(#nfG)" stroke-width="9" opacity=".18"/>' +
            '<path id="nfA2" d="' + D + '" pathLength="1000" stroke="url(#nfG)" stroke-width="3" opacity=".9"/>' +
          '</g>' +
          '<circle id="nfH1" r="0" fill="url(#nfH)"/>' +
          '<circle id="nfH2" r="0" fill="url(#nfH)"/>' +
          '<circle id="nfFlash" cx="' + FW + '" cy="' + (FH / 2) + '" r="0" fill="url(#nfH)" opacity="0"/>' +
        '</svg>' +
        '<div class="nf-inner" id="nfInner">' +
          '<div class="nf-t">Good morning, Dana</div>' +
          '<div class="nf-card">' +
            '<div class="nf-stat"><div class="nf-num">6</div><div class="nf-lab">Shots today</div></div>' +
            '<div class="nf-stat"><div class="nf-num">3</div><div class="nf-lab">Rendering</div></div>' +
          '</div>' +
          '<div class="nf-sub">框先跑，内容后亮</div>' +
        '</div>' +
      '</div>');

    const nfA = el.querySelector('#nfA'), nfA2 = el.querySelector('#nfA2');
    const h1 = el.querySelector('#nfH1'), h2 = el.querySelector('#nfH2');
    const flash = el.querySelector('#nfFlash');
    const inner = el.querySelector('#nfInner');

    // 周长分数 u → 坐标
    const pointAt = u => {
      let s = (((u % 1) + 1) % 1) * PERIM;
      const segs = [[0, FH / 2, 0, 0], [0, 0, FW, 0], [FW, 0, FW, FH], [FW, FH, 0, FH], [0, FH, 0, FH / 2]];
      for (const [x1, y1, x2, y2] of segs) {
        const len = Math.hypot(x2 - x1, y2 - y1);
        if (s <= len) return [x1 + (x2 - x1) * s / len, y1 + (y2 - y1) * s / len];
        s -= len;
      }
      return [0, FH / 2];
    };

    const clamp01 = x => x < 0 ? 0 : x > 1 ? 1 : x;
    const swift = u => 1 - Math.pow(1 - u, 2.6);
    const DUR = 90;

    let raf, start = 0;
    const tick = now => {
      if (!start) start = now;
      const f = ((now - start) / 1000 * 30) % (DUR + 10);

      const trace = clamp01(swift(clamp01((f - 2) / 20)));
      const half = (trace * 500).toFixed(1);
      nfA.setAttribute('stroke-dasharray', half + ' 1000');
      nfA.setAttribute('stroke-dashoffset', '0');
      nfA2.setAttribute('stroke-dasharray', half + ' 1000');
      nfA2.setAttribute('stroke-dashoffset', (-(1000 - half)).toFixed(1));

      // 亮头
      if (trace < 1) {
        const p1 = pointAt(trace * 0.5), p2 = pointAt(1 - trace * 0.5);
        h1.setAttribute('cx', p1[0]); h1.setAttribute('cy', p1[1]); h1.setAttribute('r', 7);
        h2.setAttribute('cx', p2[0]); h2.setAttribute('cy', p2[1]); h2.setAttribute('r', 7);
      } else { h1.setAttribute('r', 0); h2.setAttribute('r', 0); }

      // 相撞闪光
      if (f >= 21 && f < 35) {
        const m = clamp01((f - 21) / 14);
        flash.setAttribute('r', (10 + 26 * m).toFixed(1));
        flash.setAttribute('opacity', (1 - m).toFixed(3));
      } else flash.setAttribute('opacity', '0');

      // 内容：框合拢后由暗转亮
      const lit = clamp01((f - 24) / 40);
      inner.style.opacity = clamp01((f - 16) / 14).toFixed(3);
      inner.style.filter = lit < 0.995 ? 'brightness(' + Math.max(0.05, lit).toFixed(3) + ')' : 'none';

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => { cancelAnimationFrame(raf); el.innerHTML = ''; };
  }
};
