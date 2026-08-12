import type { IconTransitionEasing } from "./types";
export declare const DEFAULT_DURATION = 300;
export declare const DEFAULT_EASING: IconTransitionEasing;
export declare function normalizeDuration(duration: number | undefined): number;
export declare function getEasing(easing: IconTransitionEasing): (value: number) => number;
export declare function getAnimationDuration(from: number, to: number, duration: number): number;
//# sourceMappingURL=easing.d.ts.map