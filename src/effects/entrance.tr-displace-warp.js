export default {
  id: 'tr-displace-warp', group: 'entrance', name: '置换贴图扭曲', lib: 'GL Transitions',
  desc: "用灰度图当置换贴图，画面顺着明暗拉伸变形，配合淡入最有质感。",
  deps: '无（原生 WebGL）',
  note: "位移量必须和 progress 联动衰减，否则过渡中途画面整体偏出边界。strength 超过 1.5 会看到明显边缘撕裂。",
  code: "// GL Transitions · DisplacementMap.glsl（MIT, author: Travis Fischer）\nuniform sampler2D displacementMap;\nuniform float strength; // = 0.5\n\nvec4 transition (vec2 uv) {\n  float displacement = texture2D(displacementMap, uv).r * strength;\n\n  vec2 uvFrom = vec2(uv.x + progress * displacement, uv.y);\n  vec2 uvTo   = vec2(uv.x - (1.0 - progress) * displacement, uv.y);\n\n  return mix(getFromColor(uvFrom), getToColor(uvTo), progress);\n}",

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
      vec4 transition(vec2 uv){
  float disp = (0.5 + 0.5 * sin(uv.x * 22.0 + uv.y * 17.0)) * 0.5;
  vec2 uvFrom = vec2(uv.x + uP * disp, uv.y);
  vec2 uvTo   = vec2(uv.x - (1.0 - uP) * disp, uv.y);
  return mix(vec4(pick(0, uvFrom), 1.0), vec4(pick(1, uvTo), 1.0), uP);
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
