export default {
  id: 'carousel-step', group: 'space', name: '分步停靠卡环', lib: '纯 CSS + 原生 JS',
  desc: '八张卡排成 billboard 圆环，不是匀速自转而是「推一把—停靠」分步走，转到正前方那张被点亮前推。移植自 video-shotcraft 的 Carousel 3D（Apache-2.0）。',
  deps: '无',
  note: '每张卡只绕 Y 公转、沿法向推出半径，永不绕 X/Z——这样任何时刻都正立不倒置（billboard）。backface-visibility:hidden + 正反两层同向贴图保证背面也不翻转。转角 = 50% 匀速底 + 50% 分步（停靠 DWELL 帧 + smooth 换位），整环永远在走但每 45° 有一次呼吸。空气透视按方位角给卡面叠深色（最后方最暗）。正前方的卡沿法向多推出一点（只平移不旋转），读作被选中。',
  code: `/* 每卡：只绕 Y 公转 + 法向推出半径，永不绕 X/Z */
transform: rotateY(i*360/N deg) translateZ(RADIUS);

/* billboard：父环 rotateY，卡自身不翻 */
<div style="transform:rotateY(-spin deg);transform-style:preserve-3d">
  <div class="card" style="transform:rotateY(i*45deg) translateZ(R)">
    <div class="face"/><div class="face" style="transform:rotateY(180deg)"/>
  </div>
</div>

/* 分步转角：50% 匀速 + 50% 停靠换位 */
function stepPart(f){
  var k=Math.floor(f/BEAT), local=f-k*BEAT;
  return (k + smooth(clamp((local-DWELL)/(BEAT-DWELL)))) / N;
}
spin = (0.5*(f/(N*BEAT)) + 0.5*stepPart(f)) * 360;

/* 空气透视：按方位角叠深色，越靠后越暗 */
azimuth = ((i*360/N - spin)%360 + 540)%360 - 180;
depth = (1 - cos(azimuth*π/180))/2;          // 0=正前 1=正后
overlay: bg-depth, opacity .7*depth;

/* 正前卡沿法向多推一点（选中） */
translateZ(R + 44*hl), hl = smooth(clamp(1 - |azimuth|/26));`,
  init(el) {
    const STYLE = '<style data-fx="carousel-step">' +
      '.cs{position:relative;width:100%;height:100%;perspective:600px;overflow:hidden;display:flex;align-items:center;justify-content:center}' +
      '.cs-ring{position:relative;width:0;height:0;transform-style:preserve-3d;will-change:transform}' +
      '.cs-card{position:absolute;left:-38px;top:-46px;width:76px;height:92px;transform-style:preserve-3d;will-change:transform}' +
      '.cs-face{position:absolute;inset:0;border-radius:9px;box-sizing:border-box;backface-visibility:hidden;-webkit-backface-visibility:hidden;' +
        'background:linear-gradient(165deg,#2a2f3f,#0f110d);border:1px solid rgba(255,255,255,.1);overflow:hidden;padding:7px;font-family:system-ui,sans-serif}' +
      '.cs-hd{display:flex;justify-content:space-between;font-size:5px;font-weight:700;letter-spacing:.1em;color:#8b93a8;font-family:ui-monospace,monospace}' +
      '.cs-stat{font-size:15px;font-weight:800;color:#e8ecf4;letter-spacing:-.04em;margin-top:24px}' +
      '.cs-stat small{font-size:7px;color:#8b93a8}' +
      '.cs-name{font-size:8px;font-weight:650;color:#e8ecf4;margin-top:2px}' +
      '.cs-meta{position:absolute;left:7px;bottom:6px;font-size:4.5px;letter-spacing:.1em;color:#8b93a8;font-family:ui-monospace,monospace}' +
      '.cs-depth{position:absolute;inset:0;background:#0b0d12;opacity:0}' +
      '.cs-cap{position:absolute;bottom:7px;left:0;right:0;text-align:center;font-size:8px;color:#4a5368;letter-spacing:.1em;text-transform:uppercase}' +
      '</style>';

    const N = 8, RADIUS = 118, BEAT = 21, DWELL = 8;
    const CARDS = [
      ['Beat Cuts', '120', 'bpm'], ['Steep Tilt', '38', 'deg'], ['Sound', '-14', 'LUFS'], ['Gauge', '96', '%'],
      ['Flash', '10x', '2f'], ['Chart', '45', 'f'], ['Ease', '0.8', 's'], ['Path', '4.2', 's']
    ];

    let cards = '';
    for (let i = 0; i < N; i++) {
      const c = CARDS[i];
      const face = '<div class="cs-hd"><span>SHOT ' + (i + 1) + '</span><span>&#9679;</span></div>' +
        '<div class="cs-stat">' + c[1] + '<small>' + c[2] + '</small></div>' +
        '<div class="cs-name">' + c[0] + '</div>' +
        '<div class="cs-meta">EDIT · ON BEAT</div><div class="cs-depth"></div>';
      cards += '<div class="cs-card" data-i="' + i + '">' +
        '<div class="cs-face">' + face + '</div>' +
        '<div class="cs-face" style="transform:rotateY(180deg)">' + face + '</div></div>';
    }

    el.insertAdjacentHTML('beforeend', STYLE +
      '<div class="cs"><div class="cs-ring" id="csRing">' + cards + '</div>' +
      '<div class="cs-cap">推一把 → 停靠 → 正前卡点亮</div></div>');

    const ring = el.querySelector('#csRing');
    const cardEls = [...el.querySelectorAll('.cs-card')];
    const clamp01 = x => x < 0 ? 0 : x > 1 ? 1 : x;
    const smooth = u => u * u * (3 - 2 * u);

    const stepPart = f => {
      const k = Math.floor(f / BEAT), local = f - k * BEAT;
      return (k + smooth(clamp01((local - DWELL) / (BEAT - DWELL)))) / N;
    };

    const CYCLE = N * BEAT;
    let raf, start = 0;
    const tick = now => {
      if (!start) start = now;
      const f = ((now - start) / 1000 * 30) % CYCLE;

      const spin = (0.5 * (f / CYCLE) + 0.5 * stepPart(f)) * 360;
      ring.style.transform = 'rotateY(' + (-spin).toFixed(2) + 'deg) rotateX(-8deg)';

      for (let i = 0; i < N; i++) {
        const azimuth = ((i * 360 / N - spin) % 360 + 540) % 360 - 180;
        const depth = (1 - Math.cos(azimuth * Math.PI / 180)) / 2;
        const hl = smooth(clamp01(1 - Math.abs(azimuth) / 26));
        const c = cardEls[i];
        c.style.transform = 'rotateY(' + (i * 360 / N) + 'deg) translateZ(' + (RADIUS + 20 * hl).toFixed(1) + 'px)';
        // 空气透视 + 正前点亮
        const faces = c.querySelectorAll('.cs-face');
        faces.forEach(fc => {
          const d = fc.querySelector('.cs-depth');
          d.style.opacity = (0.7 * depth).toFixed(3);
          fc.style.borderColor = hl > 0.01 ? 'rgba(184,255,94,' + (0.25 + 0.6 * hl).toFixed(3) + ')' : 'rgba(255,255,255,.1)';
        });
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => { cancelAnimationFrame(raf); el.innerHTML = ''; };
  }
};
