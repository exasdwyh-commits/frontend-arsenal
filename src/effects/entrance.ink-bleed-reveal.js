export default {
  id: 'ink-bleed-reveal', group: 'entrance', name: '墨渗揭示',
  lib: 'video-shotcraft',
  desc: '水墨转场：一点墨落在旧画面上，须状墨边带着新画面"洇"出来——湿晕、墨边、墨芯三层同心圆共用一套湍流位移滤镜，滤镜只揉遮罩形状不揉内容，新景在墨边后面显影。移植自 video-shotcraft 的 InkBleedReveal（Apache-2.0），SVG mask + foreignObject 原生复刻。',
  deps: '无',
  note: '关键在"filter 挂在 mask 的圆上，不挂在内容上"——位移滤镜揉的是遮罩边缘形状，画面本身永远清晰；挂反了整幅画会糊成一团。第二个坑：id 必须按实例生成并清洗（React useId 的 «:» 在 url() 里非法，本实现用自增序号），否则同页多实例互相引用对方的滤镜。第三个坑：半径带 ±8% 正弦扰动是为了洇开快慢不匀，但帧 78–98 必须把扰动包络衰减到 0，否则吃满全屏后边缘还在呼吸，永远静不下来；结尾直接摘掉 SVG 换成普通 DOM，保证像素级真静止。',
  scenes: { places: ['转场', '章节页', '片头'], goals: ['营造氛围', '内容呈现'], triggers: ['页面加载', '滚动'], projects: ['品牌官网', '发布会', '作品集'] },
  code: `/* ===== 水墨洇开：三层同心遮罩圆 + 湍流位移 ===== */
/* filter 只挂在 mask 的圆上——揉的是遮罩边，不是画面内容 */
<filter id="bleed" x="-40%" y="-40%" width="180%" height="180%">
  <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" seed="7" result="noise"/>
  <feDisplacementMap in="SourceGraphic" in2="noise" scale="120"
    xChannelSelector="R" yChannelSelector="G"/>
</filter>
<mask id="inkMask" maskUnits="userSpaceOnUse" x="0" y="0" width="1920" height="1080">
  <rect width="1920" height="1080" fill="black"/>
  <circle cx="800" cy="420" r="R" fill="white" filter="url(#bleed)"/>
</mask>

/* 三层半径（自外向内）：湿晕 r+lead+110（极淡）、墨边 r+lead（羽化 3.2）、墨芯 r+lead*0.45（羽化 1） */
/* 墨边领先量 lead = 20 + 22*sin(pi*t)：起笔窄、中段最宽——墨先跑，画面后显 */
var lead  = 20 + 22 * Math.sin(Math.PI * t);
var rInk  = r + lead;        /* 墨边外沿 */
var rCore = r + lead * 0.45; /* 墨芯 */

/* ±8% 低频正弦扰动 = 洇开快慢不匀；帧 78–98 包络衰减到 0，保证结尾真静止 */
var wobbleEnv = clamp01((98 - frame) / 20);
var r = baseR * (1 + 0.08 * Math.sin(frame * 0.32) * wobbleEnv);

/* 半径 0 -> 1450（最远角 ~1300 + 渗边位移余量）走 ease-out(quad) */
/* 新景套同一个 mask 显影，scale 1.035 -> 1（摘罩前必须精确回到 1） */
/* displace scale 60 -> 160 随帧涨：越洇越散、须状分叉越长 */`,

  init(el) {
    let uid = 0;
    const STYLE = `<style data-fx="ink-bleed-reveal">
      .ink{position:relative;width:100%;min-height:330px;overflow:hidden;background:#f3efe6}
      .ink-old,.ink-new{position:absolute;inset:0}
      .ink-old{background:radial-gradient(ellipse 80% 70% at 42% 38%,#f8f5ee 0%,#f3efe6 55%,#e9e4d8 100%);
        display:flex;align-items:center;justify-content:center}
      .ink-grain{position:absolute;inset:0;opacity:.07;mix-blend-mode:multiply;pointer-events:none;
        background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)'/%3E%3C/svg%3E")}
      .ink-chapter{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:12px;letter-spacing:.32em;
        color:#8a8173;margin-bottom:20px}
      .ink-title{font-family:ui-serif,Georgia,"Times New Roman",serif;font-size:56px;font-weight:500;
        line-height:1.06;letter-spacing:-.025em;color:#2a2620}
      .ink-title i{font-style:italic}
      .ink-rule{width:70px;height:1.5px;background:#b7ab97;margin:26px auto 18px}
      .ink-sub{font-family:ui-serif,Georgia,serif;font-size:17px;color:#6f675a}
      .ink-svg{position:absolute;inset:0;display:block;width:100%;height:100%}
      /* 新景：浅色数据面板（FakeDashboard 缩影） */
      .ink-dash{width:100%;height:100%;background:#fbfaf8;padding:8% 9%;box-sizing:border-box;
        font-family:"Helvetica Neue",Arial,sans-serif;color:#1d2330;display:flex;flex-direction:column;gap:5%}
      .ink-dash .dh{display:flex;justify-content:space-between;align-items:baseline}
      .ink-dash .dh b{font-size:22px;letter-spacing:-.01em}
      .ink-dash .dh span{font-size:11px;color:#8b93a3}
      .ink-dash .cards{display:flex;gap:4%}
      .ink-dash .card{flex:1;background:#fff;border-radius:10px;padding:12px 14px;
        box-shadow:0 1px 3px rgba(20,30,60,.07)}
      .ink-dash .card em{display:block;font-style:normal;font-size:10px;color:#8b93a3;margin-bottom:5px}
      .ink-dash .card b{font-size:19px}
      .ink-dash .card i{font-style:normal;font-size:10px;color:#2fa46f;margin-left:5px}
      .ink-dash .bars{flex:1;display:flex;align-items:flex-end;gap:2.4%;padding:0 2px}
      .ink-dash .bar{flex:1;background:linear-gradient(to top,#4b6bfb,#7a94ff);border-radius:3px 3px 0 0}
    </style>`;

    el.insertAdjacentHTML('beforeend', STYLE + `
      <div class="ink">
        <div class="ink-old" id="inkOld">
          <div style="text-align:center">
            <div class="ink-chapter">CHAPTER 02</div>
            <div class="ink-title">Frame motion.<br><i>Craft the shot.</i></div>
            <div class="ink-rule"></div>
            <div class="ink-sub">Every shot, tuned in one place.</div>
          </div>
          <div class="ink-grain"></div>
        </div>
        <div class="ink-new" id="inkNew" style="visibility:hidden">
          <div class="ink-dash">
            <div class="dh"><b>季度概览</b><span>2026 Q3 · 实时</span></div>
            <div class="cards">
              <div class="card"><em>营收</em><b>¥ 8,420,617</b><i>▲ 12.4%</i></div>
              <div class="card"><em>活跃用户</em><b>143,802</b><i>▲ 6.1%</i></div>
              <div class="card"><em>转化率</em><b>4.83%</b><i>▲ 0.7%</i></div>
            </div>
            <div class="bars" id="inkBars"></div>
          </div>
        </div>
        <svg class="ink-svg" id="inkSvg" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice" aria-hidden="true"></svg>
      </div>`);

    // 柱状图
    const bars = el.querySelector('#inkBars');
    const H = [42, 58, 36, 71, 64, 88, 52, 79, 95, 68, 84, 74];
    for (const h of H) {
      const b = document.createElement('div');
      b.className = 'bar';
      b.style.height = h + '%';
      bars.appendChild(b);
    }

    const svg = el.querySelector('#inkSvg');
    const oldScene = el.querySelector('#inkOld');
    const newScene = el.querySelector('#inkNew');
    const NS = 'http://www.w3.org/2000/svg';
    const id = () => 'ink' + (++uid) + 'x' + Math.floor(performance.now() * 1000 % 100000);

    // 帧时钟
    const LOOP = 200, HOLD_END = 130;
    const cx = 800, cy = 420;
    const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
    const outQuad = (t) => 1 - (1 - t) * (1 - t);

    const mk = (tag, attrs) => {
      const n = document.createElementNS(NS, tag);
      for (const k in attrs) n.setAttribute(k, attrs[k]);
      return n;
    };

    const render = (frame) => {
      // 帧 100 起：摘掉 SVG，直接铺新景（像素级真静止）
      if (frame >= 100) {
        if (svg.style.display !== 'none') {
          svg.style.display = 'none';
          oldScene.style.display = 'none';
          newScene.style.visibility = 'visible';
        }
        return;
      }
      if (svg.style.display === 'none') {
        svg.style.display = '';
        oldScene.style.display = '';
        newScene.style.visibility = 'hidden';
      }

      // 基础半径：帧 20–98，0 -> 1450（最远角 ~1300 + 渗边位移余量）
      const baseR = 1450 * outQuad(clamp01((frame - 20) / 78));
      // ±8% 低频正弦扰动；帧 78–98 包络衰减到 0
      const wobbleEnv = clamp01((98 - frame) / 20);
      const r = Math.max(0, baseR * (1 + 0.08 * Math.sin(frame * 0.32) * wobbleEnv));
      // 墨边领先量：起笔窄、中段最宽
      const lead = 20 + 22 * Math.sin(Math.PI * clamp01((frame - 20) / 58));
      const rInk = r > 0.5 ? r + lead : 0;
      const rCore = r > 0.5 ? r + lead * 0.45 : 0;
      const rHalo = r > 0.5 ? r + lead + 110 : 0;
      // 渗边发散度
      const dispScale = 60 + 100 * clamp01((frame - 20) / 78);
      // 墨滴：14–22f 过冲落下
      const dt = clamp01((frame - 14) / 8);
      const drop = dt >= 1 ? 1 : 1 + 2.7 * Math.pow(dt - 1, 3) + 1.7 * Math.pow(dt - 1, 2); // out-back
      const dropR = 16 * Math.max(0, drop);
      // 新景显影
      const devT = clamp01((frame - 20) / 80);
      const develop = 1.035 - 0.035 * (1 - Math.pow(1 - devT, 2));

      const bleedId = id(), featherId = id(), featherCId = id(), haloId = id();
      const mHalo = id(), mInk = id(), mInkC = id(), mNew = id();

      const filt = (fid, scale, blur, freq) => {
        const f = mk('filter', { id: fid, x: '-40%', y: '-40%', width: '180%', height: '180%' });
        f.appendChild(mk('feTurbulence', { type: 'fractalNoise', baseFrequency: freq || 0.02, numOctaves: 3, seed: 7, result: 'noise' }));
        f.appendChild(mk('feDisplacementMap', { in: 'SourceGraphic', in2: 'noise', scale: scale, xChannelSelector: 'R', yChannelSelector: 'G', result: 'd' }));
        if (blur) f.appendChild(mk('feGaussianBlur', { in: 'd', stdDeviation: blur }));
        return f;
      };
      const mask = (mid, circles) => {
        const m = mk('mask', { id: mid, maskUnits: 'userSpaceOnUse', x: 0, y: 0, width: 1920, height: 1080 });
        m.appendChild(mk('rect', { x: 0, y: 0, width: 1920, height: 1080, fill: 'black' }));
        for (const c of circles) m.appendChild(mk('circle', c));
        return m;
      };

      const defs = mk('defs', {});
      defs.appendChild(filt(bleedId, dispScale, 0));
      defs.appendChild(filt(featherId, dispScale * 1.08, 3.2));
      defs.appendChild(filt(featherCId, dispScale * 1.03, 1));
      defs.appendChild(filt(haloId, dispScale * 1.3, 34, 0.012));
      defs.appendChild(mask(mHalo, rHalo > 0 ? [{ cx, cy, r: rHalo, fill: 'white', filter: 'url(#' + haloId + ')' }] : []));
      const inkCircles = [];
      if (rInk > 0) inkCircles.push({ cx, cy, r: rInk, fill: 'white', filter: 'url(#' + featherId + ')' });
      if (dropR > 0.5) inkCircles.push({ cx, cy, r: dropR, fill: 'white' });
      defs.appendChild(mask(mInk, inkCircles));
      const inkCCircles = [];
      if (rCore > 0) inkCCircles.push({ cx, cy, r: rCore, fill: 'white', filter: 'url(#' + featherCId + ')' });
      if (dropR > 0.5) inkCCircles.push({ cx, cy, r: dropR * 0.86, fill: 'white' });
      defs.appendChild(mask(mInkC, inkCCircles));
      defs.appendChild(mask(mNew, r > 0.5 ? [{ cx, cy, r, fill: 'white', filter: 'url(#' + bleedId + ')' }] : []));

      svg.textContent = '';
      svg.appendChild(defs);
      // ① 湿晕
      svg.appendChild(mk('rect', { x: 0, y: 0, width: 1920, height: 1080, fill: '#5a4e3a', opacity: 0.12, mask: 'url(#' + mHalo + ')' }));
      // ② 墨边（含落点墨滴）
      svg.appendChild(mk('rect', { x: 0, y: 0, width: 1920, height: 1080, fill: '#1a1c29', opacity: 0.42, mask: 'url(#' + mInk + ')' }));
      svg.appendChild(mk('rect', { x: 0, y: 0, width: 1920, height: 1080, fill: '#1a1c29', opacity: 0.86, mask: 'url(#' + mInkC + ')' }));
      // ③ 新景显影：克隆仪表盘进 foreignObject
      const g = mk('g', { mask: 'url(#' + mNew + ')' });
      const fo = mk('foreignObject', { x: 0, y: 0, width: 1920, height: 1080 });
      const wrap = document.createElement('div');
      wrap.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
      wrap.style.cssText = 'width:1920px;height:1080px;transform:scale(' + develop.toFixed(4) + ');transform-origin:' + cx + 'px ' + cy + 'px';
      wrap.appendChild(newScene.firstElementChild.cloneNode(true));
      fo.appendChild(wrap);
      g.appendChild(fo);
      svg.appendChild(g);
    };

    let raf = 0, t0 = performance.now(), alive = true;
    const tick = (now) => {
      if (!alive) return;
      const frame = Math.floor((now - t0) / (1000 / 60)) % LOOP;
      render(frame);
      raf = requestAnimationFrame(tick);
    };
    render(0);
    raf = requestAnimationFrame(tick);

    return () => { alive = false; cancelAnimationFrame(raf); el.innerHTML = ''; };
  }
};
