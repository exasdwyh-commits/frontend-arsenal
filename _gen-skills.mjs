import fs from 'node:fs';
import path from 'node:path';

const DIR = 'skills';
const META = {
  'frontend-design':          ['design', '前端美学方向'],
  'hi-fi-design':             ['design', '高保真成品稿'],
  'wireframe':                ['design', '线框与故事板'],
  'website-landing-page':     ['design', '官网与落地页'],
  'impeccable':               ['design', '设计总控 18 命令'],
  'landing-page-design':      ['design', '落地页设计系统'],
  'design-feedback':          ['design', '设计评审反馈'],
  'options-stack':            ['design', '多方案并排展示'],
  'something-cool':           ['design', '惊艳小创意'],
  'create-design-system':     ['ds', '创建设计系统'],
  'use-design-system':        ['ds', '套用设计系统'],
  'design-system-authoring-guide': ['ds', '设计系统搭建全流程'],
  'design-system-preview':    ['ds', '设计系统预览编译'],
  'design-components':        ['ds', '流式设计组件'],
  'interactive-prototype':    ['proto', '可交互原型'],
  'mobile-prototype':         ['proto', '移动端原型'],
  'make-tweakable':           ['proto', '给设计加调节控件'],
  'low-level-tweaks-api':     ['proto', 'Tweaks 面板直通 API'],
  'tweaks-protocol':          ['proto', 'Tweaks 宿主协议'],
  'ask-the-user':             ['proto', '设计提问页'],
  'handoff-to-claude-code':   ['proto', '开发交接包'],
  'data-visualization':       ['data', '数据可视化图表'],
  'data-science':             ['data', '产品指标洞察'],
  'maps-geography':           ['data', '真实地理地图'],
  'make-a-deck':              ['doc', 'HTML 幻灯片'],
  'make-a-doc':               ['doc', '可打印文档'],
  'flier':                    ['doc', '单页印刷品'],
  'trifold-brochure':         ['doc', '三折页宣传册'],
  'html-email':               ['doc', 'HTML 邮件'],
  'save-as-pdf':              ['doc', '导出打印 PDF'],
  'save-as-standalone-html':  ['doc', '存为离线单文件'],
  'google-slides-safe':       ['doc', 'Google Slides 兼容'],
  'speaker-notes':            ['doc', '演讲者备注'],
  'social-media-content':     ['doc', '社媒内容与campaign'],
  '3d-object':                ['media', 'three.js 3D 模型'],
  'watercolor-illustration':  ['media', '代码画水彩'],
  'generate-images':          ['media', '生成图像素材'],
  'animated-video':           ['media', '时间轴动画视频'],
  'exportable-video':         ['media', '可导出动画视频'],
  'export-as-video':          ['media', '渲染成 .mp4'],
  'export-as-pptx-editable':  ['media', '导出可编辑 PPTX'],
  'export-as-pptx-screenshots':['media', '导出截图版 PPTX'],
  // ---- 视频与影像（lemo-opuscar + chaojifeng-video-design 30 个） ----
  'lemo-opuscar':                       ['video', '纯代码短片导演'],
  'chaojifeng-video-design':            ['video', '视频设计方法论总纲'],
  'chaojifeng-asset-motion-direction':  ['video', '素材运动方向'],
  'chaojifeng-creative-direction':      ['video', '创意方向'],
  'chaojifeng-design-method':           ['video', '设计方法'],
  'chaojifeng-director-method':         ['video', '导演方法'],
  'chaojifeng-domain-standards':        ['video', '领域标准'],
  'chaojifeng-explainer-narration':     ['video', '解说词'],
  'chaojifeng-expression-method':       ['video', '表情与表演'],
  'chaojifeng-knowledge-music-direction':['video', '知识音乐方向'],
  'chaojifeng-knowledge-pack':          ['video', '知识包'],
  'chaojifeng-knowledge-rap-direction': ['video', '知识 Rap 方向'],
  'chaojifeng-knowledge-visualization': ['video', '知识可视化'],
  'chaojifeng-launch-film-grammar':     ['video', '发布会影片语法'],
  'chaojifeng-layered-reveal':          ['video', '分层揭示'],
  'chaojifeng-music-direction':         ['video', '音乐方向'],
  'chaojifeng-music-driven-world':      ['video', '音乐驱动世界'],
  'chaojifeng-music-event-model':       ['video', '音乐事件模型'],
  'chaojifeng-music-shot-choreography': ['video', '音乐镜头编排'],
  'chaojifeng-opening-design':          ['video', '开场设计'],
  'chaojifeng-poetry-music-world':      ['video', '诗歌音乐世界'],
  'chaojifeng-product-expression':      ['video', '产品表达'],
  'chaojifeng-product-music-story':     ['video', '产品音乐故事'],
  'chaojifeng-reference-film-study':    ['video', '参考片研究'],
  'chaojifeng-review-and-revision':     ['video', '评审与修改'],
  'chaojifeng-scene-tool-composition':  ['video', '场景工具组合'],
  'chaojifeng-shot-production':         ['video', '镜头生产'],
  'chaojifeng-song-visual-direction':   ['video', '歌曲视觉方向'],
  'chaojifeng-sound-and-rhythm':        ['video', '声音与节奏'],
  'chaojifeng-subtitle-direction':      ['video', '字幕导演与配色'],
  'chaojifeng-visual-emphasis':         ['video', '视觉强调'],
  'import-from-figma':        ['import', '导入 .fig 设计稿'],
  'import-from-github':       ['import', '用 GitHub 仓库做设计源'],
  'import-from-html':         ['import', '导入现有 HTML/CSS'],
  'claude-api-in-prototypes': ['import', '原型里调用 Claude'],
  'experiment-workflow':      ['import', '设计实验工作流'],
  // ---- huashu-design（alchaincyf/huashu-design，MIT，41 个） ----
  'huashu-design':                       ['design', '花叔设计总控 3.0'],
  'huashu-design-styles':                ['design', '84 种风格库'],
  'huashu-typography':                   ['design', '排版规范'],
  'huashu-directions':                   ['design', '三方向选稿流程'],
  'huashu-critique-guide':               ['design', '设计评审指南'],
  'huashu-design-context':               ['design', '设计上下文'],
  'huashu-materials':                    ['design', '材质与表面'],
  'huashu-scene-templates':              ['design', '场景模板'],
  'huashu-experience':                   ['design', '交互体验细则'],
  'huashu-tweaks-system':                ['design', '外观微调系统'],
  'huashu-verification':                 ['design', '交付前验证'],
  'huashu-workflow':                     ['design', '设计工作流'],
  'huashu-content-guidelines':           ['design', '文案内容规范'],
  'huashu-brand-asset-protocol':         ['design', '品牌资产协议'],
  'huashu-apple-gallery-showcase':       ['design', '苹果风展示页'],
  'huashu-multi-perspective-case-study': ['design', '多方向并行案例'],
  'huashu-animation-best-practices':     ['design', '动画最佳实践'],
  'huashu-animation-pitfalls':           ['design', '动画避坑清单'],
  'huashu-animations':                   ['design', '动效规则'],
  'huashu-gsap-recipes':                 ['design', 'GSAP 配方集'],
  'huashu-hero-animation-case-study':    ['design', '首屏动画案例'],
  'huashu-ui-demo-animation':            ['design', 'UI 演示动画'],
  'huashu-app-prototype':                ['proto', 'App 原型规范'],
  'huashu-module-web':                   ['proto', '网页模块'],
  'huashu-module-motion':                ['proto', '动画模块'],
  'huashu-module-deck':                  ['proto', '幻灯模块'],
  'huashu-module-infographic':           ['proto', '信息图模块'],
  'huashu-react-setup':                  ['proto', 'React 环境配置'],
  'huashu-slide-decks':                  ['doc', '幻灯片设计'],
  'huashu-editable-pptx':                ['doc', '可编辑 PPTX'],
  'huashu-pptx-from-rendered-html':      ['doc', 'HTML 渲染转 PPTX'],
  'huashu-camera-language':              ['video', '镜头语言'],
  'huashu-cinematic-patterns':           ['video', '电影化手法'],
  'huashu-storyboard-basics':            ['video', '分镜基础'],
  'huashu-launch-film-director-notes':   ['video', '发布片导演笔记'],
  'huashu-ai-video-review':              ['video', 'AI 视频评审'],
  'huashu-audio-design-rules':           ['video', '音频设计规则'],
  'huashu-sfx-library':                  ['video', '音效库'],
  'huashu-voiceover-pipeline':           ['video', '配音流水线'],
  'huashu-video-export':                 ['video', '视频导出'],
  'huashu-hyperframes-backend':          ['video', 'HyperFrames 渲染后端'],
  // ---- Overflow Design（overflow.design，公开文档，5 个） ----
  'overflow-agents':              ['import', 'Overflow 图标 MCP 协议'],
  'overflow-notion-icon-size':    ['doc', 'Notion 图标尺寸'],
  'overflow-notion-cover-size':   ['doc', 'Notion 封面尺寸'],
  'overflow-notion-icons-upload': ['doc', 'Notion 图标上传流程'],
  'overflow-notion-icons-figma':  ['doc', 'Notion 图标 Figma 流'],
};
const CATS = {
  design: '设计与美学',
  ds: '设计系统',
  proto: '原型与交互',
  data: '数据与地图',
  doc: '文档与印刷',
  media: '媒体与导出',
  video: '视频与影像',
  import: '导入与研究',
};

