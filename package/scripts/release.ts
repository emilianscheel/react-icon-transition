#!/usr/bin/env bun

import { $ } from "bun";
import { resolve } from "node:path";

const root = resolve(import.meta.dir, "..");
const packageJsonPath = resolve(root, "package.json");

type Bump = "patch" | "minor" | "major";

function parseArgs(argv: string[]): { bump: Bump; otp?: string } {
  const flags = new Set(argv);
  const bumps = (["patch", "minor", "major"] as const).filter(
    (bump) => flags.has(`--${bump}`) || flags.has(bump),
  );
  const otpFlag = argv.find((arg) => arg.startsWith("--otp="));
  const otpIndex = argv.indexOf("--otp");
  const otp =
    otpFlag?.slice("--otp=".length)
    || (otpIndex >= 0 ? argv[otpIndex + 1] : undefined);

  if (bumps.length !== 1) {
    console.error(
      "Usage: bun run release --patch | --minor | --major [--otp=123456]",
    );
    process.exit(1);
  }

  return { bump: bumps[0]!, otp };
}

function bumpVersion(version: string, bump: Bump): string {
  const match = version.trim().match(/^(\d+)\.(\d+)\.(\d+)(?:[-+].*)?$/);
  if (!match) {
    throw new Error(`Unsupported version format: ${version}`);
  }

  let major = Number(match[1]);
  let minor = Number(match[2]);
  let patch = Number(match[3]);

  if (bump === "major") {
    major += 1;
    minor = 0;
    patch = 0;
  } else if (bump === "minor") {
    minor += 1;
    patch = 0;
  } else {
    patch += 1;
  }

  return `${major}.${minor}.${patch}`;
}

async function writePackage(data: Record<string, unknown>) {
  await Bun.write(packageJsonPath, `${JSON.stringify(data, null, 2)}\n`);
}

const { bump, otp } = parseArgs(process.argv.slice(2));
const packageJson = await Bun.file(packageJsonPath).json();
const previous = packageJson.version as string;
const next = bumpVersion(previous, bump);
const previousPackageJson = structuredClone(packageJson);

packageJson.name = "react-icon-transition";
packageJson.version = next;

console.log(`Releasing react-icon-transition ${previous} → ${next} (${bump})`);

await $`bun run check`.cwd(root);
await $`bun test`.cwd(root);
await $`bun run build`.cwd(root);

await writePackage(packageJson);

const publishArgs = ["publish", "--access", "public"];
if (otp) publishArgs.push(`--otp=${otp}`);

const publish = Bun.spawn(["npm", ...publishArgs], {
  cwd: root,
  stdin: "inherit",
  stdout: "inherit",
  stderr: "inherit",
});
const publishCode = await publish.exited;

if (publishCode !== 0) {
  await writePackage(previousPackageJson);
  console.error(
    `Publish failed. Restored package.json to ${previous}.\n` +
      "npm requires 2FA for publish. Either:\n" +
      "  1. Open the npm auth URL printed above, finish browser auth, retry\n" +
      "  2. bun run release --patch --otp=123456  (authenticator code)\n" +
      "  3. Create an Automation token at https://www.npmjs.com/settings/~/tokens\n" +
      "     and put it in ~/.npmrc as //registry.npmjs.org/:_authToken=...",
  );
  process.exit(publishCode);
}

const tag = `v${next}`;
const repoRoot = resolve(root, "..");
await $`git add package/package.json`.cwd(repoRoot);
await $`git commit -m ${`Release ${tag}.`}`.cwd(repoRoot);
await $`git tag ${tag}`.cwd(repoRoot);

console.log(`Published react-icon-transition@${next} and created tag ${tag}.`);
console.log("Push when ready: git push && git push --tags");
