"use client";

import { useEffect, useRef, useState } from "react";
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
import {
  IconTransition,
  type IconTransitionEasing,
  type IconTransitionSource,
} from "icon-transition";

type Demo = {
  name: string;
  description: string;
  from: IconTransitionSource;
  to: LucideIcon;
  accent: string;
};

const demos: Demo[] = [
  {
    name: "Playback",
    description: "One closed stroke becomes two parallel lines.",
    from: <Play aria-hidden="true" />,
    to: Pause,
    accent: "lime",
  },
  {
    name: "Theme",
    description: "A radiant sun folds into a quiet crescent.",
    from: <Sun aria-hidden="true" />,
    to: Moon,
    accent: "violet",
  },
  {
    name: "Audio",
    description: "Waveforms collapse into a muted mark.",
    from: <Volume2 aria-hidden="true" />,
    to: VolumeX,
    accent: "orange",
  },
  {
    name: "Navigation",
    description: "Parallel rails resolve into a close action.",
    from: <Menu aria-hidden="true" />,
    to: X,
    accent: "cyan",
  },
];

const easingOptions: IconTransitionEasing[] = [
  "linear",
  "ease",
  "ease-in",
  "ease-out",
  "ease-in-out",
];

function DemoCard({
  demo,
  duration,
  easing,
  pulse,
}: {
  demo: Demo;
  duration: number;
  easing: IconTransitionEasing;
  pulse: number;
}) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (pulse === 0) return;
    const timers = [0, 80, 160, 240, 320].map((delay, index) =>
      window.setTimeout(() => setActive(index % 2 === 0), delay),
    );
    return () => timers.forEach(window.clearTimeout);
  }, [pulse]);

  return (
    <button
      className={`demo-card accent-${demo.accent}`}
      onClick={() => setActive((value) => !value)}
      aria-pressed={active}
      aria-label={`${demo.name}: show ${active ? "default" : "target"} icon`}
    >
      <span className="card-number" aria-hidden="true">0{demos.indexOf(demo) + 1}</span>
      <span className="icon-stage" aria-hidden="true">
        <IconTransition
          status={active}
          default={demo.from}
          target={demo.to}
          duration={duration}
          easing={easing}
        />
      </span>
      <span className="card-copy">
        <strong>{demo.name}</strong>
        <span>{demo.description}</span>
      </span>
      <span className="state-pill">{active ? "Target" : "Default"}</span>
    </button>
  );
}

export default function Home() {
  const [duration, setDuration] = useState(300);
  const [easing, setEasing] = useState<IconTransitionEasing>("ease-in-out");
  const [pulse, setPulse] = useState(0);
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<number | null>(null);

  useEffect(() => () => {
    if (copyTimer.current !== null) window.clearTimeout(copyTimer.current);
  }, []);

  const code = `<IconTransition\n  status={isPlaying}\n  default={<Play style={{ color: "green" }} />}\n  target={Pause}\n  duration={${duration}}\n  easing="${easing}"\n/>`;

  async function copyCode() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    if (copyTimer.current !== null) window.clearTimeout(copyTimer.current);
    copyTimer.current = window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <main>
      <nav aria-label="Primary">
        <a className="wordmark" href="#top" aria-label="Icon Transition home">
          <span className="mark" aria-hidden="true"><span /><span /></span>
          icon-transition
        </a>
        <a className="docs-link" href="#usage">Usage <span aria-hidden="true">↘</span></a>
      </nav>

      <section className="hero" id="top">
        <div className="eyebrow"><span /> Geometry, not opacity</div>
        <h1>Icons that<br /><em>change their mind.</em></h1>
        <p className="lede">
          A tiny React component for smooth, reversible transitions between any two Lucide icons.
        </p>
        <div className="hero-actions">
          <button className="primary-action" onClick={() => setPulse((value) => value + 1)}>
            Stress test transitions
          </button>
          <code>bun add icon-transition</code>
        </div>
      </section>

      <section className="lab" aria-labelledby="lab-heading">
        <div className="section-heading">
          <div>
            <span className="section-kicker">Interactive lab</span>
            <h2 id="lab-heading">Tap any transition</h2>
          </div>
          <p>Toggle slowly to inspect the shape, or stress test to reverse every animation mid-flight.</p>
        </div>

        <div className="controls" aria-label="Animation controls">
          <label>
            <span>Duration <output>{duration}ms</output></span>
            <input
              type="range"
              min="0"
              max="1000"
              step="50"
              value={duration}
              onChange={(event) => setDuration(Number(event.target.value))}
            />
          </label>
          <label>
            <span>Easing</span>
            <select value={easing} onChange={(event) => setEasing(event.target.value as IconTransitionEasing)}>
              {easingOptions.map((option) => <option key={option}>{option}</option>)}
            </select>
          </label>
          <button className="stress-button" onClick={() => setPulse((value) => value + 1)}>
            Rapid reverse ×5
          </button>
        </div>

        <div className="gallery">
          {demos.map((demo) => (
            <DemoCard key={demo.name} demo={demo} duration={duration} easing={easing} pulse={pulse} />
          ))}
        </div>

        <div className="motion-note">
          <span aria-hidden="true">◎</span>
          <p><strong>Motion, respectfully.</strong> If your system requests reduced motion, every transition becomes an instant, stable swap.</p>
        </div>
      </section>

      <section className="usage" id="usage" aria-labelledby="usage-heading">
        <div>
          <span className="section-kicker">One component</span>
          <h2 id="usage-heading">Drop it in.<br />Toggle a boolean.</h2>
          <p>Pass icon components or configured elements. Each endpoint keeps its own color, size, stroke, class, and accessible label.</p>
        </div>
        <div className="code-window">
          <div className="code-bar">
            <span>player.tsx</span>
            <button onClick={copyCode}>{copied ? "Copied" : "Copy"}</button>
          </div>
          <pre><code>{code}</code></pre>
        </div>
      </section>

      <footer>
        <span>icon-transition</span>
        <span>Built for Lucide · Powered by Bun</span>
      </footer>
    </main>
  );
}

