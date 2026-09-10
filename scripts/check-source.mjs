let ts;
try { ts = (await import("typescript")).default; }
catch { ts = (await import("../.tools/typecheck/node_modules/typescript/lib/typescript.js")).default; }
import { readdir, readFile } from "node:fs/promises";
import { join, resolve } from "node:path";

async function walk(directory) {
  const output = [];
  for (const item of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, item.name);
    if (item.isDirectory()) output.push(...await walk(path));
    else if (/\.tsx?$/.test(item.name) && !item.name.endsWith(".d.ts")) output.push(path);
  }
  return output;
}
const roots = ["app", "components", "data", "services", "hooks", "lib", "types"];
const files = (await Promise.all(roots.map(walk))).flat();
const diagnostics = [];
for (const file of files) {
  const result = ts.transpileModule(await readFile(file, "utf8"), { fileName: file, compilerOptions: { jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, isolatedModules: true }, reportDiagnostics: true });
  diagnostics.push(...result.diagnostics ?? []);
}
const domainFiles = files.filter((file) => /^(services|data|lib|types)[\\/]/.test(file) && !file.endsWith("navigation.ts"));
const program = ts.createProgram(domainFiles, { noEmit: true, strict: true, skipLibCheck: true, target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, moduleResolution: ts.ModuleResolutionKind.Bundler, paths: { "@/*": [resolve(".").replaceAll("\\", "/") + "/*"] }, types: [], lib: ["lib.es2022.d.ts", "lib.dom.d.ts", "lib.dom.iterable.d.ts"] });
diagnostics.push(...ts.getPreEmitDiagnostics(program));
if (diagnostics.length) { console.error(ts.formatDiagnosticsWithColorAndContext(diagnostics, { getCurrentDirectory: () => process.cwd(), getCanonicalFileName: (file) => file, getNewLine: () => "\n" })); process.exitCode = 1; }
else console.log(`PASS syntax for ${files.length} TypeScript/TSX files; strict domain typing for ${domainFiles.length} service/data/utility files.`);
