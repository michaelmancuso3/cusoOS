/**
 * High-level read/write functions for cusoOS entities.
 * Reads markdown files from the cusoOS root (parent of webapp/).
 */

import {
  Venture,
  VentureSlug,
  VENTURE_SLUGS,
  Goals,
  GoalSlug,
  GOAL_SLUGS,
  GoalHorizon,
  DailyPlan,
  RecurringItem,
  TodoCategory,
} from "./types";
import {
  getSection,
  listSubsections,
  getSubsection,
  parseBullets,
  parseCheckboxes,
  isSectionEmpty,
} from "./markdown";
import { readTextFile, writeTextFile, listDirectory } from "./storage";

export function getStorageMode(): string {
  return process.env.CUSOOS_STORAGE ?? "fs";
}

async function readFile(rel: string): Promise<string> {
  return readTextFile(rel);
}

async function writeFile(rel: string, content: string): Promise<void> {
  await writeTextFile(rel, content);
}

/* ------------------------------------------------------------------ */
/* Ventures                                                            */
/* ------------------------------------------------------------------ */

export async function readVenture(slug: VentureSlug): Promise<Venture> {
  const rawMarkdown = await readFile(`ventures/${slug}.md`);
  return parseVenture(slug, rawMarkdown);
}

export async function readAllVentures(): Promise<Venture[]> {
  return Promise.all(VENTURE_SLUGS.map(readVenture));
}

