import Link from "next/link";
import { notFound } from "next/navigation";
import { readDailyPlan } from "@/lib/cusoos";

export const dynamic = "force-dynamic";

export default async function DailyPlanPage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) notFound();

  const plan = await readDailyPlan(date);

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

      {!plan ? (
        <div className="bat-panel px-5 py-8 text-center">
          <p className="text-sm text-[var(--color-muted)]">
            No plan generated for this date. Run{" "}
            <code className="text-[var(--color-bat)]">/plan</code> in Claude Code.
          </p>
        </div>
      ) : (
        <article className="space-y-6">
          {plan.theme && (
            <Block title="// Theme">
              <p className="text-base font-medium text-white">
                {plan.theme.replace(/^_|_$/g, "")}
              </p>
            </Block>
          )}

          {plan.plan && <Block title="// Plan" markdown={plan.plan} />}
          {plan.why && <Block title="// Why this plan" markdown={plan.why} />}
          {plan.notDoing && (
            <Block title="// Not doing today" markdown={plan.notDoing} />
          )}

          {plan.checkIns.length > 0 && (
            <Block title="// End-of-day check-ins">
              <ol className="list-decimal pl-5 space-y-1.5 text-[13px] text-white">
                {plan.checkIns.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ol>
            </Block>
          )}

          {plan.reflection && (
            <Block title="// Reflection">
              <pre className="whitespace-pre-wrap text-[13px] font-sans text-white">
                {plan.reflection}
              </pre>
            </Block>
          )}
        </article>
      )}
    </div>
  );
}

function Block({
  title,
  markdown,
  children,
}: {
  title: string;
  markdown?: string;
  children?: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="font-mono text-[11px] tracking-[0.2em] uppercase text-[var(--color-bat)] mb-3">
        {title}
      </h2>
      <div className="bat-panel px-5 py-4">
        {markdown ? (
          <div
            className="prose-bat text-[13px]"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(markdown) }}
          />
        ) : (
          children
        )}
      </div>
    </section>
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

function renderMarkdown(text: string): string {
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const lines = escaped.split("\n");
  const out: string[] = [];
  let inList = false;
  let inOrdered = false;

  const closeList = () => {
    if (inList) out.push("</ul>");
    if (inOrdered) out.push("</ol>");
    inList = false;
    inOrdered = false;
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line) {
      closeList();
      continue;
    }
    const ordered = line.match(/^\d+\.\s+(.+)$/);
    const bullet = line.match(/^[-*]\s+(.+)$/);
    const heading3 = line.match(/^### (.+)$/);

    if (heading3) {
      closeList();
      out.push(`<h3>${inline(heading3[1])}</h3>`);
    } else if (ordered) {
      if (!inOrdered) {
        closeList();
        out.push('<ol class="list-decimal pl-5 space-y-1">');
        inOrdered = true;
      }
      out.push(`<li>${inline(ordered[1])}</li>`);
    } else if (bullet) {
      if (!inList) {
        closeList();
        out.push('<ul class="list-disc pl-5 space-y-1">');
        inList = true;
      }
      out.push(`<li>${inline(bullet[1])}</li>`);
    } else {
      closeList();
      out.push(`<p>${inline(line)}</p>`);
    }
  }
  closeList();
  return out.join("\n");
}

function inline(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(
      /`([^`]+)`/g,
      '<code class="text-xs bg-[var(--color-panel-2)] border border-[var(--color-line)] text-[var(--color-bat)] px-1 rounded">$1</code>',
    )
    .replace(
      /(^|[\s(])_([^_\n]+)_(?=[\s.,;:)?!]|$)/g,
      "$1<em>$2</em>",
    )
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" class="text-[var(--color-bat)] underline">$1</a>',
    );
}
