---
description: End-of-day check-in — log answers, archive completed tasks, inform tomorrow's plan
---

End-of-day reflection. Read today's daily file (`daily/YYYY-MM-DD.md`). Find the **End-of-day check-in prompts** section near the bottom — exactly 3 questions written by `/plan` this morning.

If today's daily file doesn't exist or doesn't have check-in prompts, tell Michael that `/plan` wasn't run today and offer to skip or run it now.

## Step 1 — Ask the questions, one at a time

Quote each question verbatim. Do not paraphrase. Wait for Michael's answer to each before moving to the next.

## Step 2 — Append answers to today's daily file

Add a new section at the bottom of `daily/YYYY-MM-DD.md`:

```
## Reflection — answered <YYYY-MM-DD HH:MM>

**Q1:** [exact question]
**A:** [Michael's answer]

**Q2:** [exact question]
**A:** [Michael's answer]

**Q3:** [exact question]
**A:** [Michael's answer]
```

Use the actual time when answers are logged.

## Step 3 — Identify completed tasks

Scan Michael's answers for completion language ("finished X", "closed Y", "shipped Z", "ran payroll", "done", etc.). Match each semantically against open `- [ ]` items in the **Current To-Dos** sections of `ventures/*.md`.

Confidence levels:

- **High** — answer clearly indicates completion AND the wording maps to a specific to-do. Queue for archive.
- **Ambiguous** — answer mentions the topic but completion is unclear, or multiple to-dos could match. Ask Michael directly: *"You mentioned X — is `<exact to-do text>` complete?"* Add to queue only on his confirmation.

## Step 4 — Propose moves and confirm

Show Michael the queued archives in one batch:

> Proposed archives:
> - `ventures/midas.md` → "Run payroll"
> - `ventures/proactive.md` → "Prepare next month's sales meeting dashboard"
>
> Reply "go" to apply, or correct.

Wait for confirmation. If nothing matches, skip to Step 6.

## Step 5 — Apply moves

After Michael confirms, for each queued item:

- **Remove** the `- [ ]` line from **Current To-Dos** in the venture file.
- **Add** to **Recently Completed**: `- YYYY-MM-DD — <item text>`.

Use the Edit tool. Don't rewrite whole files.

If the **Recently Completed** section currently shows the placeholder `_Last 7 days. Archived weekly via /review._`, replace the placeholder with the first archived line and keep the placeholder text below as a comment line for context.

## Step 6 — Append "Tasks archived" + "Signal for tomorrow" to today's daily file

Append after the Reflection Q&A section:

```
**Tasks archived:**
- ventures/midas.md → "Run payroll"
- ventures/proactive.md → "Prepare next month's sales meeting dashboard"

**Signal for tomorrow:**
[paragraph]
```

The Signal paragraph captures:

- Energy / focus signals ("Michael said he's burnt out → tomorrow's plan should be lighter").
- New blockers Michael surfaced — suggest `/capture <venture>: blocked on <X>` for each. Don't auto-add.
- New to-dos Michael mentioned — suggest `/capture <venture>: <task>` for each. Don't auto-add.

If no tasks were archived, omit the "Tasks archived" header and just write the Signal paragraph.

## Step 7 — Wrap

End with one sentence: `Reflection logged. <N> tasks archived. /plan will pick up these signals tomorrow.`

Keep it short. End-of-day is not the time for long summaries.
