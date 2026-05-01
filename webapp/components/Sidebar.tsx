"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { VENTURE_SLUGS, GOAL_SLUGS } from "@/lib/types";
import { MidasLogo } from "./MidasLogo";

const VENTURE_LABELS: Record<string, string> = {
  proactive: "Proactive",
  northland: "Northland",
  midas: "Midas",
  sparkling: "Sparkling",
  unify: "Unify",
  zoomlion: "Zoomlion",
  personal: "Personal",
};

export function Sidebar({ today }: { today: string }) {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-60 shrink-0 border-r border-[var(--color-line)] bg-black/40 sticky top-0 h-screen overflow-y-auto nav-scroll">
      <div className="px-4 pt-6 pb-5 border-b border-[var(--color-line)]">
        <Link href="/" className="block">
          <div className="flex items-center gap-3">
            <MidasLogo size={28} rings />
            <div className="leading-tight">
              <div className="font-mono text-[11px] tracking-[0.2em] text-[var(--color-bat)]">
                CUSOOS
              </div>
              <div className="font-mono text-[9px] tracking-[0.18em] text-[var(--color-arc)]">
                ◆ ONLINE · V0.3
              </div>
            </div>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-2 space-y-1 text-sm">
        <SidebarLink href="/" active={pathname === "/"} icon="◆">
          Dashboard
        </SidebarLink>
        <SidebarLink
          href={`/daily/${today}`}
          active={pathname === `/daily/${today}`}
          icon="●"
          accent
        >
          Today
        </SidebarLink>

        <SidebarSection
          label="Ventures"
          defaultOpen
          activeMatch={pathname.startsWith("/ventures/")}
        >
          {VENTURE_SLUGS.map((slug) => (
            <SidebarLink
              key={slug}
              href={`/ventures/${slug}`}
              active={pathname === `/ventures/${slug}`}
              indent
            >
              {VENTURE_LABELS[slug]}
            </SidebarLink>
          ))}
        </SidebarSection>

        <SidebarSection
          label="Goals"
          activeMatch={pathname.startsWith("/goals")}
        >
          <SidebarLink
            href="/goals"
            active={pathname === "/goals"}
            indent
          >
            All goals
          </SidebarLink>
          {GOAL_SLUGS.map((slug) => (
            <SidebarLink
              key={slug}
              href={`/goals/${slug}`}
              active={pathname === `/goals/${slug}`}
              indent
            >
              {VENTURE_LABELS[slug]}
            </SidebarLink>
          ))}
        </SidebarSection>

        <SidebarLink
          href="/daily"
          active={pathname === "/daily"}
          icon="▤"
        >
          Daily plans
        </SidebarLink>
        <SidebarLink
          href="/weekly"
          active={pathname.startsWith("/weekly")}
          icon="▦"
        >
          Weekly reviews
        </SidebarLink>
      </nav>

      <div className="p-3 border-t border-[var(--color-line)]">
        <div className="font-mono text-[9px] tracking-[0.15em] text-[var(--color-dim)] mb-1">
          NETWORK STATUS
        </div>
        <div className="flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-[var(--color-go)] pulse-bat" />
          <span className="font-mono text-[10px] text-[var(--color-muted)] tracking-wider">
            LOCAL · {today}
          </span>
        </div>
      </div>
    </aside>
  );
}

function SidebarLink({
  href,
  children,
  active,
  icon,
  indent,
  accent,
}: {
  href: string;
  children: React.ReactNode;
  active?: boolean;
  icon?: string;
  indent?: boolean;
  accent?: boolean;
}) {
  return (
    <Link
      href={href}
      className={[
        "flex items-center gap-2 px-3 py-1.5 rounded-sm transition-colors",
        indent ? "pl-7 text-[12.5px]" : "text-[13px]",
        active
          ? "bg-[rgba(255,204,0,0.1)] text-[var(--color-bat)] border-l-2 border-[var(--color-bat)] -ml-px"
          : accent
          ? "text-[var(--color-bat)] hover:bg-[rgba(255,204,0,0.06)]"
          : "text-[var(--color-text)] hover:bg-[rgba(255,255,255,0.04)] hover:text-[var(--color-bat)]",
      ].join(" ")}
    >
      {icon && <span className="text-[var(--color-bat)] text-xs w-3 inline-block">{icon}</span>}
      <span>{children}</span>
    </Link>
  );
}

function SidebarSection({
  label,
  children,
  defaultOpen,
  activeMatch,
}: {
  label: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  activeMatch?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen ?? activeMatch ?? false);
  return (
    <div className="mt-2">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-3 py-1 text-left"
      >
        <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-[var(--color-dim)] hover:text-[var(--color-bat)]">
          {label}
        </span>
        <span className="font-mono text-[10px] text-[var(--color-dim)]">
          {open ? "−" : "+"}
        </span>
      </button>
      {open && <div className="mt-0.5 space-y-px">{children}</div>}
    </div>
  );
}
