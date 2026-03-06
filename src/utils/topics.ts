export type TopicSlug =
  | "product-vision"
  | "architecture"
  | "chat-design"
  | "generative-ui"
  | "artifact"
  | "context-awareness"
  | "session"
  | "skill-system"
  | "agent-runtime"
  | "ui-interaction";

export interface TopicDefinition {
  slug: TopicSlug;
  title: string;
  description: string;
  accent: string;
  order: number;
}

export const TOPICS: TopicDefinition[] = [
  {
    slug: "product-vision",
    title: "产品愿景",
    description: "产品定位、核心价值和目标用户画像的关键判断。",
    accent: "#0f6d61",
    order: 1
  },
  {
    slug: "architecture",
    title: "架构设计",
    description: "系统边界、模块拆分与可扩展性取舍。",
    accent: "#1a7e70",
    order: 2
  },
  {
    slug: "chat-design",
    title: "聊天设计",
    description: "对话节奏、信息层次与阅读体验策略。",
    accent: "#237f73",
    order: 3
  },
  {
    slug: "generative-ui",
    title: "生成式 UI",
    description: "探索式交互、对比决策与动态输出机制。",
    accent: "#2b8c7e",
    order: 4
  },
  {
    slug: "artifact",
    title: "Artifact",
    description: "产物面板的展示模型、布局规则与优化路径。",
    accent: "#4d8d67",
    order: 5
  },
  {
    slug: "context-awareness",
    title: "上下文感知",
    description: "剪贴板、屏幕理解和上下文输入边界。",
    accent: "#327a8a",
    order: 6
  },
  {
    slug: "session",
    title: "会话系统",
    description: "会话生命周期、持久化时机和列表交互细节。",
    accent: "#816546",
    order: 7
  },
  {
    slug: "skill-system",
    title: "技能系统",
    description: "能力插件化、可发现性和执行约束。",
    accent: "#416a62",
    order: 8
  },
  {
    slug: "agent-runtime",
    title: "Agent Runtime",
    description: "权限模型、工作目录和安全执行策略。",
    accent: "#6a6f4d",
    order: 9
  },
  {
    slug: "ui-interaction",
    title: "UI 交互",
    description: "界面深度、输入工具栏和反馈机制。",
    accent: "#945c3f",
    order: 10
  }
];

export const TOPIC_MAP = new Map<TopicSlug, TopicDefinition>(
  TOPICS.map((topic) => [topic.slug, topic])
);
