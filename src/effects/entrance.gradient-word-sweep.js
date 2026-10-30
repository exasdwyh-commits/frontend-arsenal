export default {
  id: 'gradient-word-sweep', group: 'entrance', name: '渐变扫光充能词',
  lib: 'video-shotcraft',
  desc: '标题词被一道渐变从左到右"充能"点亮：三层模糊辉光随波前推进，刚扫过的字符过曝发白、向后衰减到稳态呼吸，词上方按排期劈下勾连闪电。移植自 video-shotcraft 的 GradientWordSweep（Apache-2.0），原文档是 Remotion 逐帧合成，这里用帧时钟 + clipPath/mask 原生复刻。',
  deps: '无',
  note: '最大的坑是"方框光"：辉光层带 blur(24px)，若 mask 直接裁在文字盒上，模糊溢出盒外的部分会被一刀切成矩形亮框。解法是把每个模糊层放进四周外扩 PAD 的 Halo 盒里（position 外扩 + padding 内收，内容坐标不变），mask 色标用 calc(PADpx + (100% - 2*PADpx) * pct) 换算回文字坐标。第二个坑：闪电不能每帧随机——会连闪、同屏叠两三道，必须排期（间隔 ≥9 帧、同屏 ≤1 道、末次提前熄灭留落定呼吸）。第三个坑：本体渐变必须用 clipPath inset 硬裁（渐变前沿才锐利），辉光层用软边 mask（生硬了像色块滑条），两者分工不能混。',
  scenes: { places: ['首屏', '标题', '发布会'], goals: ['营造氛围', '内容呈现'], triggers: ['页面加载', '持续播放'], projects: ['品牌官网', '产品发布', '作品集'] },
  code: `/* ===== 三层辉光 + 渐变本体：波前推进充能 ===== */
/* Halo 外扩盒：带模糊的层放进四周外扩 PAD 的盒子，mask 色标换算回文字坐标，
   否则模糊溢出文字盒的部分会被 mask 裁成一圈方形亮框（"方框光"） */
var PAD = 47;
function at(x){                      /* 文字坐标 % -> 外扩盒 mask 色标 */
  x = Math.max(-20, Math.min(120, x)) / 100;
  return 'calc(' + PAD + 'px + (100% - ' + PAD * 2 + 'px) * ' + x + ')';
}

/* 波前尾迹 mask：刚扫过 (p-3%) 的字符最亮，向后 34% 窗口内衰减 */
var trail = 'linear-gradient(90deg, transparent 0%, transparent ' + at(p*100-34) +
  ', rgba(0,0,0,.9) ' + at(p*100-3) + ', rgba(0,0,0,.9) ' + at(p*100+1) +
  ', transparent ' + at(p*100+6) + ')';
glowMid.style.webkitMaskImage = trail;

/* 清晰渐变本体：clipPath 硬裁出锐利的渐变前沿（辉光层用软边 mask，本体用硬裁） */
body.style.clipPath = 'inset(-25% ' + (100 - p*100) + '% -25% 0)';

/* ===== 勾连闪电：种子 PRNG 预生成，按排期闪现 ===== */
/* 排期而非每帧随机：随机会连闪、同屏叠多道；固定排期间隔 >=9 帧、同屏 <=1 道 */
var FLASH_AT = [2, 12, 22, 33, 43, 52, 56];
/* 每道闪电三层描边叠出辉光：宽糊 -> 中晕 -> 清晰亮芯 */
widePath.setAttribute('stroke', 'rgba(216,60,190,.65)');  /* blur 6px, 宽 6 */
midPath.setAttribute('stroke', 'rgba(235,110,215,.9)');   /* blur 1.5px, 宽 2.4 */
corePath.setAttribute('stroke', '#ffd8f2');               /* 无模糊, 宽 1.4 */

/* 辉光呼吸 = 填充进度 * (0.82 + 0.18 * 种子噪声) + 闪电增亮 0.35 */`,

  init(el) {
    const STYLE = `<style data-fx="gradient-word-sweep">
      .gws{position:relative;width:100%;min-height:320px;overflow:hidden;
        background:radial-gradient(ellipse 70% 70% at 50% 48%,#0d0b14 0%,#07060a 60%,#040405 100%);
        display:flex;align-items:center;justify-content:center;font-family:"Avenir Next",Futura,"Helvetica Neue",Arial,sans-serif}
      .gws-push{position:absolute;inset:0;display:flex;align-items:center;justify-content:center}
      .gws-amb{position:absolute;left:50%;top:50%;width:430px;height:170px;border-radius:50%;
        background:radial-gradient(closest-side,rgba(180,110,255,.6),rgba(255,110,212,.25) 55%,transparent 78%);
        filter:blur(22px);opacity:0;transform:translate(-50%,-54%)}
      .gws-txt{text-align:center;position:relative;z-index:1}
      .gws-line{font-weight:700;font-style:italic;font-size:48px;letter-spacing:-.5px;line-height:1.28;
        color:#fff;white-space:nowrap;opacity:0}
      .gws-word{position:relative;display:inline-block}
      .gws-grad{position:absolute;inset:0;background-image:linear-gradient(92deg,#59c2ff 0%,#9d6bff 32%,#ff6ed4 62%,#ffc46b 100%);
        -webkit-background-clip:text;background-clip:text;color:transparent}
      .gws-halo{position:absolute;left:-47px;top:-47px;right:-47px;bottom:-47px;padding:47px;pointer-events:none}
      .gws-halo>span{position:relative;display:block;width:100%;height:100%}
      .gws-bolt{position:absolute;left:-26px;top:-34px;width:calc(100% + 52px);height:136px;overflow:visible;pointer-events:none}
      .gws-vig{position:absolute;inset:0;pointer-events:none;
        background:radial-gradient(ellipse 78% 78% at 50% 50%,transparent 42%,rgba(0,0,0,.55) 100%)}
      .gws-grain{position:absolute;inset:0;pointer-events:none;opacity:.07;mix-blend-mode:soft-light;
        background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)'/%3E%3C/svg%3E")}
    </style>`;

    el.insertAdjacentHTML('beforeend', STYLE + `
      <div class="gws">
        <div class="gws-push"><div class="gws-amb" id="gwsAmb"></div></div>
        <div class="gws-txt">
          <div class="gws-line" id="gwsL1"><span class="gws-word" id="gwsWord"><span>Supercharged</span></span> product films</div>
          <div class="gws-line" id="gwsL2">made with WebUI 图鉴</div>
        </div>
        <div class="gws-vig"></div><div class="gws-grain"></div>
      </div>`);

    const $ = (id) => el.querySelector(id);
    const word = $('#gwsWord'), amb = $('#gwsAmb');
    const L1 = $('#gwsL1'), L2 = $('#gwsL2');
    const WORD = 'Supercharged';
    const FS = 48, PAD = 47;
    const GRAD = 'linear-gradient(92deg,#59c2ff 0%,#9d6bff 32%,#ff6ed4 62%,#ffc46b 100%)';

    // ---- 种子化噪声与闪电（mulberry32）----
    const mulberry32 = (a) => () => {
      let t = (a += 0x6d2b79f5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    const rand = mulberry32(20260718);
    const FLICKER = Array.from({ length: 160 }, () => rand());
    const makeLongBolt = (r) => {
      const x0 = 30 + r() * 220, x1 = x0 + 160 + r() * 320, yBase = 38 + r() * 42;
      const n = 7 + Math.floor(r() * 4);
      let d = 'M ' + (x0).toFixed(1) + ' ' + (yBase + 26 + r() * 20).toFixed(1);
      for (let i = 1; i <= n; i++) {
        const x = x0 + ((x1 - x0) * i) / n + (r() - 0.5) * 22;
        const arch = Math.sin((i / n) * Math.PI) * -22;
        const y = yBase + arch + (r() - 0.5) * 30 + (i === n ? 30 + r() * 18 : 0);
        d += ' L ' + x.toFixed(1) + ' ' + y.toFixed(1);
      }
      return { d, long: true };
    };
    const makeShortBolt = (r) => {
      const x = 60 + r() * 540, y0 = 72 + r() * 24, y1 = y0 + 55 + r() * 45;
      const n = 4 + Math.floor(r() * 3);
      let d = 'M ' + x.toFixed(1) + ' ' + y0.toFixed(1);
      for (let i = 1; i <= n; i++) d += ' L ' + (x + (r() - 0.5) * 30).toFixed(1) + ' ' + (y0 + ((y1 - y0) * i) / n).toFixed(1);
      return { d, long: false };
    };
    const BOLTS = Array.from({ length: 16 }, (_, i) => (i % 3 === 0 ? makeShortBolt(rand) : makeLongBolt(rand)));
    const FLASH_AT = [2, 12, 22, 33, 43, 52, 56];
    const LIGHT_START = 33;
    const FLASHES = FLASH_AT.map((d, k) => ({
      at: LIGHT_START + d, life: k === FLASH_AT.length - 1 ? 3 : 3 + Math.floor(rand() * 2), bolt: (k * 5 + 1) % BOLTS.length,
    }));

    // ---- 辉光层（Halo 外扩盒结构）----
    const gradSpan = (cls, style) => {
      const h = document.createElement('span');
      h.className = 'gws-halo';
      const inner = document.createElement('span');
      const g = document.createElement('span');
      g.className = 'gws-grad';
      g.textContent = WORD;
      if (style) g.style.cssText = style;
      inner.appendChild(g);
      h.appendChild(inner);
      if (cls) h.classList.add(cls);
      word.appendChild(h);
      return h;
    };
    const glowFar = gradSpan('', 'filter:blur(24px) saturate(1.6);transform:scale(1.05)');
    const glowMid = gradSpan('', 'filter:blur(9.4px) saturate(1.4) brightness(1.15)');
    const glowNear = gradSpan('', 'filter:blur(3.1px) brightness(1.25)');
    const bodyGrad = document.createElement('span');
    bodyGrad.className = 'gws-grad';
    bodyGrad.textContent = WORD;
    word.appendChild(bodyGrad);
    // 波前尾迹增亮层
    const trailHalo = gradSpan('', 'filter:blur(4.7px) saturate(1.7) brightness(1.7)');
    trailHalo.style.opacity = '0';
    // 填充头过曝亮核
    const headHalo = document.createElement('span');
    headHalo.className = 'gws-halo';
    const headInner = document.createElement('span');
    headInner.style.cssText = 'position:relative;display:block;width:100%;height:100%';
    const headTxt = document.createElement('span');
    headTxt.textContent = WORD;
    headTxt.style.cssText = 'position:absolute;inset:0;color:#fff;filter:blur(1.6px);' +
      'textShadow:0 0 12px rgba(255,255,255,.9),0 0 28px rgba(216,150,255,.8)';
    headInner.appendChild(headTxt);
    headHalo.appendChild(headInner);
    headHalo.style.opacity = '0';
    word.appendChild(headHalo);

    // ---- 闪电 SVG ----
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 700 240');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    svg.setAttribute('aria-hidden', 'true');
    svg.classList.add('gws-bolt');
    word.appendChild(svg);

    // ---- 帧时钟 ----
    const FILL_START = 12, FILL_END = 30, ANIM = 105, HOLD = 110, LOOP = ANIM + HOLD;
    const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
    const outQuad = (t) => 1 - (1 - t) * (1 - t);
    const snappy = (t) => 1 - Math.pow(1 - t, 3.2);
    const smooth = (t) => t * t * (3 - 2 * t);
    const lerp = (a, b, t) => a + (b - a) * t;
    const ramp = (f, start, dur, ease) => ease(clamp01((f - start) / dur));

    // 文字坐标 % -> Halo 盒 mask 色标
    const at = (x) => {
      const v = Math.max(-0.2, Math.min(1.2, x / 100));
      return 'calc(' + PAD + 'px + (100% - ' + PAD * 2 + 'px) * ' + v.toFixed(4) + ')';
    };
    const softMask = (soft) =>
      'linear-gradient(90deg,#000 0%,#000 ' + at(pCache * 100 - soft) + ',transparent ' + at(pCache * 100 + soft * 0.6) + ')';
    let pCache = 0;

    const render = (frame) => {
      // 入场：两行错峰 blur-slide
      const e1 = ramp(frame, 0, 14, snappy), e2 = ramp(frame, 4, 14, snappy);
      const lineIn = (node, e) => {
        node.style.opacity = e;
        node.style.transform = 'translateY(' + ((1 - e) * 24).toFixed(2) + 'px)';
        node.style.filter = e < 0.999 ? 'blur(' + ((1 - e) * 6).toFixed(2) + 'px)' : '';
      };
      lineIn(L1, e1); lineIn(L2, e2);
      const push = 1 + 0.025 * ramp(frame, 0, 104, smooth);
      el.querySelector('.gws-txt').style.transform = 'scale(' + push.toFixed(4) + ')';
      el.querySelector('.gws-push').style.transform = 'scale(' + push.toFixed(4) + ')';

      // 充能填充
      const p = outQuad(clamp01((frame - FILL_START) / (FILL_END - FILL_START)));
      pCache = p;
      const pPct = p * 100;
      const filling = frame >= FILL_START && frame <= FILL_END + 4;
      const headFade = clamp01(1 - (frame - FILL_END) / 6);
      const trailFade = clamp01(1 - (frame - FILL_END) / 10);

      bodyGrad.style.clipPath = 'inset(-25% ' + (100 - pPct).toFixed(2) + '% -25% 0)';

      // 三层辉光软边 mask + 透明度
      const soft = (node, s, base) => {
        if (p >= 1) { node.style.maskImage = ''; node.style.webkitMaskImage = ''; }
        else {
          const m = softMask(s);
          node.style.maskImage = m; node.style.webkitMaskImage = m;
        }
        node.style.opacity = base;
      };
      const noise = FLICKER[Math.min(frame, FLICKER.length - 1)];
      const active = FLASHES.filter((f) => frame >= f.at && frame < f.at + f.life);
      const boltBoost = active.length > 0 ? 0.35 : 0;
      const glowLvl = clamp01((frame - FILL_START) / (FILL_END - FILL_START)) * (0.82 + 0.18 * noise) + boltBoost;
      soft(glowFar, 14, 0.55 * glowLvl);
      soft(glowMid, 10, 0.62 * glowLvl);
      soft(glowNear, 7, 0.72 * Math.min(1, glowLvl + 0.1));
      amb.style.opacity = 0.55 * glowLvl;

      // 波前尾迹
      if (trailFade > 0.01) {
        const TRAIL = 34;
        const m = 'linear-gradient(90deg,transparent 0%,transparent ' + at(pPct - TRAIL) +
          ',rgba(0,0,0,.9) ' + at(pPct - 3) + ',rgba(0,0,0,.9) ' + at(pPct + 1) +
          ',transparent ' + at(pPct + 6) + ')';
        trailHalo.style.maskImage = m; trailHalo.style.webkitMaskImage = m;
        trailHalo.style.opacity = 0.95 * trailFade;
      } else trailHalo.style.opacity = '0';

      // 填充头过曝亮核
      if (filling && p < 1) {
        const m = 'linear-gradient(90deg,transparent 0%,transparent ' + at(pPct - 12) +
          ',#000 ' + at(pPct - 6) + ',#000 ' + at(pPct - 1) + ',transparent ' + at(pPct + 2) + ')';
        headHalo.style.maskImage = m; headHalo.style.webkitMaskImage = m;
        headHalo.style.opacity = 0.9 * headFade;
      } else headHalo.style.opacity = '0';

      // 闪电
      svg.textContent = '';
      for (const f of active) {
        const b = BOLTS[f.bolt];
        const decay = 1 - (frame - f.at) / f.life;
        const g = document.createElementNS(svgNS, 'g');
        g.setAttribute('opacity', Math.min(1, 1.1 * decay));
        const mk = (stroke, w, blur) => {
          const path = document.createElementNS(svgNS, 'path');
          path.setAttribute('d', b.d);
          path.setAttribute('fill', 'none');
          path.setAttribute('stroke', stroke);
          path.setAttribute('stroke-width', b.long ? w : w * 0.75);
          path.setAttribute('stroke-linejoin', 'miter');
          if (blur) path.style.filter = 'blur(' + blur + 'px)';
          g.appendChild(path);
        };
        mk('rgba(216,60,190,.65)', 6, 6);
        mk('rgba(235,110,215,.9)', 2.4, 1.5);
        mk('#ffd8f2', 1.4, 0);
        svg.appendChild(g);
      }
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
