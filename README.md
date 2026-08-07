# icon-transition workspace

This repository contains two independent Bun projects:

- `package/` — the publishable `icon-transition` React package.
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

Confirm that the `icon-transition` name is available and that the metadata in
`package/package.json` is correct. Then authenticate with npm and run:

```sh
cd package
bun run prepublishOnly
npm publish --access public
```

Publishing itself is intentionally not automated by this repository.

