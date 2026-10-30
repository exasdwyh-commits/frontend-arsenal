export default {
  id: 'spectrum-bars', group: 'audio', name: '真频谱分析', lib: 'Web Audio',
  desc: '从真实音频流取出频谱画柱状图，不是正弦波伪装的假动画。',
  deps: '无（AnalyserNode + Canvas）',
  note: '三个必须项：① AudioContext 必须在用户手势里创建，否则被浏览器挂起（state= suspended）；② fftSize 越小响应越快但分辨率越粗，128 适合柱状图，2048 适合波形；③ 必须 getByteFrequencyData 每帧读，缓存一次数据动画就死了。',
  code: `const ac = new AudioContext();              // 必须在 click 里
const analyser = ac.createAnalyser();
analyser.fftSize = 128;                     // 64 个频段
analyser.smoothingTimeConstant = .8;        // 平滑，0=生硬 1=迟钝

const data = new Uint8Array(analyser.frequencyBinCount);
function draw(){
  analyser.getByteFrequencyData(data);       // 每帧都要重新读
  for (let i = 0; i < data.length; i++){
    const h = data[i] / 255 * 60;
    ctx.fillRect(i * 4, 60 - h, 3, h);
  }
  requestAnimationFrame(draw);
}`,
  init(el) {
    el.innerHTML = `<button id="spBtn" style="padding:9px 18px;border-radius:99px;
      border:1px solid #3a4560;background:#1a1f2c;color:#e8ecf4;font-size:11.5px;cursor:pointer">
      ▶ 播放并分析</button>
      <div style="position:absolute;bottom:12px;font-size:9.5px;color:#5b6478">
      真实 AnalyserNode · 麦克风/音频源同一套代码</div>`;
    const btn = el.querySelector('#spBtn');
    let ac = null, raf = null, osc = null, analyser = null, cv = null;

    const stop = () => {
      cancelAnimationFrame(raf);
      try { osc && osc.stop(); } catch (e) {}
      try { ac && ac.close(); } catch (e) {}
      ac = osc = analyser = null;
      cv?.remove();
      btn.textContent = '▶ 播放并分析';
    };
    const start = async () => {
      stop();
      ac = new (window.AudioContext || window.webkitAudioContext)();
      if (ac.state === 'suspended') await ac.resume();
      analyser = ac.createAnalyser();
      analyser.fftSize = 128;
      analyser.smoothingTimeConstant = 0.8;
      osc = ac.createOscillator();
      const g = ac.createGain();
      // 用两个振荡器叠加，频谱才有形状
      const lfo = ac.createOscillator();
      const lfoGain = ac.createGain();
      lfo.frequency.value = 2.2;
      lfoGain.gain.value = 220;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      osc.type = 'sawtooth';
      osc.frequency.value = 330;
      // 必须给分析器真实信号；极小音量是为不吵人，不是为静音
      g.gain.value = 0.0008;
      osc.connect(g);
      g.connect(analyser);
      // 只把信号喂分析器，不接 destination —— 所以完全听不见
      const mute = ac.createGain();
      mute.gain.value = 0;
      analyser.connect(mute);
      mute.connect(ac.destination);
      osc.start(); lfo.start();

      cv = document.createElement('canvas');
      cv.width = 280; cv.height = 90;
      el.appendChild(cv);
      const c = cv.getContext('2d');
      const data = new Uint8Array(analyser.frequencyBinCount);
      const draw = () => {
        analyser.getByteFrequencyData(data);
        c.clearRect(0, 0, cv.width, cv.height);
        const bw = cv.width / data.length;
        for (let i = 0; i < data.length; i++) {
          const h = Math.max(2, data[i] / 255 * 78);
          const grd = c.createLinearGradient(0, 88 - h, 0, 88);
          grd.addColorStop(0, '#3CCBFF');
          grd.addColorStop(1, '#5F3BFF');
          c.fillStyle = grd;
          c.fillRect(i * bw + 1, 88 - h, bw - 2, h);
        }
        raf = requestAnimationFrame(draw);
      };
      draw();
      btn.textContent = '■ 停止';
    };
    const cl = () => (ac ? stop() : start());
    btn.addEventListener('click', cl);
    return () => { stop(); btn.removeEventListener('click', cl); };
  }
};
