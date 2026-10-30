export default {
  id: 'word-captions', group: 'data', name: '逐词字幕高亮', lib: '原生 JS',
  desc: '按词级时间戳逐个点亮字幕，剪映/短视频字幕的标准形态。',
  deps: '无（数据源用 faster-whisper word_timestamps）',
  note: 'faster-whisper 要开 word_timestamps=True 才有词级时间；默认只给句级。beam_size 从 5 降到 1 速度快 2-3 倍但词级时间戳会更糙，字幕场景建议保留 5。高亮要用 position 判断而非 setInterval 累加，否则会累积漂移。',
  code: `# faster-whisper：拿到词级时间戳
segments, _ = model.transcribe(
    "a.wav",
    word_timestamps=True,     # ← 不设只给句级
    beam_size=5,              # 降 1 更快但词级更糙
    vad_filter=True,
)
words = [(w.word, w.start, w.end)
         for s in segments for w in s.words]

// 前端：按当前时间点亮，不做累加
words.forEach(w => {
  el.classList.toggle('on', time >= w.start && time < w.end);
});`,
  init(el) {
    const WORDS = [
      ['我们', 0], ['先说', 0.45], ['结论', 0.85], ['：', 1.25],
      ['这款', 1.4], ['产品', 1.75], ['不再', 2.15], ['靠', 2.5],
      ['堆料', 2.7], ['取胜', 3.05], ['。', 3.5],
      ['剂量', 3.8], ['本身', 4.2], ['就是', 4.55], ['品牌', 4.9], ['。', 5.35]
    ];
    el.innerHTML = `<div style="width:250px;text-align:center;font-size:15px;
      line-height:1.9;color:#5b6478" id="capBox">
      ${WORDS.map(([w], i) => `<span data-i="${i}" style="transition:color .18s,transform .18s;
        display:inline-block">${w}</span>`).join('')}
    </div>`;
    const spans = [...el.querySelectorAll('#capBox span')];
    let raf, start = performance.now();
    const DUR = 5.8;
    const tick = now => {
      const t = ((now - start) / 1000) % (DUR + 0.9);
      spans.forEach((s, i) => {
        const [, ts] = WORDS[i];
        const on = t >= ts;
        const active = t >= ts && (i === WORDS.length - 1 || t < WORDS[i + 1][1]);
        s.style.color = active ? '#3CCBFF' : (on ? '#cfd6e4' : '#5b6478');
        s.style.transform = active ? 'translateY(-1px) scale(1.06)' : 'none';
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }
};
