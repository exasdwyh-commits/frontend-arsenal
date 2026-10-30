export default {
  id: 'corner-spotlight', group: 'entrance', name: '角落聚光显影', lib: '原生 JS + CSS mask',
  desc: '黑场里左上角径向聚光从小到大匀速扩张，照到的区域显影、照不到的沉黑，光本身就是转场。移植自 video-shotcraft 的 Corner Spotlight Reveal（Apache-2.0）。',
  deps: '无',
  note: '显影靠 mask-image 径向渐变（不是 opacity 淡入）——被光"照到"的像素才可见，边缘 feather 让光有软前沿。半径必须全程线性匀速（别加缓动），否则前 1/3 就盖满全屏、扩张动作撑不满时长。光晕叠层和 mask 分开：mask 控制"显不显影"，上面再叠一层白热 radial-gradient 做光心本身的辉光，两者都跟同一个 cx/cy/r 走。mask 的透明-不透明区间是百分比，要按 (r-feather*.25)/(r+feather) 反算，别写死。',
  code: `/* mask 径向渐变 = 光照到哪显影到哪（半径线性匀速） */
mask = 'radial-gradient(circle ' + (r+feather) + 'px at ' + cx + 'px ' + cy + 'px,' +
       'rgba(255,255,255,1) ' + stop + '%,' +   /* stop = (r-feather*.25)/(r+feather)*100 */
       'rgba(255,255,255,0) 100%)';
el.style.webkitMaskImage = mask;
el.style.maskImage = mask;

/* 半径线性扩张（严格 linear，不吃缓动） */
r = lerp(160, 1300, clamp((f-0)/100));     // 撑满全片才饱和
feather = r * 0.85;                          // 越大越羽化

/* 光心沿角落匀速游移 + 白热辉光（叠层另算） */
cx = lerp(140, 420, f/96);
glow = radial-gradient(closest-side, rgba(255,255,255,.85), transparent 75%);`,
  init(el) {
    const STYLE = '<style data-fx="corner-spotlight">' +
      '.csp{position:relative;width:100%;height:100%;overflow:hidden;background:#000}' +
      '.csp-ui{position:absolute;inset:0;background:#f6f6f5;color:#2c2c2c;padding:14px 16px;box-sizing:border-box;' +
        'font-family:system-ui,sans-serif;will-change:transform,mask-image}' +
      '.csp-hd{font-size:24px;font-weight:700;letter-spacing:-.04em}' +
      '.csp-tabs{display:flex;gap:14px;margin-top:11px;font-size:11px;color:#555}' +
      '.csp-tabs b{background:#e9e8f6;color:#5b55c8;padding:3px 9px;border-radius:6px;font-weight:600}' +
      '.csp-row{display:flex;align-items:center;gap:8px;margin-top:11px}' +
      '.csp-box{width:13px;height:13px;border:2px solid #c9c9c7;border-radius:4px;flex:none}' +
      '.csp-dot{width:5px;height:5px;border-radius:50%;background:#5b55c8;flex:none}' +
      '.csp-av{width:17px;height:17px;border-radius:50%;background:#efe4e2;flex:none}' +
      '.csp-tx{display:flex;flex-direction:column;gap:4px}' +
      '.csp-tx i{height:6px;border-radius:3px;background:#3f3f3f;display:block}' +
      '.csp-tx i.b{background:#d8d8d6}' +
      '.csp-tx i.c{background:#8f8bd8;opacity:.75}' +
      '.csp-glow{position:absolute;border-radius:50%;pointer-events:none;filter:blur(14px);will-change:opacity}' +
      '.csp-cap{position:absolute;bottom:7px;left:0;right:0;text-align:center;font-size:8px;' +
        'color:rgba(255,255,255,.5);letter-spacing:.1em;text-transform:uppercase;z-index:9}' +
      '</style>';

    // 假界面行
    let rows = '';
    const widths = [[70, 96], [62, 88], [80, 74]];
    widths.forEach((ws, r) => {
      rows += '<div class="csp-row"><div class="csp-box"></div><div class="csp-dot"></div><div class="csp-av"></div>' +
        '<div class="csp-tx"><i style="width:' + ws[0] + 'px"></i><span style="display:flex;gap:6px">' +
        '<i class="c" style="width:60px"></i><i class="b" style="width:' + ws[1] + 'px"></i></span></div></div>';
    });

    el.insertAdjacentHTML('beforeend', STYLE +
      '<div class="csp">' +
        '<div class="csp-ui" id="cspUi">' +
          '<div class="csp-hd">Shots</div>' +
          '<div class="csp-tabs"><b>All</b><span>Camera</span><span>Effects</span><span>Data</span></div>' + rows +
        '</div>' +
        '<div class="csp-glow" id="cspGlow"></div>' +
        '<div class="csp-cap">光扫过才显影</div>' +
      '</div>');

    const ui = el.querySelector('#cspUi');
    const glow = el.querySelector('#cspGlow');
    const clamp01 = x => x < 0 ? 0 : x > 1 ? 1 : x;
    const lerp = (a, b, t) => a + (b - a) * t;
    const W = 280, H = 150;

    const DUR = 110;
    let raf, start = 0;
    const tick = now => {
      if (!start) start = now;
      const f = ((now - start) / 1000 * 30) % (DUR + 12);
      // 到顶后归零重来（循环）
      const t = f <= DUR ? f : 0;

      const r = lerp(46, 360, clamp01(t / DUR));   // 严格线性
      const feather = r * 0.85;
      const cx = lerp(40, 120, clamp01(t / 96));
      const cy = lerp(26, 76, clamp01(t / 96));
      const stop = Math.max(0, ((r - feather * 0.25) / (r + feather)) * 100);

      const mask = 'radial-gradient(circle ' + (r + feather).toFixed(1) + 'px at ' + cx.toFixed(1) + 'px ' + cy.toFixed(1) + 'px,' +
        'rgba(255,255,255,1) ' + stop.toFixed(2) + '%,rgba(255,255,255,0) 100%)';
      ui.style.webkitMaskImage = mask;
      ui.style.maskImage = mask;

      // 轻微透视漂移
      const d = clamp01(t / DUR);
      const scale = 1.18 - 0.18 * d;
      ui.style.transformOrigin = '22% 16%';
      ui.style.transform = 'scale(' + scale.toFixed(3) + ') translate(' + (-10 + 22 * d).toFixed(1) + 'px,' + (-8 + 18 * d).toFixed(1) + 'px)';

      // 白热光晕（独立叠层）
      const gr = r * 0.7;
      glow.style.left = (cx - gr).toFixed(1) + 'px';
      glow.style.top = (cy - gr).toFixed(1) + 'px';
      glow.style.width = glow.style.height = (gr * 2).toFixed(1) + 'px';
      glow.style.background = 'radial-gradient(closest-side, rgba(255,255,255,.85), rgba(255,255,255,.25) 45%, transparent 75%)';
      const gOp = t < 8 ? t / 8 * 0.9 : Math.max(0, 0.9 - (t - 8) / 55 * 0.9);
      glow.style.opacity = gOp.toFixed(3);

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => { cancelAnimationFrame(raf); el.innerHTML = ''; };
  }
};
