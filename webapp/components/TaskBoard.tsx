"use client";

import { useState, useMemo } from "react";
import type { TodoCategory, VentureSlug } from "@/lib/types";
import { TodoList, AddCategoryForm } from "./TodoList";

type FilterMode = "open" | "all" | "done";

export function TaskBoard({
  slug,
  categories,
}: {
  slug: VentureSlug;
  categories: TodoCategory[];
}) {
  const [filter, setFilter] = useState<FilterMode>("open");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return categories
      .map((cat) => ({
        ...cat,
        items: cat.items.filter((item) => {
          if (filter === "open" && item.checked) return false;
          if (filter === "done" && !item.checked) return false;
          if (q && !item.text.toLowerCase().includes(q)) return false;
          return true;
        }),
      }))
      .filter((cat) => cat.items.length > 0 || filter === "all");
  }, [categories, filter, search]);

  const total = categories.reduce((acc, c) => acc + c.items.length, 0);
  const open = categories.reduce(
    (acc, c) => acc + c.items.filter((i) => !i.checked).length,
    0,
  );
  const done = total - open;
  const visible = filtered.reduce((acc, c) => acc + c.items.length, 0);

  if (categories.length === 0) {
    return (
      <div className="bat-panel px-4 py-6 text-center text-sm text-[var(--color-muted)]">
        No tasks yet. Use{" "}
        <span className="text-[var(--color-bat)]">+ new category</span>{" "}
        below to start.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bat-panel px-3 py-2 flex flex-wrap items-center gap-3">
        <div className="flex gap-1">
          {(["open", "all", "done"] as FilterMode[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`font-mono text-[10px] tracking-[0.15em] uppercase px-2 py-1 rounded-sm border ${
                filter === f
                  ? "bg-[var(--color-bat)] text-black border-[var(--color-bat)]"
                  : "border-[var(--color-line)] text-[var(--color-muted)] hover:text-[var(--color-bat)] hover:border-[var(--color-bat-dim)]"
              }`}
            >
              {f}
              {f === "open" && ` · ${open}`}
              {f === "all" && ` · ${total}`}
              {f === "done" && ` · ${done}`}
            </button>
          ))}
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by text…"
          className="bat-input flex-1 min-w-[160px] py-1 text-xs"
        />
        <span className="font-mono text-[10px] text-[var(--color-dim)] ml-auto whitespace-nowrap">
          showing {visible}/{total}
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="bat-panel px-4 py-6 text-center text-sm text-[var(--color-muted)]">
          No tasks match.
        </div>
      ) : (
        filtered.map((cat) => {
          const catOpen = cat.items.filter((i) => !i.checked).length;
          return (
            <div key={cat.name} className="bat-panel">
              <div className="px-3 py-2 border-b border-[var(--color-line)] flex items-center justify-between">
                <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--color-bat)]">
                  {cat.name}
                </span>
                <span className="font-mono text-[10px] text-[var(--color-dim)]">
                  {catOpen}/{cat.items.length}
                </span>
              </div>
              <TodoList
                slug={slug}
                items={cat.items}
                category={cat.name}
              />
            </div>
          );
        })
      )}

      <div className="pt-2">
        <AddCategoryForm slug={slug} />
      </div>
    </div>
  );
}
