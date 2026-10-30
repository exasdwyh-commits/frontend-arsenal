export default {
  id: 'gl-transition', group: 'entrance', name: '着色器转场', lib: 'GL Transitions',
  desc: 'WebGL 像素级过渡（溶解/波纹），用于章节切换和画面交接。',
  deps: '无（原生 WebGL）',
  note: '生产环境直接引 gl-transitions 官方 GLSL 库，换一个片段文件就能从"溶解"变"波纹"。自己写过渡迟早会卡在边缘处理上。',
  code: `precision highp float;
uniform float uProgress;   // 0→1 驱动转场
uniform vec2  uRes;
float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
void main(){
  vec2 uv = gl_FragCoord.xy/uRes;
  float n = hash(floor(uv*40.0));   // 溶解噪声
  float m = step(n, uProgress);     // 阈值裁切
  vec3 c  = mix(vec3(.07,.08,.11), vec3(.37,.23,1.), m);
  gl_FragColor = vec4(c,1.);
}`,
  init(el) {
    const cv = document.createElement('canvas');
    cv.width = 560; cv.height = 300;
    el.appendChild(cv);
    const gl = cv.getContext('webgl');
    if (!gl) { el.innerHTML = '<div class="ph">当前浏览器不支持 WebGL</div>'; return () => {}; }
    const vs = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;
    const fs = `precision highp float;uniform float uP;uniform vec2 uR;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      void main(){vec2 uv=gl_FragCoord.xy/uR;float n=hash(floor(uv*40.0));
      float m=step(n,uP);vec3 c=mix(vec3(.07,.08,.11),vec3(.37,.23,1.),m);
      float edge=smoothstep(0.0,0.08,abs(n-uP));
      c=mix(vec3(.24,.80,1.),c,edge);gl_FragColor=vec4(c,1.);}`;
    const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return o; };
    const pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, vs));
    gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(pr); gl.useProgram(pr);
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const uP = gl.getUniformLocation(pr, 'uP'), uR = gl.getUniformLocation(pr, 'uR');
    gl.uniform2f(uR, cv.width, cv.height);
    let raf; const t0 = performance.now();
    const loop = () => {
      const p = ((performance.now() - t0) % 2600) / 2600;
      const v = p < .5 ? p * 2 : 2 - p * 2;
      gl.uniform1f(uP, v);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }
};
