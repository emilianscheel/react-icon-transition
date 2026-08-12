import { gzipSync } from "node:zlib";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const entry = join(root, "src", "index.ts");
const outdir = await mkdtemp(join(tmpdir(), "react-icon-transition-size-"));

const result = await Bun.build({
  entrypoints: [entry],
  outdir,
  format: "esm",
  target: "browser",
  minify: true,
  // Always emit production JSX so size checks cannot poison dist with jsxDEV.
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

const jsPath = join(outdir, "index.js");
const source = await Bun.file(jsPath).text();
if (source.includes("jsxDEV") || source.includes("jsx-dev-runtime")) {
  console.error("size build emitted development JSX; aborting");
  process.exit(1);
}

const raw = Buffer.byteLength(source);
const gzip = gzipSync(Buffer.from(source), { level: 9 }).byteLength;
const toKb = (bytes: number) => (bytes / 1024).toFixed(2);

console.log(`raw  ${raw} bytes (${toKb(raw)} KB)`);
console.log(`gzip ${gzip} bytes (${toKb(gzip)} KB)`);
