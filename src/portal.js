/* ============================================================
   portal.js —— 首页的动态层
   原则：JS 只做增强。所有内容在 HTML 里已经可读，
   脚本挂了、rAF 不跑、用户开了减少动效，页面都要完整可用。
   ============================================================ */

const sysReduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* 动效开关：默认开。
   这一页存在的意义就是展示动效，所以不替访客做决定；
   但左下角永远留着一个开关，想关随时关，选择会记住。
   ?motion=on / ?motion=off 也认，方便直接分享带/不带动效的地址。 */
let motionPref = null;
try {
  const q = new URLSearchParams(location.search).get('motion');
  if (q === 'on' || q === 'off') localStorage.setItem('arsenal-motion', q);
  motionPref = localStorage.getItem('arsenal-motion');
} catch (_) {}

const reduce = motionPref === 'off';
if (reduce) document.documentElement.classList.add('no-motion');

/* ---------- 顶栏：滚动后加深 ---------- */
const bar = document.getElementById('topbar');
if (bar) {
  const onScroll = () => bar.classList.toggle('scrolled', window.scrollY > 12);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ============================================================
   开屏：墨渗（ink-bleed-reveal 的首页版）
   黑色盖层上一笔墨从标题处洇开，边缘用三层正弦扰动当湍流，
   露完整页后整层摘掉。没有视频，也没有 SVG 滤镜链。
   ============================================================ */
const inkEl = document.getElementById('inkOpen');
if (inkEl) {
  const inkCv = document.getElementById('inkCanvas');
  const ictx = inkCv && inkCv.getContext ? inkCv.getContext('2d') : null;
  if (!ictx || reduce) {
    inkEl.remove();
  } else {
    const DPR = Math.min(devicePixelRatio || 1, 1.5);
    const t0 = performance.now();
    let W = 0, H = 0, raf = 0, done = false, cleared = false;

    const resize = () => {
      W = innerWidth; H = innerHeight;
      inkCv.width = Math.round(W * DPR);
      inkCv.height = Math.round(H * DPR);
      ictx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };
    resize();

    const cx = () => W * .32;
    const cy = () => H * .46;

    const blob = (r, wob, ph) => {
      const N = 160;
      ictx.beginPath();
      for (let i = 0; i <= N; i++) {
        const a = i / N * Math.PI * 2;
        const k = 1 + wob * (
          .075 * Math.sin(a * 5 + ph) +
          .050 * Math.sin(a * 9 - ph * 1.7) +
          .030 * Math.sin(a * 17 + ph * 2.3)
        );
        const x = cx() + Math.cos(a) * r * k;
        const y = cy() + Math.sin(a) * r * k;
        i ? ictx.lineTo(x, y) : ictx.moveTo(x, y);
      }
      ictx.closePath();
    };

    const finish = () => {
      if (done) return;
      done = true;
      cancelAnimationFrame(raf);
      removeEventListener('resize', resize);
      inkEl.remove();
    };

    const skip = () => finish();
    addEventListener('wheel', skip, { passive: true, once: true });
    addEventListener('touchstart', skip, { passive: true, once: true });
    addEventListener('keydown', skip, { once: true });
    addEventListener('resize', resize);

    const draw = now => {
      const p = Math.min(1, Math.max(0, (now - t0 - 80) / 1450));
      const e = 1 - Math.pow(1 - p, 2.2);
      const wob = p < .74 ? 1 : Math.max(0, 1 - (p - .74) / .26);
      const ph = 1.2 + (now - t0) * .0009;
      const R = Math.hypot(Math.max(cx(), W - cx()), Math.max(cy(), H - cy())) * 1.02 + 70;
      const r = R * e;

      ictx.clearRect(0, 0, W, H);
      ictx.fillStyle = '#0a0b13';
      ictx.fillRect(0, 0, W, H);

      /* 挖洞：外圈糊、内圈实，边缘才有墨的厚度 */
      ictx.globalCompositeOperation = 'destination-out';
      ictx.save(); ictx.filter = 'blur(30px)'; blob(r, wob * 1.18, ph); ictx.fill(); ictx.restore();
      ictx.save(); ictx.filter = 'blur(7px)'; blob(r * .982, wob, ph * 1.4); ictx.fill(); ictx.restore();
      ictx.globalCompositeOperation = 'source-over';

      /* 湿墨边：一条有厚度的紫黑水线 + 细亮线 + 飞溅 */
      ictx.save();
      ictx.strokeStyle = 'rgba(96,66,220,.20)';
      ictx.lineWidth = 26;
      ictx.shadowColor = 'rgba(107,75,255,.55)';
      ictx.shadowBlur = 34;
      blob(r * 1.015, wob, ph);
      ictx.stroke();
      ictx.strokeStyle = 'rgba(178,158,255,.46)';
      ictx.lineWidth = 2.6;
      blob(r, wob, ph * 1.1);
      ictx.stroke();
      ictx.restore();

      /* 墨点：几个小滴子跑在墨锋前面 */
      ictx.save();
      ictx.fillStyle = 'rgba(132,104,255,.34)';
      for (let i = 0; i < 12; i++) {
        const a = i * 2.399 + ph * .35;
        const rr = r * (1.035 + .055 * Math.sin(i * 7.1 + ph));
        const rad = 1.6 + 3 * Math.abs(Math.sin(i * 3.7 + ph));
        ictx.beginPath();
        ictx.arc(cx() + Math.cos(a) * rr, cy() + Math.sin(a) * rr, rad, 0, 6.2832);
        ictx.fill();
      }
      ictx.restore();

      if (!cleared) { cleared = true; inkEl.style.background = 'transparent'; }

      if (p < 1) raf = requestAnimationFrame(draw);
      else finish();
    };
    raf = requestAnimationFrame(draw);
  }
}

/* ============================================================
   首屏短片：四个场景，每 4.2 秒切一次，全部实时算出来
   没有视频文件、没有 GIF、没有第三方库。

   时间模型（关键，别用 setTimeout 累加）：
   clock 是「已播放毫秒」的累加器，每帧加上 dt；
   暂停 = 不再累加；跳段 = 直接改 clock。
   这样暂停、拖进度、切段三条路都不会让内容对不上进度条。
   ============================================================ */
const reelCv = document.getElementById('reelCanvas');
if (reelCv && reelCv.getContext) {
  const ctx = reelCv.getContext('2d');
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  const TAU = Math.PI * 2;
  const SCENE = 4200;
  const BG = '#08090d';

  const nameEl = document.getElementById('reelName');
  const idxEl = document.getElementById('reelIdx');
  const barEl = document.getElementById('reelBar');
  const barWrap = document.getElementById('reelBarWrap');
  const knobName = document.getElementById('knobName');
  const knobVal = document.getElementById('knobVal');

  let W = 0, H = 0, raf = 0, lastTs = 0, clock = 0;
  let idx = -1, cur = null, prev = null, visible = true, paused = false;
  let transT = 0, pointerX = NaN, pointerY = NaN, tilt = 0, tiltV = 0;
  let transMode = 'wash';          /* 'wash' 溶解过渡 · 'cut' 硬切 */
  let fps = 60, frames = 0, fpsAt = 0;

  /* 当前场景的可调参数（每个场景有自己的默认值） */
  const param = { name: '粒子数', min: 120, max: 900, value: 520, unit: '' };
  const rand = (a, b) => a + Math.random() * (b - a);
  const clear = () => { ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H); };

  /* --- 转场：模糊叠化（Emil 的老招：模糊能盖住两个状态重叠的缝） --- */
  const dissolve = u => {
    const t = Math.PI * 2 * u;
    const cx0 = W * (.5 + .12 * Math.sin(t)), cy0 = H * (.5 + .1 * Math.cos(t * .8));
    const rad = 90 * (1 - u) + 24;
    for (let i = 0; i < 7; i++) {
      const a = i / 7 * TAU + t * .35;
      const rr = Math.max(W, H) * (.08 + .5 * u * (.75 + .25 * Math.sin(a * 3 + t)));
      const x = cx0 + Math.cos(a) * rr, y = cy0 + Math.sin(a) * rr * .72;
      const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
      g.addColorStop(0, 'rgba(238,241,246,' + (.14 * (1 - u)).toFixed(3) + ')');
      g.addColorStop(1, 'rgba(238,241,246,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(x, y, rad, 0, TAU); ctx.fill();
    }
  };

  /* --- 01 流场：粒子跟着正弦向量场走 --- */
  const flow = { parts: [] };
  flow.enter = () => {
    flow.parts = [];
    const n = Math.round(param.value);
    for (let i = 0; i < n; i++) {
      flow.parts.push({ x: rand(0, W), y: rand(0, H), age: rand(6, 70), life: rand(60, 210) });
    }
    clear();
  };
  flow.draw = (u, t, boost) => {
    ctx.save();
    ctx.translate(-tilt * 14, -tilt * 5);
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(8,9,13,.085)';
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';

    const g = ctx.createRadialGradient(W * .5, H * .52, 0, W * .5, H * .52, Math.min(W, H) * .62);
    g.addColorStop(0, 'rgba(72,48,180,' + (.10 * boost).toFixed(3) + ')');
    g.addColorStop(1, 'rgba(8,9,13,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    ctx.lineWidth = 1.2;
    ctx.lineCap = 'round';
    for (const p of flow.parts) {
      const px = p.x, py = p.y;
      const a = Math.sin(p.y * .011 + t * .9) * 1.9 + Math.cos(p.x * .009 - t * .7) * 1.9;
      p.x += Math.cos(a) * 2.7;
      p.y += Math.sin(a) * 2.7;
      if (!Number.isNaN(pointerX)) {
        const dx = p.x - pointerX, dy = p.y - pointerY, d2 = dx * dx + dy * dy;
        if (d2 < 6400 && d2 > 1) {
          const d = Math.sqrt(d2), f = (80 - d) / 40;
          p.x += dx / d * f; p.y += dy / d * f;
        }
      }
      p.age++;
      if (p.x < -8 || p.x > W + 8 || p.y < -8 || p.y > H + 8 || p.age > p.life) {
        p.x = rand(0, W); p.y = rand(0, H); p.age = 0; p.life = rand(60, 190);
        continue;
      }
      const k = p.x / W;
      const r = Math.round(107 + (60 - 107) * k);
      const g2 = Math.round(75 + (203 - 75) * k);
      const fade = Math.min(1, p.age / 12);
      ctx.strokeStyle = 'rgba(' + r + ',' + g2 + ',255,' + (.46 * fade * boost).toFixed(3) + ')';
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    }
    ctx.restore();
    ctx.globalCompositeOperation = 'source-over';
    ctx.lineCap = 'butt';
  };

  /* --- 02 环形网格：手写透视投影的环面 --- */
  const torus = {};
  torus.enter = clear;
  torus.draw = (u, t, boost) => {
    clear();
    const cx = W / 2 + tilt * 26, cy = H * .5;
    const R = Math.min(W, H) * .27;
    const r = R * .34;
    const rotY = t * .55 * boost * (param.value / 55);
    const rotX = .95 + Math.sin(t * .25) * .18;
    const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
    const fov = Math.min(W, H) * 2.4;

    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(W, H) * .62);
    glow.addColorStop(0, 'rgba(107,75,255,' + (.16 * boost).toFixed(3) + ')');
    glow.addColorStop(1, 'rgba(8,9,13,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    const project = (x, y, z) => {
      const y2 = y * cosX - z * sinX;
      const z2 = y * sinX + z * cosX;
      const k = fov / (fov + z2);
      return [cx + x * k, cy + y2 * k];
    };
    const point = (v, uu) => project(
      (R + r * Math.cos(v)) * Math.cos(uu),
      (R + r * Math.cos(v)) * Math.sin(uu),
      r * Math.sin(v)
    );

    ctx.lineWidth = 1;
    for (let i = 0; i < 18; i++) {
      const v = i / 18 * TAU;
      ctx.beginPath();
      for (let j = 0; j <= 60; j++) {
        const [X, Y] = point(v, j / 60 * TAU + rotY);
        j ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y);
      }
      ctx.strokeStyle = 'rgba(122,110,255,' + ((.10 + .22 * (i / 18)) * boost).toFixed(3) + ')';
      ctx.stroke();
    }
    for (let k = 0; k < 10; k++) {
      const uu = k / 10 * TAU + rotY;
      ctx.beginPath();
      for (let i = 0; i <= 40; i++) {
        const [X, Y] = point(i / 40 * TAU, uu);
        i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y);
      }
      ctx.strokeStyle = 'rgba(60,203,255,' + (.12 * boost).toFixed(3) + ')';
      ctx.stroke();
    }
    const vh = (t * .9) % TAU;
    ctx.beginPath();
    for (let j = 0; j <= 90; j++) {
      const [X, Y] = point(vh, j / 90 * TAU + rotY);
      j ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y);
    }
    ctx.strokeStyle = 'rgba(214,238,255,' + (.55 * boost).toFixed(3) + ')';
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.lineWidth = 1;
  };

  /* --- 03 数据波面：透视网格上的行波 --- */
  const wave = {};
  wave.enter = clear;
  wave.draw = (u, t, boost) => {
    clear();
    const cols = 30, rows = 16;
    const ampK = param.value / 100;
    for (let rw = rows - 1; rw >= 0; rw--) {
      const d = (rw + 1) / rows;
      const yBase = H * .44 + d * H * .40;
      const spread = W * .92 * (.22 + .78 * d);
      const amp = H * .075 * (.25 + .75 * d) * boost * ampK;
      const alpha = .12 + .55 * d;
      const xs = [], ys = [];
      for (let c = 0; c <= cols; c++) {
        xs.push(W / 2 + (c / cols - .5) * spread);
        ys.push(yBase
          + Math.sin(c * .42 + t * 1.7 + d * 4) * amp
          + Math.cos(c * .21 - t * 1.1) * amp * .55);
      }
      ctx.beginPath();
      for (let c = 0; c <= cols; c++) c ? ctx.lineTo(xs[c], ys[c]) : ctx.moveTo(xs[c], ys[c]);
      ctx.strokeStyle = 'rgba(96,124,220,' + (alpha * .38).toFixed(3) + ')';
      ctx.stroke();
      for (let c = 0; c <= cols; c++) {
        const k = c / cols;
        const r = Math.round(107 + (60 - 107) * k);
        const g = Math.round(75 + (203 - 75) * k);
        ctx.fillStyle = 'rgba(' + r + ',' + g + ',255,' + alpha.toFixed(3) + ')';
        ctx.fillRect(xs[c] - 1.2, ys[c] - 1.2, 2.4, 2.4);
      }
    }
  };

  /* --- 04 文字切片：字形被横向切条后错位 --- */
  const type = {};
  type.enter = clear;
  type.draw = (u, t, boost) => {
    clear();
    const font = s => '800 ' + s.toFixed(1) + 'px "Arial Black",Impact,Arial,sans-serif';
    let size = Math.min(H * .44, W * .30);
    ctx.font = font(size);
    const mw = ctx.measureText('WEBUI').width;
    if (mw > W * .84) { size *= (W * .84) / mw; ctx.font = font(size); }

    const cx = W / 2 + tilt * 30, cy = H * .46 + tilt * 12;
    const bands = 24;
    const total = size * 1.02;
    const top = cy - total / 2;
    const bh = total / bands;
    const jit = param.value / 100;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let i = 0; i < bands; i++) {
      const y0 = top + i * bh;
      const mid = 1 - Math.abs(i / (bands - 1) - .5) * 2;
      const off = Math.sin(i * .62 + t * 3.2) * size * .13 * mid * boost * jit;
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, y0, W, bh + .6);
      ctx.clip();
      ctx.fillStyle = 'rgba(107,75,255,.55)';
      ctx.fillText('WEBUI', cx + off - 3, cy - 1);
      ctx.fillStyle = 'rgba(60,203,255,.45)';
      ctx.fillText('WEBUI', cx + off + 3, cy + 1);
      ctx.fillStyle = '#f2f4f8';
      ctx.fillText('WEBUI', cx + off, cy);
      ctx.restore();
    }

    const sy = top + ((t * .5) % 1) * total;
    const sg = ctx.createLinearGradient(0, sy - 12, 0, sy + 12);
    sg.addColorStop(0, 'rgba(60,203,255,0)');
    sg.addColorStop(.5, 'rgba(60,203,255,.45)');
    sg.addColorStop(1, 'rgba(60,203,255,0)');
    ctx.fillStyle = sg;
    ctx.fillRect(W * .05, sy - 12, W * .9, 24);

    ctx.font = '9px ui-monospace,Consolas,monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(190,200,220,.42)';
    const tick = '154 MECHANISMS / 81 FILMS / 420 DOCS';
    const tw = ctx.measureText(tick).width;
    const shift = (t * 46) % (tw + 40);
    const x0 = W * .05 - shift;
    ctx.fillText(tick, x0, H * .72);
    ctx.fillText(tick, x0 + tw + 40, H * .72);
    ctx.textAlign = 'center';
  };

  const scenes = [
    { name: '流场', obj: flow, p: { name: '粒子数', min: 120, max: 900, value: 520, unit: '' } },
    { name: '环形网格', obj: torus, p: { name: '旋转速度', min: 20, max: 160, value: 55, unit: '%' } },
    { name: '数据波面', obj: wave, p: { name: '波幅', min: 40, max: 220, value: 100, unit: '%' } },
    { name: '文字切片', obj: type, p: { name: '错位强度', min: 0, max: 200, value: 100, unit: '%' } }
  ];

  const resize = () => {
    W = reelCv.clientWidth || 1;
    H = reelCv.clientHeight || 1;
    reelCv.width = Math.round(W * DPR);
    reelCv.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    if (cur) cur.obj.enter();
  };

  const syncKnob = () => {
    if (!knobName) return;
    knobName.textContent = param.name;
    if (knobVal) {
      knobVal.textContent = String(Math.round(param.value)) + param.unit;
      knobVal.setAttribute('aria-valuemin', String(param.min));
      knobVal.setAttribute('aria-valuemax', String(param.max));
      knobVal.setAttribute('aria-valuenow', String(Math.round(param.value)));
    }
  };

  /* 拖参数的键盘替代：方向键调步进，Shift 加速，Home/End 到端点。
     纯拖拽没有键盘路径，等于把一部分人挡在外面。 */
  const nudgeKnob = delta => {
    const span = param.max - param.min;
    const step = span / 40 * delta;
    param.value = Math.max(param.min, Math.min(param.max, param.value + step));
    syncKnob();
  };

  const enterScene = i => {
    prev = cur;
    idx = i;
    cur = scenes[i];
    Object.assign(param, cur.p);
    cur.obj.enter();
    transT = 1;
    if (nameEl) nameEl.textContent = cur.name;
    if (idxEl) idxEl.textContent = '0' + (i + 1) + ' / 0' + scenes.length;
    syncKnob();
  };

  const tick = ts => {
    const dt = lastTs ? Math.min(64, ts - lastTs) : 0;
    lastTs = ts;
    if (!paused) clock += dt;

    const i = ((Math.floor(clock / SCENE) % scenes.length) + scenes.length) % scenes.length;
    if (i !== idx) enterScene(i);
    const local = ((clock % SCENE) + SCENE) % SCENE / SCENE;

    /* 每播完一轮，整段画面强度往上叠一格（最多 +40%） */
    const boost = 1 + Math.min(.4, Math.floor(clock / SCENE) * .12);

    /* 指针视差：橡皮筋回正，不是死盯 */
    const want = Number.isNaN(pointerX) ? 0 : (pointerX / (W || 1) - .5) * 2;
    tiltV = (tiltV + (want - tilt) * .06 - tiltV * .12) * .86;
    tilt = Math.max(-1, Math.min(1, tilt + tiltV));

    /* 转场期间新画面本身是虚的，聚焦到实——所以要在绘制时就挂 blur */
    ctx.save();
    if (transT > 0 && transMode === 'wash') ctx.filter = 'blur(' + (transT * 7).toFixed(1) + 'px)';
    cur.obj.draw(local, local * SCENE / 1000, boost);
    ctx.restore();

    /* 转场叠层：新画面从模糊里聚焦，旧画面化开（blur 盖住两个状态的缝） */
    if (transT > 0 && transMode === 'wash') {
      transT = Math.max(0, transT - 1 / 24);
      const k = transT;
      if (prev && prev.obj) {
        ctx.save();
        ctx.globalAlpha = k * k;
        ctx.filter = 'blur(' + (k * 9).toFixed(1) + 'px)';
        prev.obj.draw(local * .6, local * SCENE / 1000, boost);
        ctx.restore();
      }
      const u = 1 - k;
      if (u < .35) dissolve(u / .35);
    }

    if (barEl) barEl.style.transform = 'scaleX(' + local.toFixed(4) + ')';
    if (barWrap) barWrap.setAttribute('aria-valuenow', String(Math.round(local * 100)));

    frames++;
    if (ts - fpsAt > 500) {
      fps = Math.round(frames * 1000 / (ts - fpsAt));
      frames = 0; fpsAt = ts;
      const hud = document.getElementById('xrayFps');
      if (hud) hud.textContent = fps + ' fps';
    }
    raf = requestAnimationFrame(tick);
  };

  const start = () => {
    if (raf) return;
    lastTs = 0;
    raf = requestAnimationFrame(tick);
  };
  const stop = () => { cancelAnimationFrame(raf); raf = 0; };

  /* 跳段：只改 clock，时钟与进度条永远一致 */
  const seekScene = delta => {
    const base = Math.floor(clock / SCENE);
    clock = (base + delta) * SCENE;
    const i = ((Math.floor(clock / SCENE) % scenes.length) + scenes.length) % scenes.length;
    if (i !== idx) enterScene(i);
  };

  resize();
  if (reduce) {
    idx = 0;
    cur = scenes[0];
    cur.obj.enter();
    cur.obj.draw(0, .7, 1);
    if (nameEl) nameEl.textContent = cur.name;
    if (idxEl) idxEl.textContent = '01 / 0' + scenes.length;
    if (barEl) barEl.style.transform = 'scaleX(.4)';
    syncKnob();
  } else {
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(es => {
        visible = es[0].isIntersecting;
        if (visible) start(); else stop();
      }, { threshold: .05 });
      io.observe(reelCv);
    } else start();

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stop();
      else if (visible) start();
    });
    addEventListener('resize', () => { stop(); resize(); if (visible) start(); });

    /* 兜底：某些环境（后台标签、合成器未就绪）不触发 IntersectionObserver，
       1.2 秒后还没跑起来就直接开，别让短片哑掉。 */
    setTimeout(() => { if (!raf && visible) start(); }, 1200);

    /* ---------- 拖画面 = 调当前场景参数 ---------- */
    const screen = document.getElementById('reelScreen');
    if (screen) {
      let dragging = false, dragStart = 0, dragBase = 0, moved = false;

      screen.addEventListener('pointerdown', e => {
        if (e.target.closest('.reel-bar')) return;
        dragging = true; moved = false;
        dragStart = e.clientX; dragBase = param.value;
        screen.classList.add('grabbing');
        screen.setPointerCapture(e.pointerId);
        e.preventDefault();
      });
      screen.addEventListener('pointermove', e => {
        const r = screen.getBoundingClientRect();
        pointerX = e.clientX - r.left;
        pointerY = e.clientY - r.top;
        if (!dragging) return;
        const dx = e.clientX - dragStart;
        if (Math.abs(dx) > 3) moved = true;
        /* 统算而不是累加：拖回原处数值精确复原 */
        const span = param.max - param.min;
        param.value = Math.max(param.min, Math.min(param.max, dragBase + dx / 2.2 * span / 100));
        syncKnob();
      });
      const endDrag = e => {
        if (!dragging) return;
        dragging = false;
        screen.classList.remove('grabbing');
        try { screen.releasePointerCapture(e.pointerId); } catch (_) {}
        if (!moved) seekScene(1);       /* 点一下 = 下一段 */
      };
      screen.addEventListener('pointerup', endDrag);
      screen.addEventListener('pointercancel', endDrag);
      screen.addEventListener('pointerleave', () => { pointerX = NaN; pointerY = NaN; });
    }

    /* ---------- 参数滑块：拖 + 键盘两条路 ---------- */
    const knob = knobVal;
    if (knob) {
      let kStart = 0, kBase = 0, kMoved = false;
      knob.addEventListener('pointerdown', e => {
        kMoved = false;
        kStart = e.clientX; kBase = param.value;
        knob.setPointerCapture(e.pointerId);
        e.preventDefault();
        e.stopPropagation();
      });
      knob.addEventListener('pointermove', e => {
        if (!knob.hasPointerCapture?.(e.pointerId) && !kMoved && e.buttons === 0) return;
        const dx = e.clientX - kStart;
        if (Math.abs(dx) > 2) kMoved = true;
        const span = param.max - param.min;
        param.value = Math.max(param.min, Math.min(param.max, kBase + dx / 2.2 * span / 100));
        syncKnob();
      });
      const endKnob = e => {
        try { knob.releasePointerCapture(e.pointerId); } catch (_) {}
      };
      knob.addEventListener('pointerup', endKnob);
      knob.addEventListener('pointercancel', endKnob);
      knob.addEventListener('keydown', e => {
        const big = e.shiftKey ? 5 : 1;
        if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { nudgeKnob(big); e.preventDefault(); }
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { nudgeKnob(-big); e.preventDefault(); }
        else if (e.key === 'Home') { param.value = param.min; syncKnob(); e.preventDefault(); }
        else if (e.key === 'End') { param.value = param.max; syncKnob(); e.preventDefault(); }
      });
    }

    /* ---------- 底栏进度条可拖 ---------- */
    const wrap = barWrap;
    if (wrap) {
      let scrubbing = false;
      const scrubTo = e => {
        const r = wrap.getBoundingClientRect();
        const p = Math.max(0, Math.min(1, (e.clientX - r.left) / (r.width || 1)));
        const base = Math.floor(clock / SCENE) * SCENE;
        clock = base + p * SCENE;
      };
      wrap.addEventListener('pointerdown', e => {
        scrubbing = true;
        wrap.setPointerCapture(e.pointerId);
        scrubTo(e);
        e.preventDefault();
      });
      wrap.addEventListener('pointermove', e => { if (scrubbing) scrubTo(e); });
      const endScrub = e => {
        if (!scrubbing) return;
        scrubbing = false;
        try { wrap.releasePointerCapture(e.pointerId); } catch (_) {}
      };
      wrap.addEventListener('pointerup', endScrub);
      wrap.addEventListener('pointercancel', endScrub);
      wrap.addEventListener('keydown', e => {
        if (e.key === 'ArrowRight') { clock += SCENE * .1; e.preventDefault(); }
        if (e.key === 'ArrowLeft') { clock -= SCENE * .1; e.preventDefault(); }
      });
    }

    /* ---------- 按钮 ---------- */
    const prevBtn = document.getElementById('reelPrev');
    const nextBtn = document.getElementById('reelNext');
    const transBtn = document.getElementById('reelTrans');
    const pauseBtn = document.getElementById('reelPause');
    if (prevBtn) prevBtn.addEventListener('click', () => seekScene(-1));
    if (nextBtn) nextBtn.addEventListener('click', () => seekScene(1));
    if (transBtn) {
      transBtn.addEventListener('click', () => {
        transMode = transMode === 'wash' ? 'cut' : 'wash';
        transBtn.textContent = transMode === 'wash' ? '转场：溶解' : '转场：硬切';
        transBtn.setAttribute('aria-pressed', String(transMode === 'cut'));
        transBtn.setAttribute('aria-label', transMode === 'wash' ? '切镜用噪波溶解过渡' : '切镜用硬切');
      });
    }
    /* 自动播放的片子必须给一个看得见的暂停键（Vercel 界面规范） */
    if (pauseBtn) {
      const syncPause = () => {
        pauseBtn.textContent = paused ? '▶ 继续' : '⏸ 暂停';
        pauseBtn.setAttribute('aria-pressed', String(paused));
      };
      pauseBtn.addEventListener('click', () => { paused = !paused; syncPause(); });
      syncPause();
    }
    const tryReel = document.getElementById('tryReel');
    if (tryReel) tryReel.addEventListener('click', () => {
      document.querySelector('.reel-screen')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    /* ---------- 键盘：空格暂停 / 前后跳段 ---------- */
    document.addEventListener('keydown', e => {
      if (/^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName)) return;
      if (e.code === 'Space') {
        e.preventDefault();
        paused = !paused;
      }
      if (e.key === 'ArrowRight' && e.altKey) seekScene(1);
      if (e.key === 'ArrowLeft' && e.altKey) seekScene(-1);
    });
  }
}

