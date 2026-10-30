export default {
  id: 'button-morph', group: 'feedback', name: '按钮四态形变', lib: '纯 CSS',
  desc: '一个按钮在 idle→busy→done→error 之间自己变形：收起成圆点转圈、打勾、报错弹回。',
  deps: '无',
  note: '两个坑：① busy 收缩用 max-width 而不是 width，否则文字会瞬间挤压变形；② done 状态必须延迟 480ms 才淡出，要等打勾画完，早了等于没看见；③ 动画后文字 opacity 归 0 时，aria-label 必须还在，否则读屏拿不到按钮名。',
  code: `/* busy：收成圆点 */
.btn[data-state="busy"]{ max-width:40px; padding:0; border-radius:999px; }
.btn[data-state="busy"] .lbl{ animation:lbl-out .22s both; }   /* blur+scale 淡出 */

@keyframes lbl-out{ to{ opacity:0; filter:blur(4px); transform:scale(.8); } }
@keyframes lbl-in { from{ opacity:0; filter:blur(4px); transform:scale(.8); } }
@keyframes draw   { from{ stroke-dashoffset:24; } to{ stroke-dashoffset:0; } }

/* done：打勾描出来，480ms 后再展开回文字 */
.btn[data-state="done"]{ max-width:100%;
  transition: max-width .56s cubic-bezier(.32,.72,0,1) 480ms; }
.btn[data-state="done"] path{ stroke-dasharray:24;
  animation:draw .56s cubic-bezier(.22,1,.36,1) 80ms both; }`,
  init(el) {
    el.innerHTML = `<button id="bm" aria-label="保存" style="position:relative;overflow:hidden;
      display:inline-flex;align-items:center;justify-content:center;
      min-width:40px;max-width:100%;padding:11px 26px;border:0;border-radius:9px;
      background:#5F3BFF;color:#fff;font-size:12.5px;cursor:pointer;
      transition:max-width .56s cubic-bezier(.32,.72,0,1),padding .3s ease,background .3s">
      <span id="bmLbl" style="white-space:nowrap">保存方案</span>
      <svg id="bmGlyph" width="20" height="20" viewBox="0 0 24 24" fill="none"
        style="position:absolute;left:50%;top:50%;margin:-10px 0 0 -10px;opacity:0">
        <path id="bmPath" d="M5 12.5l4.5 4.5L19 7.5" stroke="#fff" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="24" stroke-dashoffset="24"/>
      </svg></button>
      <div id="bmState" style="position:absolute;bottom:12px;font-size:10px;color:#5b6478"></div>`;
    const btn = el.querySelector('#bm'), lbl = el.querySelector('#bmLbl'),
          glyph = el.querySelector('#bmGlyph'), path = el.querySelector('#bmPath'),
          tag = el.querySelector('#bmState');
    const st = document.createElement('style');
    st.textContent = `
      @keyframes bmLblOut{to{opacity:0;filter:blur(4px);transform:scale(.8)}}
      @keyframes bmLblIn{from{opacity:0;filter:blur(4px);transform:scale(.8)}}
      @keyframes bmDraw{from{stroke-dashoffset:24}to{stroke-dashoffset:0}}
      @keyframes bmSpin{to{transform:rotate(360deg)}}`;
    el.appendChild(st);

    let timer, phase = 0;
    const setState = s => {
      tag.textContent = 'state: ' + s;
      btn.dataset.state = s;
      lbl.style.animation = 'none';
      glyph.style.animation = 'none';
      path.style.animation = 'none';
      void btn.offsetWidth;
      if (s === 'idle') {
        btn.style.maxWidth = '100%'; btn.style.padding = '11px 26px';
        btn.style.background = '#5F3BFF';
        lbl.style.animation = 'bmLblIn .56s cubic-bezier(.22,1,.36,1) both';
        glyph.style.opacity = 0;
      } else if (s === 'busy') {
        btn.style.maxWidth = '40px'; btn.style.padding = '11px 0';
        btn.style.background = '#3a2f6b';
        lbl.style.animation = 'bmLblOut .22s cubic-bezier(.22,1,.36,1) both';
        glyph.style.opacity = 1;
        glyph.style.margin = '-8px 0 0 -8px';
        glyph.style.width = '16px'; glyph.style.height = '16px';
        glyph.innerHTML = '<circle cx="12" cy="12" r="9" stroke="#a99bff" stroke-width="2" fill="none" stroke-dasharray="14 42"/><style>svg circle{animation:bmSpin .8s linear infinite;transform-origin:12px 12px}</style>';
      } else if (s === 'done') {
        btn.style.background = '#1f4d1f';
        glyph.style.opacity = 1;
        glyph.style.width = '20px'; glyph.style.height = '20px';
        glyph.style.margin = '-10px 0 0 -10px';
        glyph.innerHTML = '<path d="M5 12.5l4.5 4.5L19 7.5" stroke="#BFEA1A" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>';
        const p = glyph.querySelector('path');
        p.style.strokeDasharray = '24'; p.style.strokeDashoffset = '24';
        p.style.animation = 'bmDraw .56s cubic-bezier(.22,1,.36,1) 80ms both';
        setTimeout(() => {
          if (btn.dataset.state !== 'done') return;
          btn.style.maxWidth = '100%'; btn.style.padding = '11px 26px';
          lbl.style.animation = 'bmLblIn .56s cubic-bezier(.22,1,.36,1) both';
          lbl.textContent = '已保存';
        }, 480);
      }
    };
    setState('idle');
    const seq = ['busy', 'done', 'idle'];
    timer = setInterval(() => { setState(seq[phase % 3]); phase++; }, 1500);
    return () => { clearInterval(timer); st.remove(); };
  }
};
