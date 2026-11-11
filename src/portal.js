/* ============================================================
   portal.js —— 首页的动态层
   原则：JS 只做增强。所有内容在 HTML 里已经可读，
   脚本挂了、rAF 不跑、用户开了减少动效，页面都要完整可用。
   ============================================================ */

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- 顶栏：滚动后加深 ---------- */
const bar = document.getElementById('topbar');
if (bar) {
  const onScroll = () => bar.classList.toggle('scrolled', window.scrollY > 12);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ============================================================
   首屏短片：四个场景，每 4.2 秒硬切一次，全部实时算出来
   没有视频文件、没有 GIF、没有第三方库。
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

  let W = 0, H = 0, raf = 0, started = 0, idx = -1, cur = null, visible = true;
  const rand = (a, b) => a + Math.random() * (b - a);
  const clear = () => { ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H); };

  /* --- 01 流场：粒子跟着正弦向量场走 --- */
  const flow = { parts: [] };
  flow.enter = () => {
    flow.parts = [];
    for (let i = 0; i < 520; i++) {
      flow.parts.push({ x: rand(0, W), y: rand(0, H), age: rand(6, 70), life: rand(60, 210) });
    }
    clear();
  };
  flow.draw = (u, t) => {
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(8,9,13,.085)';
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';

    /* 底部一层缓慢呼吸的紫光，避免画面发死 */
    const g = ctx.createRadialGradient(W * .5, H * .52, 0, W * .5, H * .52, Math.min(W, H) * .62);
    g.addColorStop(0, 'rgba(72,48,180,.10)');
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
      p.age++;
      if (p.x < -8 || p.x > W + 8 || p.y < -8 || p.y > H + 8 || p.age > p.life) {
        p.x = rand(0, W); p.y = rand(0, H); p.age = 0; p.life = rand(40, 190);
        continue;
      }
      const k = p.x / W;
      const r = Math.round(107 + (60 - 107) * k);
      const g2 = Math.round(75 + (203 - 75) * k);
      const fade = Math.min(1, p.age / 12);
      ctx.strokeStyle = 'rgba(' + r + ',' + g2 + ',255,' + (.46 * fade).toFixed(3) + ')';
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    }
    ctx.globalCompositeOperation = 'source-over';
    ctx.lineCap = 'butt';
  };

  /* --- 02 环形网格：手写透视投影的环面 --- */
  const torus = {};
  torus.enter = clear;
  torus.draw = (u, t) => {
    clear();
    const cx = W / 2, cy = H * .5;
    const R = Math.min(W, H) * .27;
    const r = R * .34;
    const rotY = t * .55;
    const rotX = .95 + Math.sin(t * .25) * .18;
    const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
    const fov = Math.min(W, H) * 2.4;

    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(W, H) * .62);
    glow.addColorStop(0, 'rgba(107,75,255,.16)');
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
      ctx.strokeStyle = 'rgba(122,110,255,' + (.10 + .22 * (i / 18)).toFixed(3) + ')';
      ctx.stroke();
    }
    for (let k = 0; k < 10; k++) {
      const uu = k / 10 * TAU + rotY;
      ctx.beginPath();
      for (let i = 0; i <= 40; i++) {
        const [X, Y] = point(i / 40 * TAU, uu);
        i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y);
      }
      ctx.strokeStyle = 'rgba(60,203,255,.12)';
      ctx.stroke();
    }
    /* 沿管壁跑的一圈高光 */
    const vh = (t * .9) % TAU;
    ctx.beginPath();
    for (let j = 0; j <= 90; j++) {
      const [X, Y] = point(vh, j / 90 * TAU + rotY);
      j ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y);
    }
    ctx.strokeStyle = 'rgba(214,238,255,.55)';
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.lineWidth = 1;
  };

  /* --- 03 数据波面：透视网格上的行波 --- */
  const wave = {};
  wave.enter = clear;
  wave.draw = (u, t) => {
    clear();
    const cols = 30, rows = 16;
    for (let rw = rows - 1; rw >= 0; rw--) {
      const d = (rw + 1) / rows;
      const yBase = H * .44 + d * H * .40;
      const spread = W * .92 * (.22 + .78 * d);
      const amp = H * .075 * (.25 + .75 * d);
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
  type.draw = (u, t) => {
    clear();
    const font = s => '800 ' + s.toFixed(1) + 'px "Arial Black",Impact,Arial,sans-serif';
    let size = Math.min(H * .44, W * .30);
    ctx.font = font(size);
    const mw = ctx.measureText('WEBUI').width;
    if (mw > W * .84) { size *= (W * .84) / mw; ctx.font = font(size); }

    const cx = W / 2, cy = H * .46;
    const bands = 24;
    const total = size * 1.02;
    const top = cy - total / 2;
    const bh = total / bands;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let i = 0; i < bands; i++) {
      const y0 = top + i * bh;
      const mid = 1 - Math.abs(i / (bands - 1) - .5) * 2;
      const off = Math.sin(i * .62 + t * 3.2) * size * .13 * mid;
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
    { name: '流场', obj: flow },
    { name: '环形网格', obj: torus },
    { name: '数据波面', obj: wave },
    { name: '文字切片', obj: type }
  ];

  const resize = () => {
    W = reelCv.clientWidth || 1;
    H = reelCv.clientHeight || 1;
    reelCv.width = Math.round(W * DPR);
    reelCv.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    if (cur) cur.obj.enter();
  };

  const tick = ts => {
    if (!started) started = ts;
    const el = ts - started;
    const i = Math.floor(el / SCENE) % scenes.length;
    if (i !== idx) {
      idx = i;
      cur = scenes[i];
      cur.obj.enter();
      if (nameEl) nameEl.textContent = cur.name;
      if (idxEl) idxEl.textContent = '0' + (i + 1) + ' / 0' + scenes.length;
    }
    const local = (el % SCENE) / SCENE;
    cur.obj.draw(local, local * SCENE / 1000);
    if (barEl) barEl.style.transform = 'scaleX(' + local.toFixed(4) + ')';
    raf = requestAnimationFrame(tick);
  };

  const start = () => {
    if (raf) return;
    started = 0;
    idx = -1;
    raf = requestAnimationFrame(tick);
  };
  const stop = () => { cancelAnimationFrame(raf); raf = 0; };

  resize();
  if (reduce) {
    idx = 0;
    cur = scenes[0];
    cur.obj.enter();
    cur.obj.draw(0, .7);
    if (nameEl) nameEl.textContent = cur.name;
    if (idxEl) idxEl.textContent = '01 / 0' + scenes.length;
    if (barEl) barEl.style.transform = 'scaleX(.4)';
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

/* ---------- 数字滚动：进视口才跑 ---------- */
const counters = [...document.querySelectorAll('[data-count]')];
const runCount = el => {
  const to = Number(el.dataset.count) || 0;
  if (reduce) { el.textContent = String(to); return; }
  const t0 = performance.now(), dur = 1100;
  const step = now => {
    const p = Math.min((now - t0) / dur, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = String(Math.round(to * eased));
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
};
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(entries => {
    for (const en of entries) if (en.isIntersecting) { io.unobserve(en.target); runCount(en.target); }
  }, { threshold: .4 });
  counters.forEach(c => io.observe(c));
} else counters.forEach(runCount);

/* ---------- 滚动浮现（类由脚本加，JS 失效时内容照常可见） ---------- */
const revealEls = [...document.querySelectorAll('[data-rv]')];
if (!reduce && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver(entries => {
    for (const en of entries) if (en.isIntersecting) { en.target.classList.add('on'); io.unobserve(en.target); }
  }, { rootMargin: '0px 0px -12% 0px' });
  revealEls.forEach(el => { el.classList.add('rv'); io.observe(el); });

  /* 兜底：某些环境（窗口被遮挡、后台标签页）IO 回调会停滞，
     1.2s 后把已经落在视口里的元素直接放出来，避免空白。 */
  setTimeout(() => {
    for (const el of revealEls) {
      if (el.classList.contains('on')) continue;
      const r = el.getBoundingClientRect();
      if (r.top < innerHeight * 1.15 && r.bottom > -60) el.classList.add('on');
    }
  }, 1200);
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
