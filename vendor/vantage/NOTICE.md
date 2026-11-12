# NOTICE — Vantage

本目录是 **第三方上游项目的原样副本**，不属于「前端武器库」的原创内容。

| 项 | 值 |
|---|---|
| 上游 | https://github.com/anothaDev/luci-theme-vantage |
| 作者 | anothaDev |
| 收录版本 | `ed6be0a`（v1.0.19） |
| 授权 | **GPL-3.0-or-later**（见上游 `LICENSE`） |
| 项目主页 | https://anothadev.github.io/luci-theme-vantage/ |

## 目录内容

```
luci-theme-vantage/    主题包：ucode 模板、CSS、图标、menu-vantage.js（命令面板 / 图标轨 / 顶栏）
luci-app-vantage/      仪表盘 app：数据模型、视图、格式化、rpcd 插件
prototypes/graphite/    暗色主题原型：graphite.css（106 KB）
prototypes/paper/       亮色主题原型：paper.css（94 KB）
prototypes/app/         仪表盘应用原型：app.css（67 KB）
```

## 授权处理

这些文件保持 **GPL-3.0-or-later**，与本仓库其余部分（MIT）不同。
上游是 copyleft 许可，因此：

- 本目录内的文件仍以 GPL-3.0-or-later 提供，**未作任何修改**；
- 本仓库不因此整体变成 GPL —— 采用业界常见的 **per-file licensing**（逐文件授权），
  具体见仓库根目录的 `LICENSE`；
- 引用、阅读、二次分发这些文件时，请遵守 GPL-3.0-or-later 的条款。

## 为什么收录

这是一个**真实生产级界面系统**的完整实现，可拆的点：

- 三套并行的主题 CSS（暗 / 亮 / 应用），令牌体系与暗亮双主题策略；
- 116 KB 的 `menu-vantage.js`：图标轨、面包屑、Ctrl+K 命令面板、状态指示器；
- 仪表盘的实时数据模型与图表层；
- 面向 **128 MB 设备、无 CDN、无网络字体、首屏 1 秒内** 的性能预算与降级策略。

方法层的提炼见 `skills/vantage-design-system.md`（本仓库原创），
设计规格原文见 `skills/vantage-spec.md`。

## 与上游的差异

仅删除 `prototypes/*/htdocs/luci-static/*/icons/` 下的图标副本
（与 `luci-theme-vantage` 里的图标重复），其余为原样副本。
