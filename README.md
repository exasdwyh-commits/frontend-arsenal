# 前端武器库 · Frontend Arsenal（WebUI 图鉴 + 技能库）

## Agent 使用入口

本库面向编程 Agent 的资源选择与适配；人类页面负责浏览和审核。先阅读 [Agent 使用协议](agent/README.md)，再使用机器索引 `agent/catalog.json`。在仓库根目录执行 `npm run agent:check` 检查索引，`node scripts/agent-catalog.mjs list --query "按钮" --kind effect` 查询，`node scripts/agent-catalog.mjs show effect:magnetic-btn` 获取源码位置与使用边界。更新内容后运行 `npm run agent:build`。无需 npm 依赖；Agent 工具需要 Node.js 18+。

协议涵盖需求追问、证据选型、组合约束和交付验证。当前索引覆盖已有动效、技能和视频样片；尚无经过验证的整页模板或自动组合运行时。

## 综合搜索

通过 `library.html` 进入前端参考库，统一搜索动效、技能和视频风格。支持空格分隔多个关键词、类型筛选和 `/` 快捷聚焦。搜索索引直接读取现有清单；新增视频样片请维护 `src/video-data.js`。视频搜索目前覆盖风格样片，项目资源和镜头配方请进入视频库浏览。启动本地服务后访问 `http://localhost:8080/library.html`。


这是一个**可增长的 UI 效果图鉴**。目标不是做出漂亮的演示页，而是：**看到一个好机制 → 5 分钟内能扒进自己的项目**。

## 代码视频库

从主页侧栏进入 `video.html`，可浏览 ClaudeAnimationBase、mg-styles-15、video-shotcraft 和 lemo-opuscar 的项目入口、风格样片及源码链接。15 个风格样片通过原项目在线加载，需要联网；这里提供的是资源索引，不包含原仓库的渲染工具或视频生成能力。原项目代码授权分别为 MIT、MIT、Apache-2.0 和 MIT + CC BY 4.0，使用字体、音乐和其他素材时需查看各项目单独列出的授权条件。

## 技能库

