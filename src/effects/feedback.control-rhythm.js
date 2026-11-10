export default {
  id: 'control-rhythm', group: 'feedback', name: '控件节奏与扩区点击',
  lib: 'Astryx',
  desc: '一行里混排固定高度按钮、内容自适应选择器、紧凑图标按钮：共享基线与表观高度形成节奏；紧凑控件视觉只有 24px，但点击区用伪元素向外扩到 44px——视觉尺寸和目标尺寸是两回事。机制提炼自 Astryx（meta/astryx，Meta 开源设计系统）公开文档 control-rhythm.md 的 DR1–DR4 规则，原生 CSS 独立实现，带点击区可视化开关。',
  deps: '无',
  note: '三个坑：① 扩点击区必须用伪元素 inset 负值外扩（::after{position:absolute;inset:-10px}），不能给按钮加 padding——padding 会改表观高度破坏节奏（DR2 要求尺寸和密度一起调），也别用 outline；② 相邻控件的扩区会互相重叠，重叠区的点击归属由 DOM 顺序决定（后画的盖上面），要么给控件间留出 ≥2×扩量的间隙，要么把整行做成一个带分段热区的容器；③ 基线对齐别用 align-items:center——不同字号的控件行盒底不齐，用 align-items:baseline（或统一高度 + 统一 line-height），图标要跟文字基线对齐得算 descender，垂直居中只是"看起来差不多"。焦点环画在视觉轮廓上（focus-visible 贴元素本体），画到扩区边界会看起来错位。',

  scenes: { places: ['工具栏', '表单', '面板'], goals: ['效率', '操作反馈', '风格统一'], triggers: ['点击'], projects: ['专业工具', '编辑器', '移动端'] },
  code: `/* 控件节奏与扩区点击（提炼自 meta/astryx control-rhythm.md DR1–DR4，vanilla 复刻） */
/* 坑①：扩区用伪元素，不加 padding——padding 会改表观高度破坏节奏 */
.cmp-btn { position:relative; height:24px; padding:0 9px; }   /* 视觉紧凑 */
.cmp-btn::after { content:''; position:absolute;
  inset:-10px;                    /* 四向外扩 10px → 44px 目标 */
  pointer-events:auto; }

/* 坑②：相邻扩区重叠 → 点击归属看 DOM 顺序；留 2×扩量 间隙或整行一个热区容器 */
.cmp-row { display:flex; gap:24px; }   /* 24px ≥ 2×10px 扩量 */

/* 坑③：基线对齐用 baseline 不用 center（DR1 共享基线） */
.cmp-row { display:flex; align-items:baseline; }
.cmp-fixed  { height:32px; }           /* 固定高度：可预测轮廓 */
.cmp-auto   { height:auto; }           /* 内容自适应：密度向行节奏看齐（DR2） */

/* DR4：视觉小、目标大——焦点环仍贴视觉轮廓 */
.cmp-btn:focus-visible { outline:2px solid #5F3BFF; outline-offset:2px; }`,

  init(el) {
    const STYLE = `<style data-fx="control-rhythm">
      .cr{width:100%;box-sizing:border-box;background:#2b2b2b;padding:16px;
        font-family:system-ui,-apple-system,"Segoe UI",sans-serif;color:#d8d8d8}
      .cr-bar{display:flex;align-items:center;gap:12px;margin-bottom:12px;flex-wrap:wrap}
      .cr-lb{font-size:10px;letter-spacing:.06em;text-transform:uppercase;color:#9a9a9a}
      .cr-sw{display:flex;align-items:center;gap:6px;font-size:11px;color:#b6b6b6;cursor:pointer}
      .cr-sw input{accent-color:#5F3BFF}
      .cr-stat{margin-left:auto;font:500 10.5px/1 ui-monospace,Menlo,Consolas,monospace;color:#8f8f8f;
        background:rgba(0,0,0,.22);border-radius:5px;padding:5px 9px}
      /* ---- 对照：没有节奏的散装行 ---- */
      .cr-stage{background:#414141;border-radius:8px;padding:14px;display:flex;flex-direction:column;gap:13px}
      .cr-cap{font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:#9a9a9a}
      .cr-cap .ok{color:#6ee29a}.cr-cap .no{color:#ff8f8f}
      .cr-raw{display:flex;align-items:center;gap:9px;flex-wrap:wrap}
      .cr-raw .b1{height:30px;padding:0 12px;border:0;border-radius:5px;font:500 11.5px/1 system-ui,sans-serif;
        background:#5F3BFF;color:#fff}
      .cr-raw .b2{height:22px;padding:0 6px;border:0;border-radius:4px;font:400 10px/1 system-ui,sans-serif;
        background:rgba(255,255,255,.14);color:#c9c9c9}
      .cr-raw .sel{font-size:13px;padding:2px 4px;background:rgba(255,255,255,.1);border-radius:4px;color:#e8e8e8}
      .cr-raw .ib{width:20px;height:20px;border:0;border-radius:50%;background:rgba(255,255,255,.18);
        color:#e8e8e8;font-size:11px;cursor:pointer}
      /* ---- 节奏版：共享基线 + 统一表观高度 ---- */
      .cr-row{position:relative;display:flex;align-items:baseline;gap:24px;   /* 坑③：baseline；坑②：2×扩量间隙 */
        padding:7px 2px;border-radius:6px}
      .cr-fixed{position:relative;flex:none;white-space:nowrap;height:26px;padding:0 11px;border:0;border-radius:5px;cursor:pointer;
        font:500 11.5px/26px system-ui,sans-serif;background:#5F3BFF;color:#fff;
        box-shadow:inset 0 1px 0 rgba(255,255,255,.35)}
      .cr-auto{position:relative;flex:none;white-space:nowrap;border:0;border-radius:5px;cursor:pointer;padding:4px 10px;
        font:400 11.5px/1.4 system-ui,sans-serif;background:rgba(255,255,255,.14);color:#e8e8e8;
        box-shadow:inset 0 1px 0 rgba(255,255,255,.25)}
      .cr-compact{position:relative;flex:none;width:22px;height:22px;padding:0;border:0;border-radius:50%;cursor:pointer;
        font:600 11px/22px system-ui,sans-serif;background:rgba(255,255,255,.18);color:#e8e8e8}
      .cr-fixed:hover,.cr-auto:hover,.cr-compact:hover{filter:brightness(1.15)}
      .cr-fixed:active,.cr-auto:active,.cr-compact:active{filter:brightness(.9)}
      .cr-fixed:focus-visible,.cr-auto:focus-visible,.cr-compact:focus-visible{
        outline:2px solid #7ab8ff;outline-offset:2px}    /* 焦点环贴视觉轮廓，不画到扩区 */
      /* 扩区：伪元素外扩，视觉不变 */
      .cr-fixed::after,.cr-auto::after,.cr-compact::after{content:'';position:absolute;inset:-10px}
      /* 可视化：显示每个控件的真实点击区 */
      .cr.show .cr-fixed::after,.cr.show .cr-auto::after,.cr.show .cr-compact::after{
        outline:1px dashed rgba(255,180,84,.85);outline-offset:0;background:rgba(255,180,84,.07)}
      .cr-note{font-size:9.5px;color:#8f8f8f;margin-top:8px;display:flex;gap:14px;flex-wrap:wrap}
      .cr-note b{color:#ffb454;font-weight:500}
      .cr-hint{font-size:10.5px;color:#8a8a8a;line-height:1.8;margin-top:11px}
    </style>`;
    el.insertAdjacentHTML('beforeend', STYLE + `
      <div class="cr">
        <div class="cr-bar">
          <label class="cr-sw"><input type="checkbox" data-show> 显示真实点击区</label>
          <span class="cr-stat" data-stat>视觉 22px · 目标 42px</span>
        </div>
        <div class="cr-stage">
          <div class="cr-cap"><span class="no">散装</span> 高度、字号、对齐各管各的</div>
          <div class="cr-raw">
            <button class="b1">发布</button>
            <select class="sel"><option>中</option></select>
            <button class="b2">草稿</button>
            <button class="ib">⋯</button>
            <span style="font-size:10px;color:#8a8a8a">← 基线不齐、密度失控</span>
          </div>
          <div class="cr-cap"><span class="ok">节奏</span> 共享基线 · 表观密度一致 · 紧凑控件外扩点击区</div>
          <div class="cr-row" data-row>
            <button class="cr-fixed">发布</button>
            <button class="cr-auto">草稿并通知评审者</button>
            <button class="cr-compact" title="更多">⋯</button>
            <button class="cr-compact" title="删除">×</button>
          </div>
          <div class="cr-note">
            <span><b>虚线框</b> = 伪元素外扩后的真实点击区（视觉尺寸不变）</span>
            <span>Tab 聚焦观察：焦点环贴着按钮本体，不跑扩区边界</span>
          </div>
        </div>
        <div class="cr-hint">勾上"显示真实点击区"：三个按钮的橙色虚线热区都比本体大一圈（22px 视觉 / 42px 目标，DR4）；行内基线对齐让 26px 固定按钮和内容自适应按钮底边一致（DR1），控件间 24px 间隙保证热区不重叠（坑②）。</div>
      </div>`);

    const wrap = el.querySelector('.cr');
    const stat = el.querySelector('[data-stat]');
    const sw = el.querySelector('[data-show]');
    const cleanups = [];

    const onSw = () => {
      wrap.classList.toggle('show', sw.checked);
      stat.textContent = sw.checked ? '热区已显示 · 22px 视觉 / 42px 目标' : '视觉 22px · 目标 42px';
    };
    sw.addEventListener('change', onSw);
    cleanups.push(() => sw.removeEventListener('change', onSw));

    // 记录一次点击归属，验证扩区重叠时的 DOM 顺序规则（坑②）
    const row = el.querySelector('[data-row]');
    const onClick = (e) => {
      const b = e.target.closest('button');
      if (b) stat.textContent = '点到「' + (b.title || b.textContent.trim()) + '」· 扩区按 DOM 顺序归属';
    };
    row.addEventListener('click', onClick);
    cleanups.push(() => row.removeEventListener('click', onClick));

    return () => { for (const c of cleanups) c(); el.innerHTML = ''; };
  }
};
