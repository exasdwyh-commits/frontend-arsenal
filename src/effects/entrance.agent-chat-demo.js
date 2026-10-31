export default {
  id: 'agent-chat-demo', group: 'entrance', name: '假 AI 对话演示',
  lib: 'Overflow Design',
  desc: '落地页上的"AI 正在干活"对话演示：用户提示逐字打入 → 工具调用卡（search_drawings 查询、返回 3 个结果、246ms 耗时）→ 文件卡（get_drawings 拉回 SVG）→ 助手回复流式吐出 → 停留 → 整段清空循环。机制提炼自 Overflow Design（overflow.design）首页的 MCP 演示（"agent 用它的 MCP 服务器找图标"的对话动画），原生 JS/CSS 独立实现；所有数字与结果均为表演数据，非真实调用。',
  note: '核心是用一个帧时钟（rAF 累计时间）驱动分段进度：每个段有 start/end，进度 = (t-start)/(end-start)，比 setTimeout 链可暂停可跳帧。第二个坑：流式文本必须用 textContent 逐字追加，绝不能把已输出内容拼回 innerHTML 重写——一旦文本里含 < 或 & 就是自造的 XSS，而且每帧重建节点会把光标动画打断。第三个坑：循环重启要重置光标位置和滚动容器 scrollTop，只清文本不清状态的话第二轮会接着上一轮的时钟走。表演数据（246ms、结果数）要写死常量别假装真实计时。',

  scenes: { places: ['官网', '落地页', '文档'], goals: ['内容呈现', '转化'], triggers: ['滚动'], projects: ['开发者工具', '素材站', 'AI 产品'] },
  code: `/* 假 AI 对话演示（提炼自 overflow.design 首页 MCP 演示，vanilla 复刻） */
/* 帧时钟驱动分段：每段有 start/end，进度 = (t-start)/(end-start)，可暂停可跳帧 */
const SEGS = [
  { kind: 'type-user', at: [0.0, 2.4] },     // 用户提示逐字打入
  { kind: 'tool-card', at: [2.8, 5.6] },     // 工具调用卡展开
  { kind: 'file-card', at: [6.0, 8.2] },     // 文件卡
  { kind: 'type-bot',  at: [8.6, 12.0] },    // 助手回复流式
  { kind: 'hold',      at: [12.0, 14.5] },   // 停留
];
let t = 0;
const tick = (dt) => {
  t = (t + dt) % CYCLE;
  for (const s of SEGS) {
    const p = clamp((t - s.at[0]) / (s.at[1] - s.at[0]), 0, 1);
    render(s.kind, p);
  }
};

/* 坑②：textContent 逐字追加，绝不 innerHTML 重写已输出文本 */
out.textContent = full.slice(0, Math.floor(full.length * p));

/* 坑③：循环重启要重置光标与滚动，不然第二轮接上一轮的时钟 */
if (t < prev) { out.textContent = ''; log.scrollTop = 0; }`,

  init(el) {
    const STYLE = `<style data-fx="agent-chat-demo">
      .acd{width:100%;box-sizing:border-box;background:#2b2b2b;padding:16px;
        font-family:system-ui,-apple-system,"Segoe UI",sans-serif;color:#d8d8d8}
      .acd-win{background:#f7f6f3;border-radius:10px;overflow:hidden;box-shadow:0 6px 22px rgba(0,0,0,.35)}
      .acd-bar{display:flex;align-items:center;gap:6px;padding:8px 12px;background:#ecebe7;
        box-shadow:inset 0 -1px 0 rgba(0,0,0,.07)}
      .acd-dot{width:9px;height:9px;border-radius:50%;background:#d5d3cd}
      .acd-url{flex:1;text-align:center;font-size:10px;color:#9a978f}
      .acd-body{height:236px;overflow-y:auto;padding:14px 16px;display:flex;flex-direction:column;gap:10px;
        scrollbar-width:thin}
      .acd-msg{max-width:88%;font-size:12px;line-height:1.55;border-radius:8px;padding:7px 10px;
        animation:acdIn .25s ease-out both}
      @keyframes acdIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
      .acd-user{align-self:flex-end;background:#3b3936;color:#fff}
      .acd-bot{align-self:flex-start;background:#fff;color:#2b2926;box-shadow:0 1px 2px rgba(0,0,0,.08)}
      .acd-caret{display:inline-block;width:7px;height:12px;margin-left:1px;vertical-align:-2px;
        background:#3b3936;animation:acdBlink .7s steps(1) infinite}
      @keyframes acdBlink{50%{opacity:0}}
      .acd-tool{align-self:flex-start;width:88%;box-sizing:border-box;background:#fff;border-radius:8px;
        box-shadow:0 1px 2px rgba(0,0,0,.08);overflow:hidden;font-family:ui-monospace,Menlo,Consolas,monospace;
        animation:acdIn .25s ease-out both}
      .acd-tool-h{display:flex;align-items:center;gap:6px;padding:6px 10px;background:#f0efeb;
        font-size:10px;color:#6c6a63;box-shadow:inset 0 -1px 0 rgba(0,0,0,.06)}
      .acd-tool-h b{font-weight:600;color:#2b2926}
      .acd-badge{margin-left:auto;background:#dff3e2;color:#1d7a3d;border-radius:4px;padding:2px 6px;font-size:9px}
      .acd-ms{color:#8f8d86}
      .acd-q{padding:7px 10px;font-size:10.5px;color:#3b3936;border-bottom:1px solid rgba(0,0,0,.06)}
      .acd-q .k{color:#9a5b13}
      .acd-res{padding:6px 10px;font-size:10px;color:#6c6a63;display:flex;flex-direction:column;gap:3px}
      .acd-res i{font-style:normal;color:#2b2926}
      .acd-tag{display:inline-block;border-radius:3px;padding:0 4px;font-size:8.5px;margin-left:4px}
      .acd-free{background:#e3eefb;color:#1c5bb0}
      .acd-pro{background:#f3e9fb;color:#7226b8}
      .acd-file{display:flex;align-items:center;gap:8px;padding:7px 10px;font-size:10px;color:#3b3936}
      .acd-file .sz{margin-left:auto;color:#8f8d86}
      .acd-chip{width:16px;height:16px;flex:none;border-radius:3px;background:#2b2926}
      .acd-hint{font-size:10.5px;color:#8a8a8a;line-height:1.8;margin-top:12px}
    </style>`;

    const USER_TXT = 'Find icons for a calendar and a shopping cart';
    const BOT_TXT = 'Found both — calendar-3 and cart, in the regular set. Free to copy.';

    el.insertAdjacentHTML('beforeend', STYLE + `
      <div class="acd">
        <div class="acd-win">
          <div class="acd-bar"><span class="acd-dot"></span><span class="acd-dot"></span><span class="acd-dot"></span>
            <span class="acd-url">overflow.design</span></div>
          <div class="acd-body" id="acdLog">
            <div class="acd-msg acd-user" id="acdUser"><span id="acdUserT"></span><span class="acd-caret" id="acdC1"></span></div>
            <div id="acdTool" style="display:none;align-self:flex-start;width:88%">
              <div class="acd-tool">
                <div class="acd-tool-h"><b>search_drawings</b> <span class="acd-ms">246 ms</span><span class="acd-badge">done</span></div>
                <div class="acd-q"><span class="k">q</span> = "calendar" · <span class="k">q</span> = "shopping cart" · <span class="k">set</span> = regular</div>
                <div class="acd-res" id="acdRes"></div>
              </div>
            </div>
            <div id="acdFile" style="display:none;align-self:flex-start;width:88%">
              <div class="acd-tool">
                <div class="acd-tool-h"><b>get_drawings</b> <span class="acd-ms">2 ids</span><span class="acd-badge">done</span></div>
                <div class="acd-file"><span class="acd-chip"></span>calendar-3.svg<span class="sz">1.2 KB</span></div>
                <div class="acd-file"><span class="acd-chip"></span>cart.svg<span class="sz">0.9 KB</span></div>
              </div>
            </div>
            <div class="acd-msg acd-bot" id="acdBot"><span id="acdBotT"></span><span class="acd-caret" id="acdC2" style="display:none"></span></div>
          </div>
        </div>
        <div class="acd-hint">逐字打入 → 工具卡（查询 / 结果 / 耗时）→ 文件卡 → 流式回复 → 停留 → 清空循环。所有数字与结果均为表演数据，非真实调用。</div>
      </div>`);

    const log = el.querySelector('#acdLog');
    const userT = el.querySelector('#acdUserT');
    const c1 = el.querySelector('#acdC1');
    const toolBox = el.querySelector('#acdTool');
    const resBox = el.querySelector('#acdRes');
    const fileBox = el.querySelector('#acdFile');
    const botT = el.querySelector('#acdBotT');
    const c2 = el.querySelector('#acdC2');
    const botMsg = el.querySelector('#acdBot');

    const RESULTS = [
      ['calendar-3', 'Calendar · 24×24', 'free'],
      ['calendar-dot', 'Calendar dot · 24×24', 'pro'],
      ['cart', 'Cart · 24×24', 'free'],
    ];
    // 预渲染结果行（避免每帧重建）
    resBox.innerHTML = RESULTS.map(([n, d, t2]) =>
      '<i>' + n + '<span class="acd-tag acd-' + t2 + '">' + t2.toUpperCase() + '</span></i><span>' + d + '</span>').join('');

    const SEGS = [
      { at: [0.0, 2.4], fn: (p) => { userT.textContent = USER_TXT.slice(0, Math.floor(USER_TXT.length * p)); } },
      { at: [2.8, 5.6], fn: (p) => { toolBox.style.display = p > 0 ? '' : 'none'; } },
      { at: [6.0, 8.2], fn: (p) => { fileBox.style.display = p > 0 ? '' : 'none'; } },
      { at: [8.6, 12.0], fn: (p) => {
        botMsg.style.display = p > 0 ? '' : 'none';   // 坑：到点前不显示空消息气泡
        c2.style.display = p > 0 && p < 1 ? '' : 'none';
        botT.textContent = BOT_TXT.slice(0, Math.floor(BOT_TXT.length * p));  // textContent 防 XSS
      } },
      { at: [12.0, 14.5], fn: () => {} },
    ];
    const CYCLE = 15.0;
    let t = 0, last = 0, raf = 0, running = true;
    const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

    const render = () => {
      for (const s of SEGS) {
        const p = clamp((t - s.at[0]) / (s.at[1] - s.at[0]), 0, 1);
        s.fn(p);
      }
      c1.style.display = t < 2.4 ? '' : 'none';
      log.scrollTop = log.scrollHeight;   // 坑③：每帧把新消息滚进视野
    };

    const loop = (now) => {
      if (!running) return;
      if (!last) last = now;
      const dt = Math.min(0.05, (now - last) / 1000);   // 上限防切回标签页后跳帧
      last = now;
      const prev = t;
      t += dt;
      if (t >= CYCLE) {                                  // 坑③：循环重启重置状态
        t -= CYCLE;
        userT.textContent = ''; botT.textContent = '';
        log.scrollTop = 0;
      }
      render();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      el.innerHTML = '';
    };
  }
};
