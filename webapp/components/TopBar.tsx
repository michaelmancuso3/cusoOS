"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CommandPaletteTrigger } from "./CommandPalette";

export function TopBar({ today }: { today: string }) {
  const pathname = usePathname();
  const breadcrumb = pathname === "/" ? "DASHBOARD" : pathname.toUpperCase();

  return (
    <div className="border-b border-[var(--color-line)] bg-black/40 sticky top-0 z-10 backdrop-blur">
      <div className="flex items-center justify-between px-6 md:px-8 py-3 gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/"
            className="md:hidden font-mono text-[11px] tracking-[0.2em] text-[var(--color-bat)]"
          >
            CUSOOS
          </Link>
          <span className="font-mono text-[10px] tracking-[0.2em] text-[var(--color-dim)] truncate">
            // {breadcrumb}
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <CommandPaletteTrigger />
          <div className="font-mono text-[10px] tracking-[0.2em] text-[var(--color-muted)]">
            {today}
          </div>
          <span className="size-1.5 rounded-full bg-[var(--color-go)] pulse-bat" />
        </div>
      </div>
    </div>
  );
}
