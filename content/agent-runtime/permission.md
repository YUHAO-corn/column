---
title: "权限系统设计"
topic: "agent-runtime"
---

# 权限系统设计

> 记录权限系统的设计决策，包括权限模式、确认范围、弹窗展示等核心交互。

---

## Q1: 需要支持哪些权限模式？

**结论：围绕「需要支持哪些权限模式」，最终方案按文中取舍执行。**

讨论过的方案：
- A: ask + allow-all（两档）
- B: ask + allow-all + "Always Allow" 单工具记忆
- C: 三档（safe/ask/allow-all）
- D: 基于风险等级自动分类

最终选择只做 ask 模式。目标用户包含非技术人群，让他们去理解 "Always Allow Bash" 是什么意思有点强人所难。allow-all 风险太大，先不做。后面如果用户觉得弹窗太烦再加。

---

## Q2: 哪些操作需要弹窗确认？

**结论：需要弹窗确认的操作是 Bash、Edit 和 Write。**

需要确认：
- **Bash** — 风险最高，能执行任何命令
- **Edit** — 修改现有文件，可能覆盖重要内容
- **Write** — 创建或覆盖文件，有不可逆后果

自动通过：
- **Read** — 只读，无副作用
- **Glob / Grep** — 只搜索，无副作用
- **WebFetch / WebSearch** — 只浏览，无副作用

---

## Q3: 弹窗里怎么展示操作内容？

**结论：弹窗展示“原始命令 + 人话说明”，兼顾技术与非技术用户。**

讨论过的方案：
- A: 只显示原始命令（如 `bash: ls -la`）
- B: AI 生成人话描述（如「要查看文件列表」）
- C: 原始命令 + 简短描述

选 C，兼顾技术和非技术用户。示例：
- `bash: ls -la`（查看文件列表）
- `edit: 某个目标文件`（编辑文件）
- `write: report.docx`（创建文件）

---

## Q4: 弹窗按钮有哪些？

**结论：不做 "Always Allow"、不做 "Accept All"。**

不做 "Always Allow"、不做 "Accept All"。保持最简。模式切换放在其他地方（InputToolbar），弹窗本身只负责即时决策。

---

## Q5: 用户拒绝后 agent 怎么办？

**结论：用户拒绝后由 agent 接收拒绝结果，并自行降级或解释下一步。**

SDK 的 PreToolUse hook 返回拒绝结果后，agent 收到"操作被用户拒绝"的反馈，自己决定下一步：换个方法完成任务，或者跟用户解释为什么需要这个操作。这是 Claude Code 等产品的标准做法。

---

## 迭代：加回 allow-all 模式

> 背景：实现完 ask-only 后，重新讨论认为技术用户需要快捷模式。

### Q6: 是否需要 allow-all 模式？

需要。加回 allow-all 模式。

原始决策（Q1）是只做 ask 模式，理由是 YAGNI + 非技术用户安全。但实际考虑后，技术用户对速度的需求很强，每次 Edit/Write 都弹窗会严重打断心流。

修正后的模式：
- **ask**（默认）：Bash/Edit/Write 全部弹窗确认
- **allow-all**：大部分操作自动放行，仅明确的删除命令仍弹窗

### Q7: allow-all 模式下哪些操作仍需拦截？

只拦截明确的删除类 bash 命令。

检测方式：提取 bash 命令的第一个词（base command），匹配删除命令黑名单：`rm`、`rmdir`、`unlink`、`shred`。Edit/Write 在 allow-all 下全部放行，修改文件 ≠ 删除文件，风险可接受。

已知局限：`find . -delete`、`git clean -f`、`xargs rm` 等间接删除无法检测。V1 先覆盖 90% 场景，后续可加更多模式匹配。

### Q8: 模式切换入口在哪？

放在 InputToolbar 的 toolbar 上。

类似现有的 model selector，用户可以随时切换。默认 ask 模式。

### 两种模式行为对比

| 操作 | ask 模式 | allow-all 模式 |
|------|----------|---------------|
| Read/Glob/Grep | 自动通过 | 自动通过 |
| WebFetch/WebSearch | 自动通过 | 自动通过 |
| Edit | 弹窗确认 | 自动通过 |
| Write | 弹窗确认 | 自动通过 |
| Bash（普通命令） | 弹窗确认 | 自动通过 |
| Bash（删除命令） | 弹窗确认 | 弹窗确认 |

---

## 不做的事

- 单工具记忆（记住某个工具"总是允许"）
- 三档以上的权限分级
- 基于风险等级自动分类
