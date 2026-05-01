"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import {
  addGoal,
  toggleGoalAction,
  deleteGoalAction,
  setGoalStatusAction,
  updateGoalTextAction,
} from "@/lib/actions";
import type {
  GoalEntry,
  GoalSlug,
  GoalHorizon,
  GoalStatus,
} from "@/lib/types";

const STATUS_OPTIONS: { value: GoalStatus; label: string; cls: string }[] = [
  { value: null, label: "—", cls: "text-[var(--color-dim)] border-[var(--color-line)]" },
  { value: "on-track", label: "ON TRACK", cls: "text-[var(--color-go)] border-[var(--color-go)]/40 bg-[var(--color-go)]/5" },
  { value: "at-risk", label: "AT RISK", cls: "text-[var(--color-warn)] border-[var(--color-warn)]/40 bg-[var(--color-warn)]/5" },
  { value: "off-track", label: "OFF TRACK", cls: "text-[var(--color-critical)] border-[var(--color-critical)]/40 bg-[var(--color-critical)]/5" },
];

export function GoalEditor({
  slug,
  horizon,
  items,
}: {
  slug: GoalSlug;
  horizon: GoalHorizon;
  items: GoalEntry[];
}) {
  const [isPending, startTransition] = useTransition();
  const [text, setText] = useState("");
  const [adding, setAdding] = useState(false);

  const useCheckbox = horizon !== "3-year";

  return (
    <div className="space-y-1.5">
      {items.length === 0 && !adding && (
        <p className="text-xs italic text-[var(--color-dim)] mb-2">
          No goals set.
        </p>
      )}

      <ul className="space-y-1">
        {items.map((item) => (
          <GoalRow
            key={item.text}
            slug={slug}
            horizon={horizon}
            item={item}
            useCheckbox={useCheckbox}
            isPending={isPending}
            startTransition={startTransition}
          />
        ))}
      </ul>

      {adding ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!text.trim()) return;
            startTransition(async () => {
              await addGoal(slug, horizon, text);
              setText("");
              setAdding(false);
            });
          }}
          className="flex gap-1 pt-1"
        >
          <input
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setText("");
                setAdding(false);
              }
            }}
            placeholder="Goal text…"
            className="bat-input flex-1 text-xs py-1"
            disabled={isPending}
          />
          <button
            type="submit"
            className="bat-btn text-[10px] py-1 px-2"
            disabled={isPending}
          >
            +
          </button>
        </form>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="font-mono text-[9px] tracking-wider uppercase text-[var(--color-dim)] hover:text-[var(--color-bat)] mt-1"
        >
          + add goal
        </button>
      )}
    </div>
  );
}

function GoalRow({
  slug,
  horizon,
  item,
  useCheckbox,
  isPending,
  startTransition,
}: {
  slug: GoalSlug;
  horizon: GoalHorizon;
  item: GoalEntry;
  useCheckbox: boolean;
  isPending: boolean;
  startTransition: (cb: () => void | Promise<void>) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(item.text);
  const [statusOpen, setStatusOpen] = useState(false);
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!statusOpen) return;
    const onClick = (e: MouseEvent) => {
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) {
        setStatusOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [statusOpen]);

  const currentStatus = STATUS_OPTIONS.find((o) => o.value === item.status)!;

  return (
    <li className="row-hover group flex items-start gap-2 text-[12px] py-1 px-1 -mx-1 rounded">
      {useCheckbox ? (
        <input
          type="checkbox"
          className="bat-check mt-0.5"
          checked={item.checked === true}
          disabled={isPending}
          onChange={() =>
            startTransition(async () => {
              await toggleGoalAction(slug, horizon, item.text);
            })
          }
        />
      ) : (
        <span className="mt-1 size-1.5 shrink-0 rounded-full bg-[var(--color-bat-dim)]" />
      )}

      {editing ? (
        <input
          autoFocus
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onBlur={() => {
            if (editText.trim() && editText !== item.text) {
              startTransition(async () => {
                await updateGoalTextAction(slug, horizon, item.text, editText);
              });
            }
            setEditing(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
            if (e.key === "Escape") {
              setEditText(item.text);
              setEditing(false);
            }
          }}
          className="bat-input flex-1 text-xs py-0.5 px-1"
          disabled={isPending}
        />
      ) : (
        <button
          type="button"
          onClick={() => {
            setEditText(item.text);
            setEditing(true);
          }}
          className={`flex-1 text-left ${
            item.checked
              ? "line-through text-[var(--color-dim)]"
              : "text-white"
          } hover:text-[var(--color-bat)]`}
          title="Click to edit"
        >
          {item.text}
        </button>
      )}

      <div className="relative shrink-0" ref={statusRef}>
        <button
          type="button"
          onClick={() => setStatusOpen((v) => !v)}
          className={`font-mono text-[8px] tracking-wider uppercase border px-1.5 py-0.5 rounded ${currentStatus.cls}`}
          title="Change status"
        >
          {currentStatus.label}
        </button>
        {statusOpen && (
          <div className="absolute right-0 top-full mt-1 z-20 bat-panel-strong p-1 flex flex-col gap-0.5 min-w-[110px]">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={String(opt.value)}
                type="button"
                onClick={() => {
                  startTransition(async () => {
                    await setGoalStatusAction(
                      slug,
                      horizon,
                      item.text,
                      opt.value,
                    );
                    setStatusOpen(false);
                  });
                }}
                className={`text-left font-mono text-[9px] tracking-wider uppercase px-2 py-1 rounded hover:bg-[rgba(255,204,0,0.06)] ${
                  item.status === opt.value
                    ? "text-[var(--color-bat)]"
                    : "text-[var(--color-muted)]"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => {
          if (!confirm(`Delete goal "${item.text}"?`)) return;
          startTransition(async () => {
            await deleteGoalAction(slug, horizon, item.text);
          });
        }}
        className="row-actions font-mono text-[9px] tracking-wider uppercase text-[var(--color-muted)] hover:text-[var(--color-critical)] shrink-0"
      >
        x
      </button>
    </li>
  );
}
