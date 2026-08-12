import { describe, expect, test } from "bun:test";
import { BLUR_PX, BLUR_SCALE, blurFrame } from "../src/blur";

describe("blurFrame", () => {
  test("endpoints are clear and show the correct icon", () => {
    expect(blurFrame(0)).toEqual({
      showTarget: false,
      scale: 1,
      blur: 0,
    });
    expect(blurFrame(1)).toEqual({
      showTarget: true,
      scale: 1,
      blur: 0,
    });
  });

  test("intensity peaks at the midpoint with an icon swap", () => {
    expect(blurFrame(0.5)).toEqual({
      showTarget: true,
      scale: BLUR_SCALE,
      blur: BLUR_PX,
    });
  });

  test("outgoing half shows default and incoming half shows target", () => {
    expect(blurFrame(0.25).showTarget).toBe(false);
    expect(blurFrame(0.25).scale).toBeCloseTo((1 + BLUR_SCALE) / 2);
    expect(blurFrame(0.25).blur).toBeCloseTo(BLUR_PX / 2);

    expect(blurFrame(0.75).showTarget).toBe(true);
    expect(blurFrame(0.75).scale).toBeCloseTo((1 + BLUR_SCALE) / 2);
    expect(blurFrame(0.75).blur).toBeCloseTo(BLUR_PX / 2);
  });

  test("clamps out-of-range progress", () => {
    expect(blurFrame(-1)).toEqual(blurFrame(0));
    expect(blurFrame(2)).toEqual(blurFrame(1));
  });
});