/* ---------- 副标题：计数轮换（竖向词槽） ---------- */
const track = document.getElementById('rotTrack');
if (track && track.children.length > 1 && !reduce) {
  let i = 0;
  const stepH = () => track.children[0].getBoundingClientRect().height || 34;
  setInterval(() => {
    i = (i + 1) % track.children.length;
    track.style.transform = 'translateY(-' + (i * stepH()).toFixed(1) + 'px)';
  }, 2600);
}

/* ============================================================
   数字滚轮：每一位数字各占一列，滚动位置直接驱动进位
   滚回上面，数字会倒着退回去——不是一次性播放的动画
   ============================================================ */
const odoEls = [...document.querySelectorAll('[data-to]')];
const odos = [];

for (const el of odoEls) {
  const target = String(el.dataset.to).trim();
  const sr = el.querySelector('.sr');
  el.textContent = '';
  el.classList.add('odo');

  const strips = [];
  for (let i = 0; i < target.length; i++) {
    const col = document.createElement('span');
    col.className = 'odo-col';
    col.setAttribute('aria-hidden', 'true');

    const strip = document.createElement('span');
    strip.className = 'odo-strip';
    strip.appendChild(document.createElement('i'));      /* 首位留空，避免 099 */
    for (let d = 0; d < 10; d++) {
      const n = document.createElement('span');
      n.textContent = String(d);
      strip.appendChild(n);
    }
    col.appendChild(strip);
    el.appendChild(col);
    strips.push(strip);
  }
  if (sr) el.appendChild(sr);
  odos.push({ el, to: Number(target) || 0, strips, last: -1 });
}

