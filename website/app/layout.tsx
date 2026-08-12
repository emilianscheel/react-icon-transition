import type { Metadata } from "next";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  title: "react-icon-transition",
  description: "Smooth, reversible geometry transitions between Lucide React icons.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={GeistMono.variable}>
      <body className={`${GeistMono.className} antialiased`}>{children}</body>
    </html>
  );
}
