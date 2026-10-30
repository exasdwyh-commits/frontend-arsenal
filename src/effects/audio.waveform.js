export default {
  id: 'waveform', group: 'audio', name: '波形律动', lib: 'Canvas 2D',
  desc: '正弦波叠加的视觉律动，可绑定真实音频数据。',
  deps: '无（接真实数据用 AnalyserNode）',
  note: '上线时把 sin 换成 AnalyserNode.getByteFrequencyData，同一套绘制代码就能驱动麦克风或音频。柱宽必须扣掉间隙，否则填满后变成色块。',
  code: `const analyser = ctx.createAnalyser();
analyser.fftSize = 128;
source.connect(analyser);

function draw() {
  const data = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(data);   // 真实频谱
  for (let i = 0; i < data.length; i++) {
    const h = data[i] / 255 * 60;
    ctx.fillRect(i * 4, 60 - h, 3, h);   // 宽 3 留 1px 间隙
  }
}`,
  init(el) {
    const cv = document.createElement('canvas');
    cv.width = 280; cv.height = 120;
    el.appendChild(cv);
    const c = cv.getContext('2d');
    let raf, t = 0;
    const loop = () => {
      c.clearRect(0, 0, 280, 120);
      t += .05;
      for (let i = 0; i < 46; i++) {
        const v = (Math.sin(t + i * .32) * .5 + .5) * (Math.sin(t * .7 + i * .12) * .3 + .7);
        const h = Math.max(3, v * 72);
        const g = c.createLinearGradient(0, 60 - h / 2, 0, 60 + h / 2);
        g.addColorStop(0, '#3CCBFF');
        g.addColorStop(1, '#5F3BFF');
        c.fillStyle = g;
        c.fillRect(6 + i * 6, 60 - h / 2, 4, h);
      }
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }
};