const setOdo = (o, v) => {
  const n = Math.max(0, Math.round(v));
  const width = o.strips.length;
  for (let i = 0; i < width; i++) {
    const place = Math.pow(10, width - 1 - i);
    const digit = Math.floor(n / place) % 10;
    const slot = (place > 1 && n < place) ? 0 : digit + 1;
    if (slot === o['p' + i]) continue;
    o['p' + i] = slot;
    o.strips[i].style.transform = 'translateY(' + (-slot) + 'em)';
  }
};

const paintOdos = () => {
  const vh = innerHeight;
  for (const o of odos) {
    const r = o.el.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (vh * .94 - r.top) / (vh * .36)));
    const eased = 1 - Math.pow(1 - p, 3);
    setOdo(o, o.to * (reduce ? 1 : eased));
  }
};

/* 只有 8 个数字，直接同步算；比等一帧更跟手，滚动时数字才像被手搓出来的 */
const onOdoScroll = () => paintOdos();
if (odos.length) {
  addEventListener('scroll', onOdoScroll, { passive: true });
  addEventListener('resize', onOdoScroll);
  paintOdos();
}

/* ---------- 首屏标目：解码一次（文字乱码逐步收敛） ---------- */
const dec = document.getElementById('decode');
if (dec && !reduce) {
  const text = dec.textContent;
  const CHARS = '!#$%&*+<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const run = () => {
    const t0 = performance.now();
    const step = now => {
      const p = Math.min((now - t0) / 950, 1);
      const settled = Math.floor(text.length * p);
      dec.textContent = text.slice(0, settled) +
        text.slice(settled).replace(/\S/g, () => CHARS[(Math.random() * CHARS.length) | 0]);
      if (p < 1) requestAnimationFrame(step);
      else dec.textContent = text;
    };
    requestAnimationFrame(step);
  };
  setTimeout(run, 900);
}

