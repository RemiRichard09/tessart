import Link from "next/link";

const STEPS = [
  {
    n: "01",
    title: "Describe your plant",
    body: "Industry, thermal process, energy profile, and tariffs — four minutes of inputs.",
  },
  {
    n: "02",
    title: "See the digital twin",
    body: "A live 3D view of TESSA in your facility: grid charging, heat delivery, waste-heat recovery.",
  },
  {
    n: "03",
    title: "Get the business case",
    body: "Sizing, peak shaving, savings, CO₂ impact, subsidies, and payback — ready to present.",
  },
];

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      {/* Ambient glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[880px] -translate-x-1/2 rounded-full bg-volt/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-64 -right-40 h-[380px] w-[520px] rounded-full bg-ember/10 blur-3xl"
      />

      <section className="relative mx-auto flex max-w-5xl flex-col items-center px-6 pb-20 pt-24 text-center sm:pt-32">
        <p className="mb-6 flex items-center gap-2 rounded-full border border-edge bg-card px-4 py-1.5 text-xs font-medium tracking-widest text-txt-2 uppercase">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          Industrial thermal storage
        </p>
        <h1 className="text-5xl font-bold leading-[1.05] tracking-tight sm:text-7xl">
          TESSA Plant Studio
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-txt-2 sm:text-xl">
          Visualize, simulate, and size thermal storage for industrial plants.
        </p>
        <Link
          href="/studio"
          className="mt-10 inline-flex items-center gap-2.5 rounded-xl bg-accent px-8 py-4 text-base font-semibold text-white shadow-lg shadow-accent/25 transition-all hover:bg-accent-bright hover:shadow-accent/40"
        >
          Start plant assessment
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </Link>

        <div className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-txt-2">
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-volt" /> Off-peak
            electricity in
          </span>
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-ember-bright" /> Process
            heat out, 100–500&nbsp;°C
          </span>
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-accent" /> Waste heat
            recovered
          </span>
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-6 pb-28">
        <div className="grid gap-4 sm:grid-cols-3">
          {STEPS.map((s) => (
            <div
              key={s.n}
              className="rounded-2xl border border-edge bg-card p-7"
            >
              <p className="text-sm font-semibold text-accent">{s.n}</p>
              <h2 className="mt-3 text-lg font-semibold">{s.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-txt-2">
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
