export default {
  id: 'gl-rotating-box', group: 'space', name: '3D 产品旋转（手写矩阵 + 光照）', lib: 'WebGL',
  desc: '纯 WebGL 画一个带面法线着色的立方体，拖拽可环绕、松手有惯性滑行。',
  deps: '无（原生 WebGL，无 three.js）',
  note: '拖拽惯性直接抄 OrbitControls：位移乘 dampingFactor 当本帧增量（默认 0.05），帧末 sphericalDelta *= (1 - dampingFactor)，每帧只衰减一次，别在 pointermove 里衰减。dampingFactor 取 0.03~0.1；> 0.3 时位移被一步吃满，等于没有惯性。',
  code: `// 经典 <script>，不能用 import()
const c = document.querySelector('#stage');
const gl = c.getContext('webgl', { antialias: true, premultipliedAlpha: true });
gl.clearColor(0, 0, 0, 0);

const VS = \`attribute vec3 aPos; attribute vec3 aNor;
uniform mat4 uMVP, uModel; uniform mat3 uNM; varying vec3 vN;
void main(){ vN = uNM * aNor; gl_Position = uMVP * vec4(aPos, 1.0); }\`;
const FS = \`precision mediump float; varying vec3 vN;
void main(){
  vec3 n = normalize(vN);
  float d = max(dot(n, normalize(vec3(0.45, 0.8, 0.65))), 0.0);
  float rim = pow(1.0 - abs(n.z), 2.0) * 0.35;
  vec3 col = vec3(0.42, 0.30, 1.0) * (0.28 + 0.72 * d) + vec3(0.35, 0.85, 1.0) * rim;
  gl_FragColor = vec4(col, 1.0);
}\`;
const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return o; };
const prog = gl.createProgram();
gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS));
gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
gl.linkProgram(prog); gl.useProgram(prog);

// 6 面 × 2 三角，平铺顶点保证面法线硬边
const P = [], N = [];
const face = (a, b, c, d, n) => {
  [a, b, c, a, c, d].forEach(p => { P.push(...p); N.push(...n); });
};
face([-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1], [0,0,1]);
face([1,-1,-1],[-1,-1,-1],[-1,1,-1],[1,1,-1], [0,0,-1]);
face([1,-1,1],[1,-1,-1],[1,1,-1],[1,1,1], [1,0,0]);
face([-1,-1,-1],[-1,-1,1],[-1,1,1],[-1,1,-1], [-1,0,0]);
face([-1,1,1],[1,1,1],[1,1,-1],[-1,1,-1], [0,1,0]);
face([-1,-1,-1],[1,-1,-1],[1,-1,1],[-1,-1,1], [0,-1,0]);
const buf = (data, name, size, type) => {
  const b = gl.createBuffer(); gl.bindBuffer(type || gl.ARRAY_BUFFER, b);
  gl.bufferData(type || gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(name); gl.vertexAttribPointer(name, size, gl.FLOAT, false, 0, 0);
  return b;
};
const aPos = gl.getAttribLocation(prog, 'aPos'), aNor = gl.getAttribLocation(prog, 'aNor');
const bPos = buf(P, aPos, 3), bNor = buf(N, aNor, 3);
const idx = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idx);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(P.map((_, i) => i)), gl.STATIC_DRAW);

const U = n => gl.getUniformLocation(prog, n);
const uMVP = U('uMVP'), uModel = U('uModel'), uNM = U('uNM');

// ---- 3D 线性代数（列主序，与 WebGL 一致）----
const mul = (a, b) => {
  const o = new Float32Array(16);
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
    let s = 0; for (let k = 0; k < 4; k++) s += a[k*4+j] * b[i*4+k];
    o[i*4+j] = s;
  }
  return o;
};
const rotY = a => { const c = Math.cos(a), s = Math.sin(a);
  return new Float32Array([c,0,-s,0, 0,1,0,0, s,0,c,0, 0,0,0,1]); };
const rotX = a => { const c = Math.cos(a), s = Math.sin(a);
  return new Float32Array([1,0,0,0, 0,c,s,0, 0,-s,c,0, 0,0,0,1]); };
const persp = (fov, asp, n, f) => { const t = 1 / Math.tan(fov / 2);
  return new Float32Array([t/asp,0,0,0, 0,t,0,0, 0,0,(f+n)/(n-f),-1, 0,0,2*f*n/(n-f),0]); };
const trans = z => new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,z,1]);

// ---- OrbitControls 的球坐标惯性 ----
let theta = 0.6, phi = 1.0, dTheta = 0, dPhi = 0;   // 球坐标增量
let auto = 0.0035;
const DAMP = 0.08;            // dampingFactor
let drag = false, lx = 0, ly = 0;

const W = () => c.clientWidth || 280, H = () => c.clientHeight || 150;
const resize = () => {
  const dpr = Math.min(devicePixelRatio || 1, 2);
  c.width = W() * dpr; c.height = H() * dpr;
  gl.viewport(0, 0, c.width, c.height);
};
addEventListener('resize', resize);
const down = e => { drag = true; lx = e.clientX; ly = e.clientY; };
const move = e => {
  if (!drag) return;
  const k = 2 * Math.PI / Math.max(W(), 1);          // 一整屏宽 = 360°
  dTheta -= (e.clientX - lx) * k;
  dPhi   -= (e.clientY - ly) * k;
  lx = e.clientX; ly = e.clientY;
};
const up = () => drag = false;
c.addEventListener('pointerdown', down);
addEventListener('pointermove', move);
addEventListener('pointerup', up);

let raf = 0, t0 = performance.now();
const loop = now => {
  const dt = Math.min(now - t0, 50) / 16.67; t0 = now;
  // 1) 本帧只吃掉一部分增量（惯性感来源）
  theta += (dTheta + (drag ? 0 : auto) * dt) * DAMP;
  phi   += dPhi * DAMP;
  // 2) 帧末衰减剩余增量，并且只衰减一次
  dTheta *= 1 - DAMP; dPhi *= 1 - DAMP;
  phi = Math.max(0.35, Math.min(Math.PI - 0.35, phi));   // 防万向锁

  // 视角基：相机在球面上，绕中心看
  const R = 4.6;
  const eye = [R*Math.sin(phi)*Math.sin(theta), R*Math.cos(phi), R*Math.sin(phi)*Math.cos(theta)];
  // 手写 lookAt
  const sub = (a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
  const norm = a => { const l = Math.hypot(...a); return a.map(v => v / l); };
  const cross = (a,b)=>[a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
  const z = norm(eye), x = norm(cross([0,1,0], z)), y = cross(z, x);
  const view = new Float32Array([
    x[0], y[0], z[0], 0,
    x[1], y[1], z[1], 0,
    x[2], y[2], z[2], 0,
    -(x[0]*eye[0]+x[1]*eye[1]+x[2]*eye[2]),
    -(y[0]*eye[0]+y[1]*eye[1]+y[2]*eye[2]),
    -(z[0]*eye[0]+z[1]*eye[1]+z[2]*eye[2]), 1
  ]);
  // 模型：自转 + 轻微俯仰
  const model = mul(rotX(-0.35), rotY(now / 1000));
  const px = persp(0.95, W() / H(), 0.1, 100);
  const vp = mul(px, view);
  const mvp = mul(vp, model);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);
  gl.uniformMatrix4fv(uMVP, false, mvp);
  gl.uniformMatrix4fv(uModel, false, model);
  // 法线矩阵（旋转矩阵的逆=转置，这里缩放为 0.75 直接补回）
  gl.uniformMatrix3fv(uNM, false, new Float32Array([
    model[0]/0.42, model[4]/0.42, model[8]/0.42,
    model[1]/0.42, model[5]/0.42, model[9]/0.42,
    model[2]/0.42, model[6]/0.42, model[10]/0.42
  ]));
  gl.drawArrays(gl.TRIANGLES, 0, P.length / 3);
  raf = requestAnimationFrame(loop);
};
c.addEventListener('webglcontextlost', e => e.preventDefault());
resize(); raf = requestAnimationFrame(loop);

return () => {
  cancelAnimationFrame(raf);
  removeEventListener('resize', resize);
  removeEventListener('pointermove', move);
  removeEventListener('pointerup', up);
  gl.deleteBuffer(bPos); gl.deleteBuffer(bNor); gl.deleteBuffer(idx);
  gl.deleteProgram(prog);
};`,
  init(el) {
    el.innerHTML = '';
    const c = document.createElement('canvas');
    c.style.cssText = 'width:100%;height:100%;display:block;cursor:grab;touch-action:none';
    el.appendChild(c);
    c.id = 'stage';

    const gl = c.getContext('webgl', { antialias: true, premultipliedAlpha: true });
    if (!gl) { el.innerHTML = '<div style="color:#8b93a7;font-size:12px;padding:40px;text-align:center">需要 WebGL</div>'; return () => {}; }
    gl.clearColor(0, 0, 0, 0);

    const VS = `attribute vec3 aPos; attribute vec3 aNor;
uniform mat4 uMVP; uniform mat3 uNM; varying vec3 vN;
void main(){ vN = uNM * aNor; gl_Position = uMVP * vec4(aPos, 1.0); }`;
    const FS = `precision mediump float; varying vec3 vN;
void main(){
  vec3 n = normalize(vN);
  float d = max(dot(n, normalize(vec3(0.45, 0.8, 0.65))), 0.0);
  float rim = pow(1.0 - abs(n.z), 2.0) * 0.35;
  vec3 col = vec3(0.42, 0.30, 1.0) * (0.28 + 0.72 * d) + vec3(0.35, 0.85, 1.0) * rim;
  gl_FragColor = vec4(col, 1.0);
}`;
    const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return o; };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog); gl.useProgram(prog);

    const P = [], N = [];
    const face = (a, b, cc, d, n) => { [a, b, cc, a, cc, d].forEach(p => { P.push(...p); N.push(...n); }); };
    face([-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1], [0,0,1]);
    face([1,-1,-1],[-1,-1,-1],[-1,1,-1],[1,1,-1], [0,0,-1]);
    face([1,-1,1],[1,-1,-1],[1,1,-1],[1,1,1], [1,0,0]);
    face([-1,-1,-1],[-1,-1,1],[-1,1,1],[-1,1,-1], [-1,0,0]);
    face([-1,1,1],[1,1,1],[1,1,-1],[-1,1,-1], [0,1,0]);
    face([-1,-1,-1],[1,-1,-1],[1,-1,1],[-1,-1,1], [0,-1,0]);

    const aPos = gl.getAttribLocation(prog, 'aPos'), aNor = gl.getAttribLocation(prog, 'aNor');
    const mk = (data, loc, size) => {
      const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
      return b;
    };
    const bPos = mk(P, aPos, 3), bNor = mk(N, aNor, 3);
    const uMVP = gl.getUniformLocation(prog, 'uMVP'), uNM = gl.getUniformLocation(prog, 'uNM');

    const mul = (a, b) => {
      const o = new Float32Array(16);
      for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
        let s = 0; for (let k = 0; k < 4; k++) s += a[k*4+j] * b[i*4+k];
        o[i*4+j] = s;
      }
      return o;
    };
    const rotY = a => { const cs = Math.cos(a), sn = Math.sin(a);
      return new Float32Array([cs,0,-sn,0, 0,1,0,0, sn,0,cs,0, 0,0,0,1]); };
    const rotX = a => { const cs = Math.cos(a), sn = Math.sin(a);
      return new Float32Array([1,0,0,0, 0,cs,sn,0, 0,-sn,cs,0, 0,0,0,1]); };
    const persp = (fov, asp, n, f) => { const t = 1 / Math.tan(fov / 2);
      return new Float32Array([t/asp,0,0,0, 0,t,0,0, 0,0,(f+n)/(n-f),-1, 0,0,2*f*n/(n-f),0]); };

    let theta = 0.6, phi = 1.0, dTheta = 0, dPhi = 0;
    const DAMP = 0.08;
    let drag = false, lx = 0, ly = 0;

    const resize = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      c.width = Math.round((c.clientWidth || 280) * dpr);
      c.height = Math.round((c.clientHeight || 150) * dpr);
      gl.viewport(0, 0, c.width, c.height);
    };
    resize();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null;
    ro && ro.observe(c);
    addEventListener('resize', resize);

    const down = e => { drag = true; lx = e.clientX; ly = e.clientY; c.style.cursor = 'grabbing'; };
    const move = e => {
      if (!drag) return;
      const k = 2 * Math.PI / Math.max(c.clientWidth || 280, 1);
      dTheta -= (e.clientX - lx) * k;
      dPhi   -= (e.clientY - ly) * k;
      lx = e.clientX; ly = e.clientY;
    };
    const up = () => { drag = false; c.style.cursor = 'grab'; };
    c.addEventListener('pointerdown', down);
    addEventListener('pointermove', move);
    addEventListener('pointerup', up);

    let raf = 0, t0 = performance.now();
    const loop = now => {
      const dt = Math.min(now - t0, 50) / 16.67; t0 = now;
      // OrbitControls 惯性：先吃 dampingFactor 份额，帧末再乘 (1-dampingFactor)
      theta += (dTheta + (drag ? 0 : 0.0032 * dt)) * DAMP;
      phi   += dPhi * DAMP;
      dTheta *= 1 - DAMP; dPhi *= 1 - DAMP;
      phi = Math.max(0.35, Math.min(Math.PI - 0.35, phi));

      const R = 4.8;
      const eye = [R*Math.sin(phi)*Math.sin(theta), R*Math.cos(phi), R*Math.sin(phi)*Math.cos(theta)];
      const normv = a => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0]/l, a[1]/l, a[2]/l]; };
      const crossv = (a, b) => [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
      const z = normv(eye), x = normv(crossv([0,1,0], z)), y = crossv(z, x);
      const view = new Float32Array([
        x[0], y[0], z[0], 0,
        x[1], y[1], z[1], 0,
        x[2], y[2], z[2], 0,
        -(x[0]*eye[0]+x[1]*eye[1]+x[2]*eye[2]),
        -(y[0]*eye[0]+y[1]*eye[1]+y[2]*eye[2]),
        -(z[0]*eye[0]+z[1]*eye[1]+z[2]*eye[2]), 1
      ]);
      const model = mul(rotX(-0.38), rotY(now / 1400));
      const mvp = mul(mul(persp(0.92, (c.width || 1) / (c.height || 1), 0.1, 100), view), model);

      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.DEPTH_TEST);
      gl.uniformMatrix4fv(uMVP, false, mvp);
      gl.uniformMatrix3fv(uNM, false, new Float32Array([
        model[0], model[4], model[8],
        model[1], model[5], model[9],
        model[2], model[6], model[10]
      ]));
      gl.drawArrays(gl.TRIANGLES, 0, P.length / 3);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro && ro.disconnect();
      removeEventListener('resize', resize);
      removeEventListener('pointermove', move);
      removeEventListener('pointerup', up);
      gl.deleteBuffer(bPos); gl.deleteBuffer(bNor);
      gl.deleteProgram(prog);
    };
  }
};
