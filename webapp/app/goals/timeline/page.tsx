import Link from "next/link";
import { readAllGoals } from "@/lib/cusoos";
import { GoalEditor } from "@/components/GoalEditor";
import { GOAL_SLUGS, GoalSlug, GoalHorizon } from "@/lib/types";

export const dynamic = "force-dynamic";

const HORIZONS: GoalHorizon[] = ["6-month", "1-year", "3-year"];

const SLUG_LABELS: Record<GoalSlug, string> = {
  proactive: "Proactive",
  northland: "Northland",
  midas: "Midas",
  sparkling: "Sparkling",
  unify: "Unify",
  zoomlion: "Zoomlion",
  personal: "Personal",
};

export default async function TimelinePage() {
  const all = await readAllGoals();

  // Pick a representative target date per horizon (use first non-empty)
  const horizonDates: Record<GoalHorizon, string> = {
    "6-month": "",
    "1-year": "",
    "3-year": "",
  };
  for (const g of all) {
    for (const h of g.horizons) {
      if (!horizonDates[h.horizon] && h.targetDate) {
        horizonDates[h.horizon] = h.targetDate;
      }
    }
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="font-mono text-[11px] tracking-[0.2em] text-[var(--color-bat)]">
          // GOALS // TIMELINE
        </div>
        <div className="flex items-baseline justify-between flex-wrap gap-2">
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            Timeline view
          </h1>
          <div className="flex gap-3 text-[11px]">
            <Link
              href="/goals"
              className="font-mono tracking-[0.18em] text-[var(--color-muted)] hover:text-[var(--color-bat)]"
            >
              BY VENTURE →
            </Link>
          </div>
        </div>
        <p className="text-sm text-[var(--color-muted)]">
          All ventures &times; all horizons. Edit any cell directly.
        </p>
      </div>

      {/* Horizon column headers */}
      <div className="grid grid-cols-[140px_1fr_1fr_1fr] gap-3">
        <div />
        {HORIZONS.map((h) => (
          <div
            key={h}
            className="bat-panel-strong px-4 py-3 text-center"
          >
            <div className="hud-label">{h.replace("-", " ")} GOALS</div>
            <div className="font-mono text-[11px] text-[var(--color-muted)] mt-1">
              → {horizonDates[h] || "—"}
            </div>
          </div>
        ))}
      </div>

      {/* Rows: one per venture/personal */}
      <div className="space-y-3">
        {GOAL_SLUGS.map((slug) => {
          const g = all.find((x) => x.slug === slug);
          return (
            <div
              key={slug}
              className="grid grid-cols-[140px_1fr_1fr_1fr] gap-3 items-stretch"
            >
              <Link
                href={`/goals/${slug}`}
                className="bat-panel-strong px-4 py-3 flex flex-col justify-center hover:border-[var(--color-bat-dim)] transition-colors"
              >
                <div className="font-mono text-[11px] tracking-[0.2em] uppercase text-[var(--color-bat)]">
                  {SLUG_LABELS[slug]}
                </div>
                <div className="font-mono text-[10px] text-[var(--color-dim)] mt-0.5">
                  {g?.horizons.reduce(
                    (acc, h) => acc + h.goals.length,
                    0,
                  ) ?? 0}{" "}
                  goals
                </div>
              </Link>

              {HORIZONS.map((horizon) => {
                const h = g?.horizons.find((x) => x.horizon === horizon);
                return (
                  <div
                    key={horizon}
                    className="bat-panel p-3"
                  >
                    {h ? (
                      <GoalEditor
                        slug={slug}
                        horizon={horizon}
                        items={h.goals}
                      />
                    ) : (
                      <p className="text-xs italic text-[var(--color-dim)]">
                        Horizon not defined.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
