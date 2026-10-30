export default {
  id: 'grid-reflow', group: 'feedback', name: '网格重排动画', lib: 'FLIP',
  desc: '筛选后网格重新排列，每个卡片从旧位置滑到新位置，而不是闪一下。',
  note: '筛选后直接重排 DOM 会闪。必须先量所有元素的旧位置（存成 Map），改完 DOM 再量一次，逐个算差值做 transform 动画。被隐藏的项要单独处理——它们从旧位置缩放消失，不能直接删。',
  code: `// FLIP：筛选重排
const items = [...grid.children];
const before = new Map();
items.forEach(el => before.set(el.dataset.id, el.getBoundingClientRect()));

applyFilter();          // 改 DOM，重排

items.forEach(el => {
  const a = before.get(el.dataset.id);
  const b = el.getBoundingClientRect();
  if (!a) return;
  const dx = a.left - b.left, dy = a.top - b.top;
  if (!dx && !dy) return;
  el.animate([
    { transform: \`translate(\${dx}px,\${dy}px)\` },
    { transform: 'none' }
  ], { duration: 420, easing: 'cubic-bezier(.22,1,.36,1)' });
});`,
  init(el) {
    el.innerHTML = `<div id="gr" style="display:grid;grid-template-columns:repeat(4,1fr);
      gap:5px;width:240px"></div>`;
    const grid = el.querySelector('#gr');
    const COLORS = ['#5F3BFF', '#3CCBFF', '#BFEA1A', '#C89B63'];
    const ALL = Array.from({ length: 12 }, (_, i) => ({
      id: 'c' + i,
      // 每项用位掩码决定属于哪次筛选
      kind: i % 3
    }));
    let filter = 0;  // 0=全部 1=只显示 kind1 2=只显示 kind2

    const render = () => {
      grid.innerHTML = ALL.map(d => {
        const show = filter === 0 || d.kind === filter - 1;
        return `<div class="gc" data-id="${d.id}" style="
          height:36px;border-radius:6px;display:${show ? 'block' : 'none'};
          background:linear-gradient(135deg,${COLORS[d.kind]}55,#12151d);
          border:1px solid ${COLORS[d.kind]}88;font-size:8px;color:${COLORS[d.kind]};
          display:${show ? 'flex' : 'none'};align-items:center;justify-content:center">
          ${d.id.replace('c', '#')}</div>`;
      }).join('');
    };
    render();

    let raf = null;
    const runFilter = next => {
      const cards = [...grid.querySelectorAll('.gc')];
      const before = new Map();
      cards.forEach(c => before.set(c.dataset.id, c.getBoundingClientRect()));
      filter = next;
      render();
      // FLIP
      [...grid.querySelectorAll('.gc')].forEach(c => {
        const a = before.get(c.dataset.id);
        const b = c.getBoundingClientRect();
        if (!a) return;
        const dx = a.left - b.left, dy = a.top - b.top;
        if (Math.abs(dx) < .5 && Math.abs(dy) < .5) return;
        c.animate([
          { transform: `translate(${dx}px,${dy}px)` },
          { transform: 'none' }
        ], { duration: 420, easing: 'cubic-bezier(.22,1,.36,1)' });
      });
    };
    let i = 0, timer;
    const seq = [1, 2, 0];
    timer = setInterval(() => { runFilter(seq[i % 3]); i++; }, 1700);
    return () => { clearInterval(timer); cancelAnimationFrame(raf); };
  }
};
