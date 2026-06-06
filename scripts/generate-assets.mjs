import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const assetsDir = path.join(root, "assets");
const screenshotsDir = path.join(root, "docs", "store-screenshots");

const colors = {
  background: "#f7f5ef",
  surface: "#fffdf8",
  action: "#2f6f5e",
  actionStrong: "#1f4d43",
  mint: "#dfeee8",
  amber: "#b97a2c",
  ink: "#20211f"
};

function appIconSvg(size = 1024, transparent = false) {
  const bg = transparent
    ? ""
    : `<rect width="${size}" height="${size}" rx="220" fill="${colors.action}"/>`;

  return `
<svg width="${size}" height="${size}" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  ${bg}
  <rect x="198" y="198" width="628" height="628" rx="150" fill="${transparent ? colors.action : colors.surface}"/>
  <path d="M653 292 318 470c-24 13-20 49 6 56l132 36 42 136c8 26 43 31 57 8l179-335c18-34-47-96-81-79Z" fill="${transparent ? colors.surface : colors.action}"/>
  <path d="M503 568 653 292 456 562l42 136 5-130Z" fill="${transparent ? colors.mint : colors.actionStrong}" opacity="0.95"/>
  <circle cx="332" cy="686" r="34" fill="${colors.amber}"/>
  <circle cx="694" cy="344" r="22" fill="${colors.amber}"/>
</svg>`;
}

function splashSvg(width = 1242, height = 2688) {
  return `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="${colors.background}"/>
  <circle cx="${width / 2}" cy="${height / 2 - 110}" r="230" fill="${colors.mint}"/>
  <g transform="translate(${width / 2 - 175} ${height / 2 - 285}) scale(0.342)">
    ${appIconSvg(1024, true).replace(/<svg[^>]*>|<\/svg>/g, "")}
  </g>
  <text x="${width / 2}" y="${height / 2 + 230}" text-anchor="middle" font-family="Arial, 'PingFang SC', sans-serif" font-size="88" font-weight="800" fill="${colors.ink}">伴办</text>
  <text x="${width / 2}" y="${height / 2 + 302}" text-anchor="middle" font-family="Arial, 'PingFang SC', sans-serif" font-size="34" fill="${colors.actionStrong}">陪你想清楚，也帮你往前走</text>
</svg>`;
}

function notificationIconSvg(size = 96) {
  return `
<svg width="${size}" height="${size}" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
  <path d="M68 18 20 43c-5 3-4 10 2 12l19 5 6 20c2 6 9 7 12 2l25-48c4-7-9-20-16-16Z" fill="#ffffff"/>
  <path d="M48 62 68 18 41 60l6 20 1-18Z" fill="#ffffff" opacity="0.72"/>
</svg>`;
}

async function renderPng(svg, outputPath, width, height = width) {
  await sharp(Buffer.from(svg))
    .resize(width, height)
    .png()
    .toFile(outputPath);
}

await mkdir(assetsDir, { recursive: true });
await mkdir(screenshotsDir, { recursive: true });

await renderPng(appIconSvg(), path.join(assetsDir, "icon.png"), 1024);
await renderPng(appIconSvg(1024, true), path.join(assetsDir, "adaptive-icon.png"), 1024);
await renderPng(appIconSvg(), path.join(assetsDir, "favicon.png"), 64);
await renderPng(splashSvg(), path.join(assetsDir, "splash.png"), 1242, 2688);
await renderPng(notificationIconSvg(), path.join(assetsDir, "notification-icon.png"), 96);

console.log("Generated app assets in assets/");
