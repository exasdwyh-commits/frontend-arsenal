export default {
  id: 'crt-tape', group: 'particle', name: 'CRT 录像带后期', lib: '原生 WebGL + Canvas 2D',
  desc: '场景先画进离屏 2D 画布，再过一遍 WebGL 单通道 CRT 后期：YCbCr 色度横向渗透（亮度保持锐利）+ 扫描线随亮度收窄暗缝 + RGB 荫罩 + 开机亮点拉线 + 磁头切换逐行撕裂。移植自 lemo-opuscar 的 core/post/crt.js（MIT）。',
  deps: '无（原生 WebGL）',
  note: '核心机制是「只糊色度不糊亮度」：先把 RGB 转 YCbCr，Y 取中心像素（保持锐利），Cb/Cr 才做 7 tap 横向平均，且 Cr 要多偏移 1-2px（红色拖尾）——直接对 RGB 横向平均会把亮度一起糊掉，就没有 VHS 味了。扫描线用 cos 相位生成 3px 周期，暗缝深度要乘 (1-0.6*亮度)：暗部全按固定深度压会糊成一片。开机动画里 sy 从 0.003 起不能为 0（除零 + 全屏白），boost 用 pow(1-sy,3) 让亮线在开启瞬间最亮。磁头切换噪波只在底部 5% 行，逐行撕裂用按行 hash（h1(line*.13+frame*7.1)），整块位移就没有逐行感。',
  code: `/* 第一步：场景画进离屏 2D 画布（色条 + 时码 + PLAY/REC） */
sctx.fillRect(0, 0, W, H);            // 每帧重绘
drawBars(sctx); drawTimecode(sctx, fc);

/* 第二步：单通道 CRT 片元着色器（WebGL1）——机制核心 */
// ① 色度渗透：Y 取中心（锐利），Cb/Cr 横向 7 tap 平均，Cr 再右移 rshift
vec3 samp(vec2 q) {
  float Y  = rgb2yc(texture2D(scene, q).rgb).x;          // 亮度不参与平均
  for (int i = -4; i <= 4; i++) {
    if (abs(float(i)) > bleed * 0.5) continue;
    cb += rgb2yc(texture2D(scene, q + s * vec2(fi, 0)).rgb).y;
    cr += rgb2yc(texture2D(scene, q + s * vec2(fi - rshift, 0)).rgb).z;
  }
  return yc2rgb(vec3(Y, cb / n, cr / n));                // 只有色度被涂抹
}
// ② 开机：亮点先横向拉成线，再纵向张开；boost 拉出白色扫描亮线
sx = smoothstep(0.0, .3, power);  sy = max(.003, smoothstep(.3, 1.0, power));
boost = pow(1.0 - sy, 3.0);
q = vec2(.5 + (q.x - .5) / sx, .5 + (q.y - .5) / sy);
// ③ 磁头切换：逐行 hash 撕裂 + 滚动噪波带 + 底部 5% 换头条
q.x += (h1(line * .13 + frame * 7.1) - .5) * .012 * track * (1.0 + band * 5.0);
// ④ 扫描线：cos 相位 3px 周期，暗缝随亮度收窄
ph = .5 - .5 * cos(6.2831853 * P.y / 3.0);
c *= 1.0 - scan * ph * (1.0 - .6 * L);
// ⑤ RGB 荫罩：每 3px 一列分别放大 R/G/B
m = vec3(1.0 - grille); if (gx == 0) m.r = 1.0 + grille * 2.0; ...`,

  init(el) {
    const STYLE = '<style data-fx="crt-tape">' +
      '.crt{position:relative;width:100%;height:100%;overflow:hidden;background:#000}' +
      '.crt canvas{position:absolute;inset:0;display:block;width:100%;height:100%}' +
      '.crt-cap{position:absolute;bottom:3px;left:0;right:0;text-align:center;font-size:8px;' +
        'color:rgba(180,255,220,.5);letter-spacing:.12em;text-transform:uppercase;z-index:9;' +
        'pointer-events:none}' +
      '</style>';

    el.insertAdjacentHTML('beforeend', STYLE +
      '<div class="crt"><canvas id="crtOut"></canvas><div class="crt-cap">chroma bleed · scanline · power-on</div></div>');

    const W = 560, H = 300;
    const out = el.querySelector('#crtOut');
    out.width = W; out.height = H;

    // ---- 离屏场景画布 ----
    const scene = document.createElement('canvas');
    scene.width = W; scene.height = H;
    const sctx = scene.getContext('2d');

    const pad2 = n => (n < 10 ? '0' : '') + n;
    function drawScene(t, fc) {
      sctx.fillStyle = '#000';
      sctx.fillRect(0, 0, W, H);
      // 7 条主色条
      const cols = ['#bfbfbf', '#bfbf00', '#00bfbf', '#00bf00', '#bf00bf', '#bf0000', '#0000bf'];
      const bh = Math.round(H * 0.58);
      for (let i = 0; i < 7; i++) {
        sctx.fillStyle = cols[i];
        sctx.fillRect(Math.round(i * W / 7), 0, Math.ceil(W / 7) + 1, bh);
      }
      // 扫光带扫过色条
      const sx = ((t * 0.16) % 1) * (W + 140) - 70;
      const g = sctx.createLinearGradient(sx - 55, 0, sx + 55, 0);
      g.addColorStop(0, 'rgba(255,255,255,0)');
      g.addColorStop(0.5, 'rgba(255,255,255,.38)');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      sctx.fillStyle = g;
      sctx.fillRect(sx - 55, 0, 110, bh);
      // PLUGE 暗阶条
      const sub = ['#000014', '#001414', '#140014', '#141400', '#000000', '#0d0d0d', '#1a1a1a'];
      const py = bh, ph2 = 24;
      for (let i = 0; i < 7; i++) {
        sctx.fillStyle = sub[i];
        sctx.fillRect(Math.round(i * W / 7), py, Math.ceil(W / 7) + 1, ph2);
      }
      // 下半黑场
      sctx.fillStyle = '#050505';
      sctx.fillRect(0, py + ph2, W, H - py - ph2);
      // PLAY 标签
      sctx.fillStyle = 'rgba(0,0,0,.78)';
      sctx.fillRect(10, 10, 128, 32);
      sctx.fillStyle = '#eaeaea';
      sctx.font = 'bold 19px "Cascadia Mono",Consolas,monospace';
      sctx.fillText('\u25B6 PLAY', 22, 33);
      // REC 红点（闪烁）
      if (Math.floor(t * 2) % 2 === 0) {
        sctx.fillStyle = '#ff2d2d';
        sctx.beginPath(); sctx.arc(W - 108, 27, 9, 0, 6.2832); sctx.fill();
      }
      sctx.fillStyle = '#eaeaea';
      sctx.font = 'bold 17px Consolas,monospace';
      sctx.fillText('REC', W - 90, 34);
      // 时码
      const ff = fc % 30, ss = Math.floor(fc / 30) % 60, mm = Math.floor(fc / 1800) % 60;
      const tc = '00:' + pad2(mm) + ':' + pad2(ss) + ':' + pad2(ff);
      sctx.fillStyle = 'rgba(0,0,0,.78)';
      sctx.fillRect(10, H - 46, 214, 36);
      sctx.fillStyle = '#eaeaea';
      sctx.font = 'bold 23px "Cascadia Mono",Consolas,monospace';
      sctx.fillText(tc, 22, H - 20);
      // 右下跳动虚线块
      const base = Math.floor(t * 6);
      for (let i = 0; i < 11; i++) {
        if ((base + i) % 4 < 2) {
          sctx.fillStyle = '#cfcfcf';
          sctx.fillRect(W - 156 + i * 14, H - 44, 9, 14);
        }
      }
    }

    // ---- WebGL CRT 通道 ----
    const gl = out.getContext('webgl', { preserveDrawingBuffer: true, antialias: false, alpha: false });
    if (!gl) { el.innerHTML = '<div class="ph">需要 WebGL</div>'; return () => {}; }

    const vs = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
    const fs = 'precision highp float;' +
      'uniform sampler2D uS;uniform vec2 uRes;uniform float uF,uPw,uTk;' +
      'float h1(float n){return fract(sin(n*127.1+311.7)*43758.5453);}' +
      'float h2(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}' +
      'vec3 rgb2yc(vec3 c){float Y=dot(c,vec3(.299,.587,.114));return vec3(Y,(c.b-Y)*.564,(c.r-Y)*.713);}' +
      'vec3 yc2rgb(vec3 y){return vec3(y.x+1.403*y.z,y.x-.344*y.y-.714*y.z,y.x+1.773*y.y);}' +
      // ① 色度渗透：Y 锐利，Cb/Cr 横向涂抹 + 红色右移
      'vec3 samp(vec2 q){' +
      '  vec2 s=1.0/uRes;' +
      '  float Y=rgb2yc(texture2D(uS,q).rgb).x;' +
      '  float cb=0.0,cr=0.0,n=0.0;' +
      '  for(int i=-4;i<=4;i++){float fi=float(i);if(abs(fi)>3.5)continue;' +
      '    cb+=rgb2yc(texture2D(uS,q+s*vec2(fi,0.0)).rgb).y;' +
      '    cr+=rgb2yc(texture2D(uS,q+s*vec2(fi-2.0,0.0)).rgb).z;n+=1.0;}' +
      '  return yc2rgb(vec3(Y,cb/n,cr/n));}' +
      // 高光晕（8 tap 环 + 红色 halation）
      'vec3 halo(vec2 q){vec2 s=1.0/uRes;vec3 g=vec3(0.0);' +
      '  for(int i=0;i<8;i++){float a=float(i)*0.785398;' +
      '    g+=max(texture2D(uS,q+vec2(cos(a),sin(a))*s*5.0).rgb-0.5,0.0);}' +
      '  return g*0.125;}' +
      'void main(){' +
      '  vec2 uv=gl_FragCoord.xy/uRes;vec2 q=uv;' +
      // ② 开机：点 → 横线 → 纵向张开
      '  float sx=1.0,sy=1.0,boost=0.0;' +
      '  if(uPw<1.0){sx=smoothstep(0.0,0.3,uPw);sy=max(0.003,smoothstep(0.3,1.0,uPw));boost=pow(1.0-sy,3.0);}' +
      '  q=vec2(0.5+(q.x-0.5)/max(sx,0.001),0.5+(q.y-0.5)/sy);' +
      // ③ 磁头切换：逐行撕裂 + 滚动噪波带 + 底部换头条
      '  if(uTk>0.0){' +
      '    float by=h1(floor(uF))*0.7+0.15;' +
      '    float band=smoothstep(0.07,0.0,abs(uv.y-by));' +
      '    float line=floor(uv.y*uRes.y*0.5);' +
      '    q.x+=(h1(line*0.13+uF*7.1)-0.5)*0.012*uTk*(1.0+band*5.0);' +
      '    q.x+=band*uTk*0.03*sin(uF*3.0);' +
      '    q.y+=(h1(uF*1.3)-0.5)*0.012*uTk;' +
      '    if(uv.y<0.05)q.x+=0.03*uTk*(h1(floor(uv.y*uRes.y)+uF)-0.3);}' +
      '  vec3 c=samp(q);' +
      // 晕光 + 红色 halation
      '  vec3 hl=halo(q);c+=hl*0.55+vec3(1.0,0.34,0.16)*hl*0.3;' +
      '  c=clamp(c,0.0,1.0);' +
      // 调色：饱和 / 对比 / 冷阴影
      '  float l=dot(c,vec3(.299,.587,.114));' +
      '  c=clamp(mix(vec3(l),c,1.06),0.0,1.0);' +
      '  c=mix(c,c*c*(3.0-2.0*c),0.15);' +
      '  c=c*vec3(1.0,0.985,0.97)+0.04*vec3(.16,.08,.22);' +
      '  if(q.x<0.0||q.x>1.0||q.y<0.0||q.y>1.0)c=vec3(0.0);' +
      // 信号噪波
      '  vec2 P=uv*uRes;' +
      '  c+=(h2(P+uF*17.0)-0.5)*0.02;' +
      // ④ 扫描线（随亮度收窄）
      '  float L=dot(clamp(c,0.0,1.0),vec3(.3,.59,.11));' +
      '  float ph=0.5-0.5*cos(6.2831853*P.y/3.0);' +
      '  c*=1.0-0.2*ph*(1.0-0.6*L);' +
      // ⑤ RGB 荫罩
      '  int gx=int(mod(floor(P.x),3.0));' +
      '  vec3 m=vec3(0.94);' +
      '  if(gx==0)m.r=1.06;else if(gx==1)m.g=1.06;else m.b=1.06;' +
      '  c*=m;' +
      // 暗角 + 闪烁
      '  vec2 u2=(uv-0.5)*2.0;' +
      '  c*=1.0-0.28*(u2.x*u2.x*u2.y*u2.y*2.0+0.25*(u2.x*u2.x+u2.y*u2.y));' +
      '  c*=1.0+(h1(uF*0.73)-0.5)*0.012;' +
      // 开机白色亮线
      '  c=c*(1.0+boost*1.5)+boost*vec3(.85,.9,1.0)*smoothstep(0.006,0.0,abs(uv.y-0.5))*step(abs(uv.x-0.5),sx*0.5);' +
      '  gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);}';

    const sh = (t, s) => {
      const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o);
      if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o));
      return o;
    };
    let pr;
    try {
      pr = gl.createProgram();
      gl.attachShader(pr, sh(gl.VERTEX_SHADER, vs));
      gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs));
      gl.linkProgram(pr); gl.useProgram(pr);
    } catch (e) {
      el.innerHTML = '<div class="ph">着色器编译失败</div>';
      return () => {};
    }
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uS = gl.getUniformLocation(pr, 'uS');
    const uRes = gl.getUniformLocation(pr, 'uRes');
    const uF = gl.getUniformLocation(pr, 'uF');
    const uPw = gl.getUniformLocation(pr, 'uPw');
    const uTk = gl.getUniformLocation(pr, 'uTk');
    gl.uniform1i(uS, 0);
    gl.uniform2f(uRes, W, H);

    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    for (const [k, v] of [
      [gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR],
      [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]
    ]) gl.texParameteri(gl.TEXTURE_2D, k, v);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    let raf, start = 0;
    const CYCLE = 7000;   // 每 7s 重新开机一次
    const tick = now => {
      if (!start) start = now;
      const t = (now - start) / 1000;
      const fc = Math.floor(t * 30);
      const cyc = (now - start) % CYCLE;
      const power = Math.min(1, cyc / 800);                       // 0→1 开机动画
      const track = power >= 1 && (now - start) % 4200 < 520      // 每 4.2s 一次跟踪噪波
        ? Math.sin(((now - start) % 4200) / 520 * Math.PI) : 0;

      drawScene(t, fc);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, scene);
      gl.uniform1f(uF, fc % 997);
      gl.uniform1f(uPw, power);
      gl.uniform1f(uTk, track);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => { cancelAnimationFrame(raf); el.innerHTML = ''; };
  }
};
