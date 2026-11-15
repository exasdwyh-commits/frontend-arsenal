/* ============================================================
   claude-demo.js — 「用了判据 vs 没用」的可视化对比台
   ------------------------------------------------------------
   原则跟首页一致：默认静态，点「播放」才跑；不常驻 rAF / 定时器。
   切换场景一定 destroy 上一个，不能留计时器在后台。
   ============================================================ */

const SCENES = {
  stream: {
    tab: '01 流式输出',
    title: '输出要像"在写"，不是"跳出来"',
    why: '逐字出现让人有时间跟上，也让人相信真的在算。节奏可以不均匀，但光标必须一直在，结束时要停住而不是继续闪。',
    avoid: '速度低于每秒 12 字就开始难受；为了"像 AI"故意放慢是最常见的自伤。',
    links: ['typewriter-caret', 'agent-chat-demo'],
    bad: 'AI 常见的默认做法：一次性把整段吐出来',
    good: '按判据改过：逐字输出 + 常驻光标 + 落定停住',
    build(L, R) {
      const text = '我在查你给的三份文档，第二条里有个冲突，先按最新版处理。';
      L.innerHTML = `<div class="cd-msg">${text}</div><span class="cd-flag">DONE · 一次性输出</span>`;
      R.innerHTML = `<div class="cd-msg"><span class="cd-type"></span><i class="cd-caret"></i></div>
        <span class="cd-flag ok">逐字 · 约 18 字/秒</span>`;
      const out = R.querySelector('.cd-type');
      const caret = R.querySelector('.cd-caret');
      let timer = 0, i = 0;
      return {
        play() {
          clearInterval(timer);
          i = 0; out.textContent = ''; caret.className = 'cd-caret';
          timer = setInterval(() => {
            out.textContent = text.slice(0, ++i);
            if (i >= text.length) {
              clearInterval(timer);
              /* 打完就停：光标不该一直闪下去，那会读成"还没结束" */
              caret.classList.add('stop');
            }
          }, 55);
        },
        destroy() { clearInterval(timer); }
      };
    }
  },

  thinking: {
    tab: '02 思考态',
    title: '思考态只承诺"还活着"，不承诺进度',
    why: '模型给不出真实百分比，界面也不该给。三个点、一道扫光、一句"正在查资料"——作用是消解"是不是卡了"的焦虑，不是报告进度。',
    avoid: '骨架屏超过 3 秒就该换文案或给取消入口，扫光只是在骗"还在动"。',
    links: ['thinking-dots', 'skeleton-shimmer'],
    bad: 'AI 常见的默认做法：一个会走满又归零的假进度条',
    good: '按判据改过：三点循环 + 只说"正在查资料"',
    build(L, R) {
      L.innerHTML = `<div class="cd-fake"><div class="cd-bar"><i></i></div>
        <b class="cd-pct">0%</b></div><p class="cd-note">正在生成…</p>
        <span class="cd-flag">0 → 100% → 0，循环</span>`;
      R.innerHTML = `<div class="cd-dots"><i></i><i></i><i></i></div>
        <p class="cd-note">正在查资料</p><span class="cd-flag ok">不报百分比</span>`;
      const bar = L.querySelector('.cd-bar i');
      const pct = L.querySelector('.cd-pct');
      const dots = R.querySelector('.cd-dots');
      let timer = 0, v = 0;
      return {
        play() {
          clearInterval(timer);
          v = 0; bar.style.width = '0%'; pct.textContent = '0%';
          /* 重播 CSS 动画：去掉 class 触发一次 reflow 再加回来 */
          dots.classList.remove('on'); void dots.offsetWidth; dots.classList.add('on');
          /* 只跑一轮就停：假进度条常驻循环是最费电、最没必要的一种 */
          timer = setInterval(() => {
            v += 4;
            bar.style.width = v + '%';
            pct.textContent = Math.min(100, v) + '%';
            if (v >= 100) clearInterval(timer);
          }, 60);
        },
        destroy() { clearInterval(timer); }
      };
    }
  },

  stack: {
    tab: '03 建议卡',
    title: '建议卡一次只让一张能提交',
    why: '两张卡都能点，用户就要先做一次"点哪张"的决策，而这一步跟任务本身无关。叠着放、前卡飞出后卡顶上，同一时刻只有一个可执行动作。',
    avoid: '建议卡的进度条别伪造"真实进度"：要么接真事件，要么明说这是演示。',
    links: ['agent-stack', 'button-morph'],
    bad: 'AI 常见的默认做法：两张都能点，先逼用户做一次选择',
    good: '按判据改过：叠放，只有前卡能提交，点完飞出、后卡顶上',
    build(L, R) {
      L.innerHTML = `<div class="cd-duo">
        <div class="cd-mini"><span>方案 A · 精简版</span><button type="button">提交</button></div>
        <div class="cd-mini"><span>方案 B · 完整版</span><button type="button">提交</button></div>
      </div><span class="cd-flag">两个「提交」同时可点</span>`;
      R.innerHTML = `<div class="cd-stack">
        <div class="cd-mini front"><span>方案 A · 精简版</span><button type="button" data-go>提交</button></div>
        <div class="cd-mini back"><span>方案 B · 完整版</span><button type="button" data-go>提交</button></div>
      </div><span class="cd-flag ok">同一时刻只有一个可执行动作</span>`;
      let done = false;
      const onClick = e => {
        if (!e.target.closest('[data-go]') || done) return;
        done = true;
        const stack = R.querySelector('.cd-stack');
        stack.classList.add('advance');
        R.querySelector('.cd-flag.ok').textContent = '前卡已提交 · 后卡顶上，仍只有一个可点';
      };
      R.addEventListener('click', onClick);
      L.querySelectorAll('button').forEach(b => {
        b.addEventListener('click', () => { b.textContent = '已发送'; b.classList.add('sent'); });
      });
      return {
        play() {
          done = false;
          R.querySelector('.cd-stack').classList.remove('advance');
          R.querySelector('.cd-flag.ok').textContent = '同一时刻只有一个可执行动作';
          L.querySelectorAll('button').forEach(b => { b.textContent = '提交'; b.classList.remove('sent'); });
        },
        destroy() { R.removeEventListener('click', onClick); }
      };
    }
  }
};