/* ---------- 滚动浮现（类由脚本加，JS 失效时内容照常可见） ---------- */
const revealEls = [...document.querySelectorAll('[data-rv]')];
if (!reduce && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver(entries => {
    for (const en of entries) if (en.isIntersecting) { en.target.classList.add('on'); io.unobserve(en.target); }
  }, { rootMargin: '0px 0px -12% 0px' });
  revealEls.forEach(el => { el.classList.add('rv'); io.observe(el); });

  /* 兜底：某些环境（窗口被遮挡、后台标签页）IO 回调会停滞，
     滚动时自己补一遍——不能因为观察器不回调就让内容一直隐形。 */
  let rvQueued = 0;
  const sweep = () => {
    rvQueued = 0;
    for (const el of revealEls) {
      if (el.classList.contains('on')) continue;
      const r = el.getBoundingClientRect();
      if (r.top < innerHeight * 1.05 && r.bottom > -60) el.classList.add('on');
    }
  };
  const queueSweep = () => {
    if (rvQueued) return;
    rvQueued = requestAnimationFrame(sweep);
  };
  addEventListener('scroll', queueSweep, { passive: true });
  addEventListener('resize', queueSweep);
  setTimeout(sweep, 1200);
}

/* ============================================================
   理念标题：滚动逐字充能（karaoke-fill 的双层 mask 思路）
   底层是暗字，上层同文本用 mask 按进度揭开；
   进度由「标题在视口里的位置」推出来，不是时间轴。
   ============================================================ */
