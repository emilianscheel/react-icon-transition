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

export function centroid(points: Point[]): Point {
  if (points.length === 0) return { x: 12, y: 12 };
  const total = points.reduce(
    (sum, point) => ({ x: sum.x + point.x, y: sum.y + point.y }),
    { x: 0, y: 0 },
  );
  return { x: total.x / points.length, y: total.y / points.length };
}

function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function resamplePoints(points: Point[], count: number): Point[] {
  if (count <= 0) return [];
  if (points.length === 0) return Array.from({ length: count }, () => ({ x: 12, y: 12 }));
  if (points.length === 1) return Array.from({ length: count }, () => ({ ...points[0]! }));

  const segments: number[] = [];
  let total = 0;
  for (let index = 1; index < points.length; index += 1) {
    const length = distance(points[index - 1]!, points[index]!);
    segments.push(length);
    total += length;
  }

  if (total === 0) return Array.from({ length: count }, () => ({ ...points[0]! }));

  return Array.from({ length: count }, (_, index) => {
    const desired = count === 1 ? 0 : (index / (count - 1)) * total;
    let elapsed = 0;
    for (let segmentIndex = 0; segmentIndex < segments.length; segmentIndex += 1) {
      const length = segments[segmentIndex]!;
      if (elapsed + length >= desired || segmentIndex === segments.length - 1) {
        const start = points[segmentIndex]!;
        const end = points[segmentIndex + 1]!;
        const amount = length === 0 ? 0 : (desired - elapsed) / length;
        return {
          x: start.x + (end.x - start.x) * amount,
          y: start.y + (end.y - start.y) * amount,
        };
      }
      elapsed += length;
    }
    return { ...points[points.length - 1]! };
  });
}

function collapsedStroke(stroke: SampledStroke, count: number): Point[] {
  const center = centroid(stroke.points);
  return Array.from({ length: count }, () => ({ ...center }));
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
      const count = Math.max(2, fromStroke.points.length);
      pairs.push({
        from: resamplePoints(fromStroke.points, count),
        to: collapsedStroke(fromStroke, count),
        fade: "out",
      });
      continue;
    }

    remainingTargets.delete(closestIndex);
    const targetStroke = toStrokes[closestIndex]!;
    const count = Math.max(2, fromStroke.points.length, targetStroke.points.length);
    pairs.push({
      from: resamplePoints(fromStroke.points, count),
      to: resamplePoints(targetStroke.points, count),
    });
  }

  for (const targetIndex of remainingTargets) {
    const targetStroke = toStrokes[targetIndex]!;
    const count = Math.max(2, targetStroke.points.length);
    pairs.push({
      from: collapsedStroke(targetStroke, count),
      to: resamplePoints(targetStroke.points, count),
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
    const count = Math.min(64, Math.max(8, Math.ceil(length / 1.25)));
    const points = Array.from({ length: count }, (_, index) => {
      const point = element.getPointAtLength((index / (count - 1)) * length);
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