const promptFor = s => [
  '按下面这条界面判据改写当前界面。用原生 JS/CSS，不引入任何运行时依赖。',
  '',
  `【判据】${s.title}`,
  `【为什么】${s.why}`,
  `【什么时候别用】${s.avoid}`,
  `【库内参考机制】https://exasdwyh-commits.github.io/frontend-arsenal/effects.html#${s.links[0]}`,
  '',
  '验收：init(el) 返回清理函数；只改传入的 el；尊重 prefers-reduced-motion；触屏可用；给完整可运行代码。'
].join('\n');

export function initClaudeDemo() {
  const root = document.getElementById('claudeDemo');
  if (!root) return;

  const tabsEl = root.querySelector('.cd-tabs');
  const L = root.querySelector('.cd-stage-l');
  const R = root.querySelector('.cd-stage-r');
  const badLabel = root.querySelector('.cd-label-l');
  const goodLabel = root.querySelector('.cd-label-r');
  const verdict = root.querySelector('.cd-verdict');
  const playBtn = root.querySelector('.cd-play');
  const status = root.querySelector('.cd-status');
  const copyBtn = root.querySelector('.cd-copy');

  const keys = Object.keys(SCENES);
  let current = null, api = null;

  tabsEl.innerHTML = keys.map((k, i) =>
    `<button type="button" class="cd-tab${i === 0 ? ' on' : ''}" data-key="${k}">${SCENES[k].tab}</button>`
  ).join('');

  const renderVerdict = s => {
    verdict.innerHTML = `<h3>${s.title}</h3>
      <p>${s.why}</p>
      <p class="cd-no">什么时候别用：${s.avoid}</p>
      <div class="rule-foot">${s.links.map(id =>
        `<a class="chip" href="effects.html#${id}">${id}</a>`).join('')}</div>`;
  };

  const select = key => {
    const s = SCENES[key];
    if (api) api.destroy();
    api = null;
    L.innerHTML = ''; R.innerHTML = '';
    current = key;
    tabsEl.querySelectorAll('.cd-tab').forEach(b => b.classList.toggle('on', b.dataset.key === key));
    badLabel.textContent = s.bad;
    goodLabel.textContent = s.good;
    renderVerdict(s);
    api = s.build(L, R);
    status.textContent = '静态态 · 点播放才跑';
    playBtn.textContent = '▶ 播放对比';
  };

  tabsEl.addEventListener('click', e => {
    const b = e.target.closest('.cd-tab');
    if (b && b.dataset.key !== current) select(b.dataset.key);
  });

  playBtn.addEventListener('click', () => {
    if (!api) return;
    api.play();
    status.textContent = '正在演示 · 可重复播放';
    playBtn.textContent = '↻ 再播一次';
  });

  copyBtn.addEventListener('click', async () => {
    if (!current) return;
    try {
      await navigator.clipboard.writeText(promptFor(SCENES[current]));
      copyBtn.textContent = '已复制给 AI ✓';
      setTimeout(() => { copyBtn.textContent = '复制这条判据给 AI'; }, 1600);
    } catch { copyBtn.textContent = '复制失败，请手动选中'; }
  });

  select(keys[0]);
}
