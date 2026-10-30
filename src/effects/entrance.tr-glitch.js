export default {
  id: 'tr-glitch', group: 'entrance', name: '故障闪切', lib: 'GL Transitions',
  desc: 'RGB 三通道错位加色块抖动，赛博、断裂、故障感转场。',
  deps: '无（原生 WebGL）',
  note: '三个通道用三个不同的位移系数（0.2 / 0.3 / 0.5），用同一个就没有色散感。floor(progress*1200) 制造的是整帧跳变而非平滑位移，这才是故障感的来源。',
  code: `// GL Transitions · GlitchMemories.glsl（MIT, author: Gunnar Roth）
vec4 transition(vec2 p) {
  vec2 block = floor(p.xy / vec2(16));
  vec2 uv_noise = block / vec2(64);
  uv_noise += floor(vec2(progress) * vec2(1200.0, 3500.0)) / vec2(64);
  vec2 dist = progress > 0.0 ? (fract(uv_noise) - 0.5) * 0.3 * (1.0 - progress) : vec2(0.0);

  vec2 red   = p + dist * 0.2;
  vec2 green = p + dist * 0.3;
  vec2 blue  = p + dist * 0.5;

  vec4 center = mix(getFromColor(green), getToColor(green), progress);
  return vec4(mix(getFromColor(red),  getToColor(red),  progress).r,
              center.g,
              mix(getFromColor(blue), getToColor(blue), progress).b,
              center.a);
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
      vec4 transition(vec2 p) {
  vec2 block = floor(p / vec2(16.));
  vec2 noise = block / vec2(64.);
  noise += floor(vec2(uP) * vec2(1200.0, 3500.0)) / vec2(64.);
  vec2 dist = uP > 0.0 ? (fract(noise) - 0.5) * 0.3 * (1.0 - uP) : vec2(0.0);
  vec4 center = mix(vec4(pick(0, p + dist * .3), 1.0), vec4(pick(1, p + dist * .3), 1.0), uP);
  return vec4(
    mix(vec4(pick(0, p + dist * .2), 1.0), vec4(pick(1, p + dist * .2), 1.0), uP).r,
    center.g,
    mix(vec4(pick(0, p + dist * .5), 1.0), vec4(pick(1, p + dist * .5), 1.0), uP).b,
    center.a);
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
