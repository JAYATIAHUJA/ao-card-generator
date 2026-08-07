import Link from "next/link";

export function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 h-14">
      <div className="mx-auto flex h-14 w-[calc(100%-2rem)] max-w-7xl items-center justify-between sm:w-[calc(100%-4rem)] lg:w-[calc(100%-60px)]">
        <Link href="/" className="inline-flex items-center gap-2 text-base font-medium leading-none tracking-[-0.5px] text-[oklch(0.988_0.003_106.5)] no-underline">
          <img src="/ao-logo.svg" alt="" width="20" height="20" className="size-5 shrink-0 -translate-y-0.5" />
          <span>The Orchestra</span>
        </Link>
        <a href="https://aoagents.dev" target="_blank" rel="noreferrer" className="inline-flex h-8 items-center gap-2 whitespace-nowrap rounded-2xl bg-[oklch(0.988_0.003_106.5)] px-3 text-sm font-semibold tracking-[-0.5px] text-[oklch(0.228_0.013_107.4)] no-underline transition-opacity hover:opacity-90">
          What is AO?
        </a>
      </div>
    </header>
  );
}
