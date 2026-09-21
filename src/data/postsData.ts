export type Post = {
  slug: string;
  title: string;
  date: string;      // ISO date, e.g. "2026-01-14"
  category: string;  // e.g. "Agentic Engineering"
  summary: string;
  body: string;      // markdown source rendered on the post detail route
};

// Intentionally empty — no posts are published yet.
// Add real entries here; the writing index and /writing/:slug detail route read from this array.
export const posts: Post[] = [];

// Renders a Post `date` ("2026-01-14") as "Jan 14, 2026" without timezone drift.
export function formatPostDate(date: string): string {
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}
