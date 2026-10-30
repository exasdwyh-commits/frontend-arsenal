export default {
  id: 'tr-burn', group: 'entrance', name: '燃烧侵蚀', lib: 'GL Transitions',
  desc: "旧画面从边缘烧穿，橙色火线向内吞噬，露出新画面。",
  deps: '无（原生 WebGL）',
  note: "OCTAVES=4 的 fbm 在 560x300 下每像素 4 次噪声采样，移动端改成 2 层。火线颜色必须带 HDR 亮度（乘 2 以上）才在合成后仍然发亮，直给 vec3(1.0,0.5,0.0) 会发灰。",
  code: "// GL Transitions · BurnThrough.glsl（MIT）\nuniform vec3 burnColor; // = vec3(1.0, 0.5, 0.0)\n#define OCTAVES 4\n\nfloat fbm(in vec2 st){\n  float value = 0.0, amplitude = .5;\n  for (int i = 0; i < OCTAVES; i++){\n    value += amplitude * noise(st);\n    st *= 2.;\n    amplitude *= .5;\n  }\n  return value;\n}\n\nvec4 transition (vec2 uv) {\n  float n  = fbm(uv * 3.0);\n  float th = progress * 1.3 - 0.15;\n  float m  = smoothstep(n - 0.04, n + 0.04, th);\n  vec3 fire = burnColor * 2.2;          // HDR 亮度才够亮\n  return mix(mix(getFromColor(uv), vec4(fire,1.), 1.-m),\n             getToColor(uv), m);\n}",

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
      float random(vec2 st){ return fract(sin(dot(st, vec2(12.9898,78.233)))*43758.5453123); }
float noise(vec2 st){
  vec2 i = floor(st), f = fract(st);
  float a = random(i), b = random(i + vec2(1.,0.));
  float c = random(i + vec2(0.,1.)), d = random(i + vec2(1.,1.));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a,b,u.x) + (c-a)*u.y*(1.0-u.x) + (d-b)*u.x*u.y;
}
float fbm(vec2 st){
  float v = 0.0, amp = .5;
  for (int i = 0; i < 4; i++) { v += amp * noise(st); st *= 2.0; amp *= .5; }
  return v;
}
vec4 transition(vec2 uv){
  float n = fbm(uv * 3.0);
  float th = uP * 1.3 - 0.15;
  float m = smoothstep(n - 0.04, n + 0.04, th);
  vec3 from = pick(0, uv);
  vec3 to   = pick(1, uv);
  float edge = smoothstep(0.0, 0.08, abs(n - th));
  vec3 fire = vec3(1.0, 0.5, 0.0) * 2.2;
  return vec4(mix(mix(from, fire, (1.0 - edge) * (1.0 - m)), to, m), 1.0);
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
