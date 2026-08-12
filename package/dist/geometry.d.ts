export interface Point {
    x: number;
    y: number;
}
export interface SampledStroke {
    points: Point[];
}
/** "out" fades as progress→1; "in" fades as progress→0. */
export type StrokeFade = "out" | "in";
export interface StrokePair {
    from: Point[];
    to: Point[];
    fade?: StrokeFade;
}
export interface InterpolatedPath {
    d: string;
    opacity: number;
}
export declare function centroid(points: Point[]): Point;
export declare function resamplePoints(points: Point[], count: number): Point[];
export declare function pairStrokes(fromStrokes: SampledStroke[], toStrokes: SampledStroke[]): StrokePair[];
export declare function interpolatePaths(pairs: StrokePair[], progress: number): InterpolatedPath[];
export declare function sampleSvg(svg: SVGSVGElement | null): SampledStroke[];
//# sourceMappingURL=geometry.d.ts.map