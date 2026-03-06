---
title: "InputToolbar 布局重构 Q&A 记录"
topic: "ui-interaction"
---

# InputToolbar 布局重构 Q&A 记录

> 记录 InputToolbar 布局调整的设计决策。

---

## Q0：为什么要改？

**结论：InputToolbar 重构按“资源层、配置层、交互层”三层重新分组。**

按更加清晰的功能层面划分：
- 资源层：文件、剪贴板、技能、MCP — 用户视角：我要添加什么内容？
- 配置层：Workspace、Permission、Model — 用户视角：我要智能体做到什么水平？
- 交互层：playground, this or that — 用户视角：我要怎么和智能体交互？

---

## Q1: 整体布局怎么调整？

**结论：原布局：所有按钮都在输入框内底部工具栏，左图标右文字一字排开。**

原布局：所有按钮都在输入框内底部工具栏，左图标右文字一字排开。

新布局：
- **输入框内**：只放直接影响「这条消息」的操作 — 附件/interact + 发送
- **输入框外下方**：放 agent 级配置 — Workspace、Permission、Model

---

## Q2: [+] 按钮点击后弹什么？

**结论：“+”按钮采用一级菜单 + 二级子面板结构。**

一级菜单：
```
Attach
  Upload files          （直接打开文件选择器）
  Clipboard history  >  （进入二级面板）
────────-
Skills
  Skills             >  （进入二级面板）
────────-
MCP
  MCP Connections    >  （进入二级面板）
```

点击带 `>` 的项进入二级子面板，子面板左上角有 `<` 返回按钮。

---

## Q3: Clipboard history 子面板长什么样？

**结论：改为 + 菜单的二级子面板，风格统一，更紧凑。**

相比之前的独立大面板，改为 `+` 菜单的二级子面板，风格统一，更紧凑。缩略图更小，一行展示标题即可。

---

## Q4: Skills 子面板长什么样？

**结论：显示已安装的 skills 列表，每个可切换开关，以及安装新 skill 的入口。**

显示已安装的 skills 列表，每个可切换开关，以及安装新 skill 的入口。

---

## Q5: MCP Connections 子面板长什么样？

**结论：MCP 是外部服务连接(Figma、Linear、GitHub 等)，通过 MCP 协议提供工具。**

MCP 是外部服务连接（Figma、Linear、GitHub 等），通过 MCP 协议提供工具。与 Skills（内置插件系统）是不同的概念，UI 上分开展示。

---

## Q6: [/] interact 按钮弹什么？

**结论：Pick a Style，This or That。**

- Pick a Style
- This or That

---

## Q7: 底部配置栏的布局？

**结论：Workspace：工作目录选择，Permission：权限模式(Ask / Auto)。**

- Workspace：工作目录选择
- Permission：权限模式（Ask / Auto）
- Model：模型选择

每个都有向上弹出的选择面板，和输入框内的弹窗风格一致。

---

## Q8: 弹窗定位规则？

**结论：弹窗按触发按钮分组定位：输入区按钮上弹，配置区按钮上弹并对齐触发点。**

- 输入框内按钮（+、/）→ 弹窗从输入框上方弹出，左对齐到按钮位置
- 配置栏按钮（Workspace、Permission）→ 弹窗从配置栏上方弹出，左对齐
- Model → 弹窗从配置栏上方弹出，右对齐

---

## Q9: InputToolbar 弹窗组件需要遵循哪些规范？

**结论：围绕「InputToolbar弹窗组件」，最终方案按文中取舍执行。**

组件清单：
- PopupContainer — 外层容器
- PopupHeader — 标题行，统一为：可选返回按钮 + 标题（13px semibold）
- PopupSectionLabel — 分组标签（10px uppercase）
- PopupItem — 列表项（icon 16px + label + 可选 hint/箭头）
- PopupDivider — 分隔线

---

## Q10: InputToolbar 当前有哪些需要修复的视觉一致性问题？

**结论：优先修复字号、标题风格、搜索框冗余与组件间距不一致问题。**

- **配置栏文字太小** — 现状 11px，改为 13px
- **Workspace 弹窗标题风格不统一** — 改为统一的 13px 标题行
- **Interact 弹窗标题风格不统一** — 改为统一的 13px 标题行
- **Model 弹窗不需要搜索框** — 去掉搜索框，直接列表
- **Permission 没有弹窗** — 改为弹窗选择，每项带简短说明
- **各弹窗间距/图标不统一** — 全部使用共享组件
