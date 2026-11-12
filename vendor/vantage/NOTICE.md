# NOTICE — Vantage（仅前端效果部分）

本目录是 **第三方上游项目的原样副本**，不属于「前端武器库」的原创内容。

| 项 | 值 |
|---|---|
| 上游 | https://github.com/anothaDev/luci-theme-vantage |
| 作者 | anothaDev |
| 收录版本 | `ed6be0a`（v1.0.19） |
| 授权 | **GPL-3.0-or-later**（见同目录 `LICENSE`）|
| 项目主页 | https://anothadev.github.io/luci-theme-vantage/ |

## 收录范围：只留前端效果

上游是一个完整的主题 + 仪表盘工程，含后端渲染、权限、配置与业务逻辑。
本库只收录**看得见的部分**——样式与视觉资源；影响代码的部分一律不收。

```
themes/
  vantage.css     191 KB  最终主题样式（令牌体系、组件、亮暗双主题）
  app.css         109 KB  仪表盘应用样式（图表、卡片、实时状态）
  graphite.css    108 KB  暗色主题原型样式
  paper.css        95 KB  亮色主题原型样式
  icons.css         7 KB  图标样式
  icons/dark/*.svg  29 个 暗色图标
  icons/light/*.svg 29 个 亮色图标
```

**未收录**（与"前端效果"无关，且会牵出许可与运行环境的牵连）：
上游的全部 JavaScript（菜单脚本、数据模型、视图、格式化）、
ucode 服务端模板（`.ut`）、rpcd 插件与 ACL、配置与打包文件、翻译文件。

## 授权处理

这些文件保持 **GPL-3.0-or-later**，与本仓库其余部分（MIT）不同。
上游是 copyleft 许可，因此：

- 本目录内的文件仍以 GPL-3.0-or-later 提供，**未作任何修改**；
- 本仓库不因此整体变成 GPL —— 采用业界常见的 **per-file licensing**（逐文件授权），
  具体见仓库根目录的 `LICENSE`；
- 引用、阅读、二次分发这些文件时，请遵守 GPL-3.0-or-later 的条款。

## 为什么值得看

一套在 **128 MB 设备上、无 CDN、无网络字体、首屏 1 秒内** 跑起来的主题系统，
样式层面能拆出来的东西：

- **令牌体系**：颜色、间距、圆角、阴影全部走 CSS 变量，
  亮暗两套各自完整定义令牌，不在亮色基础上覆盖暗色；
- **组件层**：rail / top bar / palette / tabs / indicators / dialog 的完整样式；
- **图表层**：实时折线、填充渐变、多序列配色（`--v-chart-1..4`）；
- **图标层**：同一套图标的暗/亮两版，尺寸与描边统一。

方法层的提炼见 `skills/vantage-design-system.md`（本仓库原创），
设计规格原文见 `skills/vantage-spec.md`，主题契约见 `skills/vantage-luci-contract.md`。
