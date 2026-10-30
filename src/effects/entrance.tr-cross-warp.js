export default {
  id: 'tr-cross-warp', group: 'entrance', name: '交叉缩放推移', lib: 'GL Transitions',
  desc: "旧画面放大退场、新画面从缩小状态推入，像镜头穿过一扇门。只有 4 行。",
  deps: '无（原生 WebGL）',
  note: "只有 4 行却效果很好，秘诀是 smoothstep 里的 +p.x：让推进边缘随横坐标倾斜，形成斜向扫过。去掉它就变成呆板的中心缩放。",
  code: "// GL Transitions · CrossWarp.glsl（MIT, author: Eke Péter）\nvec4 transition(vec2 p) {\n  float x = progress;\n  x = smoothstep(.0, 1.0, (x * 2.0 + p.x - 1.0));   // +p.x 是关键：斜向扫过\n  return mix(getFromColor((p - .5) * (1. - x) + .5),\n             getToColor  ((p - .5) * x + .5), x);\n}",

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
      vec4 transition(vec2 p){
  float x = uP;
  x = smoothstep(0.0, 1.0, (x * 2.0 + p.x - 1.0));
  return mix(vec4(pick(0, (p - .5) * (1. - x) + .5), 1.0),
             vec4(pick(1, (p - .5) * x + .5), 1.0), x);
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
