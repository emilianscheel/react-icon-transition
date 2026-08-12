/** Minimal SVG geometry polyfill for happy-dom liquid morph tests. */
export function installSvgGeometryPolyfill() {
  const proto = (
    typeof SVGGeometryElement !== "undefined"
      ? SVGGeometryElement.prototype
      : typeof SVGPathElement !== "undefined"
        ? SVGPathElement.prototype
        : null
  ) as {
    getTotalLength?: () => number;
    getPointAtLength?: (distance: number) => DOMPoint;
  } | null;

  if (!proto) return;

  const originalLength = proto.getTotalLength;
  const originalPoint = proto.getPointAtLength;

  proto.getTotalLength = function getTotalLength(this: Element) {
    try {
      const value = originalLength?.call(this);
      if (typeof value === "number" && Number.isFinite(value) && value > 0) return value;
    } catch {
      // fall through to approximation
    }

    const tag = this.tagName.toLowerCase();
    if (tag === "circle") {
      return 2 * Math.PI * Number(this.getAttribute("r") || 0);
    }
    if (tag === "rect") {
      const width = Number(this.getAttribute("width") || 0);
      const height = Number(this.getAttribute("height") || 0);
      return 2 * (width + height);
    }
    if (tag === "line") {
      const x1 = Number(this.getAttribute("x1") || 0);
      const y1 = Number(this.getAttribute("y1") || 0);
      const x2 = Number(this.getAttribute("x2") || 0);
      const y2 = Number(this.getAttribute("y2") || 0);
      return Math.hypot(x2 - x1, y2 - y1);
    }
    const d = this.getAttribute("d");
    if (!d) return 0;
    return approximatePathLength(d);
  };

  proto.getPointAtLength = function getPointAtLength(this: Element, distance: number) {
    try {
      const value = originalPoint?.call(this, distance);
      if (value && Number.isFinite(value.x) && Number.isFinite(value.y)) return value;
    } catch {
      // fall through to approximation
    }

    const tag = this.tagName.toLowerCase();
    if (tag === "circle") {
      const cx = Number(this.getAttribute("cx") || 0);
      const cy = Number(this.getAttribute("cy") || 0);
      const r = Number(this.getAttribute("r") || 0);
      const length = 2 * Math.PI * r;
      const angle = length === 0 ? 0 : (distance / length) * Math.PI * 2;
      return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) } as DOMPoint;
    }
    if (tag === "line") {
      const x1 = Number(this.getAttribute("x1") || 0);
      const y1 = Number(this.getAttribute("y1") || 0);
      const x2 = Number(this.getAttribute("x2") || 0);
      const y2 = Number(this.getAttribute("y2") || 0);
      const length = Math.hypot(x2 - x1, y2 - y1);
      const amount = length === 0 ? 0 : distance / length;
      return { x: x1 + (x2 - x1) * amount, y: y1 + (y2 - y1) * amount } as DOMPoint;
    }

    const points = approximatePathPoints(this.getAttribute("d") || "");
    if (points.length === 0) return { x: 0, y: 0 } as DOMPoint;
    if (points.length === 1) return { ...points[0]! } as DOMPoint;

    let total = 0;
    const segments: number[] = [];
    for (let index = 1; index < points.length; index += 1) {
      const length = Math.hypot(
        points[index]!.x - points[index - 1]!.x,
        points[index]!.y - points[index - 1]!.y,
      );
      segments.push(length);
      total += length;
    }
    const desired = Math.min(Math.max(distance, 0), total);
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
        } as DOMPoint;
      }
      elapsed += length;
    }
    return { ...points[points.length - 1]! } as DOMPoint;
  };
}

function approximatePathLength(d: string): number {
  const points = approximatePathPoints(d);
  let total = 0;
  for (let index = 1; index < points.length; index += 1) {
    total += Math.hypot(
      points[index]!.x - points[index - 1]!.x,
      points[index]!.y - points[index - 1]!.y,
    );
  }
  return total;
}

function approximatePathPoints(d: string): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [];
  const tokens = d.match(/[MmLlHhVv]|-?\d*\.?\d+/g) || [];
  let x = 0;
  let y = 0;
  let command = "M";

  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index]!;
    if (/^[MmLlHhVv]$/.test(token)) {
      command = token;
      continue;
    }
    const value = Number(token);
    if (!Number.isFinite(value)) continue;

    if (command === "M" || command === "L") {
      const next = Number(tokens[index + 1]);
      if (!Number.isFinite(next)) continue;
      x = value;
      y = next;
      index += 1;
      points.push({ x, y });
      command = command === "M" ? "L" : command;
    } else if (command === "m" || command === "l") {
      const next = Number(tokens[index + 1]);
      if (!Number.isFinite(next)) continue;
      x += value;
      y += next;
      index += 1;
      points.push({ x, y });
      command = command === "m" ? "l" : command;
    } else if (command === "H") {
      x = value;
      points.push({ x, y });
    } else if (command === "h") {
      x += value;
      points.push({ x, y });
    } else if (command === "V") {
      y = value;
      points.push({ x, y });
    } else if (command === "v") {
      y += value;
      points.push({ x, y });
    }
  }

  return points;
}
