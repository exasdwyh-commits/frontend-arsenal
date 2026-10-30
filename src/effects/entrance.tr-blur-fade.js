export default {
  id: 'tr-blur-fade', group: 'entrance', name: '虚化交叉', lib: 'GL Transitions',
  desc: '靠模糊而不是淡化完成切换，信息量过渡最柔和。',
  deps: '无（原生 WebGL）',
  note: '6x6 采样等于每像素 36 次纹理读取，移动端必掉帧。生产环境降到 3x3，或改用两次一维高斯分离。',
  code: `// GL Transitions · LinearBlur.glsl（MIT, author: gre）
uniform float intensity; // = 0.1
const int passes = 6;

vec4 transition(vec2 uv) {
  vec4 c1 = vec4(0.0), c2 = vec4(0.0);
  float disp = intensity * (0.5 - distance(0.5, progress));
  for (int xi = 0; xi < passes; xi++) {
    for (int yi = 0; yi < passes; yi++) {
      vec2 v = vec2(float(xi) / float(passes) - 0.5,
                    float(yi) / float(passes) - 0.5);
      c1 += getFromColor(uv + disp * v);
      c2 += getToColor(uv + disp * v);
    }
  }
  c1 /= float(passes * passes);
  c2 /= float(passes * passes);
  return mix(c1, c2, progress);
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
      vec4 transition(vec2 uv) {
  vec3 c1 = vec3(0.0), c2 = vec3(0.0);
  float disp = 0.1 * (0.5 - abs(uP - 0.5));
  for (int xi = 0; xi < 6; xi++) {
    for (int yi = 0; yi < 6; yi++) {
      vec2 v = vec2(float(xi) / 6.0 - 0.5, float(yi) / 6.0 - 0.5);
      c1 += pick(0, uv + disp * v);
      c2 += pick(1, uv + disp * v);
    }
  }
  c1 /= 36.0; c2 /= 36.0;
  return vec4(mix(c1, c2, uP), 1.0);
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
