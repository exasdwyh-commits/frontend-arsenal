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

/* ---------- 首屏背景：三层漂移光斑（Canvas 2D） ---------- */
const cv = document.getElementById('heroCanvas');
if (cv && cv.getContext) {
  const ctx = cv.getContext('2d');
  const DPR = Math.min(window.devicePixelRatio || 1, 1.5);
  const blobs = [
    { x: .20, y: .28, r: .62, c: [94, 56, 255], ax: .06, ay: .04, fx: .00021, fy: .00017, ph: 0.0 },
    { x: .80, y: .24, r: .55, c: [38, 146, 255], ax: .05, ay: .05, fx: .00017, fy: .00023, ph: 1.7 },
    { x: .54, y: .82, r: .62, c: [150, 58, 255], ax: .07, ay: .03, fx: .00013, fy: .00019, ph: 3.1 },
    { x: .90, y: .70, r: .34, c: [0, 190, 220], ax: .05, ay: .04, fx: .00025, fy: .00015, ph: 4.4 }
  ];
  let w = 0, h = 0, raf = 0;

  const resize = () => {
    w = cv.clientWidth || innerWidth;
    h = cv.clientHeight || innerHeight;
    cv.width = Math.round(w * DPR);
    cv.height = Math.round(h * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  };

  const frame = t => {
    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'lighter';
    for (const b of blobs) {
      const cx = (b.x + Math.sin(t * b.fx + b.ph) * b.ax) * w;
      const cy = (b.y + Math.cos(t * b.fy + b.ph) * b.ay) * h;
      const r = b.r * Math.max(w, h) * (0.86 + 0.14 * Math.sin(t * b.fx * 1.6 + b.ph));
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      const [rr, gg, bb] = b.c;
      g.addColorStop(0, 'rgba(' + rr + ',' + gg + ',' + bb + ',.22)');
      g.addColorStop(.5, 'rgba(' + rr + ',' + gg + ',' + bb + ',.06)');
      g.addColorStop(1, 'rgba(' + rr + ',' + gg + ',' + bb + ',0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, 6.2832);
      ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
    if (!reduce) raf = requestAnimationFrame(frame);
  };

  resize();
  if (reduce) frame(0);
  else {
    raf = requestAnimationFrame(frame);
    addEventListener('resize', () => { cancelAnimationFrame(raf); resize(); raf = requestAnimationFrame(frame); });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else { cancelAnimationFrame(raf); raf = requestAnimationFrame(frame); }
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
