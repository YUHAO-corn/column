import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";

const repository = process.env.GITHUB_REPOSITORY ?? "";
const [repoOwner, repoName] = repository.split("/");
const isUserSite = repoName?.endsWith(".github.io");
const isGitHubActions = process.env.GITHUB_ACTIONS === "true";

export default defineConfig({
  site: repoOwner ? `https://${repoOwner}.github.io` : "https://example.com",
  base: isGitHubActions && repoName && !isUserSite ? `/${repoName}/` : "/",
  output: "static",
  integrations: [tailwind()]
});
