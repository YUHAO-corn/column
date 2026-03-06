# 专栏站点搭建指南

> 指导如何从零搭建专栏站点。

---

## 1. 项目初始化

### 1.1 创建 Astro 项目

```bash
cd /Users/godcorn/cursor/column
npm create astro@latest . -- --template minimal --no-install --no-git
```

### 1.2 安装依赖

```bash
npm install
npm install -D tailwindcss @astrojs/tailwind
```

### 1.3 配置 Tailwind

创建 `tailwind.config.mjs`：

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

在 `astro.config.mjs` 末尾添加：

```javascript
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  // ... existing config
  integrations: [tailwind()],
});
```

---

## 2. 目录结构

```
column/
├── src/
│   ├── components/
│   │   ├── Header.astro          # 顶部导航
│   │   ├── StatsDashboard.astro # 统计仪表盘
│   │   ├── TopicCard.astro       # 主题卡片
│   │   └── QAItem.astro         # QA 列表项
│   ├── layouts/
│   │   └── Layout.astro         # 基础布局
│   ├── pages/
│   │   ├── index.astro          # 首页
│   │   └── [topic]/
│   │       └── index.astro      # 主题详情页
│   │       └── [slug].astro     # QA 详情页
│   ├── content/                 # 整理后的文档（由 CONTENT_CLEANUP_GUIDE 产出）
│   │   ├── product-vision/
│   │   ├── architecture/
│   │   └── ...
│   └── styles/
│       └── global.css
├── public/
├── astro.config.mjs
├── tailwind.config.mjs
└── package.json
```

---

## 3. 页面设计

> 设计风格参考：`/Users/godcorn/cursor/portfolio-deskhand/qa.html`

### 3.1 设计风格

参考 qa.html 的视觉语言：

- **配色**：
  - 背景：米色/暖白 (`#f4efe6`)
  - 文字：深墨绿 (`#1f2522`)
  - 强调色：青绿 (`#0b6a60`)
  - 卡片背景：暖白 (`#fff9f0`)
  - 分割线：浅棕 (`#d6cec0`)

- **字体**：
  - 标题：Fraunces（衬线）
  - 正文：IBM Plex Sans 或 Noto Sans SC

- **质感**：
  - 顶部导航半透明磨砂效果
  - 卡片轻微阴影
  - 页面有温暖的渐变背景

### 3.2 页面功能

页面结构已在上文确定，实际功能（搜索、筛选、图表等）根据需要再讨论。先完成基础版本：首页统计仪表盘 + 主题列表 + QA 详情页。

### 3.3 首页 (index.astro)

**结构：**

1. **顶部 Header**
   - 专栏标题：「AI 产品决策专栏」
   - 副标题：「一个产品人用 AI 从 0 到 1 做产品的全过程记录」
   - GitHub 链接

2. **统计仪表盘 (StatsDashboard)**
   - 四个数字卡片横排：
     - 🗓️ 开发天数：X 天
     - 📝 设计决策：X 个
     - 💻 代码行数：X 行
     - 🔧 提交次数：X 次
   - 数据从 `Deskhand` 仓库的 git 统计获取（见第 4 节）

3. **主题列表**
   - 10 个主题卡片，2-3 列网格
   - 每个卡片显示：主题名称 + 文档数 + 简短描述
   - 点击跳转对应主题页

**样式参考：**
- 简洁、干净，突出内容
- 主题卡片 hover 时微微上浮 + 阴影加深
- 统计数字使用大字号 + 强调色

### 3.2 主题详情页 ([topic]/index.astro)

**结构：**

1. **返回链接** — 返回首页
2. **主题标题 + 描述**
3. **QA 列表**
   - 每个 QA 是一个可点击的卡片
   - 显示 Q 的标题 + 简短预览
   - 点击跳转 QA 详情

### 3.3 QA 详情页 ([topic]/[slug].astro)

**结构：**

1. **返回链接** — 返回主题页
2. **Q 标题** — 大字突出
3. **Q 正文** — 包含背景、选项分析、选择、理由
4. **相关 QA** — 同一主题下的其他 QA 链接

**样式：**
- 选项对比使用表格或列表
- 理由部分加粗或高亮
- 保持阅读节奏感

---

## 4. 数据获取

### 4.1 统计数据的获取方式