const ideaTitle = document.getElementById('ideaTitle');
if (ideaTitle) {
  const raw = ideaTitle.textContent.trim();
  const build = () => {
    ideaTitle.innerHTML = '';
    const base = document.createElement('span');
    base.className = 'kr-base';
    base.textContent = raw;
    const fill = document.createElement('span');
    fill.className = 'kr-fill';
    fill.textContent = raw;
    const caret = document.createElement('span');
    caret.className = 'kr-caret';
    ideaTitle.appendChild(base);
    ideaTitle.appendChild(fill);
    ideaTitle.appendChild(caret);
    ideaTitle.classList.add('kr');
    return { fill, caret, base };
  };

  if (reduce) {
    ideaTitle.classList.add('kr');
    const base = document.createElement('span');
    base.className = 'kr-base';
    base.textContent = raw;
    ideaTitle.innerHTML = '';
    ideaTitle.appendChild(base);
    ideaTitle.classList.remove('kr');
  } else {
    const parts = build();
    const paint = () => {
      const r = ideaTitle.getBoundingClientRect();
      /* 标题顶部刚进视口 → 0；标题中心到视口 45% → 1 */
      const p = Math.max(0, Math.min(1, (innerHeight * .92 - r.top) / (r.height * .85 + 1)));
      const FEATHER = 4;
      const edge = p * (100 + FEATHER * 2) - FEATHER;
      const m = 'linear-gradient(90deg,#000 ' + (edge - FEATHER).toFixed(2) + '%,transparent ' + (edge + FEATHER).toFixed(2) + '%)';
      parts.fill.style.webkitMaskImage = m;
      parts.fill.style.maskImage = m;
      parts.fill.style.opacity = p > 0 ? '1' : '0';
      parts.caret.style.opacity = p > .02 && p < .99 ? '1' : '0';
      parts.caret.style.left = '0%';
      parts.caret.style.width = Math.max(0, p * 100).toFixed(2) + '%';
    };
    let queued = false;
    const onScroll = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => { queued = false; paint(); });
    };
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll);
    paint();
  }
}

