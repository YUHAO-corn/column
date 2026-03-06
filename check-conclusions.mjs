import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const contentRoot = path.join(root, "content");

function walkMarkdown(dir) {
  const files = [];
  if (!fs.existsSync(dir)) return files;

  const stack = [dir];
  while (stack.length) {
    const current = stack.pop();
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(fullPath);
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        files.push(fullPath);
      }
    }
  }

  return files.sort();
}

function hasDecisionLine(sectionBody) {
  const strong = /^\s*[-*]?\s*\*\*(?:结论|选择|最终选择|核心决策)\s*[:：]\s*([\s\S]*?)\*\*\s*$/m;
  const plain = /^\s*[-*]?\s*(?:结论|选择|最终选择|核心决策)\s*[:：]\s*(.+)$/m;
  return strong.test(sectionBody) || plain.test(sectionBody);
}

const headingRegex = /^##\s+Q(\d+)\s*[:：]?\s*(.+)$/gm;
const files = walkMarkdown(contentRoot);
const missing = [];
let totalQ = 0;
let withDecision = 0;

for (const filePath of files) {
  const text = fs.readFileSync(filePath, "utf-8").replace(/\r\n/g, "\n");
  const matches = [...text.matchAll(headingRegex)];
  if (!matches.length) continue;

  for (let index = 0; index < matches.length; index += 1) {
    totalQ += 1;
    const current = matches[index];
    const next = matches[index + 1];
    const start = (current.index ?? 0) + current[0].length;
    const end = next?.index ?? text.length;
    const body = text.slice(start, end).trim();
    const qTag = `Q${current[1]}`;
    const qTitle = (current[2] || "").trim();

    if (hasDecisionLine(body)) {
      withDecision += 1;
      continue;
    }

    missing.push({
      file: path.relative(root, filePath),
      qTag,
      qTitle
    });
  }
}

const ratio = totalQ ? `${withDecision}/${totalQ}` : "0/0";
console.log(`[check:conclusions] 覆盖率 ${ratio}`);

if (!missing.length) {
  console.log("[check:conclusions] ✅ 所有 Q 都有结构化结论行。");
  process.exit(0);
}

console.log(`[check:conclusions] ❌ 缺少结论的 Q：${missing.length}`);
for (const item of missing) {
  console.log(`- ${item.file} :: ${item.qTag} ${item.qTitle}`);
}

process.exit(1);
