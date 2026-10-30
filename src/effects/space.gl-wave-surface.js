export default {
  id: 'gl-wave-surface', group: 'space', name: 'Shader 波动曲面', lib: 'WebGL',
  desc: '网格曲面用顶点着色器叠加三组正弦，屏幕空间高光让波峰自己亮起来。',
  deps: '无（原生 WebGL + ShaderMaterial 写法）',
  note: '顶点着色器算位移就必须同时在那里重算法线（用两个邻点做叉积），否则静态法线会让整块平面一个颜色。多波叠加时波长差要 ≥ 2 倍，否则会拍出摩尔纹：0.9 / 0.37 这种 2.4 倍关系在 280px 舞台上最稳。',
  code: "const c = document.querySelector('#stage');\nconst gl = c.getContext('webgl', { antialias: true, premultipliedAlpha: true });\nconst VS = `\nattribute vec3 aPos;\nuniform mat4 uMVP, uModel; uniform mat3 uNM;\nuniform float uTime;\nvarying vec3 vN; varying float vH;\nfloat wave(vec2 p, float t){\n  return sin(p.x * 2.4 + t * 1.6) * 0.16\n       + sin(p.y * 3.1 - t * 1.1) * 0.11\n       + sin((p.x + p.y) * 5.2 + t * 2.3) * 0.05;\n}\nvec3 disp(vec2 p){ return vec3(p.x, wave(p, uTime), p.y); }\nvoid main(){\n  // 用有限差分求法线（与 three 的 ShaderMaterial 手动求导一致）\n  float e = 0.06;\n  vec3 p  = disp(aPos.xz);\n  vec3 dx = disp(aPos.xz + vec2(e, 0.0)) - p;\n  vec3 dz = disp(aPos.xz + vec2(0.0, e)) - p;\n  vN = uNM * normalize(cross(dz, dx));\n  vH  = p.y;\n  gl_Position = uMVP * vec4(p, 1.0);\n}`;\nconst FS = `precision mediump float;\nvarying vec3 vN; varying float vH;\nvoid main(){\n  vec3 n = normalize(vN);\n  float lam = max(dot(n, normalize(vec3(0.3, 0.9, 0.4))), 0.0);\n  float spec = pow(max(dot(n, normalize(vec3(-0.4, 0.7, -0.6))), 0.0), 28.0);\n  vec3 base = mix(vec3(0.10,0.13,0.30), vec3(0.30,0.75,1.0), smoothstep(-0.2, 0.28, vH));\n  gl_FragColor = vec4(base * (0.35 + 0.65 * lam) + spec, 1.0);\n}`;\n// 网格索引\nconst SEG = 28, verts = [], idx = [];\nfor (let z = 0; z <= SEG; z++) for (let x = 0; x <= SEG; x++)\n  verts.push((x / SEG - 0.5) * 3.2, 0, (z / SEG - 0.5) * 3.2);\nfor (let z = 0; z < SEG; z++) for (let x = 0; x < SEG; x++) {\n  const a = z * (SEG + 1) + x, b = a + 1, cc = a + SEG + 1, d = cc + 1;\n  idx.push(a, cc, b, b, cc, d);\n}\n// …建 program、Buffer、uniformLocation、透视矩阵、lookAt，\n// 每帧: gl.uniform1f(uTime, now/1000) 后 drawElements(gl.TRIANGLES, idx.length, gl.UNSIGNED_SHORT, 0)",
  init(el) {
    el.innerHTML = '';
    const c = document.createElement('canvas');
    c.style.cssText = 'width:100%;height:100%;display:block';
    el.appendChild(c);
    const gl = c.getContext('webgl', { antialias: true, alpha: true, premultipliedAlpha: true });
    if (!gl) return () => {};
    gl.clearColor(0, 0, 0, 0);

    const VS = `attribute vec3 aPos;
uniform mat4 uMVP; uniform mat3 uNM; uniform float uTime;
varying vec3 vN; varying float vH;
float wave(vec2 p, float t){
  return sin(p.x * 2.4 + t * 1.6) * 0.16
       + sin(p.y * 3.1 - t * 1.1) * 0.11
       + sin((p.x + p.y) * 5.2 + t * 2.3) * 0.05;
}
vec3 disp(vec2 p){ return vec3(p.x, wave(p, uTime), p.y); }
void main(){
  float e = 0.06;
  vec3 p  = disp(aPos.xz);
  vec3 dx = disp(aPos.xz + vec2(e, 0.0)) - p;
  vec3 dz = disp(aPos.xz + vec2(0.0, e)) - p;
  vN = uNM * normalize(cross(dz, dx));
  vH = p.y;
  gl_Position = uMVP * vec4(p, 1.0);
}`;
    const FS = `precision mediump float;
varying vec3 vN; varying float vH;
void main(){
  vec3 n = normalize(vN);
  float lam = max(dot(n, normalize(vec3(0.3, 0.9, 0.4))), 0.0);
  float spec = pow(max(dot(n, normalize(vec3(-0.4, 0.7, -0.6))), 0.0), 28.0);
  vec3 base = mix(vec3(0.10,0.14,0.32), vec3(0.30,0.78,1.0), smoothstep(-0.2, 0.28, vH));
  gl_FragColor = vec4(base * (0.35 + 0.65 * lam) + vec3(spec * 0.9), 1.0);
}`;
    const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return o; };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return () => {};
    gl.useProgram(prog);

    const SEG = 26, verts = [], idx = [];
    for (let z = 0; z <= SEG; z++) for (let x = 0; x <= SEG; x++)
      verts.push((x / SEG - 0.5) * 3.4, 0, (z / SEG - 0.5) * 3.4);
    for (let z = 0; z < SEG; z++) for (let x = 0; x < SEG; x++) {
      const a = z * (SEG + 1) + x, b = a + 1, cc = a + SEG + 1, d = cc + 1;
      idx.push(a, cc, b, b, cc, d);
    }
    const bPos = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, bPos);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, 'aPos');
    gl.enableVertexAttribArray(aPos); gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 0, 0);
    const bIdx = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bIdx);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(idx), gl.STATIC_DRAW);

    const uMVP = gl.getUniformLocation(prog, 'uMVP');
    const uNM = gl.getUniformLocation(prog, 'uNM');
    const uTime = gl.getUniformLocation(prog, 'uTime');

    const mul = (a, b) => { const o = new Float32Array(16);
      for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
        let s = 0; for (let k = 0; k < 4; k++) s += a[k*4+j] * b[i*4+k]; o[i*4+j] = s; }
      return o; };
    const persp = (fov, asp, n, f) => { const t = 1 / Math.tan(fov / 2);
      return new Float32Array([t/asp,0,0,0, 0,t,0,0, 0,0,(f+n)/(n-f),-1, 0,0,2*f*n/(n-f),0]); };
    const eye = [0, 2.35, 3.3];
    const nv = a => { const l = Math.hypot(a[0],a[1],a[2]) || 1; return [a[0]/l,a[1]/l,a[2]/l]; };
    const cr = (a, b) => [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
    const z = nv(eye), x = nv(cr([0,1,0], z)), y = cr(z, x);
    const view = new Float32Array([
      x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0,
      -(x[0]*eye[0]+x[1]*eye[1]+x[2]*eye[2]),
      -(y[0]*eye[0]+y[1]*eye[1]+y[2]*eye[2]),
      -(z[0]*eye[0]+z[1]*eye[1]+z[2]*eye[2]), 1
    ]);

    const resize = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      c.width = Math.round((c.clientWidth || 280) * dpr);
      c.height = Math.round((c.clientHeight || 150) * dpr);
      gl.viewport(0, 0, c.width, c.height);
    };
    resize();

    let raf = 0, t0 = performance.now();
    const loop = now => {
      resize();
      const sec = (now - t0) / 1000;
      const proj = persp(0.78, (c.width || 1) / (c.height || 1), 0.1, 50);
      const mvp = mul(proj, view);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.DEPTH_TEST);
      gl.uniformMatrix4fv(uMVP, false, mvp);
      gl.uniformMatrix3fv(uNM, false, new Float32Array([1,0,0, 0,1,0, 0,0,1]));
      gl.uniform1f(uTime, sec);
      gl.drawElements(gl.TRIANGLES, idx.length, gl.UNSIGNED_SHORT, 0);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      gl.deleteBuffer(bPos); gl.deleteBuffer(bIdx); gl.deleteProgram(prog);
    };
  }
};
