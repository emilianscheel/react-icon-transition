# icon-transition

Smooth, reversible geometry transitions between any two `lucide-react` icons.

## Install

```sh
bun add icon-transition lucide-react
```

## Use

```tsx
"use client";

import { useState } from "react";
import { Pause, Play } from "lucide-react";
import { IconTransition } from "icon-transition";

export function PlayerButton() {
  const [playing, setPlaying] = useState(false);

  return (
    <button onClick={() => setPlaying((value) => !value)}>
      <IconTransition
        status={playing}
        default={<Play style={{ color: "green" }} />}
        target={Pause}
        duration={300}
        easing="ease-in-out"
      />
    </button>
  );
}
```

`default` and `target` each accept either a Lucide component or a configured
Lucide element. Endpoint props are independent. The component renders the
selected endpoint during SSR, reverses from its current geometry when toggled
mid-animation, and honors `prefers-reduced-motion`.

## API

| Prop | Type | Default |
| --- | --- | --- |
| `status` | `boolean` | required |
| `default` | `LucideIcon \| ReactElement<LucideProps>` | required |
| `target` | `LucideIcon \| ReactElement<LucideProps>` | required |
| `duration` | `number` | `300` |
| `easing` | `linear \| ease \| ease-in \| ease-out \| ease-in-out` | `ease-in-out` |

## Develop

```sh
bun install
bun test
bun run check
bun run build
bun run pack:dry
```