从主页侧栏进入 `skills.html`，收录 **124 个前端真正用得上的 Skill 文档**（设计与美学、设计系统、原型与交互、数据与地图、文档与印刷、媒体与导出、视频与影像、导入与研究 8 类）。这些是 Markdown 方法文档而非代码，原样存于 `skills/`：45 个来自 [baoyu-design](https://github.com/jimliu/baoyu-design)（MIT），30 个来自 [chaojifeng-video-design](https://github.com/mileson/chaojifeng-video-design)（MIT，超级峰的视频设计方法论：主线、分镜、声画节奏、制作与交付验收，含 29 个独立方法文档），1 个来自 [lemo-opuscar](https://github.com/lemomo-ai/lemo-opuscar)（MIT + CC BY 4.0，纯代码做片的导演 skill），1 个来自 [impeccable](https://github.com/pbakaus/impeccable)（Apache-2.0，设计总控 skill：18 个命令覆盖 shape/critique/audit/polish/harden 全链路，上游为 SKILL.md + 45 篇 reference 剧本的多文件包，此处收录主文件），1 个来自 [ai-design-skills](https://github.com/elayadesign/ai-design-skills)（MIT，12k★，落地页设计系统：Part A 转化策略（intake 问题清单/页面结构/文案公式/SEO）+ Part B 视觉系统（字体间距圆角动效全部定死具体值），尾部设计值段落可整段改写驱动全篇），41 个来自 [huashu-design](https://github.com/alchaincyf/huashu-design)（MIT，28k★，花叔Design 3.0：HTML-native 设计 skill，主文件 + 40 篇 reference——84 种带样张风格库、三方向选稿流程、动画最佳实践与避坑清单、GSAP 配方集、排版规范、幻灯片/PPTX、分镜与镜头语言、配音与视频导出管线，是本库最大的单源），5 篇来自 [overflow.design](https://www.overflow.design)（站内公开文档：图标 MCP 协议 + 4 篇 Notion 尺寸/上传指南）。页面自带零依赖迷你 Markdown 渲染器（不引 CDN），支持分类/搜索/全文复制/查看原始 `.md`，并可用 `skills.html?skill=<id>` 深链直达单个技能。

效果库管"长什么样"，技能库管"怎么做出来"——两者互补，都归这个仓库收藏。原仓库 53 个 skill 中排除了 8 个非前端项（read-pdf、web-research 等非前端用途，gemini-image、sound-effects 依赖外部 AI 服务，send-to-figma、send-to-canva 是外部导出，另有一对 pptx 导出为重复项）。

## 目录

```
WebUI/
├── index.html              # 图鉴主页：从 registry.js 渲染，不用手改
├── video.html              # 代码视频库：四个来源项目的样片与镜头配方索引
├── skills.html             # 技能库：124 个前端可用 Skill 文档的浏览/阅读页
├── skills/                 # 技能文档原样存放（124 个 .md：baoyu-design · MIT、chaojifeng · MIT、lemo-opuscar · MIT+CC BY 4.0、impeccable · Apache-2.0、ai-design-skills · MIT、huashu-design · MIT、overflow.design · 站内公开文档）
├── serve.bat               # 双击起本地服务（端口 8080，自动开浏览器）
├── package.json            # 仅用于 npm start / npx serve
└── src/
    ├── registry.js         # ★ 唯一需要手动维护的文件：效果清单
    ├── engine.js           # 加载器 / 舞台 / 弹窗 / 选型抽屉（一般不用动）
    ├── skills.js           # 技能库逻辑 + 内置迷你 Markdown 渲染器（零依赖）
    ├── skills.css          # 技能库样式（复用 style.css 的设计 token）
    ├── skills-data.js      # 技能清单（id / 分类 / 描述，由 skills/ 目录生成）
    ├── effects/            # 每个效果一个文件，一个文件导出一个对象
    │   ├── entrance.stagger-in.js
    │   ├── entrance.wipe-reveal.js
    │   └── ...
    └── groups.js           # 分组定义（7 组，按"意图"分，不按库名分）
```

## 加一个效果的完整流程（3 步）

**1. 新建 `src/effects/<组>.<效果名>.js`**

```js
export default {
  id: 'magnetic-btn',          // 全局唯一，跟文件名后半段一致
  group: 'feedback',           // entrance | feedback | space | particle | physics | data | audio
  name: '磁吸按钮',
  lib: '原生 JS',              // 用的什么技术
  deps: '无',                  // npm 包名或"无"
  desc: '一句话说清它解决什么问题，不是描述现象。',
  note: '实战注意：踩过的坑、参数取值、性能红线。',
  code: `// 可直接贴进项目的最小代码`,

  // init 必须返回 destroy；不返回就会泄漏 rAF / WebGL context
  async init(el) {
    el.innerHTML = '<button>...</button>';
    const btn = el.querySelector('button');
    const onMove = e => { /* ... */ };
    el.addEventListener('mousemove', onMove);
    return () => el.removeEventListener('mousemove', onMove);
  }
};
```

**2. 在 `src/registry.js` 里加一行 import + 注册**

```js
import magneticBtn from './effects/feedback.magnetic-btn.js';
export const EFFECTS = [ /* ... */ magneticBtn ];
```

**3. 刷新页面。** 分组计数、搜索、导出清单会自动跟着走。

## 硬性规范

| 规则 | 原因 |
|---|---|
| `init()` **必须返回 destroy 函数** | 图鉴会同时跑十几个动画，不清理就是风扇起飞 |
| 单文件单效果，**不跨文件共享状态** | 一个效果坏掉不能连累整页 |
| 依赖走 **CDN 经典脚本**，不用 `import()` | `file://` 双击打开时 ES Module 会被 CORS 拦死 |
| 舞台尺寸约 **280×150** | 所有卡片视觉重量一致，才好横向比较 |
| `code` 字段只放**能直接跑的最小片段** | 图鉴的价值在"能贴走"，不在"代码完整" |
| `note` 必须写**至少一条真实坑** | 没踩过坑的效果不要收进图鉴 |

## 启动方式

- **不要直接双击 `index.html`** — 浏览器会限制 `file://` 下的 ES Module 加载，图鉴无法正常渲染。
- **双击 `serve.bat`** — 推荐，走 `http://localhost:8080`，所有能力完整

## 分组原则

### 按场景选型

