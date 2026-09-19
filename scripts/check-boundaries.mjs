import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = path.join(root, "src");
const walk = (d) =>
  fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(d, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });
const rules = [
  { dir: "src/app", ban: ["@/lib/actions"], msg: "app/ must import from @/features/*, not @/lib/actions" },
  { dir: "src/shared", ban: ["@/features", "@/app", "@/lib/actions"], msg: "shared/ must not depend on features/app" },
  { dir: "src/features", ban: ["@/app"], msg: "features/ must not import from app/" },
];
let bad = 0;
for (const f of walk(src)) {
  if (!/\.(ts|tsx)$/.test(f) || f.endsWith(".test.ts")) continue;
  const rel = path.relative(root, f).split(path.sep).join("/");
  const text = fs.readFileSync(f, "utf8");
  for (const r of rules) {
    if (!rel.startsWith(r.dir + "/")) continue;
    if (rel.startsWith("src/lib/")) continue;
    for (const b of r.ban) {
      if (text.includes(b)) {
        console.error("BOUNDARY " + rel + ": " + r.msg + " (found " + b + ")");
        bad++;
      }
    }
  }
}
if (bad) process.exit(1);
console.log("boundaries ok");
