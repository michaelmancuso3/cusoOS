import Link from "next/link";
import {
  readAllVentures,
  readDailyPlan,
  readAllGoals,
} from "@/lib/cusoos";
import type { Venture, Goals } from "@/lib/types";

export const dynamic = "force-dynamic";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysUntil(dateStr: string): number {
  const d = new Date(dateStr + "T23:59:59");
  const now = new Date();
  return Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function fmtDate(iso: string): string {
  return new Date(iso + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function DashboardPage() {
  const today = todayISO();
  const [ventures, todayPlan, allGoals] = await Promise.all([
    readAllVentures(),
    readDailyPlan(today),
    readAllGoals(),
  ]);

  const critical = collectCritical(ventures, today);
  const totals = computeTotals(ventures);

  return (
    <div className="space-y-8">
      <Header today={today} />

      {critical.length > 0 && (
        <CriticalRow items={critical} />
      )}

      <StatsGrid totals={totals} />

      <GoalStatusStrip goals={allGoals} />

      <TodayDirective todayPlan={todayPlan} today={today} />

      <VenturesGrid ventures={ventures} />

      <GoalsAlignment goals={allGoals} />
    </div>
  );
}

function Header({ today }: { today: string }) {
  return (
    <div className="hero-glow jarvis-frame px-5 py-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="size-1.5 rounded-full bg-[var(--color-arc)] pulse-arc" />
        <div className="font-mono text-[10px] tracking-[0.22em] text-[var(--color-arc)] uppercase">
          system online · operations dashboard
        </div>
      </div>
      <div className="flex items-baseline justify-between flex-wrap gap-3">
        <h1 className="text-3xl font-semibold tracking-tight text-white">
          {fmtDate(today)}
          <span className="caret" />
        </h1>
        <div className="font-mono text-[11px] tracking-[0.18em] text-[var(--color-muted)]">
          MICHAEL · DIRECTOR · 6 VENTURES ACTIVE
        </div>
      </div>
    </div>
  );
}

type Critical = {
  level: "DUE" | "WARN" | "BLOCK";
  tag: string;
  text: string;
  href: string;
};

function CriticalRow({ items }: { items: Critical[] }) {
  return (
    <section>
      <SectionLabel>// Critical</SectionLabel>
      <ul className="space-y-2">
        {items.map((u, i) => (
          <li key={i}>
            <Link
              href={u.href}
              className={
                u.level === "BLOCK"
                  ? "bat-panel-crit flex items-center gap-4 px-4 py-3 hover:opacity-90"
                  : "bat-panel-warn flex items-center gap-4 px-4 py-3 hover:opacity-90"
              }
            >
              <span
                className={`font-mono text-[10px] tracking-[0.18em] shrink-0 ${
                  u.level === "BLOCK"
                    ? "text-[var(--color-critical)]"
                    : "text-[var(--color-bat)]"
                }`}
              >
                {u.tag}
              </span>
              <span className="text-sm text-white">{u.text}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function StatsGrid({ totals }: { totals: ReturnType<typeof computeTotals> }) {
  const cells: { label: string; value: number; tone?: "bat" | "crit" | "muted" }[] = [
    { label: "OPEN TASKS", value: totals.openTodos, tone: "bat" },
    { label: "BLOCKERS", value: totals.blockers, tone: totals.blockers > 0 ? "crit" : "muted" },
    { label: "RECURRING", value: totals.recurring, tone: "muted" },
    { label: "DAYS TO NEXT DEADLINE", value: totals.nextDeadlineDays ?? 0, tone: "bat" },
  ];
  return (
    <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {cells.map((c) => (
        <div key={c.label} className="bat-panel px-4 py-3">
          <div className="hud-label-dim mb-1">{c.label}</div>
          <div
            className={`text-3xl font-mono tracking-tight ${
              c.tone === "bat"
                ? "text-[var(--color-bat)]"
                : c.tone === "crit"
                ? "text-[var(--color-critical)]"
                : "text-white"
            }`}
          >
            {c.label === "DAYS TO NEXT DEADLINE" && totals.nextDeadlineDays === null
              ? "—"
              : c.value}
          </div>
        </div>
      ))}
    </section>
  );
}

function GoalStatusStrip({ goals }: { goals: Goals[] }) {
  const counts = { onTrack: 0, atRisk: 0, offTrack: 0, none: 0, done: 0 };
  let total = 0;
  for (const g of goals) {
    for (const h of g.horizons) {
      for (const item of h.goals) {
        total++;
        if (item.checked === true) counts.done++;
        else if (item.status === "on-track") counts.onTrack++;
        else if (item.status === "at-risk") counts.atRisk++;
        else if (item.status === "off-track") counts.offTrack++;
        else counts.none++;
      }
    }
  }

  if (total === 0) return null;

  const cells = [
    { label: "ON TRACK", value: counts.onTrack, cls: "text-[var(--color-go)] border-[var(--color-go)]/40 bg-[var(--color-go)]/5" },
    { label: "AT RISK", value: counts.atRisk, cls: "text-[var(--color-warn)] border-[var(--color-warn)]/40 bg-[var(--color-warn)]/5" },
    { label: "OFF TRACK", value: counts.offTrack, cls: "text-[var(--color-critical)] border-[var(--color-critical)]/40 bg-[var(--color-critical)]/5" },
    { label: "NO STATUS", value: counts.none, cls: "text-[var(--color-muted)] border-[var(--color-line)] bg-[var(--color-panel-2)]" },
    { label: "DONE", value: counts.done, cls: "text-[var(--color-bat)] border-[var(--color-bat)]/30 bg-[var(--color-bat)]/5" },
  ];

  return (
    <section>
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="font-mono text-[11px] tracking-[0.2em] text-[var(--color-bat)] uppercase">
          // Goal Status · {total} TOTAL
        </h2>
        <Link
          href="/goals/timeline"
          className="font-mono text-[10px] tracking-[0.18em] text-[var(--color-muted)] hover:text-[var(--color-bat)]"
        >
          TIMELINE →
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {cells.map((c) => (
          <div
            key={c.label}
            className={`px-3 py-2 border rounded-sm ${c.cls}`}
          >
            <div className="font-mono text-[9px] tracking-[0.18em] uppercase opacity-80">
              {c.label}
            </div>
            <div className="font-mono text-2xl">{c.value}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function TodayDirective({
  todayPlan,
  today,
}: {
  todayPlan: Awaited<ReturnType<typeof readDailyPlan>>;
  today: string;
}) {
  return (
    <section>
      <div className="flex items-baseline justify-between mb-2">
        <SectionLabel>// Today&apos;s Directive</SectionLabel>
        <Link
          href={`/daily/${today}`}
          className="font-mono text-[10px] tracking-[0.18em] text-[var(--color-muted)] hover:text-[var(--color-bat)]"
        >
          FULL PLAN →
        </Link>
      </div>
      {todayPlan ? (
        <div className="bat-panel px-5 py-4">
          <p className="text-base text-white leading-relaxed">
            {(todayPlan.theme || "").replace(/^_|_$/g, "")}
          </p>
        </div>
      ) : (
        <div className="bat-panel px-5 py-4">
          <p className="text-sm text-[var(--color-muted)]">
            No plan generated yet. Run{" "}
            <code className="text-[var(--color-bat)]">/plan</code> in Claude Code.
          </p>
        </div>
      )}
    </section>
  );
}

function VenturesGrid({ ventures }: { ventures: Venture[] }) {
  return (
    <section>
      <SectionLabel>// Ventures</SectionLabel>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ventures.map((v) => (
          <VentureCard key={v.slug} venture={v} />
        ))}
      </div>
    </section>
  );
}

function VentureCard({ venture }: { venture: Venture }) {
  const open = venture.todos.flatMap((c) => c.items.filter((i) => !i.checked));
  const dueRecurring = venture.recurring.find(
    (r) => r.nextDue === todayISO(),
  );
  const days = venture.hardDeadline
    ? daysUntil(venture.hardDeadline.date)
    : null;

  return (
    <Link
      href={`/ventures/${venture.slug}`}
      className="bat-panel block p-4 hover:border-[var(--color-bat-dim)] transition-colors group"
    >
      <div className="flex items-baseline justify-between gap-2 mb-3">
        <h3 className="text-sm font-mono tracking-[0.05em] text-white uppercase truncate">
          {venture.slug}
        </h3>
        {days !== null && days <= 60 && (
          <span className="font-mono text-[10px] text-[var(--color-bat)] whitespace-nowrap">
            T-{days}D
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        <Metric label="OPEN" value={open.length} tone="bat" />
        <Metric
          label="BLOCK"
          value={venture.blockers.length}
          tone={venture.blockers.length > 0 ? "crit" : "dim"}
        />
        <Metric
          label="DONE"
          value={venture.recentlyCompleted.length}
          tone="dim"
        />
      </div>

      {dueRecurring && (
        <div className="flex items-center gap-2 mb-2 text-[11px]">
          <span className="size-1.5 rounded-full bg-[var(--color-bat)] pulse-bat" />
          <span className="font-mono text-[10px] tracking-wider text-[var(--color-bat)]">
            DUE TODAY · {dueRecurring.text}
          </span>
        </div>
      )}

      {venture.activeInitiatives.items.length > 0 && (
        <p className="text-[12px] text-[var(--color-muted)] line-clamp-2">
          {venture.activeInitiatives.items[0].replace(
            /^\*\*([^*]+)\*\*\s*—\s*/,
            "$1: ",
          )}
        </p>
      )}
    </Link>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "bat" | "crit" | "dim";
}) {
  const color =
    tone === "bat"
      ? "text-[var(--color-bat)]"
      : tone === "crit"
      ? "text-[var(--color-critical)]"
      : "text-[var(--color-muted)]";
  return (
    <div>
      <div className="font-mono text-[9px] tracking-[0.18em] text-[var(--color-dim)]">
        {label}
      </div>
      <div className={`font-mono text-lg ${color}`}>{value}</div>
    </div>
  );
}

function GoalsAlignment({ goals }: { goals: Goals[] }) {
  const horizons: ("6-month" | "1-year" | "3-year")[] = [
    "6-month",
    "1-year",
    "3-year",
  ];

  // Aggregate goals across all ventures, by horizon
  const byHorizon = horizons.map((horizon) => {
    const all = goals.flatMap((g) => {
      const h = g.horizons.find((x) => x.horizon === horizon);
      if (!h) return [];
      return h.goals.map((entry) => ({ slug: g.slug, ...entry }));
    });
    const targetDate =
      goals[0]?.horizons.find((x) => x.horizon === horizon)?.targetDate ?? "";
    return { horizon, targetDate, items: all };
  });

  const filledCount = byHorizon.reduce((acc, h) => acc + h.items.length, 0);

  return (
    <section>
      <div className="flex items-baseline justify-between mb-2">
        <SectionLabel>// Goal Alignment</SectionLabel>
        <Link
          href="/goals/timeline"
          className="font-mono text-[10px] tracking-[0.18em] text-[var(--color-muted)] hover:text-[var(--color-bat)]"
        >
          TIMELINE →
        </Link>
      </div>

      {filledCount === 0 ? (
        <div className="bat-panel px-5 py-6 text-center">
          <p className="text-sm text-[var(--color-muted)]">
            No goals set yet. Open any{" "}
            <Link href="/goals" className="text-[var(--color-bat)] underline">
              venture goals
            </Link>{" "}
            to start.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-3">
          {byHorizon.map((h) => (
            <div key={h.horizon} className="bat-panel p-4">
              <div className="flex items-baseline justify-between mb-3">
                <span className="hud-label">{h.horizon.replace("-", " ")}</span>
                <span className="font-mono text-[10px] text-[var(--color-dim)]">
                  → {h.targetDate}
                </span>
              </div>
              {h.items.length === 0 ? (
                <p className="text-xs italic text-[var(--color-dim)]">
                  No goals set.
                </p>
              ) : (
                <ul className="space-y-1.5">
                  {h.items.slice(0, 5).map((it, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-[12px]"
                    >
                      <span className="font-mono text-[9px] uppercase text-[var(--color-bat-dim)] w-12 shrink-0 mt-0.5">
                        {it.slug.slice(0, 4)}
                      </span>
                      <span
                        className={
                          it.checked
                            ? "line-through text-[var(--color-dim)]"
                            : "text-white"
                        }
                      >
                        {it.text}
                      </span>
                    </li>
                  ))}
                  {h.items.length > 5 && (
                    <li className="text-[11px] text-[var(--color-dim)] italic">
                      + {h.items.length - 5} more
                    </li>
                  )}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-mono text-[11px] tracking-[0.2em] text-[var(--color-bat)] mb-3 uppercase">
      {children}
    </h2>
  );
}

function collectCritical(ventures: Venture[], today: string): Critical[] {
  const items: Critical[] = [];
  for (const v of ventures) {
    for (const r of v.recurring) {
      if (r.nextDue === today) {
        items.push({
          level: "DUE",
          tag: "DUE TODAY",
          text: `${v.name}: ${r.text}`,
          href: `/ventures/${v.slug}`,
        });
      }
    }
    if (v.hardDeadline) {
      const d = daysUntil(v.hardDeadline.date);
      if (d <= 14 && d >= 0) {
        items.push({
          level: "WARN",
          tag: `T-${d}D`,
          text: `${v.name}: ${v.hardDeadline.label || "Hard deadline"} (${v.hardDeadline.date})`,
          href: `/ventures/${v.slug}`,
        });
      }
    }
    for (const b of v.blockers) {
      items.push({
        level: "BLOCK",
        tag: "BLOCKED",
        text: `${v.name}: ${b}`,
        href: `/ventures/${v.slug}`,
      });
    }
  }
  return items;
}

function computeTotals(ventures: Venture[]) {
  let openTodos = 0;
  let blockers = 0;
  let recurring = 0;
  let nextDeadlineDays: number | null = null;
  for (const v of ventures) {
    for (const cat of v.todos) {
      openTodos += cat.items.filter((i) => !i.checked).length;
    }
    blockers += v.blockers.length;
    recurring += v.recurring.length;
    if (v.hardDeadline) {
      const d = daysUntil(v.hardDeadline.date);
      if (d >= 0 && (nextDeadlineDays === null || d < nextDeadlineDays)) {
        nextDeadlineDays = d;
      }
    }
  }
  return { openTodos, blockers, recurring, nextDeadlineDays };
}
