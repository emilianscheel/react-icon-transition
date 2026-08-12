import { describe, expect, test } from "bun:test";
import { GlobalRegistrator } from "@happy-dom/global-registrator";
import {
  centroid,
  interpolatePaths,
  isFillOnlyIcon,
  mapPoint,
  mapStroke,
  pairStrokes,
  parseViewBox,
} from "../src/geometry";
import type { Point } from "../src/geometry";
import { installSvgGeometryPolyfill } from "./svgGeometryPolyfill";

function stroke(...coords: number[]): { points: Point[] } {
  const points: Point[] = [];
  for (let index = 0; index < coords.length; index += 2) {
    points.push({ x: coords[index]!, y: coords[index + 1]! });
  }
  return { points };
}

describe("geometry normalization", () => {
  test("calculates a stable centroid", () => {
    expect(centroid([{ x: 0, y: 2 }, { x: 4, y: 6 }])).toEqual({ x: 2, y: 4 });
  });

  test("pairs nearby strokes with equal point counts", () => {
    const pairs = pairStrokes(
      [stroke(0, 0, 2, 0, 4, 0)],
      [stroke(0, 1, 2, 1, 4, 1)],
    );
    expect(pairs).toHaveLength(1);
    expect(pairs[0]!.from).toHaveLength(3);
    expect(pairs[0]!.to).toHaveLength(3);
  });

  test("collapses unmatched strokes around their own center", () => {
    const appearing = pairStrokes([], [stroke(2, 2, 6, 2)])[0]!;
    expect(appearing.from.every((point) => point.x === 4 && point.y === 2)).toBe(true);
    expect(appearing.from).toHaveLength(2);
    expect(appearing.fade).toBe("in");

    const disappearing = pairStrokes([stroke(2, 2, 6, 2)], [])[0]!;
    expect(disappearing.to.every((point) => point.x === 4 && point.y === 2)).toBe(true);
    expect(disappearing.to).toHaveLength(2);
    expect(disappearing.fade).toBe("out");
  });

  test("interpolates in both directions without changing topology", () => {
    const pairs = [{
      from: [{ x: 0, y: 0 }, { x: 2, y: 0 }],
      to: [{ x: 0, y: 2 }, { x: 2, y: 2 }],
    }];
    expect(interpolatePaths(pairs, 0)).toEqual([{ d: "M0 0 L2 0", opacity: 1 }]);
    expect(interpolatePaths(pairs, 0.5)).toEqual([{ d: "M0 1 L2 1", opacity: 1 }]);
    expect(interpolatePaths(pairs, 1)).toEqual([{ d: "M0 2 L2 2", opacity: 1 }]);
  });

  test("fades collapsing strokes so round linecaps leave no remnant", () => {
    const disappearing = pairStrokes([stroke(2, 2, 6, 2)], [])[0]!;
    expect(interpolatePaths([disappearing], 0)[0]!.opacity).toBe(1);
    expect(interpolatePaths([disappearing], 0.5)[0]!.opacity).toBe(0.5);
    expect(interpolatePaths([disappearing], 1)[0]!.opacity).toBe(0);

    const appearing = pairStrokes([], [stroke(2, 2, 6, 2)])[0]!;
    expect(interpolatePaths([appearing], 0)[0]!.opacity).toBe(0);
    expect(interpolatePaths([appearing], 1)[0]!.opacity).toBe(1);
  });

  test("maps points between viewBoxes", () => {
    const from = { x: 0, y: 0, width: 100, height: 50 };
    const to = { x: 0, y: 0, width: 24, height: 24 };
    expect(mapPoint({ x: 50, y: 25 }, from, to)).toEqual({ x: 12, y: 12 });
    expect(mapStroke(stroke(0, 0, 100, 50), from, to).points).toEqual([
      { x: 0, y: 0 },
      { x: 24, y: 24 },
    ]);
  });

  test("parses viewBox attributes and detects fill-only icons", () => {
    GlobalRegistrator.register();
    installSvgGeometryPolyfill();
    try {
      document.body.innerHTML = `
        <svg id="stroke" viewBox="0 0 48 48" fill="none" stroke="currentColor">
          <path d="M0 0 L48 0" />
        </svg>
        <svg id="fill" viewBox="10 10 20 20" fill="currentColor">
          <circle cx="20" cy="20" r="5" />
        </svg>
      `;
      const strokeSvg = document.querySelector<SVGSVGElement>("#stroke");
      const fillSvg = document.querySelector<SVGSVGElement>("#fill");
      expect(parseViewBox(strokeSvg)).toEqual({ x: 0, y: 0, width: 48, height: 48 });
      expect(parseViewBox(fillSvg)).toEqual({ x: 10, y: 10, width: 20, height: 20 });
      expect(isFillOnlyIcon(strokeSvg)).toBe(false);
      expect(isFillOnlyIcon(fillSvg)).toBe(true);
      document.body.innerHTML = "";
    } finally {
      GlobalRegistrator.unregister();
    }
  });
});
