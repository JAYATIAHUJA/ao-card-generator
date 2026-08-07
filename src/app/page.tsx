export default function Home() {
  return (
    <main className="min-h-[100dvh]">
      <section className="mx-auto grid min-h-[100dvh] w-[calc(100%-2rem)] place-items-center text-center sm:w-[calc(100%-4rem)] lg:w-[calc(100%-60px)]">
        <div className="w-full translate-y-12">
          <h1 className="mx-auto w-full max-w-[1000px] text-balance text-center text-[clamp(42px,7vw,96px)] font-normal leading-[0.94] tracking-[-0.06em] text-[oklch(0.988_0.003_106.5)]">
            Seems like you’re attending the Orchestra
          </h1>
          <p className="mt-9 text-base font-normal leading-6 tracking-[-0.5px] text-[oklch(0.737_0.021_106.9)]">
            Enter your X username, you’ll get a ticket.
          </p>
        </div>
      </section>
    </main>
  );
}
