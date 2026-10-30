export default {
  id: 'stripe-guides', group: 'particle', name: '栏位导引光',
  lib: '纯 CSS',
  desc: '几根若隐若现的竖向导引线上，随机有一段光沿着线滑下来，像页面骨架在通电。移植自 Cult UI 的 Stripe BG Guides，是它落地页的默认背景层。',
  deps: '无',
  note: '光段必须是"两头透明"的渐变（transparent → 主色 → transparent），用实心块会看到一个方块从头滑到尾。光段要比导引线高一截（10vh 线 + 16vh 光），spring 缓动会冲过头（cubic-bezier(.175,.885,.32,1.275) 的 1.275 过冲），不够高就在末尾撞出一截硬边。位移只用 transform: translateY 走合成层，动 top 每帧重排。导引线本身上下也要淡出，否则页面顶底出现一条生硬的实线。同时最多点亮 3 根，全亮就变成廉价的 loading 条。',
  scenes: { places: ['背景', '首屏'], goals: ['营造氛围'], triggers: ['持续播放'], projects: ['品牌官网', 'AI 产品', '作品集'] },
  code: `/* 光段：高过线 + 两头透明 + transform 位移 + spring 过冲 */
.guide{position:absolute;top:0;bottom:0;width:1px;
  background:linear-gradient(180deg,transparent,rgba(255,255,255,.14) 22%,rgba(255,255,255,.14) 78%,transparent)}
.guide .glow{position:absolute;left:-1.5px;width:4px;height:16vh;   /* 线 10vh，光 16vh */
  background:linear-gradient(180deg,transparent,#adfa1b,transparent);
  mix-blend-mode:screen;filter:blur(1.5px);opacity:0;transform:translateY(-20vh)}
.guide.on .glow{opacity:1;animation:guide-run 6s cubic-bezier(.175,.885,.32,1.275) forwards}
@keyframes guide-run{from{transform:translateY(-20vh)}to{transform:translateY(105vh)}}`,
  init(el) {
    const COLS = 6;

    const STYLE = `<style data-fx="stripe-guides">
      .sg{display:flex;flex-direction:column;align-items:center;gap:10px;width:100%}
      .sg-stage{position:relative;width:212px;height:112px;border-radius:12px;overflow:hidden;
        border:1px solid rgba(255,255,255,.07);
        background:linear-gradient(160deg,#141a26,#0b0e14)}
      .sg-title{position:absolute;left:12px;top:34px;font-size:13px;font-weight:600;color:#eef1f7;
        letter-spacing:.01em}
      .sg-sub{position:absolute;left:12px;top:54px;font-size:9.5px;color:#6b7488;letter-spacing:.04em}
      .sg-g{position:absolute;inset:0}
      .sg-c{position:absolute;top:0;bottom:0;width:1px;
        background:linear-gradient(180deg,transparent,rgba(255,255,255,.13) 24%,rgba(255,255,255,.13) 76%,transparent)}
      .sg-c.solid{background:linear-gradient(180deg,transparent,rgba(255,255,255,.2) 24%,rgba(255,255,255,.2) 76%,transparent)}
      .sg-c .glow{position:absolute;left:-1.5px;width:4px;height:150%;   /* 高过容器，过冲不撞边 */
        background:linear-gradient(180deg,transparent,#adfa1b 42%,#efffb7 50%,transparent);
        mix-blend-mode:screen;filter:blur(1.6px);opacity:0;
        transform:translateY(-160%);will-change:transform,opacity}
      .sg-c.on .glow{opacity:.95;animation:sg-run 2.6s cubic-bezier(.175,.885,.32,1.275) forwards}
      @keyframes sg-run{from{transform:translateY(-160%)}to{transform:translateY(115%)}}
      .sg-hint{font-size:9.5px;color:#4a5368;letter-spacing:.08em;text-transform:uppercase}
    </style>`;

    const cols = [];
    for (let i = 0; i < COLS; i++) {
      const solid = i % 3 === 1;                 // 部分导引线常亮，节奏不匀
      cols.push(`<div class="sg-c${solid ? ' solid' : ''}" style="left:${(i + 0.5) * (100 / COLS)}%"><span class="glow"></span></div>`);
    }

    el.insertAdjacentHTML('beforeend', STYLE + `
      <div class="sg">
        <div class="sg-stage">
          <div class="sg-g">${cols.join('')}</div>
          <div class="sg-title">Atlas</div>
          <div class="sg-sub">随机点亮 · spring 过冲</div>
        </div>
        <div class="sg-hint">同时最多 3 根导引线发光</div>
      </div>`);

    const nodes = [...el.querySelectorAll('.sg-c')];
    let timer = null;

    const light = () => {
      // 随机挑 1–3 根点亮，熄灭的先摘 class 让动画能重放
      const pick = new Set();
      const n = 1 + Math.floor(Math.random() * 3);
      while (pick.size < n) pick.add(Math.floor(Math.random() * nodes.length));
      nodes.forEach((c, i) => {
        const on = pick.has(i);
        if (!on) c.classList.remove('on');
        else if (!c.classList.contains('on')) {
          // 强制回流，保证重复点亮时动画从头播
          void c.offsetWidth;
          c.classList.add('on');
        }
      });
    };

    light();
    timer = setInterval(light, 2600);

    return () => {
      clearInterval(timer);
      el.innerHTML = '';
    };
  }
};
