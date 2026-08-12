"use client";

import { useEffect, useRef, useState } from "react";
import {
  Check,
  Copy,
  FileText,
  Menu,
  Moon,
  Pause,
  Play,
  Sun,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import {
  IconTransition,
  type IconTransitionSource,
  type IconTransitionType,
} from "react-icon-transition";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const INSTALL_CMD = "bun install react-icon-transition";
const cardClass =
  "w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-left";

type DemoId = "play" | "sun" | "volume" | "menu";

const demos: {
  id: DemoId;
  from: IconTransitionSource;
  to: IconTransitionSource;
  fromName: string;
  toName: string;
  label: string;
}[] = [
  {
    id: "play",
    from: <Play aria-hidden="true" size={18} />,
    to: <Pause aria-hidden="true" size={18} />,
    fromName: "Play",
    toName: "Pause",
    label: "Play Pause",
  },
  {
    id: "sun",
    from: <Sun aria-hidden="true" size={18} />,
    to: <Moon aria-hidden="true" size={18} />,
    fromName: "Sun",
    toName: "Moon",
    label: "Sun Moon",
  },
  {
    id: "volume",
    from: <Volume2 aria-hidden="true" size={18} />,
    to: <VolumeX aria-hidden="true" size={18} />,
    fromName: "Volume2",
    toName: "VolumeX",
    label: "Volume Mute",
  },
  {
    id: "menu",
    from: <Menu aria-hidden="true" size={18} />,
    to: <X aria-hidden="true" size={18} />,
    fromName: "Menu",
    toName: "X",
    label: "Menu Close",
  },
];

const initialActive: Record<DemoId, boolean> = {
  play: false,
  sun: false,
  volume: false,
  menu: false,
};

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

function CopyGlyph({ copied }: { copied: boolean }) {
  return (
    <span className="flex size-7 shrink-0 items-center justify-center" aria-hidden="true">
      <IconTransition
        status={copied}
        default={<Copy aria-hidden="true" size={14} />}
        target={<Check aria-hidden="true" size={14} />}
      />
    </span>
  );
}

function highlightJsx(code: string) {
  const parts: { text: string; className?: string }[] = [];
  const pattern =
    /(\/\/.*$)|(\b(?:import|from|export|const|let|var|return|function|true|false|null)\b)|(\b[A-Z][A-Za-z0-9]*)|([{}()[\]])|(=)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(<\/?[A-Za-z][A-Za-z0-9.]*)|(\/?>)|(\b[a-z][A-Za-z0-9]*\b)/gm;

  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(code)) !== null) {
    if (match.index > last) {
      parts.push({ text: code.slice(last, match.index) });
    }
    const [text, comment, keyword, component, punct, eq, string, tagOpen, tagClose, ident] =
      match;
    let className: string | undefined;
    if (comment) className = "text-neutral-400";
    else if (keyword) className = "text-purple-700";
    else if (component || tagOpen) className = "text-sky-700";
    else if (tagClose || punct || eq) className = "text-neutral-500";
    else if (string) className = "text-amber-700";
    else if (ident) className = "text-emerald-700";
    parts.push({ text, className });
    last = match.index + text.length;
  }
  if (last < code.length) parts.push({ text: code.slice(last) });
  return parts;
}

function exampleCode(type: IconTransitionType, fromName: string, toName: string) {
  return `<IconTransition
  status={active}
  default={<${fromName} aria-hidden="true" size={18} />}
  target={<${toName} aria-hidden="true" size={18} />}
  type="${type}"
/>`;
}

function ExampleCode({
  type,
  fromName,
  toName,
}: {
  type: IconTransitionType;
  fromName: string;
  toName: string;
}) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<number | null>(null);
  const code = exampleCode(type, fromName, toName);

  useEffect(() => () => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
  }, []);

  async function copy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? "Copied example" : "Copy example"}
      className={`${cardClass} relative cursor-pointer py-3 pr-10 transition-colors hover:bg-neutral-100`}
    >
      <span className="absolute top-2 right-2">
        <CopyGlyph copied={copied} />
      </span>
      <pre className="overflow-x-auto font-mono text-[11px] leading-relaxed whitespace-pre sm:text-xs">
        <code>
          {highlightJsx(code).map((part, index) =>
            part.className ? (
              <span key={index} className={part.className}>
                {part.text}
              </span>
            ) : (
              <span key={index}>{part.text}</span>
            ),
          )}
        </code>
      </pre>
    </button>
  );
}

