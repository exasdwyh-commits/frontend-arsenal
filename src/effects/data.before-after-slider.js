export default {
  id: 'before-after-slider', group: 'data', name: '前后对比拉杆', lib: '原生 JS + clip-path',
  desc: '处理前后两版叠放，竖分割杆带手柄：先快甩到 76% 回弹落 70%，再慢速回扫到 40% 停住，杆经过处清晰版被揭出。先快后慢的速度对比是节奏关键。移植自 video-shotcraft 的 Before After Slider Scrub（Apache-2.0）。',
  deps: '无',
  note: '清晰层用 clip-path: inset(0 0 0 X%) 跟随杆的 x 揭示（不是 opacity 淡入）——杆走到哪揭到哪，边界永远是那根线。快甩（12f 冲 68%）和慢扫（48f 回 30%）速度差约 5 倍，靠一个 posAt(f) 分段函数喂同一个 x，杆和 clip 用同一份值才不会脱缝。甩之前先向左回拉 1.5% 做「蓄力」，手柄按速度横向拉伸 + 方向性运动模糊，落定归零。before 层不是简单灰度，是「轻微失焦 + 降饱和 + 低对比雾面」才像未处理态。',
  code: `/* 杆位置分段函数：蓄力→快甩→回弹→停顿→慢扫（同一个 x 喂杆和 clip） */
posAt(f) =
  mix(8, 6.5,  ramp(f, 10,  4))   // 蓄力：先回拉
  : mix(6.5, 76, ramp(f, 14, 12)) // 快甩 12f 冲到 76%（overshoot）
  : mix(76, 70,  ramp(f, 26, 12)) // 回弹落 70%
  : 70                            // 停顿
  : mix(70, 40,  ramp(f, 56, 48)) // 慢扫 48f 回 40%（速度≈1/5）

x = posAt(f) / 100 * W;
afterLayer.style.clipPath = 'inset(0 0 0 ' + (x).toFixed(1) + 'px)';
handle.style.left = x + 'px';

/* 手柄速度拉伸 + 方向性模糊（甩出瞬间） */
v = posAt(f+0.5) - posAt(f-0.5);
if (|v| > 1) handle.style.transform = 'scaleX(' + (1+|v|*0.04) + ')';

/* before 层 = 未处理态（不是灰度） */
filter: blur(.6px) saturate(.55) contrast(.85);
background: rgba(150,150,150,.18);  /* 低对比雾罩 */`,
  init(el) {
    const STYLE = '<style data-fx="before-after-slider">' +
      '.ba{position:relative;width:100%;height:100%;overflow:hidden;background:#17181c;font-family:system-ui,sans-serif}' +
      '.ba-layer{position:absolute;inset:0;box-sizing:border-box;padding:23px 14px 10px;color:#e8e9ee}' +
      '.ba-before{background:#26282e;filter:blur(.6px) saturate(.5) contrast(.82)}' +
      '.ba-before::after{content:"";position:absolute;inset:0;background:rgba(150,152,160,.16);pointer-events:none}' +
      '.ba-after{background:linear-gradient(160deg,#1b2130,#17181c 60%)}' +
      '.ba-hd{font-size:16px;font-weight:750;letter-spacing:-.03em}' +
      '.ba-sub{font-size:8.5px;color:#8a8f9c;margin-top:2px}' +
      '.ba-kpi{display:flex;gap:5px;margin-top:9px}' +
      '.ba-kpi div{flex:1;border-radius:6px;padding:6px 7px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.07)}' +
      '.ba-kpi b{display:block;font-size:15px;font-weight:800;letter-spacing:-.03em}' +
      '.ba-after .ba-kpi b{color:#6ee7a8}' +
      '.ba-kpi i{font-style:normal;font-size:7px;color:#8a8f9c;letter-spacing:.06em;text-transform:uppercase}' +
      '.ba-bars{margin-top:10px;display:flex;align-items:flex-end;gap:4px;height:44px}' +
      '.ba-bars span{flex:1;border-radius:2px 2px 0 0;background:currentColor;opacity:.85}' +
      '.ba-before .ba-bars{color:#6b7080}' +
      '.ba-after .ba-bars{color:#5b8def}' +
      '.ba-tag{position:absolute;top:9px;padding:2px 8px;border-radius:999px;font-size:7.5px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;box-sizing:border-box}' +
      '.ba-tag.b{left:9px;background:rgba(0,0,0,.4);color:#c9ccd6;border:1px solid rgba(255,255,255,.16)}' +
      '.ba-tag.a{right:9px;background:rgba(110,231,168,.15);color:#6ee7a8;border:1px solid rgba(110,231,168,.35)}' +
      '.ba-div{position:absolute;top:0;bottom:0;width:2px;background:#fff;box-shadow:0 0 0 1px rgba(0,0,0,.25),0 0 14px rgba(0,0,0,.4);will-change:left}' +
      '.ba-knob{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:20px;height:20px;border-radius:50%;' +
        'background:radial-gradient(circle at 35% 30%,#fff,#dfe1e8);box-shadow:inset 0 -1px 2px rgba(0,0,0,.2),0 3px 8px rgba(0,0,0,.4);' +
        'display:flex;align-items:center;justify-content:center;will-change:transform}' +
      '.ba-knob svg{width:12px;height:12px;stroke:#3a3d47;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}' +
      '.ba-cap{position:absolute;bottom:6px;left:0;right:0;text-align:center;font-size:8px;color:rgba(255,255,255,.4);letter-spacing:.1em;text-transform:uppercase;z-index:9}' +
      '</style>';

    // 假仪表盘内容（两层同构，只是配色/质感不同）
    const bars = hs => '<div class="ba-bars">' + hs.map(h => '<span style="height:' + h + '%"></span>').join('') + '</div>';
    const content = after =>
      '<div class="ba-hd">Render queue</div>' +
      '<div class="ba-sub">' + (after ? 'Processed · GPU accel on' : 'Raw capture · ungraded') + '</div>' +
      '<div class="ba-kpi">' +
        '<div><b>' + (after ? '4.2' : '1.1') + 'k</b><i>frames</i></div>' +
        '<div><b>' + (after ? '98' : '61') + '%</b><i>cache</i></div>' +
        '<div><b>' + (after ? '12' : '38') + 'ms</b><i>latency</i></div>' +
      '</div>' +
      bars(after ? [30, 55, 40, 75, 60, 90, 70, 95, 82, 99] : [22, 34, 26, 45, 38, 52, 41, 58, 49, 60]);

    el.insertAdjacentHTML('beforeend', STYLE +
      '<div class="ba">' +
        '<div class="ba-layer ba-before">' + content(false) + '<span class="ba-tag b">Before</span></div>' +
        '<div class="ba-layer ba-after" id="baAfter">' + content(true) + '<span class="ba-tag a">After</span></div>' +
        '<div class="ba-div" id="baDiv"><div class="ba-knob">' +
          '<svg viewBox="0 0 24 24"><path d="M9 6l-5 6 5 6M15 6l5 6-5 6"/></svg>' +
        '</div></div>' +
        '<div class="ba-cap">快甩 → 回弹 → 慢扫</div>' +
      '</div>');

    const after = el.querySelector('#baAfter');
    const div = el.querySelector('#baDiv');
    const knob = div.querySelector('.ba-knob');
    const clamp01 = x => x < 0 ? 0 : x > 1 ? 1 : x;
    const mix = (a, b, t) => a + (b - a) * t;
    const smooth = t => t * t * (3 - 2 * t);
    const outCubic = t => 1 - Math.pow(1 - clamp01(t), 3);
    const W = 280;

    // 分段杆位置（%）：蓄力 → 快甩 overshoot → 回弹 → 停 → 慢扫
    const PRE = 10, T0 = 14, FLING = 26, BOUNCE = 38, HOLD = 56, SCRUB = 104;
    const posAt = f => {
      if (f < T0) return mix(8, 6.5, smooth(clamp01((f - PRE) / (T0 - PRE))));
      if (f < FLING) return mix(6.5, 76, outCubic((f - T0) / (FLING - T0)));
      if (f < BOUNCE) return mix(76, 70, smooth(clamp01((f - FLING) / (BOUNCE - FLING))));
      if (f < HOLD) return 70;
      return mix(70, 40, smooth(clamp01((f - HOLD) / (SCRUB - HOLD))));
    };

    const DUR = 150;
    let raf, start = 0;
    const tick = now => {
      if (!start) start = now;
      const f = ((now - start) / 1000 * 30) % (DUR + 10);

      const p = posAt(f);
      const x = p / 100 * W;
      after.style.clipPath = 'inset(0 0 0 ' + x.toFixed(1) + 'px)';
      div.style.left = (x - 1).toFixed(1) + 'px';

      // 手柄速度拉伸 + 横向模糊
      const v = posAt(f + 0.5) - posAt(f - 0.5);
      const stretch = Math.min(1.35, 1 + Math.abs(v) * 0.035);
      const dir = v >= 0 ? 1 : -1;
      knob.style.transform = 'translate(-50%,-50%) scaleX(' + (stretch * dir).toFixed(3) + ')';
      knob.style.filter = Math.abs(v) > 2 ? 'blur(' + Math.min(2.5, Math.abs(v) * 0.12).toFixed(2) + 'px)' : 'none';

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => { cancelAnimationFrame(raf); el.innerHTML = ''; };
  }
};
