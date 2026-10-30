export default {
  id: 'agent-stack', group: 'data', name: '建议卡堆栈',
  lib: '原生 JS',
  desc: '两张建议卡前后叠放，前卡的进度条混着成功/失败两段一起长，点提交后前卡飞出、后卡顶上。移植自 Cult UI 的 Agent Suggest Card Stack，是 AI 编码产品里"agent 给你列改动清单"的标准形态。',
  deps: '无',
  note: '混合进度条（success 92% + error 8%）必须用两个 flex 块拼，别用 background 的多色标 linear-gradient：渐变的百分比是相对整条轨道算的，轨道一动画就全部错位，flex 块是相对自身父盒。两段之间要留 1px 的分隔色而不是 border，border 会在 width 过渡时被压扁。堆栈只用 transform 位移（后卡 translateY(-6px) scale(.96)），动 top 会让两张卡轮流触发重排。飞出的卡要先设 pointer-events:none 再过渡，否则动画途中还能被点到。',
  scenes: { places: ['列表', '数据看板', '对话'], goals: ['展示数据', '内容呈现'], triggers: ['数据更新', '点击'], projects: ['AI 产品', '管理后台'] },
  code: `/* 混合进度 = 两个 flex 块，宽度百分比相对轨道而不是渐变标 */
<div class="track">
  <div class="seg ok" style="width:0%"></div>
  <div class="seg bad" style="width:0%"></div>
</div>

/* 异步推进：先 flex-basis 过渡，结束后再补第二段 */
segOk.style.flexGrow = 92;        // flex-grow 比 width 稳：轨道变宽时自动等比
segBad.style.flexGrow = 8;

/* CSS
.track{display:flex;height:6px;border-radius:3px;overflow:hidden;
  background:#1b2130;box-shadow:inset 0 0 0 1px #2a3245}
.seg{transition:flex-grow .8s cubic-bezier(.2,.9,.2,1)}
.seg.ok{background:#388E4A}
.seg.bad{background:#c63d3d;margin-left:1px}   /* 1px 分隔，不要 border */
*/`,
  init(el) {
    const CARDS = [
      { title: 'auth.ts', ok: 92, bad: 8, note: '合并 token 校验中间件' },
      { title: 'session.ts', ok: 74, bad: 26, note: '过期时间改为滑动窗口' },
      { title: 'login.tsx', ok: 100, bad: 0, note: '补 3 个回归用例' },
      { title: 'middleware.ts', ok: 61, bad: 39, note: '移除重复的重定向' },
    ];

    const STYLE = `<style data-fx="agent-stack">
      .as{display:flex;flex-direction:column;align-items:center;gap:11px}
      .as-deck{position:relative;width:206px;height:120px}
      .as-card{position:absolute;left:0;right:0;top:0;border-radius:11px;padding:9px 11px;
        background:#151a24;box-shadow:inset 0 0 0 1px rgba(255,255,255,.05),0 1px 1px rgba(0,0,0,.4),
          0 4px 8px rgba(0,0,0,.18),0 8px 16px rgba(0,0,0,.16);
        transition:transform .42s cubic-bezier(.3,1.05,.4,1),opacity .34s ease;
        will-change:transform,opacity}
      .as-back{transform:translateY(9px) scale(.94);opacity:.55;z-index:1}
      .as-front{z-index:2}
      .as-fly{transform:translateY(-16px) rotate(-1.4deg) scale(.96);opacity:0;pointer-events:none}
      .as-head{display:flex;align-items:center;gap:7px;margin-bottom:8px}
      .as-bot{font-size:8.5px;letter-spacing:.1em;text-transform:uppercase;color:#8b93a7;
        border:1px solid #2a3245;border-radius:99px;padding:2px 7px}
      .as-open{font-size:8.5px;letter-spacing:.1em;text-transform:uppercase;color:#3ddc97;
        border:1px solid #1d4034;border-radius:99px;padding:2px 7px;margin-left:auto}
      .as-title{font-size:11.5px;font-weight:600;color:#eef1f7;font-family:ui-monospace,Menlo,Consolas,monospace}
      .as-note{font-size:9.5px;color:#7c869c;margin:0 0 9px;line-height:1.5}
      .as-track{display:flex;height:6px;border-radius:3px;overflow:hidden;background:#1b2130;
        box-shadow:inset 0 0 0 1px #2a3245;margin-bottom:9px}
      .as-seg{transition:flex-grow .8s cubic-bezier(.2,.9,.2,1);will-change:flex-grow}
      .as-seg.ok{background:#388E4A}
      .as-seg.bad{background:#c63d3d;margin-left:1px}
      .as-foot{display:flex;align-items:center;gap:8px}
      .as-loc{font-size:9px;color:#5f6b85;letter-spacing:.04em}
      .as-commit{margin-left:auto;font-size:9.5px;padding:5px 11px;border-radius:6px;cursor:pointer;
        background:#1e2431;border:1px solid #2a3245;color:#cfd6e6;letter-spacing:.02em;
        transition:.18s}
      .as-commit:hover{background:#262e3f;border-color:#3a4560}
      .as-commit:active{transform:translateY(1px)}
      .as-hint{font-size:9.5px;color:#4a5368;letter-spacing:.08em;text-transform:uppercase}
    </style>`;

    el.insertAdjacentHTML('beforeend', STYLE + `
      <div class="as">
        <div class="as-deck" id="asDeck">
          <div class="as-card as-back" id="asBack">
            <div class="as-head"><span class="as-bot">bot</span><span class="as-title" id="bT">—</span></div>
            <p class="as-note" id="bN">—</p>
          </div>
          <div class="as-card as-front" id="asFront">
            <div class="as-head"><span class="as-bot">bot</span><span class="as-open">Open</span></div>
            <div class="as-title" id="fT">—</div>
            <p class="as-note" id="fN">—</p>
            <div class="as-track">
              <div class="as-seg ok" id="fOk" style="flex-grow:0"></div>
              <div class="as-seg bad" id="fBad" style="flex-grow:0"></div>
            </div>
            <div class="as-foot">
              <span class="as-loc" id="fPct">0% 通过</span>
              <span class="as-commit" id="fCommit">Commit to main</span>
            </div>
          </div>
        </div>
        <div class="as-hint">点击 Commit：后卡顶上</div>
      </div>`);

    const front = el.querySelector('#asFront');
    const back = el.querySelector('#asBack');
    const fT = el.querySelector('#fT'), fN = el.querySelector('#fN');
    const bT = el.querySelector('#bT'), bN = el.querySelector('#bN');
    const fOk = el.querySelector('#fOk'), fBad = el.querySelector('#fBad');
    const fPct = el.querySelector('#fPct');
    const commit = el.querySelector('#fCommit');

    let idx = 0;
    let busy = false;

    // 填充进度：等一帧再改 flexGrow，保证 0 → N 有一次真实过渡
    const fill = card => {
      fOk.style.flexGrow = '0';
      fBad.style.flexGrow = '0';
      requestAnimationFrame(() => requestAnimationFrame(() => {
        fOk.style.flexGrow = String(card.ok);
        fBad.style.flexGrow = String(card.bad);
        fPct.textContent = card.ok + '% 通过';
      }));
    };

    const paintFront = i => {
      const c = CARDS[i];
      fT.textContent = c.title;
      fN.textContent = c.note;
      fill(c);
    };
    const paintBack = i => {
      const c = CARDS[i % CARDS.length];
      bT.textContent = c.title;
      bN.textContent = c.note;
    };

    paintFront(0);
    paintBack(1);

    const advance = () => {
      if (busy) return;
      busy = true;
      front.classList.add('as-fly');          // 前卡飞出
      back.classList.remove('as-back');       // 后卡顶到前位
      back.classList.add('as-front');

      setTimeout(() => {
        idx = (idx + 1) % CARDS.length;
        // 复位：把 back 变回新一张的后卡，再挂到 deck 末尾（DOM 顺序决定叠放）
        back.classList.remove('as-front');
        back.classList.add('as-back');
        paintBack(idx + 1);
        front.classList.remove('as-fly');
        paintFront(idx);
        busy = false;
      }, 440);
    };

    const onCommit = e => { e.stopPropagation(); advance(); };
    commit.addEventListener('click', onCommit);

    const timer = setInterval(advance, 3800);

    return () => {
      clearInterval(timer);
      commit.removeEventListener('click', onCommit);
      el.innerHTML = '';
    };
  }
};
