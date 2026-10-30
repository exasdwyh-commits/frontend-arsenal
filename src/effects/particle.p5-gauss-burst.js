export default {
  id: 'p5-gauss-burst', group: 'particle', name: '高斯爆发', lib: 'p5.js',
  desc: '粒子飞散角度与速度都取高斯分布，中心密、边缘稀，是"火花感"和"雪碧点子"的分水岭。',
  deps: '无（Box-Muller 已内联）',
  note: '均匀随机的爆炸看起来是一个空心圆环；角度必须 uniform、速度必须 gaussian。randomGaussian 用的是 Box-Muller 并缓存第二个值（_gaussian_previous），如果你自己也缓存一次就会双倍相关。标准差取平均速度的 0.3~0.45 最像真实火花，超过 0.8 会出现"甩出去一串"。',
  code: `// p5：角度均匀 + 速度高斯 = 真实火花
const ang = random(TWO_PI);
const spd = abs(randomGaussian(meanSpeed, meanSpeed * 0.38));
const v = p5.Vector.fromAngle(ang).mult(spd);
// 或者一次给方差：
// position: createVector(x,y), velocity: p5.Vector.random2D().mult(abs(randomGaussian(4, 1.6)))

// p5 源码（randomGaussian）就是 Box-Muller，并缓存第二个正态值：
let y1, x1, x2, w;
do { x1 = random(2) - 1; x2 = random(2) - 1; w = x1*x1 + x2*x2; } while (w >= 1);
w = sqrt(-2 * log(w) / w);
y1 = x1 * w;  /* y2 = x2 * w 缓存，下次直接用，别重复消耗随机数 */`,
  init(el) {
    const DPR = Math.min(2, el.ownerDocument.defaultView.devicePixelRatio || 1);
    const W = Math.min(300, el.clientWidth || 300), H = 130;
    const doc = el.ownerDocument;
    const cv = doc.createElement('canvas');
    cv.width = W * DPR; cv.height = H * DPR;
    cv.style.width = W + 'px'; cv.style.height = H + 'px'; cv.style.display = 'block';
    const ctx = cv.getContext('2d');
    ctx.scale(DPR, DPR);
    el.innerHTML = ''; el.appendChild(cv);
    let raf = 0;
    const destroy = () => cancelAnimationFrame(raf);
    // Box-Muller，与 p5.randomGaussian 同构（含第二值缓存）
    let g2 = null, hasG2 = false;
    const gauss = (mean = 0, sd = 1) => {
      let y1;
      if (hasG2) { y1 = g2; hasG2 = false; }
      else {
        let x1, x2, w;
        do { x1 = Math.random() * 2 - 1; x2 = Math.random() * 2 - 1; w = x1 * x1 + x2 * x2; } while (w >= 1 || w === 0);
        w = Math.sqrt(-2 * Math.log(w) / w);
        y1 = x1 * w; g2 = x2 * w; hasG2 = true;
      }
      return y1 * sd + mean;
    };
    const parts = [];
    const BURST = 90, GRAV = 0.055, DRAG = 0.978;
    const spawn = () => {
      const cx = W / 2 + gauss(0, 3), cy = H * 0.62;
      for (let i = 0; i < BURST; i++) {
        const ang = Math.random() * Math.PI * 2;
        const spd = Math.abs(gauss(3.1, 1.25));
        const hue = 250 + Math.random() * 60;
        parts.push({
          x: cx, y: cy, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd * 0.62 - 1.2,
          life: 1, hue, r: 0.8 + Math.random() * 1.6
        });
      }
    };
    let next = 0;
    const tick = (now) => {
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgba(14,17,24,.28)';
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter';
      if (now >= next) { spawn(); next = now + 1500; }
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.vy += GRAV; p.vx *= DRAG; p.vy *= DRAG;
        p.x += p.vx; p.y += p.vy;
        p.life -= 0.011;
        if (p.life <= 0 || p.y > H + 20) { parts.splice(i, 1); continue; }
        const a = Math.max(0, p.life) * 0.9;
        ctx.fillStyle = 'hsla(' + p.hue + ',95%,' + (62 + p.life * 25) + '%,' + a.toFixed(3) + ')';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * (0.5 + p.life * 0.8), 0, 6.2832);
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return destroy;
  }
};
