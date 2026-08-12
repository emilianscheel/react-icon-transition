import type { IconTransitionSource } from "./types";
export declare function resolveSource(source: IconTransitionSource): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
export declare function sourceType(source: IconTransitionSource): string | import("react").ComponentType<Record<string, unknown>> | import("react").JSXElementConstructor<any>;
export declare function sourceProps(source: IconTransitionSource): Record<string, unknown>;