图鉴保留原有动效分组，并支持按界面位置、使用目的、触发方式和项目类型交叉筛选。场景标签目前只覆盖已人工整理的一部分效果，其他效果显示“场景待整理”，仍可通过分组和关键词访问。效果详情中，骨架屏提供列表和表格场景预览，磁吸按钮提供品牌首屏场景预览。

标签维护在 `src/scenes.js` 的 `entries` 中，键为效果 ID，字段为 `places`、`goals`、`triggers`、`projects`（均为字符串数组）。新效果也可以直接提供 `scenes` 属性，其优先级高于集中维护的条目。标签应根据实际用途人工填写，不确定时留空。场景预览是选型示意，骨架屏示意适配了不同布局，并非原始效果代码的直接嵌入。

按**"用户想要什么效果"**分组，不按库名分组。用户不会想"我要一个 Three.js 效果"，只会想"我要产品转起来"。

| 组 | 解决的问题 |
|---|---|
| 入场与转场 | 元素怎么出现、画面怎么切换 |
| 交互反馈 | 悬停/点击/拖拽有没有回应 |
| 空间与 3D | 平面怎么做体积感 |
| 粒子与氛围 | 高级感的那 20% 从哪来 |
| 物理与拟真 | 怎么用真实感换信任感 |
| 数据动效 | 数字怎么被"看见" |
| 声音驱动 | 视觉疲劳时靠什么破局 |


---

## 当前收录（144 个 / 7 组）

| 组 | 数量 | 代表效果 |
|---|---:|---|
| 入场与转场 | 42 | 12 个 GLSL 转场（涟漪/故障/水滴/噪声溶解/漩涡/像素化/虚化/燃烧/边缘发光/交叉缩放/置换扭曲/马赛克巡览）、形状遮罩转场族（一个注册变量驱动 20 种 PowerPoint 风格遮罩）、百叶窗 3D 翻页、角落聚光显影、列表找位+整体漂移、词槽老虎机、缓动货架、网格错峰、SVG 描边自绘、马克笔下划线、空心字硬切点亮、字重脉冲、霓虹框先行、字符坠落堆积、Bento 逐格点亮、渐变标题、渐变扫光充能词（波前推进+排期闪电）、墨渗揭示（湍流位移水墨转场）、灯板跑马字、逐字换字体标题、假 AI 对话演示（工具卡+流式回复循环） |
| 交互反馈 | 32 | 分段控件滑块特写（橡皮筋拉伸）、磁吸按钮、状态岛形变、Dock 距离衰减、弹簧预设库、拖尾链、衰减滚动、3D 倾斜、标签滑动底板、按钮四态形变、意图填空、网格重排、接触阴影抬升、纹理按钮、新拟态按钮、宇宙环按钮、整面渐变按钮、内容错位卡、方向感知标签、ProUI 材质配方、像素计步拖拽数值、旋钮读手势、滑轨减宽度滑块、松手不闪按压态、触发器预留最宽标签、折叠区摘要汇报、等距图参数面板（线重/主题/朝向实时改参） |
| 空间与 3D | 16 | 手写矩阵 3D 旋转（OrbitControls 阻尼）、射线拾取、Shader 波动曲面、实例化网格、CSS3D 卡片环、分步停靠卡环、克隆纵队、折页展开、路径匀速运动、极简卡片、缺角卡 |
| 粒子与氛围 | 20 | 程序化水彩晕染（fbm 毛边+颜料深边堆积）、CRT 录像带后期（YCbCr 只糊色度保亮度 + 开机亮线 + 磁头切换撕裂）、柏林噪声漂移、高斯爆发、GPU 粒子云、边框光束、条纹玻璃、星轨螺旋、引力场轨道、实例化点云、分层景深、点阵涟漪、纹理叠层、边缘渐进模糊、栏位导引光、有序抖动图像 |
| 物理与拟真 | 12 | 刚体堆叠+休眠、绳索链、布娃娃、CCD 穿模对比、马达关节、弹簧约束链、复合刚体 |
| 数据动效 | 19 | 满弧扫针自检（甩满全弧阻尼回落）、前后对比拉杆（快甩+慢扫速度对比）、时间轴吸附、逐词字幕、数字滚轮、LOD 量化、滚动驱动进度、环形进度、数字滚动、建议卡堆栈、卡拉OK逐词填色、竖向词条滚轮 |
| 声音驱动 | 3 | 真频谱分析（AnalyserNode）、波形律动、合成点击音 |

