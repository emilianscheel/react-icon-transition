# react-icon-transition

Smooth, reversible transitions between any two React SVG icons — geometry morph (`liquid`) or scale-and-blur swap (`blur`).

## Install

```sh
bun add react-icon-transition
```

## Use

```tsx
"use client";

import { useState } from "react";
import { Pause, Play } from "lucide-react";
import { IconTransition } from "react-icon-transition";

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

`default` and `target` each accept any React SVG icon: a component or a configured
element (Lucide, Heroicons, inline `<svg>`, etc.). Endpoint props are independent.
The component renders the selected endpoint during SSR, reverses from its current
geometry when toggled mid-animation, and honors `prefers-reduced-motion`.

## API

| Prop       | Type                                                   | Default       |
| ---------- | ------------------------------------------------------ | ------------- |
| `status`   | `boolean`                                              | required      |
| `default`  | `ComponentType \| ReactElement`                        | required      |
| `target`   | `ComponentType \| ReactElement`                        | required      |
| `duration` | `number`                                               | `300`         |
| `easing`   | `linear \| ease \| ease-in \| ease-out \| ease-in-out` | `ease-in-out` |
| `type`     | `liquid \| blur`                                       | `liquid`      |

`liquid` morphs stroke geometry between icons. Best for outline/stroke SVGs. Filled icons (or icons with no sampleable geometry) automatically fall back to `blur`. `blur` scales down and blurs, swaps the icon at the midpoint, then unblurs and scales back up.
