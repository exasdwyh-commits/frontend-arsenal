export default {
  id: 'timeline-tracks', group: 'data', name: '时间轴轨道', lib: '原生 JS',
  desc: '多轨道片段吸附对齐，带播放头与刻度，视频/播客/排期的通用母版。',
  deps: '无（OpenCut / Remotion 同款机制）',
  note: '吸附阈值必须按「屏幕像素」而不是「时间」算——缩放后按时间算会导致放大时吸不上。播放头用 requestAnimationFrame 按真实时间推进，不要用 setInterval，后者在后台标签页会被降到 1s。',
  code: `// 吸附：按像素判定，不是按时间
const SNAP_PX = 6;
const toPx = t => t / duration * trackWidth;
const nearest = cuts.reduce((best, c) =>
  Math.abs(toPx(c) - cursorX) < Math.abs(toPx(best) - cursorX) ? c : best, cursor);
const snapped = Math.abs(toPx(nearest) - cursorX) < SNAP_PX ? nearest : cursorTime;

// 播放头：用真实时间推进
let start = performance.now();
function tick(now){
  playhead = ((now - start) / 1000) % duration;
  requestAnimationFrame(tick);
}`,
  init(el) {
    el.innerHTML = `<div style="width:250px">
      <div id="tlRuler" style="position:relative;height:12px;margin-bottom:3px;
        font-size:8px;color:#4a5368"></div>
      <div id="tlTracks" style="position:relative;background:#0a0c11;
        border:1px solid #242a38;border-radius:8px;padding:4px;overflow:hidden"></div>
    </div>`;
    const ruler = el.querySelector('#tlRuler');
    const box = el.querySelector('#tlTracks');
    const DUR = 20, W = 240;
    ruler.innerHTML = [0, 5, 10, 15, 20].map(t =>
      `<span style="position:absolute;left:${t / DUR * 100}%;transform:translateX(-50%)">${t}s</span>`).join('');

    // 三条轨道的数据（含剪辑点，用于吸附）
    const tracks = [
      [{ s: 0, e: 7, c: '#5F3BFF', t: '口播' }, { s: 8, e: 14, c: '#5F3BFF', t: '口播' }],
      [{ s: 2, e: 9, c: '#3CCBFF', t: 'B-Roll' }, { s: 12, e: 20, c: '#3CCBFF', t: 'B-Roll' }],
      [{ s: 5, e: 11, c: '#BFEA1A', t: '字幕' }, { s: 14, e: 18, c: '#BFEA1A', t: '字幕' }]
    ];
    box.innerHTML = tracks.map(row => `
      <div style="position:relative;height:22px;margin-bottom:3px;background:#11151e;
        border-radius:4px">
        ${row.map(c => `<div style="position:absolute;top:2px;bottom:2px;
          left:${c.s / DUR * 100}%;width:${(c.e - c.s) / DUR * 100}%;
          background:${c.c}44;border:1px solid ${c.c};border-radius:3px;
          font-size:8px;color:${c.c};display:flex;align-items:center;
          padding-left:4px;overflow:hidden">${c.t}</div>`).join('')}
      </div>`).join('') +
      `<div id="tlPlayhead" style="position:absolute;top:0;bottom:0;width:1.5px;
        background:#fff;box-shadow:0 0 8px rgba(255,255,255,.8);left:0"></div>`;

    const head = box.querySelector('#tlPlayhead');
    let raf, start = performance.now(), paused = false, pausedAt = 0;
    const tick = now => {
      if (!paused) {
        const t = ((now - start) / 1000) % DUR;
        head.style.left = (t / DUR * 100) + '%';
      }
      raf = requestAnimationFrame(tick);
    };
    // 点击轨道：吸附到最近剪辑点（像素阈值）
    const cuts = tracks.flat().flatMap(c => [c.s, c.e]);
    const cl = e => {
      const r = box.getBoundingClientRect();
      const px = e.clientX - r.left;
      const tRaw = px / r.width * DUR;
      const SNAP_PX = 6;
      let best = tRaw, bestD = Infinity;
      for (const c of cuts) {
        const d = Math.abs(c / DUR * r.width - px);
        if (d < bestD) { bestD = d; best = c; }
      }
      const snapped = bestD < SNAP_PX ? best : tRaw;
      paused = true;
      head.style.left = (snapped / DUR * 100) + '%';
      clearTimeout(el._resume);
      el._resume = setTimeout(() => { start = performance.now() - snapped * 1000; paused = false; }, 900);
    };
    box.addEventListener('click', cl);
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); clearTimeout(el._resume); box.removeEventListener('click', cl); };
  }
};
