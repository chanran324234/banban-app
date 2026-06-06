import { copyFile, readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const distDir = path.resolve("dist");

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(fullPath);
    } else {
      yield fullPath;
    }
  }
}

async function patchTextFile(filePath) {
  const before = await readFile(filePath, "utf8");
  const after = before
    .replaceAll('href="/favicon.ico"', 'href="./favicon.ico"')
    .replaceAll('src="/_expo/', 'src="./_expo/')
    .replaceAll('href="/_expo/', 'href="./_expo/')
    .replaceAll('"/assets/', '"./assets/')
    .replaceAll("'/assets/", "'./assets/")
    .replaceAll("(/assets/", "(./assets/")
    .replaceAll("url(/assets/", "url(./assets/");

  if (after !== before) {
    await writeFile(filePath, after);
  }
}

const distStats = await stat(distDir).catch(() => null);
if (!distStats?.isDirectory()) {
  throw new Error("dist directory does not exist. Run Expo web export first.");
}

for await (const filePath of walk(distDir)) {
  if (/\.(html|js|css|json)$/i.test(filePath)) {
    await patchTextFile(filePath);
  }
}

await writeFile(path.join(distDir, ".nojekyll"), "");
await copyFile(path.join(distDir, "index.html"), path.join(distDir, "404.html"));
