import {
  Fragment,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { CSSProperties, SVGProps } from "react";
import { blurFrame } from "./blur";
import {
  DEFAULT_EASING,
  getAnimationDuration,
  getEasing,
} from "./easing";
import { interpolatePaths, pairStrokes, sampleSvg } from "./geometry";
import type { StrokePair } from "./geometry";
import { prefersReducedMotion } from "./motion";
import { resolveSource, sourceProps, sourceType } from "./source";
import type { IconTransitionProps, IconTransitionSource } from "./types";

const DEFAULT_TYPE = "liquid" as const;

const hiddenStyle = {
  position: "absolute",
  width: 0,
  height: 0,
  overflow: "hidden",
  opacity: 0,
  pointerEvents: "none",
} as const;

function visibleSvgProps(source: IconTransitionSource): SVGProps<SVGSVGElement> {
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
  const renderedStrokeWidth = absoluteStrokeWidth && Number.isFinite(numericSize)
    ? (Number(strokeWidth) * 24) / numericSize
    : strokeWidth;
  const hasAccessibleName = Boolean(
    props["aria-label"] || props["aria-labelledby"],
  );

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
    className: ["lucide", "icon-transition", className].filter(Boolean).join(" "),
  };
}

function blurWrapperStyle(scale: number, blur: number, opacity: number): CSSProperties {
  return {
    display: "inline-flex",
    transform: `scale(${scale})`,
    filter: blur > 0.01 ? `blur(${blur}px)` : undefined,
    opacity,
    transformOrigin: "center",
  };
}

export function IconTransition({
  status,
  default: defaultSource,
  target: targetSource,
  duration,
  easing = DEFAULT_EASING,
  type = DEFAULT_TYPE,
}: IconTransitionProps) {
  const isLiquid = type === "liquid";
  const [mounted, setMounted] = useState(false);
  const [pairs, setPairs] = useState<StrokePair[] | null>(null);
  const [progress, setProgress] = useState(status ? 1 : 0);
  const progressRef = useRef(status ? 1 : 0);
  const frameRef = useRef<number | null>(null);
  const defaultHostRef = useRef<HTMLSpanElement>(null);
  const targetHostRef = useRef<HTMLSpanElement>(null);
  const defaultGeometryType = sourceType(defaultSource);
  const targetGeometryType = sourceType(targetSource);
  const resolvedDefault = useMemo(() => resolveSource(defaultSource), [defaultSource]);
  const resolvedTarget = useMemo(() => resolveSource(targetSource), [targetSource]);

  useEffect(() => {
    setMounted(true);
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  useLayoutEffect(() => {
    if (!mounted || !isLiquid) {
      if (!isLiquid) setPairs(null);
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
    if (isLiquid && !pairs) return;
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);

    const targetProgress = status ? 1 : 0;
    const startProgress = progressRef.current;
    const totalDuration = getAnimationDuration(
      startProgress,
      targetProgress,
      duration,
    );

    if (prefersReducedMotion() || totalDuration === 0 || startProgress === targetProgress) {
      progressRef.current = targetProgress;
      setProgress(targetProgress);
      return;
    }

    const ease = getEasing(easing);
    const startedAt = performance.now();
    const tick = (now: number) => {
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
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [status, pairs, duration, easing, isLiquid]);

  const activeSource = status ? targetSource : defaultSource;
  const activeResolved = status ? resolvedTarget : resolvedDefault;

  if (!mounted) return activeResolved;

  if (!isLiquid) {
    const frame = blurFrame(progress);
    const icon = frame.showTarget ? resolvedTarget : resolvedDefault;
    return (
      <span
        className="icon-transition icon-transition-blur"
        style={blurWrapperStyle(frame.scale, frame.blur, frame.opacity)}
      >
        {icon}
      </span>
    );
  }

  return (
    <Fragment>
      <span ref={defaultHostRef} style={hiddenStyle} aria-hidden="true">
        {resolvedDefault}
      </span>
      <span ref={targetHostRef} style={hiddenStyle} aria-hidden="true">
        {resolvedTarget}
      </span>
      {pairs ? (
        <svg {...visibleSvgProps(activeSource)}>
          {interpolatePaths(pairs, progress).map(({ d, opacity }, index) =>
            opacity < 0.01 ? null : (
              <path d={d} key={index} strokeOpacity={opacity} />
            ),
          )}
        </svg>
      ) : activeResolved}
    </Fragment>
  );
}
