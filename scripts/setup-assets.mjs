import { copyFile, mkdir, readdir } from "node:fs/promises";
import { join } from "node:path";

const fontPackage = join(process.cwd(), "node_modules", "@fontsource-variable", "vazirmatn");
const files = await readdir(join(fontPackage, "files"));
const source = files.find((name) => name === "vazirmatn-arabic-wght-normal.woff2") ?? files.find((name) => /arabic.*wght.*normal\.woff2$/.test(name));
if (!source) throw new Error("The Vazirmatn Arabic variable font is missing from the installed font package.");
await mkdir("public/fonts", { recursive: true });
await copyFile(join(fontPackage, "files", source), "public/fonts/vazirmatn-arabic-variable.woff2");
const license = (await readdir(fontPackage)).find((name) => /^(OFL|LICENSE)/i.test(name));
if (license) await copyFile(join(fontPackage, license), "public/fonts/OFL.txt");
console.log("Local Vazirmatn font is ready.");
