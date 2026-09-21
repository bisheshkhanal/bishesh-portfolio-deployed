import { Link } from 'react-router-dom';
import { formatPostDate, posts } from '../data/postsData';

export default function WritingRoute() {
  return (
    <section id="writing" className="w-full py-24 lg:py-32">
      <p className="mb-4 text-xs uppercase tracking-[0.4em] text-white/45">Field Notes</p>
      <h1 className="text-5xl font-normal tracking-tight text-white">Writing & Logs</h1>
      <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/65">
        Notes on agentic engineering, AI infrastructure, and biotech. I write about things I'm building and things I'm still figuring out.
      </p>

      <div className="mt-16 border-t border-white/10 pt-16">
        {posts.length === 0 ? (
          <div className="relative overflow-hidden rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-8 py-20 text-center">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-0 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5 blur-3xl"
            />
            <p className="relative text-xs uppercase tracking-[0.4em] text-white/45">Empty for now</p>
            <h2 className="relative mt-5 text-2xl font-normal tracking-tight text-white">Nothing published yet</h2>
            <p className="relative mx-auto mt-4 max-w-md text-sm leading-relaxed text-white/65">
              I haven't written anything yet. When I do, it'll show up here.
            </p>
          </div>
        ) : (
          <div className="grid gap-8">
            {posts.map((post) => (
              <article key={post.slug} className="group relative flex flex-col items-start justify-between">
                <div className="flex items-center gap-x-4 text-xs">
                  <time dateTime={post.date} className="text-white/45">
                    {formatPostDate(post.date)}
                  </time>
                  <span className="relative z-10 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 font-medium text-white/65">
                    {post.category}
                  </span>
                </div>
                <h2 className="mt-3 text-xl font-semibold leading-6 text-white transition-colors group-hover:text-white/80">
                  <Link to={`/writing/${post.slug}`}>
                    <span className="absolute inset-0" />
                    {post.title}
                  </Link>
                </h2>
                <p className="mt-4 line-clamp-3 text-sm leading-6 text-white/65">{post.summary}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
