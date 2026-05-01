import Link from "next/link";
import { listWeeklyReviews } from "@/lib/cusoos";
import { getCurrentWeekId } from "@/lib/weeks";

export const dynamic = "force-dynamic";

export default async function WeeklyIndexPage() {
  const weeks = await listWeeklyReviews();
  const current = getCurrentWeekId();
  const hasCurrent = weeks.includes(current);

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="font-mono text-[11px] tracking-[0.2em] text-[var(--color-bat)]">
          // WEEKLY // REVIEWS
        </div>
        <div className="flex items-baseline justify-between flex-wrap gap-2">
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            Weekly reviews
          </h1>
          {!hasCurrent && (
            <Link
              href={`/weekly/${current}`}
              className="bat-btn no-underline"
            >
              + new for {current}
            </Link>
          )}
        </div>
        <p className="text-sm text-[var(--color-muted)]">
          {weeks.length} review{weeks.length === 1 ? "" : "s"} on file. Current week:{" "}
          <Link
            href={`/weekly/${current}`}
            className="text-[var(--color-bat)] underline"
          >
            {current}
          </Link>
        </p>
      </div>

      {weeks.length === 0 ? (
        <p className="text-sm italic text-[var(--color-dim)]">
          No reviews yet.
        </p>
      ) : (
        <ul className="bat-panel divide-y divide-[var(--color-line)]">
          {weeks.map((w) => (
            <li key={w}>
              <Link
                href={`/weekly/${w}`}
                className="row-hover flex items-center justify-between px-4 py-3 text-[13px]"
              >
                <span className="font-mono text-white">{w}</span>
                {w === current && (
                  <span className="font-mono text-[10px] tracking-wider text-[var(--color-bat)]">
                    CURRENT
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
