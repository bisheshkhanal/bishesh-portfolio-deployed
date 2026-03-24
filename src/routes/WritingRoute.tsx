export default function WritingRoute() {
  return (
    <section className="w-full py-24 lg:py-32">
      <p className="mb-4 text-xs uppercase tracking-[0.4em] text-white/45">Digital Garden</p>
      <h1 className="text-5xl font-normal tracking-tight text-white">Writing & Logs</h1>
      <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/65">
        A living space for thoughts, learnings, and explorations on agentic engineering, AI infrastructure, and biotech.
      </p>
      
      <div className="mt-16 grid gap-8 border-t border-white/10 pt-16">
        <article className="group relative flex flex-col items-start justify-between">
          <div className="flex items-center gap-x-4 text-xs">
            <time dateTime="2024-03-13" className="text-white/45">
              Mar 13, 2024
            </time>
            <span className="relative z-10 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 font-medium text-white/65 hover:bg-white/10">
              Agentic Engineering
            </span>
          </div>
          <div className="group relative">
            <h3 className="mt-3 text-xl font-semibold leading-6 text-white group-hover:text-white/80">
              <a href="#">
                <span className="absolute inset-0" />
                The Shift to Agentic Workflows
              </a>
            </h3>
            <p className="mt-4 line-clamp-3 text-sm leading-6 text-white/65">
              Exploring how moving from static scripts to agentic systems changes the way we build and interact with software. A deep dive into reasoning loops and tool use.
            </p>
          </div>
        </article>

        <article className="group relative flex flex-col items-start justify-between">
          <div className="flex items-center gap-x-4 text-xs">
            <time dateTime="2024-02-28" className="text-white/45">
              Feb 28, 2024
            </time>
            <span className="relative z-10 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 font-medium text-white/65 hover:bg-white/10">
              Biotech
            </span>
          </div>
          <div className="group relative">
            <h3 className="mt-3 text-xl font-semibold leading-6 text-white group-hover:text-white/80">
              <a href="#">
                <span className="absolute inset-0" />
                Bridging Software and Biology
              </a>
            </h3>
            <p className="mt-4 line-clamp-3 text-sm leading-6 text-white/65">
              Thoughts on the intersection of computational systems and biological processes. How modern AI infrastructure is accelerating biotech research.
            </p>
          </div>
        </article>
      </div>
    </section>
  );
}
