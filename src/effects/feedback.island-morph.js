export default {
  id: 'island-morph', group: 'feedback', name: '状态岛形变',
  lib: '原生 JS',
  desc: '一颗黑色胶囊在 4 组尺寸预设间弹开收拢，内容跟着换。移植自 Cult UI 的 Dynamic Island：通知、播放器、状态提示都能就地展开，不用另开弹窗。',
  deps: '无',
  note: '宽度必须真的改 width，用 transform: scale 硬顶会把里面的字一起拉扁。尺寸只过渡 width/height/border-radius 三个属性，写成 transition: all 会把文字颜色也带上，切换瞬间闪白。内容层全部 absolute 定位，否则展开时会把胶囊撑回自动高度，弹簧曲线直接失效。',
  scenes: { places: ['通知', '弹窗', '首屏'], goals: ['状态提示', '内容呈现'], triggers: ['点击', '持续播放'], projects: ['AI 产品', '管理后台', '品牌官网'] },
  code: `const SIZES = {
  idle:    { w: 120, h: 32, r: 16 },
  compact: { w: 200, h: 34, r: 17 },
  tall:    { w: 206, h: 92, r: 26 }
};
const setSize = key => {
  const s = SIZES[key];
  shell.style.width  = s.w + 'px';
  shell.style.height = s.h + 'px';
  shell.style.borderRadius = s.r + 'px';
};

/* CSS
.island{
  transition:width .5s cubic-bezier(.22,1.12,.3,1),
             height .5s cubic-bezier(.22,1.12,.3,1),
             border-radius .5s cubic-bezier(.22,1.12,.3,1);
}
.island .face{position:absolute;inset:0;opacity:0;transform:translateY(6px)}
.island .face.on{opacity:1;transform:none}
*/`,
  init(el) {
    const STYLE = `<style data-fx="island-morph">
      .isl{display:flex;flex-direction:column;align-items:center;gap:12px}
      .isl-shell{position:relative;display:block;background:#05070a;overflow:hidden;cursor:pointer;
        box-shadow:0 0 0 1px rgba(255,255,255,.07),0 10px 30px rgba(0,0,0,.6),0 0 34px rgba(95,59,255,.16);
        transition:width .52s cubic-bezier(.22,1.12,.3,1),height .52s cubic-bezier(.22,1.12,.3,1),
                   border-radius .52s cubic-bezier(.22,1.12,.3,1);will-change:width,height,border-radius}
      .isl-face{position:absolute;inset:0;display:flex;align-items:center;padding:0 14px;
        opacity:0;transform:translateY(7px) scale(.97);filter:blur(2px);
        transition:opacity .26s ease,transform .34s cubic-bezier(.2,1.1,.3,1),filter .3s ease;
        pointer-events:none;color:#e8ecf4;font-size:11px;letter-spacing:.01em}
      .isl-face.on{opacity:1;transform:none;filter:none}
      .isl-face b{font-weight:600}
      .isl-face small{color:#8b93a7;font-size:10px;line-height:1.45}
      .isl-dot{width:6px;height:6px;border-radius:99px;background:#5f3bff;box-shadow:0 0 8px #5f3bff;margin-right:7px;flex:none}
      .isl-pulse{width:6px;height:6px;border-radius:99px;background:#3ddc97;box-shadow:0 0 8px #3ddc97;margin-right:8px;flex:none;
        animation:isl-p 1.4s ease-in-out infinite}
      @keyframes isl-p{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.35;transform:scale(.75)}}
      .isl-col{display:flex;flex-direction:column;gap:3px;align-items:flex-start}
      .isl-pill{margin-left:auto;font-size:9.5px;padding:3px 8px;border-radius:99px;background:#1b2130;color:#9aa4bb;border:1px solid #2a3245}
      .isl-hint{font-size:9.5px;color:#4a5368;letter-spacing:.08em;text-transform:uppercase}
    </style>`;

    el.insertAdjacentHTML('beforeend', STYLE + `
      <div class="isl">
        <div class="isl-shell" id="islShell">
          <div class="isl-face on" data-k="idle">
            <span class="isl-dot"></span><b>Cult FM</b>
            <span class="isl-pill">Live</span>
          </div>
          <div class="isl-face" data-k="compact">
            <span class="isl-pulse"></span><small style="color:#cfd6e6">正在同步 12 个片段…</small>
          </div>
          <div class="isl-face" data-k="tall">
            <div class="isl-col">
              <b style="font-size:12.5px">新消息</b>
              <small>团队邀请你 review v2.4 的发布说明，附了 3 处标注。</small>
              <small style="color:#8b6cff;margin-top:2px">查看 →</small>
            </div>
          </div>
          <div class="isl-face" data-k="wide">
            <span class="isl-dot" style="background:#3ddc97;box-shadow:0 0 8px #3ddc97"></span>
            <div class="isl-col">
              <b style="font-size:11.5px">已连接 ego lite</b>
              <small>localhost:8080 · 12ms</small>
            </div>
            <span class="isl-pill" style="color:#3ddc97;border-color:#1d4034">在线</span>
          </div>
        </div>
        <div class="isl-hint">点击切换尺寸</div>
      </div>`);

    const SIZES = [
      { key: 'idle',    w: 132, h: 32, r: 16 },
      { key: 'compact', w: 198, h: 34, r: 17 },
      { key: 'tall',    w: 214, h: 88, r: 24 },
      { key: 'wide',    w: 222, h: 54, r: 27 },
    ];

    const shell = el.querySelector('#islShell');
    const faces = [...el.querySelectorAll('.isl-face')];
    let i = 0;
    let timer = null;

    const apply = next => {
      i = (next + SIZES.length) % SIZES.length;
      const s = SIZES[i];
      shell.style.width = s.w + 'px';
      shell.style.height = s.h + 'px';
      shell.style.borderRadius = s.r + 'px';
      faces.forEach(f => f.classList.toggle('on', f.dataset.k === s.key));
    };

    const tick = () => apply(i + 1);
    const restart = () => {
      clearInterval(timer);
      timer = setInterval(tick, 2600);
    };

    const onClick = () => { apply(i + 1); restart(); };
    shell.addEventListener('click', onClick);
    apply(0);
    restart();

    return () => {
      clearInterval(timer);
      shell.removeEventListener('click', onClick);
      el.innerHTML = '';   // style 标签也在 el 内，一起清掉
    };
  }
};