在 `src/utils/stats.ts` 中实现：

```typescript
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

export function getStats() {
  const deskhandPath = '/Users/godcorn/cursor/Deskhand';

  // 1. 开发天数：首次 commit 距今
  const firstCommit = execSync(
    'git log --reverse --format=%ci | head -1',
    { cwd: deskhandPath }
  ).toString().trim();
  const startDate = new Date(firstCommit);
  const days = Math.ceil((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  // 2. Commit 数
  const commits = execSync('git rev-list --count HEAD', {
    cwd: deskhandPath
  }).toString().trim();

  // 3. 代码行数（仅 src 目录，排除 node_modules）
  const srcPath = path.join(deskhandPath, 'apps/electron/src');
  let lines = 0;
  function countLines(dir: string) {
    fs.readdirSync(dir).forEach(file => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        countLines(fullPath);
      } else if (/\.(ts|tsx|js|jsx)$/.test(file)) {
        lines += fs.readFileSync(fullPath, 'utf-8').split('\n').length;
      }
    });
  }
  countLines(srcPath);

  // 4. QA 数：统计 content 目录下所有 .md 文件中的 # Q 数量
  // （此数据在构建时从 content 目录动态获取）

  return { days, commits, lines };
}
```

**注意：**
- 统计数据在 `npm run build` 时获取，部署后是静态的
- 如果需要在预览时也看到数据，可使用 Astro 的 dev 模式 SSR

### 4.2 QA 数量统计

在构建时扫描 `src/content/` 目录，统计所有 Q 标题数量：

```typescript
export function getQACount() {
  const contentPath = '/Users/godcorn/cursor/column/src/content';
  let count = 0;
  function scan(dir: string) {
    fs.readdirSync(dir).forEach(file => {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        scan(fullPath);
      } else if (file.endsWith('.md')) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        count += (content.match(/^## /gm) || []).length;
      }
    });
  }
  scan(contentPath);
  return count;
}
```

---

## 5. 内容管理

### 5.1 使用 Astro Content Collections

在 `src/content/config.ts` 定义集合：

```typescript
import { defineCollection, z } from 'astro:content';

const topics = [
  'product-vision',
  'architecture',
  'chat-design',
  'generative-ui',
  'artifact',
  'context-awareness',
  'session',
  'skill-system',
  'agent-runtime',
  'ui-interaction',
];

const topicSchema = z.object({
  title: z.string(),
  description: z.string(),
  order: z.number(),
});

export const collections = {
  // 主题配置
  topics: defineCollection({
    type: 'data',
    schema: topicSchema,
  }),
  // QA 文档
  docs: defineCollection({
    type: 'content',
    schema: z.object({
      title: z.string(),
      topic: z.enum(topics),
    }),
  }),
};
```

### 5.2 主题元数据

创建 `src/content/topics/` 目录，每个主题一个 JSON 文件：

```json
// src/content/topics/product-vision.json
{
  "title": "Product Vision",
  "description": "产品愿景、用户定位、核心价值",
  "order": 1
}
```

---

## 6. 部署

### 6.1 GitHub Pages 配置

1. 在 GitHub 创建仓库：`column`（或你想要的名称）
2. 本地初始化 git 并推送：

```bash
cd /Users/godcorn/cursor/column
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/<your-username>/column.git
git push -u origin main
```

3. 在 GitHub 仓库设置中：
   - Pages → Source: Deploy from a branch
   - Branch: `gh-pages` / `(root)`
   - Build: `npm run build`
   - Output: `dist`

### 6.2 自动部署

在 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

---

## 7. 执行顺序

1. **项目初始化** — 创建 Astro 项目 + 配置 Tailwind
2. **创建目录结构** — 按第 2 节创建所有目录和基础文件
3. **实现组件** — 按第 3 节实现三个页面
4. **接入统计数据** — 实现第 4 节的数据获取
5. **配置 Content Collections** — 实现第 5 节
6. **本地测试** — `npm run dev` 确保页面正常
7. **部署上线** — 推送到 GitHub，配置 Pages

---

## 8. 注意事项

- 所有路径使用绝对路径指向 `/Users/godcorn/cursor/column/`
- 先确保本地 `npm run dev` 能跑通，再部署
- 部署后检查统计数字是否正确显示
