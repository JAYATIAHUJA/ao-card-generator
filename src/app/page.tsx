"use client";

import { ChromaticWaves } from "../components/ChromaticWaves";
import { ArrowRight } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

export function OrchestraCardExperience({ initialSubmitted = false, initialFlipped = false }: { initialSubmitted?: boolean; initialFlipped?: boolean }) {
  const [handle, setHandle] = useState("");
  const [submitted, setSubmitted] = useState(initialSubmitted);
  const [flipped, setFlipped] = useState(initialFlipped);
  const validHandle = /^[A-Za-z0-9_]{5,15}$/.test(handle) && !handle.toLowerCase().includes("admin");

  const submitHandle = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (validHandle) setSubmitted(true);
  };

  return (
    <main className="relative min-h-[100dvh] overflow-hidden">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: submitted ? 0 : 1 }} transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }} className="fixed inset-0 z-0">
        <ChromaticWaves />
      </motion.div>
      <section className="relative z-10 mx-auto grid min-h-[100dvh] w-[calc(100%-2rem)] place-items-center text-center sm:w-[calc(100%-4rem)] lg:w-[calc(100%-60px)]">
        <AnimatePresence mode="wait">
        {submitted ? <motion.div key="passport" className="flex w-full justify-center [perspective:1600px]" role="status" aria-label="Your Orchestra passport" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <motion.div initial={{ y: "92vh", rotateX: -38, rotateZ: -5, scale: 0.94 }} animate={{ y: 0, rotateX: 0, rotateZ: 0, scale: 1 }} transition={{ delay: 0.15, duration: 1.45, ease: [0.16, 1, 0.3, 1] }} className="w-full [perspective:1600px]">
            <motion.div animate={{ x: flipped ? "0%" : "-25%" }} transition={{ duration: 1.15, ease: [0.22, 1, 0.36, 1] }} className="relative mx-auto aspect-[1.52] w-[min(92vw,760px)] [transform-style:preserve-3d]">
              <div className="absolute inset-y-0 right-0 w-1/2 rounded-r-[1.5rem] border border-black/10 bg-[#f4f0e7] shadow-[18px_24px_80px_rgba(0,0,0,0.28)]" />
              <motion.button type="button" onClick={() => setFlipped(true)} animate={{ rotateY: flipped ? -180 : 0 }} transition={{ duration: 1.15, ease: [0.22, 1, 0.36, 1] }} className="absolute inset-y-0 right-0 z-10 w-1/2 cursor-pointer [transform-origin:left_center] [transform-style:preserve-3d]">
                <span className="absolute inset-0 grid place-items-center rounded-[1.5rem] border border-black/10 bg-[#f4f0e7] text-sm text-black/45 shadow-[0_24px_80px_rgba(0,0,0,0.35)] [backface-visibility:hidden]">Page 1</span>
                <span className="absolute inset-0 rounded-l-[1.5rem] border border-black/10 bg-[#f4f0e7] shadow-[-16px_18px_60px_rgba(0,0,0,0.2)] [backface-visibility:hidden] [transform:rotateY(180deg)]" />
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div> : <motion.div key="intro" className="w-full" initial={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.95, ease: [0.7, 0, 0.84, 0] } }}>
          <h1 className="mx-auto flex w-full max-w-[1000px] flex-col items-center text-center text-[clamp(42px,7vw,96px)] font-normal leading-[0.94] tracking-[-0.06em] text-[oklch(0.988_0.003_106.5)]">
            <span className="flex flex-wrap justify-center gap-x-[0.27em]">
              {["Seems", "like", "you’re"].map((word, index) => <motion.span key={word} initial={{ opacity: 0, scale: 0.8, y: 18 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8, y: -24, transition: { delay: index * 0.08, duration: 0.45, ease: [0.7, 0, 0.84, 0] } }} transition={{ delay: 0.2 + index * 0.07, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}>{word}</motion.span>)}
            </span>
            <span className="flex flex-wrap justify-center gap-x-[0.27em]">
              {["attending", "the", "Orchestra"].map((word, index) => <motion.span key={word} initial={{ opacity: 0, scale: 0.8, y: 18 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8, y: -24, transition: { delay: 0.24 + index * 0.08, duration: 0.45, ease: [0.7, 0, 0.84, 0] } }} transition={{ delay: 0.4 + index * 0.07, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}>{word}</motion.span>)}
            </span>
          </h1>
          <motion.p initial={{ opacity: 0, scale: 0.8, y: 18 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8, y: -24, transition: { delay: 0.48, duration: 0.45, ease: [0.7, 0, 0.84, 0] } }} transition={{ delay: 0.75, duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="mt-9 text-base font-normal leading-6 tracking-[-0.5px] text-[oklch(0.737_0.021_106.9)]">
            Enter your X username, you’ll get a ticket.
          </motion.p>
          <motion.form onSubmit={submitHandle} initial={{ opacity: 0, scale: 0.8, y: 18 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8, y: -24, transition: { delay: 0.62, duration: 0.45, ease: [0.7, 0, 0.84, 0] } }} transition={{ delay: 0.85, duration: 0.65, ease: [0.16, 1, 0.3, 1] }} className="mx-auto mt-6 flex h-14 w-fit max-w-full items-center gap-2 text-lg">
            <div className="relative h-full w-[min(28rem,calc(100vw-2rem))] shrink-0">
            <span className="pointer-events-none absolute inset-y-0 left-5 z-10 flex items-center text-white/45">@</span>
            <input value={handle} onChange={(event) => setHandle(event.target.value.replace(/^@/, ""))} maxLength={15} aria-label="X username" autoCapitalize="none" autoCorrect="off" spellCheck={false} className="h-full w-full rounded-xl border border-white/15 bg-black/20 py-3 pl-10 pr-5 text-white outline-none backdrop-blur-sm placeholder:text-white/35 transition focus:border-white/35 focus:ring-2 focus:ring-white/25 focus:ring-offset-2 focus:ring-offset-[oklch(0.153_0.006_107.1)]" placeholder="Enter your X handle" />
            </div>
            <div className={`h-14 shrink-0 overflow-visible transition-[width] duration-300 ease-out ${validHandle ? "w-14" : "w-0"}`}>
              <button type="submit" aria-label="Continue" className={`grid h-14 w-14 place-items-center rounded-xl bg-[oklch(0.93_0.007_106.5)] text-[oklch(0.228_0.013_107.4)] transition-transform duration-300 ease-out hover:bg-white active:scale-95 ${validHandle ? "scale-100" : "scale-0"}`}><ArrowRight size={22} strokeWidth={1.8} /></button>
            </div>
          </motion.form>
        </motion.div>}
        </AnimatePresence>
      </section>
    </main>
  );
}

export default OrchestraCardExperience;
