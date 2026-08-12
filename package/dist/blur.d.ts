export declare const BLUR_SCALE = 0.5;
export declare const BLUR_PX = 6;
export interface BlurFrame {
    showTarget: boolean;
    scale: number;
    blur: number;
    opacity: number;
}
/** Maps 0–1 progress to opacity/scale/blur with an icon swap at 0.5. */
export declare function blurFrame(progress: number): BlurFrame;
//# sourceMappingURL=blur.d.ts.map