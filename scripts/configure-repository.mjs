import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const args = new Map();

for (let index = 2; index < process.argv.length; index += 2) {
  const key = process.argv[index]?.replace(/^--/, "");
  const value = process.argv[index + 1];
  if (key && value) args.set(key, value);
}

const owner = args.get("owner");
const repo = args.get("repo") ?? "banban-app";
const email = args.get("email") ?? "support@example.com";

if (!owner) {
  console.error("Usage: npm run repo:configure -- --owner <github-user-or-org> [--repo banban-app] [--email support@example.com]");
  process.exit(1);
}

const repoPath = `${owner}/${repo}`;
const httpsUrl = `https://github.com/${repoPath}`;
const advisoryUrl = `${httpsUrl}/security/advisories/new`;

const replacements = new Map([
  ["https://github.com/your-org/banban-app/security/advisories/new", advisoryUrl],
  ["https://github.com/<your-org-or-user>/banban-app", httpsUrl],
  ["git@github.com:<your-org-or-user>/banban-app.git", `git@github.com:${repoPath}.git`],
  ["待补充", httpsUrl],
  ["开发者联系邮箱：待补充", `开发者联系邮箱：${email}`]
]);

const files = [
  ".github/ISSUE_TEMPLATE/config.yml",
  "SECURITY.md",
  "docs/app-store-listing.md",
  "docs/github-publish.md",
  "docs/privacy-policy.md",
  "docs/release-checklist.md"
];

for (const file of files) {
  const filePath = path.join(root, file);
  let content = await readFile(filePath, "utf8");

  for (const [from, to] of replacements) {
    content = content.split(from).join(to);
  }

  await writeFile(filePath, content);
  console.log(`updated ${file}`);
}

console.log(`Repository URL: ${httpsUrl}`);