/* ============================================================
   X-Ray 拆解模式：把整页正在跑的机制标出来
   ============================================================ */
const xrayBtn = document.getElementById('xrayBtn');
if (xrayBtn) {
  const FX = [    ['.reel', '四场景实时短片', 'portal.js · canvas 2d'],
    ['.statband .stat:nth-child(1) b', '数字滚轮', 'rolling-number'],
    ['.statband .stat:nth-child(2) b', '数字滚轮', 'rolling-number'],
    ['.statband .stat:nth-child(3) b', '数字滚轮', 'rolling-number'],
    ['.statband .stat:nth-child(4) b', '数字滚轮', 'rolling-number'],
    ['.hero-title', '渐变扫光充能词', 'gradient-word-sweep'],
    ['.rot', '词槽老虎机', 'pill-slot-cycle'],
    ['#decode', '文字解码', 'text-scramble'],
    ['#magnet', '磁吸按钮', 'magnetic-btn'],
    ['.beam-card', '边框光束', 'border-beam'],
    ['#ideaTitle', '滚动逐字充能', 'karaoke-fill'],
    ['.filters', '分段滑块', 'segmented-thumb']
  ];
  let on = false;
  const apply = () => {
    document.documentElement.classList.toggle('xray', on);
    xrayBtn.classList.toggle('on', on);
    xrayBtn.setAttribute('aria-pressed', String(on));
    const hud = document.getElementById('xrayHud');
    if (hud) hud.setAttribute('aria-hidden', String(!on));
    for (const [sel, label, note] of FX) {
      const el = document.querySelector(sel);
      if (!el) continue;
      if (on) {
        el.classList.add('fx');
        el.setAttribute('data-fx', label + (note && note !== '—' ? ' · ' + note : ''));
      } else {
        el.classList.remove('fx');
        el.removeAttribute('data-fx');
      }
    }
  };
  xrayBtn.addEventListener('click', () => { on = !on; apply(); });
  document.addEventListener('keydown', e => {
    if (e.key !== 'x' && e.key !== 'X') return;
    if (/^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName)) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    on = !on; apply();
  });

  /* 试用区按钮：把入口摆在明面上，别让人自己找 */
  const tryXray = document.getElementById('tryXray');
  if (tryXray) tryXray.addEventListener('click', () => { on = !on; apply(); document.querySelector('#proof')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
}

/* ============================================================
   合成音效：Web Audio 实时算，零音频文件（tone-click 的做法）
   默认关闭；开了之后只有短促的机械咔嗒，不抢注意力。
   ============================================================ */
const soundBtn = document.getElementById('soundBtn');
if (soundBtn) {
  let ac = null, on = false;
  const ensureAc = () => {
    if (ac) return ac;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ac = new AC();
    return ac;
  };
  /* 一个短促的方波咔嗒：频率下滑 + 指数衰减 */
  const tick = (freq, gain) => {
    const c = ensureAc();
    if (!c || !on) return;
    if (c.state === 'suspended') c.resume();
    const t = c.currentTime;
    const o = c.createOscillator(), g = c.createGain();
    o.type = 'square';
    o.frequency.setValueAtTime(freq, t);
    o.frequency.exponentialRampToValueAtTime(freq * .55, t + .05);
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(.0001, t + .07);
    o.connect(g); g.connect(c.destination);
    o.start(t); o.stop(t + .08);
    o.onended = () => { o.disconnect(); g.disconnect(); };
  };
  soundBtn.addEventListener('click', () => {
    on = !on;
    soundBtn.classList.toggle('on', on);
    soundBtn.setAttribute('aria-pressed', String(on));
    if (on) { ensureAc(); tick(880, .05); }
  });
  const trySound = document.getElementById('trySound');
  if (trySound) trySound.addEventListener('click', () => {
    on = !on;
    soundBtn.classList.toggle('on', on);
    soundBtn.setAttribute('aria-pressed', String(on));
    if (on) { ensureAc(); tick(880, .05); }
  });
  document.addEventListener('pointerdown', () => tick(1320, .035), true);
  document.addEventListener('keydown', () => tick(1320, .03), true);
}

/* ---------- 动效开关：永远可见，想关随时关 ---------- */
const pill = document.getElementById('motionPill');
if (pill) {
  const txt = document.getElementById('motionTxt');
  pill.hidden = false;
  pill.dataset.on = reduce ? '0' : '1';
  txt.textContent = reduce
    ? '动效已关'
    : (sysReduce ? '动效：开（系统建议减弱）' : '动效：开');
  pill.title = reduce ? '点击开启动效' : '点击关闭动效';
  pill.addEventListener('click', () => {
    try { localStorage.setItem('arsenal-motion', reduce ? 'on' : 'off'); } catch (_) {}
    location.replace(location.pathname + location.hash);
  });
}

/* ---------- 磁吸按钮 ---------- */
const mag = document.getElementById('magnet');
if (mag && !reduce && matchMedia('(pointer:fine)').matches) {
  mag.addEventListener('pointermove', e => {
    const r = mag.getBoundingClientRect();
    const dx = (e.clientX - r.left - r.width / 2) * .16;
    const dy = (e.clientY - r.top - r.height / 2) * .28;
    mag.style.transform = 'translate(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px)';
  });
  mag.addEventListener('pointerleave', () => { mag.style.transform = ''; });
}
