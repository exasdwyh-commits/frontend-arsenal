export default {
  id: 'stagger-in', group: 'entrance', name: '错位入场', lib: 'Anime.js',
  desc: '文字/卡片逐项错位淡入，最适合首屏标题与列表加载。',
  deps: 'animejs@3.2.2',
  note: '错位值 90ms 是手感临界点：低于 50ms 会糊成一片，高于 150ms 用户开始等。缓动务必用 easeOutExpo，easeOutQuad 会显廉价。',
  code: `// CDN: <script src="https://cdn.jsdelivr.net/npm/animejs@3.2.2/lib/anime.min.js"></script>
anime({
  targets: '.item',
  translateY: [24, 0],
  opacity: [0, 1],
  delay: anime.stagger(90),   // 关键：错位 90ms
  duration: 700,
  easing: 'easeOutExpo'
});`,
  async init(el, { ensure }) {
    const anime = await ensure('anime');
    el.innerHTML = `<div style="display:flex;flex-direction:column;gap:7px;align-items:center">
      ${['剂量即品牌', 'Dose Matters.', 'Cell Purple #5F3BFF'].map(t =>
        `<div class="item" style="font-size:12px;color:#cfd6e4;background:#1c2130;padding:5px 14px;border-radius:6px">${t}</div>`
      ).join('')}
    </div>`;
    const items = el.querySelectorAll('.item');
    if (anime) {
      anime({
        targets: items, translateY: [24, 0], opacity: [0, 1],
        delay: anime.stagger(90), duration: 700, easing: 'easeOutExpo',
        loop: true, direction: 'alternate', endDelay: 900
      });
      return () => anime.remove(items);
    }
    // CDN 挂了也要有得看：降级成纯 CSS 错位
    items.forEach((n, i) => {
      n.style.opacity = 0;
      setTimeout(() => { n.style.transition = 'all .6s cubic-bezier(.16,1,.3,1)';
        n.style.opacity = 1; n.style.transform = 'none'; }, i * 90);
    });
    return () => {};
  }
};
