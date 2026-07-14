import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const version = "4.2.0";
const outputPath = join(projectRoot, "dist", `physics-visual-lab-standalone-v${version}.html`);
const scripts = [
  ["assets/larmor.js", true],
  ["assets/stern-gerlach.js", false],
  ["assets/full-locales.js", false],
  ["assets/catalog-locales.js", false],
  ["assets/circuit-workbench.js", false],
  ["assets/ja-content.js", false],
  ["assets/app.js", false],
  ["assets/i18n.js", false]
];

let html = await readFile(join(projectRoot, "index.html"), "utf8");
const css = await readFile(join(projectRoot, "assets/styles.css"), "utf8");
html = html.replace(
  /<link\s+rel="stylesheet"\s+href="assets\/styles\.css\?v=[^"]+">/,
  () => `<style data-pvl-inline="assets/styles.css">\n${css}\n</style>`
);

for (const [relativePath, isModule] of scripts) {
  const source = (await readFile(join(projectRoot, relativePath), "utf8"))
    .replace(/<\/script/gi, "<\\/script");
  const pattern = new RegExp(
    `<script${isModule ? '\\s+type="module"' : ""}\\s+src="${relativePath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\?v=[^"]+"><\\/script>`
  );
  const replacement = `<script${isModule ? ' type="module"' : ""} data-pvl-inline="${relativePath}">\n${source}\n</script>`;
  if (!pattern.test(html)) throw new Error(`Could not find script tag for ${relativePath}`);
  // Use a replacement function: bundled JavaScript legitimately contains
  // sequences such as "$&", which String.replace would otherwise interpret
  // as replacement tokens and corrupt the single-file build.
  html = html.replace(pattern, () => replacement);
}

html = html.replace(
  "</head>",
  `<meta name="pvl-build" content="standalone-single-file">\n</head>`
);
await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, html, "utf8");
console.log(outputPath);
