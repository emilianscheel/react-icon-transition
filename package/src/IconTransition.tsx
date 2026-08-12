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
  normalizeDuration,
} from "./easing";
import {
  interpolatePaths,
  isFillOnlyIcon,
  mapStroke,
  pairStrokes,
  parseViewBox,
  sampleSvg,
  viewBoxString,
} from "./geometry";
import type { StrokePair, ViewBox } from "./geometry";
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

function readAttr(svg: SVGSVGElement | null, name: string): string | null {
  return svg?.getAttribute(name) ?? null;
}

function morphSvgProps(
  svg: SVGSVGElement | null,
  source: IconTransitionSource,
  viewBox: ViewBox,
): SVGProps<SVGSVGElement> {
  const props = sourceProps(source);
  const {
    size,
    color,
    strokeWidth,
    className,
    children: _children,
    width: widthProp,
    height: heightProp,
    ...rest
  } = props;

  const width = (widthProp as string | number | undefined)
    ?? (size as string | number | undefined)
    ?? readAttr(svg, "width")
    ?? viewBox.width;
  const height = (heightProp as string | number | undefined)
    ?? (size as string | number | undefined)
    ?? readAttr(svg, "height")
    ?? viewBox.height;

  const fill = readAttr(svg, "fill") ?? "none";
  const stroke = readAttr(svg, "stroke")
    ?? (typeof color === "string" ? color : null)
    ?? "currentColor";
  const renderedStrokeWidth = readAttr(svg, "stroke-width")
    ?? (strokeWidth as string | number | undefined)
    ?? 2;
  const strokeLinecap = readAttr(svg, "stroke-linecap")
    ?? (typeof props.strokeLinecap === "string" ? props.strokeLinecap : null)
    ?? "round";
  const strokeLinejoin = readAttr(svg, "stroke-linejoin")
    ?? (typeof props.strokeLinejoin === "string" ? props.strokeLinejoin : null)
    ?? "round";

  const hasAccessibleName = Boolean(props["aria-label"] || props["aria-labelledby"]);
  const classNames = [
    "icon-transition",
    typeof className === "string" ? className : null,
  ].filter(Boolean).join(" ");

  return {
    ...(rest as SVGProps<SVGSVGElement>),
    xmlns: "http://www.w3.org/2000/svg",
    width,
    height,
    viewBox: viewBoxString(viewBox),
    fill,
    stroke,
    strokeWidth: renderedStrokeWidth,
    strokeLinecap: strokeLinecap as SVGProps<SVGSVGElement>["strokeLinecap"],
    strokeLinejoin: strokeLinejoin as SVGProps<SVGSVGElement>["strokeLinejoin"],
    "aria-hidden": (props["aria-hidden"] as SVGProps<SVGSVGElement>["aria-hidden"])
      ?? (hasAccessibleName ? undefined : true),
    role: (props.role as SVGProps<SVGSVGElement>["role"])
      ?? (hasAccessibleName ? "img" : undefined),
    className: classNames,
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

type LiquidMode = "pending" | "morph" | "blur";

export function IconTransition({
  status,
  default: defaultSource,
  target: targetSource,
  duration,
  easing = DEFAULT_EASING,
  type = DEFAULT_TYPE,
}: IconTransitionProps) {
  const wantsLiquid = type === "liquid";
  const [mounted, setMounted] = useState(false);
  const [liquidMode, setLiquidMode] = useState<LiquidMode>("pending");
  const [pairs, setPairs] = useState<StrokePair[] | null>(null);
  const [sharedViewBox, setSharedViewBox] = useState<ViewBox>({
    x: 0,
    y: 0,
    width: 24,
    height: 24,
  });
  const [progress, setProgress] = useState(status ? 1 : 0);
  const progressRef = useRef(status ? 1 : 0);
  const frameRef = useRef<number | null>(null);
  const defaultHostRef = useRef<HTMLSpanElement>(null);
  const targetHostRef = useRef<HTMLSpanElement>(null);
  const defaultGeometryType = sourceType(defaultSource);
  const targetGeometryType = sourceType(targetSource);
  const resolvedDefault = useMemo(() => resolveSource(defaultSource), [defaultSource]);
  const resolvedTarget = useMemo(() => resolveSource(targetSource), [targetSource]);
  const useBlur = type === "blur" || liquidMode === "blur";
  const useMorph = wantsLiquid && liquidMode === "morph" && pairs !== null;

  useEffect(() => {
    setMounted(true);
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  useLayoutEffect(() => {
    if (!mounted) return;

    if (!wantsLiquid) {
      setPairs(null);
      setLiquidMode("blur");
      const initialProgress = status ? 1 : 0;
      progressRef.current = initialProgress;
      setProgress(initialProgress);
      return;
    }

    const defaultSvg = defaultHostRef.current?.querySelector("svg") ?? null;
    const targetSvg = targetHostRef.current?.querySelector("svg") ?? null;

    if (isFillOnlyIcon(defaultSvg) && isFillOnlyIcon(targetSvg)) {
      setPairs(null);
      setLiquidMode("blur");
      const initialProgress = status ? 1 : 0;
      progressRef.current = initialProgress;
      setProgress(initialProgress);
      return;
    }

    const sharedBox = parseViewBox(defaultSvg);
    const fromStrokes = sampleSvg(defaultSvg);
    const toStrokes = sampleSvg(targetSvg).map((stroke) =>
      mapStroke(stroke, parseViewBox(targetSvg), sharedBox),
    );
    const nextPairs = pairStrokes(fromStrokes, toStrokes);

    if (nextPairs.length === 0) {
      setPairs(null);
      setLiquidMode("blur");
    } else {
      setSharedViewBox(sharedBox);
      setPairs(nextPairs);
      setLiquidMode("morph");
    }

    const initialProgress = status ? 1 : 0;
    progressRef.current = initialProgress;
    setProgress(initialProgress);
  }, [mounted, wantsLiquid, defaultGeometryType, targetGeometryType]);

  useEffect(() => {
    if (wantsLiquid && liquidMode === "pending") return;
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);

    const targetProgress = status ? 1 : 0;
    const startProgress = progressRef.current;
    const totalDuration = getAnimationDuration(
      startProgress,
      targetProgress,
      normalizeDuration(duration),
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
  }, [status, pairs, duration, easing, wantsLiquid, liquidMode]);

  const activeSource = status ? targetSource : defaultSource;
  const activeResolved = status ? resolvedTarget : resolvedDefault;
  const activeSvg = status
    ? (targetHostRef.current?.querySelector("svg") ?? null)
    : (defaultHostRef.current?.querySelector("svg") ?? null);

  if (!mounted) return activeResolved;

  const blurContent = () => {
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
  };

  if (useBlur && !wantsLiquid) return blurContent();

  const visible = useBlur
    ? blurContent()
    : useMorph && pairs
      ? (
        <svg {...morphSvgProps(activeSvg, activeSource, sharedViewBox)}>
          {interpolatePaths(pairs, progress).map(({ d, opacity }, index) =>
            opacity < 0.01 ? null : (
              <path d={d} key={index} strokeOpacity={opacity} />
            ),
          )}
        </svg>
      )
      : activeResolved;

  return (
    <Fragment>
      <span ref={defaultHostRef} style={hiddenStyle} aria-hidden="true">
        {resolvedDefault}
      </span>
      <span ref={targetHostRef} style={hiddenStyle} aria-hidden="true">
        {resolvedTarget}
      </span>
      {visible}
    </Fragment>
  );
}
