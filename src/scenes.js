// 场景标签是选型建议；未人工标注的效果不自动推断，避免误导。
const entries = {
  'magnetic-btn': { places: ['按钮'], goals: ['交互反馈'], triggers: ['悬停'], projects: ['品牌官网'] },
  'button-morph': { places: ['按钮'], goals: ['交互反馈'], triggers: ['点击'], projects: ['品牌官网', '管理后台'] },
  'ripple': { places: ['按钮'], goals: ['交互反馈'], triggers: ['点击'], projects: ['管理后台'] },
  'tab-ink': { places: ['导航'], goals: ['交互反馈'], triggers: ['点击'], projects: ['管理后台'] },
  'spring-card': { places: ['卡片'], goals: ['交互反馈'], triggers: ['悬停'], projects: ['品牌官网'] },
  'tilt-3d': { places: ['卡片'], goals: ['交互反馈'], triggers: ['悬停'], projects: ['品牌官网', '作品集'] },
  'spring-modal': { places: ['弹窗'], goals: ['内容呈现'], triggers: ['点击'], projects: ['管理后台'] },
  'popup-rise': { places: ['弹窗'], goals: ['内容呈现'], triggers: ['点击'], projects: ['管理后台'] },
  'skeleton-shimmer': { places: ['卡片', '列表', '表格'], goals: ['加载状态'], triggers: ['持续播放'], projects: ['管理后台', 'AI 产品'] },
  'thinking-dots': { places: ['对话'], goals: ['加载状态'], triggers: ['持续播放'], projects: ['AI 产品'] },
  'count-up': { places: ['数据看板'], goals: ['展示数据'], triggers: ['数据更新'], projects: ['管理后台'] },
  'bar-grow': { places: ['图表', '数据看板'], goals: ['展示数据'], triggers: ['数据更新'], projects: ['管理后台'] },
  'donut-ring': { places: ['图表', '数据看板'], goals: ['展示数据'], triggers: ['数据更新'], projects: ['管理后台'] },
  'sparkline': { places: ['图表', '数据看板'], goals: ['展示数据'], triggers: ['数据更新'], projects: ['管理后台'] },
  'aurora': { places: ['背景', '首屏'], goals: ['营造氛围'], triggers: ['持续播放'], projects: ['品牌官网', '作品集'] },
  'gradient-flow': { places: ['背景', '首屏'], goals: ['营造氛围'], triggers: ['持续播放'], projects: ['品牌官网', '作品集'] },
  'parallax-depth': { places: ['首屏'], goals: ['营造氛围'], triggers: ['滚动'], projects: ['品牌官网', '作品集'] },
  'scroll-scrub': { places: ['首屏'], goals: ['内容呈现'], triggers: ['滚动'], projects: ['品牌官网'] },
  'stagger-in': { places: ['列表', '卡片'], goals: ['内容呈现'], triggers: ['页面加载'], projects: ['品牌官网', '管理后台'] },
  'grid-stagger': { places: ['列表', '卡片'], goals: ['内容呈现'], triggers: ['页面加载'], projects: ['品牌官网'] },
};

export const sceneFor = fx => fx.scenes || entries[fx.id] || null;
export const dimensions = [
  ['places', '界面位置'], ['goals', '使用目的'], ['triggers', '触发方式'], ['projects', '项目类型']
];

export function scenePreview(id, variant) {
  if (id === 'skeleton-shimmer') {
    const rows = variant === 'table' ? 4 : 3;
    return `<div class="scene-demo"><div class="scene-demo-head"><b>${variant === 'table' ? '项目列表' : '最近动态'}</b><span>加载中</span></div>${Array.from({length: rows}, () => `<div class="scene-row">${variant === 'list' ? '<i class="scene-avatar shimmer"></i>' : ''}<i class="scene-line shimmer"></i><i class="scene-line short shimmer"></i>${variant === 'table' ? '<i class="scene-line short shimmer"></i>' : ''}</div>`).join('')}</div>`;
  }
  if (id === 'magnetic-btn') return '<div class="scene-demo brand-demo"><small>DESIGN SYSTEM</small><b>让每次交互更有温度。</b><div class="scene-effect"></div></div>';
  return '';
}
