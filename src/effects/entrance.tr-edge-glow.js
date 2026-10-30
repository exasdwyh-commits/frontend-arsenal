export default {
  id: 'tr-edge-glow', group: 'entrance', name: '边缘发光溶解', lib: 'GL Transitions',
  desc: "两幅画面经黑色过渡，图像轮廓边缘发出辉光，暗场转场的高级做法。",
  deps: '无（原生 WebGL）',
  note: "Sobel 核必须做 8 邻域加权（对角权重 1、正交权重 2），只用 4 邻域会漏掉细线。edge_thickness=0.001 是相对 UV 的，按 560px 宽算只有 0.56 像素，想更明显要调到 0.003。",
  code: "// GL Transitions · EdgeGlow.glsl（MIT, author: Woohyun Kim）\nuniform float edge_thickness;  // = 0.001\nuniform float edge_brightness; // = 8.0\n\nvec3 detectEdgeColor(vec3[9] c){\n  /* 邻域布局  036\n               147\n               258 */\n  vec3 dx = 2.0 * abs(c[7]-c[1]) + abs(c[2] - c[6]) + abs(c[8] - c[0]);\n  vec3 dy = 2.0 * abs(c[3]-c[5]) + abs(c[6] - c[8]) + abs(c[0] - c[2]);\n  float delta = length(0.25 * (dx + dy) * 0.5);\n  return clamp(edge_brightness * delta, 0.0, 1.0) * c[4];\n}\n\nvec4 getFromEdgeColor(vec2 uv){\n  vec3 c[9];\n  for (int i = 0; i < 3; ++i) for (int j = 0; j < 3; ++j)\n    c[3*i + j] = getFromColor(uv + edge_thickness * vec2(i-1, j-1)).rgb;\n  return vec4(detectEdgeColor(c), 1.0);\n}",

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
      vec3 detectEdge(vec3 c[9]){
  vec3 dx = 2.0*abs(c[7]-c[1]) + abs(c[2]-c[6]) + abs(c[8]-c[0]);
  vec3 dy = 2.0*abs(c[3]-c[5]) + abs(c[6]-c[8]) + abs(c[0]-c[2]);
  float delta = length(0.25 * (dx + dy) * 0.5);
  return clamp(8.0 * delta, 0.0, 1.0) * c[4];
}
vec3 edgeOf(int m, vec2 uv){
  vec3 c[9];
  float th = 0.003;
  for (int i = 0; i < 3; ++i) for (int j = 0; j < 3; ++j)
    c[3*i + j] = pick(m, uv + th * vec2(float(i-1), float(j-1)));
  return detectEdge(c);
}
vec4 transition(vec2 uv){
  vec3 ef = edgeOf(0, uv);
  vec3 et = edgeOf(1, uv);
  float black = 1.0 - abs(uP * 2.0 - 1.0);
  vec3 base = mix(pick(0, uv), pick(1, uv), uP);
  return vec4(base * (1.0 - black) + (ef + et) * black, 1.0);
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
