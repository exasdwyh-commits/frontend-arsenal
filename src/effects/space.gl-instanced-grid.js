export default {
  id: 'gl-instanced-grid', group: 'space', name: '实例化网格阵列（instanced 波）', lib: 'WebGL',
  desc: '14×9 个小方块用一次 drawArraysInstanced 画出，高度场随距离衰减成涟漪。',
  deps: '无（原生 WebGL2 / ANGLE_instanced_arrays）',
  note: 'WebGL1 的 instancing 要开 ANGLE_instanced_arrays 扩展并用 vertexAttribDivisor；忘了 divisor 会让所有实例读到第 0 号实例的矩阵，屏幕上只剩一个块。实例数 ×（顶点数 + 每实例 attribute）一旦超过 16 个 attribute 槽就会静默失配，移动端先查 MAX_VERTEX_ATTRIBS。',
  code: "const c = document.querySelector('#stage');\nconst gl = c.getContext('webgl') || c.getContext('experimental-webgl');\nconst ext = gl.getExtension('ANGLE_instanced_arrays');\nif (!ext) throw new Error('无 instancing');\n\nconst VS = `attribute vec2 aCorner;        // 单位立方体前面板 4 角\nattribute vec2 aCell;          // 每实例：网格坐标\nuniform mat4 uVP; uniform float uTime; uniform vec2 uGrid;\nuniform float uAmp;\nvarying float vH;\nvoid main(){\n  vec2 uv = aCell / uGrid - 0.5;\n  float d = length(uv);\n  // 由中心向外扩散的涟漪，1.6Hz\n  float h = sin(d * 26.0 - uTime * 6.0) * exp(-d * 3.2) * uAmp;\n  vH = h;\n  vec2 g = vec2((aCell.x / uGrid.x - 0.5) * 4.4, (aCell.y / uGrid.y - 0.5) * 2.9);\n  vec3 p = vec3(g.x + aCorner.x * 0.09, h + aCorner.y * 0.09, g.y);\n  gl_Position = uVP * vec4(p, 1.0);\n}`;\nconst FS = `precision mediump float; varying float vH;\nvoid main(){\n  vec3 cold = vec3(0.18, 0.24, 0.45), hot = vec3(0.35, 0.85, 1.0);\n  gl_FragColor = vec4(mix(cold, hot, clamp(vH * 1.6 + 0.35, 0.0, 1.0)), 1.0);\n}`;\n// …建 program、aCorner 静态 buffer、aCell 实例 buffer\n// 关键三行：\n// gl.bindBuffer(gl.ARRAY_BUFFER, cellBuf);\n// gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);\n// ext.vertexAttribDivisorANGLE(loc, 1);      // 每实例推进一次\n// ext.drawArraysInstancedANGLE(gl.TRIANGLE_FAN, 0, 4, COLS * ROWS);",
  init(el) {
    el.innerHTML = '';
    const c = document.createElement('canvas');
    c.style.cssText = 'width:100%;height:100%;display:block';
    el.appendChild(c);
    const gl = c.getContext('webgl', { antialias: true, alpha: true, premultipliedAlpha: true });
    if (!gl) return () => {};
    const ext = gl.getExtension('ANGLE_instanced_arrays');
    if (!ext) { el.innerHTML = '<div style="color:#8b93a7;font-size:12px;padding:56px 0;text-align:center">需要 instancing 扩展</div>'; return () => {}; }
    gl.clearColor(0, 0, 0, 0);

    const VS = `attribute vec2 aCorner; attribute vec2 aCell;
uniform mat4 uVP; uniform float uTime; uniform vec2 uGrid; uniform float uAmp;
varying float vH;
void main(){
  vec2 uv = aCell / uGrid - 0.5;
  float d = length(uv);
  float h = sin(d * 26.0 - uTime * 6.0) * exp(-d * 3.2) * uAmp;
  vH = h;
  vec2 g = vec2((aCell.x / uGrid.x - 0.5) * 4.4, (aCell.y / uGrid.y - 0.5) * 2.9);
  vec3 p = vec3(g.x + aCorner.x * 0.085, h + aCorner.y * 0.085, g.y);
  gl_Position = uVP * vec4(p, 1.0);
}`;
    const FS = `precision mediump float; varying float vH;
void main(){
  vec3 cold = vec3(0.18, 0.24, 0.46), hot = vec3(0.35, 0.86, 1.0);
  gl_FragColor = vec4(mix(cold, hot, clamp(vH * 1.8 + 0.35, 0.0, 1.0)), 1.0);
}`;
    const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return o; };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return () => {};
    gl.useProgram(prog);

    const COLS = 14, ROWS = 9;
    const corner = new Float32Array([-1,-1, 1,-1, 1,1, -1,1]);
    const cellArr = new Float32Array(COLS * ROWS * 2);
    for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
      const i = (y * COLS + x) * 2; cellArr[i] = x; cellArr[i+1] = y;
    }
    const bCorner = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, bCorner);
    gl.bufferData(gl.ARRAY_BUFFER, corner, gl.STATIC_DRAW);
    const lCorner = gl.getAttribLocation(prog, 'aCorner');
    gl.enableVertexAttribArray(lCorner);
    gl.vertexAttribPointer(lCorner, 2, gl.FLOAT, false, 0, 0);
    ext.vertexAttribDivisorANGLE(lCorner, 0);

    const bCell = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, bCell);
    gl.bufferData(gl.ARRAY_BUFFER, cellArr, gl.STATIC_DRAW);
    const lCell = gl.getAttribLocation(prog, 'aCell');
    gl.enableVertexAttribArray(lCell);
    gl.vertexAttribPointer(lCell, 2, gl.FLOAT, false, 0, 0);
    ext.vertexAttribDivisorANGLE(lCell, 1);           // 关键

    const uVP = gl.getUniformLocation(prog, 'uVP');
    const uTime = gl.getUniformLocation(prog, 'uTime');
    const uGrid = gl.getUniformLocation(prog, 'uGrid');
    const uAmp = gl.getUniformLocation(prog, 'uAmp');

    const mul = (a, b) => { const o = new Float32Array(16);
      for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
        let s = 0; for (let k = 0; k < 4; k++) s += a[k*4+j] * b[i*4+k]; o[i*4+j] = s; }
      return o; };
    const persp = (fov, asp, n, f) => { const t = 1 / Math.tan(fov / 2);
      return new Float32Array([t/asp,0,0,0, 0,t,0,0, 0,0,(f+n)/(n-f),-1, 0,0,2*f*n/(n-f),0]); };
    const rotX = a => { const cs = Math.cos(a), sn = Math.sin(a);
      return new Float32Array([1,0,0,0, 0,cs,sn,0, 0,-sn,cs,0, 0,0,0,1]); };

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
      const proj = persp(0.85, (c.width || 1) / (c.height || 1), 0.1, 50);
      const vp = mul(mul(proj, rotX(-0.95)), new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,-4.2,1]));
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.DEPTH_TEST);
      gl.uniformMatrix4fv(uVP, false, vp);
      gl.uniform1f(uTime, sec);
      gl.uniform2f(uGrid, COLS, ROWS);
      gl.uniform1f(uAmp, 0.30);
      ext.drawArraysInstancedANGLE(gl.TRIANGLE_FAN, 0, 4, COLS * ROWS);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      gl.deleteBuffer(bCorner); gl.deleteBuffer(bCell); gl.deleteProgram(prog);
    };
  }
};
