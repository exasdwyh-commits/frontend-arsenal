export default {
  id: 'tone-click', group: 'audio', name: '合成点击音', lib: 'Tone.js',
  desc: '用代码合成短促 UI 音效，不加载任何音频文件。',
  deps: 'tone（Tone.js）',
  note: '浏览器要求先有用户手势才能开音频上下文。务必在 click 处理函数里 await Tone.start()，否则静默失败且不报错——这个坑能查半天。',
  code: `import * as Tone from 'tone';

const synth = new Tone.MembraneSynth().toDestination();

async function play() {           // 必须在用户手势里调用
  await Tone.start();
  synth.triggerAttackRelease('C5', '32n');
}
button.addEventListener('click', play);`,
  init(el) {
    el.innerHTML = `<button id="snd" style="padding:12px 26px;border-radius:99px;
      border:1px solid #3a4560;background:#1a1f2c;color:#e8ecf4;font-size:12.5px;cursor:pointer">
      ▶ 点击发声</button>
      <div style="position:absolute;bottom:14px;font-size:10px;color:#5b6478">
        无需音频文件 · Web Audio 实时合成</div>`;
    const b = el.querySelector('#snd');
    const cl = () => {
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        const ac = new AC();
        const o = ac.createOscillator(), g = ac.createGain();
        o.type = 'triangle';
        o.frequency.setValueAtTime(660, ac.currentTime);
        o.frequency.exponentialRampToValueAtTime(330, ac.currentTime + .12);
        g.gain.setValueAtTime(.18, ac.currentTime);
        g.gain.exponentialRampToValueAtTime(.001, ac.currentTime + .18);
        o.connect(g); g.connect(ac.destination);
        o.start(); o.stop(ac.currentTime + .2);
        o.onended = () => ac.close();
      } catch (e) {}
    };
    b.addEventListener('click', cl);
    return () => b.removeEventListener('click', cl);
  }
};
