import Link from "next/link";
import { notFound } from "next/navigation";
import { readGoals } from "@/lib/cusoos";
import { GOAL_SLUGS, GoalSlug } from "@/lib/types";
import { GoalEditor } from "@/components/GoalEditor";

export const dynamic = "force-dynamic";

export default async function GoalsDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!(GOAL_SLUGS as string[]).includes(slug)) notFound();

  const goals = await readGoals(slug as GoalSlug);
  const totalGoals = goals.horizons.reduce((a, h) => a + h.goals.length, 0);

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="font-mono text-[11px] tracking-[0.2em] text-[var(--color-bat)]">
          // GOALS · {slug.toUpperCase()}
        </div>
        <div className="flex items-baseline justify-between flex-wrap gap-2">
          <h1 className="text-3xl font-semibold tracking-tight text-white capitalize">
            {slug} goals
          </h1>
          <div className="flex gap-3 text-[11px]">
            <Link
              href="/goals"
              className="font-mono tracking-[0.18em] text-[var(--color-muted)] hover:text-[var(--color-bat)]"
            >
              ALL GOALS
            </Link>
            <Link
              href="/goals/timeline"
              className="font-mono tracking-[0.18em] text-[var(--color-muted)] hover:text-[var(--color-bat)]"
            >
              TIMELINE →
            </Link>
          </div>
        </div>
        <p className="text-sm text-[var(--color-muted)]">
          {totalGoals} goal{totalGoals === 1 ? "" : "s"} set across {goals.horizons.length} horizons.
        </p>
      </div>

      {goals.horizons.length === 0 && (
        <p className="text-sm italic text-[var(--color-dim)]">
          No horizons defined. Edit{" "}
          <code className="text-[var(--color-bat)]">goals/{slug}.md</code> directly.
        </p>
      )}

      {goals.horizons.map((h) => (
        <section key={h.horizon} className="space-y-3">
          <div className="flex items-baseline justify-between">
            <h2 className="font-mono text-[11px] tracking-[0.2em] uppercase text-[var(--color-bat)]">
              // {h.horizon} goals
            </h2>
            <span className="font-mono text-[10px] text-[var(--color-muted)]">
              SET {h.setDate} → TARGET {h.targetDate}
            </span>
          </div>

          <div className="bat-panel p-5">
            <GoalEditor slug={slug as GoalSlug} horizon={h.horizon} items={h.goals} />
          </div>

          {h.prompts.length > 0 && (
            <details className="bat-panel px-4 py-3 text-sm">
              <summary className="cursor-pointer font-mono text-[10px] tracking-[0.18em] uppercase text-[var(--color-dim)] hover:text-[var(--color-bat)]">
                Prompts to articulate goals
              </summary>
              <ul className="mt-3 space-y-1.5 text-[13px] text-[var(--color-muted)] list-disc pl-5">
                {h.prompts.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </details>
          )}
        </section>
      ))}
    </div>
  );
}

export async function generateStaticParams() {
  return GOAL_SLUGS.map((slug) => ({ slug }));
}
