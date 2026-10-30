const loading = document.querySelector('#loading');
const projects = document.querySelector('#projects');
const status = document.querySelector('#status');
let timer;
function load() {
  clearTimeout(timer);
  projects.replaceChildren();
  loading.hidden = false;
  status.textContent = '正在加载项目…';
  timer = setTimeout(() => {
    const data = [['设计系统', '组件与设计规范'], ['客户门户', '客户服务与资料'], ['数据看板', '业务指标与趋势']];
    const fragment = document.createDocumentFragment();
    data.forEach(([title, description], index) => {
      const item = document.createElement('li');
      item.style.setProperty('--i', index);
      const name = document.createElement('strong');
      name.textContent = title;
      const detail = document.createElement('span');
      detail.textContent = description;
      item.append(name, detail);
      fragment.append(item);
    });
    projects.append(fragment);
    loading.hidden = true;
    status.textContent = `已加载 ${data.length} 个项目。`;
  }, 800);
}
document.querySelector('#reload').addEventListener('click', load);
load();