function Demo({
  from,
  to,
  label,
  type,
  active,
  onToggle,
}: {
  from: IconTransitionSource;
  to: IconTransitionSource;
  label: string;
  type: IconTransitionType;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={active}
      aria-label={label}
      className="flex size-9 cursor-pointer items-center justify-center rounded-full text-foreground transition-colors hover:bg-neutral-100"
    >
      <IconTransition
        key={type}
        status={active}
        default={from}
        target={to}
        type={type}
      />
    </button>
  );
}

function DemoGrid({
  type,
  activeById,
  onToggle,
}: {
  type: IconTransitionType;
  activeById: Record<DemoId, boolean>;
  onToggle: (id: DemoId) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
      {demos.map((demo) => (
        <Demo
          key={demo.id}
          from={demo.from}
          to={demo.to}
          type={type}
          label={`${demo.label} ${type}`}
          active={activeById[demo.id]}
          onToggle={() => onToggle(demo.id)}
        />
      ))}
    </div>
  );
}

function InstallBox() {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
  }, []);

  async function copy() {
    await navigator.clipboard.writeText(INSTALL_CMD);
    setCopied(true);
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? "Copied" : "Copy install command"}
      className={`${cardClass} relative flex cursor-pointer items-center pr-10 transition-colors hover:bg-neutral-100`}
    >
      <code className="flex-1 text-xs sm:text-sm">{INSTALL_CMD}</code>
      <span className="absolute top-1/2 right-2 -translate-y-1/2">
        <CopyGlyph copied={copied} />
      </span>
    </button>
  );
}

export default function Home() {
  const [type, setType] = useState<IconTransitionType>("liquid");
  const [demoId, setDemoId] = useState<DemoId>("play");
  const [activeById, setActiveById] = useState(initialActive);
  const activeDemo = demos.find((demo) => demo.id === demoId) ?? demos[0]!;

  function toggleDemo(id: DemoId) {
    setDemoId(id);
    setActiveById((current) => ({ ...current, [id]: !current[id] }));
  }

  return (
    <main className="relative min-h-svh bg-white px-6 text-sm text-black">
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2 sm:top-6 sm:right-6">
        <Button
          asChild
          variant="outline"
          size="icon"
          className="cursor-pointer rounded-full"
        >
          <a href="/llms.txt" target="_blank" rel="noreferrer" aria-label="llms.txt">
            <FileText className="size-4" />
          </a>
        </Button>
        <Button
          asChild
          variant="outline"
          size="icon"
          className="cursor-pointer rounded-full"
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
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex w-full max-w-md flex-col items-center gap-5 text-center">
          <h1 className="flex items-baseline justify-center gap-2 text-base font-medium tracking-tight">
            <span>react-icon-transition</span>
            <span className="font-medium text-neutral-400">~3.8 KB gzip</span>
          </h1>
          <p className="text-xs text-neutral-400 sm:text-sm">
            animate any svg icon in react
          </p>
          <div className="flex w-full flex-col gap-5">
            <InstallBox />
            <ExampleCode
              type={type}
              fromName={activeDemo.fromName}
              toName={activeDemo.toName}
            />
          </div>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-4 pb-8 sm:pb-10">
        <Tabs
          value={type}
          onValueChange={(value) => {
            if (value === "liquid" || value === "blur") setType(value);
          }}
          className="items-center"
        >
          <TabsList>
            <TabsTrigger value="liquid">liquid</TabsTrigger>
            <TabsTrigger value="blur">blur</TabsTrigger>
          </TabsList>
        </Tabs>
        <DemoGrid
          type={type}
          activeById={activeById}
          onToggle={toggleDemo}
        />
      </div>
    </main>
  );
}
