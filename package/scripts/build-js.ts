import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const entry = join(root, "src", "index.ts");
const outdir = join(root, "dist");

const result = await Bun.build({
  entrypoints: [entry],
  outdir,
  format: "esm",
  target: "browser",
  minify: true,
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
  external: ["react", "react/jsx-runtime"],
  banner: '"use client";',
});

if (!result.success) {
  for (const log of result.logs) console.error(log);
  process.exit(1);
}

const source = await Bun.file(join(outdir, "index.js")).text();
if (source.includes("jsxDEV") || source.includes("jsx-dev-runtime")) {
  console.error("build emitted development JSX (jsxDEV); aborting");
  process.exit(1);
}

console.log("built dist/index.js");
