export default {
  id: 'weight-pump', group: 'entrance', name: '字重脉冲', lib: '原生 JS',
  desc: '标题笔画随节拍变粗又弹回，像文字跟着低音鼓蹦迪，字不位移只有属性在动。移植自 video-shotcraft 的 Font Weight Pump（Apache-2.0）。',
  deps: '无',
  note: '可变字重是 font-variation-settings 的 wght 轴（100–900），固定字重字体用 font-weight 只会离散跳档、没有中间值，必须用可变字体（如 Inter、Roboto Flex）才平滑。每个字钉在最大字重的槽位里（外面套一个 visibility:hidden 的 900 字重占位），变粗时才不会挤动邻居。回弹按「中间先收、两边后收」错开衰减窗，读作冲击从中心向两侧散。别做整画面逐帧抖动——只有字随拍动。',
  code: `/* 每字：900 字重占位撑槽 + 可变字重实字原位变粗 */
<span style="position:relative;display:inline-block">
  <span style="visibility:hidden;font-variation-settings:'wght' 900">L</span>
  <span style="position:absolute;left:50%;transform:translateX(-50%);
    font-variation-settings:'wght' var(--w)">L</span>
</span>

// 命中后幂衰减包络：t=0→1，t>=decay→0；离中心越远衰减窗越长
function env(f, beat, decay){
  var t = f - beat;
  return (t<0||t>=decay) ? 0 : Math.pow(1 - t/decay, 0.8);
}
// 每拍变粗到 900 再弹回 250
w = 250 + 650 * env(frame, beat, 9 + dist*1.6);
el.style.fontVariationSettings = "'wght' " + w;`,
  init(el) {
    const STYLE = '<style data-fx="weight-pump">' +
      '.wp{display:flex;flex-direction:column;align-items:center;gap:10px;width:100%;height:100%;justify-content:center;position:relative;overflow:hidden}' +
      '.wp-row{display:flex;white-space:pre;font-size:30px;line-height:1;color:#e8ecf4;letter-spacing:-.01em}' +
      '.wp-row.echo{position:absolute;color:transparent;-webkit-text-stroke:1px rgba(180,140,255,.5);opacity:0}' +
      '.wp-ch{position:relative;display:inline-block}' +
      '.wp-slot{visibility:hidden;font-variation-settings:"wght" 900}' +
      '.wp-fill{position:absolute;left:50%;top:0;transform:translateX(-50%)}' +
      '.wp-seq{display:flex;gap:5px;margin-top:6px}' +
      '.wp-step{width:16px;height:16px;border-radius:5px;background:rgba(232,236,244,.06);box-shadow:inset 0 0 0 1px rgba(232,236,244,.12);position:relative}' +
      '.wp-step i{position:absolute;inset:0;border-radius:5px;background:#b48cff;opacity:0}' +
      '.wp-cap{font-size:8.5px;color:#6b6480;letter-spacing:.12em;text-transform:uppercase}' +
      '</style>';

    const TEXT = 'LOUDER';
    const BEATS = [16, 30, 44, 58, 72, 86];
    const CENTER = (TEXT.length - 1) / 2;

    let chars = '';
    for (let i = 0; i < TEXT.length; i++) {
      chars += '<span class="wp-ch"><span class="wp-slot">' + TEXT[i] + '</span><span class="wp-fill">' + TEXT[i] + '</span></span>';
    }
    let steps = '';
    for (let i = 0; i < BEATS.length; i++) steps += '<div class="wp-step"><i></i></div>';

    el.insertAdjacentHTML('beforeend', STYLE +
      '<div class="wp">' +
        '<div class="wp-row echo" id="wpEchoA"></div>' +
        '<div class="wp-row" id="wpMain">' + chars + '</div>' +
        '<div class="wp-row echo" id="wpEchoB"></div>' +
        '<div class="wp-seq" id="wpSeq">' + steps + '</div>' +
        '<div class="wp-cap">128 BPM · 笔画随拍变粗</div>' +
      '</div>');

    // 回声行复用同样的字符结构
    const echoChars = chars;
    el.querySelector('#wpEchoA').innerHTML = echoChars;
    el.querySelector('#wpEchoB').innerHTML = echoChars;

    const fills = [...el.querySelectorAll('#wpMain .wp-fill')];
    const echoA = el.querySelector('#wpEchoA');
    const echoB = el.querySelector('#wpEchoB');
    const stepEls = [...el.querySelectorAll('#wpSeq .wp-step')];
    const stepInners = [...el.querySelectorAll('#wpSeq .wp-step i')];

    const BEATLEN = 14, DUR = 120;
    const clamp01 = x => x < 0 ? 0 : x > 1 ? 1 : x;

    // 某帧最大包络 + 拍序号
    const pulse = f => {
      let best = 0, bi = -1;
      for (let i = 0; i < BEATS.length; i++) {
        const t = f - BEATS[i];
        const e = (t < 0 || t >= BEATLEN) ? 0 : Math.pow(1 - t / BEATLEN, 0.8);
        if (e > best) { best = e; bi = i; }
      }
      return { env: best, beat: bi };
    };

    let raf, start = 0;
    const tick = now => {
      if (!start) start = now;
      const f = ((now - start) / 1000 * 30) % (DUR + 10);
      const { env, beat } = pulse(f);

      fills.forEach((s, i) => {
        const decay = 9 + Math.max(0, Math.abs(i - CENTER) - 0.5) * 1.6;
        const t = f - (beat >= 0 ? BEATS[beat] : -999);
        const e = (t < 0 || t >= decay) ? 0 : Math.pow(1 - t / decay, 0.8);
        const w = Math.round(250 + 650 * e);
        s.style.fontVariationSettings = "'wght' " + w;
        s.style.textShadow = e > 0.05 ? '0 0 ' + (14 * e).toFixed(1) + 'px rgba(180,140,255,' + (0.5 * e).toFixed(3) + ')' : 'none';
      });

      // 回声行：晚 2 帧、被推开
      const echoIn = clamp01((f - 40) / 10);
      echoA.style.opacity = (0.7 * echoIn).toFixed(3);
      echoB.style.opacity = (0.7 * echoIn).toFixed(3);
      echoA.style.transform = 'translateY(' + (-(18 + 8 * env) * echoIn).toFixed(1) + 'px) scaleX(1.04)';
      echoB.style.transform = 'translateY(' + ((18 + 8 * env) * echoIn).toFixed(1) + 'px) scaleX(1.04)';

      // 步进音序器
      for (let i = 0; i < stepEls.length; i++) {
        const t = f - BEATS[i];
        const e = (t < 0 || t >= BEATLEN) ? 0 : Math.pow(1 - t / BEATLEN, 0.8);
        stepEls[i].style.transform = 'scale(' + (1 + 0.14 * e).toFixed(3) + ')';
        stepInners[i].style.opacity = (f >= BEATS[i] ? (0.3 + 0.7 * e) : 0).toFixed(3);
        stepInners[i].style.boxShadow = e > 0.05 ? '0 0 ' + (12 * e).toFixed(1) + 'px rgba(180,140,255,.8)' : 'none';
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => { cancelAnimationFrame(raf); el.innerHTML = ''; };
  }
};
