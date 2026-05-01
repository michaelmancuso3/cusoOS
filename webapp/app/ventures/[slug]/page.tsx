import Link from "next/link";
import { notFound } from "next/navigation";
import { readVenture, readGoals } from "@/lib/cusoos";
import {
  VENTURE_SLUGS,
  VentureSlug,
  GoalSlug,
  GoalHorizon,
} from "@/lib/types";
import { TaskBoard } from "@/components/TaskBoard";
import { SimpleList } from "@/components/SimpleList";
import { GoalEditor } from "@/components/GoalEditor";
import {
  addBlocker,
  deleteBlocker,
  addNote,
  deleteNote,
} from "@/lib/actions";

export const dynamic = "force-dynamic";

function daysUntil(dateStr: string): number {
  const d = new Date(dateStr + "T23:59:59");
  const now = new Date();
  return Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export default async function VenturePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!(VENTURE_SLUGS as string[]).includes(slug)) notFound();

  const venture = await readVenture(slug as VentureSlug);
  let goals: Awaited<ReturnType<typeof readGoals>> | null = null;
  try {
    goals = await readGoals(slug as GoalSlug);
  } catch {
    goals = null;
  }

  const totalOpen = venture.todos.flatMap((c) => c.items.filter((i) => !i.checked)).length;
  const totalDone = venture.todos.flatMap((c) => c.items.filter((i) => i.checked)).length;

  return (
    <div className="space-y-8">
      <Header venture={venture} totalOpen={totalOpen} totalDone={totalDone} />

      {/* Tasks (ClickUp-style list view with filters) */}
      <Section title="// Tasks">
        <TaskBoard slug={venture.slug} categories={venture.todos} />
      </Section>

      {/* Two-column row: Active Initiatives + Recurring */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Section title="// Active Initiatives">
          <div className="bat-panel px-4 py-3">
            {venture.activeInitiatives.intro && (
              <p className="text-[13px] text-[var(--color-muted)] mb-3">
                {venture.activeInitiatives.intro}
              </p>
            )}
            {venture.activeInitiatives.items.length > 0 ? (
              <ul className="space-y-2">
                {venture.activeInitiatives.items.map((it, i) => (
                  <li
                    key={i}
                    className="text-[13px] text-white flex gap-2 items-start"
                    dangerouslySetInnerHTML={{
                      __html: `<span class="font-mono text-[var(--color-bat-dim)] mr-1">▸</span>${renderInline(it)}`,
                    }}
                  />
                ))}
              </ul>
            ) : (
              <p className="text-sm italic text-[var(--color-dim)]">None.</p>
            )}
          </div>
        </Section>

        <Section title="// Recurring">
          <div className="bat-panel px-4 py-3">
            {venture.recurring.length === 0 ? (
              <p className="text-sm italic text-[var(--color-dim)]">
                No recurring items.
              </p>
            ) : (
              <ul className="space-y-2">
                {venture.recurring.map((r, i) => (
                  <li
                    key={i}
                    className="text-[13px] text-white"
                    dangerouslySetInnerHTML={{
                      __html: renderInline(r.raw),
                    }}
                  />
                ))}
              </ul>
            )}
          </div>
        </Section>
      </div>

      {/* Two-column row: Blockers + Notes */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Section title="// Blockers">
          <div className="bat-panel">
            <SimpleList
              slug={venture.slug}
              items={venture.blockers}
              emptyText="Nothing blocked."
              placeholder="What's blocked?"
              addAction={addBlocker}
              deleteAction={deleteBlocker}
              bullet="✕"
              bulletClass="text-[var(--color-critical)]"
            />
          </div>
        </Section>

        <Section title="// Notes">
          <div className="bat-panel">
            <SimpleList
              slug={venture.slug}
              items={venture.notes}
              emptyText="No notes."
              placeholder="Add a note…"
              addAction={addNote}
              deleteAction={deleteNote}
              bullet="◇"
              bulletClass="text-[var(--color-muted)]"
            />
          </div>
        </Section>
      </div>

      {/* Context */}
      <Section title="// Context">
        <div className="bat-panel px-4 py-3">
          {venture.context.length === 0 ? (
            <p className="text-sm italic text-[var(--color-dim)]">No context.</p>
          ) : (
            <ul className="space-y-1.5 text-[13px] text-white">
              {venture.context.map((c, i) => (
                <li
                  key={i}
                  className="flex gap-2 items-start"
                  dangerouslySetInnerHTML={{
                    __html: `<span class="font-mono text-[var(--color-bat-dim)] mr-1">·</span>${renderInline(c)}`,
                  }}
                />
              ))}
            </ul>
          )}
        </div>
      </Section>

      {/* Goals (per-venture, all 3 horizons) */}
      {goals && (
        <Section
          title="// Goals"
          right={
            <Link
              href={`/goals/${slug}`}
              className="font-mono text-[10px] tracking-[0.18em] text-[var(--color-muted)] hover:text-[var(--color-bat)]"
            >
              FULL VIEW →
            </Link>
          }
        >
          <div className="grid md:grid-cols-3 gap-3">
            {(["6-month", "1-year", "3-year"] as GoalHorizon[]).map((horizon) => {
              const h = goals!.horizons.find((x) => x.horizon === horizon);
              if (!h) return null;
              return (
                <div key={horizon} className="bat-panel p-4">
                  <div className="flex items-baseline justify-between mb-3">
                    <span className="hud-label">{horizon}</span>
                    <span className="font-mono text-[10px] text-[var(--color-dim)]">
                      → {h.targetDate}
                    </span>
                  </div>
                  <GoalEditor
                    slug={slug as GoalSlug}
                    horizon={horizon}
                    items={h.goals}
                  />
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {/* Recently Completed */}
      <Section title="// Recently Completed">
        <div className="bat-panel px-4 py-3">
          {venture.recentlyCompleted.length === 0 ? (
            <p className="text-sm italic text-[var(--color-dim)]">
              Nothing archived recently.
            </p>
          ) : (
            <ul className="space-y-1 font-mono text-[12px] text-[var(--color-muted)]">
              {venture.recentlyCompleted.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          )}
        </div>
      </Section>
    </div>
  );
}

function Header({
  venture,
  totalOpen,
  totalDone,
}: {
  venture: Awaited<ReturnType<typeof readVenture>>;
  totalOpen: number;
  totalDone: number;
}) {
  const days = venture.hardDeadline ? daysUntil(venture.hardDeadline.date) : null;

  return (
    <div className="space-y-3">
      <div className="font-mono text-[11px] tracking-[0.2em] text-[var(--color-bat)]">
        // VENTURE · {venture.slug.toUpperCase()}
      </div>
      <div className="flex items-baseline justify-between flex-wrap gap-3">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-white">
          {venture.name}
        </h1>
        {days !== null && days >= 0 && (
          <div className="bat-panel-warn px-3 py-2 flex items-center gap-3">
            <span className="font-mono text-[10px] tracking-[0.18em] text-[var(--color-bat)]">
              T-{days}D
            </span>
            <span className="text-[12px] text-white">
              {venture.hardDeadline?.label} · {venture.hardDeadline?.date}
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-3">
        <Stat label="OPEN" value={totalOpen} tone="bat" />
        <Stat label="DONE" value={totalDone} tone="dim" />
        <Stat label="BLOCKED" value={venture.blockers.length} tone={venture.blockers.length > 0 ? "crit" : "dim"} />
        <Stat label="RECURRING" value={venture.recurring.length} tone="dim" />
        <Stat label="NOTES" value={venture.notes.length} tone="dim" />
      </div>
    </div>
  );
}

function Stat({
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
    <div className="bat-panel px-3 py-1.5 flex items-baseline gap-2">
      <span className="font-mono text-[9px] tracking-[0.18em] text-[var(--color-dim)]">
        {label}
      </span>
      <span className={`font-mono text-sm ${color}`}>{value}</span>
    </div>
  );
}

function Section({
  title,
  children,
  right,
}: {
  title: string;
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="font-mono text-[11px] tracking-[0.2em] uppercase text-[var(--color-bat)]">
          {title}
        </h2>
        {right}
      </div>
      {children}
    </section>
  );
}

function renderInline(text: string): string {
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return escaped
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="text-white">$1</strong>')
    .replace(
      /`([^`]+)`/g,
      '<code class="text-xs bg-[var(--color-panel-2)] border border-[var(--color-line)] text-[var(--color-bat)] px-1 rounded">$1</code>',
    )
    .replace(
      /(^|[\s(])_([^_\n]+)_(?=[\s.,;:)?!]|$)/g,
      '$1<em class="text-[var(--color-muted)]">$2</em>',
    )
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" class="text-[var(--color-bat)] underline">$1</a>',
    );
}

export async function generateStaticParams() {
  return VENTURE_SLUGS.map((slug) => ({ slug }));
}
