import type { IconTransitionEasing } from "./types";

export const DEFAULT_DURATION = 300;
export const DEFAULT_EASING: IconTransitionEasing = "ease-in-out";

export function normalizeDuration(duration: number | undefined): number {
  if (duration === undefined) return DEFAULT_DURATION;
  return Number.isFinite(duration) && duration >= 0
    ? duration
    : DEFAULT_DURATION;
}

export function getEasing(easing: IconTransitionEasing): (value: number) => number {
  switch (easing) {
    case "linear":
      return (value) => value;
    case "ease-in":
      return (value) => value * value * value;
    case "ease-out":
      return (value) => 1 - Math.pow(1 - value, 3);
    case "ease":
      return (value) => 1 - Math.pow(1 - value, 4);
    case "ease-in-out":
    default:
      return (value) =>
        value < 0.5
          ? 4 * value * value * value
          : 1 - Math.pow(-2 * value + 2, 3) / 2;
  }
}

export function getAnimationDuration(
  from: number,
  to: number,
  duration: number | undefined,
): number {
  return Math.abs(to - from) * normalizeDuration(duration);
}

