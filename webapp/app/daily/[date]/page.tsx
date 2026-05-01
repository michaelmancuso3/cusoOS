import Link from "next/link";
import { notFound } from "next/navigation";
import { readDailyPlan } from "@/lib/cusoos";
import { DailyPlanView } from "@/components/DailyPlanEditor";

export const dynamic = "force-dynamic";

export default async function DailyPlanPage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) notFound();

  const plan = await readDailyPlan(date);

  const initial = {
    theme: plan?.theme.replace(/^_|_$/g, "") ?? "",
    plan: plan?.plan ?? "",
    why: plan?.why ?? "",
    notDoing: plan?.notDoing ?? "",
    checkIns: plan?.checkIns ?? [],
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="font-mono text-[11px] tracking-[0.2em] text-[var(--color-bat)]">
          // DAILY · {date}
        </div>
        <div className="flex items-baseline justify-between flex-wrap gap-2">
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            {fmtDate(date)}
          </h1>
          <Link
            href="/daily"
            className="font-mono text-[10px] tracking-[0.18em] text-[var(--color-muted)] hover:text-[var(--color-bat)]"
          >
            ALL PLANS
          </Link>
        </div>
      </div>

      <DailyPlanView date={date} initial={initial} exists={!!plan} />

      {plan?.reflection && (
        <section>
          <h2 className="font-mono text-[11px] tracking-[0.2em] uppercase text-[var(--color-bat)] mb-3">
            // Reflection
          </h2>
          <div className="bat-panel px-5 py-4">
            <pre className="whitespace-pre-wrap text-[13px] font-sans text-white">
              {plan.reflection}
            </pre>
          </div>
        </section>
      )}
    </div>
  );
}

function fmtDate(iso: string): string {
  return new Date(iso + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
