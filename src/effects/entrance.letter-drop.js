export default {
  id: 'letter-drop', group: 'entrance', name: '字符坠落堆积', lib: '原生 JS',
  desc: '标题字符按错峰间隔坠落，落地衰减弹跳、触地挤压，最后齐整回正，像一排字砸在地上。移植自 video-shotcraft 的 Letter Drop Physics（Apache-2.0）。',
  deps: '无',
  note: '下落用重力公式 y=D*(t/T)²（不是线性），落地后两段衰减弹跳用抛物线 4u(1-u) 拼接。保体积靠 scale 反向（下落拉伸 scaleY↑ 则 scaleX≈1/scaleY），触地挤压用阻尼余弦 e^(−t)·cos(t) 叠三次冲击。歪角站定要按 sin|θ| 抬起字让底角贴地，否则会穿地面。字符必须用 inline-block 撑出自然字宽（放一个 visibility:hidden 占位字），运动只走 transform 不改排版。运动模糊层四周要外扩 padding，否则 SVG 滤镜按元素盒计算会把拖影裁成硬边。',
  code: `/* 每字：占位撑宽 + 运动层（只 transform） */
<span style="position:relative;display:inline-block">
  <span style="visibility:hidden">S</span>            /* 撑自然字宽 */
  <div class="shadow"></div>                           /* 接触影 */
  <div class="motion">                                  /* 位移+挤压 */
    <span style="transform:rotate() scale(sx,sy);transform-origin:50% 86%">S</span>
  </div>
</span>

// 单字纵向位移（相对地面）
function dropY(t){
  if(t<=0) return -DROP;
  if(t<T_FALL) return -DROP + DROP*Math.pow(t/T_FALL,2);       // 重力加速
  if(t<T_FALL+T_B1){ var u=(t-T_FALL)/T_B1; return -DROP*.3*4*u*(1-u); }  // 弹1 30%
  if(t<T_FALL+T_B1+T_B2){ var u=(t-T_FALL-T_B1)/T_B2; return -DROP*.09*4*u*(1-u); } // 弹2 9%
  return 0;
}
// 起跳：非等差错峰，越来越密
start = 4 + 36*(1 - Math.pow(1 - i/(N-1), 1.5));`,
  init(el) {
    const STYLE = '<style data-fx="letter-drop">' +
      '.ld{display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%;position:relative;overflow:hidden;padding-bottom:24px}' +
      '.ld-row{display:flex;justify-content:center;font-size:34px;font-weight:800;line-height:1;color:#e8ecf4}' +
      '.ld-ch{position:relative;display:inline-block}' +
      '.ld-slot{visibility:hidden}' +
      '.ld-sh{position:absolute;left:50%;top:calc(100% - 6px);width:84%;height:7px;transform:translateX(-50%);border-radius:50%;background:rgba(0,0,0,1);pointer-events:none}' +
      '.ld-motion{position:absolute;left:0;top:0;width:100%;text-align:center;will-change:transform}' +
      '.ld-floor{position:absolute;left:10%;right:10%;bottom:22px;height:1px;background:linear-gradient(90deg,transparent,rgba(200,205,220,.25),transparent)}' +
      '.ld-cap{font-size:8.5px;color:#4a5368;letter-spacing:.1em;text-transform:uppercase;margin-top:14px}' +
      '</style>';

    const WORD = 'SHOTCRAFT';
    const DROP = 90, T_FALL = 14, T_B1 = 10, T_B2 = 6, SNAP = 74, SNAP_DUR = 6;
    const N = WORD.length;

    let chars = '';
    for (let i = 0; i < N; i++) {
      chars += '<span class="ld-ch"><span class="ld-slot">' + WORD[i] + '</span>' +
        '<div class="ld-sh" data-i="' + i + '"></div>' +
        '<div class="ld-motion" data-i="' + i + '"><span class="ld-g">' + WORD[i] + '</span></div></span>';
    }

    el.insertAdjacentHTML('beforeend', STYLE +
      '<div class="ld"><div class="ld-floor"></div><div class="ld-row">' + chars + '</div>' +
      '<div class="ld-cap">重力坠落 · 衰减弹跳 · 齐整回正</div></div>');

    const motions = [...el.querySelectorAll('.ld-motion')];
    const glyphs = [...el.querySelectorAll('.ld-g')];
    const shadows = [...el.querySelectorAll('.ld-sh')];

    const clamp01 = x => x < 0 ? 0 : x > 1 ? 1 : x;
    const outQ = u => 1 - Math.pow(1 - clamp01(u), 3);
    const h = n => { const s = Math.sin(n * 127.3) * 43758.5453; return s - Math.floor(s); };
    const startOf = i => 4 + 36 * (1 - Math.pow(1 - i / (N - 1), 1.5));

    const dropY = t => {
      if (t <= 0) return -DROP;
      if (t < T_FALL) return -DROP + DROP * Math.pow(t / T_FALL, 2);
      if (t < T_FALL + T_B1) { const u = (t - T_FALL) / T_B1; return -DROP * 0.3 * 4 * u * (1 - u); }
      if (t < T_FALL + T_B1 + T_B2) { const u = (t - T_FALL - T_B1) / T_B2; return -DROP * 0.09 * 4 * u * (1 - u); }
      return 0;
    };
    const IMPACTS = [[T_FALL, 1], [T_FALL + T_B1, 0.45], [T_FALL + T_B1 + T_B2, 0.18]];
    const squashAt = t => { let s = 0; for (const [t0, k] of IMPACTS) { const d = t - t0; if (d < 0 || d > 16) continue; s += k * Math.exp(-d / 2.6) * Math.cos(d * 0.85); } return s; };

    const DUR = 120;
    let raf, start = 0;
    const tick = now => {
      if (!start) start = now;
      const frame = ((now - start) / 1000 * 30) % (DUR + 10);

      const inhale = outQ((frame - (SNAP - 2)) / 2);
      const snap = outQ((frame - SNAP) / SNAP_DUR);
      const pulse = 0.06 * inhale * (1 - snap);

      for (let i = 0; i < N; i++) {
        const t = frame - startOf(i);
        const y = dropY(t);
        const vy = dropY(t + 0.5) - dropY(t - 0.5);
        const air = -y;
        const tiltTarget = (h(i + 1) - 0.5) * 12;
        const landP = outQ((t - T_FALL) / 6);
        const rot = tiltTarget * landP * (1 - snap);
        const stretch = Math.min(1, Math.abs(vy) / 60) * 0.12 * (t < T_FALL ? 1 : 0.6);
        const sq = squashAt(t);
        const sy = (1 + stretch) * (1 - 0.2 * sq) + pulse;
        const sx = (1 - stretch * 0.5) * (1 + 0.15 * sq) + pulse;
        const lift = clamp01(air / 120);
        const shOp = (t < 0 ? 0 : 0.35) * (1 - lift * 0.85) * clamp01((t + 2) / 8);
        const shW = (0.74 + 1.3 * lift) * (1 + 0.12 * Math.max(0, sq));

        motions[i].style.transform = 'translateY(' + (y).toFixed(2) + 'px)';
        glyphs[i].style.transform = 'rotate(' + rot.toFixed(2) + 'deg) scale(' + sx.toFixed(3) + ',' + sy.toFixed(3) + ')';
        glyphs[i].style.transformOrigin = '50% 88%';
        glyphs[i].style.filter = t < T_FALL && t > 0 && Math.abs(vy) > 8 ? 'blur(' + Math.min(2, Math.abs(vy) * 0.05).toFixed(2) + 'px)' : 'none';
        shadows[i].style.opacity = shOp.toFixed(3);
        shadows[i].style.transform = 'translateX(-50%) scaleX(' + shW.toFixed(3) + ')';
        shadows[i].style.filter = 'blur(' + (2 + 4 * lift).toFixed(1) + 'px)';
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => { cancelAnimationFrame(raf); el.innerHTML = ''; };
  }
};
