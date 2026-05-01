---
description: Quick-add a task or note to the right venture file
argument-hint: <venture>: <task or note>
---

Append a task or note to the right venture file.

User input:
```
$ARGUMENTS
```

## Step 1 — Parse the argument

Split on the first `:`. Left = venture name (case-insensitive). Right = the task / note text.

Valid venture names: `proactive`, `northland`, `midas`, `sparkling`, `unify`, `zoomlion`.

If the venture name doesn't match, ask Michael which venture he meant and stop. Do NOT append to a guessed file.

If Michael wants to add to `cross-venture.md`, tell him to edit that file directly — `/capture` only targets the six venture files.

## Step 2 — Decide the section

Read the target file (`ventures/<venture>.md`). Place the new line based on the text:

- **"blocked on …", "waiting on …", "blocker:"** → append to the **Blockers / Waiting On** section.
- **"recurring …", "every <day>", "weekly", "monthly", "bi-weekly"** → append to the **Recurring** section. Format: `- **<item>** — <cadence>. Next due: <date>.` If cadence or date is missing, ask Michael.
- **Verb-led / actionable** ("fix X", "call Y", "build Z", "set up …", "follow up on …") → append as a checkbox under **Current To-Dos**, in the most appropriate sub-category. If no existing sub-category fits, create a new `### <category>` group OR add to a generic `### Other` group at the bottom.
- **Otherwise** (context, observation, name, fact) → append to **Notes & Context Dumps**.

If unsure which section, ask Michael.

## Step 3 — Append, don't rewrite

Use the `Edit` tool to append the new line to the right section. **Don't rewrite the whole file. Don't reorder existing items.** Preserve the file's current order.

If the target section currently shows `_Empty._` or `_Nothing captured yet._` placeholder text, replace that placeholder with the first real entry.

## Step 4 — Confirm

Reply with one line: where you added it (file + section) and the exact text added. Example:

> Added to `ventures/midas.md` → **Notes & Context Dumps**: "Arrow contact name is Pete Reilly, met at logistics expo."

Don't summarize the rest of the file. Don't ask follow-up questions unless ambiguity blocked the placement.
