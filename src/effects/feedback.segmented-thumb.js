export default {
  id: 'segmented-thumb', group: 'feedback', name: '分段控件滑块特写', lib: '原生 JS + CSS 3D',
  desc: '超大箭头光标点进胶囊分段控件，白色 thumb 以橡皮筋拉伸滑到另一段、带 1.5% 过冲回弹，到位瞬间新选项前弹出小图标、旧图标收起。移植自 video-shotcraft 的 Segmented Thumb Hero（Apache-2.0）。',
  deps: '无',
  note: 'thumb 橡皮筋靠「前缘先走、后缘跟随」：计算 thumb 前沿速度把整体 scaleX 拉长（1→1.09），再按位置回弹到 1——不是简单位移。轨道是「下凹槽」（内阴影 + 发丝线），thumb 是「受光凸起件」（顶沿高光 + 近实远虚两层影），一凹一凸才像真实控件。段标签颜色随 thumb 位置在两色间连续插值（不是到位才换色）。光标 scale 要用 transform-origin:15% 10%（箭头尖是锚点），按压时整支缩 14% 像真点下去。',
  code: `/* thumb 橡皮筋：前缘先走、后缘跟随 */
x  = thumbPos(f);                        // 目标段中心（带 1.5% 过冲回弹）
v  = thumbPos(f+0.5) - thumbPos(f-0.5);  // 速度
stretch = 1 + min(.09, |v| * 0.006);     // 甩动时拉长
thumb.style.width = BASE * stretch + 'px';
thumb.style.transform = 'translateX(' + (x - BASE*stretch/2) + 'px)';

/* 标签颜色随位置连续插值 */
k = x / trackW;
labelA.style.color = mix(A_DIM, A_INK, 1-k);
labelB.style.color = mix(B_DIM, B_INK, k);

/* 光标：尖端为锚点按压 */
cursor.style.transformOrigin = '15% 10%';
cursor.style.transform = 'scale(' + (1 - press*0.14) + ')';
press = 1 at clickFrame → ease back to 0;  /* 涟漪细环同帧扩散 */`,
  init(el) {
    const STYLE = '<style data-fx="segmented-thumb">' +
      '.sg{position:relative;width:100%;height:100%;overflow:hidden;display:flex;align-items:center;justify-content:center;' +
        'background:radial-gradient(120% 100% at 50% 0%,#f7f5f0,#e8e6e0);font-family:system-ui,sans-serif}' +
      '.sg-track{position:relative;display:flex;padding:4px;border-radius:999px;background:#e3e1da;' +
        'box-shadow:inset 0 2px 5px rgba(80,74,58,.28),inset 0 0 0 1px rgba(255,255,255,.5);will-change:transform,opacity}' +
      '.sg-thumb{position:absolute;top:4px;bottom:4px;left:4px;width:104px;border-radius:999px;' +
        'background:linear-gradient(180deg,#ffffff,#f4f3f6);box-shadow:inset 0 1px 0 #fff,0 4px 9px -2px rgba(70,64,50,.4),0 1px 2px rgba(70,64,50,.25);' +
        'will-change:transform,width;transform-origin:50% 50%}' +
      '.sg-opt{position:relative;z-index:2;display:flex;align-items:center;gap:6px;padding:0 16px;height:30px;' +
        'font-size:12.5px;font-weight:700;letter-spacing:-.01em;white-space:nowrap;transition:none}' +
      '.sg-ico{width:0;overflow:hidden;display:flex;align-items:center;transition:none}' +
      '.sg-ico svg{width:13px;height:13px;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;display:block}' +
      '.sg-ripple{position:absolute;top:50%;left:50%;width:20px;height:20px;margin:-10px 0 0 -10px;border-radius:50%;' +
        'border:1.5px solid #5b63d3;opacity:0;pointer-events:none}' +
      '.sg-cur{position:absolute;left:0;top:0;pointer-events:none;will-change:transform;filter:drop-shadow(0 6px 7px rgba(70,64,50,.35)) drop-shadow(0 2px 2px rgba(70,64,50,.3))}' +
      '.sg-cur svg{display:block}' +
      '.sg-cap{position:absolute;bottom:7px;left:0;right:0;text-align:center;font-size:8px;color:#96907f;letter-spacing:.1em;text-transform:uppercase}' +
      '</style>';

    const icoPath = 'M21 15a2 2 0 0 1-2 2H8l-4 4V5a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2z'; // 对话气泡

    el.insertAdjacentHTML('beforeend', STYLE +
      '<div class="sg">' +
        '<div class="sg-track" id="sgTrack">' +
          '<div class="sg-thumb" id="sgThumb"></div>' +
          '<div class="sg-opt" id="sgA" style="color:#17181c">' +
            '<span class="sg-ico" id="sgIcoA"><svg viewBox="0 0 24 24" style="stroke:#5b63d3"><path d="' + icoPath + '"/></svg></span>' +
            'Ask</div>' +
          '<div class="sg-opt" id="sgB" style="color:#8e9097">Film' +
            '<span class="sg-ico" id="sgIcoB"><svg viewBox="0 0 24 24" style="stroke:#5b63d3"><path d="M3 6h18v12H3zM10 9v6l5-3z"/></svg></span>' +
          '</div>' +
          '<div class="sg-ripple" id="sgRip"></div>' +
        '</div>' +
        '<div class="sg-cur" id="sgCur">' +
          '<svg width="26" height="30" viewBox="0 0 26 30">' +
            '<path d="M3 2l18 12-8 1.6 4.6 8.2-3.4 2-4.6-8.2L3 23z" fill="#fff" stroke="#2a2c33" stroke-width="2" stroke-linejoin="round"/>' +
          '</svg>' +
        '</div>' +
        '<div class="sg-cap">光标点击 · thumb 橡皮筋滑动</div>' +
      '</div>');

    const track = el.querySelector('#sgTrack');
    const thumb = el.querySelector('#sgThumb');
    const optA = el.querySelector('#sgA');
    const optB = el.querySelector('#sgB');
    const icoA = el.querySelector('#sgIcoA');
    const icoB = el.querySelector('#sgIcoB');
    const rip = el.querySelector('#sgRip');
    const cur = el.querySelector('#sgCur');

    const clamp01 = x => x < 0 ? 0 : x > 1 ? 1 : x;
    const mix = (a, b, t) => a + (b - a) * t;
    const outCubic = t => 1 - Math.pow(1 - clamp01(t), 3);
    const INK = '#17181c', DIM = '#8e9097';
    // hex 插值
    const hex = (c1, c2, t) => {
      const p = c => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
      const [a, b] = [p(c1), p(c2)];
      return 'rgb(' + a.map((v, i) => Math.round(mix(v, b[i], t))).join(',') + ')';
    };

    // 时间轴（30fps）：浮入 6-24 → 光标滑入 24-42 → 点击 48 → thumb 滑 48-56 → 图标弹出 56-66 → hold
    const ENTER = 6, CUR0 = 24, CLICK = 48, SLIDE = 8;
    const TRACK_W = 224, TH_W = 104;
    const TARGET = TRACK_W - 4 - TH_W - 4;  // 右段 thumb 的 x

    // thumb 位置（带 1.5% 过冲回弹）
    const posAt = f => {
      if (f < CLICK) return 0;
      if (f >= CLICK + 20) return TARGET;
      const t = outCubic(clamp01((f - CLICK) / SLIDE));
      const overshoot = Math.sin(clamp01((f - CLICK) / 20) * Math.PI) * 0.015 * TARGET;
      return TARGET * t + overshoot;
    };

    const DUR = 110;
    let raf, start = 0;
    const tick = now => {
      if (!start) start = now;
      const f = ((now - start) / 1000 * 30) % (DUR + 14);
      const ff = f <= DUR ? f : 0;

      // 轨道浮入
      const en = outCubic(clamp01((ff - ENTER) / 18));
      track.style.opacity = (0.2 + 0.8 * en).toFixed(3);
      track.style.transform = 'translateY(' + ((1 - en) * 26).toFixed(1) + 'px) scale(' + (0.9 + 0.1 * en).toFixed(3) + ')';

      // thumb 橡皮筋
      const x = posAt(ff);
      const v = posAt(ff + 0.5) - posAt(ff - 0.5);
      const stretch = 1 + Math.min(0.09, Math.abs(v) * 0.006);
      const w = TH_W * stretch;
      thumb.style.width = w.toFixed(1) + 'px';
      thumb.style.transform = 'translateX(' + (x + 4 - w / 2 + TH_W / 2 - 4).toFixed(1) + 'px)';

      // 标签颜色随位置连续插值
      const k = clamp01(x / TARGET);
      optA.style.color = hex(INK, DIM, k);
      optB.style.color = hex(DIM, INK, k);

      // 图标弹出/收起（到位后）
      const pop = clamp01((ff - (CLICK + SLIDE + 2)) / 10);
      const popE = 1 + 1.6 * Math.pow(pop - 1, 3) + 1.6 * Math.pow(pop - 1, 2);
      icoB.style.width = (pop * 19).toFixed(1) + 'px';
      icoB.style.opacity = pop.toFixed(3);
      icoB.style.transform = 'scale(' + Math.max(0.01, popE).toFixed(3) + ')';
      icoA.style.width = ((1 - pop) * 19).toFixed(1) + 'px';
      icoA.style.opacity = (1 - pop).toFixed(3);

      // 涟漪（点击帧扩散）
      const rp = clamp01((ff - CLICK) / 14);
      rip.style.opacity = (rp > 0 && rp < 1 ? (1 - rp) * 0.8 : 0).toFixed(3);
      rip.style.transform = 'scale(' + (1 + rp * 4).toFixed(2) + ')';

      // 光标：滑入 → 按压 → 保持
      const cx0 = 250, cy0 = 150, cx1 = 148, cy1 = 88;
      const cs = outCubic(clamp01((ff - CUR0) / 18));
      const cx = mix(cx0, cx1, cs), cy = mix(cy0, cy1, cs);
      const press = ff < CLICK ? 0 : Math.max(0, 1 - (ff - CLICK) / 6);
      cur.style.opacity = (clamp01((ff - CUR0) / 6) * (ff >= CLICK ? 0.96 : 1)).toFixed(3);
      cur.style.transform = 'translate(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px) scale(' + (1 - press * 0.14).toFixed(3) + ')';
      cur.style.transformOrigin = '15% 10%';

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => { cancelAnimationFrame(raf); el.innerHTML = ''; };
  }
};