## 移植来源

图鉴允许从成熟组件库"抽机制"，但只收**不依赖 React/Tailwind 就能还原**的部分，并且要在 `desc` 里注明出处。目前已从 [Cult UI](https://github.com/nolly-studio/cult-ui)（MIT）抽取 22 个：

**第一批（6）**：状态岛形变（Dynamic Island）、Dock 距离衰减（MacOS Dock）、边框光束（Border Beam）、折页展开（Folded Card）、数字滚轮（Rolling Number）、条纹玻璃（Fluted Glass）。

**第二批（16）**：纹理按钮（Texture Button）、新拟态按钮（Neumorph Button）、宇宙环按钮（Cosmic Button）、整面渐变按钮（BG Animate Button）、内容错位卡（Shift Card）、方向感知标签（Direction Aware Tabs）、极简卡片（Minimal Card）、缺角卡（Cutout Card）、纹理叠层（Texture Overlay）、边缘渐进模糊（Edge Blur）、栏位导引光（Stripe BG Guides）、有序抖动图像（Dither Image）、渐变标题（Gradient Heading）、灯板跑马字（Lightboard）、逐字换字体标题（Pixel Heading Character）、建议卡堆栈（Agent Suggest Card Stack）。

Cult UI 其余组件多为 shadcn/Radix + Motion 的树形结构，机制价值集中在少数几个交互上；像 Mac Screen、iPhone 17、Kanban Board 这类偏静态 mockup 的不进图鉴。第二批里 `Metal Button`（依赖 WebGL `metal-fx` 包）和 `Sortable List`（与已收的 FLIP 效果重复）也主动弃掉。

已从 [video-shotcraft](https://github.com/Vincentwei1021/video-shotcraft)（Apache-2.0）的 `demos/` 目录移植 21 个机制。原仓库用 React + Remotion 写成 TSX（按帧驱动），这里全部抽掉运行时、用原生 JS/CSS/SVG 还原（rAF + transform），每个 `desc` 都注明"移植自 video-shotcraft …"：

- **入场与转场（12）**：马克笔下划线（Marker Underline Title，变宽干笔多边形 + clipPath 揭示）、空心字硬切点亮（Outline Word Fill，text-stroke 空心字一帧切白热 + HUD 刻度环锁定）、字重脉冲（Font Weight Pump，可变字体 wght 轴随节拍变粗弹回）、霓虹框先行（Neon Frame Forerun，四层描边灯管 + 双亮头奔画相撞）、字符坠落堆积（Letter Drop Physics，重力坠落 + 衰减弹跳 + 触地挤压）、Bento 逐格点亮（Bento Light Up，彗星描边 + 逐格通电）、百叶窗 3D 翻页（Blinds Slice，双面板绕竖轴弹簧翻面 A 换 B）、词槽老虎机（Pill Slot Cycle，隐藏占位撑槽宽 + 绕滚筒翻入翻出）、角落聚光显影（Corner Spotlight Reveal，mask 径向渐变"照到才显影"）、列表找位+整体慢漂移（List Reveal，两层解耦运动）、渐变扫光充能词（Gradient Word Sweep，三层模糊辉光随波前推进 + Halo 外扩盒修"方框光" + 闪电排期而非逐帧随机）、墨渗揭示（Ink Bleed Reveal，湿晕/墨边/墨芯三层同心遮罩圆共用湍流位移滤镜，filter 只揉遮罩不揉画面）。
- **数据动效（4）**：卡拉OK逐词填色（Karaoke Fill Sync，词级时间戳逐词 mask 揭示 + 读指下划线）、竖向词条滚轮（Vertical Word Roll，滚筒景深 + 纵向高斯模糊）、满弧扫针自检（Needle Sweep Selftest，去程甩满 270° + 按超调反算阻尼比回落 + 角向拖影）、前后对比拉杆（Before After Slider Scrub，12f 快甩 overshoot 回弹 + 48f 慢扫，速度差 5 倍）。
- **空间与 3D（2）**：克隆纵队（Cloner Depth Echo，真 3D 纵深克隆 + 吸回合体）、分步停靠卡环（Carousel 3D，billboard 圆环"推一把—停靠"分步旋转 + 正前卡点亮）。
- **交互反馈（2）**：接触阴影抬升（Contact Shadow Lift，接触核 + 环境双层影子随抬升演化）、分段控件滑块特写（Segmented Thumb Hero，thumb 前缘先走后缘跟随的橡皮筋拉伸 + 1.5% 过冲回弹）。
- **粒子与氛围（1）**：点阵涟漪（Radial Wave，欧氏距离 stagger 圆形波扩散）。

video-shotcraft 的 `demos/` 还有大量 typography / transitions 机制尚未移植（本轮已补上渐变扫光充能词与墨渗揭示两个）；`mg-styles-15`（Canvas/WebGL 风格）与 `ClaudeAnimationBase`（p5.js 角色动画）已看过源码、暂未抽入图鉴，需要时再按同样方式还原。

已从 [baoyu-design](https://github.com/jimliu/baoyu-design)（MIT，宝玉把 Claude Design 打包成本地 Agent Skill）移植 2 个机制。该仓库主体是"设计稿生成"工具而非动效库，能抽的机制集中在 `starter-components/` 两处：

- **形状遮罩转场族（mask-shape-cycles）**：来自 `deck-stage.js` 的动画引擎。核心是 `CSS.registerProperty` 注册一个 `<number>` 变量 `--t`，样式表里 20 种 PowerPoint 风格遮罩（conic 轮子/楔形、线性对开/百叶/斜条、radial 圆形/溶解点阵、棋盘 lead-lag 双 lane、随机条四分点错峰、box/diamond/plus 四边带并集）全部只读 `var(--t)`，动画只驱动这一个数。带出一个真坑：`var()` 写在 WAAPI keyframe 值里会在解析时按基准样式代入初值 0 并焊死，遮罩永不扫过——所以渐变必须放样式表、变量单独动画。
- **程序化水彩晕染（watercolor-wash）**：来自 `watercolor-kit.js`。低分辨率 buffer 上逐像素算"fbm 噪声扰动的带符号距离"生成湿边毛边（deckle），离边界越近颜料越浓（`exp(-d/edgeWidth)` 边缘堆积，水彩深边的来源），叠高频颗粒（granulation）与低频斑驳（mottle），墨线按弧长均匀取样 tip-to-tail 画出，溅点 seeded 错峰弹出。

已从 [lemo-opuscar](https://github.com/lemomo-ai/lemo-opuscar)（MIT 代码 + CC BY 4.0 素材，66 种纯代码电影风格工具箱，canvas/WebGL 逐帧渲染）移植 1 个机制：

- **CRT 录像带后期（crt-tape）**：来自 `core/post/crt.js`。核心是「只糊色度不糊亮度」——RGB 转 YCbCr 后 Y 取中心像素保持锐利，Cb/Cr 才做横向 7 tap 平均（Cr 再右移 1-2px 形成红色拖尾），直接对 RGB 平均会把亮度一起糊掉就没有 VHS 味；扫描线用 cos 相位生成、暗缝深度乘 `(1-0.6*亮度)` 随亮度收窄；开机动画 sx 从 0.003 起防除零、`pow(1-sy,3)` 拉出白色扫描亮线；磁头切换噪波按行 hash 逐行撕裂且只作用于底部 5% 行。该仓库其余 66 风格目录（styles/）与 core/three（DoF/GTAO）分别与已收录的缓动库、分层景深重复，未再收。

已从 [ProUI](https://pro-ui.dev)（商业产品，$99 买断，React/Electron/SwiftUI 专业工具组件库）提炼 7 个机制。组件源码属付费内容**未收录**，这里只取其公开文档（llms.txt / guide / 首页）白纸黑字描述的交互机制，每个都用原生 JS/CSS 独立重写，`desc` 注明"提炼自 ProUI 公开文档"——机制是想法不是代码：

- **ProUI 材质配方（pro-material）**：中灰面板上的相对"白 15%"填充 + 顶内光（透过填充透明度合成，有效仅 5.25%）+ 发丝描边 + 1px 投影；深色面板按下变亮、动作条按下变暗，方向相反才符合物理直觉。
- **像素计步拖拽数值（scrub-number）**：数字输入横拖改值，4px 一步；关键是"从按下像素统算"而非逐帧累加——拖回按下处旧值精确复原，浮点误差不漂移。
- **旋钮读手势（knob-gesture）**：旋钮不强迫转圈——外侧起手＝方位角跟随、中心起手＝线性增量，模式按下当场定死（每帧重判会在穿越中线时疯狂抖动），拖到一半可自由换法。
- **滑轨减宽度滑块（slider-inset）**：轨道宽 = 容器 − thumb 宽，thumb 中心压到两端正好是真 min/max 不露头；位置百分比只在 inset 后的轨道里算。
- **松手不闪按压态（release-no-flash）**：浏览器在 click 提交前提前一帧丢 `:active`，切换按钮松手必闪一帧底色；pointerup 时挂 held 类留住按压填充，双 rAF 等新状态画完再摘。
- **触发器预留最宽标签（trigger-widest）**：下拉触发按钮用 inline-grid 隐藏哨兵叠格取最宽选项撑宽——选中"中"按钮也不缩，切换零位移。
- **折叠区摘要汇报（disclosure-summary）**：检查器折叠分区收起后标题行仍汇报内部状态（关键值/改动数/异常点），摘要与控件同源更新（同一函数写两处，绝不维护两份）。

Electron 的 pro-drag/pro-no-drag 拖拽区机制因浏览器无法演示未收；ProUI 本身是付费产品的安装说明，也未进技能库。

已从 [Overflow Design](https://www.overflow.design)（素材商店，$99 Pro，手绘图标/插画/等距图）提炼 2 个机制 + 收录 5 篇文档。边界：付费 SVG/插画素材本身**未收录**，只取公开页面上的交互机制与免费公开的方法文档：

- **等距图参数面板（iso-parametric）**：同一张等距 SVG 被控制面板实时改参——线重直改 `stroke-width` 属性（transform 缩放会连描边一起放大，观感是"大图"不是"粗线"）、主题翻转靠全部描边 `currentColor` + 面的明暗用相对透明度、朝向是 `scaleX(-1)` 镜像、悬停画面时四层板按光标做层间视差（位移系数按层递增，全层同距就成了平移）。提炼自其公开目录页的 Appearance/Theme/Weight/Facing 面板与"指上去它就动"的描述。
- **假 AI 对话演示（agent-chat-demo）**：落地页的"AI 正在干活"循环动画——用户提示逐字打入 → 工具调用卡（`search_drawings` 查询、3 个结果带 FREE/PRO 标签、246ms 耗时）→ 文件卡（`get_drawings` 拉回两个 SVG）→ 助手回复流式吐出 → 停留 → 清空循环。核心是帧时钟分段驱动（每段 start/end 算进度，可暂停可跳帧），流式文本用 `textContent` 逐字追加防 XSS。提炼自其首页的 MCP 演示；所有数字与结果均为表演数据。
- 技能库另收 5 篇：`mcp/agents.md`（Overflow 图标 MCP 协议：When/How/Licence 结构的 agent 使用协议）+ 4 篇 Notion 指南（图标 280×280 上传规格、封面 1500×600 与留边规则、上传流程、Figma 库管理），规格数字是实料。

## 三个效率功能

1. **深链** — `index.html#sparkline` 直接打开该效果，甩链接给同事
2. **选型清单导出** — 底部抽屉一键生成带分组/依赖/实战提醒的 Markdown 表格
3. **选择记忆** — `localStorage` 记住，刷新不丢

## 已知约束（踩过的坑）

1. **`code` 字段绝不用模板字符串**。里面只要有反引号（GLSL 源码、shell 命令），就会和 `code: \`...\`` 形成嵌套，整个模块语法错误导致**全页白屏**。用 `code: "..."` + JSON 转义。
2. **第三方库只写在 `code` 字段里**，`init()` 里一律原生实现。`file://` 下 ES Module 的 `import()` 会被 CORS 拦死。
3. **推荐用 `serve.bat` 启动**。`file://` 下部分浏览器的 WebGL / AudioContext 有额外限制。
4. **首次点开依赖 CDN 的效果（如错位入场）需等 2-5 秒**，第二张卡片起走缓存。
