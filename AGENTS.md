# Agent 前端武器库

本仓库的主要调用方是编程 Agent。先阅读 `agent/README.md`，再通过 `node scripts/agent-catalog.mjs` 检索并读取具体资源，人工页面用于预览与审核。开始查询前执行 `npm run agent:check`；过期后执行 `npm run agent:build`。未知支持情况不能提升为已验证能力；现有演示、方法文档和远程参考不能声称是已验证的整页模板。

按使用协议完成需求澄清、约束筛选、源码阅读、组合规划与验证。不要只凭资源名称决策。索引为生成文件，不手工编辑；内容源仍在 src 和 skills。

## CodeGraph

如运行环境提供 codegraph MCP，结构查询优先使用：context 获取上下文，explore 批量阅读源代码，trace 追踪流程，search 查符号，impact 查影响。不要通过 grep 重复验证新鲜索引。遇到 pending sync 时只读取已修改文件。没有可用的 CodeGraph 工具时使用本地文件与 Agent 目录。

@C:\Users\exasd\.codex\RTK.md
