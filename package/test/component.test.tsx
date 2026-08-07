import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { Pause, Play } from "lucide-react";
import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString, renderToStaticMarkup } from "react-dom/server";
import { IconTransition } from "../src/IconTransition";
import { resolveSource, sourceProps } from "../src/source";

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
});

describe("hydration", () => {
  beforeAll(() => GlobalRegistrator.register());
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
});

