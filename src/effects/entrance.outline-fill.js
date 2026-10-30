export default {
  id: 'outline-fill', group: 'entrance', name: '空心字硬切点亮', lib: 'SVG + 原生 JS',
  desc: '空心描边字急缩落位后一帧硬切成实心白热字，配 HUD 虚线刻度环锁定。移植自 video-shotcraft 的 Outline Word Fill（Apache-2.0）。',
  deps: '无',
  note: '点亮必须是硬切（opacity 0↔1，无中间态），加了慢扫就失去「啪」的一下的冲击。空心字用 -webkit-text-stroke 而不是 text-stroke，Safari/Chrome 只认前者。缩放期的运动模糊用「相邻两帧 scale 差 × 系数」近似，比真高斯便宜且够用。虚线圆自转到点亮那刻要「刹停」再滑 6°，内圈刻度环继续反向转——一个停一个不停，锁定感才出来。',
  code: `/* 双层同字：底层空心描边、顶层实心（硬切） */
.ow{position:relative;font-size:48px;font-weight:500;line-height:1}
.ow .out{color:transparent;-webkit-text-stroke:2px #8a7668}
.ow .solid{position:absolute;inset:0;color:#fff5ee;opacity:0;text-shadow:0 0 14px rgba(255,255,255,.7)}
.ow.lit .out{opacity:0}
.ow.lit .solid{opacity:1}          /* 硬切：一个 class 翻转，无过渡 */

// 缩放落位 + 到帧硬切
word.style.transform='scale('+ (3.2 - 2.2*ease(snappy(f,2,11))) +')';
if(f>=POP) word.classList.add('lit');   // POP=54 帧

// 虚线刻度环：点亮那一刻刹停
rot = 0.22*Math.min(f,POP) + (f>POP ? 6*out(ramp(f,POP,14)) : 0);`,
  init(el) {
    const STYLE = '<style data-fx="outline-fill">' +
      '.ow{display:flex;flex-direction:column;align-items:center;gap:6px;width:250px;height:100%;justify-content:center;position:relative}' +
      '.ow-ring{position:absolute;width:132px;height:132px;pointer-events:none}' +
      '.ow-ring circle{fill:none;stroke:#c9986f;stroke-width:1.5}' +
      '.ow-word{position:relative;font-size:44px;font-weight:500;line-height:1;letter-spacing:.01em;white-space:nowrap;z-index:2}' +
      '.ow-out{color:transparent;-webkit-text-stroke:1.6px #a58a76;transition:none}' +
      '.ow-solid{position:absolute;inset:0;color:#fff5ee;opacity:0;z-index:3}' +
      '.ow.lit .ow-out{opacity:0}' +
      '.ow.lit .ow-solid{opacity:1}' +
      '.ow-shock{position:absolute;width:132px;height:132px;border-radius:50%;border:2px solid #ff8a4c;opacity:0;pointer-events:none}' +
      '.ow-cap{font-size:8.5px;color:#6b5c50;letter-spacing:.12em;text-transform:uppercase;z-index:4}' +
      '</style>';

    // 72 格刻度环（每 5° 一根，长刻度每 30°）
    let ticks = '';
    for (let i = 0; i < 72; i++) {
      const major = i % 6 === 0;
      ticks += '<line x1="0" y1="-66" x2="0" y2="' + (major ? -54 : -60) + '" stroke="#c9986f" stroke-width="' + (major ? 1.6 : 1) + '" opacity="' + (major ? 0.7 : 0.32) + '" transform="rotate(' + (i * 5) + ')"/>';
    }

    el.insertAdjacentHTML('beforeend', STYLE +
      '<div class="ow" id="ow">' +
        '<svg class="ow-ring" id="owRing" viewBox="-70 -70 140 140">' +
          '<g id="owMain"><circle r="66" stroke-dasharray="10 8"/></g>' +
          '<g id="owInner">' + ticks + '</g>' +
        '</svg>' +
        '<div class="ow-shock" id="owShock"></div>' +
        '<div class="ow-word" id="owWord"><span class="ow-out">Faster</span><span class="ow-solid">Faster</span></div>' +
        '<div class="ow-cap">点亮那刻主圈刹停</div>' +
      '</div>');

    const wrap = el.querySelector('#ow');
    const word = el.querySelector('#owWord');
    const main = el.querySelector('#owMain');
    const inner = el.querySelector('#owInner');
    const shock = el.querySelector('#owShock');

    const POP = 54, DUR = 90;
    const clamp01 = x => x < 0 ? 0 : x > 1 ? 1 : x;
    const ramp = (f, s, d) => clamp01((f - s) / d);
    const snappy = (f, s, d) => 1 - Math.pow(1 - ramp(f, s, d), 3);
    const outQ = (f, s, d) => 1 - Math.pow(1 - ramp(f, s, d), 2);

    let raf, start = 0;
    const tick = now => {
      if (!start) start = now;
      const f = ((now - start) / 1000 * 30) % (DUR + 15);

      // 空心字急缩落位（带 zoom 模糊）
      const ws = 3.2 - 2.2 * snappy(f, 2, 11);
      const zoomBlur = Math.min(5, Math.abs(ws - (3.2 - 2.2 * snappy(f - 0.5, 2, 11))) * 8);
      word.style.transform = 'scale(' + ws.toFixed(4) + ')';
      word.style.opacity = Math.min(1, ramp(f, 2, 6) * 1.4);
      const out = el.querySelector('.ow-out');
      if (!wrap.classList.contains('lit')) out.style.filter = zoomBlur > 0.1 ? 'blur(' + zoomBlur.toFixed(2) + 'px)' : 'none';

      // 硬切点亮
      const lit = f >= POP;
      wrap.classList.toggle('lit', lit);

      // 主圈：自转到点亮刹停再滑 6°；内圈持续反向
      const rot = 0.22 * Math.min(f, POP) + (lit ? 6 * outQ(f, POP, 14) : 0);
      main.setAttribute('transform', 'rotate(' + rot.toFixed(2) + ')');
      inner.setAttribute('transform', 'rotate(' + (-0.14 * f).toFixed(2) + ')');

      // 冲击环：点亮那一下外扩消散（只此一次）
      if (lit && f < POP + 14) {
        const s = outQ(f, POP, 14);
        shock.style.opacity = (0.55 * (1 - s)).toFixed(3);
        shock.style.transform = 'scale(' + (1 + s * 1.2).toFixed(3) + ')';
        shock.style.borderWidth = (2 + 8 * (1 - s)).toFixed(1) + 'px';
      } else shock.style.opacity = '0';

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => { cancelAnimationFrame(raf); el.innerHTML = ''; };
  }
};
