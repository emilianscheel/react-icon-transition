import { gzipSync } from "node:zlib";
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
  external: ["react", "react/jsx-runtime"],
  banner: '"use client";',
});

if (!result.success) {
  for (const log of result.logs) console.error(log);
  process.exit(1);
}

const js = await Bun.file(join(outdir, "index.js")).arrayBuffer();
const raw = js.byteLength;
const gzip = gzipSync(Buffer.from(js), { level: 9 }).byteLength;
const toKb = (bytes: number) => (bytes / 1024).toFixed(2);

console.log(`raw  ${raw} bytes (${toKb(raw)} KB)`);
console.log(`gzip ${gzip} bytes (${toKb(gzip)} KB)`);
