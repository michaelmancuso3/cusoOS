import Link from "next/link";
import { notFound } from "next/navigation";
import { readWeeklyReview } from "@/lib/cusoos";
import { weekIdToDateRange } from "@/lib/weeks";
import { WeeklyReviewEditor } from "@/components/WeeklyReviewEditor";

export const dynamic = "force-dynamic";

export default async function WeeklyDetailPage({
  params,
}: {
  params: Promise<{ weekId: string }>;
}) {
  const { weekId } = await params;
  if (!/^\d{4}-W\d{2}$/.test(weekId)) notFound();

  const review = await readWeeklyReview(weekId);
  const range = weekIdToDateRange(weekId);

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="font-mono text-[11px] tracking-[0.2em] text-[var(--color-bat)]">
          // WEEKLY · {weekId}
        </div>
        <div className="flex items-baseline justify-between flex-wrap gap-2">
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            {weekId}
          </h1>
          <Link
            href="/weekly"
            className="font-mono text-[10px] tracking-[0.18em] text-[var(--color-muted)] hover:text-[var(--color-bat)]"
          >
            ALL REVIEWS
          </Link>
        </div>
        {range && (
          <p className="font-mono text-[11px] text-[var(--color-muted)]">
            {range.start} → {range.end}
          </p>
        )}
      </div>

      <WeeklyReviewEditor weekId={weekId} initial={review?.rawMarkdown ?? null} />
    </div>
  );
}
