export default {
  id: 'gl-raycast-hover', group: 'space', name: '3D 拾取高亮（射线 × 点精灵）', lib: 'WebGL',
  desc: '一屏 3D 点阵，鼠标射线拾取最近的点并高亮，点按后炸开再回位。',
  deps: '无（原生 WebGL，Raycaster 算法手写）',
  note: 'Raycaster 的 Points 默认 threshold 是 1 世界单位，对 280px 舞台太粗：实测高于 0.03 就会同时命中一整片点。想“准”必须把点半径（世界坐标）当 threshold，并只取 intersects[0]。',
  code: `const c = document.querySelector('#stage');
const gl = c.getContext('webgl', { antialias: true, premultipliedAlpha: true });
if (!gl) throw new Error('需要 WebGL');

const VS = \`attribute vec3 aPos; attribute float aSize; attribute float aSel;
uniform mat4 uMVP; uniform float uPx;
varying float vSel;
void main(){
  vec4 p = uMVP * vec4(aPos, 1.0);
  vSel = aSel;
  // 屏幕空间点尺寸：裁切空间 w 越大越远，除以 w 得到透视
  gl_PointSize = aSize * (1.0 + aSel * 2.6) * uPx / max(p.w, 0.001);
  gl_Position = p;
}\`;
const FS = \`precision mediump float; varying float vSel;
void main(){
  vec2 d = gl_PointCoord - 0.5;
  float r = length(d);
  if (r > 0.5) discard;
  float a = smoothstep(0.5, 0.18, r);
  vec3 base = mix(vec3(0.45, 0.55, 0.85), vec3(0.30, 0.92, 1.0), vSel);
  gl_FragColor = vec4(base, a * (0.55 + 0.45 * vSel));
}\`;
const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return o; };
const prog = gl.createProgram();
gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS));
gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
gl.linkProgram(prog); gl.useProgram(prog);

// ---- 点云：fibonacci 球面 + 内层随机体 ----
const N = 420, pos = new Float32Array(N * 3), sel = new Float32Array(N), size = new Float32Array(N);
for (let i = 0; i < N; i++) {
  const k = i / N, ga = Math.PI * (3 - Math.sqrt(5));
  const r = k < 0.62 ? 1.0 : 0.55 * Math.cbrt(Math.random());   // 外壳 + 内核
  const y = k < 0.62 ? 1 - 2 * k / 0.62 : (Math.random() * 2 - 1);
  const rr = Math.sqrt(Math.max(0, 1 - y * y));
  const th = ga * i;
  pos[i*3]   = Math.cos(th) * rr * r;
  pos[i*3+1] = y * r;
  pos[i*3+2] = Math.sin(th) * rr * r;
  size[i] = 6 + Math.random() * 6;
}
const bufFor = (arr, loc, n) => {
  const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b);
  gl.bufferData(gl.ARRAY_BUFFER, arr, gl.DYNAMIC_DRAW);
  const l = gl.getAttribLocation(prog, loc);
  gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l, n, gl.FLOAT, false, 0, 0);
  return b;
};
gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
gl.bufferData(gl.ARRAY_BUFFER, pos, gl.DYNAMIC_DRAW);
bufFor(size, 'aSize', 1);
const bSel = bufFor(sel, 'aSel', 1);
const uMVP = gl.getUniformLocation(prog, 'uMVP');
const uPx = gl.getUniformLocation(prog, 'uPx');

// ---- 矩阵 ----
const mul = (a, b) => { const o = new Float32Array(16);
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
    let s = 0; for (let k = 0; k < 4; k++) s += a[k*4+j] * b[i*4+k]; o[i*4+j] = s; }
  return o; };
const rotY = a => { const cs = Math.cos(a), sn = Math.sin(a);
  return new Float32Array([cs,0,-sn,0, 0,1,0,0, sn,0,cs,0, 0,0,0,1]); };
const rotX = a => { const cs = Math.cos(a), sn = Math.sin(a);
  return new Float32Array([1,0,0,0, 0,cs,sn,0, 0,-sn,cs,0, 0,0,0,1]); };
const persp = (fov, asp, n, f) => { const t = 1 / Math.tan(fov / 2);
  return new Float32Array([t/asp,0,0,0, 0,t,0,0, 0,0,(f+n)/(n-f),-1, 0,0,2*f*n/(n-f),0]); };
const inv16 = m => {   // 通用 4x4 求逆（一般矩阵）
  const a = m, o = new Float32Array(16);
  const b00=a[0]*a[5]-a[1]*a[4], b01=a[0]*a[6]-a[2]*a[4], b02=a[0]*a[7]-a[3]*a[4];
  const b03=a[1]*a[6]-a[2]*a[5], b04=a[1]*a[7]-a[3]*a[5], b05=a[2]*a[7]-a[3]*a[6];
  const b06=a[8]*a[13]-a[9]*a[12], b07=a[8]*a[14]-a[10]*a[12], b08=a[8]*a[15]-a[11]*a[12];
  const b09=a[9]*a[14]-a[10]*a[13], b10=a[9]*a[15]-a[11]*a[13], b11=a[10]*a[15]-a[11]*a[14];
  let det = b00*b11 - b01*b10 + b02*b09 + b03*b08 - b04*b07 + b05*b06;
  if (!det) return o; det = 1 / det;
  o[0]=(a[5]*b11-a[6]*b10+a[7]*b09)*det; o[1]=(a[2]*b10-a[1]*b11-a[3]*b09)*det;
  o[2]=(a[13]*b05-a[14]*b04+a[15]*b03)*det; o[3]=(a[10]*b04-a[9]*b05-a[11]*b03)*det;
  o[4]=(a[6]*b08-a[4]*b11-a[7]*b07)*det; o[5]=(a[0]*b11-a[2]*b08+a[3]*b07)*det;
  o[6]=(a[14]*b02-a[12]*b05-a[15]*b01)*det; o[7]=(a[8]*b05-a[10]*b02+a[11]*b01)*det;
  o[8]=(a[4]*b10-a[5]*b08+a[7]*b06)*det; o[9]=(a[1]*b08-a[0]*b10-a[3]*b06)*det;
  o[10]=(a[12]*b04-a[13]*b02+a[15]*b00)*det; o[11]=(a[9]*b02-a[8]*b04-a[11]*b00)*det;
  o[12]=(a[5]*b07-a[4]*b09-a[6]*b06)*det; o[13]=(a[0]*b09-a[1]*b07+a[2]*b06)*det;
  o[14]=(a[13]*b01-a[12]*b03-a[14]*b00)*det; o[15]=(a[8]*b03-a[9]*b01+a[10]*b00)*det;
  return o;
};

const W = () => c.clientWidth || 280, H = () => c.clientHeight || 150;
const resize = () => {
  const dpr = Math.min(devicePixelRatio || 1, 2);
  c.width = Math.round(W() * dpr); c.height = Math.round(H() * dpr);
  gl.viewport(0, 0, c.width, c.height);
};
resize();

let hover = -1, burst = -1, burstT = 0, dpr0 = 1;
const mv = e => {
  const r = c.getBoundingClientRect();
  const ndc = [((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1];
  // 射线：从 NDC 反投影到世界（等价 Raycaster.setFromCamera）
  const invVP = inv16(mul(persp(0.9, r.width / r.height, 0.1, 100), view(t)));
  const un = (x, y, z) => {
    const o = [0,0,0,0];
    for (let i = 0; i < 4; i++) o[i] = invVP[i]*x + invVP[4+i]*y + invVP[8+i]*z + invVP[12+i];
    return [o[0]/o[3], o[1]/o[3], o[2]/o[3]];
  };
  const a = un(ndc[0], ndc[1], -1), b = un(ndc[0], ndc[1], 1);
  const d = [b[0]-a[0], b[1]-a[1], b[2]-a[2]];
  const m = rotX(-0.3);                    // 只考虑模型旋转：把射线转到模型空间
  // 简易：用当前 model 变换后的点做世界空间距离比对
  let best = -1, bestD = 0.028 * 2.6;      // threshold ≈ 点半径
  for (let i = 0; i < N; i++) {
    const p = wp(i);
    const v = [p[0]-a[0], p[1]-a[1], p[2]-a[2]];
    const tHit = v[0]*d[0]+v[1]*d[1]+v[2]*d[2];
    if (tHit < 0) continue;
    const cx = a[0]+d[0]*tHit, cy = a[1]+d[1]*tHit, cz = a[2]+d[2]*tHit;
    const dist = Math.hypot(p[0]-cx, p[1]-cy, p[2]-cz);
    if (dist < bestD) { bestD = dist; best = i; }
  }
  hover = best;
  c.style.cursor = best >= 0 ? 'pointer' : 'default';
};
const clk = () => { if (hover >= 0) { burst = hover; burstT = 1; } };
c.addEventListener('pointermove', mv);
c.addEventListener('click', clk);
c.addEventListener('pointerleave', () => hover = -1);

let t = 0, raf = 0;
const wp = i => {                         // 模型空间点 → 世界空间（含爆炸偏移）
  const m = rotX(-0.3), r = rotY(t * 0.35);
  let x = pos[i*3], y = pos[i*3+1], z = pos[i*3+2];
  if (i === burst && burstT > 0) {
    const k = 1 + burstT * 0.85;
    x *= k; y *= k; z *= k;
  }
  // rotY
  let X = r[0]*x + r[8]*z, Z = r[2]*x + r[10]*z;
  // rotX
  let Y = m[5]*y + m[6]*Z;
  const Z2 = m[9]*y + m[10]*Z;
  return [X, Y, Z2];
};
const view = time => {
  const R = 3.1;
  const eye = [0, 0.55, R];
  const normv = a => { const l = Math.hypot(a[0],a[1],a[2]) || 1; return [a[0]/l,a[1]/l,a[2]/l]; };
  const cr = (a, b) => [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
  const z = normv(eye), x = normv(cr([0,1,0], z)), y = cr(z, x);
  return new Float32Array([
    x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0,
    -(x[0]*eye[0]+x[1]*eye[1]+x[2]*eye[2]),
    -(y[0]*eye[0]+y[1]*eye[1]+y[2]*eye[2]),
    -(z[0]*eye[0]+z[1]*eye[1]+z[2]*eye[2]), 1
  ]);
};

const loop = () => {
  t += 0.016;
  burstT = Math.max(0, burstT - 0.045);
  for (let i = 0; i < N; i++) sel[i] = i === hover ? 1 : (i === burst ? burstT : 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, bSel);
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, sel);

  const mvp = mul(mul(persp(0.9, W() / H(), 0.1, 100), view(t)), rotY(t * 0.35));
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE);       // 加法混合，点云发光
  gl.disable(gl.DEPTH_TEST);
  gl.uniformMatrix4fv(uMVP, false, mvp);
  gl.uniform1f(uPx, (c.height / 300) * 1.2);
  gl.drawArrays(gl.POINTS, 0, N);
  raf = requestAnimationFrame(loop);
};
raf = requestAnimationFrame(loop);

const onR = () => resize();
addEventListener('resize', onR);
return () => {
  cancelAnimationFrame(raf);
  removeEventListener('resize', onR);
  gl.deleteProgram(prog);
};`,
  init(el) {
    el.innerHTML = '';
    const c = document.createElement('canvas');
    c.style.cssText = 'width:100%;height:100%;display:block;cursor:default';
    el.appendChild(c);
    const gl = c.getContext('webgl', { antialias: true, alpha: true, premultipliedAlpha: true });
    if (!gl) return () => {};
    gl.clearColor(0, 0, 0, 0);

    const VS = `attribute vec3 aPos; attribute float aSize; attribute float aSel;
uniform mat4 uMVP; uniform float uPx; varying float vSel;
void main(){
  vec4 p = uMVP * vec4(aPos, 1.0);
  vSel = aSel;
  gl_PointSize = aSize * (1.0 + aSel * 2.6) * uPx / max(p.w, 0.001);
  gl_Position = p;
}`;
    const FS = `precision mediump float; varying float vSel;
void main(){
  vec2 d = gl_PointCoord - 0.5;
  float r = length(d);
  if (r > 0.5) discard;
  float a = smoothstep(0.5, 0.18, r);
  vec3 base = mix(vec3(0.45, 0.55, 0.85), vec3(0.30, 0.92, 1.0), vSel);
  gl_FragColor = vec4(base, a * (0.55 + 0.45 * vSel));
}`;
    const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return o; };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog); gl.useProgram(prog);

    const N = 420;
    const pos = new Float32Array(N * 3), sel = new Float32Array(N), size = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      const k = i / N, ga = Math.PI * (3 - Math.sqrt(5));
      const shell = k < 0.62;
      const r = shell ? 1.0 : 0.55 * Math.cbrt(Math.random() || 0.001);
      const y = shell ? 1 - 2 * k / 0.62 : (Math.random() * 2 - 1);
      const rr = Math.sqrt(Math.max(0, 1 - y * y));
      const th = ga * i;
      pos[i*3]   = Math.cos(th) * rr * r;
      pos[i*3+1] = y * r;
      pos[i*3+2] = Math.sin(th) * rr * r;
      size[i] = 5 + Math.random() * 6;
    }
    const attr = (arr, name, n) => {
      const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b);
      gl.bufferData(gl.ARRAY_BUFFER, arr, gl.DYNAMIC_DRAW);
      const l = gl.getAttribLocation(prog, name);
      gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l, n, gl.FLOAT, false, 0, 0);
      return b;
    };
    const bPos = attr(pos, 'aPos', 3);
    const bSize = attr(size, 'aSize', 1);
    const bSel = attr(sel, 'aSel', 1);
    const uMVP = gl.getUniformLocation(prog, 'uMVP'), uPx = gl.getUniformLocation(prog, 'uPx');

    const mul = (a, b) => { const o = new Float32Array(16);
      for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
        let s = 0; for (let k = 0; k < 4; k++) s += a[k*4+j] * b[i*4+k]; o[i*4+j] = s; }
      return o; };
    const rotY = a => { const cs = Math.cos(a), sn = Math.sin(a);
      return new Float32Array([cs,0,-sn,0, 0,1,0,0, sn,0,cs,0, 0,0,0,1]); };
    const rotX = a => { const cs = Math.cos(a), sn = Math.sin(a);
      return new Float32Array([1,0,0,0, 0,cs,sn,0, 0,-sn,cs,0, 0,0,0,1]); };
    const persp = (fov, asp, n, f) => { const t = 1 / Math.tan(fov / 2);
      return new Float32Array([t/asp,0,0,0, 0,t,0,0, 0,0,(f+n)/(n-f),-1, 0,0,2*f*n/(n-f),0]); };
    const viewM = () => {
      const eye = [0, 0.5, 3.1];
      const nv = a => { const l = Math.hypot(a[0],a[1],a[2]) || 1; return [a[0]/l,a[1]/l,a[2]/l]; };
      const cr = (a, b) => [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
      const z = nv(eye), x = nv(cr([0,1,0], z)), y = cr(z, x);
      return new Float32Array([
        x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0,
        -(x[0]*eye[0]+x[1]*eye[1]+x[2]*eye[2]),
        -(y[0]*eye[0]+y[1]*eye[1]+y[2]*eye[2]),
        -(z[0]*eye[0]+z[1]*eye[1]+z[2]*eye[2]), 1
      ]);
    };
    const inv16 = m => {
      const a = m, o = new Float32Array(16);
      const b00=a[0]*a[5]-a[1]*a[4], b01=a[0]*a[6]-a[2]*a[4], b02=a[0]*a[7]-a[3]*a[4];
      const b03=a[1]*a[6]-a[2]*a[5], b04=a[1]*a[7]-a[3]*a[5], b05=a[2]*a[7]-a[3]*a[6];
      const b06=a[8]*a[13]-a[9]*a[12], b07=a[8]*a[14]-a[10]*a[12], b08=a[8]*a[15]-a[11]*a[12];
      const b09=a[9]*a[14]-a[10]*a[13], b10=a[9]*a[15]-a[11]*a[13], b11=a[10]*a[15]-a[11]*a[14];
      let det = b00*b11 - b01*b10 + b02*b09 + b03*b08 - b04*b07 + b05*b06;
      if (!det) return o; det = 1 / det;
      o[0]=(a[5]*b11-a[6]*b10+a[7]*b09)*det; o[1]=(a[2]*b10-a[1]*b11-a[3]*b09)*det;
      o[2]=(a[13]*b05-a[14]*b04+a[15]*b03)*det; o[3]=(a[10]*b04-a[9]*b05-a[11]*b03)*det;
      o[4]=(a[6]*b08-a[4]*b11-a[7]*b07)*det; o[5]=(a[0]*b11-a[2]*b08+a[3]*b07)*det;
      o[6]=(a[14]*b02-a[12]*b05-a[15]*b01)*det; o[7]=(a[8]*b05-a[10]*b02+a[11]*b01)*det;
      o[8]=(a[4]*b10-a[5]*b08+a[7]*b06)*det; o[9]=(a[1]*b08-a[0]*b10-a[3]*b06)*det;
      o[10]=(a[12]*b04-a[13]*b02+a[15]*b00)*det; o[11]=(a[9]*b02-a[8]*b04-a[11]*b00)*det;
      o[12]=(a[5]*b07-a[4]*b09-a[6]*b06)*det; o[13]=(a[0]*b09-a[1]*b07+a[2]*b06)*det;
      o[14]=(a[13]*b01-a[12]*b03-a[14]*b00)*det; o[15]=(a[8]*b03-a[9]*b01+a[10]*b00)*det;
      return o;
    };

    let t = 0, hover = -1, burst = -1, burstT = 0, raf = 0;
    let model = rotY(0);
    const world = new Float32Array(N * 3);

    const resize = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      c.width = Math.round((c.clientWidth || 280) * dpr);
      c.height = Math.round((c.clientHeight || 150) * dpr);
      gl.viewport(0, 0, c.width, c.height);
    };
    resize();

    const mv = e => {
      const r = c.getBoundingClientRect();
      const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
      const ny = -((e.clientY - r.top) / r.height) * 2 + 1;
      const invVP = inv16(mul(persp(0.9, r.width / r.height, 0.1, 100), viewM()));
      const un = (x, y, z) => {
        const o = [0,0,0,0];
        for (let i = 0; i < 4; i++) o[i] = invVP[i]*x + invVP[4+i]*y + invVP[8+i]*z + invVP[12+i];
        return [o[0]/o[3], o[1]/o[3], o[2]/o[3]];
      };
      const a = un(nx, ny, -1), b = un(nx, ny, 1);
      const d = [b[0]-a[0], b[1]-a[1], b[2]-a[2]];
      const dl = Math.hypot(d[0], d[1], d[2]) || 1;
      d[0] /= dl; d[1] /= dl; d[2] /= dl;
      c.updateWorld?.();
      let best = -1, bestD = 0.035;                 // <- threshold
      for (let i = 0; i < N; i++) {
        const px = world[i*3], py = world[i*3+1], pz = world[i*3+2];
        const vx = px-a[0], vy = py-a[1], vz = pz-a[2];
        const th = vx*d[0] + vy*d[1] + vz*d[2];
        if (th < 0) continue;
        const cx = a[0]+d[0]*th, cy = a[1]+d[1]*th, cz = a[2]+d[2]*th;
        const dist = Math.hypot(px-cx, py-cy, pz-cz);
        if (dist < bestD) { bestD = dist; best = i; }
      }
      hover = best;
      c.style.cursor = best >= 0 ? 'pointer' : 'default';
    };
    const clk = () => { if (hover >= 0) { burst = hover; burstT = 1; } };
    const leave = () => { hover = -1; c.style.cursor = 'default'; };
    c.addEventListener('pointermove', mv);
    c.addEventListener('pointerleave', leave);
    c.addEventListener('click', clk);

    const loop = () => {
      t += 0.016;
      burstT = Math.max(0, burstT - 0.04);
      model = rotY(t * 0.5);
      // 世界坐标（raycast 用）
      for (let i = 0; i < N; i++) {
        const k = (i === burst) ? 1 + burstT * 0.9 : 1;
        const x = pos[i*3]*k, y = pos[i*3+1]*k, z = pos[i*3+2]*k;
        world[i*3]   = model[0]*x + model[8]*z;
        world[i*3+1] = y;
        world[i*3+2] = model[2]*x + model[10]*z;
        sel[i] = i === hover ? 1 : (i === burst ? burstT * 0.9 : 0);
      }
      gl.bindBuffer(gl.ARRAY_BUFFER, bSel);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, sel);

      const mvp = mul(mul(persp(0.9, (c.width || 1) / (c.height || 1), 0.1, 100), viewM()), model);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
      gl.disable(gl.DEPTH_TEST);
      gl.uniformMatrix4fv(uMVP, false, mvp);
      gl.uniform1f(uPx, (c.height / 300) * 60);
      gl.drawArrays(gl.POINTS, 0, N);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const onR = () => resize();
    addEventListener('resize', onR);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener('resize', onR);
      gl.deleteBuffer(bPos); gl.deleteBuffer(bSize); gl.deleteBuffer(bSel);
      gl.deleteProgram(prog);
    };
  }
};
