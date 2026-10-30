export default {
  id: 'rolling-number', group: 'data', name: '数字滚轮',
  lib: '纯 CSS',
  desc: '每一位数字各转各的，低位先到、高位后到，像机械里程表。移植自 Cult UI 的 Rolling Number，比 count-up 更耐看，适合金额、计数、版本号。',
  deps: '无',
  note: '行高必须写死 1，列高必须等于 1em，否则可视窗口正好切在字的腰线上。数字要用等宽字形（monospace 或 tabular-nums），不然从 1 滚到 8 时整行宽度会跳。位间延迟取 40–60ms 才有进位感，全部同步位移看起来只是整块面板在平移。位数变化时要固定成最大位数并用前导零补齐，否则列数一变更就重排。',
  scenes: { places: ['数据看板', '首屏'], goals: ['展示数据'], triggers: ['数据更新', '持续播放'], projects: ['管理后台', 'AI 产品', '品牌官网'] },
  code: `/* 每一位一列 0-9，滚的是整条 strip 的 translateY */
const setNumber = (cols, str) => {
  [...str].forEach((ch, i) => {
    const strip = cols[i].firstElementChild;
    strip.style.transitionDelay = i * 55 + 'ms';   // 低位先动
    strip.style.transform = 'translateY(' + (-ch * 1) + 'em)';
  });
};

/* CSS
.col{height:1em;overflow:hidden;font-variant-numeric:tabular-nums}
.strip{display:flex;flex-direction:column;transition:transform .85s cubic-bezier(.2,.9,.15,1)}
.strip > b{height:1em;line-height:1;display:flex;align-items:center;justify-content:center}
*/`,
  init(el) {
    const VALUES = ['2026', '4096', '8192', '1024'];
    const LEN = 4;

    const STYLE = `<style data-fx="rolling-number">
      .odo-wrap{display:flex;flex-direction:column;align-items:center;gap:10px}
      .odo-cap{font-size:9.5px;letter-spacing:.16em;color:#5f6b85;text-transform:uppercase}
      .odo{display:flex;gap:1px;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
        font-size:34px;font-weight:600;color:#eef1f7;cursor:pointer;
        text-shadow:0 0 18px rgba(95,59,255,.35)}
      .odo-col{height:1em;overflow:hidden;font-variant-numeric:tabular-nums;
        -webkit-mask-image:linear-gradient(180deg,transparent,#000 14%,#000 86%,transparent);
        mask-image:linear-gradient(180deg,transparent,#000 14%,#000 86%,transparent)}
      .odo-strip{display:flex;flex-direction:column;
        transition:transform .85s cubic-bezier(.2,.9,.15,1);will-change:transform}
      .odo-strip b{height:1em;line-height:1;display:flex;align-items:center;justify-content:center;
        font-weight:600;min-width:.62em}
      .odo-sep{color:#3a4459;font-size:26px;align-self:center;padding:0 1px}
      .odo-sub{font-size:10px;color:#7c869c}
      .odo-sub em{color:#3ddc97;font-style:normal}
    </style>`;

    el.insertAdjacentHTML('beforeend', STYLE + `
      <div class="odo-wrap">
        <div class="odo-cap">Monthly requests</div>
        <div class="odo" id="odo">
          ${Array.from({ length: LEN }, (_, i) => `
            <div class="odo-col"><div class="odo-strip">${'0123456789'.split('').map(d => `<b>${d}</b>`).join('')}</div></div>
            ${i === 0 ? '<span class="odo-sep">,</span>' : ''}`).join('')}
        </div>
        <div class="odo-sub">同比 <em>+18.4%</em> · 点击换一组</div>
      </div>`);

    const odo = el.querySelector('#odo');
    const cols = [...odo.querySelectorAll('.odo-col')];
    let idx = 0;
    let timer = null;

    const setNumber = str => {
      [...str].forEach((ch, i) => {
        const strip = cols[i].firstElementChild;
        strip.style.transitionDelay = i * 55 + 'ms';
        strip.style.transform = `translateY(${-Number(ch)}em)`;
      });
    };

    const next = () => {
      idx = (idx + 1) % VALUES.length;
      setNumber(VALUES[idx]);
    };

    const start = () => { clearInterval(timer); timer = setInterval(next, 2100); };

    odo.addEventListener('click', e => { e.stopPropagation(); next(); start(); });
    setNumber(VALUES[0]);
    start();

    return () => {
      clearInterval(timer);
      el.innerHTML = '';
    };
  }
};
