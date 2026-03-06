import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export interface SiteStats {
  days: number;
  commits: number;
  lines: number;
  qaCount: number;
}

const DESKHAND_PATH = "/Users/godcorn/cursor/Deskhand";
const SOURCE_PATH = path.join(DESKHAND_PATH, "apps/electron/src");
const utilsDir = path.dirname(fileURLToPath(import.meta.url));
const CONTENT_PATH = path.resolve(utilsDir, "../../content");

function safeExec(command: string, cwd: string): string {
  try {
    return execSync(command, { cwd, stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
  } catch {
    return "";
  }
}

function countCodeLines(directory: string): number {
  if (!fs.existsSync(directory)) {
    return 0;
  }

  let lineCount = 0;
  const stack = [directory];
  const codePattern = /\.(ts|tsx|js|jsx|css|astro)$/;

  while (stack.length) {
    const current = stack.pop();
    if (!current) {
      continue;
    }

    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(fullPath);
        continue;
      }
      if (codePattern.test(entry.name)) {
        const content = fs.readFileSync(fullPath, "utf-8");
        lineCount += content.split("\n").length;
      }
    }
  }

  return lineCount;
}

function countQA(directory: string): number {
  if (!fs.existsSync(directory)) {
    return 0;
  }

  let total = 0;
  const stack = [directory];

  while (stack.length) {
    const current = stack.pop();
    if (!current) {
      continue;
    }
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(fullPath);
        continue;
      }
      if (entry.name.endsWith(".md")) {
        const text = fs.readFileSync(fullPath, "utf-8");
        total += (text.match(/^##\s+Q\d+/gm) || []).length;
      }
    }
  }

  return total;
}

export function getStats(): SiteStats {
  const firstCommitRaw = safeExec("git log --reverse --format=%ci | head -1", DESKHAND_PATH);
  const firstCommit = firstCommitRaw ? new Date(firstCommitRaw) : new Date();
  const days = Math.max(1, Math.ceil((Date.now() - firstCommit.getTime()) / (1000 * 60 * 60 * 24)));
  const commits = Number.parseInt(safeExec("git rev-list --count HEAD", DESKHAND_PATH), 10) || 0;
  const lines = countCodeLines(SOURCE_PATH);
  const qaCount = countQA(CONTENT_PATH);

  return { days, commits, lines, qaCount };
}
