export default {
  id: 'gl-particles-cloud', group: 'particle', name: 'GPU 粒子云（Points + 加法混合）', lib: 'WebGL',
  desc: '两千个点沿螺旋轨道漂浮，深度写进颜色，加法混合让密度高处自然发光。',
  deps: '无（原生 WebGL，gl.POINTS）',
  note: '加法混合（blendFunc SRC_ALPHA, ONE）+ depthTest 一起用会“遮挡变暗”：后面的点被前面写进深度缓冲后整块丢掉。粒子云正确做法是 gl.depthMask(false)，只读深度不写深度；或者干脆关掉深度全量叠加。超过 5000 点后要开始降分辨率，别靠调小点尺寸。',
  code: "const c = document.querySelector('#stage');\nconst gl = c.getContext('webgl', { antialias: true, premultipliedAlpha: true });\nconst N = 2200;\nconst VS = `attribute vec3 aPos; attribute float aSeed;\nuniform mat4 uMVP; uniform float uTime, uPx;\nvarying float vD;\nvoid main(){\n  // 各自不同的漂浮频率，避免整体同步抖动\n  float ph = aSeed * 6.2831;\n  vec3 p = aPos;\n  p.y += sin(uTime * 0.9 + ph) * 0.08;\n  p.x += cos(uTime * 0.6 + ph * 1.7) * 0.06;\n  p.z += sin(uTime * 0.7 + ph * 2.3) * 0.06;\n  vec4 clip = uMVP * vec4(p, 1.0);\n  vD = clamp(1.0 - length(p) * 0.42, 0.0, 1.0);    // 径向衰减 = 伪体积感\n  gl_PointSize = (1.2 + aSeed * 2.4) * uPx / max(clip.w, 0.001);\n  gl_Position = clip;\n}`;\nconst FS = `precision mediump float; varying float vD;\nvoid main(){\n  vec2 d = gl_PointCoord - 0.5;\n  float r2 = dot(d, d);\n  if (r2 > 0.25) discard;\n  float a = (1.0 - r2 * 4.0);\n  gl_FragColor = vec4(vec3(0.45, 0.62, 1.0) * (0.35 + vD), a * a * vD);\n}`;\n// 螺旋臂点云\nconst pos = new Float32Array(N * 3), seed = new Float32Array(N);\nfor (let i = 0; i < N; i++) {\n  const arm = i % 2, t = Math.random();\n  const ang = t * 9.0 + arm * Math.PI + (Math.random() - 0.5) * 0.5;\n  const rad = 0.06 + t * 1.15;\n  const spread = 0.09 * (1.2 - t);\n  pos[i*3]   = Math.cos(ang) * rad + (Math.random() - 0.5) * spread;\n  pos[i*3+1] = (Math.random() - 0.5) * 0.22 * (1.2 - t * 0.7);\n  pos[i*3+2] = Math.sin(ang) * rad + (Math.random() - 0.5) * spread;\n  seed[i] = Math.random();\n}\n// …建 program / buffer / 透视矩阵，每帧传 uTime，然后：\n// gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE);\n// gl.enable(gl.DEPTH_TEST); gl.depthMask(false);   // 关键\n// gl.drawArrays(gl.POINTS, 0, N);",
  init(el) {
    el.innerHTML = '';
    const c = document.createElement('canvas');
    c.style.cssText = 'width:100%;height:100%;display:block';
    el.appendChild(c);
    const gl = c.getContext('webgl', { antialias: true, alpha: true, premultipliedAlpha: true });
    if (!gl) return () => {};
    gl.clearColor(0, 0, 0, 0);

    const VS = `attribute vec3 aPos; attribute float aSeed;
uniform mat4 uMVP; uniform float uTime, uPx;
varying float vD;
void main(){
  float ph = aSeed * 6.2831;
  vec3 p = aPos;
  p.y += sin(uTime * 0.9 + ph) * 0.08;
  p.x += cos(uTime * 0.6 + ph * 1.7) * 0.06;
  p.z += sin(uTime * 0.7 + ph * 2.3) * 0.06;
  vec4 clip = uMVP * vec4(p, 1.0);
  vD = clamp(1.0 - length(p) * 0.42, 0.0, 1.0);
  gl_PointSize = (1.2 + aSeed * 2.6) * uPx / max(clip.w, 0.001);
  gl_Position = clip;
}`;
    const FS = `precision mediump float; varying float vD;
void main(){
  vec2 d = gl_PointCoord - 0.5;
  float r2 = dot(d, d);
  if (r2 > 0.25) discard;
  float a = 1.0 - r2 * 4.0;
  gl_FragColor = vec4(vec3(0.45, 0.62, 1.0) * (0.35 + vD), a * a * vD);
}`;
    const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return o; };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return () => {};
    gl.useProgram(prog);

    const N = 2200;
    const pos = new Float32Array(N * 3), seed = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      const arm = i % 2, u = Math.random();
      const ang = u * 9.0 + arm * Math.PI + (Math.random() - 0.5) * 0.55;
      const rad = 0.06 + u * 1.12;
      const spread = 0.10 * (1.2 - u);
      pos[i*3]   = Math.cos(ang) * rad + (Math.random() - 0.5) * spread;
      pos[i*3+1] = (Math.random() - 0.5) * 0.24 * (1.2 - u * 0.7);
      pos[i*3+2] = Math.sin(ang) * rad + (Math.random() - 0.5) * spread;
      seed[i] = Math.random();
    }
    const attr = (arr, name, n) => {
      const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b);
      gl.bufferData(gl.ARRAY_BUFFER, arr, gl.STATIC_DRAW);
      const l = gl.getAttribLocation(prog, name);
      gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l, n, gl.FLOAT, false, 0, 0);
      return b;
    };
    const bPos = attr(pos, 'aPos', 3);
    const bSeed = attr(seed, 'aSeed', 1);
    const uMVP = gl.getUniformLocation(prog, 'uMVP');
    const uTime = gl.getUniformLocation(prog, 'uTime');
    const uPx = gl.getUniformLocation(prog, 'uPx');

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
    const trans = z => new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,z,1]);

    const resize = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      c.width = Math.round((c.clientWidth || 280) * dpr);
      c.height = Math.round((c.clientHeight || 150) * dpr);
      gl.viewport(0, 0, c.width, c.height);
    };
    resize();

    let raf = 0, t0 = performance.now();
    const loop = now => {
      const sec = (now - t0) / 1000;
      if (c.clientWidth && c.width !== Math.round(c.clientWidth * Math.min(devicePixelRatio || 1, 2))) resize();
      const proj = persp(0.9, (c.width || 1) / (c.height || 1), 0.1, 50);
      const mvp = mul(mul(proj, trans(-2.9)), mul(rotX(-0.55), rotY(sec * 0.12)));
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE);          // 加法叠加
      gl.enable(gl.DEPTH_TEST);
      gl.depthMask(false);                          // 关键：只读不写
      gl.uniformMatrix4fv(uMVP, false, mvp);
      gl.uniform1f(uTime, sec);
      gl.uniform1f(uPx, (c.height / 300) * 7);
      gl.drawArrays(gl.POINTS, 0, N);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      gl.deleteBuffer(bPos); gl.deleteBuffer(bSeed); gl.deleteProgram(prog);
    };
  }
};
