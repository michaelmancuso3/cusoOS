"use client";

import { useTransition, useState } from "react";
import {
  toggleTodo,
  archiveTodo,
  deleteTodo,
  addTodo,
  updateTodoTextAction,
} from "@/lib/actions";
import type { TodoItem, VentureSlug } from "@/lib/types";

export function TodoList({
  slug,
  items,
  category,
}: {
  slug: VentureSlug;
  items: TodoItem[];
  category: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <ul>
      {items.map((item) => (
        <TodoRow
          key={`${item.category}-${item.text}`}
          slug={slug}
          item={item}
          isPending={isPending}
          startTransition={startTransition}
        />
      ))}
      <AddTodoForm slug={slug} category={category} />
    </ul>
  );
}

function TodoRow({
  slug,
  item,
  isPending,
  startTransition,
}: {
  slug: VentureSlug;
  item: TodoItem;
  isPending: boolean;
  startTransition: (cb: () => void | Promise<void>) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(item.text);

  return (
    <li className="row-hover group flex items-center gap-3 px-3 py-2 border-b border-[var(--color-line)] last:border-b-0">
      <input
        type="checkbox"
        className="bat-check"
        checked={item.checked}
        disabled={isPending}
        onChange={() =>
          startTransition(async () => {
            await toggleTodo(slug, item.text);
          })
        }
      />
      {editing ? (
        <input
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={() => {
            if (text.trim() && text !== item.text) {
              startTransition(async () => {
                await updateTodoTextAction(slug, item.text, text);
              });
            }
            setEditing(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
            if (e.key === "Escape") {
              setText(item.text);
              setEditing(false);
            }
          }}
          className="bat-input flex-1 text-[13px] py-1"
          disabled={isPending}
        />
      ) : (
        <button
          type="button"
          onClick={() => {
            setText(item.text);
            setEditing(true);
          }}
          className={`flex-1 text-left text-[13px] ${
            item.checked
              ? "line-through text-[var(--color-dim)]"
              : "text-white"
          } hover:text-[var(--color-bat)]`}
          title="Click to edit"
        >
          {item.text}
        </button>
      )}
      <span className="row-actions flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={() =>
            startTransition(async () => {
              await archiveTodo(slug, item.text);
            })
          }
          className="font-mono text-[9px] tracking-wider uppercase text-[var(--color-muted)] hover:text-[var(--color-bat)] px-1.5 py-1 rounded"
          title="Archive (move to Recently Completed)"
        >
          archive
        </button>
        <button
          type="button"
          onClick={() => {
            if (!confirm(`Delete "${item.text}"?`)) return;
            startTransition(async () => {
              await deleteTodo(slug, item.text);
            });
          }}
          className="font-mono text-[9px] tracking-wider uppercase text-[var(--color-muted)] hover:text-[var(--color-critical)] px-1.5 py-1 rounded"
          title="Delete"
        >
          delete
        </button>
      </span>
    </li>
  );
}

function AddTodoForm({
  slug,
  category,
}: {
  slug: VentureSlug;
  category: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <li>
        <button
          onClick={() => setOpen(true)}
          className="px-3 py-2 font-mono text-[10px] tracking-wider uppercase text-[var(--color-dim)] hover:text-[var(--color-bat)]"
        >
          + add task
        </button>
      </li>
    );
  }

  return (
    <li className="px-3 py-2 border-t border-[var(--color-line)]">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!text.trim()) return;
          startTransition(async () => {
            await addTodo(slug, category, text);
            setText("");
            setOpen(false);
          });
        }}
        className="flex gap-2"
      >
        <input
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setText("");
              setOpen(false);
            }
          }}
          placeholder="New task…"
          className="bat-input flex-1"
          disabled={isPending}
        />
        <button type="submit" className="bat-btn" disabled={isPending}>
          add
        </button>
      </form>
    </li>
  );
}

export function AddCategoryForm({ slug }: { slug: VentureSlug }) {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [item, setItem] = useState("");
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="font-mono text-[10px] tracking-wider uppercase text-[var(--color-dim)] hover:text-[var(--color-bat)]"
      >
        + new category
      </button>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!name.trim() || !item.trim()) return;
        startTransition(async () => {
          await addTodo(slug, name.trim(), item.trim());
          setName("");
          setItem("");
          setOpen(false);
        });
      }}
      className="bat-panel p-3 flex flex-col gap-2 max-w-md"
    >
      <input
        autoFocus
        placeholder="Category name (e.g., Cash flow)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="bat-input"
        disabled={isPending}
      />
      <div className="flex gap-2">
        <input
          placeholder="First task in this category"
          value={item}
          onChange={(e) => setItem(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setName("");
              setItem("");
              setOpen(false);
            }
          }}
          className="bat-input flex-1"
          disabled={isPending}
        />
        <button type="submit" className="bat-btn" disabled={isPending}>
          add
        </button>
      </div>
    </form>
  );
}
