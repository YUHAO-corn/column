import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

function getLastUpdatedFromGit(): string {
  const utilsDir = path.dirname(fileURLToPath(import.meta.url));
  const siteRoot = path.resolve(utilsDir, "../..");
  try {
    const raw = execSync("git log -1 --format=%cs", {
      cwd: siteRoot,
      stdio: ["ignore", "pipe", "ignore"]
    })
      .toString()
      .trim();
    if (!raw) {
      throw new Error("empty git date");
    }
    return raw.replace(/-/g, "/");
  } catch {
    const formatter = new Intl.DateTimeFormat("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone: "Asia/Shanghai"
    });
    return formatter.format(new Date());
  }
}

export const SITE_META = {
  status: "持续更新中",
  stage: "迭代中",
  version: "v0.x",
  updateNote: "内容会随产品决策变化持续修订",
  lastUpdated: getLastUpdatedFromGit()
};