const files = fs.readdirSync(DIR).filter(f => f.endsWith('.md'));
const out = [];
for (const f of files.sort()) {
  const id = f.replace(/\.md$/, '');
  const raw = fs.readFileSync(path.join(DIR, f), 'utf8');
  let name = id, desc = '';
  const fm = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (fm) {
    const grab = (key) => {
      const q = fm[1].match(new RegExp(key + ':\\s*"([^"]+)'));
      if (q) return q[1];
      const u = fm[1].match(new RegExp(key + ':\\s*([^\\r\\n]+)'));
      return u ? u[1] : null;
    };
    const n = grab('name');
    const d = grab('description');
    if (n) name = n.replace(/^"|"$/g, '');
    if (d) desc = d.replace(/^"|"$/g, '').replace(/\\n/g, ' ');
  }
  // 无 frontmatter 的方法文档：取首个一级标题当 name，首个正文段落当 desc
  if (!fm) {
    const h = raw.match(/^#\s+(.+)$/m);
    if (h) name = h[1].trim().slice(0, 48);
    if (!desc) {
      const lines = raw.split(/\r?\n/);
      let seenH = false, quote = '';
      for (const line of lines) {
        const t = line.trim();
        if (!t) continue;
        if (t.startsWith('#')) { if (seenH) break; seenH = true; continue; }
        if (t.startsWith('```')) continue;
        // 横线/表格跳过继续扫；引言块记为备选（huashu 等文档开头是 --- 与 >）
        if (t.startsWith('---') || t.startsWith('|')) continue;
        const clean = (s) => s.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/[*`]/g, '');
        if (t.startsWith('>')) { if (!quote) quote = clean(t.replace(/^>\s?/, '')); continue; }
        desc = clean(t);
        break;
      }
      if (!desc) desc = quote;
    }
  }
  const meta = META[id];
  if (!meta) { console.error('NO META for', id); continue; }
  if (desc.length > 150) desc = desc.slice(0, 150);
  out.push({ id, name, desc, cat: meta[0], zh: meta[1], bytes: raw.length });
}
const covered = new Set(out.map(o => o.id));
for (const k of Object.keys(META)) if (!covered.has(k)) console.error('MISSING FILE for meta:', k);

const json = 'export const CATS = ' + JSON.stringify(CATS) + ';\n\nexport const SKILLS = ' + JSON.stringify(out, null, 2) + ';\n';
fs.writeFileSync('src/skills-data.js', json, 'utf8');
console.log('wrote src/skills-data.js —', out.length, 'skills,', json.length, 'bytes');
const byCat = {};
for (const o of out) byCat[o.cat] = (byCat[o.cat] || 0) + 1;
console.log(JSON.stringify(byCat));
console.log('empty desc:', out.filter(o => !o.desc).length, '| empty name:', out.filter(o => !o.name).length);
