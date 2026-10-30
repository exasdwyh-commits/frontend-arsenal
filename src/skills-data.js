export const CATS = {"design":"设计与美学","ds":"设计系统","proto":"原型与交互","data":"数据与地图","doc":"文档与印刷","media":"媒体与导出","video":"视频与影像","import":"导入与研究"};

export const SKILLS = [
  {
    "id": "3d-object",
    "name": "3d-object",
    "desc": "3D object three.js model, downloadable as OBJ or GLB",
    "cat": "media",
    "zh": "three.js 3D 模型",
    "bytes": 4262
  },
  {
    "id": "animated-video",
    "name": "animated-video",
    "desc": "Animated video Timeline-based motion design",
    "cat": "media",
    "zh": "时间轴动画视频",
    "bytes": 13303
  },
  {
    "id": "ask-the-user",
    "name": "ask-the-user",
    "desc": "Ask the user Design a question page and elicit an answer",
    "cat": "proto",
    "zh": "设计提问页",
    "bytes": 16801
  },
  {
    "id": "chaojifeng-asset-motion-direction",
    "name": "素材表演与调度",
    "desc": "已有图片、界面、图表、标志或媒体片段需要独立移动、装回、接力或跨镜复用时读取。先沿 镜头生产统筹 明确要表达的变化，再判断哪些素材能安全操作；按实际准备结果调整镜头。方法适用于全部场景，不要求每张图片都分层或每镜都做大动作。",
    "cat": "video",
    "zh": "素材运动方向",
    "bytes": 2674
  },
  {
    "id": "chaojifeng-creative-direction",
    "name": "从方向到值得记住的瞬间",
    "desc": "适用于八类场景的自主创作和表现力提升。先沿 导演前期方法 确定观众变化与主线，再用下面的方法找到更有表现力的做法。简单任务只记录关键选择，不必另建一套文件；复杂任务沿 方向模板 展开。",
    "cat": "video",
    "zh": "创意方向",
    "bytes": 3375
  },
  {
    "id": "chaojifeng-design-method",
    "name": "从内容到画面",
    "desc": "先确定观众、看完应知道/相信/会做什么、哪些事实支持、什么证据必须上镜。将“科技感、电影感”翻译为产品适合的材质、层级、运动与声音选择，不能只堆蓝光粒子，也不固定每片采用同一美学。",
    "cat": "video",
    "zh": "设计方法",
    "bytes": 1060
  },
  {
    "id": "chaojifeng-director-method",
    "name": "在第一轮确定影片为何成立",
    "desc": "这些方法是从公开导演访谈、制作复盘与视频案例归纳的工作合同，不是某位导演的固定教程。先做判断，再选特效。简单任务在同一计划写三句话即可：观众从什么变成什么、哪条线贯穿、声音和画面怎样共同完成它。复杂任务再展开以下内容，不强制额外五份文档。",
    "cat": "video",
    "zh": "导演方法",
    "bytes": 2027
  },
  {
    "id": "chaojifeng-domain-standards",
    "name": "行业规范先行：先找共识，再开口",
    "desc": "讲解涉及专业领域时读取。先找这个领域最合适的标准、术语规范和行业共识，再用它们写稿和画图，让表达更简短、准确，也让 Agent 不凭印象改写行业术语。适用于口播、字幕、铭牌和图注；不是文案风格指南，创意文案可按末节例外处理。",
    "cat": "video",
    "zh": "领域标准",
    "bytes": 4878
  },
  {
    "id": "chaojifeng-explainer-narration",
    "name": "让讲解、声音与画面共同完成理解",
    "desc": "需要讲解或旁白时按需读取；知识、产品、资讯、故事和品牌片都可使用。只做无声动效或锁定原声的任务无需启动配音。通过通用稿件、实际音频与时间记录组合能力，不要求安装个人分身口播Skill或固定云服务。",
    "cat": "video",
    "zh": "解说词",
    "bytes": 2744
  },
  {
    "id": "chaojifeng-expression-method",
    "name": "从表达指导组合到实现",
    "desc": "原有 motion 目录提供12种属性变化；expression 目录提供64项跨层表达指导（含11项知识讲解层、14项发布片元素）；recipe目录提供18类组合起点。新层不替换底层稳定ID，不把来源视频或提示词当可执行插件。",
    "cat": "video",
    "zh": "表情与表演",
    "bytes": 4274
  },
  {
    "id": "chaojifeng-knowledge-music-direction",
    "name": "概念知识科普：配方、音乐池与声画编排",
    "desc": "用于 knowledge-music-explainer 配方。复用知识包、逐层讲解、音乐 cue sheet 和音效事件表；不强制新增引擎、付费服务、模型或主计划必填字段。",
    "cat": "video",
    "zh": "知识音乐方向",
    "bytes": 5430
  },
  {
    "id": "chaojifeng-knowledge-pack",
    "name": "知识包合同",
    "desc": "讲解抽象知识或资讯时，用一份知识包记录“依据什么规范、用什么词、哪个东西对应哪个概念、每个数字从哪来、按什么顺序讲、查过什么”。方法见 物即解释、逐层递进、行业规范先行。本文只讲字段、检查和接线。",
    "cat": "video",
    "zh": "知识包",
    "bytes": 7200
  },
  {
    "id": "chaojifeng-knowledge-rap-direction",
    "name": "嘻哈知识科普：让歌词、证据与画面共同推进",
    "desc": "用户要用Rap、嘻哈或说唱讲知识、历史、机制、产业变化或社会议题时，自动选 knowledge-rap-explainer。配方属于既有知识讲解／音乐表演场景，资讯题材另守资讯核验；不新增引擎或作曲能力。只有背景音乐的科普继续用 概念知识科普，产品能力宣传按主要目标用 产品音乐叙事。",
    "cat": "video",
    "zh": "知识 Rap 方向",
    "bytes": 2940
  },
  {
    "id": "chaojifeng-knowledge-visualization",
    "name": "物即解释：把抽象知识做成看得见的东西",
    "desc": "讲解算法、协议、机制、流程、经济或科学原理，以及把一件资讯讲清楚时读取。目标是让观众看到的不是“写着字的方块”，而是一个其运作本身就是概念的东西。逐层讲法见 逐层递进，术语与口径见 行业规范先行，字段与检查见 知识包合同。",
    "cat": "video",
    "zh": "知识可视化",
    "bytes": 5898
  },
  {
    "id": "chaojifeng-launch-film-grammar",
    "name": "发布片语法：把一部参考片抽成可迁移的编排元素",
    "desc": "用于 30–45 秒的产品发布片、功能介绍片，也可缩成 8–15 秒的单功能片。来源是对一部公开发布片 HyperFrames「PR → Video」 成片的逐帧、源码与音频研究，方法见 参考片研究。本文只写“为什么这样排、怎样迁移、怎样会失败”：不复刻该片，不把它的数值、品牌、字体或配乐当默认，也",
    "cat": "video",
    "zh": "发布会影片语法",
    "bytes": 8692
  },
  {
    "id": "chaojifeng-layered-reveal",
    "name": "逐层递进：一层只加一个新负荷",
    "desc": "把抽象知识讲成观众跟得上的顺序时读取。好看的载体（见 物即解释）只解决“看得见”，层次解决“跟得上”：观众每一刻只多背一件新东西，并且知道它接在哪里。",
    "cat": "video",
    "zh": "分层揭示",
    "bytes": 3181
  },
  {
    "id": "chaojifeng-music-direction",
    "name": "从叙事意图找音乐片段",
    "desc": "用于选曲、编排与替换配乐。先确定这一段让观众怎样变化，例如从怀疑到好奇、从观察到行动、从紧张到释然。给声音职责、需要的时长、旁白密度、视觉落点与希望避开的质感，再检索。整曲贯穿、同曲不同段、跨曲组合和静默都可以成立，不强制三首或三幕。",
    "cat": "video",
    "zh": "音乐方向",
    "bytes": 5174
  },
  {
    "id": "chaojifeng-music-driven-world",
    "name": "音乐、主题与风格驱动三维世界",
    "desc": "三维世界适合本片时，沿 music-event-performance 的音乐先行分支执行。用户只给歌曲时，先按 歌曲视觉导演 自主推导主题与风格；用户已指定的优先。主题是理论关系时同时读知识表达；音乐带有说唱不自动改写歌词或生成新曲。保留用户指定原音轨，换曲、静音或重编须有对应指令。",
    "cat": "video",
    "zh": "音乐驱动世界",
    "bytes": 3304
  },
  {
    "id": "chaojifeng-music-event-model",
    "name": "音乐驱动的声画事件模型",
    "desc": "音乐主导画面时，与 歌曲视觉导演、镜头编排 配合使用。核心判断是：音乐带动了什么可见事件，这个事件怎样改变观众的感受？六层判断汇入同一份 音乐导演笔记，复用工程排程，不新增必填 JSON、效果配额或第二套时间轴。用户明确的静态、长镜、无字幕、原声及交付约束优先。",
    "cat": "video",
    "zh": "音乐事件模型",
    "bytes": 4098
  },
  {
    "id": "chaojifeng-music-shot-choreography",
    "name": "音乐镜头与运动编排",
    "desc": "用于歌曲或音乐主导画面的 music-visual、音乐表演和需要音乐推进的相关场景；先读 歌曲视觉导演。音乐驱动画面节奏并营造氛围，画面的场景、动作、运镜、转场与动效建立吸引力和沉浸感。慢歌同样需要卡点与运动编排：唱句起落、旋律转折、拖音、呼吸、停顿和乐器进入都可成为视觉锚点；快慢改变速度、幅度与",
    "cat": "video",
    "zh": "音乐镜头编排",
    "bytes": 5080
  },
  {
    "id": "chaojifeng-opening-design",
    "name": "前三秒：让观众认出对象、看见变化并愿意跟随",
    "desc": "信息流科普与宣传默认启用本方法，不等用户再次提醒前三秒；其他媒介按受众、用途与用户约束选择。先写受众与观看后所得；三秒是内容进入的设计窗口，不能保证停留，也不自动适用于所有媒介和长片。",
    "cat": "video",
    "zh": "开场设计",
    "bytes": 1882
  },
  {
    "id": "chaojifeng-poetry-music-world",
    "name": "诗词、乐器与三维意象",
    "desc": "在音乐驱动流程中，需要让唱词、乐器与景物共同表达时加载本页。先沿 音乐驱动三维世界 取得当前音轨和有效事件，再安排意象、空间与表演。不因出现古诗就强制加入人物或琵琶。",
    "cat": "video",
    "zh": "诗歌音乐世界",
    "bytes": 2179
  },
  {
    "id": "chaojifeng-product-expression",
    "name": "产品表达：让任务、证据与感受一起成立",
    "desc": "先从真实任务选主线，再决定如何表现。默认以一份计划推进，复杂镜头才展开 镜头任务模板；它是设计笔记，不是新增必填流程。",
    "cat": "video",
    "zh": "产品表达",
    "bytes": 2761
  },
  {
    "id": "chaojifeng-product-music-story",
    "name": "产品音乐叙事：让歌词、动作与证据共同讲述",
    "desc": "用于操作简短、结果可见，并有生活场景或情绪价值的产品宣传。先沿 产品表达 核任务与证据，再判断是否采用 product-music-story 配方。它是现有 product-demo、brand-film、music-visual 的组合指导，不新增场景，也不自动提供作曲、演唱或渲染能力。",
    "cat": "video",
    "zh": "产品音乐故事",
    "bytes": 2680
  },
  {
    "id": "chaojifeng-reference-film-study",
    "name": "参考片研究：把一部成片拆成可迁移的方法",
    "desc": "用户给一部成片，要“研究它的手法、抽象成可复用的方法”时读本文。目标是留下换了产品也成立的规则，不是复刻这部片。已抽出的发布片元素见 发布片语法；那是用本文方法做出的一个结果，不是研究的终点。",
    "cat": "video",
    "zh": "参考片研究",
    "bytes": 2727
  },
  {
    "id": "chaojifeng-review-and-revision",
    "name": "审片与局部修改",
    "desc": "passed写观察或证据路径。设计示意、源码存在、预览、导出分别记录。图上字可能通过几何校验却不可读；背景SVG会抬高密度；静止可能是合理阅读，大帧差也可能无意义。",
    "cat": "video",
    "zh": "评审与修改",
    "bytes": 6907
  },
  {
    "id": "chaojifeng-scene-tool-composition",
    "name": "按表达场景组合三维、合成与交付能力",
    "desc": "本参考落实“镜头意图 → 可用路线 → 能力证据 → 最小试验 → 资源上限 → 回退”。适用于八类既有场景，不新设一套题材分类，也不把任何引擎当全部视频的前提。先确定画面要解释什么或让观众感受什么，再选择单一工具或组合。2026-10-25读取指定仓库的DeepWiki结构与问答，并回读下述官方源",
    "cat": "video",
    "zh": "场景工具组合",
    "bytes": 6871
  },
  {
    "id": "chaojifeng-shot-production",
    "name": "镜头生产统筹：先规划，再实现",
    "desc": "适用于产品、讲解、资讯、图片、故事、功能、品牌和音乐视频。这里组织内容、工具与素材，不是新场景或生成模型专属流程。按 创意导演 先确定主线、审美边界和关键事件；复杂任务展开本参考，简单任务只留必要决定。",
    "cat": "video",
    "zh": "镜头生产",
    "bytes": 3138
  },
  {
    "id": "chaojifeng-song-visual-direction",
    "name": "从歌曲到视觉体验",
    "desc": "用于歌曲主导的音乐视频。用户只提供歌曲时也可进入：在授权和实际素材范围内，由 Agent 理解歌曲、自主选择视觉方向并继续制作；用户指定的故事、风格、音乐版本和交付方式优先。简单任务将判断写入已有计划，不额外制造文档或确认节点。只有必要音源、事实、素材或费用确实阻断才说明缺口。",
    "cat": "video",
    "zh": "歌曲视觉方向",
    "bytes": 3793
  },
  {
    "id": "chaojifeng-sound-and-rhythm",
    "name": "让声音参与叙事和剪辑",
    "desc": "先决定本段主要靠什么传达：人声、动作、环境、音乐或静默。声音与镜头一起排练，不等画面做完才默认铺一条背景音乐。允许无旁白作品；用户要求声音时不能擅自静音交付。",
    "cat": "video",
    "zh": "声音与节奏",
    "bytes": 4994
  },
  {
    "id": "chaojifeng-subtitle-direction",
    "name": "字幕导演与配色",
    "desc": "字幕既承担内容，也参与声音和画面的节奏。适用于有旁白、歌词或用户要求字幕的视频；音乐场景与 音乐镜头与运动编排 一起使用。保持引擎中立，复用项目可编辑文字层与唯一时间轴，不增加必填合同或固定动效参数。",
    "cat": "video",
    "zh": "字幕导演与配色",
    "bytes": 4064
  },
  {
    "id": "chaojifeng-video-design",
    "name": "chaojifeng-video-design",
    "desc": "设计和制作产品演示、知识讲解（含 Rap／说唱）、资讯、图片成片、故事、功能动效、品牌短片与音乐视觉视频。支持选择或扩展视频风格、组合动效、强化前三秒、素材调度、音乐编排、参考片研究和局部修改；从导演意图到可编辑计划、制作、审片及可播放成片，也可只交方案或分镜。模型与引擎中立，按任务加载风格包和技术",
    "cat": "video",
    "zh": "视频设计方法论总纲",
    "bytes": 4021
  },
  {
    "id": "chaojifeng-visual-emphasis",
    "name": "让观众看清当前重点",
    "desc": "用于真实截图、录屏、图表、功能与结果证据的强调。先问这一时刻观众应该看哪里、知道什么或做什么，再选框、标签、引线、聚焦或局部放大。无需给每镜加框；图像故事、品牌意象和音乐表演没有操作教学点时可完全不用。",
    "cat": "video",
    "zh": "视觉强调",
    "bytes": 3862
  },
  {
    "id": "claude-api-in-prototypes",
    "name": "claude-api-in-prototypes",
    "desc": "Claude API in prototypes Call Claude from your HTML artifacts via window.claude.complete",
    "cat": "import",
    "zh": "原型里调用 Claude",
    "bytes": 1099
  },
  {
    "id": "create-design-system",
    "name": "create-design-system",
    "desc": "Create design system Skill to use if user asks you to create a design system or UI kit",
    "cat": "ds",
    "zh": "创建设计系统",
    "bytes": 18923
  },
  {
    "id": "data-science",
    "name": "data-science",
    "desc": "Data science Investigate product metrics and paint them onto the product when a screen can show them",
    "cat": "data",
    "zh": "产品指标洞察",
    "bytes": 21964
  },
  {
    "id": "data-visualization",
    "name": "data-visualization",
    "desc": "Data visualization Charts, graphs, and dashboards from your data — interactive d3 with zoom, tooltips, and image download",
    "cat": "data",
    "zh": "数据可视化图表",
    "bytes": 9634
  },
  {
    "id": "design-components",
    "name": "design-components",
    "desc": "Design Components Author streamable .dc.html Design Components",
    "cat": "ds",
    "zh": "流式设计组件",
    "bytes": 3373
  },
  {
    "id": "design-feedback",
    "name": "design-feedback",
    "desc": "Design feedback Get expert feedback as tooltips painted on your design — then riff on the ideas together",
    "cat": "design",
    "zh": "设计评审反馈",
    "bytes": 6193
  },
  {
    "id": "design-system-authoring-guide",
    "name": "design-system-authoring-guide",
    "desc": "Full authoring flow for setting up or importing a design system — the brand's tokens, components, UI kits, and starting points — and compiling it into",
    "cat": "ds",
    "zh": "设计系统搭建全流程",
    "bytes": 22194
  },
  {
    "id": "design-system-preview",
    "name": "design-system-preview",
    "desc": "Compile a design system directory (one with _ds_manifest.json and/or @dsCard-tagged .html cards) into a single self-contained, interactive preview.htm",
    "cat": "ds",
    "zh": "设计系统预览编译",
    "bytes": 5936
  },
  {
    "id": "experiment-workflow",
    "name": "experiment-workflow",
    "desc": "Experiment workflow From idea to pre-registered design to honest read-out",
    "cat": "import",
    "zh": "设计实验工作流",
    "bytes": 11529
  },
  {
    "id": "export-as-pptx-editable",
    "name": "export-as-pptx-editable",
    "desc": "Export as PPTX (editable) Native text & shapes — editable in PowerPoint",
    "cat": "media",
    "zh": "导出可编辑 PPTX",
    "bytes": 9916
  },
  {
    "id": "export-as-pptx-screenshots",
    "name": "export-as-pptx-screenshots",
    "desc": "Export as PPTX (screenshots) Flat images — pixel-perfect but not editable",
    "cat": "media",
    "zh": "导出截图版 PPTX",
    "bytes": 2985
  },
  {
    "id": "export-as-video",
    "name": "export-as-video",
    "desc": "Export as video Render a timeline animation to a real .mp4",
    "cat": "media",
    "zh": "渲染成 .mp4",
    "bytes": 5999
  },
  {
    "id": "exportable-video",
    "name": "exportable-video",
    "desc": "Exportable video Make animations the user can export as video",
    "cat": "media",
    "zh": "可导出动画视频",
    "bytes": 2342
  },
  {
    "id": "flier",
    "name": "flier",
    "desc": "Flier Print-ready single page",
    "cat": "doc",
    "zh": "单页印刷品",
    "bytes": 2091
  },
  {
    "id": "frontend-design",
    "name": "frontend-design",
    "desc": "Frontend design Aesthetic direction for designs outside an existing brand system",
    "cat": "design",
    "zh": "前端美学方向",
    "bytes": 2727
  },
  {
    "id": "generate-images",
    "name": "generate-images",
    "desc": "Generate images Detect an image backend and generate raster art, icons, illustrations, and infographics",
    "cat": "media",
    "zh": "生成图像素材",
    "bytes": 6509
  },
  {
    "id": "google-slides-safe",
    "name": "google-slides-safe",
    "desc": "Google Slides safe Author with Google Fonts so the deck imports cleanly",
    "cat": "doc",
    "zh": "Google Slides 兼容",
    "bytes": 817
  },
  {
    "id": "handoff-to-claude-code",
    "name": "handoff-to-claude-code",
    "desc": "Handoff to Claude Code Developer handoff package",
    "cat": "proto",
    "zh": "开发交接包",
    "bytes": 4093
  },
  {
    "id": "hi-fi-design",
    "name": "hi-fi-design",
    "desc": "Hi-fi design Polished, production-quality mockups",
    "cat": "design",
    "zh": "高保真成品稿",
    "bytes": 3348
  },
  {
    "id": "html-email",
    "name": "html-email",
    "desc": "HTML email Send-ready single-file email",
    "cat": "doc",
    "zh": "HTML 邮件",
    "bytes": 2590
  },
  {
    "id": "huashu-ai-video-review",
    "name": "AI看片评审闭环（scripts/cloud/ai-review-video.py）",
    "desc": "终渲MP4喂给视频理解模型（seed-2.0-lite），按固定checklist出结构化评审报告。",
    "cat": "video",
    "zh": "AI 视频评审",
    "bytes": 2056
  },
  {
    "id": "huashu-animation-best-practices",
    "name": "Animation Best Practices · 正向动画设计语法",
    "desc": "基于 Anthropic 官方三支产品动画（Claude Design / Claude Code Desktop / Claude for Word）",
    "cat": "design",
    "zh": "动画最佳实践",
    "bytes": 13460
  },
  {
    "id": "huashu-animation-pitfalls",
    "name": "Animation Pitfalls：HTML 动画踩过的坑与规则",
    "desc": "做动画时最常踩的 bug 和如何避免。每条规则都来自真实失败案例。",
    "cat": "design",
    "zh": "动画避坑清单",
    "bytes": 19236
  },
  {
    "id": "huashu-animations",
    "name": "Animations：时间轴动画引擎",
    "desc": "做动画/motion design HTML时读这个。原理、用法、典型模式。",
    "cat": "design",
    "zh": "动效规则",
    "bytes": 5637
  },
  {
    "id": "huashu-app-prototype",
    "name": "App / iOS 原型专属守则 · 完整操作手册",
    "desc": "做 iOS/Android/移动 app 原型时（触发：「app 原型」「iOS mockup」「移动应用」「做个 app」），下面四条覆盖通用 placeholder 原则——app 原型是 demo 现场，静态摆拍和米白占位卡没有说服力。",
    "cat": "proto",
    "zh": "App 原型规范",
    "bytes": 6736
  },
  {
    "id": "huashu-apple-gallery-showcase",
    "name": "Apple Gallery Showcase · 画廊展示墙动画风格",
    "desc": "灵感来源：Claude Design 官网 hero 视频 + 苹果产品页「作品墙」式陈列",
    "cat": "design",
    "zh": "苹果风展示页",
    "bytes": 8595
  },
  {
    "id": "huashu-audio-design-rules",
    "name": "音频设计规则 · huashu-design",
    "desc": "所有动画 demo 的音频应用配方。和 sfx-library.md（资产清单）配套使用。",
    "cat": "video",
    "zh": "音频设计规则",
    "bytes": 6034
  },
  {
    "id": "huashu-brand-asset-protocol",
    "name": "核心资产协议（完整版）",
    "desc": "SKILL.md「窄桥 1 · 品牌资产协议」的完整版。SKILL.md 留了触发条件 + 5 步标题；这里是 5 步详细操作、下载命令、brand-spec 模板、全流程失败兜底、反例与代价对比。",
    "cat": "design",
    "zh": "品牌资产协议",
    "bytes": 8693
  },
  {
    "id": "huashu-camera-language",
    "name": "Camera Language · 运镜导演体系",
    "desc": "何时读本文件：画面里出现任何「镜头级」运动之前——zoom / pan / orbit / parallax /",
    "cat": "video",
    "zh": "镜头语言",
    "bytes": 12432
  },
  {
    "id": "huashu-cinematic-patterns",
    "name": "Cinematic Patterns · Workflow Demo 的 Best Practi",
    "desc": "从「PPT 动画」升级到「发布会级 cinematic」的 5 个关键 pattern。",
    "cat": "video",
    "zh": "电影化手法",
    "bytes": 7326
  },
  {
    "id": "huashu-content-guidelines",
    "name": "Content Guidelines：反AI slop、内容准则、Scale规范",
    "desc": "AI slop 是默认值，不主动避开就会发生。但「默认值」会随时间变：2024 年是紫渐变和 emoji，2026 年变成了更「有品位」的样子。只禁上一代的 slop，等于在打上一场仗。",
    "cat": "design",
    "zh": "文案内容规范",
    "bytes": 6643
  },
  {
    "id": "huashu-critique-guide",
    "name": "设计评审深度指南",
    "desc": "Phase 7 的详细参考。提供评分标准、场景侧重点、常见问题清单。",
    "cat": "design",
    "zh": "设计评审指南",
    "bytes": 4165
  },
  {
    "id": "huashu-design-context",
    "name": "Design Context：从已有上下文出发",
    "desc": "这是这个skill最重要的one thing。",
    "cat": "design",
    "zh": "设计上下文",
    "bytes": 4231
  },
  {
    "id": "huashu-design-styles",
    "name": "设计风格库：网页 20 + PPT 20 + 信息图 20 + App 12 + 中文与东亚 1",
    "desc": "2026-06 重构。基于对全球 10 大网站类型 + 10 大演示类型、各 top5 公认最佳设计（共 100 个真实案例）的调研反推。",
    "cat": "design",
    "zh": "84 种风格库",
    "bytes": 51776
  },
  {
    "id": "huashu-design",
    "name": "huashu-design",
    "desc": "花叔Design——用HTML做高保真原型、幻灯片、动画、可视化与专家评审。任何新设计100%先出三个方向初稿给用户选（指定风格/品牌也不豁免），选定后才执行。触发词：做原型、PPT、幻灯片、动画、设计风格、评审、做个HTML页面、UI mockup、导出MP4/GIF、做个好看的。生产级Web A",
    "cat": "design",
    "zh": "花叔设计总控 3.0",
    "bytes": 7721
  },
  {
    "id": "huashu-directions",
    "name": "三方向：三种好设计，不是三种皮",
    "desc": "任何新视觉设计，先出三个方向的真实初稿给用户选。这道门本身不变：100% 触发、指定风格或品牌也不豁免、摆出来就停、选择落档 direction-approved.md（豁免条件见 SKILL.md「窄桥」）。",
    "cat": "design",
    "zh": "三方向选稿流程",
    "bytes": 5744
  },
  {
    "id": "huashu-editable-pptx",
    "name": "可编辑 PPTX 导出：HTML 硬约束 + 尺寸决策 + 常见错误",
    "desc": "本文档讲的是用 scripts/html2pptx.js + pptxgenjs 把 HTML 逐元素翻译成真·可编辑 PowerPoint 文本框的路径，也是 export_deck_pptx.mjs 唯一支持的路径。",
    "cat": "doc",
    "zh": "可编辑 PPTX",
    "bytes": 11478
  },
  {
    "id": "huashu-experience",
    "name": "分发经验（huashu-design）",
    "desc": "跨项目复现过、或测量过、对任何用户都成立的发现。learn.py 开工前会按主题把匹配的条目带出来。",
    "cat": "design",
    "zh": "交互体验细则",
    "bytes": 2426
  },
  {
    "id": "huashu-gsap-recipes",
    "name": "GSAP Recipes · 设计语言到 GSAP Timeline 的翻译层",
    "desc": "本文件只做一件事：把 huashu-design 已沉淀的动画设计语言",
    "cat": "design",
    "zh": "GSAP 配方集",
    "bytes": 24906
  },
  {
    "id": "huashu-hero-animation-case-study",
    "name": "Gallery Ripple + Multi-Focus · 场景编排哲学",
    "desc": "从 huashu-design hero 动画 v9（25 秒，8 场景）里提炼出的一种可复用的视觉编排结构。",
    "cat": "design",
    "zh": "首屏动画案例",
    "bytes": 7181
  },
  {
    "id": "huashu-hyperframes-backend",
    "name": "HyperFrames 渲染后端 · 选型边界与操作手册",
    "desc": "2026-07-17 实测验证通过后引入（工具链/中文字体/代理环境/迁移/3D 五项全过，关键数据已内嵌本文）。",
    "cat": "video",
    "zh": "HyperFrames 渲染后端",
    "bytes": 4819
  },
  {
    "id": "huashu-launch-film-director-notes",
    "name": "Launch Film 工作流：先写万字 director's notes，再做动画",
    "desc": "高规格视觉作品（≥ 20 秒、含品牌叙事、含 slogan reveal、可能上 X / 公众号 / B 站推广）的标准工作流。",
    "cat": "video",
    "zh": "发布片导演笔记",
    "bytes": 8713
  },
  {
    "id": "huashu-materials",
    "name": "素材先行：画面的主角不该只是字和卡片",
    "desc": "纯 HTML/CSS 能做的材料如果只剩「字＋卡片＋表格＋细线」，换什么风格都会显得单调——这是旧版产出单调的第二个根因。这份文件解决两件事：每个方向先定主角素材；按用户手里实际有的能力分档，没有的能力推荐安装但绝不卡住。",
    "cat": "design",
    "zh": "材质与表面",
    "bytes": 2846
  },
  {
    "id": "huashu-module-deck",
    "name": "模块 · 幻灯片 / PPT / 演示",
    "desc": "幻灯片、PPT、路演、课件、汇报材料都走这里。先过 SKILL.md 的窄桥（三方向门等），再按这份手册做。",
    "cat": "proto",
    "zh": "幻灯模块",
    "bytes": 2402
  },
  {
    "id": "huashu-module-infographic",
    "name": "模块 · 信息图 / 数据可视化 / 长图",
    "desc": "一张或一组以数据或知识为主角、脱离交互也能独立读的图走这里：信息图、数据报告插图、小红书长图、海报式科普。先过 SKILL.md 的窄桥，再按这份手册做。",
    "cat": "proto",
    "zh": "信息图模块",
    "bytes": 1193
  },
  {
    "id": "huashu-module-motion",
    "name": "模块 · 动画 / 视频 / 宣传片",
    "desc": "时间轴驱动的一切走这里：HTML 动画、产品功能演示、launch film、带解说的概念视频、导出 MP4/GIF。这是本 skill 能力最多的模块，所以它有自己的路由。先过 SKILL.md 的窄桥（三方向门照走，初稿形态是方向板），再按这份手册做。",
    "cat": "proto",
    "zh": "动画模块",
    "bytes": 3829
  },
  {
    "id": "huashu-module-web",
    "name": "模块 · 网页 / 落地页 / 官网 / 界面原型",
    "desc": "可点击的站点、落地页、官网、Dashboard 和桌面端界面原型走这里（手机 App 走 references/app-prototype.md）。先过 SKILL.md 的窄桥，再按这份手册做。",
    "cat": "proto",
    "zh": "网页模块",
    "bytes": 1349
  },
  {
    "id": "huashu-multi-perspective-case-study",
    "name": "多视角并行实验 · Case Study",
    "desc": "huashu-md-html v2.0 launch film 项目 · 2026-05-11",
    "cat": "design",
    "zh": "多方向并行案例",
    "bytes": 6779
  },
  {
    "id": "huashu-pptx-from-rendered-html",
    "name": "视觉稿 HTML → 可编辑 PPTX：读渲染结果，不改 HTML",
    "desc": "references/editable-pptx.md 讲的是 html2pptx 那条路：HTML 从第一行就按 4 条硬约束写，",
    "cat": "doc",
    "zh": "HTML 渲染转 PPTX",
    "bytes": 5222
  },
  {
    "id": "huashu-react-setup",
    "name": "React + Babel 项目规范",
    "desc": "用HTML+React+Babel做原型时必须遵守的技术规范。不遵守会炸。",
    "cat": "proto",
    "zh": "React 环境配置",
    "bytes": 7530
  },
  {
    "id": "huashu-scene-templates",
    "name": "场景模板库：按输出类型组织",
    "desc": "与 design-styles.md 的「提示词DNA」组合使用。",
    "cat": "design",
    "zh": "场景模板",
    "bytes": 5188
  },
  {
    "id": "huashu-sfx-library",
    "name": "SFX Library · huashu-design",
    "desc": "资产位置：assets/sfx/<category>/<name>.mp3",
    "cat": "video",
    "zh": "音效库",
    "bytes": 7733
  },
  {
    "id": "huashu-slide-decks",
    "name": "Slide Decks：HTML幻灯片制作规范",
    "desc": "做幻灯片是设计工作的高频场景。这份文档说明怎么做好HTML幻灯片——从架构选型、单页设计，到 PDF/PPTX 导出的完整路径。",
    "cat": "doc",
    "zh": "幻灯片设计",
    "bytes": 22373
  },
  {
    "id": "huashu-storyboard-basics",
    "name": "Storyboard Basics · 轻量分镜与画面构图",
    "desc": "任何动画开工前的分镜方法，不论 5 秒还是 50 秒。核心一句话：每一镜先是一张会动的封面。",
    "cat": "video",
    "zh": "分镜基础",
    "bytes": 11318
  },
  {
    "id": "huashu-tweaks-system",
    "name": "Tweaks：设计变体实时调参",
    "desc": "Tweaks是这个skill里很核心的能力——让用户不改代码就能实时切换variations/调整参数。",
    "cat": "design",
    "zh": "外观微调系统",
    "bytes": 7216
  },
  {
    "id": "huashu-typography",
    "name": "Typography：排印推理系统",
    "desc": "这不是字体清单，是配对与排版的推理规则。 design-styles.md 已经给了 60 种风格各自的字体名；本文回答的是「为什么这样配」「拿到任意内容怎么推导出字号/行长/字重」。目标：同一个风格标签，落到不同内容上，能推导出不同的排印结果，而不是每次都抄同一套字号。",
    "cat": "design",
    "zh": "排版规范",
    "bytes": 10350
  },
  {
    "id": "huashu-ui-demo-animation",
    "name": "产品UI展示动画 Playbook",
    "desc": "这是「宣传的产品有UI界面」时的单一入口。 商单、发布动画、功能演示，只要画面主角是一个界面，先读这份文件再动手。",
    "cat": "design",
    "zh": "UI 演示动画",
    "bytes": 14624
  },
  {
    "id": "huashu-verification",
    "name": "Verification：输出验证流程",
    "desc": "一些 design-agent 原生环境（如 Claude.ai Artifacts）有内置的 fork_verifier_agent 起 subagent 用 iframe 截图检查。大部分 agent 环境（Claude Code / Codex / Cursor / Trae / 等）里没有这",
    "cat": "design",
    "zh": "交付前验证",
    "bytes": 4278
  },
  {
    "id": "huashu-video-export",
    "name": "Video Export：HTML 动画导出为 MP4/GIF",
    "desc": "动画 HTML 完成后，用户常想「能导出视频吗」。这份指南给出完整流程。",
    "cat": "video",
    "zh": "视频导出",
    "bytes": 7552
  },
  {
    "id": "huashu-voiceover-pipeline",
    "name": "Voiceover Pipeline · 解说驱动动画",
    "desc": "把动画从「无声画面 + 后期配音」升级为「先有解说词，再按音频实测时长驱动画面」的工作流。",
    "cat": "video",
    "zh": "配音流水线",
    "bytes": 13417
  },
  {
    "id": "huashu-workflow",
    "name": "Workflow：从接到任务到交付",
    "desc": "越资深的设计师越早对齐，因为他更清楚返工的代价。这份文件是三方向选定之后的主干流程，以及开工前怎么问问题。",
    "cat": "design",
    "zh": "设计工作流",
    "bytes": 5459
  },
  {
    "id": "impeccable",
    "name": "impeccable",
    "desc": "Use when the user wants to design, redesign, shape, critique, audit, polish, simplify, harden, animate, or otherwise improve a frontend interface.",
    "cat": "design",
    "zh": "设计总控 18 命令",
    "bytes": 14332
  },
  {
    "id": "import-from-figma",
    "name": "import-from-figma",
    "desc": "Import from Figma (.fig) Decode a local .fig file offline — mount it as a design reference for a project, cherry-pick components/frames as React code,",
    "cat": "import",
    "zh": "导入 .fig 设计稿",
    "bytes": 10741
  },
  {
    "id": "import-from-github",
    "name": "import-from-github",
    "desc": "Import from GitHub Use a GitHub repo as a design source — browse the real tree on demand, sparse-import only the paths you need into a scratch dir out",
    "cat": "import",
    "zh": "用 GitHub 仓库做设计源",
    "bytes": 2468
  },
  {
    "id": "import-from-html",
    "name": "import-from-html",
    "desc": "Import from HTML Use existing HTML/CSS pages as a design reference — loose files, saved/exported pages, or screens in a local codebase. Read the code,",
    "cat": "import",
    "zh": "导入现有 HTML/CSS",
    "bytes": 2111
  },
  {
    "id": "interactive-prototype",
    "name": "interactive-prototype",
    "desc": "Interactive prototype Working app with real interactions",
    "cat": "proto",
    "zh": "可交互原型",
    "bytes": 423
  },
  {
    "id": "landing-page-design",
    "name": "landing-page-design",
    "desc": "Complete system for building high converting landing pages: intake questions, page structure, layout selection, conversion copywriting, SEO, plus stri",
    "cat": "design",
    "zh": "落地页设计系统",
    "bytes": 18750
  },
  {
    "id": "lemo-opuscar",
    "name": "lemo-opuscar",
    "desc": "Direct and produce a short film made entirely in code, in one of the styles of the Lemo-Opuscar library (e.g. Impasto Oil Painting 油画厚涂, Watercolor Br",
    "cat": "video",
    "zh": "纯代码短片导演",
    "bytes": 3300
  },
  {
    "id": "low-level-tweaks-api",
    "name": "low-level-tweaks-api",
    "desc": "Low-level tweaks API Send free-text from the Tweaks panel into chat",
    "cat": "proto",
    "zh": "Tweaks 面板直通 API",
    "bytes": 2006
  },
  {
    "id": "make-a-deck",
    "name": "make-a-deck",
    "desc": "Make a deck Slide presentation in HTML",
    "cat": "doc",
    "zh": "HTML 幻灯片",
    "bytes": 22784
  },
  {
    "id": "make-a-doc",
    "name": "make-a-doc",
    "desc": "Make a doc Page-style document, printable out of the box",
    "cat": "doc",
    "zh": "可打印文档",
    "bytes": 2613
  },
  {
    "id": "make-tweakable",
    "name": "make-tweakable",
    "desc": "Make tweakable Add in-design tweak controls",
    "cat": "proto",
    "zh": "给设计加调节控件",
    "bytes": 367
  },
  {
    "id": "maps-geography",
    "name": "maps-geography",
    "desc": "Maps & geography Accurate maps from real geo data — use for any map, or whenever geography would make a good graphic for a deliverable",
    "cat": "data",
    "zh": "真实地理地图",
    "bytes": 2845
  },
  {
    "id": "mobile-prototype",
    "name": "mobile-prototype",
    "desc": "Mobile prototype Pin-to-home-screen-ready mobile prototype",
    "cat": "proto",
    "zh": "移动端原型",
    "bytes": 3363
  },
  {
    "id": "options-stack",
    "name": "options-stack",
    "desc": "Options Lay out design options — vertical stack (DC) / pannable canvas (non-DC)",
    "cat": "design",
    "zh": "多方案并排展示",
    "bytes": 1160
  },
  {
    "id": "save-as-pdf",
    "name": "save-as-pdf",
    "desc": "Save as PDF Print-ready PDF export",
    "cat": "doc",
    "zh": "导出打印 PDF",
    "bytes": 5497
  },
  {
    "id": "save-as-standalone-html",
    "name": "save-as-standalone-html",
    "desc": "Save as standalone HTML Single self-contained file that works offline",
    "cat": "doc",
    "zh": "存为离线单文件",
    "bytes": 5817
  },
  {
    "id": "social-media-content",
    "name": "social-media-content",
    "desc": "Social media content Posts, carousels, and campaign assets — in your brand, sized for every platform, exact-size downloads",
    "cat": "doc",
    "zh": "社媒内容与campaign",
    "bytes": 10878
  },
  {
    "id": "something-cool",
    "name": "something-cool",
    "desc": "Something cool Surprise the user with something impressive",
    "cat": "design",
    "zh": "惊艳小创意",
    "bytes": 985
  },
  {
    "id": "speaker-notes",
    "name": "speaker-notes",
    "desc": "Speaker notes Presenter script alongside visual-first slides",
    "cat": "doc",
    "zh": "演讲者备注",
    "bytes": 1491
  },
  {
    "id": "trifold-brochure",
    "name": "trifold-brochure",
    "desc": "Trifold brochure Print-ready two-sided fold",
    "cat": "doc",
    "zh": "三折页宣传册",
    "bytes": 2662
  },
  {
    "id": "tweaks-protocol",
    "name": "tweaks-protocol",
    "desc": "Tweaks protocol Low-level Tweaks host protocol (postMessage + persistence)",
    "cat": "proto",
    "zh": "Tweaks 宿主协议",
    "bytes": 2184
  },
  {
    "id": "use-design-system",
    "name": "use-design-system",
    "desc": "Consume an existing design system from a regular design project — discover available systems, import a compiled copy into _ds/<slug>/, wire it up, see",
    "cat": "ds",
    "zh": "套用设计系统",
    "bytes": 18534
  },
  {
    "id": "watercolor-illustration",
    "name": "watercolor-illustration",
    "desc": "Watercolor illustration Code-painted watercolor images",
    "cat": "media",
    "zh": "代码画水彩",
    "bytes": 12373
  },
  {
    "id": "website-landing-page",
    "name": "website-landing-page",
    "desc": "Website & landing page Marketing sites, landing pages, and redesigns — built for conversion, in your brand",
    "cat": "design",
    "zh": "官网与落地页",
    "bytes": 4073
  },
  {
    "id": "wireframe",
    "name": "wireframe",
    "desc": "Wireframe Explore many ideas with wireframes and storyboards",
    "cat": "design",
    "zh": "线框与故事板",
    "bytes": 845
  }
];
