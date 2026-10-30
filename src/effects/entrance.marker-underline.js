export default {
  id: 'marker-underline', group: 'entrance', name: '马克笔下划线', lib: 'SVG + 原生 JS',
  desc: '一道带粗细变化、干笔毛糙的马克笔从左到右划过重点词。移植自 video-shotcraft 的 Marker Underline Title（Apache-2.0）。',
  deps: '无',
  note: '马克笔不是等宽描边——起笔收细、中段饱满、收笔收尖，所以先用 JS 沿中轴生成一个「变宽多边形」路径（上下轮廓各一串点再闭合），不能用 stroke-dashoffset 画等宽线糊弄。揭示靠一个从左往右长的 clipPath 矩形，不是移动路径本身。毛糙边用 feDisplacementMap（低频位移）+ 高频噪声阈值镂空做飞白，两层 filter 缺一不可。mix-blend-mode:multiply 才能「印进」底色而不是浮在上面。',
  code: `<svg viewBox="0 0 252 44"><defs>
  <clipPath id="r"><rect width="REVEAL" height="60"/></clipPath>
  <filter id="dry"><feTurbulence baseFrequency=".09 .5" numOctaves="2" result="w"/>
    <feDisplacementMap in="SourceGraphic" in2="w" scale="1.8" result="rough"/>
    <feTurbulence baseFrequency=".035 .9" numOctaves="2" result="g"/>
    <feColorMatrix in="g" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -16 11.4" result="h"/>
    <feComposite in="rough" in2="h" operator="in"/></filter>
</defs>
<g clip-path="url(#r)"><path d="变宽多边形路径" fill="#1b1916" filter="url(#dry)"/></g></svg>

// 生成变宽笔画多边形（起细-中饱-收尖 + 微歪中轴）
function stroke(len, seed){
  var top=[], bot=[], wob=[];
  for(var i=0;i<=40;i++){ wob.push(Math.sin(i*seed)*.5); }
  for(i=0;i<=40;i++){
    var t=i/40, x=t*len;
    var mid=19-t*9+Math.sin(t*Math.PI*1.6+.4)*2.6+wob[i]*1.6;
    var wb=14+Math.sin(t*Math.PI)*6-Math.max(0,t-.86)*46-Math.max(0,.06-t)*70;
    var w=Math.max(2.2, wb+wob[i]*3);
    top.push(x.toFixed(1)+','+(mid-w/2).toFixed(1));
    bot.push(x.toFixed(1)+','+(mid+w/2).toFixed(1));
  }
  return 'M'+top.join('L')+'L'+bot.reverse().join('L')+'Z';
}`,
  init(el) {
    const STYLE = '<style data-fx="marker-underline">' +
      '.mk{display:flex;flex-direction:column;align-items:center;gap:8px;font-family:system-ui,sans-serif}' +
      '.mk-t{font-size:22px;font-weight:700;color:#e8ecf4;letter-spacing:-.02em;white-space:nowrap}' +
      '.mk-em{font-style:italic;position:relative;display:inline-block}' +
      '.mk-svg{position:absolute;left:-8px;bottom:-14px;overflow:visible;mix-blend-mode:multiply}' +
      '.mk-cap{font-size:9px;color:#4a5368;letter-spacing:.1em;text-transform:uppercase}' +
      '</style>';

    // 生成变宽笔画多边形（起细-中饱-收尖 + 微歪中轴）
    const stroke = (len, seed) => {
      const top = [], bot = [], wob = [];
      for (let i = 0; i <= 40; i++) { wob.push(Math.sin(i * seed) * 0.5); }
      for (let i = 0; i <= 40; i++) {
        const t = i / 40, x = t * len;
        const mid = 19 - t * 9 + Math.sin(t * Math.PI * 1.6 + 0.4) * 2.6 + wob[i] * 1.6;
        const wb = 14 + Math.sin(t * Math.PI) * 6 - Math.max(0, t - 0.86) * 46 - Math.max(0, 0.06 - t) * 70;
        const w = Math.max(2.2, wb + wob[i] * 3);
        top.push(x.toFixed(1) + ',' + (mid - w / 2).toFixed(1));
        bot.push(x.toFixed(1) + ',' + (mid + w / 2).toFixed(1));
      }
      return 'M' + top.join('L') + 'L' + bot.reverse().join('L') + 'Z';
    };

    const LEN = 108;
    const path = stroke(LEN, 1.7);

    el.insertAdjacentHTML('beforeend', STYLE +
      '<div class="mk"><div class="mk-t">Meet the <span class="mk-em">new' +
      '<svg class="mk-svg" width="' + LEN + '" height="30" viewBox="0 0 ' + LEN + ' 30">' +
        '<defs><clipPath id="mkR"><rect id="mkRect" x="0" y="-16" width="0" height="44"/></clipPath>' +
        '<filter id="mkDry" x="-5%" y="-40%" width="110%" height="180%" color-interpolation-filters="sRGB">' +
          '<feTurbulence type="fractalNoise" baseFrequency="0.09 0.5" numOctaves="2" seed="7" result="w"/>' +
          '<feDisplacementMap in="SourceGraphic" in2="w" scale="1.8" xChannelSelector="R" yChannelSelector="G" result="rough"/>' +
          '<feTurbulence type="fractalNoise" baseFrequency="0.035 0.9" numOctaves="2" seed="19" result="grain"/>' +
          '<feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -16 11.4" result="holes"/>' +
          '<feComposite in="rough" in2="holes" operator="in"/>' +
        '</filter></defs>' +
        '<g clip-path="url(#mkR)"><path d="' + path + '" fill="#c9c2ff" fill-opacity="0.9" filter="url(#mkDry)"/></g>' +
      '</svg></span></div>' +
      '<div class="mk-cap">悬停 / 进场重划一次</div></div>');

    const rect = el.querySelector('#mkRect');
    let raf, start = 0;

    // 标题落定后 32f 停一拍，再 10 帧从左划到右（ease-out）
    const run = now => {
      if (!start) start = now;
      const t = (now - start) / 1000;
      const wait = 0.35, dur = 0.5;
      let p;
      if (t < wait) p = 0;
      else if (t < wait + dur) { const u = (t - wait) / dur; p = 1 - Math.pow(1 - u, 2.2); }
      else p = 1;
      rect.setAttribute('width', (p * (LEN + 4)).toFixed(1));
      if (p < 1) raf = requestAnimationFrame(run);
    };
    raf = requestAnimationFrame(run);

    return () => { cancelAnimationFrame(raf); el.innerHTML = ''; };
  }
};
