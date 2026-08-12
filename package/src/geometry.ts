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

const GEOMETRY_SELECTOR = "path,line,polyline,polygon,rect,circle,ellipse";
const SAMPLE_COUNT = 24;

export function centroid(points: Point[]): Point {
  if (points.length === 0) return { x: 12, y: 12 };
  let x = 0;
  let y = 0;
  for (const point of points) {
    x += point.x;
    y += point.y;
  }
  return { x: x / points.length, y: y / points.length };
}

function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function collapsedStroke(stroke: SampledStroke): Point[] {
  const center = centroid(stroke.points);
  return Array.from({ length: stroke.points.length }, () => ({ ...center }));
}

export function pairStrokes(
  fromStrokes: SampledStroke[],
  toStrokes: SampledStroke[],
): StrokePair[] {
  const remainingTargets = new Set(toStrokes.map((_, index) => index));
  const pairs: StrokePair[] = [];

  for (const fromStroke of fromStrokes) {
    let closestIndex: number | undefined;
    let closestDistance = Number.POSITIVE_INFINITY;
    const fromCenter = centroid(fromStroke.points);

    for (const targetIndex of remainingTargets) {
      const candidateDistance = distance(
        fromCenter,
        centroid(toStrokes[targetIndex]!.points),
      );
      if (candidateDistance < closestDistance) {
        closestDistance = candidateDistance;
        closestIndex = targetIndex;
      }
    }

    if (closestIndex === undefined) {
      pairs.push({
        from: fromStroke.points,
        to: collapsedStroke(fromStroke),
        fade: "out",
      });
      continue;
    }

    remainingTargets.delete(closestIndex);
    pairs.push({
      from: fromStroke.points,
      to: toStrokes[closestIndex]!.points,
    });
  }

  for (const targetIndex of remainingTargets) {
    const targetStroke = toStrokes[targetIndex]!;
    pairs.push({
      from: collapsedStroke(targetStroke),
      to: targetStroke.points,
      fade: "in",
    });
  }

  return pairs;
}

function round(value: number): string {
  return Number(value.toFixed(3)).toString();
}

function fadeOpacity(fade: StrokeFade | undefined, progress: number): number {
  if (fade === "out") return 1 - progress;
  if (fade === "in") return progress;
  return 1;
}

export function interpolatePaths(pairs: StrokePair[], progress: number): InterpolatedPath[] {
  const amount = Math.min(1, Math.max(0, progress));
  return pairs.map(({ from, to, fade }) => {
    const points = from.map((point, index) => ({
      x: point.x + (to[index]!.x - point.x) * amount,
      y: point.y + (to[index]!.y - point.y) * amount,
    }));
    return {
      d: points
        .map((point, index) => `${index === 0 ? "M" : "L"}${round(point.x)} ${round(point.y)}`)
        .join(" "),
      opacity: fadeOpacity(fade, amount),
    };
  });
}

function sampleGeometry(element: SVGGeometryElement): SampledStroke | null {
  try {
    const length = element.getTotalLength();
    if (!Number.isFinite(length) || length <= 0) return null;
    const points = Array.from({ length: SAMPLE_COUNT }, (_, index) => {
      const point = element.getPointAtLength((index / (SAMPLE_COUNT - 1)) * length);
      return { x: point.x, y: point.y };
    });
    return { points };
  } catch {
    return null;
  }
}

export function sampleSvg(svg: SVGSVGElement | null): SampledStroke[] {
  if (!svg) return [];
  return Array.from(svg.querySelectorAll<SVGGeometryElement>(GEOMETRY_SELECTOR))
    .map(sampleGeometry)
    .filter((stroke): stroke is SampledStroke => stroke !== null);
}
