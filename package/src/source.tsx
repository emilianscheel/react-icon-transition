import { createElement, isValidElement } from "react";
import type { LucideIcon, LucideProps } from "lucide-react";
import type { IconTransitionSource } from "./types";

export function resolveSource(source: IconTransitionSource) {
  if (isValidElement(source)) return source;
  return createElement(source as LucideIcon);
}

export function sourceType(source: IconTransitionSource) {
  return isValidElement(source) ? source.type : source;
}

export function sourceProps(source: IconTransitionSource): LucideProps {
  return isValidElement<LucideProps>(source) ? source.props : {};
}
