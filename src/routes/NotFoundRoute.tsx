import { Link } from 'react-router-dom';

export default function NotFoundRoute() {
  return (
    <section className="w-full py-24 lg:py-32">
      <p className="mb-4 text-xs uppercase tracking-[0.4em] text-white/45">Error 404</p>
      <h1 className="text-5xl font-normal tracking-tight text-white">Page not found</h1>
      <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/65">
        This address doesn't lead anywhere. The page may have moved, or the link that brought you here is out of date.
      </p>
      <Link
        to="/"
        className="mt-10 inline-block rounded-full border border-white/10 px-4 py-2 text-sm uppercase tracking-[0.28em] text-white/45 transition-colors hover:border-white/20 hover:text-white/75"
      >
        Back Home
      </Link>
    </section>
  );
}
