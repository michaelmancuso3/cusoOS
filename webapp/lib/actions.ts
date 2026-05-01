"use server";

import { revalidatePath } from "next/cache";
import {
  VentureSlug,
  VENTURE_SLUGS,
  GoalSlug,
  GOAL_SLUGS,
  GoalHorizon,
} from "./types";
import {
  readVenture,
  writeVenture,
  readGoals,
  writeGoals,
} from "./cusoos";
import {
  toggleCheckboxLine,
  appendCheckboxToSubsection,
  appendNewSubsection,
  removeLine,
  appendLineToSection,
  archiveTodoLine,
  appendGoal,
  toggleGoal,
  removeGoal,
  setGoalStatus,
  updateGoalText,
  updateTodoText,
} from "./markdown";
import type { GoalStatus } from "./types";

function isValidSlug(slug: string): slug is VentureSlug {
  return (VENTURE_SLUGS as string[]).includes(slug);
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function revalidateVenture(slug: VentureSlug) {
  revalidatePath(`/ventures/${slug}`);
  revalidatePath("/");
}

export async function toggleTodo(slug: VentureSlug, itemText: string) {
  if (!isValidSlug(slug)) throw new Error("Invalid venture slug");
  const venture = await readVenture(slug);
  const updated = toggleCheckboxLine(venture.rawMarkdown, itemText);
  await writeVenture(slug, updated);
  revalidateVenture(slug);
}

export async function archiveTodo(slug: VentureSlug, itemText: string) {
  if (!isValidSlug(slug)) throw new Error("Invalid venture slug");
  const venture = await readVenture(slug);
  const updated = archiveTodoLine(venture.rawMarkdown, itemText, todayISO());
  await writeVenture(slug, updated);
  revalidateVenture(slug);
}

export async function addTodo(
  slug: VentureSlug,
  category: string,
  text: string,
) {
  if (!isValidSlug(slug)) throw new Error("Invalid venture slug");
  if (!text.trim()) return;
  const venture = await readVenture(slug);

  const existingCategories = venture.todos.map((t) => t.name);
  let updated: string;
  if (existingCategories.includes(category)) {
    updated = appendCheckboxToSubsection(
      venture.rawMarkdown,
      "Current To-Dos",
      category,
      text.trim(),
    );
  } else {
    updated = appendNewSubsection(
      venture.rawMarkdown,
      "Current To-Dos",
      category,
      text.trim(),
    );
  }
  await writeVenture(slug, updated);
  revalidateVenture(slug);
}

export async function deleteTodo(slug: VentureSlug, itemText: string) {
  if (!isValidSlug(slug)) throw new Error("Invalid venture slug");
  const venture = await readVenture(slug);
  let updated = removeLine(venture.rawMarkdown, `- [ ] ${itemText}`);
  if (updated === venture.rawMarkdown) {
    updated = removeLine(venture.rawMarkdown, `- [x] ${itemText}`);
  }
  await writeVenture(slug, updated);
  revalidateVenture(slug);
}

export async function addBlocker(slug: VentureSlug, text: string) {
  if (!isValidSlug(slug)) throw new Error("Invalid venture slug");
  if (!text.trim()) return;
  const venture = await readVenture(slug);
  const updated = appendLineToSection(
    venture.rawMarkdown,
    "Blockers / Waiting On",
    `- ${text.trim()}`,
  );
  await writeVenture(slug, updated);
  revalidateVenture(slug);
}

export async function deleteBlocker(slug: VentureSlug, text: string) {
  if (!isValidSlug(slug)) throw new Error("Invalid venture slug");
  const venture = await readVenture(slug);
  const updated = removeLine(venture.rawMarkdown, `- ${text}`);
  await writeVenture(slug, updated);
  revalidateVenture(slug);
}

export async function addNote(slug: VentureSlug, text: string) {
  if (!isValidSlug(slug)) throw new Error("Invalid venture slug");
  if (!text.trim()) return;
  const venture = await readVenture(slug);
  const updated = appendLineToSection(
    venture.rawMarkdown,
    "Notes & Context Dumps",
    `- ${text.trim()}`,
  );
  await writeVenture(slug, updated);
  revalidateVenture(slug);
}

export async function deleteNote(slug: VentureSlug, text: string) {
  if (!isValidSlug(slug)) throw new Error("Invalid venture slug");
  const venture = await readVenture(slug);
  const updated = removeLine(venture.rawMarkdown, `- ${text}`);
  await writeVenture(slug, updated);
  revalidateVenture(slug);
}

/* ------------------------------------------------------------------ */
/* Goals                                                               */
/* ------------------------------------------------------------------ */

function isValidGoalSlug(slug: string): slug is GoalSlug {
  return (GOAL_SLUGS as string[]).includes(slug);
}

function revalidateGoals(slug: GoalSlug) {
  revalidatePath(`/goals/${slug}`);
  revalidatePath("/goals");
  revalidatePath("/goals/timeline");
  revalidatePath("/");
}

export async function addGoal(
  slug: GoalSlug,
  horizon: GoalHorizon,
  text: string,
) {
  if (!isValidGoalSlug(slug)) throw new Error("Invalid goal slug");
  if (!text.trim()) return;
  const g = await readGoals(slug);
  const updated = appendGoal(g.rawMarkdown, horizon, text.trim());
  await writeGoals(slug, updated);
  revalidateGoals(slug);
}

export async function toggleGoalAction(
  slug: GoalSlug,
  horizon: GoalHorizon,
  text: string,
) {
  if (!isValidGoalSlug(slug)) throw new Error("Invalid goal slug");
  if (horizon === "3-year") return; // 3yr goals are bullets, not checkboxes
  const g = await readGoals(slug);
  const updated = toggleGoal(g.rawMarkdown, horizon, text);
  await writeGoals(slug, updated);
  revalidateGoals(slug);
}

export async function deleteGoalAction(
  slug: GoalSlug,
  horizon: GoalHorizon,
  text: string,
) {
  if (!isValidGoalSlug(slug)) throw new Error("Invalid goal slug");
  const g = await readGoals(slug);
  const updated = removeGoal(g.rawMarkdown, horizon, text);
  await writeGoals(slug, updated);
  revalidateGoals(slug);
}

export async function setGoalStatusAction(
  slug: GoalSlug,
  horizon: GoalHorizon,
  text: string,
  status: GoalStatus,
) {
  if (!isValidGoalSlug(slug)) throw new Error("Invalid goal slug");
  const g = await readGoals(slug);
  const updated = setGoalStatus(g.rawMarkdown, horizon, text, status);
  await writeGoals(slug, updated);
  revalidateGoals(slug);
}

export async function updateGoalTextAction(
  slug: GoalSlug,
  horizon: GoalHorizon,
  oldText: string,
  newText: string,
) {
  if (!isValidGoalSlug(slug)) throw new Error("Invalid goal slug");
  if (!newText.trim()) return;
  const g = await readGoals(slug);
  const updated = updateGoalText(g.rawMarkdown, horizon, oldText, newText);
  await writeGoals(slug, updated);
  revalidateGoals(slug);
}

export async function updateTodoTextAction(
  slug: VentureSlug,
  oldText: string,
  newText: string,
) {
  if (!isValidSlug(slug)) throw new Error("Invalid venture slug");
  if (!newText.trim()) return;
  const venture = await readVenture(slug);
  const updated = updateTodoText(venture.rawMarkdown, oldText, newText);
  await writeVenture(slug, updated);
  revalidateVenture(slug);
}
