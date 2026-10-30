export default {
  id: 'gradient-heading', group: 'entrance', name: '渐变标题',
  lib: '纯 CSS',
  desc: '标题文字本身被一条竖向渐变填满，底部沉、顶部亮，像被光从下面打上来。移植自 Cult UI 的 Gradient Heading，它全站大标题都是这个底子。看起来最简单，但 background-clip: text 有三个必踩的坑。',
  deps: '无',
  note: 'background-clip:text 必须配 color:transparent，Safari 还要 -webkit- 前缀版本，漏了 Safari 上是一坨实心色块。最阴的一个坑：换配色时只能改 background-image，一旦写成 background 简写，会把 background-clip 重置回 border-box，文字瞬间变成一根实心渐变条（本效果的三个标题就是三种配色，全用 background-image 才都活着）。渐变方向要用 to top（从下往上亮），写 to bottom 会得到"头重脚轻"的怪重心。两个色标只差一档（700 → 800）才有材质感，换成互补色就是廉价彩虹字。',
  scenes: { places: ['首屏', '标题'], goals: ['内容呈现', '营造氛围'], triggers: ['持续播放', '滚动'], projects: ['品牌官网', '作品集'] },
  code: `/* 方向 to top：底部沉、顶部亮；两色标只差一档才像材质 */
.h-grad{
  font-size:40px;font-weight:800;line-height:1.05;letter-spacing:-.02em;
  background:linear-gradient(to top,#3f3f46 0%,#a1a1aa 100%);
  -webkit-background-clip:text;background-clip:text;   /* Safari 必须带前缀 */
  color:transparent;-webkit-text-fill-color:transparent; /* Safari 还要覆写 fill */
}

/* 想让它动：位移的是背景，不是文字 */
.h-grad.flow{background-size:100% 220%;background-position:0% 0%;
  transition:background-position .8s ease}
.h-grad.flow:hover{background-position:0% 100%}`,
  init(el) {
    const STYLE = `<style data-fx="gradient-heading">
      .gh{display:flex;flex-direction:column;align-items:center;gap:9px;width:100%}
      .gh-t{margin:0;font-size:26px;font-weight:800;line-height:1.04;letter-spacing:-.022em;
        text-align:center;padding-bottom:2px;cursor:pointer;
        background:linear-gradient(to top,#46464f 0%,#d4d4dc 92%);
        -webkit-background-clip:text;background-clip:text;
        color:transparent;-webkit-text-fill-color:transparent;
        background-size:100% 100%;background-position:0 0;
        transition:background-position .9s ease}
      .gh-t.purple{background-image:linear-gradient(to top,#4c3a8f 0%,#c4b5fd 92%)}
      .gh-t.lime{background-image:linear-gradient(to top,#4d6616 0%,#d9f99d 92%)}
      .gh-sub{font-size:9.5px;color:#4a5368;letter-spacing:.08em;text-transform:uppercase;margin:0}
      .gh-row{display:flex;flex-direction:column;gap:7px;align-items:center}
    </style>`;

    el.insertAdjacentHTML('beforeend', STYLE + `
      <div class="gh">
        <div class="gh-row">
          <h1 class="gh-t" id="ghMain">Shadcn, expanded</h1>
          <h1 class="gh-t purple" style="font-size:19px">154 components</h1>
          <h1 class="gh-t lime" style="font-size:15px">free &amp; MIT</h1>
        </div>
        <p class="gh-sub">点击标题：渐变反向流动</p>
      </div>`);

    const main = el.querySelector('#ghMain');
    // 悬停/点击时位移背景：底部亮 ↔ 顶部亮，字本身不动
    let flipped = false;
    const toggle = () => {
      flipped = !flipped;
      main.style.backgroundPosition = flipped ? '0% 100%' : '0% 0%';
    };
    const onEnter = () => { main.style.backgroundPosition = '0% 100%'; };
    const onLeave = () => { if (!flipped) main.style.backgroundPosition = '0% 0%'; };
    main.addEventListener('click', toggle);
    main.addEventListener('pointerenter', onEnter);
    main.addEventListener('pointerleave', onLeave);

    return () => {
      main.removeEventListener('click', toggle);
      main.removeEventListener('pointerenter', onEnter);
      main.removeEventListener('pointerleave', onLeave);
      el.innerHTML = '';
    };
  }
};
