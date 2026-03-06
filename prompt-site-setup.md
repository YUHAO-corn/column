# 专栏站点搭建任务

## 项目目录
`/Users/godcorn/cursor/column/`

## 任务目标
从零搭建一个展示 AI 产品决策过程的专栏网站。

## 关键文档
- 站点搭建指南：`/Users/godcorn/cursor/column/SITE_SETUP_GUIDE.md`
- 内容整理指南：`/Users/godcorn/cursor/column/CONTENT_CLEANUP_GUIDE.md`（先参考这个了解内容结构）

## 设计参考
风格参考：`/Users/godcorn/cursor/portfolio-deskhand/qa.html`

配色：
- 背景：#f4efe6（米色）
- 文字：#1f2522（深墨绿）
- 强调色：#0b6a60（青绿）
- 卡片：#fff9f0（暖白）

字体：Fraunces（标题） + IBM Plex Sans / Noto Sans SC（正文）

## 核心功能
1. 首页顶部统计仪表盘：开发天数、Commit数、代码行数、QA数（数据从 Deskhand 仓库的 git 统计获取）
2. 主题列表页：10 个主题卡片
3. QA 详情页：展示单个决策的完整内容

## 技术栈
- Astro + Tailwind
- 部署到 GitHub Pages

## 执行步骤
1. 初始化 Astro 项目
2. 配置 Tailwind
3. 创建页面结构
4. 实现统计仪表盘（从 Deskhand 仓库抓取 git 数据）
5. 接入已整理的内容文档（内容在 `column/src/content/` 下）
6. 本地测试 `npm run dev`
7. 部署

先读 `/Users/godcorn/cursor/column/SITE_SETUP_GUIDE.md` 了解完整细节。
