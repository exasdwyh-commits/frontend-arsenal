export default {
  id: 'instanced-dots', group: 'particle', name: '实例化点云', lib: 'WebGL instancing',
  desc: '一次 draw call 画上千个点，每个点独立相位，做高密度星场与数据节点。',
  deps: '无（生产用 OGL Geometry instanced / PixiJS ParticleContainer）',
  note: '关键在 divisor：instanced attribute 必须设 divisor=1，否则所有实例读到同一份数据，看起来就是"一个点"。1000 个点用 instancing 约 1 次 draw call；不用的话是 1000 次。',
  code: `// OGL：实例化属性
const geometry = new Geometry(gl, {
  position: { size: 2, data: quad },          // 单位方块
  iOffset: { size: 2, data: offsets, instanced: 1, divisor: 1 },  // ← divisor 1
  iSeed:   { size: 1, data: seeds,   instanced: 1, divisor: 1 },
});
geometry.setInstancedCount(count);           // 一次画 count 个

// PixiJS 等效
new ParticleContainer({ dynamicProperties: { position: true, scale: true } })`,
  init(el) {
    const cv = document.createElement('canvas');
    cv.width = 280; cv.height = 150;
    el.appendChild(cv);
    const gl = cv.getContext('webgl');
    if (!gl) { el.innerHTML = '<div class="ph">需要 WebGL</div>'; return () => {}; }
    const N = 900;
    // 每个实例：xy 偏移 + 相位
    const data = new Float32Array(N * 3);
    let s = 3;
    const r = () => (s = s * 16807 % 2147483647) / 2147483647;
    for (let i = 0; i < N; i++) {
      data[i * 3] = r() * 2 - 1;
      data[i * 3 + 1] = r() * 2 - 1;
      data[i * 3 + 2] = r() * 6.283;
    }
    const vs = `attribute vec2 aPos; attribute vec3 aInst;
      uniform float uT, uAspect; varying float vPh;
      void main(){
        vec2 p = aInst.xy;
        float ph = aInst.z;
        p.x += sin(uT * .8 + ph) * .035;
        p.y += cos(uT * .6 + ph * 1.4) * .045;
        float size = .006 + .010 * (0.5 + 0.5 * sin(uT * 2.0 + ph * 3.0));
        gl_Position = vec4(p.x / uAspect + aPos.x * size, p.y + aPos.y * size, 0., 1.);
        gl_PointSize = 1.0;
        vPh = ph;
      }`;
    const fs = `precision mediump float; varying float vPh;
      void main(){
        vec3 a = vec3(.37,.23,1.0), b = vec3(.24,.80,1.0);
        gl_FragColor = vec4(mix(a, b, fract(vPh * .16)), .55 + .35 * fract(vPh * .3));
      }`;
    const sh = (t, src) => {
      const o = gl.createShader(t); gl.shaderSource(o, src); gl.compileShader(o);
      if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o));
      return o;
    };
    let pr;
    try {
      pr = gl.createProgram();
      gl.attachShader(pr, sh(gl.VERTEX_SHADER, vs));
      gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs));
      gl.linkProgram(pr); gl.useProgram(pr);
    } catch (e) { el.innerHTML = '<div class="ph">着色器编译失败</div>'; return () => {}; }

    // 单位方块
    const quad = new Float32Array([-1,-1, 1,-1, -1,1, 1,-1, 1,1, -1,1]);
    const bPos = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, bPos);
    gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);
    const lPos = gl.getAttribLocation(pr, 'aPos');
    gl.enableVertexAttribArray(lPos);
    gl.vertexAttribPointer(lPos, 2, gl.FLOAT, false, 0, 0);

    // 实例数据 + divisor 1
    const bInst = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, bInst);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    const lInst = gl.getAttribLocation(pr, 'aInst');
    gl.enableVertexAttribArray(lInst);
    gl.vertexAttribPointer(lInst, 3, gl.FLOAT, false, 0, 0);
    const ext = gl.getExtension('ANGLE_instanced_arrays');
    if (ext) ext.vertexAttribDivisorANGLE(lInst, 1);

    const uT = gl.getUniformLocation(pr, 'uT');
    const uA = gl.getUniformLocation(pr, 'uAspect');
    gl.uniform1f(uA, cv.width / cv.height);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    let raf, t = 0;
    const loop = () => {
      t += .016;
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(uT, t);
      if (ext) ext.drawArraysInstancedANGLE(gl.TRIANGLES, 0, 6, N);
      else gl.drawArrays(gl.TRIANGLES, 0, 6);
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }
};
