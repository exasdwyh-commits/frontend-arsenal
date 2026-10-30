export default {
  id: 'border-beam', group: 'particle', name: '边框光束',
  lib: '纯 CSS',
  desc: '一段高光沿卡片描边匀速绕圈，静态卡片瞬间"通着电"。移植自 Cult UI 的 Border Beam，是所有 AI 产品卡片最省事的氛围层。',
  deps: '无',
  note: 'conic-gradient 必须留出透明弧段（transparent 0 56%, 高光 74%, transparent 89%），整圈同色就变成均匀色环、看不出在跑。发光层要绝对居中成正方形（等宽高 + 负 margin 半边），用 inset 负值会得到矩形，转到四角时光束会加速变形。想更亮别加 filter: blur 到主描边，会把 1px 糊掉，另叠一层模糊的同款当辉光。',
  scenes: { places: ['卡片', '按钮'], goals: ['营造氛围', '状态提示'], triggers: ['持续播放'], projects: ['AI 产品', '品牌官网', '管理后台'] },
  code: `/* 结构：<div class="beam"><div class="beam-in">内容</div></div> */
.beam{position:relative;padding:1px;border-radius:14px;overflow:hidden;isolation:isolate}

.beam::before{
  content:"";position:absolute;left:50%;top:50%;
  width:320px;height:320px;margin:-160px 0 0 -160px;   /* 正方形，必须够大盖住对角线 */
  background:conic-gradient(from 0deg,
    transparent 0 56%, #8b6cff 74%, #fff 82%, transparent 89%);
  animation:beam-spin 3.6s linear infinite;
}

.beam-in{position:relative;z-index:1;background:#12151d;border-radius:13px}

@keyframes beam-spin{to{transform:rotate(1turn)}}`,
  init(el) {
    const STYLE = `<style data-fx="border-beam">
      .beam-wrap{display:flex;flex-direction:column;align-items:center;gap:12px}
      .beam{position:relative;width:188px;padding:1px;border-radius:14px;overflow:hidden;isolation:isolate}
      .beam::before{content:"";position:absolute;left:50%;top:50%;width:320px;height:320px;margin:-160px 0 0 -160px;
        background:conic-gradient(from 0deg,transparent 0 56%,#8b6cff 74%,#fff 82%,transparent 89%);
        animation:beam-spin 3.6s linear infinite;will-change:transform}
      .beam::after{content:"";position:absolute;left:50%;top:50%;width:320px;height:320px;margin:-160px 0 0 -160px;
        background:conic-gradient(from 0deg,transparent 0 58%,#8b6cff 76%,transparent 88%);
        filter:blur(8px);opacity:.6;animation:beam-spin 3.6s linear infinite;will-change:transform}
      @keyframes beam-spin{to{transform:rotate(1turn)}}
      .beam-in{position:relative;z-index:1;background:#12151d;border-radius:13px;padding:16px 18px;
        display:flex;flex-direction:column;gap:5px}
      .beam-in b{font-size:12.5px;color:#e8ecf4;font-weight:600}
      .beam-in small{font-size:10.5px;color:#7c869c;line-height:1.5}
      .beam-tag{display:inline-flex;align-items:center;gap:5px;font-size:9.5px;color:#8b6cff;
        letter-spacing:.06em;text-transform:uppercase}
      .beam-tag i{width:4px;height:4px;border-radius:99px;background:#8b6cff;box-shadow:0 0 6px #8b6cff}
    </style>`;

    el.insertAdjacentHTML('beforeend', STYLE + `
      <div class="beam-wrap">
        <div class="beam">
          <div class="beam-in">
            <span class="beam-tag"><i></i>Running</span>
            <b>Agent 正在执行任务</b>
            <small>3 个工具调用 · 已用 12.4s</small>
          </div>
        </div>
      </div>`);

    return () => { el.innerHTML = ''; };
  }
};
