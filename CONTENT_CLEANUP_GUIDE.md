# 内容整理指南

> 指导如何将 Deskhand 的设计文档整理为适合专栏发布的格式。

---

## 1. 核心原则

**先拷贝副本，再基于原文做最小调整。**

- 每篇文档的改动控制在 20% 以内
- 保持原文的决策逻辑、表述风格、完整性
- 只做必要的清理和调整，不重写

---

## 2. 目标

将 `/Users/godcorn/cursor/Deskhand/docs/plans/` 下的 17 篇设计文档整理后，输出到 `/Users/godcorn/cursor/column/content/` 下的对应主题目录。

最终结构：

```
column/content/
├── product-vision/
│   └── product-vision.md
├── architecture/
│   └── architecture.md
├── chat-design/
│   ├── chat-design.md
│   └── chat-visual-hierarchy.md
├── generative-ui/
│   ├── generative-ui.md
│   ├── playground.md
│   └── this-or-that.md
├── artifact/
│   ├── artifact-panel.md
│   └── artifact-optimization.md
├── context-awareness/
│   ├── clipboard-intelligence.md
│   └── screen-aware.md
├── session/
│   └── session-management.md
├── skill-system/
│   └── skill-system.md
├── agent-runtime/
│   ├── permission.md
│   └── working-directory.md
└── ui-interaction/
    ├── ui-depth.md
    └── input-toolbar.md
```

---

## 3. 整理标准（5 条规则）

### 规则 1：统一为 QA 格式

- 每个 Q 是一个独立的决策点
- Q 的表述要让外部读者看得懂
- 每个 Q 下面包含：**选项分析 → 最终选择 → 选择理由**

**示例对比：**

| 整理前（内部表述） | 整理后（外部可读） |
|------------------|------------------|
| Q: 消息持久化时机？ | Q: 用户关闭应用后，聊天记录会丢失吗？ |
| A: 每条消息立即写入 | 选择：每条消息到达时立即保存到磁盘 |
| B: Agent 完成回复后批量写 | |
| 选 A，因为 append-only 适合流式 | 理由：即使程序意外崩溃也不会丢失任何消息 |

### 规则 2：去掉内部上下文

**删除：**
- 日期（如 "2026-02-13"）
- Phase 标注（如 "对应 Phase 3"）
- "补写"、"回顾" 等内部说明
- 文件路径（如 `packages/shared/src/sessions/storage.ts`）
- 具体代码实现片段

**保留：**
- 决策背景
- 用户场景
- 选项对比

### 规则 3：突出决策逻辑

**重点写：**
- 为什么选 A 不选 B
- 核心取舍维度是什么
- 用户的受益点是什么
- 实现方向和关键思路是什么

**不重点写：**
- 具体代码怎么写（如函数、文件、调用细节）
- 逐行实现过程

**示例：**

| 整理前（偏实现） | 整理后（偏决策） |
|----------------|----------------|
| 选 JSONL，因为 append-only 特性天然适合逐条追加，每次只需要 fs.appendFileSync | 选 JSONL 格式，因为它能在不读取整个文件的情况下追加新内容，即使聊天记录很长也不会变慢 |

### 规则 4：补充必要背景

- 如果某个 Q 依赖前面的上下文，补充简短说明
- 专业术语第一次出现时简要解释（如 "JSONL：一种每行一条 JSON 的文本格式"）

### 规则 5：保持决策完整性

- 保留被否决的选项
- 保留否决理由
- 让读者能看到完整的思考过程

### 规则 6：理由叙述要自然（重要）

**参考 humanizer-zh 技能的原则：**

- 去掉"理由："、"选择："、"1. 2. 3."等固定格式
- 改成连贯的自然段落，用口语化连接
- 去掉"此外""然而""所以"等 AI 常用连接词
- 句子长度要有变化，避免机械重复
- 允许用口语化表达（如"先让产品能跑起来再说""不值当"）
- 尊重读者智慧，不过度解释

**示例：**

| 整理前（做题感） | 整理后（自然叙述） |
|----------------|------------------|
| 理由：1. 首次用户不需要任何额外操作... | 首次用户不需要任何额外操作就能开始用，回访用户也能接着之前的聊。两个需求都被满足了，不用纠结。 |
| 理由：1. 最简单，JSONL 的 append-only... | 这样最省事。JSONL 天然支持往文件末尾追加，不用读整个文件就能加新内容。而且即使程序崩了，消息也不会丢。 |

---

## 4. 处理流程

### 步骤 1：拷贝副本

先把原文档复制到目标位置，再基于副本调整。不要直接在原文档上改。

例如：
```bash
cp /Users/godcorn/cursor/Deskhand/docs/plans/session-management-design.md /Users/godcorn/cursor/column/content/session/session-management.md
```

### 步骤 2：读取并对照规则检查

打开副本文件，对照 5 条规则检查需要调整的地方。
- 哪些表述对外部读者不友好？
- 哪些内部上下文需要删除？
- 哪些部分太偏代码细节，缺少实现思路？
- 是否缺必要的背景说明？

### 步骤 3：执行调整

按规则逐项调整，输出新文档。

### 步骤 4：保存

（拷贝副本后文件已在目标位置，检查调整是否完成即可）

### 步骤 5：报告

每完成一篇，简要说明：
- 做了哪些调整
- 是否遇到问题

---

## 5. 示例：完整整理过程

以 `session-management-design.md` 为例：

### 识别问题：

1. 开头有「日期：2026-02-13」「对应：Phase 3」→ 删除
2. 「现状分析」章节包含大量文件路径 → 删除路径，保留背景
3. Q1~Q6 表述大体可读，但有些偏代码细节（如「持久化时机」）
4. 有些理由写得不错（如 Q2 的「App 崩溃也不会丢消息」），保留
5. 缺少对「JSONL」的解释 → 补充

### 整理后片段示例：

```markdown
## Q1: 首次打开应用时，会显示什么？

用户第一次打开应用时，可能会困惑该做什么。我们有三种方案：

- A: 自动创建一个空白会话，用户可以直接开始聊天
- B: 显示空状态，等用户点「新建会话」才创建
- C: 加载历史会话，如果没有历史则自动创建一个

**选择：C**

理由：
- 新用户不需要任何操作就能开始使用
- 回访用户能看到之前的会话
- 两种场景都被照顾到
```

---

## 6. 文档处理顺序

建议按以下顺序处理，逐渐找到感觉：

1. `session-management-design.md` — 完整 QA 结构，示例参考价值高
2. `permission-system-design.md` — 权限决策，逻辑清晰
3. `generative-ui-design.md` — 核心模块，决策密度高
4. `skill-system-design.md` — 最大的一篇，可能需要拆成多个 Q
5. 其余文档

---

## 额外注意事项

### 名称统一

- 统一使用「generative-ui」命名
- 对应的文档 `generative-ui-design.md` 整理后命名为 `generative-ui.md`
