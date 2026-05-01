"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { VENTURE_SLUGS, GOAL_SLUGS } from "@/lib/types";

type Command = {
  id: string;
  label: string;
  group: string;
  href: string;
  hint?: string;
  keywords?: string;
};

const VENTURE_LABELS: Record<string, string> = {
  proactive: "Proactive Supply Chain Group",
  northland: "Northland",
  midas: "Midas Industrial Services",
  sparkling: "Sparkling Distribution",
  unify: "Unify Consulting",
  zoomlion: "Zoomlion Sales",
  personal: "Personal",
};

function buildCommands(today: string): Command[] {
  return [
    {
      id: "dashboard",
      label: "Dashboard",
      group: "Navigate",
      href: "/",
      hint: "Operations dashboard",
    },
    {
      id: "today",
      label: `Today's plan (${today})`,
      group: "Navigate",
      href: `/daily/${today}`,
      hint: "Daily directive",
      keywords: "now plan",
    },
    {
      id: "daily",
      label: "All daily plans",
      group: "Navigate",
      href: "/daily",
      keywords: "log history",
    },
    {
      id: "goals",
      label: "Goals · By venture",
      group: "Goals",
      href: "/goals",
    },
    {
      id: "timeline",
      label: "Goals · Timeline",
      group: "Goals",
      href: "/goals/timeline",
      hint: "All ventures × all horizons",
    },
    ...VENTURE_SLUGS.map((slug) => ({
      id: `v-${slug}`,
      label: VENTURE_LABELS[slug],
      group: "Ventures",
      href: `/ventures/${slug}`,
      hint: slug,
    })),
    ...GOAL_SLUGS.map((slug) => ({
      id: `g-${slug}`,
      label: `${VENTURE_LABELS[slug]} · Goals`,
      group: "Goals",
      href: `/goals/${slug}`,
      hint: `goals/${slug}`,
    })),
  ];
}

function fuzzyScore(query: string, target: string): number {
  if (!query) return 1;
  const q = query.toLowerCase();
  const t = target.toLowerCase();
  if (t.includes(q)) return 100 - t.indexOf(q);
  // Letter-by-letter subsequence match
  let qi = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) qi++;
  }
  return qi === q.length ? 1 : 0;
}

export function CommandPalette({ today }: { today: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const commands = useMemo(() => buildCommands(today), [today]);

  const filtered = useMemo(() => {
    if (!query.trim()) return commands;
    return commands
      .map((c) => ({
        cmd: c,
        score: Math.max(
          fuzzyScore(query, c.label),
          fuzzyScore(query, c.group),
          fuzzyScore(query, c.keywords ?? ""),
          fuzzyScore(query, c.hint ?? ""),
        ),
      }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((x) => x.cmd);
  }, [query, commands]);

  // Keyboard: open with Cmd/Ctrl+K, close with Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
      } else if (e.key === "Escape" && open) {
        e.preventDefault();
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIdx(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  useEffect(() => {
    if (activeIdx >= filtered.length) setActiveIdx(0);
  }, [filtered, activeIdx]);

  const onListKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const c = filtered[activeIdx];
      if (c) {
        router.push(c.href);
        setOpen(false);
      }
    }
  };

  if (!open) return null;

  // Group filtered commands
  const groups: Record<string, Command[]> = {};
  filtered.forEach((c) => {
    (groups[c.group] ??= []).push(c);
  });

  let runningIdx = 0;
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 bg-black/70 backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div
        className="bat-panel-strong w-full max-w-xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-[var(--color-line)] px-3 py-2 flex items-center gap-2">
          <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-[var(--color-bat)]">
            CMD
          </span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIdx(0);
            }}
            onKeyDown={onListKeyDown}
            placeholder="Search ventures, goals, daily plans…"
            className="bg-transparent flex-1 outline-none text-sm text-white placeholder:text-[var(--color-dim)]"
          />
          <span className="font-mono text-[9px] tracking-wider text-[var(--color-dim)]">
            ESC
          </span>
        </div>

        <ul
          ref={listRef}
          className="max-h-[60vh] overflow-y-auto py-1"
          onKeyDown={onListKeyDown}
        >
          {filtered.length === 0 ? (
            <li className="px-3 py-4 text-sm text-[var(--color-muted)] text-center">
              No matches.
            </li>
          ) : (
            Object.entries(groups).map(([groupName, cmds]) => (
              <li key={groupName}>
                <div className="px-3 pt-2 pb-1 font-mono text-[9px] tracking-[0.18em] uppercase text-[var(--color-dim)]">
                  {groupName}
                </div>
                <ul>
                  {cmds.map((c) => {
                    const idx = runningIdx++;
                    const isActive = idx === activeIdx;
                    return (
                      <li key={c.id}>
                        <button
                          type="button"
                          onClick={() => {
                            router.push(c.href);
                            setOpen(false);
                          }}
                          onMouseEnter={() => setActiveIdx(idx)}
                          className={`w-full text-left px-3 py-2 flex items-baseline justify-between gap-3 ${
                            isActive
                              ? "bg-[rgba(255,204,0,0.1)] text-[var(--color-bat)]"
                              : "text-white"
                          }`}
                        >
                          <span className="text-sm">{c.label}</span>
                          {c.hint && (
                            <span className="font-mono text-[10px] text-[var(--color-dim)]">
                              {c.hint}
                            </span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))
          )}
        </ul>

        <div className="border-t border-[var(--color-line)] px-3 py-1.5 flex items-center justify-between">
          <span className="font-mono text-[9px] tracking-wider text-[var(--color-dim)]">
            ↑↓ NAVIGATE · ↵ SELECT · ⌘K TOGGLE
          </span>
        </div>
      </div>
    </div>
  );
}

export function CommandPaletteTrigger() {
  return (
    <button
      type="button"
      className="hidden md:flex items-center gap-2 px-3 py-1.5 border border-[var(--color-line)] hover:border-[var(--color-bat-dim)] rounded-sm text-[var(--color-muted)] hover:text-[var(--color-bat)] transition-colors"
      onClick={() => {
        // Programmatically dispatch Cmd+K
        window.dispatchEvent(
          new KeyboardEvent("keydown", { key: "k", metaKey: true }),
        );
      }}
    >
      <span className="font-mono text-[10px] tracking-wider uppercase">
        Search
      </span>
      <kbd className="font-mono text-[9px] tracking-wider px-1 py-0.5 border border-[var(--color-line)] rounded">
        ⌘K
      </kbd>
    </button>
  );
}
