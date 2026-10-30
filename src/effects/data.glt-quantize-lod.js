export default {
  id: 'glt-quantize-lod', group: 'data', name: '模型 LOD 切换 + 量化误差可视化', lib: 'Canvas 2D',
  desc: '同一个球体在四级 LOD 间来回切换，橙色边线是量化（14bit→10bit）带来的顶点偏移。',
  deps: '无（手写球面细分 + 顶点量化，等价 gltf-transform 的 simplify/quantize）',
  note: 'gltf-transform 的 draco/quantize 默认 POSITION 14bit、NORMAL 10bit、TEXCOORD 12bit。10bit 法线在低角度光照下会浮出斜条纹，所以法线别低于 8bit；密度足够时 12bit 位置误差已经到亚毫米。LOD 切换阈值按屏幕投影尺寸算（约 60px），别按距离，否则镜头一近就跳。',
  code: "// 量化：value∈[-1,1] → round(v * (2^(bits-1)-1)) → 反量化\nconst quantize = (v, bits) => {\n  const scale = Math.pow(2, bits - 1) - 1;\n  return Math.round(v * scale) / scale;\n};\n// 球面 fibonacci 采样 → 构建 LOD 顶点集\nfunction sphereLOD(count) {\n  const pts = [];\n  const ga = Math.PI * (3 - Math.sqrt(5));\n  for (let i = 0; i < count; i++) {\n    const y = 1 - (i / (count - 1)) * 2;\n    const r = Math.sqrt(Math.max(0, 1 - y * y));\n    const th = ga * i;\n    pts.push([Math.cos(th) * r, y, Math.sin(th) * r]);\n  }\n  return pts;\n}\nconst LEVELS = [420, 180, 72, 26];\n// 每级：原始顶点(白) + 量化后顶点(橙)，差值就是“用户能看到的损失”\nconst render = bits => {\n  for (const p of level) {\n    const q = p.map(v => quantize(v, bits));\n    // 画 p，再画 p→q 的偏差线\n  }\n};",
  init(el) {
    el.innerHTML = '';
    const cv = document.createElement('canvas');
    const W = 280, H = 150, dpr = Math.min(devicePixelRatio || 1, 2);
    cv.width = W * dpr; cv.height = H * dpr;
    cv.style.cssText = 'width:100%;height:100%;display:block';
    el.appendChild(cv);
    const g = cv.getContext('2d');
    g.scale(dpr, dpr);

    const quantize = (v, bits) => {
      const scale = Math.pow(2, bits - 1) - 1;
      return Math.round(v * scale) / scale;
    };
    const sphereLOD = count => {
      const pts = [], ga = Math.PI * (3 - Math.sqrt(5));
      for (let i = 0; i < count; i++) {
        const y = 1 - (i / Math.max(1, count - 1)) * 2;
        const r = Math.sqrt(Math.max(0, 1 - y * y));
        const th = ga * i;
        pts.push([Math.cos(th) * r, y, Math.sin(th) * r]);
      }
      return pts;
    };
    const LEVELS = [400, 160, 64, 22];
    const counts = LEVELS.map(sphereLOD);
    const R = 42, CX = W * 0.34, CY = H * 0.5;

    let lvl = 0, bits = 14, tick = 0;

    const project = (p, ry) => {
      const cs = Math.cos(ry), sn = Math.sin(ry);
      const x = p[0] * cs + p[2] * sn;
      const z = -p[0] * sn + p[2] * cs;
      const pers = 1 / (1 + z * 0.28);
      return [CX + x * R * pers, CY + p[1] * R * pers, z];
    };

    const draw = () => {
      g.clearRect(0, 0, W, H);
      const pts = counts[lvl];
      const ry = tick * 0.012;
      const q = pts.map(p => [quantize(p[0], bits), quantize(p[1], bits), quantize(p[2], bits)]);

      // 球体轮廓
      g.strokeStyle = 'rgba(90,110,160,.25)';
      g.lineWidth = 1;
      g.beginPath(); g.arc(CX, CY, R, 0, 6.2832); g.stroke();

      // 顶点 + 量化偏移
      for (let i = 0; i < pts.length; i++) {
        const a = project(pts[i], ry), b = project(q[i], ry);
        const depth = (a[2] + 1) / 2;
        const al = 0.20 + (1 - depth) * 0.62;
        // 偏差线（>0.3px 才画，否则糊成一片）
        const dx = b[0] - a[0], dy = b[1] - a[1];
        if (Math.hypot(dx, dy) > 0.35) {
          g.strokeStyle = `rgba(255,160,70,${al * 0.8})`;
          g.lineWidth = 0.8;
          g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke();
        }
        g.fillStyle = `rgba(${120 + depth * 60},${170 + depth * 40},255,${al})`;
        g.fillRect(b[0] - 1, b[1] - 1, 2, 2);
      }

      // 信息面板
      g.fillStyle = '#9aa4bd';
      g.font = '10px ui-monospace, monospace';
      g.fillText(`LOD ${lvl + 1}/4`, W - 74, 22);
      g.fillStyle = '#6c7690';
      g.font = '9px ui-monospace, monospace';
      g.fillText(`verts ${pts.length}`, W - 74, 36);
      g.fillText(`pos ${bits}bit`, W - 74, 49);
      g.fillText(`err ${(Math.abs(1 / Math.pow(2, bits - 1)) * 1000).toFixed(2)}‰`, W - 74, 62);
      // 量化误差条
      const barW = 52;
      g.fillStyle = '#252c3e';
      g.fillRect(W - 74, 72, barW, 3);
      g.fillStyle = '#ffa046';
      g.fillRect(W - 74, 72, barW * Math.min(1, bits / 16), 3);

      // 阶梯感提示
      g.fillStyle = '#5b6479';
      g.fillText(lvl >= 2 ? '低模可见棱角' : '高模接缝平滑', W - 74, 90);
    };

    let raf = 0, last = performance.now(), acc = 0;
    const loop = now => {
      acc += now - last; last = now;
      tick++;
      if (acc > 1400) { acc = 0; lvl = (lvl + 1) % LEVELS.length; }
      // 2 级后降到 10bit，模拟 draco 默认值下的损失
      const target = lvl >= 2 ? 10 : 14;
      bits += (target - bits) * 0.08;
      draw();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(raf);
  }
};
