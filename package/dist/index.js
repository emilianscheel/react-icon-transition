"use client";
// src/IconTransition.tsx
import {
  Fragment,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from "react";

// src/blur.ts
var BLUR_SCALE = 0.5;
var BLUR_PX = 6;
function lerp(from, to, amount) {
  return from + (to - from) * amount;
}
function blurFrame(progress) {
  const amount = Math.min(1, Math.max(0, progress));
  const intensity = 1 - Math.abs(amount - 0.5) * 2;
  return {
    showTarget: amount >= 0.5,
    scale: lerp(1, BLUR_SCALE, intensity),
    blur: lerp(0, BLUR_PX, intensity),
    opacity: lerp(1, 0, intensity)
  };
}

// src/easing.ts
var DEFAULT_DURATION = 300;
var DEFAULT_EASING = "ease-in-out";
function normalizeDuration(duration) {
  if (duration === undefined)
    return DEFAULT_DURATION;
  return Number.isFinite(duration) && duration >= 0 ? duration : DEFAULT_DURATION;
}
function getEasing(easing) {
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
      return (value) => value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;
  }
}
function getAnimationDuration(from, to, duration) {
  return Math.abs(to - from) * normalizeDuration(duration);
}

// src/geometry.ts
var GEOMETRY_SELECTOR = "path,line,polyline,polygon,rect,circle,ellipse";
function centroid(points) {
  if (points.length === 0)
    return { x: 12, y: 12 };
  const total = points.reduce((sum, point) => ({ x: sum.x + point.x, y: sum.y + point.y }), { x: 0, y: 0 });
  return { x: total.x / points.length, y: total.y / points.length };
}
function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
function resamplePoints(points, count) {
  if (count <= 0)
    return [];
  if (points.length === 0)
    return Array.from({ length: count }, () => ({ x: 12, y: 12 }));
  if (points.length === 1)
    return Array.from({ length: count }, () => ({ ...points[0] }));
  const segments = [];
  let total = 0;
  for (let index = 1;index < points.length; index += 1) {
    const length = distance(points[index - 1], points[index]);
    segments.push(length);
    total += length;
  }
  if (total === 0)
    return Array.from({ length: count }, () => ({ ...points[0] }));
  return Array.from({ length: count }, (_, index) => {
    const desired = count === 1 ? 0 : index / (count - 1) * total;
    let elapsed = 0;
    for (let segmentIndex = 0;segmentIndex < segments.length; segmentIndex += 1) {
      const length = segments[segmentIndex];
      if (elapsed + length >= desired || segmentIndex === segments.length - 1) {
        const start = points[segmentIndex];
        const end = points[segmentIndex + 1];
        const amount = length === 0 ? 0 : (desired - elapsed) / length;
        return {
          x: start.x + (end.x - start.x) * amount,
          y: start.y + (end.y - start.y) * amount
        };
      }
      elapsed += length;
    }
    return { ...points[points.length - 1] };
  });
}
function collapsedStroke(stroke, count) {
  const center = centroid(stroke.points);
  return Array.from({ length: count }, () => ({ ...center }));
}
function pairStrokes(fromStrokes, toStrokes) {
  const remainingTargets = new Set(toStrokes.map((_, index) => index));
  const pairs = [];
  for (const fromStroke of fromStrokes) {
    let closestIndex;
    let closestDistance = Number.POSITIVE_INFINITY;
    const fromCenter = centroid(fromStroke.points);
    for (const targetIndex of remainingTargets) {
      const candidateDistance = distance(fromCenter, centroid(toStrokes[targetIndex].points));
      if (candidateDistance < closestDistance) {
        closestDistance = candidateDistance;
        closestIndex = targetIndex;
      }
    }
    if (closestIndex === undefined) {
      const count2 = Math.max(2, fromStroke.points.length);
      pairs.push({
        from: resamplePoints(fromStroke.points, count2),
        to: collapsedStroke(fromStroke, count2),
        fade: "out"
      });
      continue;
    }
    remainingTargets.delete(closestIndex);
    const targetStroke = toStrokes[closestIndex];
    const count = Math.max(2, fromStroke.points.length, targetStroke.points.length);
    pairs.push({
      from: resamplePoints(fromStroke.points, count),
      to: resamplePoints(targetStroke.points, count)
    });
  }
  for (const targetIndex of remainingTargets) {
    const targetStroke = toStrokes[targetIndex];
    const count = Math.max(2, targetStroke.points.length);
    pairs.push({
      from: collapsedStroke(targetStroke, count),
      to: resamplePoints(targetStroke.points, count),
      fade: "in"
    });
  }
  return pairs;
}
function round(value) {
  return Number(value.toFixed(3)).toString();
}
function fadeOpacity(fade, progress) {
  if (fade === "out")
    return 1 - progress;
  if (fade === "in")
    return progress;
  return 1;
}
function interpolatePaths(pairs, progress) {
  const amount = Math.min(1, Math.max(0, progress));
  return pairs.map(({ from, to, fade }) => {
    const points = from.map((point, index) => ({
      x: point.x + (to[index].x - point.x) * amount,
      y: point.y + (to[index].y - point.y) * amount
    }));
    return {
      d: points.map((point, index) => `${index === 0 ? "M" : "L"}${round(point.x)} ${round(point.y)}`).join(" "),
      opacity: fadeOpacity(fade, amount)
    };
  });
}
function sampleGeometry(element) {
  try {
    const length = element.getTotalLength();
    if (!Number.isFinite(length) || length <= 0)
      return null;
    const count = Math.min(64, Math.max(8, Math.ceil(length / 1.25)));
    const points = Array.from({ length: count }, (_, index) => {
      const point = element.getPointAtLength(index / (count - 1) * length);
      return { x: point.x, y: point.y };
    });
    return { points };
  } catch {
    return null;
  }
}
function sampleSvg(svg) {
  if (!svg)
    return [];
  return Array.from(svg.querySelectorAll(GEOMETRY_SELECTOR)).map(sampleGeometry).filter((stroke) => stroke !== null);
}

