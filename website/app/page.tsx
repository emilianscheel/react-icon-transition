"use client";

import { useState } from "react";
import {
  Menu,
  Moon,
  Pause,
  Play,
  Sun,
  Volume2,
  VolumeX,
  X,
  type LucideIcon,
} from "lucide-react";
import { IconTransition, type IconTransitionSource } from "icon-transition";
import { Button } from "@/components/ui/button";

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

const demos: {
  from: IconTransitionSource;
  to: LucideIcon;
  label: string;
}[] = [
  { from: <Play aria-hidden="true" />, to: Pause, label: "Play Pause" },
  { from: <Sun aria-hidden="true" />, to: Moon, label: "Sun Moon" },
  { from: <Volume2 aria-hidden="true" />, to: VolumeX, label: "Volume Mute" },
  { from: <Menu aria-hidden="true" />, to: X, label: "Menu Close" },
];

function Demo({
  from,
  to,
  label,
}: {
  from: IconTransitionSource;
  to: LucideIcon;
  label: string;
}) {
  const [active, setActive] = useState(false);

  return (
    <button
      type="button"
      onClick={() => setActive((value) => !value)}
      aria-pressed={active}
      aria-label={label}
      className="flex size-16 items-center justify-center text-foreground sm:size-20"
    >
      <IconTransition status={active} default={from} target={to} />
    </button>
  );
}

export default function Home() {
  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center gap-10 bg-white px-6 text-black">
      <Button
        asChild
        variant="outline"
        size="icon"
        className="absolute top-4 right-4 rounded-full sm:top-6 sm:right-6"
      >
        <a
          href="https://github.com/emilianscheel/react-icon-transition"
          target="_blank"
          rel="noreferrer"
          aria-label="GitHub"
        >
          <GitHubIcon className="size-4" />
        </a>
      </Button>

      <div className="flex flex-col items-center gap-2 text-center">
        <code className="text-sm sm:text-base">bun install react-icon-transition</code>
        <h1 className="text-lg font-medium tracking-tight sm:text-xl">
          react-icon-transition
        </h1>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8">
        {demos.map((demo) => (
          <Demo key={demo.label} {...demo} />
        ))}
      </div>
    </main>
  );
}
