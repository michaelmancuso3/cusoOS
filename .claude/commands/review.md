---
description: Weekly retro across all six ventures + next-week priorities
---

Generate Michael's weekly review.

## Step 1 — Read state

1. `CLAUDE.md`
2. `cross-venture.md`
3. All `ventures/*.md` (six files)
4. All `goals/*.md` (seven files)
5. Last 7 files in `daily/`. Read what's there — fewer than 7 is fine.

## Step 2 — Synthesize

- **Wins.** What got shipped or moved meaningfully? Cite specific to-dos, initiatives, or daily-plan items by name.
- **Stalls.** What sat idle for >3 days? What blocked it? Propose a concrete unblock for each (one sentence).
- **Goal progress.** For each venture with filled-in goals (`goals/*.md`), are 6-month goals on track / behind / ahead? If a goals file is empty, note that — don't invent progress against goals that don't exist.
- **Long in-flight items.** Anything sitting incomplete >2 weeks → flag for **kill** or **escalate**. Be honest: half-finished work has a cost.
- **Pattern observations.** What's the shape of the week? Where did time actually go (per the daily files)? Was Michael over-extended? Recovery days needed?

## Step 3 — Write to `weekly/YYYY-WW.md`

Use ISO week number (e.g., `2026-W18`). Structure:

- **Week summary** — one paragraph. The shape of the week.
- **Wins** — bullet list across ventures.
- **Stalls** — bullet list with proposed unblocks.
- **Goal progress check** — per venture (only if goals are filled in).
- **Top 3 priorities for next week** — picked from the open backlog, weighted by the priority order below.
- **Flagged for kill / escalate** — items >2 weeks in-flight that need a decision.

## Step 4 — Decision principles for "Top 3 next week"

Same as `/plan`:

1. Hard deadlines
2. Cash flow impact
3. Compounding leverage
4. Revenue-generating
5. Optimization / quality of life

## Step 5 — Confirm with Michael, then archive

Show Michael the review. Ask which "Recently Completed" items in venture files should be archived. After he confirms:

- Move those items from each `ventures/<name>.md` "Recently Completed" section into `archive/completed-tasks.md` with the date moved (format: `- 2026-WW-DD — <venture> — <item>`).
- Leave venture files clean.

## Step 6 — Hard truths

If the week was a disaster, say so. If Michael was running 5 ventures simultaneously and nothing shipped, point at the spread. Recommend cutting or parking specific ventures for the next week if needed.

If the same items appear in "Stalls" two reviews in a row, escalate the kill recommendation. Don't let things rot in flight.
