# react-icon-transition workspace

This repository contains two independent Bun projects:

- `package/` — the publishable `react-icon-transition` React package.
- `website/` — a Next.js interactive test gallery using the local package.

## Start the gallery

```sh
cd package
bun install
bun run build

cd ../website
bun install
bun run dev
```

Open `http://localhost:3000`.

## Validate everything

```sh
cd package
bun test
bun run check
bun run build
bun run pack:dry

cd ../website
bun run lint
bun run build
```

## Publish

Authenticate with npm, then from `package/`:

```sh
bun run release --patch
bun run release --minor
bun run release --major
```

This bumps the version, runs checks/tests/build, publishes to npm, and creates a local git commit + `vX.Y.Z` tag. Push afterwards with `git push && git push --tags`.
