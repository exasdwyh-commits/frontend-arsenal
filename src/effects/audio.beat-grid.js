export default {
  id: 'beat-grid', group: 'audio', name: '步进音序器', lib: 'Tone.js 思路（WebAudio 原生实现）',
  desc: '16 格 4 拍循环，点亮哪格哪格响；跑起来才有律动，停不下来才叫音序器。',
  deps: '无（Tone.js 的 Tone.Sequence 封装了同一套东西）',
  note: '千万别用 setInterval(16ms) 直接排音：定时器会被主线程里的任何长任务拉偏，听感上就是"忽快忽慢"。正确做法是"预排"——每 25ms 醒一次，把未来 100ms 内该响的拍子按 AudioContext.currentTime 精确排进音频时钟。节拍显示和发声也要分开：听觉走 AudioContext，视觉 highlight 允许晚一帧。另外 AudioContext 必须在用户手势里创建，否则一直是 suspended。',
  code: `const LOOKAHEAD = .1, TICK = 25;      // 看 100ms 远，每 25ms 醒一次
let next = ctx.currentTime, step = 0;
setInterval(() => {
  while (next < ctx.currentTime + LOOKAHEAD) {
    if (grid[step]) voice(next);       // 用绝对时间来排，不用"现在"
    next += 60 / bpm / 4;              // 十六分音符
    step = (step + 1) % 16;
  }
}, TICK);`,
  init(el) {
    el.innerHTML = `<div style="position:absolute;inset:0;display:flex;flex-direction:column;
      justify-content:center;gap:10px;padding:14px 16px;box-sizing:border-box">
      <div class="bg-grid" style="display:grid;grid-template-columns:repeat(16,1fr);gap:3px"></div>
      <div style="display:flex;align-items:center;gap:10px">
        <button class="bg-play" type="button" style="border:1px solid rgba(255,255,255,.18);
          background:rgba(255,255,255,.06);color:#e6eaf2;border-radius:6px;padding:6px 12px;
          font:inherit;font-size:11.5px;cursor:pointer;touch-action:manipulation">▶ 播放</button>
        <span class="bg-txt" style="font:10px/1 ui-monospace,Consolas,monospace;letter-spacing:.1em;color:#8b93a4">
          120 BPM · 16 步 · 点格子改谱</span>
      </div>
    </div>`;

    const gridEl = el.querySelector('.bg-grid');
    const btn = el.querySelector('.bg-play');
    const txt = el.querySelector('.bg-txt');

    /* 一个能听的谱：底鼓 + 反拍镲 + 五声音阶里的两三个音 */
    let steps = [1, 0, 0, 0, 2, 0, 0, 3, 1, 0, 0, 0, 2, 0, 3, 0];
    const cells = steps.map((v, i) => {
      const c = document.createElement('button');
      c.type = 'button';
      c.style.cssText = 'all:unset;cursor:pointer;height:26px;border-radius:4px;' +
        'background:' + (v ? 'rgba(60,203,255,.75)' : 'rgba(255,255,255,.08)') + ';' +
        'box-shadow:0 0 0 1px rgba(255,255,255,.08) inset;transition:background .12s,box-shadow .12s';
      c.addEventListener('click', () => {
        steps[i] = steps[i] ? 0 : (i % 4 === 0 ? 1 : (i % 4 === 2 ? 2 : 3));
        paintCell(i);
        ensure();                       /* 点格子也算用户手势，可以开音频 */
      });
      gridEl.appendChild(c);
      return c;
    });
    const paintCell = i => {
      const v = steps[i];
      cells[i].style.background = v
        ? (v === 1 ? 'rgba(195,234,58,.85)' : v === 2 ? 'rgba(60,203,255,.8)' : 'rgba(160,120,255,.8)')
        : 'rgba(255,255,255,.08)';
    };

    let ctx = null, timer = 0, next = 0, step = 0, playing = false;
    const ensure = () => {
      if (!ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) { txt.textContent = '这个浏览器没有 WebAudio'; return null; }
        ctx = new AC();
      }
      if (ctx.state === 'suspended') ctx.resume();
      return ctx;
    };

    const voice = (at, kind) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = kind === 1 ? 'sine' : kind === 2 ? 'triangle' : 'square';
      const f = kind === 1 ? 92 : kind === 2 ? 420 : 660;
      o.frequency.setValueAtTime(f, at);
      if (kind === 1) o.frequency.exponentialRampToValueAtTime(46, at + 0.14);
      g.gain.setValueAtTime(0.0001, at);
      g.gain.exponentialRampToValueAtTime(kind === 1 ? 0.22 : 0.09, at + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, at + (kind === 1 ? 0.24 : 0.16));
      o.connect(g); g.connect(ctx.destination);
      o.start(at); o.stop(at + 0.3);
    };

    const tick = () => {
      if (!ctx) return;
      while (next < ctx.currentTime + 0.1) {
        const i = step;
        if (steps[i]) {
          voice(next, steps[i]);
          /* 视觉跟着走，但允许晚一拍：听觉优先 */
          const lag = Math.max(0, (next - ctx.currentTime) * 1000);
          const idx = i;
          setTimeout(() => {
            cells.forEach((c, k) => { c.style.outline = 'none'; });
            cells[idx].style.outline = '1px solid rgba(255,255,255,.9)';
          }, lag);
        }
        next += 60 / 120 / 4;
        step = (step + 1) % 16;
      }
    };

    const toggle = () => {
      if (!ensure()) return;
      playing = !playing;
      if (playing) {
        next = ctx.currentTime + 0.06;
        step = 0;
        clearInterval(timer);
        timer = setInterval(tick, 25);
        btn.textContent = '■ 停止';
        txt.textContent = '120 BPM · 16 步 · 正在播放';
      } else {
        clearInterval(timer);
        btn.textContent = '▶ 播放';
        txt.textContent = '120 BPM · 16 步 · 点格子改谱';
        cells.forEach(c => { c.style.outline = 'none'; });
      }
    };
    btn.addEventListener('click', toggle);

    return () => {
      clearInterval(timer);
      btn.removeEventListener('click', toggle);
      cells.forEach(c => c.replaceWith(c.cloneNode(true)));
      if (ctx && ctx.state !== 'closed') ctx.close();
    };
  }
};
