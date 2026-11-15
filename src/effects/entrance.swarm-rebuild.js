export default {
  id: 'swarm-rebuild', group: 'entrance', name: '光标群重建页面',
  lib: 'agent-build / swarm-site',
  desc: '一群带名牌的 AI 光标从中心飞出，逐个给页面块套上选框、标尺寸、打字/淡入，配 HUD 进度与「SIMULATION」标识，把整页一块块重建出来。机制提炼自 magnoscg/agent-build（MIT）与 swarm-site，原生 JS/CSS 独立实现；所有角色名与进度均为表演数据，不连接任何真实 Agent。',
  deps: '无',
  note: '四个坑：① 隐藏块必须用 visibility:hidden 而不是 opacity/display——前者保住布局，光标量到的框才不会在揭示时整体跳动；② 块坐标用 offsetLeft/offsetTop（布局坐标），别用 getBoundingClientRect，否则舞台被 fitPreview 缩放后 overlay 与块会错位；③ 帧时钟用 dt 累加而不是 setTimeout 链，暂停/跳过/低帧率都不会漂；④ 光标群是"每个 agent 各自领一个块"的并发队列，不是全局一个进度条——否则看起来只有一个人在干活。另外：全程要写清楚 SIMULATION（agent-build 的硬规矩），不能让访客以为真有 AI 在改页面；动态样式走 element.style / CSSOM，不拼 innerHTML。',

  scenes: { places: ['首屏', '发布会', '作品集'], goals: ['营造氛围', '内容呈现'], triggers: ['页面加载', '点击'], projects: ['AI 产品', '开发者工具', '品牌官网'] },
  code: `/* 帧时钟 + 并发 agent 队列（原生复刻，零依赖） */
let t = 0, prev = 0;
const tick = now => {
  const dt = Math.min(64, now - prev); prev = now;
  t += dt;
  for (const a of agents) {
    const job = jobs[a.job];
    if (!job) continue;
    const p = clamp01((t - a.t0) / DUR);          // 每个 agent 自己的进度
    moveCursor(a, job, p);                         // 从 hub 飞到块
    if (p > .55) drawBox(a, job);                  // 选框 + 尺寸
    if (p >= 1) { reveal(job); a.job = nextJob(); a.t0 = t; }
  }
  raf = requestAnimationFrame(tick);
};

/* 关键①：visibility 保布局；②：offset* 抗缩放；④：并发队列 */
for (const block of blocks) block.style.visibility = 'hidden';`,

  init(el, ctx) {
    const opts = ctx || {};
    const loop = opts.loop !== false;
    const agentCount = Math.max(3, Math.min(12, opts.count || 7));
    /* 降动效由调用方决定：effects 舞台默认跑（访客是专程来看机制的），
       正式接入页面时按 prefers-reduced-motion 传 reduce:true 即可。 */

    const host = el;

    /* 空舞台（effects.html 的 #mStage）：自己造一组演示块。
       传入已有内容的容器（ecosystem）时，直接用真实内容重建。 */
    const buildDemo = () => {
      const demo = document.createElement('div');
      demo.className = 'srb-demo';
      demo.style.cssText = 'padding:16px 18px;box-sizing:border-box;width:100%;height:100%;' +
        'font-family:system-ui,"Microsoft YaHei",sans-serif;color:#e8ecf4;' +
        'background:linear-gradient(160deg,#101320,#0a0c13);display:flex;flex-direction:column;gap:9px';
      const mk = (tag, text, css) => {
        const n = document.createElement(tag);
        n.textContent = text;
        n.style.cssText = css;
        return n;
      };
      demo.appendChild(mk('div', 'OVERVIEW / 状态总览', 'font:700 9px/1 ui-monospace,Consolas,monospace;letter-spacing:.18em;color:#8b93a4'));
      demo.appendChild(mk('h3', '整个网络，一屏看完', 'margin:0;font-size:17px;line-height:1.3;letter-spacing:-.02em'));
      demo.appendChild(mk('p', '38 台设备在线 · 2 条告警 · 上行 94 Mbps', 'margin:0;font-size:10.5px;line-height:1.5;color:#98a3b8'));
      const row = document.createElement('div');
      row.style.cssText = 'display:flex;gap:7px;margin-top:2px';
      for (const [t, v] of [['CPU', '12%'], ['MEM', '41%'], ['WAN', 'OK']]) {
        const card = document.createElement('div');
        card.style.cssText = 'flex:1;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:6px;padding:7px 9px';
        card.appendChild(mk('div', t, 'font:9px/1 ui-monospace,Consolas,monospace;color:#7b8494;letter-spacing:.1em'));
        card.appendChild(mk('div', v, 'margin-top:4px;font-size:14px;font-weight:700;color:#c3ea3a'));
        row.appendChild(card);
      }
      demo.appendChild(row);
      demo.appendChild(mk('span', '查看完整报告 ↗', 'margin-top:2px;font-size:10px;color:#9d8bff'));
      return demo;
    };

    let blocks = [...host.children].filter(n => !/^(SCRIPT|STYLE)$/.test(n.tagName));
    if (!blocks.length) { host.appendChild(buildDemo()); blocks = [...host.children]; }
    if (!blocks.length) return () => {};

    /* 降动效替代：内容照常可见，只留一句说明，不给舞台留空白 */
    if (opts.reduce === true) {
      const note = document.createElement('div');
      note.textContent = 'SIMULATION · 已按减少动效设置跳过动画';
      note.style.cssText = 'margin-top:10px;font:10px/1 ui-monospace,Consolas,monospace;' +
        'letter-spacing:.1em;color:#8b93a4';
      host.appendChild(note);
      return () => note.remove();
    }

    let STYLE = document.querySelector('style[data-fx="swarm-rebuild"]');
    if (!STYLE) {
      STYLE = document.createElement('style');
      STYLE.setAttribute('data-fx', 'swarm-rebuild');
      STYLE.textContent = [
      '.srb{position:relative;overflow:hidden}',
      '.srb-hud{position:absolute;left:10px;top:10px;z-index:8;display:flex;align-items:center;gap:8px;',
      '  font:10px/1 ui-monospace,Consolas,monospace;letter-spacing:.12em;color:#c6d0e0;',
      '  background:rgba(8,10,17,.9);border:1px solid rgba(255,255,255,.16);border-radius:6px;padding:6px 9px}',
      '.srb-hud b{color:#c3ea3a;font-weight:700}',
      '.srb-bar{position:absolute;left:0;right:0;bottom:0;height:2px;background:rgba(255,255,255,.12)}',
      '.srb-bar i{display:block;height:100%;width:0;background:linear-gradient(90deg,#6b4bff,#3ccbff)}',
      '.srb-cursor{position:absolute;left:0;top:0;z-index:7;pointer-events:none;will-change:transform}',
      '.srb-cursor svg{display:block;filter:drop-shadow(0 2px 4px rgba(0,0,0,.6))}',
      '.srb-tag{position:absolute;left:14px;top:14px;white-space:nowrap;font:9px/1 ui-monospace,Consolas,monospace;',
      '  letter-spacing:.1em;color:#0a0b0e;background:var(--c,#7c6bff);border-radius:3px;padding:3px 5px}',
      '.srb-box{position:absolute;z-index:6;pointer-events:none;border:1px dashed var(--c,#7c6bff);',
      '  box-shadow:0 0 0 1px rgba(0,0,0,.35) inset;opacity:0;transition:opacity .18s ease-out}',
      '.srb-box::before,.srb-box::after{content:"";position:absolute;width:5px;height:5px;',
      '  background:var(--c,#7c6bff);border-radius:1px}',
      '.srb-box::before{left:-3px;top:-3px}.srb-box::after{right:-3px;bottom:-3px}',
      '.srb-size{position:absolute;right:-1px;bottom:-16px;white-space:nowrap;',
      '  font:9px/1 ui-monospace,Consolas,monospace;color:#0a0b0e;background:var(--c,#7c6bff);',
      '  border-radius:2px;padding:2px 4px}',
      '.srb-ruler{position:absolute;left:0;right:0;top:0;height:14px;z-index:5;pointer-events:none;',
      '  opacity:.5;background:repeating-linear-gradient(90deg,rgba(255,255,255,.22) 0 1px,transparent 1px 20px)}',
      '.srb-live{position:absolute;right:10px;top:10px;z-index:8;',
      '  font:9px/1 ui-monospace,Consolas,monospace;letter-spacing:.16em;color:#8b93a4;',
      '  background:rgba(8,10,17,.9);border:1px solid rgba(255,255,255,.16);border-radius:6px;padding:6px 9px}'
    ].join('');
      document.head.appendChild(STYLE);
    }

    host.classList.add('srb');
    const W = () => host.clientWidth || 1;
    const H = () => host.clientHeight || 1;

    /* overlay 都挂在 host 内，跟着舞台一起被缩放，坐标用 offset* 布局值 */
    const layer = document.createElement('div');
    layer.className = 'srb-layer';
    layer.setAttribute('aria-hidden', 'true');
    layer.style.cssText = 'position:absolute;inset:0;z-index:5;pointer-events:none';
    host.appendChild(layer);

    const ruler = document.createElement('div');
    ruler.className = 'srb-ruler';
    layer.appendChild(ruler);

    const hud = document.createElement('div');
    hud.className = 'srb-hud';
    const hudName = document.createElement('b');
    hudName.textContent = 'SIMULATION';
    const hudText = document.createElement('span');
    hud.appendChild(hudName);
    hud.appendChild(hudText);
    layer.appendChild(hud);

    const live = document.createElement('div');
    live.className = 'srb-live';
    live.textContent = '● LIVE';
    layer.appendChild(live);

    const bar = document.createElement('div');
    bar.className = 'srb-bar';
    const barFill = document.createElement('i');
    bar.appendChild(barFill);
    layer.appendChild(bar);

    const COLORS = ['#8b7bff', '#3ccbff', '#c3ea3a', '#ff8fb1', '#7fd8c0'];
    const JOBS = blocks.map((node, i) => ({ node, i, done: false }));
    let next = 0;
    const takeJob = () => (next < JOBS.length ? JOBS[next++] : null);

    const agents = [];
    for (let i = 0; i < agentCount; i++) {
      const c = document.createElement('div');
      c.className = 'srb-cursor';
      c.style.setProperty('--c', COLORS[i % COLORS.length]);
      c.style.transition = 'opacity .3s ease-out';
      /* 不用 innerHTML 拼节点：用 SVG DOM（严格 CSP 下也不碰 Trusted Types） */
      const NS = 'http://www.w3.org/2000/svg';
      const svg = document.createElementNS(NS, 'svg');
      svg.setAttribute('width', '16'); svg.setAttribute('height', '20');
      svg.setAttribute('viewBox', '0 0 16 20');
      const path = document.createElementNS(NS, 'path');
      path.setAttribute('d', 'M1 1l13 8-6 1.2 3.2 5.6-2.6 1.5-3.2-5.6L1 16z');
      path.setAttribute('fill', COLORS[i % COLORS.length]);
      path.setAttribute('stroke', '#0a0b0e'); path.setAttribute('stroke-width', '1.2');
      path.setAttribute('stroke-linejoin', 'round');
      svg.appendChild(path);
      c.appendChild(svg);
      const tag = document.createElement('span');
      tag.className = 'srb-tag';
      tag.style.setProperty('--c', COLORS[i % COLORS.length]);
      tag.textContent = 'AGENT ' + String(i + 1).padStart(2, '0');
      c.appendChild(tag);
      layer.appendChild(c);

      const box = document.createElement('div');
      box.className = 'srb-box';
      box.style.setProperty('--c', COLORS[i % COLORS.length]);
      const size = document.createElement('span');
      size.className = 'srb-size';
      box.appendChild(size);
      layer.appendChild(box);

      agents.push({ c, box, size, job: null, t0: 0, hx: W() / 2, hy: H() / 2 });
    }

    /* 隐藏所有块：visibility 保布局，原子不占位也不塌 */
    const saved = blocks.map(b => ({ node: b, vis: b.style.visibility }));
    for (const b of blocks) b.style.visibility = 'hidden';

    const place = (agent, job, p) => {
      const bx = job.node.offsetLeft, by = job.node.offsetTop;
      /* ease-out：先冲后稳 */
      const e = 1 - Math.pow(1 - p, 3);
      const x = agent.hx + (bx - agent.hx) * e;
      const y = agent.hy + (by - agent.hy) * e;
      agent.c.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
      if (p > .5) {
        const w = job.node.offsetWidth, h = job.node.offsetHeight;
        agent.box.style.left = bx + 'px';
        agent.box.style.top = by + 'px';
        agent.box.style.width = w + 'px';
        agent.box.style.height = h + 'px';
        agent.box.style.opacity = '1';
        agent.size.textContent = w + ' × ' + h;
      } else {
        agent.box.style.opacity = '0';
      }
    };

    const reveal = job => {
      job.node.style.visibility = 'visible';
      job.done = true;
    };

    const DUR = Math.max(60, opts.dur || 620);
    let t = 0, prev = 0, raf = 0, finished = false, cycleDone = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      for (const b of blocks) b.style.visibility = 'visible';
      for (const a of agents) { a.c.style.opacity = '0'; a.box.style.opacity = '0'; }
      hud.style.opacity = '0'; live.style.opacity = '0'; ruler.style.opacity = '0';
      barFill.style.width = '100%';
      if (typeof opts.onDone === 'function') opts.onDone();
      if (!loop) {
        /* 一次性模式：淡出后把 overlay 整个摘掉，不留残影 */
        setTimeout(() => { if (layer.parentNode) layer.remove(); }, 500);
      }
    };

    const reset = () => {
      finished = false; cycleDone = false;
      next = 0;
      for (const j of JOBS) j.done = false;
      for (const b of blocks) b.style.visibility = 'hidden';
      for (const a of agents) {
        a.job = takeJob(); a.t0 = t; a.box.style.opacity = '0'; a.c.style.opacity = '1';
      }
      hud.style.opacity = '1'; live.style.opacity = '1'; ruler.style.opacity = '';
      barFill.style.width = '0';
    };

    const tick = now => {
      const dt = prev ? Math.min(64, now - prev) : 16;
      prev = now;
      t += dt;

      let doneCount = 0;
      for (const a of agents) {
        if (a.job) {
          const p = Math.min(1, (t - a.t0) / DUR);
          place(a, a.job, p);
          if (p >= 1) {
            reveal(a.job);
            a.hx = a.job.node.offsetLeft; a.hy = a.job.node.offsetTop;
            a.job = takeJob(); a.t0 = t;
            if (a.job) a.box.style.opacity = '0';
          }
        }
        if (!a.job) a.c.style.opacity = '0';
      }
      for (const j of JOBS) if (j.done) doneCount++;
      const prog = doneCount / JOBS.length;
      barFill.style.width = (prog * 100).toFixed(1) + '%';
      hudText.textContent = ' ' + doneCount + ' / ' + JOBS.length + ' 块 · ' + agentCount + ' agents';

      if (doneCount === JOBS.length && !cycleDone) {
        cycleDone = true;
        finish();
        if (loop) setTimeout(() => { if (raf) reset(); }, 1400);
        else { raf = 0; return; }
      }
      raf = requestAnimationFrame(tick);
    };

    reset();
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      raf = 0;
      for (const s of saved) s.node.style.visibility = s.vis;
      layer.remove();
      host.classList.remove('srb');
      /* STYLE 是同页所有实例共用的，谁都不许摘，留着无害 */
    };
  }
};
