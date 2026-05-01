"use client";

import { useState, useTransition } from "react";
import { saveDailyPlanAction, generatePlanAction } from "@/lib/actions";

export type DailyPlanFields = {
  theme: string;
  plan: string;
  why: string;
  notDoing: string;
  checkIns: string[];
};

export function DailyPlanView({
  date,
  initial,
  exists,
}: {
  date: string;
  initial: DailyPlanFields;
  exists: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [generating, setGenerating] = useState(false);
  const [editing, setEditing] = useState(!exists);
  const [fields, setFields] = useState<DailyPlanFields>(initial);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [genError, setGenError] = useState<string | null>(null);

  const set = <K extends keyof DailyPlanFields>(k: K, v: DailyPlanFields[K]) =>
    setFields((f) => ({ ...f, [k]: v }));

  const save = () =>
    startTransition(async () => {
      await saveDailyPlanAction(date, fields);
      setSavedAt(new Date().toLocaleTimeString());
      setEditing(false);
    });

  const generate = async () => {
    if (
      (fields.theme.trim() || fields.plan.trim()) &&
      !confirm(
        "Replace the current plan content with an AI-generated one? You can still edit before saving.",
      )
    ) {
      return;
    }
    setGenerating(true);
    setGenError(null);
    try {
      const generated = await generatePlanAction(date);
      setFields(generated);
      setEditing(true);
    } catch (e) {
      setGenError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  };

  if (!editing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <span className="font-mono text-[10px] tracking-wider text-[var(--color-dim)]">
            {savedAt ? `◆ SAVED @ ${savedAt}` : "READ-ONLY"}
          </span>
          <div className="flex gap-2">
            <button
              onClick={generate}
              className="bat-btn-ghost flex items-center gap-1.5"
              disabled={generating}
              title="Generate a plan with AI from your current venture state"
            >
              {generating ? (
                <>
                  <span className="size-1.5 rounded-full bg-[var(--color-arc)] pulse-arc" />
                  analyzing…
                </>
              ) : (
                <>◆ generate with AI</>
              )}
            </button>
            <button
              onClick={() => setEditing(true)}
              className="bat-btn-ghost"
              disabled={generating}
            >
              edit plan
            </button>
          </div>
        </div>

        {genError && (
          <div className="bat-panel-crit px-3 py-2 text-sm text-white">
            <span className="font-mono text-[10px] text-[var(--color-critical)] mr-2">
              ERROR
            </span>
            {genError}
          </div>
        )}

        {fields.theme && (
          <Block title="// Theme">
            <p className="text-base font-medium text-white">
              {fields.theme.replace(/^_|_$/g, "")}
            </p>
          </Block>
        )}
        {fields.plan && <Block title="// Plan" markdown={fields.plan} />}
        {fields.why && <Block title="// Why this plan" markdown={fields.why} />}
        {fields.notDoing && (
          <Block title="// Not doing today" markdown={fields.notDoing} />
        )}
        {fields.checkIns.length > 0 && fields.checkIns.some((q) => q.trim()) && (
          <Block title="// End-of-day check-ins">
            <ol className="list-decimal pl-5 space-y-1.5 text-[13px] text-white">
              {fields.checkIns.filter((q) => q.trim()).map((q, i) => (
                <li key={i}>{q}</li>
              ))}
            </ol>
          </Block>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="bat-panel-warn px-4 py-2 flex items-center justify-between flex-wrap gap-2">
        <span className="font-mono text-[10px] tracking-[0.18em] text-[var(--color-bat)]">
          ◆ EDITING · {date}
        </span>
        <div className="flex gap-2">
          <button
            onClick={generate}
            className="bat-btn-ghost flex items-center gap-1.5"
            disabled={isPending || generating}
            title="Replace fields with AI-generated plan"
          >
            {generating ? (
              <>
                <span className="size-1.5 rounded-full bg-[var(--color-arc)] pulse-arc" />
                analyzing…
              </>
            ) : (
              <>◆ regenerate</>
            )}
          </button>
          <button
            onClick={() => {
              setFields(initial);
              setEditing(false);
            }}
            className="bat-btn-ghost"
            disabled={isPending || generating}
          >
            cancel
          </button>
          <button
            onClick={save}
            className="bat-btn"
            disabled={isPending || generating}
          >
            {isPending ? "saving…" : "save"}
          </button>
        </div>
      </div>

      {genError && (
        <div className="bat-panel-crit px-3 py-2 text-sm text-white">
          <span className="font-mono text-[10px] text-[var(--color-critical)] mr-2">
            ERROR
          </span>
          {genError}
        </div>
      )}

      <Field
        label="Theme"
        rows={2}
        value={fields.theme}
        onChange={(v) => set("theme", v)}
        placeholder="One sentence: what does winning today look like?"
      />
      <Field
        label="The Plan"
        rows={8}
        value={fields.plan}
        onChange={(v) => set("plan", v)}
        placeholder="Adaptive format. Numbered list, focused brief, time-blocks, or call list."
      />
      <Field
        label="Why this plan"
        rows={3}
        value={fields.why}
        onChange={(v) => set("why", v)}
        placeholder="2-3 sentences laddering today's actions to your goals."
      />
      <Field
        label="What I'm NOT doing today"
        rows={4}
        value={fields.notDoing}
        onChange={(v) => set("notDoing", v)}
        placeholder="Deferred items, each with a one-sentence reason."
      />
      <CheckInsField
        value={fields.checkIns}
        onChange={(v) => set("checkIns", v)}
      />
    </div>
  );
}

function Field({
  label,
  rows,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  rows: number;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <section>
      <h2 className="font-mono text-[11px] tracking-[0.2em] uppercase text-[var(--color-bat)] mb-2">
        // {label}
      </h2>
      <textarea
        className="bat-input w-full font-mono text-[13px] leading-relaxed"
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        spellCheck="true"
      />
    </section>
  );
}

function CheckInsField({
  value,
  onChange,
}: {
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const items = value.length >= 3 ? value : [...value, "", "", ""].slice(0, 3);
  return (
    <section>
      <h2 className="font-mono text-[11px] tracking-[0.2em] uppercase text-[var(--color-bat)] mb-2">
        // End-of-day check-ins
      </h2>
      <div className="space-y-2">
        {items.map((q, i) => (
          <div key={i} className="flex gap-2 items-start">
            <span className="font-mono text-[12px] text-[var(--color-bat-dim)] mt-2 w-4 shrink-0">
              {i + 1}.
            </span>
            <input
              type="text"
              className="bat-input flex-1"
              value={q}
              onChange={(e) => {
                const next = [...items];
                next[i] = e.target.value;
                onChange(next);
              }}
              placeholder={`Check-in question ${i + 1}`}
            />
          </div>
        ))}
      </div>
    </section>
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
    .replace(/(^|[\s(])_([^_\n]+)_(?=[\s.,;:)?!]|$)/g, "$1<em>$2</em>")
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" class="text-[var(--color-bat)] underline">$1</a>',
    );
}
