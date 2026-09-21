import { Link, useParams } from 'react-router-dom';
import ReactMarkdown, { type Components } from 'react-markdown';
import { formatPostDate, posts } from '../data/postsData';

const markdownComponents: Components = {
  h1: ({ children }) => <h2 className="mt-14 text-3xl font-normal tracking-tight text-white">{children}</h2>,
  h2: ({ children }) => <h2 className="mt-14 text-2xl font-normal tracking-tight text-white">{children}</h2>,
  h3: ({ children }) => <h3 className="mt-10 text-lg font-semibold tracking-tight text-white">{children}</h3>,
  p: ({ children }) => <p className="mt-6 text-base leading-relaxed text-white/65">{children}</p>,
  a: ({ href, children }) => (
    <a href={href} className="text-white underline decoration-white/30 underline-offset-4 transition-colors hover:decoration-white">
      {children}
    </a>
  ),
  ul: ({ children }) => <ul className="mt-6 list-disc space-y-2 pl-5 text-base leading-relaxed text-white/65">{children}</ul>,
  ol: ({ children }) => <ol className="mt-6 list-decimal space-y-2 pl-5 text-base leading-relaxed text-white/65">{children}</ol>,
  blockquote: ({ children }) => (
    <blockquote className="mt-8 border-l border-white/10 pl-6 text-base italic leading-relaxed text-white/45">{children}</blockquote>
  ),
  code: ({ children }) => (
    <code className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[0.85em] text-white/80">{children}</code>
  ),
  pre: ({ children }) => (
    <pre className="mt-8 overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.02] p-6 font-mono text-sm leading-relaxed text-white/80">
      {children}
    </pre>
  ),
  hr: () => <hr className="mt-12 border-white/10" />,
  strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
};

export default function PostRoute() {
  const { slug } = useParams<{ slug: string }>();
  const post = posts.find((entry) => entry.slug === slug);

  if (!post) {
    return (
      <section className="w-full py-24 lg:py-32">
        <p className="mb-4 text-xs uppercase tracking-[0.4em] text-white/45">Field Notes</p>
        <h1 className="text-5xl font-normal tracking-tight text-white">Post not found</h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/65">
          There's no post at this address. It may have been renamed, or the link is wrong.
        </p>
        <Link
          to="/writing"
          className="mt-10 inline-block rounded-full border border-white/10 px-4 py-2 text-sm uppercase tracking-[0.28em] text-white/45 transition-colors hover:border-white/20 hover:text-white/75"
        >
          Back to Writing
        </Link>
      </section>
    );
  }

  return (
    <article className="w-full py-24 lg:py-32">
      <Link
        to="/writing"
        className="text-xs uppercase tracking-[0.4em] text-white/45 transition-colors hover:text-white/75"
      >
        ← Writing
      </Link>

      <div className="mt-8 flex items-center gap-x-4 text-xs">
        <time dateTime={post.date} className="text-white/45">
          {formatPostDate(post.date)}
        </time>
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 font-medium text-white/65">
          {post.category}
        </span>
      </div>

      <h1 className="mt-5 max-w-3xl text-5xl font-normal tracking-tight text-white">{post.title}</h1>
      <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/65">{post.summary}</p>

      <div className="mt-16 max-w-2xl border-t border-white/10 pt-4">
        <ReactMarkdown components={markdownComponents}>{post.body}</ReactMarkdown>
      </div>
    </article>
  );
}
