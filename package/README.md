# react-icon-transition

animate any svg icon in react

## install

```sh
bun add react-icon-transition
```

## use

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

## api

| Prop       | Type                                                   | Default       |
| ---------- | ------------------------------------------------------ | ------------- |
| `status`   | `boolean`                                              | required      |
| `default`  | `ComponentType \| ReactElement`                        | required      |
| `target`   | `ComponentType \| ReactElement`                        | required      |
| `duration` | `number`                                               | `300`         |
| `easing`   | `linear \| ease \| ease-in \| ease-out \| ease-in-out` | `ease-in-out` |
| `type`     | `liquid \| blur`                                       | `liquid`      |
