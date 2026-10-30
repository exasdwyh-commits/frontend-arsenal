export default {
  id: 'blinds-flip', group: 'entrance', name: '百叶窗翻页', lib: '纯 CSS 3D + 原生 JS',
  desc: '一排竖条各自绕自身竖轴翻面，正面是 A 页、背面是 B 页，波从左扫过就把整页换掉。移植自 video-shotcraft 的 Blinds Slice（Apache-2.0）。',
  deps: '无',
  note: '每叶是 preserve-3d 的双面板：正面 A 切片、背面 B 切片（背面预转 180°，翻满后才不镜像），都挂 backface-visibility:hidden，靠它决定哪一面朝前。切片用「外层裁剪 + 内层整页负偏移」对位（left:-i*stripW），否则翻过来的 A/B 会各自散开对不齐。翻面用弹簧错峰（前疏后密 t^0.78），两页反差越大每叶越读得清；翻到 90° 时叶片侧立露出叶后暗槽，要给暗槽铺底色，不然会透出舞台背景。',
  code: `/* 一叶 = 双面板，共享父级透视；翻 180° 换页 */
<div style="perspective:1400px">
  <div class="strip" style="transform:rotateY(THdeg);transform-style:preserve-3d">
    <div class="face front"><!-- A 切片：整页负偏移 --></div>
    <div class="face back"  style="transform:rotateY(180deg)"><!-- B 切片 --></div>
  </div>
</div>
.face{position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;overflow:hidden}
/* 切片：外层裁剪出这一叶，内层放整页再左移对位 */
.slice{position:absolute;inset:0;overflow:hidden}
.page{position:absolute;left:-x,top:0,width:STAGE_W,height:100%}

/* 弹簧错峰起翻：前疏后密 */
start_i = WAVE0 + pow(i/(N-1), .78) * SPAN;
angle  = 180 * spring(f, start_i);   // damping 13 / stiffness 75`,
  init(el) {
    const STYLE = '<style data-fx="blinds-flip">' +
      '.bf{position:relative;width:100%;height:100%;overflow:hidden;perspective:1400px;perspective-origin:50% 50%}' +
      '.bf-slot{position:absolute;inset:0;background:linear-gradient(180deg,#1d1712,#120d0a)}' +
      '.bf-strip{position:absolute;top:0;height:100%;transform-style:preserve-3d;will-change:transform}' +
      '.bf-face{position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;overflow:hidden}' +
      '.bf-back{transform:rotateY(180deg)}' +
      '.bf-slice{position:absolute;inset:0;overflow:hidden}' +
      '.bf-page{position:absolute;top:0;height:100%;display:flex;align-items:center;justify-content:center;' +
        'font-family:system-ui,sans-serif;font-weight:850;letter-spacing:-.05em;box-sizing:border-box}' +
      '.bf-line{position:absolute;top:0;bottom:0;width:1px;background:rgba(0,0,0,.06)}' +
      '.bf-cap{position:absolute;bottom:7px;left:0;right:0;text-align:center;font-size:8px;' +
        'color:rgba(28,24,20,.62);letter-spacing:.1em;text-transform:uppercase;z-index:9;' +
        'text-shadow:0 1px 2px rgba(255,255,255,.35)}' +
      '</style>';

    const N = 8;
    const W = 280;                       // 舞台宽（切片对位基准）
    const STRIP = W / N;
    const A = { bg: '#f3eee4', ink: '#1b1916', dot: '#e5432d', word: 'Frame' };
    const B = { bg: '#e5432d', ink: '#fffaf3', dot: '#1b1916', word: 'Craft' };

    const page = (c, i) =>
      '<div class="bf-slice"><div class="bf-page" style="left:' + (-i * STRIP) + 'px;width:' + W + 'px;background:' + c.bg + ';color:' + c.ink + '">' +
        '<span style="font-size:52px">' + c.word + '<span style="color:' + c.dot + '">.</span></span>' +
      '</div></div>';

    let strips = '';
    for (let i = 0; i < N; i++) {
      strips += '<div class="bf-strip" data-i="' + i + '" style="left:' + (i * STRIP) + 'px;width:' + STRIP + 'px">' +
        '<div class="bf-face">' + page(A, i) + '</div>' +
        '<div class="bf-face bf-back">' + page(B, i) + '</div>' +
      '</div>';
    }
    // 叶后网格发丝线
    let grid = '';
    for (let i = 1; i < N; i++) grid += '<div class="bf-line" style="left:' + (i * STRIP) + 'px"></div>';

    el.insertAdjacentHTML('beforeend', STYLE +
      '<div class="bf"><div class="bf-slot">' + grid + '</div>' + strips +
      '<div class="bf-cap">逐叶翻面 · A 换 B</div></div>');

    const stripEls = [...el.querySelectorAll('.bf-strip')];
    const WAVE0 = 14, SPAN = 30;
    const clamp01 = x => x < 0 ? 0 : x > 1 ? 1 : x;
    // 弹簧近似：damping13 / stiffness75 → 一次轻过冲后收敛
    const spring = (f, s) => {
      const u = (f - s) / 13;
      if (u <= 0) return 0;
      if (u >= 1.6) return 1;
      return 1 - Math.exp(-4.6 * u) * Math.cos(u * 7.4);
    };
    const startOf = i => WAVE0 + Math.pow(i / (N - 1), 0.78) * SPAN;

    const DUR = 120;
    let raf, start = 0;
    const tick = now => {
      if (!start) start = now;
      const f = ((now - start) / 1000 * 30) % (DUR + 10);

      // 第二遍翻回（A↔B 往返）
      const cyc = f < DUR / 2;
      const ff = cyc ? f : DUR - f;

      for (let i = 0; i < N; i++) {
        const th = 180 * clamp01(spring(ff, startOf(i))) * (cyc ? 1 : 1);
        stripEls[i].style.transform = 'rotateY(' + th.toFixed(2) + 'deg)';
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => { cancelAnimationFrame(raf); el.innerHTML = ''; };
  }
};
