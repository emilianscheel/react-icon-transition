import { createElement, isValidElement } from "react";
import type { IconTransitionSource } from "./types";

export function resolveSource(source: IconTransitionSource) {
  if (isValidElement(source)) return source;
  return createElement(source);
}

export function sourceType(source: IconTransitionSource) {
  return isValidElement(source) ? source.type : source;
}

export function sourceProps(source: IconTransitionSource): Record<string, unknown> {
  return isValidElement(source) ? (source.props as Record<string, unknown>) : {};
}