// src/motion.ts
function prefersReducedMotion(matchMedia) {
  const matcher = matchMedia ?? (typeof window !== "undefined" && typeof window.matchMedia === "function" ? window.matchMedia.bind(window) : undefined);
  return matcher?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

// src/source.tsx
import { createElement, isValidElement } from "react";
function resolveSource(source) {
  if (isValidElement(source))
    return source;
  return createElement(source);
}
function sourceType(source) {
  return isValidElement(source) ? source.type : source;
}
function sourceProps(source) {
  return isValidElement(source) ? source.props : {};
}

// src/IconTransition.tsx
import { jsxDEV } from "react/jsx-dev-runtime";
var DEFAULT_TYPE = "liquid";
var hiddenStyle = {
  position: "absolute",
  width: 0,
  height: 0,
  overflow: "hidden",
  opacity: 0,
  pointerEvents: "none"
};
function visibleSvgProps(source) {
  const props = sourceProps(source);
  const {
    size = 24,
    color = "currentColor",
    strokeWidth = 2,
    absoluteStrokeWidth,
    className,
    children: _children,
    ...rest
  } = props;
  const numericSize = typeof size === "number" ? size : Number.parseFloat(String(size));
  const renderedStrokeWidth = absoluteStrokeWidth && Number.isFinite(numericSize) ? Number(strokeWidth) * 24 / numericSize : strokeWidth;
  const hasAccessibleName = Boolean(props["aria-label"] || props["aria-labelledby"]);
  return {
    ...rest,
    xmlns: "http://www.w3.org/2000/svg",
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: renderedStrokeWidth,
    strokeLinecap: props.strokeLinecap ?? "round",
    strokeLinejoin: props.strokeLinejoin ?? "round",
    "aria-hidden": props["aria-hidden"] ?? (hasAccessibleName ? undefined : true),
    role: props.role ?? (hasAccessibleName ? "img" : undefined),
    className: ["lucide", "icon-transition", className].filter(Boolean).join(" ")
  };
}
function blurWrapperStyle(scale, blur, opacity) {
  return {
    display: "inline-flex",
    transform: `scale(${scale})`,
    filter: blur > 0.01 ? `blur(${blur}px)` : undefined,
    opacity,
    transformOrigin: "center"
  };
}
function IconTransition({
  status,
  default: defaultSource,
  target: targetSource,
  duration,
  easing = DEFAULT_EASING,
  type = DEFAULT_TYPE
}) {
  const isLiquid = type === "liquid";
  const [mounted, setMounted] = useState(false);
  const [pairs, setPairs] = useState(null);
  const [progress, setProgress] = useState(status ? 1 : 0);
  const progressRef = useRef(status ? 1 : 0);
  const frameRef = useRef(null);
  const defaultHostRef = useRef(null);
  const targetHostRef = useRef(null);
  const defaultGeometryType = sourceType(defaultSource);
  const targetGeometryType = sourceType(targetSource);
  const resolvedDefault = useMemo(() => resolveSource(defaultSource), [defaultSource]);
  const resolvedTarget = useMemo(() => resolveSource(targetSource), [targetSource]);
  useEffect(() => {
    setMounted(true);
    return () => {
      if (frameRef.current !== null)
        cancelAnimationFrame(frameRef.current);
    };
  }, []);
  useLayoutEffect(() => {
    if (!mounted || !isLiquid) {
      if (!isLiquid)
        setPairs(null);
      return;
    }
    const defaultSvg = defaultHostRef.current?.querySelector("svg") ?? null;
    const targetSvg = targetHostRef.current?.querySelector("svg") ?? null;
    const nextPairs = pairStrokes(sampleSvg(defaultSvg), sampleSvg(targetSvg));
    setPairs(nextPairs.length > 0 ? nextPairs : null);
    const initialProgress = status ? 1 : 0;
    progressRef.current = initialProgress;
    setProgress(initialProgress);
  }, [mounted, isLiquid, defaultGeometryType, targetGeometryType]);
  useEffect(() => {
    if (isLiquid && !pairs)
      return;
    if (frameRef.current !== null)
      cancelAnimationFrame(frameRef.current);
    const targetProgress = status ? 1 : 0;
    const startProgress = progressRef.current;
    const totalDuration = getAnimationDuration(startProgress, targetProgress, normalizeDuration(duration));
    if (prefersReducedMotion() || totalDuration === 0 || startProgress === targetProgress) {
      progressRef.current = targetProgress;
      setProgress(targetProgress);
      return;
    }
    const ease = getEasing(easing);
    const startedAt = performance.now();
    const tick = (now) => {
      const elapsed = Math.min(1, (now - startedAt) / totalDuration);
      const next = startProgress + (targetProgress - startProgress) * ease(elapsed);
      progressRef.current = next;
      setProgress(next);
      if (elapsed < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        progressRef.current = targetProgress;
        frameRef.current = null;
      }
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current !== null)
        cancelAnimationFrame(frameRef.current);
    };
  }, [status, pairs, duration, easing, isLiquid]);
  const activeSource = status ? targetSource : defaultSource;
  const activeResolved = status ? resolvedTarget : resolvedDefault;
  if (!mounted)
    return activeResolved;
  if (!isLiquid) {
    const frame = blurFrame(progress);
    const icon = frame.showTarget ? resolvedTarget : resolvedDefault;
    return /* @__PURE__ */ jsxDEV("span", {
      className: "icon-transition icon-transition-blur",
      style: blurWrapperStyle(frame.scale, frame.blur, frame.opacity),
      children: icon
    }, undefined, false, undefined, this);
  }
  return /* @__PURE__ */ jsxDEV(Fragment, {
    children: [
      /* @__PURE__ */ jsxDEV("span", {
        ref: defaultHostRef,
        style: hiddenStyle,
        "aria-hidden": "true",
        children: resolvedDefault
      }, undefined, false, undefined, this),
      /* @__PURE__ */ jsxDEV("span", {
        ref: targetHostRef,
        style: hiddenStyle,
        "aria-hidden": "true",
        children: resolvedTarget
      }, undefined, false, undefined, this),
      pairs ? /* @__PURE__ */ jsxDEV("svg", {
        ...visibleSvgProps(activeSource),
        children: interpolatePaths(pairs, progress).map(({ d, opacity }, index) => opacity < 0.01 ? null : /* @__PURE__ */ jsxDEV("path", {
          d,
          strokeOpacity: opacity
        }, index, false, undefined, this))
      }, undefined, false, undefined, this) : activeResolved
    ]
  }, undefined, true, undefined, this);
}
export {
  IconTransition
};

//# debugId=C62DA0F20CDDE45364756E2164756E21
//# sourceMappingURL=index.js.map
