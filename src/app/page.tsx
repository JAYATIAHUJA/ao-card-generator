"use client";

import { ArrowUpRight, Check, Command, Github, Menu, Play, X } from "lucide-react";
import { useState } from "react";

const features = [
  ["01", "Delegate work", "Give the orchestrator a goal. It breaks the work down and sends focused tasks to the right agents."],
  ["02", "Stay in control", "See every session, branch, review, and handoff from one calm, keyboard-native workspace."],
  ["03", "Ship together", "Agents work in isolated worktrees while you keep the whole system moving toward one outcome."],
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  return <main>
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[.08] bg-[#0a0b0d]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-8 lg:px-[30px]">
        <a href="#top" className="flex items-center gap-2 text-sm font-medium"><span className="grid size-6 place-items-center rounded-md bg-[#f4f5f7] text-xs font-black text-[#0a0b0d]">ao</span><span>agent orchestrator</span></a>
        <nav className="hidden items-center gap-7 text-sm text-[#9ba1aa] md:flex"><a href="#why" className="hover:text-white">Why AO</a><a href="#how" className="hover:text-white">How it works</a><a href="https://github.com/aoagents/agent-orchestrator" className="flex items-center gap-1.5 hover:text-white"><Github size={15}/> GitHub</a></nav>
        <div className="flex items-center gap-2"><a href="#start" className="hidden rounded-md bg-[#4d8dff] px-3 py-1.5 text-sm font-medium text-white transition hover:bg-[#6da3ff] sm:block">Get started</a><button className="rounded-md p-2 text-[#9ba1aa] md:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">{menuOpen ? <X size={18}/> : <Menu size={18}/>}</button></div>
      </div>
      {menuOpen && <nav className="border-t border-white/[.08] px-4 py-4 text-sm text-[#9ba1aa] md:hidden"><div className="mx-auto flex max-w-7xl flex-col gap-4"><a href="#why" onClick={() => setMenuOpen(false)}>Why AO</a><a href="#how" onClick={() => setMenuOpen(false)}>How it works</a><a href="https://github.com/aoagents/agent-orchestrator">GitHub</a></div></nav>}
    </header>

    <section id="top" className="grid-lines relative overflow-hidden border-b border-white/[.08] pt-32 sm:pt-40">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(77,141,255,.14),transparent_36%)]" />
      <div className="relative mx-auto flex max-w-[1600px] flex-col items-center px-4 pb-10 text-center sm:px-8 lg:px-[30px] lg:pb-16">
        <p className="mono mb-6 text-[11px] uppercase tracking-[.18em] text-[#646a73]">The operating layer for AI software engineering</p>
        <h1 className="max-w-5xl text-balance text-5xl font-normal leading-[.98] tracking-[-.045em] sm:text-6xl lg:text-[76px]">Run your agents<br/><span className="text-[#9ba1aa]">together.</span></h1>
        <p className="mt-6 max-w-2xl text-balance text-base leading-7 text-[#9ba1aa] sm:text-lg">Delegate work, coordinate sessions, and ship software from one calm workspace built for the way engineering works now.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3"><a href="#start" className="inline-flex items-center gap-2 rounded-md bg-[#4d8dff] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#6da3ff]">Start building <ArrowUpRight size={16}/></a><a href="#demo" className="inline-flex items-center gap-2 rounded-md border border-white/[.14] px-5 py-3 text-sm text-[#f4f5f7] transition hover:bg-white/[.06]"><Play size={15}/> See how it works</a></div>
        <div id="demo" className="mt-14 w-full max-w-7xl overflow-hidden rounded-lg border border-white/[.14] bg-[#15171b] text-left shadow-2xl shadow-black/40 sm:mt-20">
          <div className="flex h-9 items-center gap-2 border-b border-white/[.1] px-3"><span className="size-2 rounded-full bg-[#646a73]"/><span className="size-2 rounded-full bg-[#646a73]"/><span className="size-2 rounded-full bg-[#646a73]"/><span className="ml-3 mono text-[10px] uppercase tracking-[.15em] text-[#646a73]">ao / workspace</span></div>
          <div className="grid min-h-[280px] grid-cols-[180px_1fr] sm:grid-cols-[220px_1fr]"><aside className="border-r border-white/[.1] p-3"><div className="mono mb-4 text-[10px] uppercase tracking-[.15em] text-[#646a73]">Projects</div>{["agent-orchestrator", "website", "mobile-app"].map((item, i) => <div key={item} className={`mb-1 rounded-md px-3 py-2 text-xs ${i === 0 ? "bg-[#1d2025] text-white" : "text-[#9ba1aa]"}`}>{item}</div>)}</aside><div className="p-5 sm:p-8"><div className="flex items-center justify-between border-b border-white/[.1] pb-4"><div><div className="mono text-[10px] uppercase tracking-[.15em] text-[#646a73]">Orchestrator</div><div className="mt-1 text-sm">Build the next release</div></div><span className="flex items-center gap-1.5 text-xs text-[#4ade80]"><span className="size-1.5 rounded-full bg-[#4ade80]"/> 5 agents working</span></div><div className="grid gap-3 pt-5 sm:grid-cols-3">{["Refactor auth flow", "Update docs", "Run integration tests"].map((t, i) => <div key={t} className="rounded-md border border-white/[.1] bg-[#111317] p-4"><div className="mono text-[10px] text-[#646a73]">WORKER 0{i + 1}</div><div className="mt-3 text-xs text-[#f4f5f7]">{t}</div><div className="mt-5 h-1 overflow-hidden rounded-full bg-white/[.08]"><div className="h-full rounded-full bg-[#4d8dff]" style={{width: `${55 + i * 15}%`}}/></div></div>)}</div></div></div>
        </div>
      </div>
    </section>

    <section id="why" className="mx-auto max-w-7xl px-4 py-24 sm:px-8 lg:px-[30px] lg:py-32"><div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr]"><div><p className="mono text-[11px] uppercase tracking-[.18em] text-[#646a73]">Why AO</p><h2 className="mt-5 max-w-md text-3xl tracking-[-.03em] sm:text-4xl">More leverage.<br/><span className="text-[#9ba1aa]">Less babysitting.</span></h2></div><div className="max-w-2xl text-lg leading-8 text-[#9ba1aa]"><p>Every agent is useful on its own. The multiplier comes from giving them a shared operating layer — a place to delegate, observe, intervene, and learn.</p><p className="mt-5">AO keeps your tools flexible and your way of working consistent, so the best model can change without your whole team having to.</p></div></div></section>
    <section id="how" className="border-y border-white/[.08] bg-[#0d0f12]"><div className="mx-auto max-w-7xl px-4 py-20 sm:px-8 lg:px-[30px] lg:py-28"><p className="mono text-[11px] uppercase tracking-[.18em] text-[#646a73]">How it works</p><div className="mt-10 grid gap-px overflow-hidden rounded-lg border border-white/[.1] bg-white/[.1] md:grid-cols-3">{features.map(([n, title, copy]) => <article key={n} className="bg-[#0d0f12] p-6 sm:p-8"><span className="mono text-xs text-[#4d8dff]">{n}</span><h3 className="mt-16 text-xl tracking-[-.02em]">{title}</h3><p className="mt-3 text-sm leading-6 text-[#9ba1aa]">{copy}</p></article>)}</div></div></section>
    <section id="start" className="mx-auto max-w-7xl px-4 py-24 sm:px-8 lg:px-[30px] lg:py-32"><div className="rounded-lg border border-white/[.12] bg-[#15171b] px-6 py-12 text-center sm:px-12"><p className="mono text-[11px] uppercase tracking-[.18em] text-[#646a73]">Open source, built in public</p><h2 className="mx-auto mt-5 max-w-xl text-3xl tracking-[-.035em] sm:text-4xl">Make your agents work like a team.</h2><p className="mx-auto mt-4 max-w-lg text-[#9ba1aa]">Install AO locally and start coordinating your sessions in minutes.</p><div className="mt-8 inline-flex items-center gap-3 rounded-md border border-white/[.12] bg-[#0a0b0d] px-4 py-3 mono text-xs text-[#9ba1aa]"><span className="text-[#4d8dff]">$</span> brew install agentwrapper/tap/agent-orchestrator <Command size={14}/></div><div className="mt-6"><a href="https://github.com/aoagents/agent-orchestrator" className="inline-flex items-center gap-2 text-sm text-[#4d8dff] hover:text-white">View on GitHub <ArrowUpRight size={15}/></a></div></div></section>
    <footer className="border-t border-white/[.08] px-4 py-8 sm:px-8 lg:px-[30px]"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 text-xs text-[#646a73] sm:flex-row"><span>© 2026 Agent Orchestrator</span><span className="flex items-center gap-2"><Check size={14} className="text-[#4ade80]"/> Built for teams shipping with AI</span></div></footer>
  </main>;
}
