export default {
  id: 'iso-parametric', group: 'feedback', name: '等距图参数面板',
  lib: 'Overflow Design',
  desc: '同一个等距 SVG 被控制面板实时改参：线重滑杆直改 stroke-width、主题一键翻转（全部描边走 currentColor）、朝向左右镜像、尺寸伸缩；悬停画面时三层板子按光标做层间视差。机制提炼自 Overflow Design（overflow.design）公开目录页的参数面板（Appearance/Theme/Weight/Facing）与"指上去它就动"的描述，原生 JS/CSS/SVG 独立实现。',
  note: '三个坑：① 线重滑杆必须改 stroke-width 属性而不是缩放 SVG——transform 缩放会把描边一起放大，"粗线"就成了"大图"，两者观感完全不同；② 镜像朝向用 scaleX(-1) 会把高光和文字也翻过去，纯线条等距图没事，带标签或固定光源的图要只镜像图形层；③ 主题翻转的前提是所有描边写 currentColor、所有面的明暗用相对透明度（rgba 白/黑）——写死任何一个颜色，翻主题时它就是一块补丁。层间视差给每层不同的位移系数（近层大远层小），全层同距就成了平移。',
  scenes: { places: ['面板', '官网', '文档'], goals: ['操作反馈', '风格统一', '内容呈现'], triggers: ['悬停', '拖拽'], projects: ['素材站', '设计系统', '开发者工具'] },
  code: `/* 等距图参数面板（提炼自 overflow.design 公开页面，vanilla 复刻） */
/* ① 线重＝改 stroke-width 属性；transform 缩放会连描边一起放大，观感是"大图"不是"粗线" */
weightSlider.addEventListener('input', e => {
  svg.setAttribute('stroke-width', e.target.value);   /* 1–5，viewBox 单位 */
});

/* ② 镜像朝向：只翻图形层，高光/文字留在未镜像层 */
drawWrap.style.transform = facing === 'left' ? 'scaleX(-1)' : '';

/* ③ 主题翻转的前提：描边全 currentColor，面的明暗是相对透明度 */
<svg style="color:#3a3f4a">            /* 亮主题：深色线 */
<path stroke="currentColor" fill="rgba(0,0,0,.05)"/>
/* 暗主题只需换容器 color 与底板： */
.stage.dark { color:#d8dce4; background:#25282e }

/* 层间视差：每层不同系数，近层大远层小 */
layers.forEach((g, i) => {
  const k = (i + 1) / layers.length;              /* 0.33 / 0.67 / 1 */
  g.style.transform = 'translate(' + (dx * k) + 'px,' + (dy * k) + 'px)';
});`,

  init(el) {
    const STYLE = `<style data-fx="iso-parametric">
      .ip{width:100%;box-sizing:border-box;background:#2b2b2b;padding:14px;
        font-family:system-ui,-apple-system,"Segoe UI",sans-serif;color:#d8d8d8}
      .ip-panel{background:#414141;border-radius:8px;padding:16px 18px;display:flex;gap:18px;flex-wrap:wrap}
      .ip-stage{flex:1;min-width:220px;display:flex;align-items:center;justify-content:center;
        background:#eceef1;border-radius:8px;padding:18px;color:#3a3f4a;
        perspective:600px;transition:background .25s ease,color .25s ease;cursor:crosshair}
      .ip-stage.dark{background:#25282e;color:#d8dce4}
      .ip-draw{transform-style:preserve-3d;transition:transform .3s cubic-bezier(.2,.8,.3,1.1)}
      .ip-draw svg{display:block;transition:transform .3s ease}
      .ip-layer{transition:transform .3s cubic-bezier(.2,.8,.3,1.1)}
      .ip-ctl{width:170px;flex:none;display:flex;flex-direction:column;gap:12px;justify-content:center}
      .ip-row{display:flex;align-items:center;justify-content:space-between;gap:8px}
      .ip-lb{font-size:10.5px;letter-spacing:.06em;text-transform:uppercase;color:#9a9a9a;white-space:nowrap;flex:none}
      .ip-seg{display:flex;border-radius:4px;overflow:hidden;box-shadow:inset 0 0 0 1px rgba(0,0,0,.35);flex:none}
      .ip-seg button{border:0;padding:4px 8px;font:500 10.5px/1 system-ui,sans-serif;cursor:pointer;
        background:rgba(255,255,255,.12);color:#c9c9c9}
      .ip-seg button.on{background:#5F3BFF;color:#fff}
      .ip-sl{-webkit-appearance:none;appearance:none;flex:1;min-width:52px;height:3px;border-radius:2px;
        background:rgba(0,0,0,.4);outline-offset:3px}
      .ip-sl::-webkit-slider-thumb{-webkit-appearance:none;width:12px;height:12px;border-radius:50%;
        background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.4);cursor:grab}
      .ip-val{font:500 10px/1 ui-monospace,Menlo,Consolas,monospace;color:#8f8f8f;width:22px;text-align:right}
      .ip-hint{font-size:10.5px;color:#8a8a8a;line-height:1.8;margin-top:12px}
    </style>`;

    // 三层等距板 + 顶上一个小立方（同一 viewBox，层各自独立以便视差）
    const isoLayer = (cy, hw, hh, d, slots) => {
      const L = [], R = [], T = [];
      // 顶面菱形 + 左右侧面 + 可选指示槽
      T.push('M110 ' + cy + ' L' + (110 + hw) + ' ' + (cy + hh) + ' L110 ' + (cy + hh * 2) + ' L' + (110 - hw) + ' ' + (cy + hh) + ' Z');
      L.push('M' + (110 - hw) + ' ' + (cy + hh) + ' L110 ' + (cy + hh * 2) + ' L110 ' + (cy + hh * 2 + d) + ' L' + (110 - hw) + ' ' + (cy + hh + d) + ' Z');
      R.push('M' + (110 + hw) + ' ' + (cy + hh) + ' L110 ' + (cy + hh * 2) + ' L110 ' + (cy + hh * 2 + d) + ' L' + (110 + hw) + ' ' + (cy + hh + d) + ' Z');
      let slotHtml = '';
      if (slots) {
        slotHtml = '<path d="M' + (110 - hw + 12) + ' ' + (cy + hh + d - 6) + ' L' + (110 - hw + 30) + ' ' + (cy + hh + d - 6) +
          '" stroke-width="1.6" stroke-linecap="round" opacity=".85"/>' +
          '<path d="M' + (110 + hw - 24) + ' ' + (cy + hh + d - 6) + ' L' + (110 + hw - 10) + ' ' + (cy + hh + d - 6) +
          '" stroke-width="1.6" stroke-linecap="round" opacity=".5"/>';
      }
      return '<g class="ip-layer"><path d="' + T.join(' ') + '" fill="rgba(255,255,255,.16)"/>' +
        '<path d="' + L.join(' ') + '" fill="rgba(0,0,0,.07)"/>' +
        '<path d="' + R.join(' ') + '" fill="rgba(0,0,0,.03)"/>' + slotHtml + '</g>';
    };

    el.insertAdjacentHTML('beforeend', STYLE + `
      <div class="ip">
        <div class="ip-panel">
          <div class="ip-stage" id="ipStage">
            <div class="ip-draw" id="ipDraw">
              <svg id="ipSvg" width="200" height="200" viewBox="0 0 220 220" fill="none"
                   stroke="currentColor" stroke-width="2" stroke-linejoin="round">
                ${isoLayer(24, 50, 25, 14, false)}
                ${isoLayer(80, 50, 25, 14, true)}
                ${isoLayer(136, 50, 25, 14, true)}
                <g class="ip-layer"><path d="M110 4 L134 16 L110 28 L86 16 Z" fill="rgba(255,255,255,.2)"/>
                  <path d="M86 16 L110 28 L110 40 L86 28 Z" fill="rgba(0,0,0,.07)"/>
                  <path d="M134 16 L110 28 L110 40 L134 28 Z" fill="rgba(0,0,0,.03)"/></g>
              </svg>
            </div>
          </div>
          <div class="ip-ctl">
            <div class="ip-row"><span class="ip-lb">线重</span>
              <input class="ip-sl" id="ipW" type="range" min="1" max="5" step="0.1" value="2">
              <span class="ip-val" id="ipWv">2.0</span></div>
            <div class="ip-row"><span class="ip-lb">尺寸</span>
              <input class="ip-sl" id="ipS" type="range" min="120" max="230" step="1" value="200">
              <span class="ip-val" id="ipSv">200</span></div>
            <div class="ip-row"><span class="ip-lb">主题</span>
              <span class="ip-seg" id="ipTheme"><button class="on" data-v="light">亮</button><button data-v="dark">暗</button></span></div>
            <div class="ip-row"><span class="ip-lb">朝向</span>
              <span class="ip-seg" id="ipFace"><button class="on" data-v="right">右</button><button data-v="left">左</button></span></div>
          </div>
        </div>
        <div class="ip-hint">同一张 SVG，四个旋钮实时改参：线重直改 stroke-width（不是缩放）、主题翻转靠 currentColor、朝向是 scaleX 镜像、悬停画面时四层按光标做层间视差。</div>
      </div>`);

    const stage = el.querySelector('#ipStage');
    const draw = el.querySelector('#ipDraw');
    const svg = el.querySelector('#ipSvg');
    const layers = svg.querySelectorAll('.ip-layer');
    const wSl = el.querySelector('#ipW'), wV = el.querySelector('#ipWv');
    const sSl = el.querySelector('#ipS'), sV = el.querySelector('#ipSv');
    const cleanups = [];
    let facing = 'right';

    const onW = () => { svg.setAttribute('stroke-width', wSl.value); wV.textContent = (+wSl.value).toFixed(1); };
    const onS = () => {
      svg.setAttribute('width', sSl.value); svg.setAttribute('height', sSl.value);
      sV.textContent = sSl.value;
    };
    wSl.addEventListener('input', onW);
    sSl.addEventListener('input', onS);
    cleanups.push(() => { wSl.removeEventListener('input', onW); sSl.removeEventListener('input', onS); });

    const wireSeg = (id, fn) => {
      const seg = el.querySelector(id);
      const onClick = (e) => {
        const b = e.target.closest('button');
        if (!b) return;
        for (const x of seg.children) x.classList.toggle('on', x === b);
        fn(b.dataset.v);
      };
      seg.addEventListener('click', onClick);
      cleanups.push(() => seg.removeEventListener('click', onClick));
    };
    wireSeg('#ipTheme', (v) => stage.classList.toggle('dark', v === 'dark'));
    wireSeg('#ipFace', (v) => { facing = v; applyTilt(0, 0); });

    // 层间视差：位移系数按层递增，配合整体 3D 倾斜
    let raf = 0, tx = 0, ty = 0;
    const applyTilt = (px, py) => {
      draw.style.transform = 'rotateX(' + (-py * 7).toFixed(2) + 'deg) rotateY(' + (px * 9).toFixed(2) + 'deg)' +
        (facing === 'left' ? ' scaleX(-1)' : '');
      layers.forEach((g, i) => {
        const k = (i + 1) / layers.length;
        g.style.transform = 'translate(' + (px * 5 * k).toFixed(1) + 'px,' + (py * 4 * k).toFixed(1) + 'px)';
      });
    };
    const onMove = (e) => {
      const r = stage.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
      if (!raf) raf = requestAnimationFrame(() => { raf = 0; applyTilt(tx, ty); });
    };
    const onLeave = () => {
      applyTilt(0, 0);
      layers.forEach((g) => { g.style.transform = ''; });
    };
    stage.addEventListener('pointermove', onMove);
    stage.addEventListener('pointerleave', onLeave);
    cleanups.push(() => {
      cancelAnimationFrame(raf);
      stage.removeEventListener('pointermove', onMove);
      stage.removeEventListener('pointerleave', onLeave);
    });

    return () => { for (const c of cleanups) c(); el.innerHTML = ''; };
  }
};
