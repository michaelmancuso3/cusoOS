---
description: Generate today's action plan across all six ventures + personal
---

Generate Michael's daily action plan. This is the core workflow in cusoOS. Read carefully and follow each step.

## Step 1 — Read state, in this order

1. `CLAUDE.md`
2. `cross-venture.md`
3. All `ventures/*.md` (six files: proactive, northland, midas, sparkling, unify, zoomlion)
4. All `goals/*.md` (seven files: same six plus personal)
5. Last 3 files in `daily/` sorted by date descending. If fewer than 3 exist, read what's there.

If a goals file is empty (just template, no filled-in goals), flag that to Michael in the plan. **Do not invent goals.**

## Step 2 — Identify what's urgent today

- **Recurring items.** Check the **Recurring** section of each venture file. If "Next due" matches today's date, it's due today and goes on the plan.
- **Hard deadlines.** Check each venture's Context section for dated commitments (e.g., Sparkling 2026-05-31). If a deadline is within ~2 weeks, it should drive the plan.
- **Yesterday's reflect notes.** The bottom of the most recent `daily/` file may have a "Reflection" section. Read it. What did Michael say about energy, blockers, or what he's deferring? Carry signals forward.
- **In-flight items.** What's been touched in the last 3 daily files vs. what's gone stale? Stale items either need a push or a kill recommendation.

## Step 3 — Pick the adaptive format

Based on what's urgent today, choose the format that fits:

- **One dominant fire** → focused brief on that fire + 2 supporting tasks.
- **Multiple ventures need touchpoints** → ranked top 3-5 tasks across ventures.
- **Reflection / strategy day** → time-blocked deep work.
- **Communication-heavy day** → call / message / follow-up list.

Choose what fits *today*. The format itself signals what kind of day this is. Don't default to one format.

## Step 4 — Apply decision principles

Prioritize tasks in this order:

1. **Hard deadlines** — payroll dates, exam dates, dated commitments.
2. **Cash flow impact** — raises, collections, payment automation.
3. **Compounding leverage** — systems that unlock future capacity (TMS, QB automation, role docs).
4. **Revenue-generating** — Unify pitches, Zoomlion follow-ups, sales meetings.
5. **Optimization / quality of life** — polish, fixes, cosmetic improvements.

A single high-priority item beats a stack of low-priority items. Don't pad the plan to feel productive.

## Step 5 — Write to `daily/YYYY-MM-DD.md`

Use today's date. The plan **must include**:

- **Today's Theme** — one sentence. What does winning today look like?
- **The Plan** — in the adaptive format from Step 3.
- **Why This Plan** — 2-3 sentences explaining how today's actions ladder up to Michael's goals (cite specific items from `goals/*.md` if filled in, or from venture **Active Initiatives** if goals are empty).
- **What I'm NOT doing today** — 2-3 deferred items, each with a one-sentence reason. **Mandatory section. This is the discipline.**
- **End-of-day check-in prompts** — exactly 3 questions for `/reflect` to ask tonight. Make them specific to today's plan, not generic.

## Step 6 — Hard truths

Michael over-extends. Apply these guardrails:

- If the draft plan needs >6 hours of focused work, cut it.
- If the last 2-3 daily files show Michael got smoked, propose a half-day or recovery plan and say so out loud.
- Cross-venture conflicts (e.g., Sparkling raise time vs. a Proactive emergency) — name the conflict, propose the trade-off, don't pretend both fit.
- The right plan is sometimes "do less today, focus on X." Say it when it's true.

## Step 7 — Confirm with Michael

After writing the file, summarize the key choice you made in 1-2 sentences (e.g., "Led with Midas payroll — due today. Deferred TMS to tomorrow because the F&F raise outreach takes priority for cash flow this week.") and ask Michael if he wants to adjust before locking in.
