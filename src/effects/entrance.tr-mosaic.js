export default {
  id: 'tr-mosaic', group: 'entrance', name: '马赛克巡览', lib: 'GL Transitions',
  desc: "镜头在由两幅图拼成的旋转马赛克上平移，最后停在新画面那一格。",
  deps: '无（原生 WebGL）',
  note: "mod(rp,1.0) 之后必须判 onEnd，否则终点那格会被当成普通格子旋转。CosInterpolation 用 -cos(πx)/2+0.5，比 smoothstep 更平缓，这才是巡览匀速感的来源。",
  code: "// GL Transitions · Mosaic.glsl（MIT, author: Xaychru）\n#define PI 3.14159265358979323\nuniform int endx; // = 2\nuniform int endy; // = -1\n\nfloat Rand(vec2 v){ return fract(sin(dot(v.xy, vec2(12.9898,78.233))) * 43758.5453); }\nvec2  Rotate(vec2 v, float a){\n  return mat2(cos(a), -sin(a), sin(a), cos(a)) * v;\n}\nfloat CosInterpolation(float x){ return -cos(x*PI)/2. + .5; }\n\nvec4 transition(vec2 uv) {\n  vec2 p = uv - .5;\n  float rpr = (progress * 2. - 1.);\n  vec2 rp = p * abs(-(rpr * rpr * 2.) + 3.);\n  rp += mix(vec2(.5,.5), vec2(float(endx)+.5, float(endy)+.5),\n            pow(CosInterpolation(progress), 2.));\n\n  bool onEnd = int(floor(rp.x)) == endx && int(floor(rp.y)) == endy;\n  vec2 mrp = mod(rp, 1.);\n  if (!onEnd) {\n    float ang = float(int(Rand(floor(rp))*4.)) * .5 * PI/2.;\n    mrp = Rotate(mrp - .5, ang) + .5;\n    return getFromColor(mrp);\n  }\n  return getToColor(mrp);\n}",

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
      float Rand(vec2 v){ return fract(sin(dot(v, vec2(12.9898,78.233))) * 43758.5453); }
vec2 Rotate(vec2 v, float a){ return mat2(cos(a), -sin(a), sin(a), cos(a)) * v; }
float CosInterp(float x){ return -cos(x * 3.14159265) / 2.0 + 0.5; }
vec4 transition(vec2 uv){
  vec2 p = uv - .5;
  float rpr = uP * 2.0 - 1.0;
  float z = -(rpr * rpr * 2.0) + 3.0;
  vec2 rp = p * abs(z);
  rp += mix(vec2(.5), vec2(2.5, -0.5), pow(CosInterp(uP), 2.0));
  vec2 cell = floor(rp);
  bool onEnd = int(cell.x) == 2 && int(cell.y) == -1;
  vec2 mrp = mod(rp, 1.0);
  if (!onEnd) {
    float ang = float(int(Rand(cell) * 4.0)) * 0.5 * 1.5708;
    mrp = Rotate(mrp - .5, ang) + .5;
    if (mrp.x < 0.0 || mrp.x > 1.0 || mrp.y < 0.0 || mrp.y > 1.0)
      return vec4(0.05, 0.06, 0.09, 1.0);
    return vec4(pick(0, mrp), 1.0);
  }
  return vec4(pick(1, mrp), 1.0);
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
    } catch (e) { el.innerHTML = '<div class="ph">着色器编译失败</div>'; return () => {}; }
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
      const p = ((performance.now() - t0) % 3000) / 3000;
      const v = p < .5 ? p * 2 : 2 - p * 2;
      gl.uniform1f(uP, v);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }

};
