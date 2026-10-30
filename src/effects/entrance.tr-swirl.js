export default {
  id: 'tr-swirl', group: 'entrance', name: '漩涡旋转', lib: 'GL Transitions',
  desc: '两幅画面绕中心旋转，中心转得最快，边缘几乎不动。',
  deps: '无（原生 WebGL）',
  note: 'pct*pct 让旋转量随半径平方衰减，这是「漩涡」而不是「整体旋转」的关键。8.0 是旋转量上限，调一倍就晕了。',
  code: `// GL Transitions · Swirl.glsl（MIT, author: Sergey Kosarevsky）
vec4 transition(vec2 UV) {
  float Radius = 1.0;
  float T = progress;
  UV -= vec2(0.5);
  float Dist = length(UV);

  if (Dist < Radius) {
    float Percent = (Radius - Dist) / Radius;
    float A = (T <= 0.5) ? mix(0.0, 1.0, T / 0.5) : mix(1.0, 0.0, (T - 0.5) / 0.5);
    float Theta = Percent * Percent * A * 8.0 * 3.14159;
    float S = sin(Theta), C = cos(Theta);
    UV = vec2(dot(UV, vec2(C, -S)), dot(UV, vec2(S, C)));
  }
  UV += vec2(0.5);
  return mix(getFromColor(UV), getToColor(UV), T);
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
      vec4 transition(vec2 UV) {
  vec2 t = UV - vec2(.5);
  float dist = length(t);
  float pct = 1.0 - dist;
  float a = (uP <= 0.5) ? (uP / 0.5) : ((1.0 - uP) / 0.5);
  float theta = pct * pct * a * 8.0 * 3.14159;
  float s = sin(theta), c = cos(theta);
  vec2 r = vec2(dot(t, vec2(c, -s)), dot(t, vec2(s, c))) + vec2(.5);
  return mix(vec4(pick(0, r), 1.0), vec4(pick(1, r), 1.0), uP);
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
