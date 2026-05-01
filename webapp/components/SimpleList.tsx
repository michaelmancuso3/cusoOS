"use client";

import { useState, useTransition } from "react";
import type { VentureSlug } from "@/lib/types";

type Action = (slug: VentureSlug, text: string) => Promise<void>;

export function SimpleList({
  slug,
  items,
  emptyText,
  placeholder,
  addAction,
  deleteAction,
  bullet = "▸",
  bulletClass = "text-[var(--color-bat-dim)]",
}: {
  slug: VentureSlug;
  items: string[];
  emptyText: string;
  placeholder: string;
  addAction: Action;
  deleteAction: Action;
  bullet?: string;
  bulletClass?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [text, setText] = useState("");
  const [adding, setAdding] = useState(false);

  return (
    <div>
      {items.length === 0 ? (
        <p className="px-3 py-3 text-sm italic text-[var(--color-dim)]">
          {emptyText}
        </p>
      ) : (
        <ul>
          {items.map((item) => (
            <li
              key={item}
              className="row-hover group flex items-start gap-3 px-3 py-2 border-b border-[var(--color-line)] last:border-b-0 text-[13px] text-white"
            >
              <span className={`mt-0.5 font-mono shrink-0 ${bulletClass}`}>
                {bullet}
              </span>
              <span className="flex-1">{item}</span>
              <button
                type="button"
                onClick={() => {
                  if (!confirm(`Delete "${item}"?`)) return;
                  startTransition(async () => {
                    await deleteAction(slug, item);
                  });
                }}
                className="row-actions font-mono text-[9px] tracking-wider uppercase text-[var(--color-muted)] hover:text-[var(--color-critical)] px-1.5 py-1 rounded shrink-0"
              >
                delete
              </button>
            </li>
          ))}
        </ul>
      )}

      {adding ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!text.trim()) return;
            startTransition(async () => {
              await addAction(slug, text);
              setText("");
              setAdding(false);
            });
          }}
          className="flex gap-2 p-3 border-t border-[var(--color-line)]"
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
            placeholder={placeholder}
            className="bat-input flex-1"
            disabled={isPending}
          />
          <button type="submit" className="bat-btn" disabled={isPending}>
            add
          </button>
        </form>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="px-3 py-2 font-mono text-[10px] tracking-wider uppercase text-[var(--color-dim)] hover:text-[var(--color-bat)]"
        >
          + add
        </button>
      )}
    </div>
  );
}
