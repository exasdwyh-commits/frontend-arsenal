export default {
  id: 'mask-shape-cycles', group: 'entrance', name: '形状遮罩转场族', lib: 'CSS mask + registerProperty',
  desc: '注册一个数字变量 --t，样式表里 40+ 种 PowerPoint 风格形状遮罩（轮子/楔形/对开/百叶/圆形/棋盘/溶解点阵/十字/斜条/随机条）全部只读 var(--t)，JS 只驱动这一个数就能轮流扫出整族转场。移植自 baoyu-design 的 deck-stage 动画引擎（MIT）。',
  deps: '无',
  note: '核心坑（原库注释）：把 var(--t) 写在 WAAPI 的 keyframe 值里，会在 keyframe 解析时按基准样式代入初值 0 并焊死，导致遮罩永不扫过——所以渐变字符串必须放样式表（用 [data-mask=xxx] 属性选择器建规则），动画只驱动变量本身。用 CSS.registerProperty 把 --t 注册成 syntax:\'<number>\'，CSS 才能把它当数字插值（不注册也能文本代入 calc，但没法用 @keyframes/WAAPI 平滑动画）。多个遮罩层用逗号拼进同一个 mask-image 是「取并集」（默认 mask-composite:add），box/diamond/plus 就靠四条边带并成一个洞。checker/dissolve 要配 mask-size 分块，lead-lag 两条 lane 错峰才有棋盘交替感。',
  code: `/* 一个数字变量驱动整族形状遮罩：渐变在样式表，动画只喂 --t */
CSS.registerProperty({name:'--t',syntax:'<number>',inherits:false,initialValue:'0'});

/* 样式表规则（按 data-mask 属性选中），T = var(--t) */
[data-mask=wheel] { mask-image: conic-gradient(#000 0deg calc(T*1turn),
                   transparent calc(T*1turn) 1turn); }
[data-mask=wedge] { mask-image: conic-gradient(#000 0deg calc(T*180deg),
                   transparent calc(T*180deg) calc(360deg - T*180deg),
                   #000 calc(360deg - T*180deg) 360deg); }   /* 12 点双向张开 */
[data-mask=split-v]{ mask-image: linear-gradient(90deg,#000 0 calc(T*50%),
                   transparent calc(T*50%) calc(100% - T*50%),
                   #000 calc(100% - T*50%) 100%); }          /* 中央向两侧对开 */
[data-mask=blinds-h]{ mask-image: repeating-linear-gradient(180deg,
                   #000 0 calc(T*12px), transparent calc(T*12px) 12px); }
[data-mask=circle-in]{ mask-image: radial-gradient(circle farthest-corner at 50% 50%,
                   transparent 0 calc((1 - T)*100%), #000 calc((1 - T)*100%)); }
/* box/diamond/plus：四条边带 mask-image 逗号并集 → 中间一个收缩的洞 */
[data-mask=box-in] { mask-image: linear-gradient(90deg,#000 0 calc(T*50%),transparent calc(T*50%)),
                   linear-gradient(270deg,...), linear-gradient(180deg,...), linear-gradient(0deg,...); }

/* JS/rAF 只干两件事：换 data-mask + 喂 --t (0→1 线性) */
el.setAttribute('data-mask', name);
el.style.setProperty('--t', t.toFixed(4));`,
  init(el) {
    const clamp01 = x => x < 0 ? 0 : x > 1 ? 1 : x;

    // 注册数字变量（失败也无妨：文本代入 calc 仍可扫，只是不能 @keyframes 平滑）
    try {
      if (window.CSS && CSS.registerProperty)
        CSS.registerProperty({ name: '--ms-t', syntax: '<number>', inherits: false, initialValue: '0' });
    } catch (e) { /* 已注册过则忽略 */ }

    const T = 'var(--ms-t)';
    const q = n => n.toFixed(2);
    // 边带：linear-gradient(ang,#000 0 calc(T*50%),transparent calc(T*50%))
    const edge = ang => 'linear-gradient(' + ang + ',#000 0 calc(' + T + '*50%),transparent calc(' + T + '*50%))';
    // 中心带：透明-不透明-透明（plus-out 用）
    const band = ang => 'linear-gradient(' + ang + ',transparent 0 calc(50% - ' + T + '*50%),#000 calc(50% - ' + T + '*50%) calc(50% + ' + T + '*50%),transparent calc(50% + ' + T + '*50%))';
    // 角象限 conic（plus-in/checker 用）
    const quad = (fromDeg, x, y) => 'conic-gradient(from ' + fromDeg + ' at ' + x + ' ' + y + ',#000 0 90deg,transparent 90deg 360deg)';
    // 随机条：一个 17px 周期里 4 条子带在时间轴四分点错峰长出（clamp 门控）
    const bar = (ang, at, w, from) => 'repeating-linear-gradient(' + ang +
      ',transparent 0 ' + at + 'px,#000 ' + at + 'px calc(' + at + 'px + clamp(0,(' + T + ' - ' + from + ')*4,1)*' + w + 'px),' +
      'transparent calc(' + at + 'px + clamp(0,(' + T + ' - ' + from + ')*4,1)*' + w + 'px) 17px)';
    const bars = ang => [bar(ang, 0, 4, 0.5), bar(ang, 4, 5, 0), bar(ang, 9, 4, 0.75), bar(ang, 13, 4, 0.25)].join(',');

    const lead = 'calc(' + T + '*100%)';
    const lag = 'calc(clamp(0,(' + T + ' - 0.15)/0.85,1)*100%)';
    const dot = (r, from) => {
      const rr = from ? 'calc(clamp(0,(' + T + ' - ' + from + ')*1.4,1)*' + r + 'px)' : 'calc(' + T + '*' + r + 'px)';
      return 'radial-gradient(circle at 50% 50%,#000 0 ' + rr + ',transparent ' + rr + ')';
    };

    // [name, mask-image, mask-size?, mask-position?]
    const V = [
      ['wheel', 'conic-gradient(#000 0deg calc(' + T + '*1turn),transparent calc(' + T + '*1turn) 1turn)'],
      ['wedge', 'conic-gradient(#000 0deg calc(' + T + '*180deg),transparent calc(' + T + '*180deg) calc(360deg - ' + T + '*180deg),#000 calc(360deg - ' + T + '*180deg) 360deg)'],
      ['split-v', 'linear-gradient(90deg,#000 0 calc(' + T + '*50%),transparent calc(' + T + '*50%) calc(100% - ' + T + '*50%),#000 calc(100% - ' + T + '*50%) 100%)'],
      ['split-h', 'linear-gradient(180deg,#000 0 calc(' + T + '*50%),transparent calc(' + T + '*50%) calc(100% - ' + T + '*50%),#000 calc(100% - ' + T + '*50%) 100%)'],
      ['circle-in', 'radial-gradient(circle farthest-corner at 50% 50%,transparent 0 calc((1 - ' + T + ')*100%),#000 calc((1 - ' + T + ')*100%))'],
      ['circle-out', 'radial-gradient(circle farthest-corner at 50% 50%,#000 0 calc(' + T + '*100%),transparent calc(' + T + '*100%))'],
      ['blinds-h', 'repeating-linear-gradient(180deg,#000 0 calc(' + T + '*12px),transparent calc(' + T + '*12px) 12px)'],
      ['blinds-v', 'repeating-linear-gradient(90deg,#000 0 calc(' + T + '*12px),transparent calc(' + T + '*12px) 12px)'],
      ['box-in', [edge('90deg'), edge('270deg'), edge('180deg'), edge('0deg')].join(',')],
      ['diamond-in', [edge('45deg'), edge('135deg'), edge('225deg'), edge('315deg')].join(',')],
      ['plus-in', [quad('270deg', 'calc(' + T + '*50%)', 'calc(' + T + '*50%)'),
        quad('0deg', 'calc(100% - ' + T + '*50%)', 'calc(' + T + '*50%)'),
        quad('90deg', 'calc(100% - ' + T + '*50%)', 'calc(100% - ' + T + '*50%)'),
        quad('180deg', 'calc(' + T + '*50%)', 'calc(100% - ' + T + '*50%)')].join(',')],
      ['plus-out', [band('180deg'), band('90deg')].join(',')],
      ['strips-dr', 'linear-gradient(135deg,#000 0 calc(' + T + '*100%),transparent calc(' + T + '*100%))'],
      ['strips-dl', 'linear-gradient(225deg,#000 0 calc(' + T + '*100%),transparent calc(' + T + '*100%))'],
      ['bars-h', bars('180deg')],
      ['bars-v', bars('90deg')],
      ['checker-h', quad('270deg', lead, '12px') + ',' + quad('270deg', lag, '24px'), '100% 24px,100% 24px', null],
      ['checker-v', quad('270deg', '12px', lead) + ',' + quad('270deg', '24px', lag), '24px 100%,24px 100%', null],
      ['dissolve', dot(8, 0) + ',' + dot(10, 0.25), '11px 11px,14px 14px', '0 0,4px 7px']
    ];

    let rules = '';
    V.forEach(v => {
      let d = '-webkit-mask-image:' + v[1] + ';mask-image:' + v[1] + ';';
      if (v[2]) d += '-webkit-mask-size:' + v[2] + ';mask-size:' + v[2] + ';';
      if (v[3]) d += '-webkit-mask-position:' + v[3] + ';mask-position:' + v[3] + ';';
      rules += '.ms-el[data-mask="' + v[0] + '"]{' + d + '}';
    });

    const STYLE = '<style data-fx="mask-shape-cycles">' +
      '.ms{position:relative;width:100%;height:100%;overflow:hidden;background:#0e1014;font-family:system-ui,sans-serif}' +
      '.ms-el{position:absolute;inset:9px;border-radius:10px;box-sizing:border-box;padding:12px 14px;' +
        'background:linear-gradient(160deg,#232b3b,#161b24);color:#eaeef7;box-shadow:0 10px 24px -10px rgba(0,0,0,.7);' +
        'will-change:mask-image}' +
      '.ms-hd{font-size:17px;font-weight:800;letter-spacing:-.03em}' +
      '.ms-sub{font-size:8.5px;color:#8b93a6;margin-top:2px}' +
      '.ms-row{display:flex;gap:4px;margin-top:10px;height:40px;align-items:flex-end}' +
      '.ms-row span{flex:1;border-radius:2px 2px 0 0;background:linear-gradient(180deg,#6ea8ff,#3f6fd0)}' +
      '.ms-chips{display:flex;gap:5px;margin-top:9px}' +
      '.ms-chips i{font-style:normal;font-size:7px;color:#9aa3b6;border:1px solid rgba(255,255,255,.14);' +
        'border-radius:999px;padding:2px 7px}' +
      '.ms-cap{position:absolute;bottom:2px;left:0;right:0;text-align:center;font-size:8px;' +
        'color:rgba(255,255,255,.4);letter-spacing:.1em;text-transform:uppercase;z-index:9}' +
      rules + '</style>';

    const hs = [34, 58, 42, 76, 60, 92, 70, 84];
    let row = '';
    hs.forEach(h => row += '<span style="height:' + h + '%"></span>');

    el.insertAdjacentHTML('beforeend', STYLE +
      '<div class="ms"><div class="ms-el" id="msEl" data-mask="wheel">' +
        '<div class="ms-hd">Frame<span style="color:#6ea8ff">.</span></div>' +
        '<div class="ms-sub">one registered variable drives every shape mask</div>' +
        '<div class="ms-row">' + row + '</div>' +
        '<div class="ms-chips"><i>--t: number</i><i>mask-image</i><i>conic / linear / radial</i></div>' +
      '</div><div class="ms-cap" id="msCap">wheel</div></div>');

    const box = el.querySelector('#msEl');
    const cap = el.querySelector('#msCap');

    const REVEAL = 26, HOLD = 10;         // 每种：26 帧扫出 + 10 帧停
    const DUR = (REVEAL + HOLD) * V.length;
    let raf, start = 0;
    const tick = now => {
      if (!start) start = now;
      const f = ((now - start) / 1000 * 30) % DUR;
      const idx = Math.floor(f / (REVEAL + HOLD));
      const local = f - idx * (REVEAL + HOLD);
      const t = clamp01(local / REVEAL);   // 线性 0→1（形状遮罩不吃缓动）

      const v = V[idx];
      if (box.dataset.mask !== v[0]) { box.dataset.mask = v[0]; cap.textContent = v[0]; }
      box.style.setProperty('--ms-t', q(t));

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => { cancelAnimationFrame(raf); el.innerHTML = ''; };
  }
};
