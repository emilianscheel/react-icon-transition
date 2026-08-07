import { describe, expect, test } from "bun:test";
import {
  DEFAULT_DURATION,
  getAnimationDuration,
  getEasing,
  normalizeDuration,
} from "../src/easing";
import { prefersReducedMotion } from "../src/motion";

describe("animation controls", () => {
  test("validates duration", () => {
    expect(normalizeDuration(undefined)).toBe(DEFAULT_DURATION);
    expect(normalizeDuration(-1)).toBe(DEFAULT_DURATION);
    expect(normalizeDuration(Number.NaN)).toBe(DEFAULT_DURATION);
    expect(normalizeDuration(0)).toBe(0);
    expect(normalizeDuration(450)).toBe(450);
  });

  test("all easings preserve endpoints", () => {
    for (const name of ["linear", "ease", "ease-in", "ease-out", "ease-in-out"] as const) {
      expect(getEasing(name)(0)).toBe(0);
      expect(getEasing(name)(1)).toBe(1);
    }
  });

  test("reversal duration is proportional to remaining geometry", () => {
    expect(getAnimationDuration(0.75, 0, 400)).toBe(300);
    expect(getAnimationDuration(0.25, 1, 400)).toBe(300);
  });

  test("detects the reduced-motion preference", () => {
    expect(prefersReducedMotion(() => ({ matches: true }))).toBe(true);
    expect(prefersReducedMotion(() => ({ matches: false }))).toBe(false);
  });
});
