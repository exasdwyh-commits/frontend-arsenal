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
    "id": "astryx-a11y-spec",
    "name": "@astryxdesign/a11y-spec",
    "desc": "Reusable accessibility spec tests: one standards-traceable contract per adopted",
    "cat": "ds",
    "zh": "无障碍测试契约",
    "bytes": 38365
  },
  {
    "id": "astryx-agentic-states",
    "name": "Agentic states design specification",
    "desc": "People working with an agent should understand whether it is progressing,",
    "cat": "design",
    "zh": "Agent 状态设计",
    "bytes": 4544
  },
  {
    "id": "astryx-agents",
    "name": "Astryx repository guidance",
    "desc": "Astryx is a public design-system repository. Never commit internal links,",
    "cat": "import",
    "zh": "Astryx Agent 协议",
    "bytes": 15443
  },
  {
    "id": "astryx-api-conventions",
    "name": "API conventions for contributors",
    "desc": "Use this guide to shape a public component API before review. This page is a",
    "cat": "ds",
    "zh": "API 约定",
    "bytes": 25780
  },
  {
    "id": "astryx-arch-component-theming",
    "name": "Component theming surface",
    "desc": "This record defines how component anatomy relates to the public theming API.",
    "cat": "ds",
    "zh": "组件主题面",
    "bytes": 50466
  },
  {
    "id": "astryx-arch-i18n",
    "name": "Internationalization architecture",
    "desc": "This table is a review projection; the body below is authoritative.",
    "cat": "ds",
    "zh": "国际化架构",
    "bytes": 44993
  },
  {
    "id": "astryx-arch-icon-slots",
    "name": "Icon resolution and component slots",
    "desc": "This record defines how shared icons and component-owned icon roles fit together.",
    "cat": "ds",
    "zh": "图标解析与插槽",
    "bytes": 17854
  },
  {
    "id": "astryx-arch-knowledge-contracts",
    "name": "Knowledge contracts and decisions",
    "desc": "A reviewer should be able to answer two questions without rereading old pull",
    "cat": "ds",
    "zh": "知识契约",
    "bytes": 100128
  },
  {
    "id": "astryx-arch-public-api",
    "name": "Public component API",
    "desc": "This record defines the shared public API contract for stable Astryx components.",
    "cat": "ds",
    "zh": "公共组件 API",
    "bytes": 44689
  },
  {
    "id": "astryx-arch-readme",
    "name": "Architecture records",
    "desc": "Architecture documents describe the shipped system in present tense. They are",
    "cat": "ds",
    "zh": "架构文档导览",
    "bytes": 380
  },
  {
    "id": "astryx-arch-rtl-audit",
    "name": "RTL audit evidence architecture",
    "desc": "This table is a review projection; the body below is authoritative.",
    "cat": "ds",
    "zh": "RTL 审计证据",
    "bytes": 29628
  },
  {
    "id": "astryx-arch-template-authoring",
    "name": "Template authoring architecture",
    "desc": "Astryx templates are copyable starting points. Page templates scaffold complete",
    "cat": "ds",
    "zh": "模板编写",
    "bytes": 23939
  },
  {
    "id": "astryx-arch-test-sufficiency",
    "name": "Component test sufficiency architecture",
    "desc": "Astryx component tests should give maintainers confidence that current promised",
    "cat": "ds",
    "zh": "组件测试充分性",
    "bytes": 26396
  },
  {
    "id": "astryx-arch-theme-application",
    "name": "Theme application",
    "desc": "This record defines how a compiled theme becomes active for a React tree and the",
    "cat": "ds",
    "zh": "主题应用",
    "bytes": 14054
  },
  {
    "id": "astryx-arch-theme-authoring",
    "name": "Theme authoring contract",
    "desc": "This record defines what a theme author may express and how defineTheme",
    "cat": "ds",
    "zh": "主题编写契约",
    "bytes": 20393
  },
  {
    "id": "astryx-arch-theme-compilation",
    "name": "Theme compilation",
    "desc": "This record defines how one theme definition becomes usable styles.",
    "cat": "ds",
    "zh": "主题编译",
    "bytes": 32103
  },
  {
    "id": "astryx-ast-001",
    "name": "Async option-source states",
    "desc": "People using Selector or MultiSelector should be able to use every option the",
    "cat": "ds",
    "zh": "系统规格 异步选项源状态",
    "bytes": 8726
  },
  {
    "id": "astryx-ast-003",
    "name": "Layer coordination and global hosting system spe",
    "desc": "Make every layered interaction close the intended owner or interaction branch,",
    "cat": "ds",
    "zh": "系统规格 图层协调全局宿主",
    "bytes": 19634
  },
  {
    "id": "astryx-ast-004",
    "name": "Selector empty indicator-space collapse system s",
    "desc": "Give unselected options the width currently consumed by an empty selection-mark",
    "cat": "ds",
    "zh": "系统规格 空态指示位收起",
    "bytes": 8242
  },
  {
    "id": "astryx-ast-005",
    "name": "Safe navigation destinations",
    "desc": "A person activating an Astryx link should get the same destination safety no",
    "cat": "ds",
    "zh": "系统规格 安全导航目标",
    "bytes": 13152
  },
  {
    "id": "astryx-ast-006",
    "name": "Theme-local tokens system spec",
    "desc": "Let a maintained theme reuse one of its own semantic decisions across component",
    "cat": "ds",
    "zh": "系统规格 主题局部令牌",
    "bytes": 24021
  },
  {
    "id": "astryx-ast-008",
    "name": "Authoring-time tonal palette generation system s",
    "desc": "Theme authors need a repeatable way to make complete tonal palette candidates.",
    "cat": "ds",
    "zh": "系统规格 色调调色板生成",
    "bytes": 35330
  },
  {
    "id": "astryx-ast-009",
    "name": "Assistive-technology verification system spec",
    "desc": "People who depend on assistive technology should get the focus and announcement",
    "cat": "ds",
    "zh": "系统规格 辅助技术验证",
    "bytes": 30996
  },
  {
    "id": "astryx-ast-010",
    "name": "Structured percentage useResizable configuration",
    "desc": "A person resizing a panel should get the same panel size that the handle presents",
    "cat": "ds",
    "zh": "系统规格 百分比可调配置",
    "bytes": 32753
  },
  {
    "id": "astryx-ast-011",
    "name": "Read-only selection inputs",
    "desc": "People should be able to review and submit a selected value that policy or",
    "cat": "ds",
    "zh": "系统规格 只读选择输入",
    "bytes": 8249
  },
  {
    "id": "astryx-ast-012",
    "name": "Theme adaptations",
    "desc": "Themes should express opt-in token and component adaptations for environmental",
    "cat": "ds",
    "zh": "系统规格 主题适配",
    "bytes": 21696
  },
  {
    "id": "astryx-ast-013",
    "name": "Browser and platform support system spec",
    "desc": "Give stable Astryx web components one owner for browser support, native-feature",
    "cat": "ds",
    "zh": "系统规格 浏览器与平台支持",
    "bytes": 14123
  },
  {
    "id": "astryx-ast-018",
    "name": "Approved palette authoring contract",
    "desc": "Give maintained themes a consistent, reviewable color reference without making",
    "cat": "ds",
    "zh": "系统规格 调色板编写契约",
    "bytes": 15896
  },
  {
    "id": "astryx-ast-020",
    "name": "Accessibility spec-test authoring system spec",
    "desc": "People using Astryx components should get the keyboard, focus, meaning, and state",
    "cat": "ds",
    "zh": "系统规格 无障碍规格测试",
    "bytes": 23374
  },
  {
    "id": "astryx-ast-022",
    "name": "Theme ownership, inheritance, and materializatio",
    "desc": "Theme authors need to know whether a theme follows another theme or merely uses",
    "cat": "ds",
    "zh": "系统规格 主题继承与物化",
    "bytes": 29136
  },
  {
    "id": "astryx-ast-024",
    "name": "Theme-extensible Heading visual roles system spe",
    "desc": "Product themes sometimes need named heading treatments beyond Astryx's three",
    "cat": "ds",
    "zh": "系统规格 标题视觉角色扩展",
    "bytes": 15794
  },
  {
    "id": "astryx-ast-025",
    "name": "Scrollable container behavior system spec",
    "desc": "People should be able to reach and scroll overflowing content, continue scrolling",
    "cat": "ds",
    "zh": "系统规格 滚动容器行为",
    "bytes": 37133
  },
  {
    "id": "astryx-ast-026",
    "name": "shadcn Registry compatibility system spec",
    "desc": "Let builders install Astryx components, component showcases, example blocks, and",
    "cat": "ds",
    "zh": "系统规格 shadcn 注册兼容",
    "bytes": 14680
  },
  {
    "id": "astryx-ast-027",
    "name": "Local stacking and browser top-layer routing sys",
    "desc": "An Astryx component should be able to order its own painted parts without",
    "cat": "ds",
    "zh": "系统规格 本地堆叠与顶层路由",
    "bytes": 27506
  },
  {
    "id": "astryx-ast-032",
    "name": "Upload and send icon theming",
    "desc": "Let themes choose the artwork for FileInput's upload affordance and",
    "cat": "ds",
    "zh": "系统规格 上传发送图标主题化",
    "bytes": 13376
  },
  {
    "id": "astryx-ast-037-timer",
    "name": "Non-rendering elapsed Timer system spec",
    "desc": "This table is a review projection; the body below is authoritative.",
    "cat": "ds",
    "zh": "系统规格 计时器",
    "bytes": 22695
  },
  {
    "id": "astryx-ast-038-layer-text-boundary",
    "name": "Layer inherited-text and grouping boundary syste",
    "desc": "People opening a dialog, menu, tooltip, or other floating reading surface must",
    "cat": "ds",
    "zh": "系统规格 图层文本继承边界",
    "bytes": 51832
  },
  {
    "id": "astryx-ast-043-input-presentation",
    "name": "Date and time input presentation system spec",
    "desc": "One prop question — which surface collects the value — currently has two",
    "cat": "ds",
    "zh": "系统规格 日期时间输入呈现",
    "bytes": 11547
  },
  {
    "id": "astryx-ast-050-app-themes",
    "name": "App themes system spec",
    "desc": "A builder, a person or a coding agent, wants an app that uses one or more themes:",
    "cat": "ds",
    "zh": "系统规格 应用主题",
    "bytes": 37598
  },
  {
    "id": "astryx-ast-053-multi-selector-lookups",
    "name": "Complete multi-selector lookup receipts system s",
    "desc": "An agent sometimes knows several exact subjects it must inspect. Repeating one CLI",
    "cat": "ds",
    "zh": "系统规格 多选查找回执",
    "bytes": 18696
  },
  {
    "id": "astryx-ast-055-caller-rendered-trigger",
    "name": "Caller-rendered overlay trigger system spec",
    "desc": "This table is a review projection; the body below is authoritative.",
    "cat": "ds",
    "zh": "系统规格 调用方渲染触发器",
    "bytes": 32108
  },
  {
    "id": "astryx-ast-056-search-prop-shape",
    "name": "Search state vocabulary system spec",
    "desc": "This table is a review projection; the body below is authoritative.",
    "cat": "ds",
    "zh": "系统规格 搜索状态词汇",
    "bytes": 47339
  },
  {
    "id": "astryx-ast-057-row-actions",
    "name": "Swipe actions on `Item` system spec",
    "desc": "This table is a review projection; the body below is authoritative.",
    "cat": "ds",
    "zh": "系统规格 行滑动操作",
    "bytes": 135115
  },
  {
    "id": "astryx-ast-058-option-actions",
    "name": "Secondary action beside a picker option system s",
    "desc": "This table is a review projection; the body below is authoritative.",
    "cat": "ds",
    "zh": "系统规格 选项副操作",
    "bytes": 45551
  },
  {
    "id": "astryx-ast-059-layer-viewport-inset",
    "name": "Layer viewport inset system spec",
    "desc": "This table is a review projection; the body below is authoritative.",
    "cat": "ds",
    "zh": "系统规格 图层视口内缩",
    "bytes": 66880
  },
  {
    "id": "astryx-ast-066-theme-data-boundary",
    "name": "StyleX data-token ownership system spec",
    "desc": "The public dataVars entry in prebuilt mode contains compiled var() references,",
    "cat": "ds",
    "zh": "系统规格 StyleX 令牌所有权",
    "bytes": 40432
  },
  {
    "id": "astryx-ast-067-wall-time-resolution",
    "name": "Wall-clock time resolution system spec",
    "desc": "People who see dates and times in a chosen time zone, such as a Schedule week or",
    "cat": "ds",
    "zh": "系统规格 墙钟时间分辨率",
    "bytes": 6319
  },
  {
    "id": "astryx-ast-071-styling-library-compat",
    "name": "Styling-library compatibility system spec",
    "desc": "A product styles Astryx components with whatever its codebase already uses:",
    "cat": "ds",
    "zh": "系统规格 样式库兼容",
    "bytes": 4682
  },
  {
    "id": "astryx-ast-075-owned-field-combobox",
    "name": "Combobox over a caller-rendered field system spe",
    "desc": "A person picks from a filtered list while focus stays in a text field the",
    "cat": "ds",
    "zh": "系统规格 自绘字段组合框",
    "bytes": 12063
  },
  {
    "id": "astryx-ast-079-selector-trigger-hierarchy",
    "name": "Shared selector trigger hierarchy system spec",
    "desc": "A builder can place Selector, MultiSelector, or ComplexSelector beside",
    "cat": "ds",
    "zh": "系统规格 选择器触发层级",
    "bytes": 12256
  },
  {
    "id": "astryx-ast-081-global-mode",
    "name": "Global mode system spec",
    "desc": "proposals, history, pull requests, or research in the record; see",
    "cat": "ds",
    "zh": "系统规格 全局模式",
    "bytes": 123331
  },
  {
    "id": "astryx-ast-084-icon-sets",
    "name": "Icon set integrations system spec",
    "desc": "An icon set is an experimental integration item: icon components a package",
    "cat": "ds",
    "zh": "系统规格 图标集集成",
    "bytes": 48121
  },
  {
    "id": "astryx-ast-085-focusable-disabled",
    "name": "Focusable disabled controls system spec",
    "desc": "Keyboard and screen-reader users can always reach a disabled control. They can",
    "cat": "ds",
    "zh": "系统规格 可聚焦禁用控件",
    "bytes": 9002
  },
  {
    "id": "astryx-ast-086-status-announcements",
    "name": "Status announcement delivery system spec",
    "desc": "A screen-reader user hears each status change once, when it happens, at the",
    "cat": "ds",
    "zh": "系统规格 状态通告投递",
    "bytes": 58840
  },
  {
    "id": "astryx-ast-087-icon-variants",
    "name": "Icon variants, theme sizes, and component icon s",
    "desc": "A theme decides how icons look:",
    "cat": "ds",
    "zh": "系统规格 图标变体与插槽",
    "bytes": 20398
  },
  {
    "id": "astryx-ast-089-styling-target",
    "name": "Ref-first DOM styling target",
    "desc": "A consumer uses style, className, and xstyle on the same element they can",
    "cat": "ds",
    "zh": "系统规格 ref 样式目标",
    "bytes": 34027
  },
  {
    "id": "astryx-ast-090-exit-motion",
    "name": "Exit motion system spec",
    "desc": "A surface that animates in can animate out, so a person sees where it went and",
    "cat": "ds",
    "zh": "系统规格 退出动效",
    "bytes": 27944
  },
  {
    "id": "astryx-ast-092-incremental-search-results",
    "name": "Incremental search results system spec",
    "desc": "A person typing into a typeahead sees matches for what they typed right away,",
    "cat": "ds",
    "zh": "系统规格 增量搜索结果",
    "bytes": 15065
  },
  {
    "id": "astryx-ast-094-touch-presentations",
    "name": "Touch presentations feel native system spec",
    "desc": "A person using an Astryx product on a phone or tablet gets controls, sheets,",
    "cat": "ds",
    "zh": "系统规格 触控呈现原生感",
    "bytes": 182645
  },
  {
    "id": "astryx-ast-099-mobile-keyboard",
    "name": "On-screen keyboard system spec",
    "desc": "A person typing on a phone sees the field they are typing in, and the surface",
    "cat": "ds",
    "zh": "系统规格 软键盘",
    "bytes": 82565
  },
  {
    "id": "astryx-ast-102-typography-theme-owned",
    "name": "Typography stays theme-owned system spec",
    "desc": "People who set their own text size see it in every Core and Lab web",
    "cat": "ds",
    "zh": "系统规格 排版归属主题",
    "bytes": 18852
  },
  {
    "id": "astryx-ast-103-reorderable",
    "name": "Reorderable collections system spec",
    "desc": "createReorderable applies to a whole collection: its object is passed as",
    "cat": "ds",
    "zh": "系统规格 可重排集合",
    "bytes": 45080
  },
  {
    "id": "astryx-ast-105-animated-layout",
    "name": "Animated layout system spec",
    "desc": "When something inside an area changes size, the changed element and the",
    "cat": "ds",
    "zh": "系统规格 动画布局",
    "bytes": 37150
  },
  {
    "id": "astryx-ast-107-public-gesture-hooks",
    "name": "Public gesture hooks system spec",
    "desc": "A product can follow a drag, settle an element on snap points, and animate one",
    "cat": "ds",
    "zh": "系统规格 公开手势钩子",
    "bytes": 18439
  },
  {
    "id": "astryx-ast-108-theme-motion",
    "name": "Theme motion system spec",
    "desc": "A theme sets how fast and how lively its motion feels, and whether motion is",
    "cat": "ds",
    "zh": "系统规格 主题动效",
    "bytes": 15768
  },
  {
    "id": "astryx-ast-109-clear-value",
    "name": "Clear value system spec",
    "desc": "Clearing a Selector returns it to its starting point, and the caller says",
    "cat": "ds",
    "zh": "系统规格 清除值",
    "bytes": 11356
  },
  {
    "id": "astryx-ast-111-calendar-systems",
    "name": "Calendar systems system spec",
    "desc": "People who use a calendar other than the Gregorian calendar see, type, and",
    "cat": "ds",
    "zh": "系统规格 日历系统",
    "bytes": 34968
  },
  {
    "id": "astryx-bidirectionality",
    "name": "Bidirectionality design specification",
    "desc": "People should understand and operate the same Astryx interface whether their",
    "cat": "design",
    "zh": "双向文字与 RTL",
    "bytes": 15304
  },
  {
    "id": "astryx-blog-astryx-cli-build-command",
    "name": "AI is a copycat so we gave it good examples to copy",
    "desc": "We created a single entry point in the CLI that exposes the high quality templates our designers crafted so your agent can copy them and produce high ",
    "cat": "import",
    "zh": "CLI 构建命令",
    "bytes": 6530
  },
  {
    "id": "astryx-blog-building-for-people-and-agents",
    "name": "Building for people and agents at Meta San Francisco",
    "desc": "Join us November 12 at Meta San Francisco for an evening with the team behind Astryx, Meta",
    "cat": "design",
    "zh": "人与 Agent 双受众",
    "bytes": 1350
  },
  {
    "id": "astryx-blog-how-astryx-works",
    "name": "How Astryx works",
    "desc": "A look under the hood of Astryx: the problem it was built to solve, the systems it",
    "cat": "import",
    "zh": "Astryx 架构解析",
    "bytes": 9761
  },
  {
    "id": "astryx-blog-internationalizing-astryx",
    "name": "Astryx now speaks multiple languages!",
    "desc": "How internationalization and RTL came to Astryx: surveying the modern i18n landscape and using automation to catch RTL bugs a linter can",
    "cat": "design",
    "zh": "国际化实践",
    "bytes": 10843
  },
  {
    "id": "astryx-blog-meet-astryx-from-shadcn",
    "name": "Meet people where they already build",
    "desc": "A compatibility path for shadcn users to install Astryx components, examples, blocks, and pages without giving up the Astryx package or CLI.",
    "cat": "import",
    "zh": "从 shadcn 到 Astryx",
    "bytes": 4578
  },
  {
    "id": "astryx-blog-vibe-tests",
    "name": "Vibe Test",
    "desc": "How we make decisions in Astryx",
    "cat": "import",
    "zh": "Vibe 测试实践",
    "bytes": 8320
  },
  {
    "id": "astryx-blog-who-needs-a-figma-library",
    "name": "Who needs a Figma Library?",
    "desc": "Introducing the Astryx Figma Library, built and self-maintained by a Night Watch that keeps it in sync with code on every dot release.",
    "cat": "design",
    "zh": "设计工具之辩",
    "bytes": 2758
  },
  {
    "id": "astryx-charts-readme",
    "name": "Charts planning and verification",
    "desc": "These package-local records track the canary-only Charts package while its API,",
    "cat": "data",
    "zh": "图表库导览",
    "bytes": 733
  },
  {
    "id": "astryx-charts-stage1",
    "name": "ChartV2 Stage 1 — Design & Correctness Research",
    "desc": "Deep design work for the \"make it correct + a genuinely good API\" stage. This is the",
    "cat": "data",
    "zh": "图表 V2 阶段设计",
    "bytes": 21699
  },
  {
    "id": "astryx-charts-verification",
    "name": "ChartV2 — Verification Checklist",
    "desc": "Exhaustive, specific things to verify before we call the chart library \"correct.\" This",
    "cat": "data",
    "zh": "图表验证清单",
    "bytes": 15181
  },
  {
    "id": "astryx-collection-reordering",
    "name": "Ordered collection reordering design specificati",
    "desc": "A person reordering a list or row collection should understand what is moving,",
    "cat": "design",
    "zh": "集合重排交互",
    "bytes": 7553
  },
  {
    "id": "astryx-color-emphasis",
    "name": "Color emphasis design specification",
    "desc": "People should find the primary action and understand surface and status roles",
    "cat": "design",
    "zh": "颜色强调层级",
    "bytes": 4511
  },
  {
    "id": "astryx-component-docs",
    "name": "Component Documentation Guide",
    "desc": "Every component directory has a {Name}.doc.mjs file with structured documentation. The Astryx CLI reads these files to generate agent-friendly docs, s",
    "cat": "import",
    "zh": "组件文档写作",
    "bytes": 6025
  },
  {
    "id": "astryx-container-padding",
    "name": "Container padding architecture",
    "desc": "Padded containers and their descendants need one shared account of the inset at",
    "cat": "ds",
    "zh": "容器内距规则",
    "bytes": 36259
  },
  {
    "id": "astryx-contrib-readme",
    "name": "Contributing guides",
    "desc": "These guides turn current Astryx owner records into practical contribution steps.",
    "cat": "ds",
    "zh": "贡献指南",
    "bytes": 927
  },
  {
    "id": "astryx-control-rhythm",
    "name": "Control rhythm design specification",
    "desc": "Mixed controls should feel intentionally composed rather than assembled from",
    "cat": "design",
    "zh": "控件节奏",
    "bytes": 3975
  },
  {
    "id": "astryx-core-gestures",
    "name": "Gestures",
    "desc": "A gesture recognizer system with UIKit's semantics, for the touch",
    "cat": "design",
    "zh": "手势系统源码文档",
    "bytes": 47555
  },
  {
    "id": "astryx-core-keyboard",
    "name": "On-screen keyboard",
    "desc": "Core's one source for the on-screen keyboard (spec:AST-099,",
    "cat": "design",
    "zh": "键盘交互源码文档",
    "bytes": 19878
  },
  {
    "id": "astryx-core-measurements",
    "name": "Motion measurements",
    "desc": "The one list of UIKit reference captures the touch presentations need. Every",
    "cat": "design",
    "zh": "动效实测数据",
    "bytes": 81981
  },
  {
    "id": "astryx-core-motion",
    "name": "Motion",
    "desc": "Internal motion foundation for the touch presentations of core components: the",
    "cat": "design",
    "zh": "动效系统源码文档",
    "bytes": 23815
  },
  {
    "id": "astryx-create-component",
    "name": "Create Astryx Component",
    "desc": "Create a new Astryx component following the established protocols.",
    "cat": "import",
    "zh": "创建组件命令",
    "bytes": 1852
  },
  {
    "id": "astryx-create-theme",
    "name": "Create Astryx Theme",
    "desc": "Create a new Astryx theme using defineTheme.",
    "cat": "import",
    "zh": "创建主题命令",
    "bytes": 5299
  },
  {
    "id": "astryx-dense-compression",
    "name": "Astryx Translation Protocol",
    "desc": "Apply this protocol to create a dense translation for an Astryx component .doc.mjs file. The dense translation lives in the same file as a docsDense e",
    "cat": "import",
    "zh": "压缩协议技能",
    "bytes": 6878
  },
  {
    "id": "astryx-design-readme",
    "name": "Design specifications",
    "desc": "Design specs record human-owned visual and interaction intent: hierarchy,",
    "cat": "design",
    "zh": "Astryx 设计文档导览",
    "bytes": 4780
  },
  {
    "id": "astryx-docs-readme",
    "name": "Astryx knowledge map",
    "desc": "This directory holds maintainer knowledge that must be reviewable with the code",
    "cat": "ds",
    "zh": "知识文档体系",
    "bytes": 9983
  },
  {
    "id": "astryx-elevation-hierarchy",
    "name": "Elevation hierarchy design specification",
    "desc": "People should understand which surface is above another without noticing an",
    "cat": "design",
    "zh": "海拔层级",
    "bytes": 3986
  },
  {
    "id": "astryx-families-readme",
    "name": "Component family contracts",
    "desc": "Family contracts own behavior shared by sibling components, such as input",
    "cat": "ds",
    "zh": "组件族导览",
    "bytes": 452
  },
  {
    "id": "astryx-family-action-groups",
    "name": "Action groups contract",
    "desc": "A person can press one action in a group of sibling actions, slide across the",
    "cat": "ds",
    "zh": "动作组规格",
    "bytes": 11378
  },
  {
    "id": "astryx-family-buttons",
    "name": "Button family contract",
    "desc": "People should encounter one coherent button system whether an action is labeled,",
    "cat": "ds",
    "zh": "按钮族规格",
    "bytes": 20898
  },
  {
    "id": "astryx-family-input-fields",
    "name": "Input field family contract",
    "desc": "A person should encounter one coherent input system: state display, behavior,",
    "cat": "ds",
    "zh": "输入字段规格",
    "bytes": 55110
  },
  {
    "id": "astryx-family-layout-primitives",
    "name": "Layout primitives contract",
    "desc": "Builders should be able to arrange arbitrary content in one or two dimensions,",
    "cat": "ds",
    "zh": "布局原语规格",
    "bytes": 16509
  },
  {
    "id": "astryx-family-layout-regions",
    "name": "Layout regions contract",
    "desc": "A page or bounded work area should have predictable structural regions before",
    "cat": "ds",
    "zh": "布局区域规格",
    "bytes": 27189
  },
  {
    "id": "astryx-family-navigation",
    "name": "Navigation destinations contract",
    "desc": "People should receive the same safe navigation behavior from every Astryx",
    "cat": "ds",
    "zh": "导航目的地规格",
    "bytes": 17162
  },
  {
    "id": "astryx-family-overlay-dismissal",
    "name": "Overlay dismissal family contract",
    "desc": "A person dismissing layered UI should affect only the topmost relevant surface.",
    "cat": "ds",
    "zh": "覆盖层关闭规格",
    "bytes": 43346
  },
  {
    "id": "astryx-iconography",
    "name": "Iconography design specification",
    "desc": "Icons are simple graphic interface elements that represent common actions,",
    "cat": "design",
    "zh": "图标体系",
    "bytes": 20685
  },
  {
    "id": "astryx-ime-guard",
    "name": "IME Composition Guard — Shared Base Design",
    "desc": "1. Keep isImeKeyEvent as the single low-level predicate. It is the right",
    "cat": "design",
    "zh": "IME 组合守卫",
    "bytes": 6525
  },
  {
    "id": "astryx-interaction-harness",
    "name": "@astryxdesign/interaction-harness",
    "desc": "Playwright instruments for touch interaction and animation proofs: real touch",
    "cat": "ds",
    "zh": "交互取证测试",
    "bytes": 59421
  },
  {
    "id": "astryx-interaction-modality",
    "name": "Interaction modality architecture",
    "desc": "Astryx components behave predictably when people move between keyboard, pointer,",
    "cat": "ds",
    "zh": "交互方式适配",
    "bytes": 27537
  },
  {
    "id": "astryx-layer-runtime",
    "name": "Layer runtime",
    "desc": "This record describes the layer runtime shipped on current main, except",
    "cat": "ds",
    "zh": "层级运行时",
    "bytes": 67688
  },
  {
    "id": "astryx-list-windowing",
    "name": "List windowing architecture",
    "desc": "This table is a review projection; the body below is authoritative.",
    "cat": "ds",
    "zh": "列表窗口化架构",
    "bytes": 6465
  },
  {
    "id": "astryx-mobile-typography",
    "name": "Mobile typography design specification",
    "desc": "Balance the rest of the text styles with inputs' automatic 16px-reference",
    "cat": "design",
    "zh": "移动端排版",
    "bytes": 4370
  },
  {
    "id": "astryx-motion",
    "name": "Motion design specification",
    "desc": "Movement should clarify what changed and where content came from without making a",
    "cat": "design",
    "zh": "动效规格",
    "bytes": 12397
  },
  {
    "id": "astryx-pull-requests",
    "name": "Pull requests: one primary intent",
    "desc": "A pull request should make one reviewable change for one reason. Choose the template that matches its primary intent; supporting tests and docs belong",
    "cat": "ds",
    "zh": "拉取请求规范",
    "bytes": 17704
  },
  {
    "id": "astryx-reduced-motion",
    "name": "Reduced motion design specification",
    "desc": "A person who asks their device to reduce motion still sees every change Astryx",
    "cat": "design",
    "zh": "减少动效适配",
    "bytes": 12634
  },
  {
    "id": "astryx-shape-relationships",
    "name": "Shape relationships design specification",
    "desc": "Nested surfaces should read as parts of one intentional shape. Inner corners",
    "cat": "design",
    "zh": "形状关系",
    "bytes": 3914
  },
  {
    "id": "astryx-size-cascade",
    "name": "Component size cascade architecture",
    "desc": "A person should encounter coherent control sizing inside a component-owned group",
    "cat": "ds",
    "zh": "组件尺寸级联",
    "bytes": 8906
  },
  {
    "id": "astryx-spatial-hierarchy",
    "name": "Spatial hierarchy design specification",
    "desc": "People should understand what belongs together before reading individual labels.",
    "cat": "design",
    "zh": "空间层级",
    "bytes": 4097
  },
  {
    "id": "astryx-spec-alertdialog",
    "name": "AlertDialog component contract",
    "desc": "This table is a review projection; the body below is authoritative.",
    "cat": "ds",
    "zh": "组件规格 AlertDialog",
    "bytes": 40524
  },
  {
    "id": "astryx-spec-appshell",
    "name": "AppShell component contract",
    "desc": "This table is a review projection; the body below is authoritative.",
    "cat": "ds",
    "zh": "组件规格 AppShell",
    "bytes": 72109
  },
  {
    "id": "astryx-spec-aspectratio",
    "name": "AspectRatio component contract",
    "desc": "This table is a review projection; the body below is authoritative.",
    "cat": "ds",
    "zh": "组件规格 AspectRatio",
    "bytes": 17983
  },
  {
    "id": "astryx-spec-avatar",
    "name": "Avatar component contract",
    "desc": "This table is a review projection; the body below is authoritative.",
    "cat": "ds",
    "zh": "组件规格 Avatar",
    "bytes": 97031
  },
  {
    "id": "astryx-spec-avatargroup",
    "name": "AvatarGroup component contract",
    "desc": "This table is a review projection; the body below is authoritative.",
    "cat": "ds",
    "zh": "组件规格 AvatarGroup",
    "bytes": 41954
  },
  {
    "id": "astryx-spec-badge",
    "name": "Badge component contract",
    "desc": "This table is a review projection; the body below is authoritative.",
    "cat": "ds",
    "zh": "组件规格 Badge",
    "bytes": 19853
  },
  {
    "id": "astryx-spec-banner",
    "name": "Banner component contract",
    "desc": "Banner presents a persistent status message at the top of a page or section.",
    "cat": "ds",
    "zh": "组件规格 Banner",
    "bytes": 33830
  },
  {
    "id": "astryx-spec-blockquote",
    "name": "Blockquote component contract",
    "desc": "This table is a review projection; the body below is authoritative.",
    "cat": "ds",
    "zh": "组件规格 Blockquote",
    "bytes": 13783
  },
  {
    "id": "astryx-spec-bottomsheet",
    "name": "BottomSheet component contract",
    "desc": "BottomSheet presents caller-provided content in a panel that rises from the",
    "cat": "ds",
    "zh": "组件规格 BottomSheet",
    "bytes": 207766
  },
  {
    "id": "astryx-spec-breadcrumbs",
    "name": "BreadcrumbItem component contract",
    "desc": "This table is a review projection; the body below is authoritative.",
    "cat": "ds",
    "zh": "组件规格 Breadcrumbs",
    "bytes": 44069
  },
  {
    "id": "astryx-spec-button",
    "name": "Button component contract",
    "desc": "This table is a review projection; the body below is authoritative.",
    "cat": "ds",
    "zh": "组件规格 Button",
    "bytes": 107370
  },
  {
    "id": "astryx-spec-buttongroup",
    "name": "ButtonGroup component contract",
    "desc": "This table is a review projection; the body below is authoritative.",
    "cat": "ds",
    "zh": "组件规格 ButtonGroup",
    "bytes": 38419
  },
  {
    "id": "astryx-spec-calendar",
    "name": "Calendar component contract",
    "desc": "This table is a review projection; the body below is authoritative.",
    "cat": "ds",
    "zh": "组件规格 Calendar",
    "bytes": 81305
  },
  {
    "id": "astryx-spec-card",
    "name": "Card component contract",
    "desc": "This table is a review projection; the body below is authoritative.",
    "cat": "ds",
    "zh": "组件规格 Card",
    "bytes": 23093
  },
  {
    "id": "astryx-spec-carousel",
    "name": "Carousel component contract",
    "desc": "This table is a review projection; the body below is authoritative.",
    "cat": "ds",
    "zh": "组件规格 Carousel",
    "bytes": 42071
  },
  {
    "id": "astryx-spec-center",
    "name": "Center component contract",
    "desc": "This table is a review projection; the body below is authoritative.",
    "cat": "ds",
    "zh": "组件规格 Center",
    "bytes": 19933
  },
  {
    "id": "astryx-spec-chart",
    "name": "Chart component contract",
    "desc": "Chart coordinates one responsive Cartesian plot. It derives shared scales,",
    "cat": "ds",
    "zh": "组件规格 Chart",
    "bytes": 19014
  },
  {
    "id": "astryx-spec-chartaxis",
    "name": "ChartAxis component contract",
    "desc": "This table is a review projection; the body below is authoritative.",
    "cat": "ds",
    "zh": "组件规格 ChartAxis",
    "bytes": 20595
  },
  {
    "id": "astryx-spec-chartgrid",
    "name": "ChartGrid component contract",
    "desc": "This table is a review projection; the body below is authoritative.",
    "cat": "ds",
    "zh": "组件规格 ChartGrid",
    "bytes": 14930
  },
  {
    "id": "astryx-spec-chartlegend",
    "name": "ChartLegend component contract",
    "desc": "This table is a review projection; the body below is authoritative.",
    "cat": "ds",
    "zh": "组件规格 ChartLegend",
    "bytes": 17477
  },
  {
    "id": "astryx-spec-chartswatch",
    "name": "ChartSwatch component contract",
    "desc": "This table is a review projection; the body below is authoritative.",
    "cat": "ds",
    "zh": "组件规格 ChartSwatch",
    "bytes": 15075
  },
  {
    "id": "astryx-spec-charttooltip",
    "name": "ChartTooltip component contract",
    "desc": "This table is a review projection; the body below is authoritative.",
    "cat": "ds",
    "zh": "组件规格 ChartTooltip",
    "bytes": 28913
  },
  {
    "id": "astryx-spec-chat",
    "name": "ChatComposer component contract",
    "desc": "This table is a review projection; the body below is authoritative.",
    "cat": "ds",
    "zh": "组件规格 Chat",
    "bytes": 323714
  },
  {
    "id": "astryx-spec-checkboxinput",
    "name": "CheckboxInput component contract",
    "desc": "This table is a review projection; the body below is authoritative.",
    "cat": "ds",
    "zh": "组件规格 CheckboxInput",
    "bytes": 39289
  },
  {
    "id": "astryx-spec-checkboxlist",
    "name": "CheckboxList component contract",
    "desc": "This table is a review projection; the body below is authoritative.",
    "cat": "ds",
    "zh": "组件规格 CheckboxList",
    "bytes": 77640
  },
  {
    "id": "astryx-spec-citation",
    "name": "Citation component contract",
    "desc": "This table is a review projection; the body below is authoritative.",
    "cat": "ds",
    "zh": "组件规格 Citation",
    "bytes": 24365
  },
  {
    "id": "astryx-spec-clickablecard",
    "name": "ClickableCard component contract",
    "desc": "This table is a review projection; the body below is authoritative.",
    "cat": "ds",
    "zh": "组件规格 ClickableCard",
    "bytes": 27520
  },
  {
    "id": "astryx-spec-code",
    "name": "Code component contract",
    "desc": "This table is a review projection; the body below is authoritative.",
    "cat": "ds",
    "zh": "组件规格 Code",
    "bytes": 16662
  },
  {
    "id": "astryx-spec-codeblock",
    "name": "CodeBlock component contract",
    "desc": "This table is a review projection; the body below is authoritative only after owner approval.",
    "cat": "ds",
    "zh": "组件规格 CodeBlock",
    "bytes": 157786
  },
  {
    "id": "astryx-spec-collapsible",
    "name": "Collapsible component contract",
    "desc": "Collapsible reveals and hides one content region from one disclosure trigger. Its",
    "cat": "ds",
    "zh": "组件规格 Collapsible",
    "bytes": 51685
  },
  {
    "id": "astryx-spec-commandpalette",
    "name": "CommandPalette component contract",
    "desc": "This table is a review projection; the body below is authoritative.",
    "cat": "ds",
    "zh": "组件规格 CommandPalette",
    "bytes": 117478
  },
  {
    "id": "astryx-spec-commentpin",
    "name": "CommentPin component contract",
    "desc": "This table is a review projection; the body below is authoritative.",
    "cat": "ds",
    "zh": "组件规格 CommentPin",
    "bytes": 50189
  },
  {
    "id": "astryx-spec-complexselector",
    "name": "ComplexSelector component contract",
    "desc": "This table is a review projection; the body below is authoritative.",
    "cat": "ds",
    "zh": "组件规格 ComplexSelector",
    "bytes": 50503
  },
  {
    "id": "astryx-spec-contextmenu",
    "name": "ContextMenu component contract",
    "desc": "This table is a review projection; the body below is authoritative.",
    "cat": "ds",
    "zh": "组件规格 ContextMenu",
    "bytes": 67957
  },
  {
    "id": "astryx-spec-dateinput",
    "name": "DateInput component contract",
    "desc": "This table is a review projection; the body below is authoritative.",
    "cat": "ds",
    "zh": "组件规格 DateInput",
    "bytes": 176164
  },
  {
    "id": "astryx-spec-daterangeinput",
    "name": "DateRangeInput component contract",
    "desc": "DateRangeInput presents one controlled date range through a labeled field surface.",
    "cat": "ds",
    "zh": "组件规格 DateRangeInput",
    "bytes": 21093
  },
  {
    "id": "astryx-spec-datetimeinput",
    "name": "DateTimeInput component contract",
    "desc": "This table is a review projection; the body below is authoritative.",
    "cat": "ds",
    "zh": "组件规格 DateTimeInput",
    "bytes": 60326
  },
  {
    "id": "astryx-spec-dialog",
    "name": "Dialog component contract",
    "desc": "Dialog presents one modal task above the current page. It owns the transition into",
    "cat": "ds",
    "zh": "组件规格 Dialog",
    "bytes": 21838
  },
  {
    "id": "astryx-spec-divider",
    "name": "Divider component contract",
    "desc": "This table is a review projection; the body below is authoritative.",
    "cat": "ds",
    "zh": "组件规格 Divider",
    "bytes": 23755
  },
  {
    "id": "astryx-spec-drawer",
    "name": "Drawer component contract",
    "desc": "This table is a review projection; the body below is authoritative.",
    "cat": "ds",
    "zh": "组件规格 Drawer",
    "bytes": 71669
  },
  {
    "id": "astryx-spec-dropdownmenu",
    "name": "DropdownMenu component contract",
    "desc": "This table is a review projection; the body below is authoritative.",
    "cat": "ds",
    "zh": "组件规格 DropdownMenu",
    "bytes": 222169
  },
  {
    "id": "astryx-spec-emptystate",
    "name": "EmptyState component contract",
    "desc": "This table is a review projection; the body below is authoritative.",
    "cat": "ds",
    "zh": "组件规格 EmptyState",
    "bytes": 18126
  },
  {
    "id": "astryx-spec-field",
    "name": "Field component contract",
    "desc": "This table is a review projection; the body below is authoritative.",
    "cat": "ds",
    "zh": "组件规格 Field",
    "bytes": 65361
  },
  {
    "id": "astryx-spec-fieldstatus",
    "name": "FieldStatus component contract",
    "desc": "FieldStatus presents one validation message for a field or field-like control. It",
    "cat": "ds",
    "zh": "组件规格 FieldStatus",
    "bytes": 16641
  },
  {
    "id": "astryx-spec-fileinput",
    "name": "FileInput component contract",
    "desc": "FileInput presents a labelled file-selection field in compact input or dropzone",
    "cat": "ds",
    "zh": "组件规格 FileInput",
    "bytes": 13624
  },
  {
    "id": "astryx-spec-formlayout",
    "name": "FormLayout component contract",
    "desc": "This table is a review projection; the body below is authoritative.",
    "cat": "ds",
    "zh": "组件规格 FormLayout",
    "bytes": 28218
  },
  {
    "id": "astryx-spec-grid",
    "name": "Grid component contract",
    "desc": "This table is a review projection; the body below is authoritative.",
    "cat": "ds",
    "zh": "组件规格 Grid",
    "bytes": 32159
  },
  {
    "id": "astryx-spec-heading",
    "name": "Heading component contract",
    "desc": "This table is a review projection; the body below is authoritative.",
    "cat": "ds",
    "zh": "组件规格 Heading",
    "bytes": 32241
  },
  {
    "id": "astryx-spec-hovercard",
    "name": "HoverCard component contract",
    "desc": "Under none, no touch or pen tap opens the card.",
    "cat": "ds",
    "zh": "组件规格 HoverCard",
    "bytes": 32512
  },
  {
    "id": "astryx-spec-i18n",
    "name": "InternationalizationProvider component contract",
    "desc": "This table is a review projection; the body below is authoritative.",
    "cat": "ds",
    "zh": "组件规格 i18n",
    "bytes": 31259
  },
  {
    "id": "astryx-spec-icon",
    "name": "Icon component contract",
    "desc": "Icon presents one visual symbol with consistent size, color, and accessibility",
    "cat": "ds",
    "zh": "组件规格 Icon",
    "bytes": 40737
  },
  {
    "id": "astryx-spec-iconbutton",
    "name": "IconButton component contract",
    "desc": "This table is a review projection; the body below is authoritative.",
    "cat": "ds",
    "zh": "组件规格 IconButton",
    "bytes": 20469
  },
  {
    "id": "astryx-spec-indicator",
    "name": "CheckboxIndicator component contract",
    "desc": "This table is a review projection; the body below is authoritative.",
    "cat": "ds",
    "zh": "组件规格 Indicator",
    "bytes": 56491
  },
  {
    "id": "astryx-spec-infotip",
    "name": "InfoTip component contract",
    "desc": "This table is a review projection; the body below is authoritative.",
    "cat": "ds",
    "zh": "组件规格 InfoTip",
    "bytes": 24984
  },
  {
    "id": "astryx-spec-inputgroup",
    "name": "InputGroup component contract",
    "desc": "This table is a review projection; the body below is authoritative.",
    "cat": "ds",
    "zh": "组件规格 InputGroup",
    "bytes": 33384
  },
  {
    "id": "astryx-spec-item",
    "name": "Item component contract",
    "desc": "This record governs how Item aligns its start and end content against the",
    "cat": "ds",
    "zh": "组件规格 Item",
    "bytes": 43609
  },
  {
    "id": "astryx-spec-kbd",
    "name": "Kbd component contract",
    "desc": "This table is a review projection; the body below is authoritative.",
    "cat": "ds",
    "zh": "组件规格 Kbd",
    "bytes": 17634
  },
  {
    "id": "astryx-spec-layer",
    "name": "LayerProvider component contract",
    "desc": "This table is a review projection; the body below is authoritative.",
    "cat": "ds",
    "zh": "组件规格 Layer",
    "bytes": 9610
  },
  {
    "id": "astryx-spec-layout",
    "name": "Layout component contract",
    "desc": "This table is a review projection; the body below is authoritative.",
    "cat": "ds",
    "zh": "组件规格 Layout",
    "bytes": 124078
  },
  {
    "id": "astryx-spec-lightbox",
    "name": "Lightbox component contract",
    "desc": "Lightbox presents one active image or video in a full-viewport viewer and may",
    "cat": "ds",
    "zh": "组件规格 Lightbox",
    "bytes": 50843
  },
  {
    "id": "astryx-spec-link",
    "name": "Link component contract",
    "desc": "This table is a review projection; the body below is authoritative.",
    "cat": "ds",
    "zh": "组件规格 Link",
    "bytes": 53613
  },
  {
    "id": "astryx-spec-list",
    "name": "List component contract",
    "desc": "This table is a review projection; the body below is authoritative.",
    "cat": "ds",
    "zh": "组件规格 List",
    "bytes": 98801
  },
  {
    "id": "astryx-spec-markdown",
    "name": "Markdown component contract",
    "desc": "Markdown renders parsed content in a Document with stable default block parts and",
    "cat": "ds",
    "zh": "组件规格 Markdown",
    "bytes": 73375
  },
  {
    "id": "astryx-spec-metadatalist",
    "name": "MetadataList component contract",
    "desc": "This table is a review projection; the body below is authoritative.",
    "cat": "ds",
    "zh": "组件规格 MetadataList",
    "bytes": 36007
  },
  {
    "id": "astryx-spec-mobilenav",
    "name": "MobileNav component contract",
    "desc": "This table is a review projection; the body below is authoritative.",
    "cat": "ds",
    "zh": "组件规格 MobileNav",
    "bytes": 34481
  },
  {
    "id": "astryx-spec-moremenu",
    "name": "MoreMenu component contract",
    "desc": "This table is a review projection; the body below is authoritative.",
    "cat": "ds",
    "zh": "组件规格 MoreMenu",
    "bytes": 22811
  },
  {
    "id": "astryx-spec-multiselector",
    "name": "MultiSelector component contract",
    "desc": "This table is a review projection; the body below is authoritative.",
    "cat": "ds",
    "zh": "组件规格 MultiSelector",
    "bytes": 60994
  },
  {
    "id": "astryx-spec-navicon",
    "name": "NavIcon component contract",
    "desc": "This table is a review projection; the body below is authoritative.",
    "cat": "ds",
    "zh": "组件规格 NavIcon",
    "bytes": 8010
  },
  {
    "id": "astryx-spec-navmenu",
    "name": "NavHeadingMenu component contract",
    "desc": "This table is a review projection; the body below is authoritative.",
    "cat": "ds",
    "zh": "组件规格 NavMenu",
    "bytes": 24707
  },
  {
    "id": "astryx-spec-numberinput",
    "name": "NumberInput component contract",
    "desc": "This table is a review projection; the body below is authoritative.",
    "cat": "ds",
    "zh": "组件规格 NumberInput",
    "bytes": 37246
  },
  {
    "id": "astryx-spec-outline",
    "name": "Outline component contract",
    "desc": "This table is a review projection; the body below is authoritative.",
    "cat": "ds",
    "zh": "组件规格 Outline",
    "bytes": 39464
  },
  {
    "id": "astryx-spec-overflowlist",
    "name": "OverflowList component contract",
    "desc": "This table is a review projection; the body below is authoritative.",
    "cat": "ds",
    "zh": "组件规格 OverflowList",
    "bytes": 34045
  },
  {
    "id": "astryx-spec-overlay",
    "name": "Overlay component contract",
    "desc": "This record governs how several pieces of content are placed over an Overlay's",
    "cat": "ds",
    "zh": "组件规格 Overlay",
    "bytes": 31667
  },
  {
    "id": "astryx-spec-pagination",
    "name": "Pagination component contract",
    "desc": "This table is a review projection; the body below is authoritative.",
    "cat": "ds",
    "zh": "组件规格 Pagination",
    "bytes": 53190
  },
  {
    "id": "astryx-spec-popover",
    "name": "Popover component contract",
    "desc": "Popover presents interactive, caller-supplied content in an anchored top-layer",
    "cat": "ds",
    "zh": "组件规格 Popover",
    "bytes": 57932
  },
  {
    "id": "astryx-spec-powersearch",
    "name": "PowerSearch component contract",
    "desc": "PowerSearch provides structured filtering through field, operator, and value",
    "cat": "ds",
    "zh": "组件规格 PowerSearch",
    "bytes": 296065
  },
  {
    "id": "astryx-spec-progressbar",
    "name": "ProgressBar component contract",
    "desc": "This table is a review projection; the body below is authoritative.",
    "cat": "ds",
    "zh": "组件规格 ProgressBar",
    "bytes": 51681
  },
  {
    "id": "astryx-spec-radiolist",
    "name": "RadioList component contract",
    "desc": "This table is a review projection; the body below is authoritative.",
    "cat": "ds",
    "zh": "组件规格 RadioList",
    "bytes": 58944
  },
  {
    "id": "astryx-spec-resizable",
    "name": "Resizable component contract",
    "desc": "This table is a review projection; the body below is authoritative.",
    "cat": "ds",
    "zh": "组件规格 Resizable",
    "bytes": 111160
  },
  {
    "id": "astryx-spec-schedule",
    "name": "Schedule component contract",
    "desc": "This table is a review projection; the body below is authoritative.",
    "cat": "ds",
    "zh": "组件规格 Schedule",
    "bytes": 101893
  },
  {
    "id": "astryx-spec-scrollablearea",
    "name": "ScrollableArea component contract",
    "desc": "ScrollableArea gives builders a complete native scroll viewport and observable",
    "cat": "ds",
    "zh": "组件规格 ScrollableArea",
    "bytes": 14519
  },
  {
    "id": "astryx-spec-section",
    "name": "Section component contract",
    "desc": "This table is a review projection; the body below is authoritative.",
    "cat": "ds",
    "zh": "组件规格 Section",
    "bytes": 21530
  },
  {
    "id": "astryx-spec-segmentedcontrol",
    "name": "SegmentedControl component contract",
    "desc": "This table is a review projection; the body below is authoritative.",
    "cat": "ds",
    "zh": "组件规格 SegmentedControl",
    "bytes": 66856
  },
  {
    "id": "astryx-spec-selectablecard",
    "name": "SelectableCard component contract",
    "desc": "This table is a review projection; the body below is authoritative.",
    "cat": "ds",
    "zh": "组件规格 SelectableCard",
    "bytes": 29251
  },
  {
    "id": "astryx-spec-selector",
    "name": "Selector component contract",
    "desc": "Selector lets a person choose one value from a moderate list while keeping the",
    "cat": "ds",
    "zh": "组件规格 Selector",
    "bytes": 60555
  },
  {
    "id": "astryx-spec-sidenav",
    "name": "SideNav component contract",
    "desc": "This record governs how nested SideNavItem rows are drawn: their width, where",
    "cat": "ds",
    "zh": "组件规格 SideNav",
    "bytes": 122160
  },
  {
    "id": "astryx-spec-skeleton",
    "name": "Skeleton component contract",
    "desc": "This table is a review projection; the body below is authoritative.",
    "cat": "ds",
    "zh": "组件规格 Skeleton",
    "bytes": 15343
  },
  {
    "id": "astryx-spec-slider",
    "name": "Slider component contract",
    "desc": "Slider presents a labeled control for selecting one numeric value or a bounded",
    "cat": "ds",
    "zh": "组件规格 Slider",
    "bytes": 46865
  },
  {
    "id": "astryx-spec-spinner",
    "name": "Spinner component contract",
    "desc": "This table is a review projection; the body below is authoritative.",
    "cat": "ds",
    "zh": "组件规格 Spinner",
    "bytes": 28524
  },
  {
    "id": "astryx-spec-stack",
    "name": "Stack component contract",
    "desc": "This table is a review projection; the body below is authoritative.",
    "cat": "ds",
    "zh": "组件规格 Stack",
    "bytes": 29202
  },
  {
    "id": "astryx-spec-statusdot",
    "name": "StatusDot component contract",
    "desc": "This table is a review projection; the body below is authoritative.",
    "cat": "ds",
    "zh": "组件规格 StatusDot",
    "bytes": 38070
  },
  {
    "id": "astryx-spec-stepper",
    "name": "Step component contract",
    "desc": "This table is a review projection; the body below is authoritative.",
    "cat": "ds",
    "zh": "组件规格 Stepper",
    "bytes": 55892
  },
  {
    "id": "astryx-spec-switch",
    "name": "Switch component contract",
    "desc": "This table is a review projection; the body below is authoritative.",
    "cat": "ds",
    "zh": "组件规格 Switch",
    "bytes": 96815
  },
  {
    "id": "astryx-spec-table",
    "name": "Table component contract",
    "desc": "This table is a review projection; the body below is authoritative.",
    "cat": "ds",
    "zh": "组件规格 Table",
    "bytes": 178618
  },
  {
    "id": "astryx-spec-tablist",
    "name": "Tab component contract",
    "desc": "This table is a review projection; the body below is authoritative.",
    "cat": "ds",
    "zh": "组件规格 TabList",
    "bytes": 52734
  },
  {
    "id": "astryx-spec-text",
    "name": "Text component contract",
    "desc": "This table is a review projection; the body below is authoritative.",
    "cat": "ds",
    "zh": "组件规格 Text",
    "bytes": 34139
  },
  {
    "id": "astryx-spec-textarea",
    "name": "TextArea component contract",
    "desc": "This table is a review projection; the body below is authoritative.",
    "cat": "ds",
    "zh": "组件规格 TextArea",
    "bytes": 39027
  },
  {
    "id": "astryx-spec-textinput",
    "name": "TextInput component contract",
    "desc": "This table is a review projection; the body below is authoritative.",
    "cat": "ds",
    "zh": "组件规格 TextInput",
    "bytes": 76662
  },
  {
    "id": "astryx-spec-theme",
    "name": "MediaTheme component contract",
    "desc": "This table is a review projection; the body below is authoritative.",
    "cat": "ds",
    "zh": "组件规格 theme",
    "bytes": 29039
  },
  {
    "id": "astryx-spec-thumbnail",
    "name": "Thumbnail component contract",
    "desc": "This table is a review projection; the body below is authoritative.",
    "cat": "ds",
    "zh": "组件规格 Thumbnail",
    "bytes": 50707
  },
  {
    "id": "astryx-spec-timeinput",
    "name": "TimeInput component contract",
    "desc": "This table is a review projection; the body below is authoritative.",
    "cat": "ds",
    "zh": "组件规格 TimeInput",
    "bytes": 57284
  },
  {
    "id": "astryx-spec-timer",
    "name": "Timer component contract",
    "desc": "This table is a review projection; the body below is authoritative.",
    "cat": "ds",
    "zh": "组件规格 Timer",
    "bytes": 19446
  },
  {
    "id": "astryx-spec-timestamp",
    "name": "Timestamp component contract",
    "desc": "This table is a review projection; the body below is authoritative.",
    "cat": "ds",
    "zh": "组件规格 Timestamp",
    "bytes": 44258
  },
  {
    "id": "astryx-spec-toast",
    "name": "Toast component contract",
    "desc": "This table is a review projection; the body below is authoritative.",
    "cat": "ds",
    "zh": "组件规格 Toast",
    "bytes": 39888
  },
  {
    "id": "astryx-spec-togglebutton",
    "name": "ToggleButton component contract",
    "desc": "This table is a review projection; the body below is authoritative.",
    "cat": "ds",
    "zh": "组件规格 ToggleButton",
    "bytes": 63923
  },
  {
    "id": "astryx-spec-token",
    "name": "Token component contract",
    "desc": "This table is a review projection; the body below is authoritative.",
    "cat": "ds",
    "zh": "组件规格 Token",
    "bytes": 31920
  },
  {
    "id": "astryx-spec-tokenizer",
    "name": "Tokenizer component contract",
    "desc": "Tokenizer lets a person build and edit a set of searchable values as removable",
    "cat": "ds",
    "zh": "组件规格 Tokenizer",
    "bytes": 179377
  },
  {
    "id": "astryx-spec-toolbar",
    "name": "Toolbar component contract",
    "desc": "This table is a review projection; the body below is authoritative.",
    "cat": "ds",
    "zh": "组件规格 Toolbar",
    "bytes": 21811
  },
  {
    "id": "astryx-spec-tooltip",
    "name": "Tooltip component contract",
    "desc": "This table is a review projection; the body below is authoritative.",
    "cat": "ds",
    "zh": "组件规格 Tooltip",
    "bytes": 52368
  },
  {
    "id": "astryx-spec-topnav",
    "name": "TopNav component contract",
    "desc": "This table is a review projection; the body below is authoritative.",
    "cat": "ds",
    "zh": "组件规格 TopNav",
    "bytes": 110711
  },
  {
    "id": "astryx-spec-treelist",
    "name": "TreeList component contract",
    "desc": "This table is a review projection; the body below is authoritative.",
    "cat": "ds",
    "zh": "组件规格 TreeList",
    "bytes": 57533
  },
  {
    "id": "astryx-spec-typeahead",
    "name": "BaseTypeahead component contract",
    "desc": "This table is a review projection; the body below is authoritative.",
    "cat": "ds",
    "zh": "组件规格 Typeahead",
    "bytes": 95300
  },
  {
    "id": "astryx-spec-visuallyhidden",
    "name": "VisuallyHidden component contract",
    "desc": "This table is a review projection; the body below is authoritative.",
    "cat": "ds",
    "zh": "组件规格 VisuallyHidden",
    "bytes": 16947
  },
  {
    "id": "astryx-spec-writing",
    "name": "Writing specification records",
    "desc": "A specification record describes the system as it is meant to be. It is read by",
    "cat": "ds",
    "zh": "规格编写指南",
    "bytes": 12482
  },
  {
    "id": "astryx-style-authoring",
    "name": "Component style authoring architecture",
    "desc": "Astryx component styling should lower to valid maintained CSS, compose predictably",
    "cat": "ds",
    "zh": "组件样式编写",
    "bytes": 25380
  },
  {
    "id": "astryx-system-states",
    "name": "System states design specification",
    "desc": "A person should distinguish unavailable, waiting, processing, successful,",
    "cat": "design",
    "zh": "系统状态设计",
    "bytes": 6890
  },
  {
    "id": "astryx-template-composition",
    "name": "Template composition design specification",
    "desc": "A page template or reusable block should look like an intentional product",
    "cat": "design",
    "zh": "模板组合",
    "bytes": 7177
  },
  {
    "id": "astryx-theme-butter",
    "name": "Butter theme specification",
    "desc": "Butter is a warm golden theme with a signature saturated Blue accent, Butter",
    "cat": "design",
    "zh": "主题 butter 规格",
    "bytes": 9259
  },
  {
    "id": "astryx-theme-gothic",
    "name": "Gothic theme specification",
    "desc": "Gothic is a dark-only atmospheric theme with deep blue-gray surfaces, restrained",
    "cat": "design",
    "zh": "主题 gothic 规格",
    "bytes": 8104
  },
  {
    "id": "astryx-theme-matcha",
    "name": "Matcha theme specification",
    "desc": "Matcha is an earthy botanical theme with tea-green neutrals, warm Tea Gold, and",
    "cat": "design",
    "zh": "主题 matcha 规格",
    "bytes": 9291
  },
  {
    "id": "astryx-theme-neutral",
    "name": "Neutral theme specification",
    "desc": "This record is the current approved palette and Neutral token-mapping record.",
    "cat": "design",
    "zh": "主题 neutral 规格",
    "bytes": 18366
  },
  {
    "id": "astryx-theme-stone",
    "name": "Stone theme specification",
    "desc": "Stone provides a quiet, handcrafted theme built from warm violet-neutral",
    "cat": "design",
    "zh": "主题 stone 规格",
    "bytes": 8270
  },
  {
    "id": "astryx-theme-tokens",
    "name": "Theme token architecture",
    "desc": "This record defines the semantic token vocabulary that components, themes,",
    "cat": "ds",
    "zh": "主题令牌",
    "bytes": 28674
  },
  {
    "id": "astryx-theme-y2k",
    "name": "Y2K theme specification",
    "desc": "Y2K is a playful high-chroma theme with signature Periwinkle, Neon Green, airy",
    "cat": "design",
    "zh": "主题 y2k 规格",
    "bytes": 11376
  },
  {
    "id": "astryx-themes-readme",
    "name": "Theme specifications",
    "desc": "Theme specifications are the canonical owner for decisions that belong to one",
    "cat": "ds",
    "zh": "主题体系导览",
    "bytes": 2401
  },
  {
    "id": "astryx-tpl-architecture",
    "name": "<Surface> architecture",
    "desc": "This table is a review projection; the body below is authoritative.",
    "cat": "ds",
    "zh": "知识模板 架构记录",
    "bytes": 3353
  },
  {
    "id": "astryx-tpl-component-spec",
    "name": "<Name> component contract",
    "desc": "This table is a review projection; the body below is authoritative.",
    "cat": "ds",
    "zh": "知识模板 组件规格",
    "bytes": 9961
  },
  {
    "id": "astryx-tpl-design-spec",
    "name": "<Surface> design specification",
    "desc": "- DR1 — <principle>. <The experience MUST …>",
    "cat": "ds",
    "zh": "知识模板 设计规格",
    "bytes": 2669
  },
  {
    "id": "astryx-tpl-family-contract",
    "name": "<Family name> contract",
    "desc": "members is the candidate family's source of proposed membership while this",
    "cat": "ds",
    "zh": "知识模板 族契约",
    "bytes": 3055
  },
  {
    "id": "astryx-tpl-implementation-plan",
    "name": "<Change> implementation plan",
    "desc": "- [ ] <step>",
    "cat": "ds",
    "zh": "知识模板 实施计划",
    "bytes": 596
  },
  {
    "id": "astryx-tpl-module-spec",
    "name": "<PublicName> module contract",
    "desc": "This table is a review projection; the body below is authoritative.",
    "cat": "ds",
    "zh": "知识模板 模块规格",
    "bytes": 7484
  },
  {
    "id": "astryx-tpl-system-spec",
    "name": "<Change> system spec",
    "desc": "- <adjacent behavior this decision does not settle>",
    "cat": "ds",
    "zh": "知识模板 系统规格",
    "bytes": 2992
  },
  {
    "id": "astryx-tpl-theme-spec",
    "name": "<Theme name> theme specification",
    "desc": "accessibility methodology. This theme owns only its application: selected",
    "cat": "ds",
    "zh": "知识模板 主题规格",
    "bytes": 2595
  },
  {
    "id": "astryx-typography-hierarchy",
    "name": "Typography hierarchy design specification",
    "desc": "People should be able to triage a surface quickly because headings, body copy,",
    "cat": "design",
    "zh": "排版层级",
    "bytes": 4548
  },
  {
    "id": "astryx-user-states",
    "name": "User states design specification",
    "desc": "A pointer user holding or dragging an enabled control should receive immediate,",
    "cat": "design",
    "zh": "用户状态设计",
    "bytes": 8692
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
    "name": "超级峰的视频设计方法论",
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
    "name": "Authoring a design system",
    "desc": "Full authoring flow for setting up or importing a design system — the brand",
    "cat": "ds",
    "zh": "设计系统搭建全流程",
    "bytes": 22194
  },
  {
    "id": "design-system-preview",
    "name": "Design system → single-file preview.html",
    "desc": "Compile a design system directory (one with _ds_manifest.json and/or @dsCard-tagged .html cards) into a single self-contained, interactive preview.htm",
    "cat": "ds",
    "zh": "设计系统预览编译",
    "bytes": 5936
  },
  {
    "id": "emil-apple-design",
    "name": "apple-design",
    "desc": "Apple's approach to interface design and fluid, physical motion, translated for the web. Use when building or reviewing gesture-driven UI, spring anim",
    "cat": "design",
    "zh": "Apple 风格界面设计",
    "bytes": 22880
  },
  {
    "id": "emil-design-eng",
    "name": "Design Engineering",
    "desc": "This skill encodes Emil Kowalski's philosophy on UI polish, component design, animation decisions, and the invisible details that make software feel g",
    "cat": "design",
    "zh": "动效打磨方法论",
    "bytes": 27415
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
    "name": "Editable PPTX Export",
    "desc": "Export as PPTX (editable) Native text & shapes — editable in PowerPoint",
    "cat": "media",
    "zh": "导出可编辑 PPTX",
    "bytes": 9916
  },
  {
    "id": "export-as-pptx-screenshots",
    "name": "Screenshot PPTX Export",
    "desc": "Export as PPTX (screenshots) Flat images — pixel-perfect but not editable",
    "cat": "media",
    "zh": "导出截图版 PPTX",
    "bytes": 2985
  },
  {
    "id": "export-as-video",
    "name": "Export to Video",
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
    "id": "floatingui-arrow",
    "name": "arrow",
    "desc": "Provides positioning data for an arrow element (triangle or caret) inside the floating element, such that it appears to be pointing toward the center ",
    "cat": "proto",
    "zh": "箭头指向",
    "bytes": 7550
  },
  {
    "id": "floatingui-auto-placement",
    "name": "autoPlacement",
    "desc": "Chooses the placement that has the most space available automatically.",
    "cat": "proto",
    "zh": "自动选位",
    "bytes": 4114
  },
  {
    "id": "floatingui-auto-update",
    "name": "autoUpdate",
    "desc": "Automatically updates the position of the floating element when necessary to ensure it stays anchored.",
    "cat": "proto",
    "zh": "跟随重定位",
    "bytes": 8000
  },
  {
    "id": "floatingui-composite",
    "name": "Composite",
    "desc": "Creates a single tab stop whose items are navigated by arrow keys, which provides list navigation outside of floating element contexts.",
    "cat": "proto",
    "zh": "组合导航容器",
    "bytes": 3569
  },
  {
    "id": "floatingui-compute-position",
    "name": "computePosition",
    "desc": "Computes coordinates to position a floating element next to another element.",
    "cat": "proto",
    "zh": "定位计算",
    "bytes": 10067
  },
  {
    "id": "floatingui-custom-hooks",
    "name": "Custom Hooks",
    "desc": "You can build your own custom Hook to perform unique logic that is not currently exported by the library.",
    "cat": "proto",
    "zh": "自定义 Hook",
    "bytes": 1907
  },
  {
    "id": "floatingui-detect-overflow",
    "name": "detectOverflow",
    "desc": "Detects when the floating or reference element is overflowing a clipping container or custom boundary.",
    "cat": "proto",
    "zh": "溢出检测",
    "bytes": 4546
  },
  {
    "id": "floatingui-dialog",
    "name": "dialog",
    "desc": "A dialog is a floating element that displays information that requires immediate attention, appearing over the page content and blocking interactions ",
    "cat": "proto",
    "zh": "对话框指南",
    "bytes": 7627
  },
  {
    "id": "floatingui-flip",
    "name": "flip",
    "desc": "Changes the placement of the floating element to keep it in view.",
    "cat": "proto",
    "zh": "定位翻转",
    "bytes": 7269
  },
  {
    "id": "floatingui-floating-arrow",
    "name": "FloatingArrow",
    "desc": "import {Demo} from '../../lib/components/FloatingArrow';",
    "cat": "proto",
    "zh": "浮层箭头",
    "bytes": 6416
  },
  {
    "id": "floatingui-floating-delay-group",
    "name": "FloatingDelayGroup",
    "desc": "Provides context for a group of floating elements that should share a delay which temporarily becomes 1 ms after the first floating element of the gro",
    "cat": "proto",
    "zh": "延迟组",
    "bytes": 3212
  },
  {
    "id": "floatingui-floating-focus-manager",
    "name": "FloatingFocusManager",
    "desc": "Provides flexible modal or non-modal focus management for a floating element. Modal behavior is the default — focus is fully trapped inside the floati",
    "cat": "proto",
    "zh": "浮层焦点管理",
    "bytes": 8766
  },
  {
    "id": "floatingui-floating-list",
    "name": "FloatingList",
    "desc": "Provides the ability to create composable children APIs for list components",
    "cat": "proto",
    "zh": "浮层列表",
    "bytes": 2351
  },
  {
    "id": "floatingui-floating-overlay",
    "name": "FloatingOverlay",
    "desc": "Provides base styling for a fixed overlay element.",
    "cat": "proto",
    "zh": "浮层遮罩",
    "bytes": 1387
  },
  {
    "id": "floatingui-floating-portal",
    "name": "FloatingPortal",
    "desc": "Portals the floating element into a given container element — by default, outside of the app root and into the body.",
    "cat": "proto",
    "zh": "浮层传送",
    "bytes": 2256
  },
  {
    "id": "floatingui-floating-tree",
    "name": "FloatingTree",
    "desc": "Provides context for nested floating elements when they are not children of each other on the DOM.",
    "cat": "proto",
    "zh": "浮层层级树",
    "bytes": 3544
  },
  {
    "id": "floatingui-getting-started",
    "name": "Getting Started",
    "desc": "Floating UI is a library that helps you create \"floating\" elements such as tooltips, popovers, dropdowns, and more.",
    "cat": "proto",
    "zh": "快速上手",
    "bytes": 3516
  },
  {
    "id": "floatingui-hide",
    "name": "hide",
    "desc": "A data provider that allows you to hide the floating element in applicable situations.",
    "cat": "proto",
    "zh": "锚点隐藏检测",
    "bytes": 3649
  },
  {
    "id": "floatingui-inline",
    "name": "inline",
    "desc": "Improves positioning for inline reference elements that span over multiple lines.",
    "cat": "proto",
    "zh": "行内定位",
    "bytes": 2425
  },
  {
    "id": "floatingui-inner",
    "name": "Inner",
    "desc": "Positions the floating element such that an inner element inside of it is anchored to the reference element, while handling scroll and overflow behavi",
    "cat": "proto",
    "zh": "内部定位",
    "bytes": 5200
  },
  {
    "id": "floatingui-middleware",
    "name": "Middleware",
    "desc": "Objects that change the positioning of the floating element, executed in order as a queue.",
    "cat": "proto",
    "zh": "中间件机制",
    "bytes": 7671
  },
  {
    "id": "floatingui-misc",
    "name": "Misc",
    "desc": "Information, tips, and guidelines to help you use Floating UI.",
    "cat": "proto",
    "zh": "杂项技巧",
    "bytes": 4883
  },
  {
    "id": "floatingui-motivation",
    "name": "Motivation",
    "desc": "This page aims to explain why this new package was created.",
    "cat": "proto",
    "zh": "设计动机",
    "bytes": 3140
  },
  {
    "id": "floatingui-offset",
    "name": "offset",
    "desc": "Translates the floating element along the specified axes.",
    "cat": "proto",
    "zh": "间距偏移",
    "bytes": 5599
  },
  {
    "id": "floatingui-platform",
    "name": "Platform",
    "desc": "import {Canvas} from '../../lib/components/Canvas';",
    "cat": "proto",
    "zh": "平台适配层",
    "bytes": 6625
  },
  {
    "id": "floatingui-popover",
    "name": "popover",
    "desc": "A popover is an interactive mini-dialog floating element that displays information related to an anchor element when the element is clicked.",
    "cat": "proto",
    "zh": "气泡卡片指南",
    "bytes": 8105
  },
  {
    "id": "floatingui-react-examples",
    "name": "React Examples",
    "desc": "Learn how to build floating UI components.",
    "cat": "proto",
    "zh": "React 示例集",
    "bytes": 2651
  },
  {
    "id": "floatingui-react-utils",
    "name": "React Utils",
    "desc": "Merges an array of refs, returning a memoized callback ref or null.",
    "cat": "proto",
    "zh": "React 工具集",
    "bytes": 538
  },
  {
    "id": "floatingui-react",
    "name": "React",
    "desc": "import {ReactSelect} from '../../lib/components/PackageSelect';",
    "cat": "proto",
    "zh": "React 集成",
    "bytes": 8708
  },
  {
    "id": "floatingui-shift",
    "name": "shift",
    "desc": "Shifts the floating element to keep it in view.",
    "cat": "proto",
    "zh": "定位平移",
    "bytes": 4305
  },
  {
    "id": "floatingui-size",
    "name": "size",
    "desc": "Provides data to change the size of a floating element.",
    "cat": "proto",
    "zh": "尺寸自适应",
    "bytes": 6010
  },
  {
    "id": "floatingui-tooltip",
    "name": "tooltip",
    "desc": "A tooltip is a floating element that displays information related to an anchor element when it receives keyboard focus or the mouse hovers over it.",
    "cat": "proto",
    "zh": "工具提示指南",
    "bytes": 8276
  },
  {
    "id": "floatingui-tutorial",
    "name": "Tutorial",
    "desc": "import  as T from '../../lib/components/Tutorial';",
    "cat": "proto",
    "zh": "上手教程",
    "bytes": 13531
  },
  {
    "id": "floatingui-use-click",
    "name": "useClick",
    "desc": "Opens or closes the floating element when clicking the reference element.",
    "cat": "proto",
    "zh": "点击开合",
    "bytes": 2518
  },
  {
    "id": "floatingui-use-client-point",
    "name": "useClientPoint",
    "desc": "Positions the floating element at a given client point (x, y), usually generated by a mouse event. By default, the client's mouse position is automati",
    "cat": "proto",
    "zh": "光标跟随",
    "bytes": 2482
  },
  {
    "id": "floatingui-use-dismiss",
    "name": "useDismiss",
    "desc": "Closes the floating element when a dismissal is requested — by default, when the user presses the escape key or outside of the floating element with t",
    "cat": "proto",
    "zh": "外部关闭语义",
    "bytes": 6516
  },
  {
    "id": "floatingui-use-floating",
    "name": "useFloating",
    "desc": "The main Hook of the library that acts as a controller for all other Hooks and components.",
    "cat": "proto",
    "zh": "定位 Hook",
    "bytes": 14691
  },
  {
    "id": "floatingui-use-focus",
    "name": "useFocus",
    "desc": "Opens the floating element while the reference element has focus, like CSS :focus.",
    "cat": "proto",
    "zh": "焦点开合",
    "bytes": 1715
  },
  {
    "id": "floatingui-use-hover",
    "name": "useHover",
    "desc": "Opens the floating element while hovering over the reference element, like CSS :hover.",
    "cat": "proto",
    "zh": "悬停开合",
    "bytes": 7234
  },
  {
    "id": "floatingui-use-interactions",
    "name": "useInteractions",
    "desc": "A hook to merge or compose interaction event handlers together, preserving memoization.",
    "cat": "proto",
    "zh": "事件合并",
    "bytes": 4895
  },
  {
    "id": "floatingui-use-list-navigation",
    "name": "useListNavigation",
    "desc": "Adds arrow key-based navigation of a list of items, either using real DOM focus or virtual focus.",
    "cat": "proto",
    "zh": "列表键盘导航",
    "bytes": 10480
  },
  {
    "id": "floatingui-use-role",
    "name": "useRole",
    "desc": "Adds base screen reader props to the reference and floating elements for a given role.",
    "cat": "proto",
    "zh": "角色语义映射",
    "bytes": 5096
  },
  {
    "id": "floatingui-use-transition",
    "name": "useTransition",
    "desc": "Provides the ability to apply CSS transitions to a floating element, including correct handling of \"placement-aware\" transitions.",
    "cat": "proto",
    "zh": "浮层过渡",
    "bytes": 9345
  },
  {
    "id": "floatingui-use-typeahead",
    "name": "useTypeahead",
    "desc": "Provides a matching callback that can be used to focus an item as the user types, used in tandem with useListNavigation().",
    "cat": "proto",
    "zh": "首字母跳转",
    "bytes": 5071
  },
  {
    "id": "floatingui-virtual-elements",
    "name": "Virtual Elements",
    "desc": "Position a floating element relative to a custom reference area, useful for context menus, range selections, following the cursor, and more.",
    "cat": "proto",
    "zh": "虚拟锚点",
    "bytes": 3748
  },
  {
    "id": "floatingui-vue",
    "name": "Vue",
    "desc": "This package provides Vue bindings for @floating-ui/dom — a library that provides anchor positioning for a floating element to position it next to a g",
    "cat": "proto",
    "zh": "Vue 集成",
    "bytes": 8121
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
    "name": "Generate images",
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
    "name": "Handoff to Claude Code",
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
    "desc": "- 终渲60fps成片出来后、交付/混音前，跑一遍",
    "cat": "video",
    "zh": "AI 视频评审",
    "bytes": 2056
  },
  {
    "id": "huashu-animation-best-practices",
    "name": "Animation Best Practices · 正向动画设计语法",
    "desc": "你是一个研究过 Anthropic / Apple / Pentagram / Field.io 运动档案的 motion designer。",
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
    "desc": "- 有10张以上真实产出要同屏展示（PPT、App、网页、信息图）",
    "cat": "design",
    "zh": "苹果风展示页",
    "bytes": 8595
  },
  {
    "id": "huashu-audio-design-rules",
    "name": "音频设计规则 · huashu-design",
    "desc": "动画音频必须分两层独立设计，不能只做一层：",
    "cat": "video",
    "zh": "音频设计规则",
    "bytes": 6034
  },
  {
    "id": "huashu-brand-asset-protocol",
    "name": "核心资产协议（完整版）",
    "desc": "触发条件：任务涉及具体品牌——用户提了产品名/公司名/明确客户（Stripe、Linear、Anthropic、Notion、Lovart、DJI、自家公司等），不论用户是否主动提供了品牌资料。",
    "cat": "design",
    "zh": "品牌资产协议",
    "bytes": 8693
  },
  {
    "id": "huashu-camera-language",
    "name": "Camera Language · 运镜导演体系",
    "desc": "大多数 AI 生成动画的运镜是「特效制」思维：哪里能加 zoom 就加 zoom，镜头动得越多越「高级」。",
    "cat": "video",
    "zh": "镜头语言",
    "bytes": 12432
  },
  {
    "id": "huashu-cinematic-patterns",
    "name": "Cinematic Patterns · Workflow Demo 的 Best Practi",
    "desc": "当你需要做「演示一个工作流的 demo 动画」时（典型场景：skill 工作流、产品 onboarding、API 调用流程、agent 任务执行），有两种常见做法：",
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
    "desc": "先问「这个设计有没有一个idea」，再看做得好不好。为什么放第0位：执行是放大器，放大一个空洞的概念只会更空洞。",
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
    "desc": "0. 先看样张，再读文字。 每个分区有一张总览 assets/style-specimens/sheet-<web|ppt|info|app|east>.jpg，每条风格末尾的「样张」是单张大图（同名 .html 是源码，可以直接读 CSS 学它的做法）。文字描述告诉你它是什么，样张告诉你做到位是什",
    "cat": "design",
    "zh": "84 种风格库",
    "bytes": 51776
  },
  {
    "id": "huashu-design",
    "name": "花叔Design · Huashu-Design",
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
    "desc": "硬约束（违反任何一条，渲染结果不确定）：",
    "cat": "design",
    "zh": "GSAP 配方集",
    "bytes": 24906
  },
  {
    "id": "huashu-hero-animation-case-study",
    "name": "Gallery Ripple + Multi-Focus · 场景编排哲学",
    "desc": "通用 SaaS feature 动画、产品发布会、skill 推广、系列作品集展示——只要素材数量够、风格一致，这套结构几乎都能出效果。",
    "cat": "design",
    "zh": "首屏动画案例",
    "bytes": 7181
  },
  {
    "id": "huashu-hyperframes-backend",
    "name": "HyperFrames 渲染后端 · 选型边界与操作手册",
    "desc": "设计语言永远是甲方：叙事结构、easing 体系、SFX/BGM 双轨制照旧全部生效（animation-best-practices.md / audio-design-rules.md），HyperFrames 只是实现和渲染工具。GSAP 实现配方见 references/gsap-recip",
    "cat": "video",
    "zh": "HyperFrames 渲染后端",
    "bytes": 4819
  },
  {
    "id": "huashu-launch-film-director-notes",
    "name": "Launch Film 工作流：先写万字 director's notes，再做动画",
    "desc": "实战教训（2026-05-11 huashu-md-html v2.0 项目）：",
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
    "desc": "用户要求「为 huashu-md-html v2.0 制作 30 秒升级宣传片」时，主线程先产出了 v5 基线（Anthropic / Penguin Classics 出版社品位）。但用户认为可以做得更好，给了 critical instruction：",
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
    "desc": "- 封面图：2.35:1（900×383px 或 1200×510px）",
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
    "desc": "本文件是 launch-film-director-notes.md 的日常轻量版。launch film 万字导演稿是重装流程，日常动画不需要那套，但分镜这道工序本身不能省——省掉的结果是时间表思维（第几秒出什么元素），不是画面思维（这一帧长什么样）。",
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
    "desc": "拿到内容后按这个顺序推，每一步都由上一步决定，不许跳到「直接选个好看的字体」：",
    "cat": "design",
    "zh": "排版规范",
    "bytes": 10350
  },
  {
    "id": "huashu-ui-demo-animation",
    "name": "产品UI展示动画 Playbook",
    "desc": "这是本文件里最影响工作量的一个决策，两条路差一个量级。默认从最省的路径开始判断：",
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
    "desc": "PowerPoint 是 7 张幻灯片。我们做的是 1 段持续 X 分钟的电影。",
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
    "name": "Import from Figma (.fig)",
    "desc": "Import from Figma (.fig) Decode a local .fig file offline — mount it as a design reference for a project, cherry-pick components/frames as React code,",
    "cat": "import",
    "zh": "导入 .fig 设计稿",
    "bytes": 10741
  },
  {
    "id": "import-from-github",
    "name": "Import from GitHub",
    "desc": "Import from GitHub Use a GitHub repo as a design source — browse the real tree on demand, sparse-import only the paths you need into a scratch dir out",
    "cat": "import",
    "zh": "用 GitHub 仓库做设计源",
    "bytes": 2468
  },
  {
    "id": "import-from-html",
    "name": "Import from HTML/CSS",
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
    "name": "Landing Page Design",
    "desc": "Complete system for building high converting landing pages: intake questions, page structure, layout selection, conversion copywriting, SEO, plus stri",
    "cat": "design",
    "zh": "落地页设计系统",
    "bytes": 18750
  },
  {
    "id": "lemo-opuscar",
    "name": "Lemo-Opuscar",
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
    "name": "Slide writing guidelines",
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
    "id": "overflow-agents",
    "name": "Overflow Design drawings",
    "desc": "This project can use Overflow Design's icons, illustrations and isometric drawings through the Overflow MCP server at https://www.overflow.design/api/",
    "cat": "import",
    "zh": "Overflow 图标 MCP 协议",
    "bytes": 2064
  },
  {
    "id": "overflow-notion-cover-size",
    "name": "Notion Cover Size",
    "desc": "If you need one safe starting point, use a wide 1500x600 px cover image. It works for the banner slot, the header dimensions and safe desktop and mobi",
    "cat": "doc",
    "zh": "Notion 封面尺寸",
    "bytes": 3528
  },
  {
    "id": "overflow-notion-icon-size",
    "name": "Notion Icon Size",
    "desc": "If you need one safe answer, use a square transparent PNG around 280x280 px for direct Notion uploads, and keep a 24x24 SVG or Figma master for editin",
    "cat": "doc",
    "zh": "Notion 图标尺寸",
    "bytes": 3346
  },
  {
    "id": "overflow-notion-icons-figma",
    "name": "Notion Icons for Figma",
    "desc": "If your icon workflow starts in Figma, keep the library editable there first, then export the PNG or SVG you need. That gives you cleaner design-syste",
    "cat": "doc",
    "zh": "Notion 图标 Figma 流",
    "bytes": 4631
  },
  {
    "id": "overflow-notion-icons-upload",
    "name": "How to Add Icons to Notion",
    "desc": "The quick version: click the page icon above your Notion page title, choose upload, and add a transparent PNG. If you want the upload file to look cle",
    "cat": "doc",
    "zh": "Notion 图标上传流程",
    "bytes": 4366
  },
  {
    "id": "save-as-pdf",
    "name": "Save as PDF",
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
    "name": "Using a design system in a project",
    "desc": "Consume an existing design system from a regular design project — discover available systems, import a compiled copy into _ds/<slug>/, wire it up, see",
    "cat": "ds",
    "zh": "套用设计系统",
    "bytes": 18534
  },
  {
    "id": "vantage-design-system",
    "name": "Vantage 设计体系提炼",
    "desc": "从 Vantage（OpenWrt 仪表盘主题，GPL-3.0）提炼的受限设备界面设计方法——性能预算写成数字、数据三态、暗亮双主题不闪白、一个搜索框统治所有对象、顶栏降级顺序、契约先行。",
    "cat": "design",
    "zh": "受限设备界面设计提炼",
    "bytes": 4040
  },
  {
    "id": "vantage-luci-contract",
    "name": "LuCI 25.12 theme contract",
    "desc": "What the LuCI core expects from a theme on OpenWrt 25.12, and the places",
    "cat": "ds",
    "zh": "LuCI 主题契约",
    "bytes": 14069
  },
  {
    "id": "vantage-spec",
    "name": "Vantage — v1 specification",
    "desc": "Status: implemented (v1, released as 1.0.x). This is the contract",
    "cat": "design",
    "zh": "Vantage 设计规格",
    "bytes": 40315
  },
  {
    "id": "vercel-web-design-guidelines",
    "name": "web-design-guidelines",
    "desc": "Review UI code for Web Interface Guidelines compliance. Use when asked to \"review my UI\", \"check accessibility\", \"audit design\", \"review UX\", or \"chec",
    "cat": "design",
    "zh": "Web 界面审查技能",
    "bytes": 1231
  },
  {
    "id": "vercel-web-interface-guidelines",
    "name": "Web Interface Guidelines",
    "desc": "Review UI code for Vercel Web Interface Guidelines compliance",
    "cat": "design",
    "zh": "界面规范审查规则",
    "bytes": 8015
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
