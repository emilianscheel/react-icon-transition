import { describe, expect, test } from "bun:test";
import {
  centroid,
  interpolatePaths,
  pairStrokes,
  resamplePoints,
} from "../src/geometry";

describe("geometry normalization", () => {
  test("resamples a line without moving its endpoints", () => {
    const points = resamplePoints([{ x: 0, y: 0 }, { x: 10, y: 0 }], 5);
    expect(points).toHaveLength(5);
    expect(points[0]).toEqual({ x: 0, y: 0 });
    expect(points[4]).toEqual({ x: 10, y: 0 });
    expect(points[2]).toEqual({ x: 5, y: 0 });
  });

  test("calculates a stable centroid", () => {
    expect(centroid([{ x: 0, y: 2 }, { x: 4, y: 6 }])).toEqual({ x: 2, y: 4 });
  });

  test("pairs nearby strokes and normalizes point counts", () => {
    const pairs = pairStrokes(
      [{ points: [{ x: 0, y: 0 }, { x: 2, y: 0 }] }],
      [{ points: [{ x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }] }],
    );
    expect(pairs).toHaveLength(1);
    expect(pairs[0]!.from).toHaveLength(3);
    expect(pairs[0]!.to).toHaveLength(3);
  });

  test("collapses unmatched strokes around their own center", () => {
    const appearing = pairStrokes([], [
      { points: [{ x: 2, y: 2 }, { x: 6, y: 2 }] },
    ])[0]!;
    expect(appearing.from.every((point) => point.x === 4 && point.y === 2)).toBe(true);

    const disappearing = pairStrokes([
      { points: [{ x: 2, y: 2 }, { x: 6, y: 2 }] },
    ], [])[0]!;
    expect(disappearing.to.every((point) => point.x === 4 && point.y === 2)).toBe(true);
  });

  test("interpolates in both directions without changing topology", () => {
    const pairs = [{
      from: [{ x: 0, y: 0 }, { x: 2, y: 0 }],
      to: [{ x: 0, y: 2 }, { x: 2, y: 2 }],
    }];
    expect(interpolatePaths(pairs, 0)).toEqual(["M0 0 L2 0"]);
    expect(interpolatePaths(pairs, 0.5)).toEqual(["M0 1 L2 1"]);
    expect(interpolatePaths(pairs, 1)).toEqual(["M0 2 L2 2"]);
  });
});

