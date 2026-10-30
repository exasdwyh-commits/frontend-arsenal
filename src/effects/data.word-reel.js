export default {
  id: 'word-reel', group: 'data', name: '竖向词条滚轮', lib: '原生 JS',
  desc: '标语末词用竖向滚轮循环切换，中心词清晰上色、相邻行纵向模糊带景深，像滚筒带曲面。移植自 video-shotcraft 的 Vertical Word Roll（Apache-2.0）。',
  deps: '无',
  note: '景深模糊是「纵向高斯」——SVG feGaussianBlur 的 stdDeviation 只给 y 分量（"0 σ"），横向笔画才不会糊。离中心越远的行 blur 越大、越淡，且按滚筒曲面 scaleY 压扁（最多 14%），这是「滚轮」区别于「平移列表」的关键。换词步进用 outQuint+outBack 混合（前快后极慢带轻微过冲）。转动时按滚轮速度再叠一层纵向运动模糊，静止时归 0。视窗上下沿用 mask 渐隐，不是硬裁。',
  code: `/* 三行高视窗，滚轮列在其中滑动，中心行 = 第二行 */
<div style="height:ROW*3;overflow:hidden;
  -webkit-mask-image:linear-gradient(180deg,transparent 0,#000 26%,#000 74%,transparent 100%)">
  <div style="transform:translateY(ROW - p*ROW)">  <!-- p=滚轮进度 -->
    ...每行一个词...
  </div>
</div>

/* 每行：距中心越远越糊越淡越扁 */
d = Math.abs(i - p);
blur = (d<1 ? 3*d : 3 + 2*Math.min(d-1,1)) + motionBlur;
opacity = d<1 ? 1-0.65*d : Math.max(.1, .35-.23*(d-1));
scaleY = 1 - .14*Math.min(1, d/1.4);

/* 纵向高斯：stdDeviation 只给 y，横笔不糊 */
<filter><feGaussianBlur stdDeviation="0 BLUR"/></filter>

/* 换词步进：outQuint 前快 + outBack 过冲 */
reel = Σ (0.7*outQuint(u) + 0.3*outBack(u))`,
  init(el) {
    const STYLE = '<style data-fx="word-reel">' +
      '.wr{display:flex;align-items:center;gap:8px;height:100%;justify-content:center}' +
      '.wr-lead{font-size:17px;font-weight:800;color:#e8ecf4;letter-spacing:-.01em;white-space:nowrap;flex:0 0 auto}' +
      '.wr-view{position:relative;height:34px;width:104px;flex:0 0 auto;overflow:hidden;' +
        '-webkit-mask-image:linear-gradient(180deg,transparent 0,#000 30%,#000 70%,transparent 100%);' +
        'mask-image:linear-gradient(180deg,transparent 0,#000 30%,#000 70%,transparent 100%)}' +
      '.wr-col{position:absolute;left:0;top:0}' +
      '.wr-row{height:34px;display:flex;align-items:center;font-size:17px;font-weight:800;white-space:nowrap;color:#8b93a8}' +
      '.wr-cap{font-size:8px;color:#4a5368;letter-spacing:.1em;text-transform:uppercase;margin-top:8px}' +
      '.wr-svg{position:absolute;width:0;height:0}' +
      '</style>';

    const WORDS = ['Launches', 'Demos', 'Promos', 'Every Shot'];
    const STEPS = [0.16, 0.38, 0.6];

    let rows = '';
    for (let i = 0; i < WORDS.length; i++) {
      rows += '<svg class="wr-svg" aria-hidden><filter id="wrF' + i + '" x="-10%" y="-120%" width="120%" height="340%" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="0 0"/></filter>' +
        '<div class="wr-row" style="filter:url(#wrF' + i + ')">' + WORDS[i] + '</div>';
    }
    // 上面 filter 与 div 同级会错，改成每行包一层
    rows = '';
    for (let i = 0; i < WORDS.length; i++) {
      rows += '<div class="wr-row"><svg class="wr-svg" aria-hidden><filter id="wrF' + i + '" x="-10%" y="-120%" width="120%" height="340%" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="0 0" id="wrBlur' + i + '"/></filter></svg>' +
        '<span id="wrTxt' + i + '">' + WORDS[i] + '</span></div>';
    }

    el.insertAdjacentHTML('beforeend', STYLE +
      '<div class="wr">' +
        '<div class="wr-lead">Crafted for</div>' +
        '<div class="wr-view"><div class="wr-col" id="wrCol">' + rows + '</div></div>' +
      '</div>' +
      '<div style="text-align:center"><div class="wr-cap">滚筒景深 · 落定染色</div></div>');

    const col = el.querySelector('#wrCol');
    const txts = WORDS.map((_, i) => el.querySelector('#wrTxt' + i));
    const blurs = WORDS.map((_, i) => el.querySelector('#wrBlur' + i));
    const ROW = 34;

    const clamp01 = x => x < 0 ? 0 : x > 1 ? 1 : x;
    const outQuint = u => 1 - Math.pow(1 - u, 5);
    const outBack = u => { const c = 1.7; return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2); };
    const seg = (t, a, b) => clamp01((t - a) / (b - a));
    const mixHex = (a, b, k) => {
      k = clamp01(k);
      const pa = [parseInt(a.slice(1, 3), 16), parseInt(a.slice(3, 5), 16), parseInt(a.slice(5, 7), 16)];
      const pb = [parseInt(b.slice(1, 3), 16), parseInt(b.slice(3, 5), 16), parseInt(b.slice(5, 7), 16)];
      return 'rgb(' + pa.map((v, i2) => Math.round(v + (pb[i2] - v) * k)).join(',') + ')';
    };

    const DUR = 5;
    const reelAt = t => { let p = 0; for (const s of STEPS) { const u = seg(t, s, s + 0.12); p += 0.7 * outQuint(u) + 0.3 * outBack(u); } return p; };
    const DT = 0.5 / 150;

    let raf, start = 0;
    const tick = now => {
      if (!start) start = now;
      const t = ((now - start) / 1000) % (DUR + 0.4);
      const p = reelAt(t);
      const speed = Math.abs(reelAt(t + DT) - reelAt(t - DT));
      const motionBlur = Math.min(4, speed * ROW * 0.22);

      col.style.transform = 'translateY(' + (ROW - p * ROW).toFixed(2) + 'px)';

      for (let i = 0; i < WORDS.length; i++) {
        const d = Math.abs(i - p);
        const blur = (d < 1 ? 3 * d : 3 + 2 * Math.min(d - 1, 1)) + motionBlur;
        const op = d < 1 ? 1 - 0.65 * d : Math.max(0.1, 0.35 - 0.23 * (d - 1));
        const squash = 1 - 0.14 * Math.min(1, d / 1.4);
        blurs[i].setAttribute('stdDeviation', '0 ' + blur.toFixed(2));
        txts[i].style.opacity = op.toFixed(3);
        txts[i].style.transformOrigin = 'center';
        txts[i].parentElement.style.transform = 'scaleY(' + squash.toFixed(4) + ')';
        txts[i].style.color = mixHex('#8b93a8', '#6c8cff', clamp01(1 - d * 2.4));
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => { cancelAnimationFrame(raf); el.innerHTML = ''; };
  }
};
