import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { TOPICS, TOPIC_MAP, type TopicDefinition, type TopicSlug } from "./topics";

export interface QADecision {
  id: string;
  topic: TopicSlug;
  topicTitle: string;
  docSlug: string;
  docTitle: string;
  questionTag: string;
  question: string;
  questionNumber: number;
  slug: string;
  decision: string | null;
  preview: string;
  body: string;
}

export interface TopicSummary extends TopicDefinition {
  docsCount: number;
  qaCount: number;
}

interface CacheState {
  questions: QADecision[];
  summaries: TopicSummary[];
}

const utilsDir = path.dirname(fileURLToPath(import.meta.url));
const CONTENT_ROOT = path.resolve(utilsDir, "../../content");

let cache: CacheState | null = null;

function stripMarkdown(input: string): string {
  return input
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
    .replace(/^[-*]\s+/gm, "")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\s+/g, " ")
    .trim();
}

function createSlug(docSlug: string, questionNumber: number): string {
  return `${docSlug}-q${questionNumber}`;
}

function extractDecision(body: string): string | null {
  const strongMatch = body.match(
    /^\s*[-*]?\s*\*\*(?:结论|选择|最终选择|核心决策)\s*[:：]\s*([\s\S]*?)\*\*\s*$/m
  );
  if (strongMatch?.[1]) {
    return stripMarkdown(strongMatch[1]).trim() || null;
  }

  const plainMatch = body.match(/^\s*[-*]?\s*(?:结论|选择|最终选择|核心决策)\s*[:：]\s*(.+)$/m);
  if (plainMatch?.[1]) {
    return stripMarkdown(plainMatch[1]).trim() || null;
  }

  return null;
}

function normalizeDecision(decision: string): string {
  let value = decision.trim();
  value = value.replace(/^(关键线索|核心场景|关键洞察)\s*[:：]\s*/, "");
  // Collapse exact duplicated halves: "A。A。" or "A，A"
  const half = Math.floor(value.length / 2);
  if (half > 8) {
    const left = value.slice(0, half).trim();
    const right = value.slice(half).trim().replace(/^[，,。.!！?？\s]+/, "");
    if (left && right && (left === right || left.replace(/[。.!！?？]$/, "") === right)) {
      value = left.replace(/[，,。.!！?？\s]+$/, "");
    }
  }
  return value;
}

function buildPreview(body: string): string {
  const cleaned = body
    .replace(
      /^\s*[-*]?\s*\*\*(?:结论|选择|最终选择|核心决策)\s*[:：]\s*([\s\S]*?)\*\*\s*$/gm,
      ""
    )
    .replace(/^\s*[-*]?\s*(?:结论|选择|最终选择|核心决策)\s*[:：].*$/gm, "")
    .replace(/^---+$/gm, "")
    .trim();

  const text = stripMarkdown(cleaned).slice(0, 120);
  return text.length > 110 ? `${text.slice(0, 110)}…` : text;
}

function readTopicFiles(topic: TopicDefinition): string[] {
  const folder = path.join(CONTENT_ROOT, topic.slug);
  if (!fs.existsSync(folder)) {
    return [];
  }

  return fs
    .readdirSync(folder)
    .filter((name) => name.endsWith(".md"))
    .sort()
    .map((name) => path.join(folder, name));
}

function parseQAs(topic: TopicDefinition, filePath: string): QADecision[] {
  const content = fs.readFileSync(filePath, "utf-8").replace(/\r\n/g, "\n");
  const docTitleMatch = content.match(/^#\s+(.+)$/m);
  const docTitle = docTitleMatch ? docTitleMatch[1].trim() : path.basename(filePath, ".md");
  const docSlug = path.basename(filePath, ".md");
  const headingRegex = /^##\s+Q(\d+)\s*[:：]?\s*(.+)$/gm;
  const matches = [...content.matchAll(headingRegex)];

  if (!matches.length) {
    return [];
  }

  return matches.map((match, index) => {
    const questionNumber = Number(match[1]);
    const question = (match[2] || "").trim() || `Q${questionNumber}`;
    const start = match.index ?? 0;
    const headingLength = match[0].length;
    const bodyStart = start + headingLength;
    const bodyEnd = index + 1 < matches.length ? matches[index + 1].index ?? content.length : content.length;
    const body = content.slice(bodyStart, bodyEnd).trim();
    const rawDecision = extractDecision(body);
    const decision = rawDecision ? normalizeDecision(rawDecision) : null;
    const preview = buildPreview(body);

    return {
      id: `${topic.slug}:${docSlug}:${questionNumber}`,
      topic: topic.slug,
      topicTitle: topic.title,
      docSlug,
      docTitle,
      questionTag: `Q${questionNumber}`,
      question,
      questionNumber,
      slug: createSlug(docSlug, questionNumber),
      decision,
      preview,
      body
    };
  });
}

function buildCache(): CacheState {
  const questions: QADecision[] = [];
  const summaries: TopicSummary[] = [];

  for (const topic of TOPICS) {
    const files = readTopicFiles(topic);
    const topicQuestions = files.flatMap((filePath) => parseQAs(topic, filePath));

    topicQuestions.sort((left, right) => {
      if (left.docSlug === right.docSlug) {
        return left.questionNumber - right.questionNumber;
      }
      return left.docSlug.localeCompare(right.docSlug, "zh-CN");
    });

    questions.push(...topicQuestions);
    summaries.push({
      ...topic,
      docsCount: files.length,
      qaCount: topicQuestions.length
    });
  }

  summaries.sort((left, right) => left.order - right.order);

  return { questions, summaries };
}

function getCache(): CacheState {
  if (!cache) {
    cache = buildCache();
  }
  return cache;
}

export function getTopicSummaries(): TopicSummary[] {
  return getCache().summaries;
}

export function getTopicQAs(topic: TopicSlug): QADecision[] {
  return getCache().questions.filter((question) => question.topic === topic);
}

export function getAllQAs(): QADecision[] {
  return getCache().questions;
}

export function getQADetail(topic: TopicSlug, slug: string): QADecision | undefined {
  return getCache().questions.find((question) => question.topic === topic && question.slug === slug);
}

export function getRelatedQAs(topic: TopicSlug, slug: string, limit = 4): QADecision[] {
  return getTopicQAs(topic).filter((qa) => qa.slug !== slug).slice(0, limit);
}

export function isTopicSlug(input: string): input is TopicSlug {
  return TOPIC_MAP.has(input as TopicSlug);
}
