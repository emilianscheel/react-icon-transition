import type { ComponentType, ReactElement } from "react";
/** Any React SVG icon: a component or a preconfigured element. */
export type IconTransitionSource = ComponentType<Record<string, unknown>> | ReactElement;
export type IconTransitionEasing = "linear" | "ease" | "ease-in" | "ease-out" | "ease-in-out";
export type IconTransitionType = "liquid" | "blur";
export interface IconTransitionProps {
    status: boolean;
    default: IconTransitionSource;
    target: IconTransitionSource;
    duration?: number;
    easing?: IconTransitionEasing;
    type?: IconTransitionType;
}
