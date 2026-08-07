export type MatchMedia = (query: string) => Pick<MediaQueryList, "matches">;

export function prefersReducedMotion(matchMedia?: MatchMedia): boolean {
  const matcher = matchMedia
    ?? (typeof window !== "undefined" && typeof window.matchMedia === "function"
      ? window.matchMedia.bind(window)
      : undefined);
  return matcher?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

