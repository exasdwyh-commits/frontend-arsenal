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

    /* 兜底：某些环境（后台标签、合成器未就绪）不触发 IntersectionObserver，
       1.2 秒后还没跑起来就直接开，别让短片哑掉。 */
    setTimeout(() => { if (!raf && visible) start(); }, 1200);
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
     1.2s 后把已经落在视口里的元素直接放出来，避免空白。 */
  setTimeout(() => {
    for (const el of revealEls) {
      if (el.classList.contains('on')) continue;
      const r = el.getBoundingClientRect();
      if (r.top < innerHeight * 1.15 && r.bottom > -60) el.classList.add('on');
    }
  }, 1200);
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
