import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { Pause, Play } from "lucide-react";
import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString, renderToStaticMarkup } from "react-dom/server";
import { IconTransition } from "../src/IconTransition";
import { resolveSource, sourceProps } from "../src/source";
import { installSvgGeometryPolyfill } from "./svgGeometryPolyfill";

function StrokePlus({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

function StrokeMinus({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M5 12h14" />
    </svg>
  );
}

function FilledCircle({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="12" cy="12" r="8" />
    </svg>
  );
}

function FilledSquare({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <rect x="6" y="6" width="12" height="12" />
    </svg>
  );
}

describe("icon sources", () => {
  test("resolves a component source", () => {
    expect(renderToStaticMarkup(resolveSource(Play))).toContain("lucide-play");
  });

  test("preserves configured element props", () => {
    const source = <Play style={{ color: "green" }} aria-label="Play" />;
    expect(sourceProps(source).style).toEqual({ color: "green" });
    expect(sourceProps(source)["aria-label"]).toBe("Play");
  });

  test("SSR renders the endpoint selected by status", () => {
    const initial = renderToStaticMarkup(
      <IconTransition status={false} default={<Play style={{ color: "green" }} />} target={Pause} />,
    );
    const target = renderToStaticMarkup(
      <IconTransition status default={<Play style={{ color: "green" }} />} target={Pause} />,
    );
    expect(initial).toContain("lucide-play");
    expect(initial).toContain("color:green");
    expect(target).toContain("lucide-pause");
    expect(target).not.toContain("color:green");
  });

  test("SSR works with custom inline SVG icons", () => {
    const initial = renderToStaticMarkup(
      <IconTransition status={false} default={<StrokePlus size={18} />} target={<StrokeMinus size={18} />} />,
    );
    const target = renderToStaticMarkup(
      <IconTransition status default={<StrokePlus size={18} />} target={<StrokeMinus size={18} />} />,
    );
    expect(initial).toContain("M12 5v14");
    expect(target).toContain("M5 12h14");
    expect(target).not.toContain("M12 5v14");
  });
});

describe("hydration", () => {
  beforeAll(() => {
    GlobalRegistrator.register();
    installSvgGeometryPolyfill();
  });
  afterAll(() => GlobalRegistrator.unregister());

  test("hydrates the server endpoint without a mismatch", async () => {
    const view = <IconTransition status={false} default={Play} target={Pause} />;
    const container = document.createElement("div");
    container.innerHTML = renderToString(view);
    document.body.append(container);
    const errors: unknown[][] = [];
    const originalError = console.error;
    console.error = (...args: unknown[]) => errors.push(args);
    let root: ReturnType<typeof hydrateRoot> | undefined;
    try {
      await act(async () => {
        root = hydrateRoot(container, view);
        await Promise.resolve();
      });
      expect(errors.flat().join(" ")).not.toContain("hydration mismatch");
    } finally {
      await act(async () => root?.unmount());
      console.error = originalError;
      container.remove();
    }
  });

  test("blur type client render shows the target icon when status is true", async () => {
    const { createRoot } = await import("react-dom/client");
    const container = document.createElement("div");
    document.body.append(container);
    let root: ReturnType<typeof createRoot> | undefined;
    try {
      await act(async () => {
        root = createRoot(container);
        root.render(
          <IconTransition status default={Play} target={Pause} type="blur" duration={0} />,
        );
        await Promise.resolve();
      });
      expect(container.innerHTML).toContain("lucide-pause");
      expect(container.querySelector(".icon-transition-blur")).not.toBeNull();
    } finally {
      await act(async () => root?.unmount());
      container.remove();
    }
  });

  test("custom stroke SVGs morph with liquid", async () => {
    const { createRoot } = await import("react-dom/client");
    const container = document.createElement("div");
    document.body.append(container);
    let root: ReturnType<typeof createRoot> | undefined;
    try {
      await act(async () => {
        root = createRoot(container);
        root.render(
          <IconTransition
            status={false}
            default={<StrokePlus size={18} />}
            target={<StrokeMinus size={18} />}
            type="liquid"
            duration={0}
          />,
        );
        await Promise.resolve();
      });
      await act(async () => {
        await Promise.resolve();
      });
      expect(container.querySelector(".icon-transition-blur")).toBeNull();
      expect(container.querySelector("svg.icon-transition")).not.toBeNull();
      expect(container.querySelectorAll("svg.icon-transition path").length).toBeGreaterThan(0);
    } finally {
      await act(async () => root?.unmount());
      container.remove();
    }
  });

  test("filled SVGs fall back to blur when liquid is requested", async () => {
    const { createRoot } = await import("react-dom/client");
    const container = document.createElement("div");
    document.body.append(container);
    let root: ReturnType<typeof createRoot> | undefined;
    try {
      await act(async () => {
        root = createRoot(container);
        root.render(
          <IconTransition
            status
            default={<FilledCircle size={18} />}
            target={<FilledSquare size={18} />}
            type="liquid"
            duration={0}
          />,
        );
        await Promise.resolve();
      });
      await act(async () => {
        await Promise.resolve();
      });
      expect(container.querySelector(".icon-transition-blur")).not.toBeNull();
      expect(container.innerHTML).toContain("rect");
    } finally {
      await act(async () => root?.unmount());
      container.remove();
    }
  });
});

describe("blur type", () => {
  test("SSR renders the endpoint selected by status", () => {
    const initial = renderToStaticMarkup(
      <IconTransition status={false} default={Play} target={Pause} type="blur" />,
    );
    const target = renderToStaticMarkup(
      <IconTransition status default={Play} target={Pause} type="blur" />,
    );
    expect(initial).toContain("lucide-play");
    expect(target).toContain("lucide-pause");
  });
});
