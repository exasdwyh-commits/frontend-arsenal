export default {
  id: 'pixel-heading', group: 'entrance', name: '逐字换字体标题',
  lib: '原生 JS',
  desc: '标题里每个字母各用一种字体，随时间一个个换下去，形成从左到右扫过的"字体波"。移植自 Cult UI 的 Pixel Heading Character，核心是用黄金比例分配字体索引，让相邻字母几乎不撞款。',
  deps: '无',
  note: '字体索引用 floor(i * φ * FONT_COUNT) % FONT_COUNT（φ=1.618），相邻位的索引差恒定在黄金比例附近，天然错开；换成 Math.random 会随机撞出连着三个同款，一行字看起来就"结块"。每个字母的换字时刻要叠一个 stagger 延迟（vi * 30ms），全员同步换会变成整行闪烁而不是波。字体一换行宽就跳：每个字母必须包在 inline-block 容器里，容器宽度不能拍脑袋写 min-width——不同字体宽度差能到 40%，必须在 init 时用离屏 canvas 把该字符在所有字体下的 measureText 都量一遍取最大值。空格位要跳过索引推进（vi 只对可见字符计数），否则单词内部的错落节奏会整体偏移。',
  scenes: { places: ['首屏', '标题'], goals: ['营造氛围', '内容呈现'], triggers: ['持续播放', '悬停'], projects: ['品牌官网', '作品集'] },
  code: `const PHI = (1 + Math.sqrt(5)) / 2;
const FONTS = ['Georgia,serif','system-ui,sans-serif','ui-monospace,monospace',
  'Courier New,monospace','Palatino,serif'];

// 黄金比例分配：相邻字母几乎不撞款
const goldenBase = i => Math.floor(i * PHI * FONTS.length) % FONTS.length;

let vi = 0;                       // 可见字符序号，空格不推进
[...text].forEach((ch, i) => {
  if (ch === ' ') { spans[i].style.minWidth = '.32em'; return; }
  const base = goldenBase(vi);
  const delay = vi * 30;          // 每字错开 30ms，形成波
  const apply = tick => {
    const k = (base + tick) % FONTS.length;
    spans[i].style.fontFamily = FONTS[k];
  };
  setTimeout(() => setInterval(() => apply(++tick), 260), delay);
  vi++;
});`,
  init(el) {
    const TEXT = 'PIXEL HEADING';
    const FONTS = [
      'Georgia,"Times New Roman",serif',
      'system-ui,"Segoe UI",sans-serif',
      'ui-monospace,SFMono-Regular,Menlo,monospace',
      '"Courier New",monospace',
      '"Palatino Linotype",Palatino,serif',
      '"Trebuchet MS",Verdana,sans-serif',
    ];
    const STAGGER = 34;
    const INTERVAL = 260;

    const STYLE = `<style data-fx="pixel-heading">
      .ph{display:flex;flex-direction:column;align-items:center;gap:11px;width:100%}
      .ph-line{display:flex;align-items:baseline;justify-content:center;flex-wrap:nowrap;
        font-size:23px;font-weight:700;color:#eef1f7;letter-spacing:.01em;line-height:1.15}
      .ph-ch{display:inline-block;text-align:center;   /* 等宽容器防抖，宽度 JS 量 */
        transition:color .25s ease;text-shadow:0 0 14px rgba(139,108,255,.28)}
      .ph-ch.hot{color:#adfa1b;text-shadow:0 0 16px rgba(173,250,27,.5)}
      .ph-cap{font-size:9.5px;color:#4a5368;letter-spacing:.08em;text-transform:uppercase}
    </style>`;

    // 每个字母一个 span
    const spansHTML = [...TEXT].map(ch =>
      ch === ' ' ? '<span class="ph-ch sp">&nbsp;</span>' : '<span class="ph-ch">' + ch + '</span>'
    ).join('');

    el.insertAdjacentHTML('beforeend', STYLE + `
      <div class="ph">
        <div class="ph-line" id="phLine">${spansHTML}</div>
        <div class="ph-cap">悬停：加速整行换字</div>
      </div>`);

    const line = el.querySelector('#phLine');
    const spans = [...line.querySelectorAll('.ph-ch')];

    // 每个字符在"所有字体里最宽的那一档"作为固定容器宽，换字体才不抖不叠
    const meas = document.createElement('canvas').getContext('2d');
    const lineStyle = getComputedStyle(line);
    const fontPx = parseFloat(lineStyle.fontSize);
    const weight = lineStyle.fontWeight;
    meas.font = weight + ' ' + fontPx + 'px';
    const widestOf = ch => {
      let w = 0;
      for (const f of FONTS) {
        meas.font = weight + ' ' + fontPx + 'px ' + f;
        w = Math.max(w, meas.measureText(ch).width);
      }
      return w;
    };
    [...TEXT].forEach((ch, i) => {
      if (ch === ' ') { spans[i].style.width = widestOf('n') * 0.55 + 'px'; return; }
      spans[i].style.width = widestOf(ch) + 1 + 'px';
    });

    const PHI = (1 + Math.sqrt(5)) / 2;
    const timers = [];
    let speed = INTERVAL;

    // 黄金比例分配基础索引 + 每字 stagger 延迟
    let vi = 0;
    [...TEXT].forEach((ch, i) => {
      const span = spans[i];
      if (ch === ' ') return;

      const base = Math.floor(vi * PHI * FONTS.length) % FONTS.length;
      const delay = vi * STAGGER;
      const myIndex = vi;
      let tick = 0;
      let iv = null;

      const apply = () => {
        const k = (base + tick) % FONTS.length;
        span.style.fontFamily = FONTS[k];
        // 换字瞬间点亮一下，让"波"看得见
        span.classList.add('hot');
        setTimeout(() => span.classList.remove('hot'), 160);
      };

      setTimeout(() => {
        apply();
        iv = setInterval(apply, speed);
        timers.push(iv);
      }, delay);

      vi++;
    });

    // 悬停把所有 interval 收紧：波速变快而不是闪得更乱
    const onEnter = () => {
      timers.forEach((_, k) => {
        clearInterval(timers[k]);
        timers[k] = null;
      });
      // 用统一的快速定时器接管，保持各字的相位差
      line.querySelectorAll('.ph-ch:not(.sp)').forEach((span, k) => {
        let t = k;
        const fast = setInterval(() => {
          span.style.fontFamily = FONTS[t++ % FONTS.length];
          span.classList.add('hot');
          setTimeout(() => span.classList.remove('hot'), 120);
        }, 90);
        timers.push(fast);
      });
    };

    const onLeave = () => { /* 保持加速，避免频繁重排定时器 */ };
    line.addEventListener('pointerenter', onEnter);
    line.addEventListener('pointerleave', onLeave);

    return () => {
      timers.forEach(t => t && clearInterval(t));
      line.removeEventListener('pointerenter', onEnter);
      line.removeEventListener('pointerleave', onLeave);
      el.innerHTML = '';
    };
  }
};
