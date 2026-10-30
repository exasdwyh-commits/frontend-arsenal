export default {
  id: 'rapier-motor-joint', group: 'physics', name: '马达关节摆锤（速度马达 + 限位）', lib: '物理积分',
  desc: '摆臂由速度马达驱动来回摆，到限位处被夹住，摆锤的惯性让整条臂顿一下。',
  deps: '无（手写铰链马达 + 限位约束）',
  note: '速度马达（Rapier setMotorVelocity / Matter 的 angularStiffness=1 近似）必须配合限位，否则马达会无限加速把关节拉爆。限位用“超出量 × 位置刚度 − 相对速度 × 阻尼”软约束，刚度 0.3~0.8、阻尼 0.2~0.4；刚度 > 1 会高频抖成筛子。',
  code: "// 关节：pivot 固定，arm 角度 a，摆锤挂末端\n// 马达：目标角速度 motorW，输出力矩前先算限位修正\nconst LIMIT = 1.15;                 // ±rad\nfunction jointStep(dt) {\n  let w = arm.w;\n  // 1) 限位：只在超界时生效，软约束（弹簧 + 阻尼）\n  if (arm.a > LIMIT || arm.a < -LIMIT) {\n    const over = arm.a - Math.max(-LIMIT, Math.min(LIMIT, arm.a));\n    const kPos = 0.55, kDamp = 0.35;\n    w -= (over * kPos + w * kDamp);\n    arm.a -= over * 0.5;\n  }\n  // 2) 马达：角速度伺服\n  const motorForce = clamp(motorW - w, -1, 1) * 0.22;\n  w += motorForce;\n  // 3) 重力矩（摆锤在末端，力臂长）\n  w += Math.sin(arm.a) * 0.021;\n  // 4) 摆动方向：到限位就反向（马达反转）\n  if (Math.abs(arm.a) > LIMIT * 0.98) motorW *= -1;\n  arm.w = w;\n  arm.a += w * dt;\n}",
  init(el) {
    el.innerHTML = '';
    const cv = document.createElement('canvas');
    const W = 280, H = 150, dpr = Math.min(devicePixelRatio || 1, 2);
    cv.width = W * dpr; cv.height = H * dpr;
    cv.style.cssText = 'width:100%;height:100%;display:block;cursor:pointer';
    el.appendChild(cv);
    const g = cv.getContext('2d');
    g.scale(dpr, dpr);

    const PX = W / 2, PY = 30, L1 = 54, L2 = 44;
    const LIMIT = 1.2;
    const mkArm = (phase) => ({ a: Math.sin(phase) * 0.4, w: 0, motorW: 0.055 });
    const arms = [mkArm(0), mkArm(2.1), mkArm(4.2)];
    const heads = [
      { hang: 0, a: 0, w: 0 },
      { hang: 0.5, a: 0, w: 0 },
      { hang: -0.4, a: 0, w: 0 }
    ];
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

    let boost = 0;
    const click = () => { boost = 1; };

    const step = (dt) => {
      arms.forEach((arm, i) => {
        // 限位软约束
        if (arm.a > LIMIT) {
          const over = arm.a - LIMIT;
          arm.w -= over * 0.55 + arm.w * 0.35;
          arm.a = LIMIT + over * 0.4;
        } else if (arm.a < -LIMIT) {
          const over = arm.a + LIMIT;
          arm.w -= over * 0.55 + arm.w * 0.35;
          arm.a = -LIMIT + over * 0.4;
        }
        // 速度马达
        const drive = clamp((arm.motorW + (boost > 0 ? 0.02 : 0)) - arm.w, -1, 1) * 0.26;
        arm.w += drive;
        // 重力矩 + 摆锤惯性
        arm.w += Math.sin(arm.a) * 0.023;
        arm.w *= 0.997;
        if (Math.abs(arm.a) >= LIMIT * 0.97) arm.motorW *= -1;
        arm.a += arm.w * 60 * dt;

        // 末端摆锤：二级摆（角度相对臂）
        const hd = heads[i];
        const tipAngVel = arm.w;
        hd.w += Math.sin(arm.a + hd.a) * 0.03
              - hd.w * 0.02
              - (tipAngVel * Math.cos(hd.a)) * 0.06;  // 臂的角速度耦合
        hd.a += hd.w;
        hd.a = clamp(hd.a, -1.5, 1.5);
      });
      boost *= 0.96;
    };

    const draw = () => {
      g.clearRect(0, 0, W, H);
      // 立柱
      g.strokeStyle = '#242c40'; g.lineWidth = 2;
      g.beginPath(); g.moveTo(PX, PY); g.lineTo(PX, H); g.stroke();
      // 限位弧
      g.strokeStyle = '#2a3350'; g.lineWidth = 1;
      g.beginPath(); g.arc(PX, PY, L1 + L2 + 10, Math.PI / 2 - LIMIT, Math.PI / 2 + LIMIT); g.stroke();

      arms.forEach((arm, i) => {
        const hue = [225, 250, 200][i];
        const k1 = { x: PX + Math.cos(arm.a) * L1, y: PY + Math.sin(arm.a) * L1 };
        const tl = arm.a + heads[i].a;
        const k2 = { x: k1.x + Math.cos(tl) * L2, y: k1.y + Math.sin(tl) * L2 };

        g.strokeStyle = `hsl(${hue},85%,68%)`;
        g.lineWidth = 4.5; g.lineCap = 'round';
        g.beginPath(); g.moveTo(PX, PY); g.lineTo(k1.x, k1.y); g.stroke();
        g.lineWidth = 3;
        g.strokeStyle = `hsl(${hue},85%,58%)`;
        g.beginPath(); g.moveTo(k1.x, k1.y); g.lineTo(k2.x, k2.y); g.stroke();

        // 关节
        g.fillStyle = '#0e1119';
        g.beginPath(); g.arc(k1.x, k1.y, 3.4, 0, 6.2832); g.fill();
        g.strokeStyle = `hsl(${hue},85%,70%)`; g.lineWidth = 1.4; g.stroke();
        // 摆锤
        g.fillStyle = `hsl(${hue},80%,62%)`;
        g.beginPath(); g.arc(k2.x, k2.y, 5.5, 0, 6.2832); g.fill();
        // 限位接触高亮
        if (Math.abs(arm.a) > LIMIT * 0.95) {
          g.strokeStyle = 'rgba(255,180,84,.6)'; g.lineWidth = 1;
          g.beginPath(); g.arc(PX, PY, L1, arm.a - 0.2, arm.a + 0.2); g.stroke();
        }
      });
      // 枢轴
      g.fillStyle = '#3a4460';
      g.beginPath(); g.arc(PX, PY, 4, 0, 6.2832); g.fill();
      if (boost > 0.05) {
        g.strokeStyle = `rgba(140,200,255,${boost * 0.5})`;
        g.lineWidth = 1.5;
        g.beginPath(); g.arc(PX, PY, 6 + (1 - boost) * 16, 0, 6.2832); g.stroke();
      }
    };

    cv.addEventListener('pointerdown', click);
    let raf = 0, last = performance.now(), acc = 0;
    const frame = now => {
      acc += Math.min(now - last, 50); last = now;
      let guard = 0;
      while (acc >= 8.333 && guard++ < 8) { step(1 / 120); acc -= 8.333; }
      draw();
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      cv.removeEventListener('pointerdown', click);
    };
  }
};
