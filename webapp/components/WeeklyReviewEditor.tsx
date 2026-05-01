"use client";

import { useState, useTransition } from "react";
import { saveWeeklyReviewAction } from "@/lib/actions";

const TEMPLATE = (weekId: string) => `# Weekly Review — ${weekId}

## Week summary

_(one paragraph: shape of the week)_

## Wins

-

## Stalls

-

## Goal progress check

-

## Top 3 priorities for next week

1.
2.
3.

## Flagged for kill / escalate

-
`;

export function WeeklyReviewEditor({
  weekId,
  initial,
}: {
  weekId: string;
  initial: string | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState(!initial);
  const [text, setText] = useState(initial ?? TEMPLATE(weekId));
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const save = () =>
    startTransition(async () => {
      await saveWeeklyReviewAction(weekId, text);
      setSavedAt(new Date().toLocaleTimeString());
      setEditing(false);
    });

  if (!editing) {
    if (!initial) {
      return (
        <div className="bat-panel px-5 py-8 text-center space-y-3">
          <p className="text-sm text-[var(--color-muted)]">
            No review yet for {weekId}.
          </p>
          <button onClick={() => setEditing(true)} className="bat-btn">
            create review
          </button>
        </div>
      );
    }
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <span className="font-mono text-[10px] tracking-wider text-[var(--color-dim)]">
            {savedAt ? `◆ SAVED @ ${savedAt}` : "READ-ONLY"}
          </span>
          <button onClick={() => setEditing(true)} className="bat-btn-ghost">
            edit review
          </button>
        </div>
        <div className="bat-panel px-5 py-4">
          <pre className="whitespace-pre-wrap text-[13px] font-sans text-white">
            {text}
          </pre>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="bat-panel-warn px-4 py-2 flex items-center justify-between">
        <span className="font-mono text-[10px] tracking-[0.18em] text-[var(--color-bat)]">
          ◆ EDITING · {weekId}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setText(initial ?? TEMPLATE(weekId));
              setEditing(false);
            }}
            className="bat-btn-ghost"
            disabled={isPending}
          >
            cancel
          </button>
          <button onClick={save} className="bat-btn" disabled={isPending}>
            {isPending ? "saving…" : "save"}
          </button>
        </div>
      </div>
      <textarea
        className="bat-input w-full font-mono text-[13px] leading-relaxed"
        rows={32}
        value={text}
        onChange={(e) => setText(e.target.value)}
        spellCheck="true"
      />
    </div>
  );
}
