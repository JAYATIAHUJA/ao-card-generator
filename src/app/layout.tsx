import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { Header } from "../components/Header";

export const metadata: Metadata = { title: "The Orchestra", description: "Show us what you're building.", icons: { icon: "/favicon.svg" } };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={GeistSans.variable}><body className="bg-[oklch(0.153_0.006_107.1)] font-sans tracking-[-0.5px] text-[oklch(0.988_0.003_106.5)]"><Header />{children}</body></html>;
}
