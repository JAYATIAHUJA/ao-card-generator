"use client";

import { ArrowRight } from "lucide-react";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import { useState } from "react";
import { ChromaticWaves } from "../components/ChromaticWaves";
import { InteractiveAOPass } from "../components/InteractiveAOPass";
import { withBasePath } from "../lib/base-path";
import { useXProfile } from "./use-x-profile";

const enterEase = [0.16, 1, 0.3, 1] as const;

const normalizeHandleInput = (value: string) => {
  const trimmed = value.trim();

  try {
    const url = new URL(
      /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`,
    );
    const host = url.hostname.replace(/^www\./i, "").toLowerCase();
    if (host === "x.com" || host === "twitter.com") {
      return url.pathname.split("/").filter(Boolean)[0]?.replace(/^@/, "") ?? "";
    }
  } catch {
    // Not a URL, so treat it as a plain handle below.
  }

  return trimmed
    .replace(/^@/, "")
    .replace(/^https?:\/\/(?:www\.)?(?:x|twitter)\.com\//i, "")
    .split(/[/?#]/)[0]
    .replace(/^@/, "");
};

export default function IntroPage() {
  const [handle, setHandle] = useState("");
  const [submittedHandle, setSubmittedHandle] = useState<string | null>(null);
  const { profile, resetProfile } = useXProfile(submittedHandle);
  const validHandle =
    /^[A-Za-z0-9_]{5,15}$/.test(handle) &&
    !handle.toLowerCase().includes("admin");

  const submitHandle = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validHandle) return;
    resetProfile();
    setSubmittedHandle(handle);
  };

  return (
    <MotionConfig reducedMotion="user">
      <main className="relative min-h-[100dvh] overflow-hidden bg-black">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: submittedHandle ? 0.65 : 1.4, ease: enterEase }}
          className="fixed inset-0 z-0"
        >
          <ChromaticWaves />
        </motion.div>

        <motion.div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-[1] bg-[radial-gradient(circle_at_50%_42%,rgba(112,37,31,0.18),transparent_46%),linear-gradient(180deg,rgba(0,0,0,0.12),rgba(0,0,0,0.76))]"
          animate={{ opacity: submittedHandle ? 0.35 : 0.1 }}
          transition={{ duration: 0.6, ease: enterEase }}
        />

        <AnimatePresence mode="wait" initial={false}>
          {submittedHandle ? (
            <motion.section
              key="pass"
              className="relative z-10 grid min-h-[100dvh] place-items-center px-[22px] py-10 sm:px-10"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: enterEase }}
              aria-label="Your personalised Syndicate pass"
            >
              <InteractiveAOPass
                xUsername={submittedHandle}
                name={profile.name}
                photo={profile.photo}
              />
            </motion.section>
          ) : (
            <motion.section
              key="intro"
              className="relative z-10 mx-auto grid min-h-[100dvh] w-[calc(100%-2rem)] place-items-center text-center sm:w-[calc(100%-4rem)] lg:w-[calc(100%-60px)]"
              exit={{ opacity: 0, y: -18, scale: 0.985 }}
              transition={{ duration: 0.3, ease: enterEase }}
            >
              <div className="w-full">
                <h1 className="mx-auto flex w-full max-w-[1000px] flex-col items-center text-center text-[clamp(28px,10vw,96px)] font-normal leading-[0.94] tracking-[-0.06em] text-[oklch(0.988_0.003_106.5)]">
                  <span className="flex flex-wrap justify-center gap-x-[0.27em]">
                    {["Seems", "like", "you’re"].map((word, index) => (
                      <motion.span
                        key={word}
                        initial={{ opacity: 0, scale: 0.8, y: 18 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{
                          delay: 0.2 + index * 0.07,
                          duration: 0.55,
                          ease: enterEase,
                        }}
                      >
                        {word}
                      </motion.span>
                    ))}
                  </span>
                  <span className="flex flex-wrap justify-center gap-x-[0.27em]">
                    {["attending", "Syndicate"].map((word, index) => (
                      <motion.span
                        key={word}
                        initial={{ opacity: 0, scale: 0.8, y: 18 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{
                          delay: 0.4 + index * 0.07,
                          duration: 0.55,
                          ease: enterEase,
                        }}
                      >
                        {word}
                      </motion.span>
                    ))}
                  </span>
                </h1>

                <motion.p
                  initial={{ opacity: 0, scale: 0.8, y: 18 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: 0.75, duration: 0.6, ease: enterEase }}
                  className="mt-9 text-base font-normal leading-6 tracking-[-0.5px] text-[oklch(0.737_0.021_106.9)]"
                >
                  Enter your X username, you’ll get a ticket.
                </motion.p>

                <motion.form
                  onSubmit={submitHandle}
                  initial={{ opacity: 0, scale: 0.8, y: 18 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: 0.85, duration: 0.65, ease: enterEase }}
                  className="mx-auto mt-6 flex h-14 w-full max-w-[28rem] items-center gap-2 text-lg"
                >
                  {/* Flexes so the field gives up room when the submit button
                      appears, instead of pushing it off the screen. */}
                  <div className="relative h-full min-w-0 flex-1">
                    <span className="pointer-events-none absolute inset-y-0 left-5 z-10 flex items-center text-white/45">
                      @
                    </span>
                    <input
                      value={handle}
                      onChange={(event) => setHandle(normalizeHandleInput(event.target.value))}
                      aria-label="X username"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                      className="h-full w-full rounded-xl border border-white/15 bg-black/20 py-3 pr-5 pl-10 text-white outline-none backdrop-blur-sm transition-[border-color,box-shadow] duration-200 placeholder:text-white/35 focus:border-white/35 focus:ring-2 focus:ring-white/25 focus:ring-offset-2 focus:ring-offset-[oklch(0.153_0.006_107.1)]"
                      placeholder="Enter your X handle"
                    />
                  </div>
                  <div
                    className={`h-14 shrink-0 overflow-visible transition-[width] duration-300 ease-out ${validHandle ? "w-14" : "w-0"}`}
                  >
                    <button
                      type="submit"
                      aria-label="Continue"
                      className={`grid h-14 w-14 place-items-center rounded-xl bg-[oklch(0.93_0.007_106.5)] text-[oklch(0.228_0.013_107.4)] transition-[transform,background-color] duration-300 ease-out hover:bg-white active:scale-95 ${validHandle ? "scale-100" : "scale-0"}`}
                    >
                      <ArrowRight size={22} strokeWidth={1.8} />
                    </button>
                  </div>
                </motion.form>

                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1, duration: 0.6, ease: enterEase }}
                  className="mt-10"
                  aria-label="Event host and sponsors"
                >
                  <a
                    className="mx-auto inline-flex w-max items-center justify-center gap-2 opacity-75 transition-opacity hover:opacity-100"
                    href="https://aoagents.dev"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Agent Orchestrator"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img className="size-5 translate-y-[1px]" src={withBasePath("/ao-logo.svg")} alt="" aria-hidden="true" />
                    <span className="block text-[11px] font-medium leading-none tracking-[0.16em] text-white/50">
                      AO HACKATHON
                    </span>
                  </a>
                  <p className="mt-7 text-[11px] font-medium tracking-[0.22em] text-white/40">
                    SPONSORED BY
                  </p>
                  <div className="mx-auto mt-4 grid w-full max-w-[320px] grid-cols-2 items-center gap-x-8 gap-y-4 sm:max-w-[640px] sm:grid-cols-[1.25fr_1fr_1fr_1fr] sm:gap-6">
                    <a
                      className="grid h-8 min-w-0 place-items-center opacity-90 transition-opacity hover:opacity-100 sm:h-10"
                      href="https://maximor.ai"
                      target="_blank"
                      rel="noreferrer"
                      aria-label="Maximor"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img className="h-auto w-full max-w-[126px] -translate-y-[6px] sm:max-w-[188px] sm:-translate-y-[11px]" src={withBasePath("/sponsors/maximor.svg")} alt="Maximor" />
                    </a>
                    <a
                      className="grid h-8 min-w-0 place-items-center opacity-75 transition-opacity hover:opacity-100 sm:h-9"
                      href="https://dodopayments.com"
                      target="_blank"
                      rel="noreferrer"
                      aria-label="Dodo Payments"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img className="w-full max-w-[118px] sm:max-w-[132px]" src={withBasePath("/sponsors/dodo-payments-dark.webp")} alt="Dodo Payments" />
                    </a>
                    <a
                      className="grid h-8 min-w-0 place-items-center opacity-75 transition-opacity hover:opacity-100 sm:h-9"
                      href="https://neatlogs.com"
                      target="_blank"
                      rel="noreferrer"
                      aria-label="Neatlogs"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img className="w-full max-w-[136px] opacity-90 [filter:invert(1)_brightness(1.7)_drop-shadow(0_1px_2px_rgb(0_0_0_/_0.35))] sm:max-w-[158px]" src={withBasePath("/sponsors/neatlogs-lockup.svg")} alt="Neatlogs" />
                    </a>
                    <a
                      className="relative mx-auto h-8 w-full max-w-[124px] overflow-hidden rounded-sm bg-white opacity-75 transition-opacity hover:opacity-100 sm:h-9 sm:max-w-[142px]"
                      href="https://tensormux.com"
                      target="_blank"
                      rel="noreferrer"
                      aria-label="TensorMux"
                    >
                      {/* Width is relative so the wordmark scales with its box
                          instead of being cropped on narrow screens. */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img className="absolute top-1/2 left-1/2 w-[105%] max-w-none -translate-x-1/2 -translate-y-1/2" src={withBasePath("/sponsors/tensormux.png")} alt="TensorMux" />
                    </a>
                  </div>
                </motion.div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>
    </MotionConfig>
  );
}
