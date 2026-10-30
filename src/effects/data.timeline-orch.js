export default {
  id: 'timeline-orch', group: 'data', name: '时间轴编排', lib: 'Anime.js v4',
  desc: '读数 → 柱条 → 网格线 → 徽标，四段动画用绝对时间点串联，改一处不乱。',
  deps: 'animejs@4 (可选)',
  note: 'position 参数里 "<" 是上一段结束点，"<<" 是上一段起点，"+=" / "-=" 才是相对量。最常踩的坑是把 v3 的 "+=100" 写成 "+100"，在 v4 里 "+100" 会被当成绝对时间 100ms。',
  code: `import { createTimeline } from 'animejs';

const tl = createTimeline({ defaults: { ease: 'outExpo', duration: 700 } })
  .add('.kpi-num', { innerText: [0, 12480], round: 1 }, 0)        // 数字滚动从 0 开始
  .add('.axis',   { scaleY: [0, 1], transformOrigin: 'bottom' }, 0)
  .add('.bar',    { scaleY: [0, 1], transformOrigin: 'bottom', delay: stagger(70) }, 150)
  .add('.badge',  { opacity: [0, 1], y: [8, 0] }, '<<+=200')       // 与柱条同起点 +200ms
  .add('.kpi-num', { color: '#3fd0ff' }, '-=100');                  // 回到末尾前 100ms
tl.play(); // .pause() .reverse() .seek(t) .speed(1.5)`,
  init(el) {
    const W = Math.min(280, el.clientWidth || 280);
    el.innerHTML =
      '<div style="width:' + W + 'px;padding:12px 14px;border-radius:10px;background:#12161f;border:1px solid #232936">' +
      '<div style="display:flex;justify-content:space-between;align-items:baseline">' +
      '<div><div style="font:10px/1.4 ui-monospace,monospace;color:#6b7790">本月 GMV</div>' +
      '<div id="kpi" style="font:600 26px/1.2 -apple-system,system-ui;color:#e8ecf4;letter-spacing:-.5px">0</div></div>' +
      '<span id="badge" style="font:9px/1 ui-monospace,monospace;color:#3fd0ff;border:1px solid #24405a;' +
      'border-radius:4px;padding:3px 6px">+18.4%</span></div>' +
      '<div style="position:relative;height:64px;margin-top:12px;display:flex;align-items:flex-end;gap:5px">' +
      '<div id="axis" style="position:absolute;left:0;right:0;bottom:0;height:1px;background:#2a3350"></div>' +
      [0.42, 0.58, 0.5, 0.72, 0.66, 0.85, 1].map((v, i) =>
        '<i class="bar" style="flex:1;height:' + (v * 100) + '%;border-radius:2px 2px 0 0;' +
        'background:linear-gradient(180deg,@,' + '#1e2a45' + ');" data-h="' + v + '"></i>').join('') +
      '</div></div>';
    const bars = Array.from(el.querySelectorAll('.bar'));
    bars.forEach((b, i) => { b.style.background = 'linear-gradient(180deg,#5F3BFF,#1e2a45)'; b.style.opacity = String(0.55 + i * 0.06); });
    const kpi = el.querySelector('#kpi'), badge = el.querySelector('#badge'), axis = el.querySelector('#axis');
    const easeOutExpo = t => t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    const clamp01 = v => v < 0 ? 0 : v > 1 ? 1 : v;
    // 时间轴：{ start, dur, fn }
    const track = [
      { s: 0,   d: 900, fn: p => { kpi.textContent = Math.round(12480 * easeOutExpo(p)).toLocaleString(); } },
      { s: 0,   d: 700, fn: p => { axis.style.transform = 'scaleY(' + easeOutExpo(p) + ')'; axis.style.transformOrigin = 'bottom'; } },
      { s: 150, d: 700, fn: () => {} },
      { s: 350, d: 400, fn: p => { badge.style.opacity = p; badge.style.transform = 'translateY(' + ((1 - p) * 8).toFixed(2) + 'px)'; } },
      { s: 1300, d: 300, fn: p => { kpi.style.color = p > 0.5 ? '#3fd0ff' : '#e8ecf4'; } }
    ];
    let raf = 0, start = performance.now(), TOTAL = 2600, HOLD = 1000;
    const tick = now => {
      const e = (now - start) % (TOTAL + HOLD);
      bars.forEach((b, i) => {
        const p = clamp01((e - 150 - i * 70) / 700);
        b.style.transform = 'scaleY(' + easeOutExpo(p).toFixed(3) + ')';
        b.style.transformOrigin = 'bottom';
      });
      track.forEach(tr => tr.fn(clamp01((e - tr.s) / tr.d)));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }
};
