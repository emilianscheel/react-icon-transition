import type { LucideIcon, LucideProps } from "lucide-react";
import type { IconTransitionSource } from "./types";
export declare function resolveSource(source: IconTransitionSource): (IconTransitionSource & import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>) | import("react").FunctionComponentElement<Omit<LucideProps, "ref"> & import("react").RefAttributes<SVGSVGElement>>;
export declare function sourceType(source: IconTransitionSource): string | LucideIcon | import("react").ReactElement<LucideProps, LucideIcon> | ((props: any) => import("react").ReactNode | Promise<import("react").ReactNode>) | (new (props: any, context: any) => import("react").Component<any, any>);
export declare function sourceProps(source: IconTransitionSource): LucideProps;
//# sourceMappingURL=source.d.ts.map