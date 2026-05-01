import Link from "next/link";
import { readAllGoals } from "@/lib/cusoos";

export const dynamic = "force-dynamic";

export default async function GoalsPage() {
  const all = await readAllGoals();
  const totalGoals = all.reduce(
    (acc, g) => acc + g.horizons.reduce((a, h) => a + h.goals.length, 0),
    0,
  );

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="font-mono text-[11px] tracking-[0.2em] text-[var(--color-bat)]">
          // GOALS // BY VENTURE
        </div>
        <div className="flex items-baseline justify-between flex-wrap gap-2">
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            Goal grid
          </h1>
          <div className="flex gap-3 text-[11px]">
            <Link
              href="/goals/timeline"
              className="font-mono tracking-[0.18em] text-[var(--color-muted)] hover:text-[var(--color-bat)]"
            >
              BY TIMELINE →
            </Link>
          </div>
        </div>
        <p className="text-sm text-[var(--color-muted)]">
          {totalGoals} goal{totalGoals === 1 ? "" : "s"} set across {all.length} ventures + personal.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {all.map((g) => {
          const filled = g.horizons.reduce((a, h) => a + h.goals.length, 0);
          const byHorizon = g.horizons.map((h) => ({
            horizon: h.horizon,
            count: h.goals.length,
          }));
          return (
            <Link
              key={g.slug}
              href={`/goals/${g.slug}`}
              className="bat-panel block p-4 hover:border-[var(--color-bat-dim)] transition-colors"
            >
              <div className="flex items-baseline justify-between mb-3">
                <h3 className="font-mono text-[12px] tracking-[0.18em] uppercase text-white">
                  {g.slug}
                </h3>
                <span className="font-mono text-[10px] text-[var(--color-bat)]">
                  {filled} GOALS
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                {byHorizon.map((h) => (
                  <div
                    key={h.horizon}
                    className="border border-[var(--color-line)] px-2 py-1 text-center"
                  >
                    <div className="font-mono text-[8px] tracking-wider text-[var(--color-dim)]">
                      {h.horizon.replace("-", " ").toUpperCase()}
                    </div>
                    <div
                      className={`font-mono text-sm ${
                        h.count > 0
                          ? "text-[var(--color-bat)]"
                          : "text-[var(--color-dim)]"
                      }`}
                    >
                      {h.count}
                    </div>
                  </div>
                ))}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
