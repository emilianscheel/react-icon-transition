export interface Point {
    x: number;
    y: number;
}
export interface ViewBox {
    x: number;
    y: number;
    width: number;
    height: number;
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
export declare function parseViewBox(svg: SVGSVGElement | null): ViewBox;
export declare function mapPoint(point: Point, from: ViewBox, to: ViewBox): Point;
export declare function mapStroke(stroke: SampledStroke, from: ViewBox, to: ViewBox): SampledStroke;
export declare function viewBoxString(box: ViewBox): string;
/** True when the SVG is explicitly filled and has no stroke geometry to morph. */
export declare function isFillOnlyIcon(svg: SVGSVGElement | null): boolean;
export declare function resamplePoints(points: Point[], count: number): Point[];
export declare function pairStrokes(fromStrokes: SampledStroke[], toStrokes: SampledStroke[]): StrokePair[];
export declare function interpolatePaths(pairs: StrokePair[], progress: number): InterpolatedPath[];
export declare function sampleSvg(svg: SVGSVGElement | null): SampledStroke[];
