import type { LucideIcon, LucideProps } from "lucide-react";
import type { ReactElement } from "react";

export type IconTransitionSource =
  | LucideIcon
  | ReactElement<LucideProps, LucideIcon>;

export type IconTransitionEasing =
  | "linear"
  | "ease"
  | "ease-in"
  | "ease-out"
  | "ease-in-out";

export interface IconTransitionProps {
  status: boolean;
  default: IconTransitionSource;
  target: IconTransitionSource;
  duration?: number;
  easing?: IconTransitionEasing;
}

