export default {
  id: 'tr-noise-dissolve', group: 'entrance', name: '噪声溶解', lib: 'GL Transitions',
  desc: '噪声团块逐步显现新画面，比线性溶解自然，适合内容换页。',
  deps: '无（原生 WebGL）',
  note: 'scale 越大团块越小（默认 4.0）。smoothness=0.01 非常锐利，想要柔和调到 0.1。噪声必须带 seed，否则每次刷新纹理一样，看着像假动画。',
  code: `// GL Transitions · PerlinDissolve.glsl（MIT, author: Rich Harris）
uniform float scale;      // = 4.0   越大团块越小
uniform float smoothness; // = 0.01  边缘柔和度
uniform float seed;       // = 12.9898

float random(vec2 co) {
  return fract(sin(dot(co.xy, vec2(seed, 78.233))) * 43758.5453);
}
float noise(vec2 st) {
  vec2 i = floor(st), f = fract(st);
  float a = random(i),              b = random(i + vec2(1, 0));
  float c = random(i + vec2(0, 1)), d = random(i + vec2(1, 1));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

vec4 transition(vec2 uv) {
  float n = noise(uv * scale) * 2.0;
  float v = smoothstep(n - smoothness, n + smoothness, progress);
  return mix(getFromColor(uv), getToColor(uv), v);
}`,

  init(el) {
    const cv = document.createElement('canvas');
    cv.width = 560; cv.height = 300;
    el.appendChild(cv);
    const gl = cv.getContext('webgl');
    if (!gl) { el.innerHTML = '<div class="ph">需要 WebGL</div>'; return () => {}; }
    const vs = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;
    const fs = `precision highp float;
      uniform float uP; uniform vec2 uR;
      vec3 pick(int m, vec2 uv){
        if (m == 0) {
          float s = step(.5, fract((uv.x + uv.y) * 6.0));
          return mix(vec3(.18,.10,.52), vec3(.37,.23,1.0), s * .5 + .25);
        }
        vec2 g = abs(fract(uv * 8.0) - .5);
        float line = smoothstep(.44, .5, max(g.x, g.y));
        return mix(vec3(.02,.06,.10), vec3(.24,.80,1.0), line);
      }
      float rand(vec2 co) { return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453); }
float vnoise(vec2 st) {
  vec2 i = floor(st), f = fract(st);
  float a = rand(i), b = rand(i + vec2(1.0, 0.0));
  float c = rand(i + vec2(0.0, 1.0)), d = rand(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

vec4 transition(vec2 uv) {
  float n = vnoise(uv * 4.0) * 2.0;
  float v = smoothstep(n - 0.01, n + 0.01, uP);
  return mix(vec4(pick(0, uv), 1.0), vec4(pick(1, uv), 1.0), v);
}
      void main(){
        vec2 uv = gl_FragCoord.xy / uR;
        gl_FragColor = transition(uv);
      }`;
    const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o);
      if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); return o; };
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
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const uP = gl.getUniformLocation(pr, 'uP');
    const uR = gl.getUniformLocation(pr, 'uR');
    gl.uniform2f(uR, cv.width, cv.height);
    let raf; const t0 = performance.now();
    const loop = () => {
      const p = ((performance.now() - t0) % 2800) / 2800;
      const v = p < .5 ? p * 2 : 2 - p * 2;
      gl.uniform1f(uP, v);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }

};
