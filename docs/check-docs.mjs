import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Structural checks, not a substitute for reviewing behavioral claims against source.
const docs = path.dirname(fileURLToPath(import.meta.url));
const root = path.dirname(docs);
const required = [
  "INDEX.md", "PROJECT_OVERVIEW.md", "ARCHITECTURE.md", "PROJECT_STRUCTURE.md",
  "FEATURES.md", "ROUTES.md", "COMPONENTS.md", "STATE_MANAGEMENT.md",
  "API_AND_DATA.md", "AUTH_AND_PERMISSIONS.md", "UI_AND_DESIGN_SYSTEM.md",
  "DEVELOPMENT_GUIDE.md", "CHANGE_GUIDE.md", "FEATURE_MAP.md", "AI_CONTEXT.md",
];
const read = (file) => readFileSync(file, "utf8");
const relative = (file) => path.relative(root, file).replaceAll("\\", "/");
const failures = [];
const index = read(path.join(docs, "INDEX.md"));
for (const name of required) {
  if (!existsSync(path.join(docs, name))) failures.push(`Missing required document: ${name}`);
  if (name !== "INDEX.md" && !index.includes(`](${name})`)) failures.push(`Missing index link: ${name}`);
}

const markdown = [
  ...readdirSync(docs).filter((file) => file.endsWith(".md")).map((file) => path.join(docs, file)),
  path.join(root, "README.md"), path.join(root, "AGENTS.md"),
];
let linkCount = 0;
let sourcePathCount = 0;
function anchors(text) {
  const result = new Set();
  const duplicates = new Map();
  for (const match of text.matchAll(/^#{1,6}\s+(.+)$/gm)) {
    const base = match[1].toLowerCase().replace(/[`*]/g, "").replace(/[^\p{L}\p{N}_ -]/gu, "").replace(/ /g, "-");
    const count = duplicates.get(base) ?? 0;
    result.add(count ? `${base}-${count}` : base);
    duplicates.set(base, count + 1);
  }
  for (const match of text.matchAll(/\bid=["']([^"']+)["']/g)) result.add(match[1]);
  return result;
}
for (const file of markdown) {
  const content = read(file);
  for (const match of content.matchAll(/\[[^\]\n]+\]\((?:<([^>]+)>|([^\s)]+))\)/g)) {
    const target = match[1] ?? match[2];
    if (/^[a-z][a-z0-9+.-]*:/i.test(target)) continue;
    linkCount++;
    const [destination, fragment] = target.split("#");
    const resolved = destination ? path.resolve(path.dirname(file), decodeURIComponent(destination)) : file;
    if (!existsSync(resolved)) {
      failures.push(`${relative(file)}: broken link ${target}`);
    } else if (fragment && resolved.endsWith(".md") && statSync(resolved).isFile() && !anchors(read(resolved)).has(decodeURIComponent(fragment))) {
      failures.push(`${relative(file)}: missing anchor ${target}`);
    }
  }
  for (const match of content.matchAll(/`((?:app|components|data|docs|hooks|lib|public|scripts|services|tests|types)\/[^`\n]*)`/g)) {
    const source = match[1];
    if (source.includes("*") || source.includes(" ")) continue;
    sourcePathCount++;
    if (!existsSync(path.join(root, source))) failures.push(`${relative(file)}: missing source path ${source}`);
  }
}

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(file) : [file];
  });
}
const actualRoutes = new Map(walk(path.join(root, "app")).filter((file) => path.basename(file) === "page.tsx").map((file) => {
  const parts = path.relative(path.join(root, "app"), path.dirname(file)).split(path.sep).filter((part) => part && !/^\(.*\)$/.test(part));
  return ["/" + parts.join("/"), relative(file)];
}));
const routeDoc = path.join(docs, "ROUTES.md");
const documentedRoutes = new Map();
for (const match of read(routeDoc).matchAll(/^\| `(\/[^`]*)` \| \[page\.tsx\]\((?:<([^>]+)>|([^\s)]+))\)/gm)) {
  const route = match[1];
  if (documentedRoutes.has(route)) failures.push(`Duplicate documented route: ${route}`);
  documentedRoutes.set(route, relative(path.resolve(docs, match[2] ?? match[3])));
}
for (const [route, file] of actualRoutes) {
  if (documentedRoutes.get(route) !== file) failures.push(`Route ${route} must map to ${file}`);
}
for (const route of documentedRoutes.keys()) {
  if (!actualRoutes.has(route)) failures.push(`Documented route has no page: ${route}`);
}

const services = walk(path.join(root, "services")).filter((file) => file.endsWith(".ts"));
const collections = services.flatMap((file) => [...read(file).matchAll(/createMockRepository(?:<[^>]+>)?\("([^"]+)"/g)].map((match) => match[1]));
const documentedCollections = [...read(path.join(docs, "STATE_MANAGEMENT.md")).matchAll(/^\| `([^`]+)` \| `\w+Service`/gm)].map((match) => match[1]);
try { assert.deepEqual([...documentedCollections].sort(), [...collections].sort()); }
catch { failures.push(`Storage collection map differs from service declarations: ${collections.join(", ")}`); }

if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`PASS ${required.length} required documents; ${markdown.length} Markdown files; ${linkCount} local links; ${sourcePathCount} inline source paths; ${actualRoutes.size} routes; ${collections.length} collections.`);
}
