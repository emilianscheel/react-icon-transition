import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Icon Transition — Lucide geometry in motion",
  description: "An interactive test gallery for the icon-transition React package.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
