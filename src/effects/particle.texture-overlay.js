export default {
  id: 'texture-overlay', group: 'particle', name: '纹理叠层',
  lib: '纯 CSS',
  desc: '一层数学图案盖在任何元素上，立刻有纸感/网点感/印刷感。移植自 Cult UI 的 Texture Overlay，它一次给了 12 种图案，全是 background 的组合，零图片零 JS。',
  deps: '无',
  note: '所有图案都是 background-image + background-size 的组合，格子尺寸别低于 6px，1px 线在 1x 屏会跟像素网格打架出摩尔纹。halftone 那种"错位网点"必须两层 radial-gradient 配 background-position: 0 0, 5px 5px，少一层就退化成普通方格阵。叠层一定要 pointer-events:none，否则整块区域吃掉点击。想要"印上去"而不是"贴上去"，叠层用 mix-blend-mode: multiply；想要浮雕高光用 overlay，两种混合模式出来的完全是两种材质。',
  scenes: { places: ['背景', '卡片', '首屏'], goals: ['营造氛围'], triggers: ['持续播放'], projects: ['品牌官网', '作品集'] },
  code: `/* 图案 = background-image + background-size；叠层不吃指针 */
.tex{position:absolute;inset:0;pointer-events:none;mix-blend-mode:overlay;opacity:.85}

/* 网点 */
.tex.dots{background:radial-gradient(circle at 1px 1px,rgba(0,0,0,.4) 1px,transparent 0);
  background-size:8px 8px}
/* 交叉排线 */
.tex.cross{background:
  repeating-linear-gradient(45deg,transparent,transparent 2px,rgba(0,0,0,.3) 2px,rgba(0,0,0,.3) 4px),
  repeating-linear-gradient(-45deg,transparent,transparent 2px,rgba(0,0,0,.3) 2px,rgba(0,0,0,.3) 4px)}
/* 错位网点：两层 + 双 background-position */
.tex.halftone{background:radial-gradient(circle,rgba(0,0,0,.4) 25%,transparent 25%);
  background-size:10px 10px;background-position:0 0,5px 5px}
/* 纸纹：三个方向的细线各来一遍 */
.tex.grain{background:
  repeating-linear-gradient(0deg,rgba(0,0,0,.1) 0,transparent 1px,transparent 3px),
  repeating-linear-gradient(90deg,rgba(0,0,0,.1) 0,transparent 1px,transparent 4px),
  repeating-linear-gradient(45deg,rgba(0,0,0,.05) 0,transparent 1px,transparent 5px)}`,
  init(el) {
    const TEX = [
      { k: 'dots', label: 'Dots', css: 'radial-gradient(circle at 1px 1px,rgba(0,0,0,.45) 1px,transparent 0)|8px 8px|' },
      { k: 'grid', label: 'Grid', css: 'linear-gradient(rgba(0,0,0,.3) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,.3) 1px,transparent 1px)|12px 12px|' },
      { k: 'cross', label: 'Crosshatch', css: 'repeating-linear-gradient(45deg,transparent,transparent 2px,rgba(0,0,0,.32) 2px,rgba(0,0,0,.32) 4px),repeating-linear-gradient(-45deg,transparent,transparent 2px,rgba(0,0,0,.32) 2px,rgba(0,0,0,.32) 4px)||' },
      { k: 'diag', label: 'Diagonal', css: 'repeating-linear-gradient(-45deg,rgba(0,0,0,.24) 0,rgba(0,0,0,.24) 1px,transparent 1px,transparent 6px)||' },
      { k: 'half', label: 'Halftone', css: 'radial-gradient(circle,rgba(0,0,0,.42) 25%,transparent 25%),radial-gradient(circle,rgba(0,0,0,.42) 25%,transparent 25%)|10px 10px|0 0,5px 5px' },
      { k: 'grain', label: 'Paper grain', css: 'repeating-linear-gradient(0deg,rgba(0,0,0,.1) 0,transparent 1px,transparent 3px),repeating-linear-gradient(90deg,rgba(0,0,0,.1) 0,transparent 1px,transparent 4px),repeating-linear-gradient(45deg,rgba(0,0,0,.05) 0,transparent 1px,transparent 5px)||' },
    ];

    const STYLE = `<style data-fx="texture-overlay">
      .txo{display:flex;flex-direction:column;align-items:center;gap:7px}
      .txo-stage{position:relative;width:196px;height:72px;border-radius:12px;overflow:hidden;
        border:1px solid rgba(255,255,255,.07);cursor:pointer;
        background:
          radial-gradient(72px 54px at 24% 30%,rgba(139,108,255,.95),transparent 72%),
          radial-gradient(62px 46px at 76% 64%,rgba(31,182,255,.85),transparent 74%),
          radial-gradient(90px 58px at 52% 98%,rgba(255,93,59,.55),transparent 72%),
          linear-gradient(160deg,#1d2434,#0d1017)}
      .txo-layer{position:absolute;inset:0;pointer-events:none;mix-blend-mode:overlay;opacity:.9;
        transition:opacity .45s ease}
      .txo-label{position:absolute;left:11px;bottom:9px;font-size:9px;letter-spacing:.16em;
        text-transform:uppercase;color:rgba(255,255,255,.8);text-shadow:0 1px 5px rgba(0,0,0,.6)}
      .txo-cap{font-size:9px;color:#4a5368;letter-spacing:.08em;text-transform:uppercase}
      .txo-btns{display:flex;flex-wrap:wrap;gap:4px;justify-content:center;max-width:214px}
      .txo-btns button{font-size:8.5px;padding:3px 8px;border-radius:6px;cursor:pointer;
        background:#171c27;border:1px solid #242a38;color:#7c869c;letter-spacing:.04em;
        transition:.18s}
      .txo-btns button.on{border-color:#8b6cff;color:#c9c2ff;background:#1b1f31}
    </style>`;

    el.insertAdjacentHTML('beforeend', STYLE + `
      <div class="txo">
        <div class="txo-stage" id="txoStage">
          <div class="txo-layer" id="txoLayer"></div>
          <div class="txo-label" id="txoLabel">Dots</div>
        </div>
        <div class="txo-btns" id="txoBtns">
          ${TEX.map((t, i) => `<button data-i="${i}"${i === 0 ? ' class="on"' : ''}>${t.label}</button>`).join('')}
        </div>
        <div class="txo-cap">点击换图案 · 全是 background</div>
      </div>`);

    const layer = el.querySelector('#txoLayer');
    const label = el.querySelector('#txoLabel');
    const btns = [...el.querySelectorAll('#txoBtns button')];

    let i = 0;
    let timer = null;

    const apply = n => {
      i = (n + TEX.length) % TEX.length;
      const [img, size, pos] = TEX[i].css.split('|');
      layer.style.backgroundImage = img;
      layer.style.backgroundSize = size || '';
      layer.style.backgroundPosition = pos || '';
      label.textContent = TEX[i].label;
      btns.forEach((b, k) => b.classList.toggle('on', k === i));
    };

    const restart = () => { clearInterval(timer); timer = setInterval(() => apply(i + 1), 2200); };

    const onClick = e => {
      const b = e.target.closest('button');
      if (!b) return;
      apply(Number(b.dataset.i));
      restart();
    };
    el.querySelector('#txoBtns').addEventListener('click', onClick);
    el.querySelector('#txoStage').addEventListener('click', () => { apply(i + 1); restart(); });

    apply(0);
    restart();

    return () => {
      clearInterval(timer);
      el.querySelector('#txoBtns').removeEventListener('click', onClick);
      el.innerHTML = '';
    };
  }
};
