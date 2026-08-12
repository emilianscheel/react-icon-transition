# react-icon-transition

animate any svg icon in react

```sh
bun add react-icon-transition
```

## Example

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

## API

| Prop       | Type                                                   | Default       |
| ---------- | ------------------------------------------------------ | ------------- |
| `status`   | `boolean`                                              | required      |
| `default`  | `LucideIcon \| ReactElement<LucideProps>`              | required      |
| `target`   | `LucideIcon \| ReactElement<LucideProps>`              | required      |
| `duration` | `number`                                               | `300`         |
| `easing`   | `linear \| ease \| ease-in \| ease-out \| ease-in-out` | `ease-in-out` |
| `type`     | `liquid \| blur`                                       | `liquid`      |

`liquid` morphs stroke geometry between icons. `blur` scales down and blurs, swaps the icon at the midpoint, then unblurs and scales back up.
