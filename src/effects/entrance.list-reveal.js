export default {
  id: 'list-reveal', group: 'entrance', name: '列表找位+整体漂移', lib: '纯 CSS + 原生 JS',
  desc: '菜单逐项「找位」（放大+上移+对焦模糊消除，错峰 10 帧），同时整个列表容器全程匀速上移——两层完全解耦的运动，读作「画面在呼吸」而不是一起飘。移植自 video-shotcraft 的 List Reveal（Apache-2.0）。',
  deps: '无',
  note: '核心是两层运动量级和速度要拉开：单项位移 44px 但动作快（24 帧到位），容器漂移 96px 却慢一个数量级（≈0.8px/帧全程线性）——量级是单项的 2 倍、速度是 1/10，才读作「呼吸」而非「一起往上飘」。漂移全程线性不回位，末帧就是完整海报。逐项用「对焦」语言：scale 0.82→1 + blur 8px→0 + 上移，软 back 过冲只 ~1.5%（几乎读不出，只把落位那帧扣住）。图标晚 2 帧、快捷键晚 4 帧落定做跟随。',
  code: `/* ① 逐项找位（快、小位移）：对焦语言 scale+blur+上移 */
item_i: delay = 2 + i*10;                    // 错峰 10f，相邻 2-3 项同时在动
t = clamp((f - delay)/24);
s = mix(.82, 1, back(t, 1.1));               // 软 back 过冲 ~1.5%
blur = mix(8, 0, easeOutCubic(t));
y = mix(44, 0, easeOutCubic(t));
el.style.transform = 'translateY(' + y + 'px) scale(' + s + ')';
el.style.filter = 'blur(' + blur + 'px)';

/* ② 整体漂移（慢、大位移、线性不回位）：容器全程匀速上移 96px */
containerY = -96 * clamp(f/120);            // ≈0.8px/帧，量级 2×、速度 1/10
list.style.transform = 'translateY(' + containerY + 'px)';`,
  init(el) {
    const STYLE = '<style data-fx="list-reveal">' +
      '.lr{position:relative;width:100%;height:100%;overflow:hidden;background:radial-gradient(120% 100% at 20% 0%,#1c1d22,#111216);font-family:system-ui,sans-serif}' +
      '.lr-wrap{position:absolute;left:16px;top:18px;will-change:transform}' +
      '.lr-item{position:relative;display:flex;align-items:center;gap:9px;height:23px;padding:0 9px;margin-bottom:5px;' +
        'border-radius:6px;color:#c6c8d0;will-change:transform,opacity,filter}' +
      '.lr-item.on{background:linear-gradient(180deg,#fdfdfd,#f1f1f3);color:#17181c;box-shadow:0 3px 10px -3px rgba(0,0,0,.5)}' +
      '.lr-ico{width:12px;height:12px;flex:none;will-change:transform,opacity}' +
      '.lr-ico svg{width:12px;height:12px;stroke:currentColor;fill:none;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round;display:block}' +
      '.lr-lb{font-size:10.5px;font-weight:600;letter-spacing:-.01em;flex:1}' +
      '.lr-kbd{font-size:7.5px;color:#7d808c;font-family:ui-monospace,monospace;will-change:transform,opacity}' +
      '.lr-item.on .lr-kbd{color:#9a97a6}' +
      '.lr-badge{font-size:7px;font-weight:800;color:#17181c;background:#f0d9a8;border-radius:999px;padding:1px 5px;margin-left:4px}' +
      '.lr-sep{height:1px;background:rgba(255,255,255,.08);margin:6px 4px 9px;opacity:0}' +
      '.lr-cap{position:absolute;bottom:6px;left:0;right:0;text-align:center;font-size:8px;color:rgba(255,255,255,.35);letter-spacing:.1em;text-transform:uppercase;z-index:9}' +
      '</style>';

    const P = d => '<path d="' + d + '"/>';
    const ITEMS = [
      ['Home', 'M3 11l9-8 9 8M5 10v10h14V10', '', true],
      ['Shots', 'M4 6h16v12H4zM4 10h16M9 6v12', '', false],
      ['Renders', 'M12 4v10l6-3zM12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z', '3', false],
      ['Reviews', 'M21 15a2 2 0 0 1-2 2H8l-4 4V5a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2z', '7', false],
      ['Settings', 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2V21a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 7 19.4a1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0-1.2-2.9H1a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 2.6 7', '', false],
      ['Sign out', 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9', '', false]
    ];

    let items = '';
    ITEMS.forEach((it, i) => {
      if (i === 5) items += '<div class="lr-sep" data-i="5"></div>';
      items += '<div class="lr-item' + (it[3] ? ' on' : '') + '" data-i="' + i + '">' +
        '<span class="lr-ico"><svg viewBox="0 0 24 24">' + P(it[1]) + '</svg></span>' +
        '<span class="lr-lb">' + it[0] + (it[2] ? '<span class="lr-badge">' + it[2] + '</span>' : '') + '</span>' +
        '<span class="lr-kbd">⌘' + (i + 1) + '</span>' +
      '</div>';
    });

    el.insertAdjacentHTML('beforeend', STYLE +
      '<div class="lr"><div class="lr-wrap" id="lrWrap">' + items + '</div>' +
      '<div class="lr-cap">逐项找位 · 容器慢漂移</div></div>');

    const wrap = el.querySelector('#lrWrap');
    const rows = [...el.querySelectorAll('.lr-item')];
    const seps = [...el.querySelectorAll('.lr-sep')];
    const clamp01 = x => x < 0 ? 0 : x > 1 ? 1 : x;
    const mix = (a, b, t) => a + (b - a) * t;
    const outCubic = t => 1 - Math.pow(1 - clamp01(t), 3);
    // 软 back：只 ~1.5% 过冲
    const back = (t, s) => { const x = clamp01(t); return x + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2); };

    const DUR = 110;
    let raf, start = 0;
    const tick = now => {
      if (!start) start = now;
      const f = ((now - start) / 1000 * 30) % (DUR + 12);
      const ff = f <= DUR ? f : 0;

      // ② 容器漂移：全程线性匀速上移，不回位
      wrap.style.transform = 'translateY(' + (-26 * clamp01(ff / DUR)).toFixed(2) + 'px)';

      // ① 逐项找位（错峰 10 帧）
      rows.forEach((r, i) => {
        const d = 2 + i * 10;
        const t = clamp01((ff - d) / 24);
        const e = outCubic(t);
        const s = mix(0.82, 1, back(t, 1.1));
        const blur = mix(7, 0, e);
        const y = mix(40, 0, e);
        r.style.opacity = Math.min(1, t * 2.5).toFixed(3);
        r.style.transform = 'translateY(' + y.toFixed(1) + 'px) scale(' + s.toFixed(4) + ')';
        r.style.filter = blur > 0.2 ? 'blur(' + blur.toFixed(2) + 'px)' : 'none';

        // 图标晚 2 帧、快捷键晚 4 帧（跟随）
        const ico = r.querySelector('.lr-ico');
        const kbd = r.querySelector('.lr-kbd');
        const ti = clamp01((ff - d - 2) / 20), tk = clamp01((ff - d - 4) / 20);
        ico.style.opacity = outCubic(ti).toFixed(3);
        ico.style.transform = 'translateY(' + ((1 - outCubic(ti)) * 6).toFixed(1) + 'px)';
        kbd.style.opacity = (outCubic(tk) * 0.9).toFixed(3);
      });

      // 分隔线随最后一项显现
      seps.forEach(sp => { sp.style.opacity = clamp01((ff - (2 + 5 * 10)) / 12).toFixed(3); });

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => { cancelAnimationFrame(raf); el.innerHTML = ''; };
  }
};
