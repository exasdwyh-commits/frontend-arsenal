export default {
  id: 'three-cube', group: 'space', name: '3D 产品旋转', lib: 'Three.js',
  desc: 'WebGL 3D 实体旋转，替代静态产品图做 360° 展示。',
  deps: 'three@0.160.0',
  note: '演示用的是原生 WebGL（双击即跑，无依赖）。真做产品级质感必须上 Three.js + glTF + HDRI 环境贴图——裸灯泡场景看着简陋，缺的是环境光不是模型。',
  code: `import * as THREE from 'three';

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
const scene = new THREE.Scene();
const cam = new THREE.PerspectiveCamera(50, w / h, .1, 100);
cam.position.z = 3;

const mesh = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshStandardMaterial({ color: 0x5F3BFF, metalness: .6, roughness: .25 })
);
scene.add(mesh);
const key = new THREE.DirectionalLight(0x3CCBFF, 2.4);
key.position.set(2, 3, 3); scene.add(key, new THREE.AmbientLight(0xffffff, .35));

// 关键：真正的质感来自环境贴图
scene.environment = new THREE.PMREMGenerator(renderer)
  .fromEquirectangular(hdriTexture).texture;

mesh.rotation.y += 0.011;   // 每帧自转`,
  init(el) {
    const cv = document.createElement('canvas');
    cv.width = 280; cv.height = 150;
    el.appendChild(cv);
    const gl = cv.getContext('webgl', { antialias: true, alpha: true });
    if (!gl) { el.innerHTML = '<div class="ph">当前浏览器不支持 WebGL</div>'; return () => {}; }
    const vs = `attribute vec3 p;uniform mat4 uMVP;void main(){gl_Position=uMVP*vec4(p,1.0);}`;
    const fs = `precision mediump float;uniform float uZ;void main(){
      gl_FragColor=vec4(mix(vec3(.37,.23,1.),vec3(.24,.80,1.),uZ*.5+.5),1.0);}`;
    const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return o; };
    const pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, vs));
    gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(pr); gl.useProgram(pr);
    const s = .62;
    const V = [[-s,-s,-s],[s,-s,-s],[s,s,-s],[-s,s,-s],[-s,-s,s],[s,-s,s],[s,s,s],[-s,s,s]];
    const E = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    const loc = gl.getAttribLocation(pr, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 3, gl.FLOAT, false, 0, 0);
    gl.enable(gl.DEPTH_TEST);
    const uMVP = gl.getUniformLocation(pr, 'uMVP'), uZ = gl.getUniformLocation(pr, 'uZ');
    const persp = () => {
      const f = 1 / Math.tan(Math.PI / 9), n = .1, fa = 100;
      return [f * cv.height / cv.width,0,0,0, 0,f,0,0, 0,0,(fa+n)/(n-fa),-1, 0,0,2*fa*n/(n-fa),0];
    };
    // 列主序矩阵乘法：A*B 在 GL 里必须写作 col_i(A)*B
    const mul = (A, B) => {
      const o = new Array(16).fill(0);
      for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) {
        let v = 0;
        for (let k = 0; k < 4; k++) v += A[k * 4 + r] * B[c * 4 + k];
        o[c * 4 + r] = v;
      }
      return o;
    };
    let raf, t = 0;
    const loop = () => {
      t += .011;
      const cy = Math.cos(t), sy = Math.sin(t), cx = Math.cos(t * .6), sx = Math.sin(t * .6);
      const ry = [cy,0,-sy,0, 0,1,0,0, sy,0,cy,0, 0,0,0,1];
      const rx = [1,0,0,0, 0,cx,sx,0, 0,-sx,cx,0, 0,0,0,1];
      const T  = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,-3.2,1];
      const M = mul(mul(T, ry), rx);
      gl.uniformMatrix4fv(uMVP, false, new Float32Array(mul(persp(), M)));
      gl.uniform1f(uZ, Math.sin(t));
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      for (const [a, b] of E) {
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([...V[a], ...V[b]]), gl.STATIC_DRAW);
        gl.drawArrays(gl.LINES, 0, 2);
      }
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }
};
