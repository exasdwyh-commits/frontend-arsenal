export default {
  id: 'pro-material', group: 'feedback', name: 'ProUI 材质配方',
  lib: 'ProUI',
  desc: '专业工具软件的控件材质配方：控件放在中灰面板（约 #414141）上，填充是相对的"白 15%"半透明平涂，顶部一道内高光、四边一条发丝暗描边、底下 1px 投影；深色面板上按下变亮，动作条上按下变暗。机制提炼自 ProUI（pro-ui.dev）公开文档的材质配方，原生 CSS 独立实现。',
  note: '三个坑：① 填充必须是相对值（white 15%）而不是固定灰——换一块更亮或更暗的面板，按钮自动跟着协调，写死 #555 在浅色面板上会像补丁；② 顶内光是"透过填充自身透明度合成"的 35% 白，neutral 填充下折算只有 5.25% 有效不透明度，直接画一条 35% 白线会像塑料反光；③ 按压方向不能反：深色面板上的按钮按下要变亮（往光源抬），动作条上的按钮按下要变暗（往面板压），反了就失去"被按进表面"的物理感。',
  scenes: { places: ['工具栏', '面板', '表单'], goals: ['操作反馈', '风格统一'], triggers: ['悬停', '点击'], projects: ['专业工具', '桌面应用', '编辑器'] },
  code: `/* ProUI 材质配方（提炼自 pro-ui.dev 公开文档，vanilla 复刻） */
/* 面板先给一块中灰：相对填充靠它才协调 */
.pro-panel { background:#414141; border-radius:8px; padding:18px }

.pro-btn {
  height:25px; padding:0 12px; border-radius:5px;
  font:500 12px/1 system-ui; color:#e8e8e8;
  /* ① 相对填充：白 15% 半透明，不是固定灰 */
  background:rgba(255,255,255,.15);
  /* ② 顶内光 + 发丝暗描边：inset 上 1px 35% 白（折算 5.25% 有效），四周 1px 黑 35% */
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.35),
    inset 0 0 0 1px rgba(0,0,0,.35);
  /* ③ 底下 1px 投影 */
  filter:drop-shadow(0 1px 1px rgba(0,0,0,.25));
  border:0; cursor:pointer;
  transition:background .12s ease-out;
}
/* ④ 按压方向：深色面板上变亮 */
.pro-btn:active { background:rgba(255,255,255,.24) }
/* 动作条（更亮的面）上反而变暗 */
.pro-bar .pro-btn:active { background:rgba(0,0,0,.32) }

/* ⑤ 成组按钮方角合并，只留一条外描边 */
.pro-group { display:flex }
.pro-group .pro-btn { border-radius:0; margin-left:-1px }
.pro-group .pro-btn:first-child { border-radius:5px 0 0 5px; margin-left:0 }
.pro-group .pro-btn:last-child  { border-radius:0 5px 5px 0 }`,

  init(el) {
    const STYLE = `<style data-fx="pro-material">
      .pm{width:100%;box-sizing:border-box;background:#2b2b2b;padding:14px;
        font-family:system-ui,-apple-system,"Segoe UI",sans-serif}
      .pm-panel{background:#414141;border-radius:8px;padding:18px 20px;color:#d8d8d8}
      .pm-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
      .pm-row+.pm-row{margin-top:16px}
      .pm-cap{font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:#9a9a9a;width:100%;margin-bottom:2px}
      .pm-btn{height:25px;padding:0 12px;border-radius:5px;border:0;cursor:pointer;
        font:500 12px/1 system-ui,sans-serif;color:#e8e8e8;background:rgba(255,255,255,.15);
        box-shadow:inset 0 1px 0 rgba(255,255,255,.35),inset 0 0 0 1px rgba(0,0,0,.35);
        outline-offset:2px;transition:background .12s ease-out}
      .pm-btn:hover{background:rgba(255,255,255,.19)}
      .pm-btn:active{background:rgba(255,255,255,.26)}
      .pm-btn:focus-visible{box-shadow:inset 0 1px 0 rgba(255,255,255,.35),inset 0 0 0 1px rgba(0,0,0,.35),0 0 0 2px #7ab8ff}
      .pm-btn.sm{height:22px;font-size:11px;padding:0 10px}
      .pm-btn.lg{height:32px;font-size:13px;padding:0 16px}
      .pm-btn.on{background:#5F3BFF;color:#fff;box-shadow:inset 0 1px 0 rgba(255,255,255,.45),inset 0 0 0 1px rgba(0,0,0,.4)}
      .pm-btn[disabled]{opacity:.4;cursor:default}
      .pm-grp{display:flex}
      .pm-grp .pm-btn{border-radius:0;margin-left:-1px}
      .pm-grp .pm-btn:first-child{border-radius:5px 0 0 5px;margin-left:0}
      .pm-grp .pm-btn:last-child{border-radius:0 5px 5px 0}
      .pm-bar{margin-top:16px;background:#4d4d4d;border-radius:8px;padding:12px 20px;
        display:flex;align-items:center;gap:10px;flex-wrap:wrap}
      .pm-bar .pm-cap{color:#b6b6b6}
      .pm-bar .pm-btn:active{background:rgba(0,0,0,.32)}
      .pm-hint{margin-top:12px;font-size:10.5px;color:#8a8a8a}
    </style>`;
    el.insertAdjacentHTML('beforeend', STYLE + `
      <div class="pm">
        <div class="pm-panel">
          <div class="pm-row"><span class="pm-cap">三档高度 · 22 / 25 / 32px · 相对白 15% 填充</span>
            <button class="pm-btn sm">小 22</button>
            <button class="pm-btn">标准 25</button>
            <button class="pm-btn lg">大 32</button>
            <button class="pm-btn" disabled>禁用</button>
          </div>
          <div class="pm-row"><span class="pm-cap">激活态走实色 activeTint · 成组方角合并只留一条外描边</span>
            <div class="pm-grp">
              <button class="pm-btn on" data-tg>画笔</button>
              <button class="pm-btn" data-tg>橡皮</button>
              <button class="pm-btn" data-tg>取色</button>
              <button class="pm-btn" data-tg>裁切</button>
            </div>
          </div>
        </div>
        <div class="pm-bar">
          <span class="pm-cap">动作条上的按钮：按下变暗（往面板压）</span>
          <button class="pm-btn">上一帧</button>
          <button class="pm-btn">播放</button>
          <button class="pm-btn">下一帧</button>
        </div>
        <div class="pm-hint">在深色面板上按住按钮感受"变亮"，到下面动作条上按住感受"变暗"——方向相反，物理感才对。</div>
      </div>`);

    const btns = el.querySelectorAll('[data-tg]');
    const onClick = (e) => {
      for (const b of btns) b.classList.toggle('on', b === e.currentTarget);
    };
    for (const b of btns) b.addEventListener('click', onClick);

    return () => {
      for (const b of btns) b.removeEventListener('click', onClick);
      el.innerHTML = '';
    };
  }
};