function parseVenture(slug: VentureSlug, rawMarkdown: string): Venture {
  const nameMatch = rawMarkdown.match(/^# (.+)$/m);
  const name = nameMatch ? nameMatch[1].trim() : slug;

  const contextRaw = getSection(rawMarkdown, "Context") ?? "";
  const context = parseBullets(contextRaw);
  const hardDeadline = extractHardDeadline(contextRaw);

  const recurringRaw = getSection(rawMarkdown, "Recurring") ?? "";
  const recurring = parseRecurring(recurringRaw);

  const initiativesRaw = getSection(rawMarkdown, "Active Initiatives") ?? "";
  const activeInitiatives = parseInitiatives(initiativesRaw);

  const todoCats = listSubsections(rawMarkdown, "Current To-Dos");
  const todos: TodoCategory[] = todoCats.map((cat) => {
    const sub = getSubsection(rawMarkdown, "Current To-Dos", cat) ?? "";
    return {
      name: cat,
      items: parseCheckboxes(sub).map((c) => ({ ...c, category: cat })),
    };
  });

  const blockersRaw = getSection(rawMarkdown, "Blockers / Waiting On") ?? "";
  const blockers = isSectionEmpty(blockersRaw) ? [] : parseBullets(blockersRaw);

  const notesRaw = getSection(rawMarkdown, "Notes & Context Dumps") ?? "";
  const notes = isSectionEmpty(notesRaw) ? [] : parseBullets(notesRaw);

  const completedRaw = getSection(rawMarkdown, "Recently Completed") ?? "";
  const recentlyCompleted = isSectionEmpty(completedRaw)
    ? []
    : parseBullets(completedRaw);

  return {
    slug,
    name,
    rawMarkdown,
    context,
    recurring,
    activeInitiatives,
    todos,
    blockers,
    notes,
    recentlyCompleted,
    hardDeadline,
  };
}

function extractHardDeadline(
  contextContent: string,
): { label: string; date: string } | undefined {
  // Match `- **Hard deadline:** ... by **2026-05-31** ...`
  const m = contextContent.match(
    /\*\*Hard deadline:\*\*\s*([^*\n]+?)\s*\*\*(\d{4}-\d{2}-\d{2})\*\*/i,
  );
  if (!m) return undefined;
  return { label: m[1].trim().replace(/\s+by\s*$/i, "").trim(), date: m[2] };
}

function parseRecurring(content: string): RecurringItem[] {
  if (isSectionEmpty(content)) return [];
  return content
    .split("\n")
    .map((l) => l.match(/^- (.+)$/)?.[1])
    .filter((x): x is string => Boolean(x))
    .filter((x) => !x.trim().startsWith("_"))
    .map((line) => {
      // Try to extract cadence and next-due if present
      const cadenceMatch = line.match(/^\*\*([^*]+)\*\*\s*—\s*(.+)$/);
      const dateMatch = line.match(/Next due:\s*\*\*?(\d{4}-\d{2}-\d{2})\*\*?/i);
      return {
        text: cadenceMatch ? cadenceMatch[1] : line,
        raw: line,
        cadence: cadenceMatch ? cadenceMatch[2].split(/\.|Next due/)[0].trim() : undefined,
        nextDue: dateMatch ? dateMatch[1] : undefined,
      };
    });
}

function parseInitiatives(content: string): { intro: string; items: string[] } {
  const lines = content.split("\n");
  const introLines: string[] = [];
  const items: string[] = [];
  let pastIntro = false;
  for (const line of lines) {
    if (line.startsWith("- ")) {
      pastIntro = true;
      items.push(line.slice(2));
    } else if (!pastIntro) {
      introLines.push(line);
    }
  }
  return {
    intro: introLines.join("\n").trim(),
    items,
  };
}

export async function writeVenture(slug: VentureSlug, markdown: string) {
  await writeFile(`ventures/${slug}.md`, markdown);
}

/* ------------------------------------------------------------------ */
/* Goals                                                               */
/* ------------------------------------------------------------------ */

export async function readGoals(slug: GoalSlug): Promise<Goals> {
  const rawMarkdown = await readFile(`goals/${slug}.md`);
  return parseGoals(slug, rawMarkdown);
}

export async function readAllGoals(): Promise<Goals[]> {
  return Promise.all(GOAL_SLUGS.map(readGoals));
}

function parseGoals(slug: GoalSlug, rawMarkdown: string): Goals {
  const horizons: Goals["horizons"] = [];
  for (const horizon of ["6-month", "1-year", "3-year"] as GoalHorizon[]) {
    const sectionRegex = new RegExp(
      `^## ${horizon} goals\\s*\\(set ([\\d-]+),\\s*target ([\\d-]+)\\).*$`,
      "im",
    );
    const m = rawMarkdown.match(sectionRegex);
    if (!m) continue;

    // Find the section content
    const sections = rawMarkdown.split(/^## /gm);
    const matchingSection = sections.find((s) => s.startsWith(`${horizon} goals`));
    if (!matchingSection) continue;

    const promptsBlock = matchingSection.match(
      /\*\*Prompts:\*\*\s*([\s\S]*?)(?=\n\s*\n\s*\*\*Goals:\*\*|\*\*Goals:\*\*)/,
    );
    const goalsBlock = matchingSection.match(
      /\*\*Goals:\*\*\s*([\s\S]*?)$/,
    );

    horizons.push({
      horizon,
      setDate: m[1],
      targetDate: m[2],
      prompts: promptsBlock
        ? parseBullets(promptsBlock[1])
        : [],
      goals: goalsBlock
        ? goalsBlock[1]
            .split("\n")
            .map((l) => {
              const checkbox = l.match(/^- \[( |x)\] ?(.*)$/);
              if (checkbox) {
                const raw = checkbox[2].trim();
                if (!raw || raw.startsWith("_")) return null;
                const { status, text } = parseGoalStatus(raw);
                return { text, checked: checkbox[1] === "x", status };
              }
              const bullet = l.match(/^- ?(.*)$/);
              if (bullet) {
                const raw = bullet[1].trim();
                if (!raw || raw.startsWith("_")) return null;
                const { status, text } = parseGoalStatus(raw);
                return { text, checked: null, status };
              }
              return null;
            })
            .filter(
              (x): x is { text: string; checked: boolean | null; status: import("./types").GoalStatus } =>
                x !== null,
            )
        : [],
    });
  }

  return { slug, rawMarkdown, horizons };
}

export async function writeGoals(slug: GoalSlug, markdown: string) {
  await writeFile(`goals/${slug}.md`, markdown);
}

/* ------------------------------------------------------------------ */
/* Daily plans                                                         */
/* ------------------------------------------------------------------ */

export async function listDailyPlans(): Promise<string[]> {
  const files = await listDirectory("daily");
  return files
    .filter((f) => /^\d{4}-\d{2}-\d{2}\.md$/.test(f))
    .map((f) => f.replace(/\.md$/, ""))
    .sort()
    .reverse();
}

export async function readDailyPlan(date: string): Promise<DailyPlan | null> {
  try {
    const rawMarkdown = await readTextFile(`daily/${date}.md`);
    return {
      date,
      rawMarkdown,
      theme: getSection(rawMarkdown, "Today's Theme") ?? "",
      plan: getSection(rawMarkdown, "The Plan") ?? "",
      why: getSection(rawMarkdown, "Why This Plan") ?? "",
      notDoing: getSection(rawMarkdown, "What I'm NOT Doing Today") ?? "",
      checkIns: parseCheckIns(
        getSection(rawMarkdown, "End-of-Day Check-In Prompts") ?? "",
      ),
      reflection: rawMarkdown.match(/^## Reflection /m)
        ? rawMarkdown.split(/^## Reflection /m)[1]
        : undefined,
    };
  } catch {
    return null;
  }
}

function parseGoalStatus(text: string): {
  status: import("./types").GoalStatus;
  text: string;
} {
  const m = text.match(/^\[(ON-TRACK|AT-RISK|OFF-TRACK)\]\s+(.+)$/i);
  if (!m) return { status: null, text };
  const tag = m[1].toUpperCase();
  const map: Record<string, import("./types").GoalStatus> = {
    "ON-TRACK": "on-track",
    "AT-RISK": "at-risk",
    "OFF-TRACK": "off-track",
  };
  return { status: map[tag] ?? null, text: m[2] };
}

export async function writeDailyPlan(date: string, markdown: string) {
  await writeFile(`daily/${date}.md`, markdown);
}

export type DailyPlanFields = {
  theme: string;
  plan: string;
  why: string;
  notDoing: string;
  checkIns: string[];
};

export function serializeDailyPlan(date: string, f: DailyPlanFields): string {
  const checkInLines = f.checkIns
    .filter((q) => q.trim())
    .map((q, i) => `${i + 1}. ${q.trim()}`)
    .join("\n");
  return `# Daily Plan — ${date}

## Today's Theme

${f.theme.trim() || "_(theme)_"}

## The Plan

${f.plan.trim() || "_(plan)_"}

## Why This Plan

${f.why.trim() || "_(why)_"}

## What I'm NOT Doing Today

${f.notDoing.trim() || "_(deferred items)_"}

## End-of-Day Check-In Prompts

${checkInLines || "_(check-in questions)_"}
`;
}

export async function listWeeklyReviews(): Promise<string[]> {
  const files = await listDirectory("weekly");
  return files
    .filter((f) => /^\d{4}-W\d{2}\.md$/.test(f))
    .map((f) => f.replace(/\.md$/, ""))
    .sort()
    .reverse();
}

export async function readWeeklyReview(weekId: string): Promise<{ weekId: string; rawMarkdown: string } | null> {
  try {
    const rawMarkdown = await readTextFile(`weekly/${weekId}.md`);
    return { weekId, rawMarkdown };
  } catch {
    return null;
  }
}

export async function writeWeeklyReview(weekId: string, markdown: string) {
  await writeTextFile(`weekly/${weekId}.md`, markdown);
}

function parseCheckIns(content: string): string[] {
  return content
    .split("\n")
    .map((l) => l.match(/^\d+\.\s*(.+)$/)?.[1])
    .filter((x): x is string => Boolean(x))
    .map((s) => s.replace(/^_(.*)_$/, "$1"));
}
