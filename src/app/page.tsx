"use client";

import { ChromaticWaves } from "../components/ChromaticWaves";
import { ArrowRight } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const [handle, setHandle] = useState("");
  const validHandle = /^[A-Za-z0-9_]{5,15}$/.test(handle) && !handle.toLowerCase().includes("admin");

  return (
    <main className="relative min-h-[100dvh] overflow-hidden">
      <ChromaticWaves />
      <section className="relative z-10 mx-auto grid min-h-[100dvh] w-[calc(100%-2rem)] place-items-center text-center sm:w-[calc(100%-4rem)] lg:w-[calc(100%-60px)]">
        <div className="w-full">
          <h1 className="mx-auto w-full max-w-[1000px] text-balance text-center text-[clamp(42px,7vw,96px)] font-normal leading-[0.94] tracking-[-0.06em] text-[oklch(0.988_0.003_106.5)]">
            Seems like you’re attending the Orchestra
          </h1>
          <p className="mt-9 text-base font-normal leading-6 tracking-[-0.5px] text-[oklch(0.737_0.021_106.9)]">
            Enter your X username, you’ll get a ticket.
          </p>
          <div className="mx-auto mt-6 flex h-14 w-fit max-w-full overflow-visible items-center gap-2 text-lg">
            <div className="relative h-full w-[min(28rem,calc(100vw-2rem))] shrink-0">
            <span className="pointer-events-none absolute inset-y-0 left-5 z-10 flex items-center text-white/45">@</span>
            <input value={handle} onChange={(event) => setHandle(event.target.value.replace(/^@/, ""))} maxLength={15} aria-label="X username" autoCapitalize="none" autoCorrect="off" spellCheck={false} className="h-full w-full rounded-xl border border-white/15 bg-black/20 py-3 pl-10 pr-5 text-white outline-none backdrop-blur-sm placeholder:text-white/35 transition focus:border-white/35 focus:ring-2 focus:ring-white/25 focus:ring-offset-2 focus:ring-offset-[oklch(0.153_0.006_107.1)]" placeholder="Enter your X handle" />
            </div>
            <div className={`h-14 shrink-0 overflow-visible transition-[width] duration-300 ease-out ${validHandle ? "w-14" : "w-0"}`}>
              <button type="button" aria-label="Continue" className={`grid h-14 w-14 place-items-center rounded-xl bg-[oklch(0.93_0.007_106.5)] text-[oklch(0.228_0.013_107.4)] transition-transform duration-300 ease-out hover:bg-white active:scale-95 ${validHandle ? "scale-100" : "scale-0"}`}><ArrowRight size={22} strokeWidth={1.8} /></button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
