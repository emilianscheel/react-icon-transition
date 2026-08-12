export const BLUR_SCALE = 0.75;
export const BLUR_PX = 6;

export interface BlurFrame {
  showTarget: boolean;
  scale: number;
  blur: number;
}

function lerp(from: number, to: number, amount: number): number {
  return from + (to - from) * amount;
}

/** Maps 0–1 progress to scale/blur intensity with an icon swap at 0.5. */
export function blurFrame(progress: number): BlurFrame {
  const amount = Math.min(1, Math.max(0, progress));
  const intensity = 1 - Math.abs(amount - 0.5) * 2;
  return {
    showTarget: amount >= 0.5,
    scale: lerp(1, BLUR_SCALE, intensity),
    blur: lerp(0, BLUR_PX, intensity),
  };
}
