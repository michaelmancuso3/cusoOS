# cusoOS — Michael's venture operating system

Daily AI-driven operating system for managing six ventures + personal goals.

Every morning: run `/plan`. Claude reads venture state, goals, and recent context, then writes today's action plan. End of day: `/reflect`. End of week: `/review`. Throughout the day: `/capture` to dump tasks/notes into the right file.

The system runs on markdown. State is human-editable. Claude is the planner, not the database.

---

## How it works

1. **State lives in plain markdown.** Six venture files + seven goals files + a cross-venture deps file. All readable, all editable.
2. **`CLAUDE.md` is the brain.** Loaded every session. Encodes who Michael is, the ventures, decision principles, and the reading order for state.
3. **Four commands drive the loop:**
   - `/plan` — generates today's action plan, written to `daily/YYYY-MM-DD.md`
   - `/review` — weekly retro + next-week priorities, written to `weekly/YYYY-WW.md`
   - `/capture` — quick-add a task or note to the right venture file
   - `/reflect` — end-of-day check-in; logs answers into today's plan and informs tomorrow

---

## Directory structure

The repo root *is* the venture-os root. Start a Claude Code session here and `CLAUDE.md` auto-loads.

```
cusoOS/
├── README.md                  This file
├── CLAUDE.md                  Persistent context — auto-loaded at session start
├── cross-venture.md           Dependencies and watch-outs across ventures
├── goals/
│   ├── proactive.md           6mo / 1yr / 3yr goals
│   ├── northland.md
│   ├── midas.md
│   ├── sparkling.md
│   ├── unify.md
│   ├── zoomlion.md
│   └── personal.md            CFA, career, health
├── ventures/
│   ├── proactive.md           Context, recurring, active initiatives, to-dos, blockers, notes
│   ├── northland.md
│   ├── midas.md
│   ├── sparkling.md
│   ├── unify.md
│   └── zoomlion.md
├── daily/
│   ├── _template.md           Template Claude uses to generate daily plans
│   └── YYYY-MM-DD.md          One file per day
├── weekly/
│   └── YYYY-WW.md             One file per week
├── archive/
│   ├── completed-tasks.md     Where finished to-dos go after weekly review
│   └── decisions.md           Key decisions log with rationale
└── .claude/
    └── commands/              Real Claude Code slash commands
        ├── plan.md
        ├── review.md
        ├── capture.md
        └── reflect.md
```

---

## Daily loop

- **Morning:** `/plan` → Claude reads state and writes `daily/YYYY-MM-DD.md` with today's theme, the plan, why this plan, what you're NOT doing today, and three end-of-day check-in prompts.
- **Throughout the day:** `/capture <venture>: <task or note>` to log items into the right venture file.
- **Evening:** `/reflect` → Claude asks today's three check-in questions, logs the answers at the bottom of today's daily file, and uses them to tune tomorrow's plan.

## Weekly loop

- **Monday (or any day, on demand):** `/review` → Claude reads the last 7 daily files + all venture files and writes `weekly/YYYY-WW.md` with wins, stalls, goal progress, top 3 priorities for next week, and flags for anything sitting in-flight >2 weeks. After review, completed tasks get archived.

---

## Decision principles (full version in CLAUDE.md)

When prioritizing tasks, weight by:

1. **Hard deadlines** (payroll, dated commitments)
2. **Cash flow impact** (raises, collections, payment automation)
3. **Compounding leverage** (systems that unlock future capacity)
4. **Revenue-generating** (pitches, meetings)
5. **Optimization / quality of life** (polish, fixes)

Bias: Michael over-extends. Plans should sometimes say *do less today, the priority is X*. Tell hard truths.

---

## Ventures

1. **Proactive Supply Chain Group** — Director (CIO → CEO trajectory)
2. **Northland** — PSCG's first acquisition; Michael obligated but not an owner
3. **Midas Industrial Services Inc.** — Founder/President; container unloading; sole worker Michael-Angelo Bonomo
4. **Sparkling Distribution Inc.** — First acquisition (10% stake, in progress)
5. **Unify Consulting** — Founder (Michael) with co-founders Franco DiGiovanni and JP Riquelme; AI consulting for SMBs
6. **Zoomlion Sales** — Commission referrals via Tengerph Chen

Personal goals (CFA Level 1 — November 2026, career trajectory, health) tracked alongside.
