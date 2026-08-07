import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "AO — Agent Orchestrator", description: "Run your agents together." };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
