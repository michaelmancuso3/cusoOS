/**
 * Section-based markdown utilities for cusoOS files.
 *
 * Strategy: keep the markdown text as the source of truth. Read = parse into
 * structured arrays. Write = surgical line-level edits so formatting is preserved.
 */

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export type Section = {
  level: 1 | 2 | 3;
  name: string;
  headingLine: number;
  contentStart: number;
  contentEnd: number;
};

export function parseSections(markdown: string): Section[] {
  const lines = markdown.split("\n");
  const headings: { level: 1 | 2 | 3; name: string; line: number }[] = [];

  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^(#{1,3}) (.+?)\s*$/);
    if (m) {
      headings.push({
        level: m[1].length as 1 | 2 | 3,
        name: m[2].trim(),
        line: i,
      });
    }
  }

  const sections: Section[] = [];
  for (let h = 0; h < headings.length; h++) {
    const head = headings[h];
    const next = headings[h + 1];
    sections.push({
      level: head.level,
      name: head.name,
      headingLine: head.line,
      contentStart: head.line + 1,
      contentEnd: next ? next.line : lines.length,
    });
  }
  return sections;
}

export function getSection(markdown: string, name: string, level: 2 | 3 = 2): string | null {
  const sections = parseSections(markdown);
  const s = sections.find((s) => s.level === level && s.name === name);
  if (!s) return null;
  const lines = markdown.split("\n").slice(s.contentStart, s.contentEnd);
  return lines.join("\n").trim();
}

/** A "## Section" with a `### Subsection` inside. */
export function getSubsection(
  markdown: string,
  parentSection: string,
  subsection: string,
): string | null {
  const sections = parseSections(markdown);
  const parentIdx = sections.findIndex(
    (s) => s.level === 2 && s.name === parentSection,
  );
  if (parentIdx === -1) return null;

  for (let i = parentIdx + 1; i < sections.length; i++) {
    const s = sections[i];
    if (s.level === 2) break; // exited parent's range
    if (s.level === 3 && s.name === subsection) {
      const lines = markdown.split("\n").slice(s.contentStart, s.contentEnd);
      return lines.join("\n").trim();
    }
  }
  return null;
}

export function listSubsections(markdown: string, parentSection: string): string[] {
  const sections = parseSections(markdown);
  const parentIdx = sections.findIndex(
    (s) => s.level === 2 && s.name === parentSection,
  );
  if (parentIdx === -1) return [];

  const subs: string[] = [];
  for (let i = parentIdx + 1; i < sections.length; i++) {
    const s = sections[i];
    if (s.level === 2) break;
    if (s.level === 3) subs.push(s.name);
  }
  return subs;
}

/** Find the line after the last ### subsection (or end of section content) of a ## parent. */
function findParentEndLine(
  sections: Section[],
  parentIdx: number,
  totalLines: number,
): number {
  for (let i = parentIdx + 1; i < sections.length; i++) {
    if (sections[i].level === 2) return sections[i].headingLine;
  }
  return totalLines;
}

/** Parse simple `- item` bullets, ignoring placeholder italic text. */
export function parseBullets(content: string): string[] {
  return content
    .split("\n")
    .map((l) => l.match(/^- (.+)$/)?.[1])
    .filter((x): x is string => Boolean(x))
    .filter((x) => !isPlaceholderText(x));
}

/** Parse `- [ ] item` or `- [x] item` checkboxes. */
export function parseCheckboxes(content: string): { text: string; checked: boolean }[] {
  return content
    .split("\n")
    .map((l) => {
      const m = l.match(/^- \[( |x)\] (.+)$/);
      if (!m) return null;
      return { text: m[2], checked: m[1] === "x" };
    })
    .filter((x): x is { text: string; checked: boolean } => Boolean(x));
}

export function isPlaceholderText(text: string): boolean {
  // Italic placeholder: _Some text._ — skip if entire line is italic
  return /^_.*_$/.test(text.trim());
}

export function isSectionEmpty(content: string): boolean {
  if (!content.trim()) return true;
  const lines = content.split("\n").filter((l) => l.trim());
  if (lines.length === 0) return true;
  // If every non-empty line is italic placeholder
  return lines.every((l) => isPlaceholderText(l));
}

/* ------------------------------------------------------------------ */
/* Surgical edits                                                       */
/* ------------------------------------------------------------------ */

/** Toggle the first `- [ ] text` or `- [x] text` line matching exactly. */
export function toggleCheckboxLine(markdown: string, itemText: string): string {
  const lines = markdown.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^(- \[)( |x)(\] )(.+)$/);
    if (m && m[4] === itemText) {
      const next = m[2] === "x" ? " " : "x";
      lines[i] = `${m[1]}${next}${m[3]}${m[4]}`;
      return lines.join("\n");
    }
  }
  return markdown;
}

/** Append a `- [ ] text` line to the end of a `### subsection` inside `## section`. */
export function appendCheckboxToSubsection(
  markdown: string,
  parentSection: string,
  subsection: string,
  text: string,
): string {
  const sections = parseSections(markdown);
  const parentIdx = sections.findIndex(
    (s) => s.level === 2 && s.name === parentSection,
  );
  if (parentIdx === -1) return markdown;

  let target: Section | undefined;
  for (let i = parentIdx + 1; i < sections.length; i++) {
    const s = sections[i];
    if (s.level === 2) break;
    if (s.level === 3 && s.name === subsection) {
      target = s;
      break;
    }
  }
  if (!target) return markdown;

  const lines = markdown.split("\n");
  let insertAt = target.contentEnd;
  while (insertAt > target.contentStart && lines[insertAt - 1].trim() === "") {
    insertAt--;
  }
  lines.splice(insertAt, 0, `- [ ] ${text}`);
  return lines.join("\n");
}

/** Add a new `### subsection` to a parent section, with an initial checkbox. */
export function appendNewSubsection(
  markdown: string,
  parentSection: string,
  subsectionName: string,
  initialItem?: string,
): string {
  const sections = parseSections(markdown);
  const parentIdx = sections.findIndex(
    (s) => s.level === 2 && s.name === parentSection,
  );
  if (parentIdx === -1) return markdown;

  const lines = markdown.split("\n");
  const parentEnd = findParentEndLine(sections, parentIdx, lines.length);

  let insertAt = parentEnd;
  while (
    insertAt > sections[parentIdx].contentStart &&
    lines[insertAt - 1].trim() === ""
  ) {
    insertAt--;
  }

  const newLines = ["", `### ${subsectionName}`];
  if (initialItem) newLines.push(`- [ ] ${initialItem}`);
  lines.splice(insertAt, 0, ...newLines);
  return lines.join("\n");
}

/** Remove the first matching line from the document. */
export function removeLine(markdown: string, exactLine: string): string {
  const lines = markdown.split("\n");
  const idx = lines.indexOf(exactLine);
  if (idx === -1) return markdown;
  lines.splice(idx, 1);
  return lines.join("\n");
}

/** Append a line to a `## section`. Replaces placeholder text if present. */
export function appendLineToSection(
  markdown: string,
  sectionName: string,
  newLine: string,
): string {
  const sections = parseSections(markdown);
  const section = sections.find((s) => s.level === 2 && s.name === sectionName);
  if (!section) return markdown;

  const lines = markdown.split("\n");
  const sectionLines = lines.slice(section.contentStart, section.contentEnd);

  // If section is just placeholder, replace placeholder with new content
  if (isSectionEmpty(sectionLines.join("\n"))) {
    const placeholderIdx = sectionLines.findIndex((l) => l.trim().startsWith("_"));
    if (placeholderIdx !== -1) {
      lines[section.contentStart + placeholderIdx] = newLine;
      return lines.join("\n");
    }
  }

  // Otherwise append after last non-empty line
  let insertAt = section.contentEnd;
  while (insertAt > section.contentStart && lines[insertAt - 1].trim() === "") {
    insertAt--;
  }
  lines.splice(insertAt, 0, newLine);
  return lines.join("\n");
}

/* ------------------------------------------------------------------ */
/* Goals helpers                                                       */
/* ------------------------------------------------------------------ */

/** Find the line range of a goals horizon's `**Goals:**` block. */
function findGoalsBlock(
  markdown: string,
  horizon: "6-month" | "1-year" | "3-year",
): { startLine: number; endLine: number } | null {
  const lines = markdown.split("\n");
  const headingPattern = new RegExp(`^## ${horizon} goals\\b`, "i");
  let sectionStart = -1;
  let sectionEnd = lines.length;

  for (let i = 0; i < lines.length; i++) {
    if (headingPattern.test(lines[i])) {
      sectionStart = i;
      // Find next ## heading
      for (let j = i + 1; j < lines.length; j++) {
        if (lines[j].startsWith("## ")) {
          sectionEnd = j;
          break;
        }
      }
      break;
    }
  }
  if (sectionStart === -1) return null;

  // Find the `**Goals:**` line within the section
  let goalsMarker = -1;
  for (let i = sectionStart; i < sectionEnd; i++) {
    if (/^\*\*Goals:\*\*/.test(lines[i].trim())) {
      goalsMarker = i;
      break;
    }
  }
  if (goalsMarker === -1) return null;

  return { startLine: goalsMarker + 1, endLine: sectionEnd };
}

export function appendGoal(
  markdown: string,
  horizon: "6-month" | "1-year" | "3-year",
  text: string,
): string {
  const block = findGoalsBlock(markdown, horizon);
  if (!block) return markdown;

  const lines = markdown.split("\n");
  const useCheckbox = horizon !== "3-year";
  const newLine = useCheckbox ? `- [ ] ${text}` : `- ${text}`;

  // Find last non-empty, non-placeholder line in the goals block
  let insertAt = block.endLine;
  while (insertAt > block.startLine) {
    const prev = lines[insertAt - 1].trim();
    if (prev === "") {
      insertAt--;
      continue;
    }
    break;
  }

  // If only placeholder line `- _your goal_` or just `- ` empty, replace it
  for (let i = block.startLine; i < block.endLine; i++) {
    const t = lines[i].trim();
    if (t === "-" || t === "- " || /^- \[[ x]\]\s*$/.test(t) || /^- _[^_]+_$/.test(t)) {
      lines[i] = newLine;
      return lines.join("\n");
    }
  }

  lines.splice(insertAt, 0, newLine);
  return lines.join("\n");
}

export function toggleGoal(
  markdown: string,
  horizon: "6-month" | "1-year" | "3-year",
  text: string,
): string {
  const block = findGoalsBlock(markdown, horizon);
  if (!block) return markdown;
  const lines = markdown.split("\n");
  for (let i = block.startLine; i < block.endLine; i++) {
    const m = lines[i].match(/^(- \[)( |x)(\] )(\[(?:ON-TRACK|AT-RISK|OFF-TRACK)\]\s+)?(.+)$/i);
    if (m && m[5] === text) {
      const next = m[2] === "x" ? " " : "x";
      lines[i] = `${m[1]}${next}${m[3]}${m[4] ?? ""}${m[5]}`;
      return lines.join("\n");
    }
  }
  return markdown;
}

/** Set status prefix on a goal line. Pass null to remove status. */
export function setGoalStatus(
  markdown: string,
  horizon: "6-month" | "1-year" | "3-year",
  text: string,
  status: "on-track" | "at-risk" | "off-track" | null,
): string {
  const block = findGoalsBlock(markdown, horizon);
  if (!block) return markdown;
  const lines = markdown.split("\n");

  for (let i = block.startLine; i < block.endLine; i++) {
    // Try checkbox first
    const cb = lines[i].match(/^(- \[[ x]\] )(?:\[(?:ON-TRACK|AT-RISK|OFF-TRACK)\]\s+)?(.+)$/i);
    if (cb && cb[2] === text) {
      const tag = status ? `[${status.toUpperCase()}] ` : "";
      lines[i] = `${cb[1]}${tag}${text}`;
      return lines.join("\n");
    }
    // Then plain bullet
    const bullet = lines[i].match(/^(- )(?:\[(?:ON-TRACK|AT-RISK|OFF-TRACK)\]\s+)?(.+)$/i);
    if (bullet && bullet[2] === text) {
      const tag = status ? `[${status.toUpperCase()}] ` : "";
      lines[i] = `${bullet[1]}${tag}${text}`;
      return lines.join("\n");
    }
  }
  return markdown;
}

/** Replace the text of a goal line, preserving status + checkbox state. */
export function updateGoalText(
  markdown: string,
  horizon: "6-month" | "1-year" | "3-year",
  oldText: string,
  newText: string,
): string {
  if (!newText.trim()) return markdown;
  const block = findGoalsBlock(markdown, horizon);
  if (!block) return markdown;
  const lines = markdown.split("\n");
  for (let i = block.startLine; i < block.endLine; i++) {
    const cb = lines[i].match(/^(- \[[ x]\] )(\[(?:ON-TRACK|AT-RISK|OFF-TRACK)\]\s+)?(.+)$/i);
    if (cb && cb[3] === oldText) {
      lines[i] = `${cb[1]}${cb[2] ?? ""}${newText.trim()}`;
      return lines.join("\n");
    }
    const bullet = lines[i].match(/^(- )(\[(?:ON-TRACK|AT-RISK|OFF-TRACK)\]\s+)?(.+)$/i);
    if (bullet && bullet[3] === oldText) {
      lines[i] = `${bullet[1]}${bullet[2] ?? ""}${newText.trim()}`;
      return lines.join("\n");
    }
  }
  return markdown;
}

/** Replace the text of a todo, preserving its checkbox state and position. */
export function updateTodoText(
  markdown: string,
  oldText: string,
  newText: string,
): string {
  if (!newText.trim()) return markdown;
  const lines = markdown.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^(- \[[ x]\] )(.+)$/);
    if (m && m[2] === oldText) {
      lines[i] = `${m[1]}${newText.trim()}`;
      return lines.join("\n");
    }
  }
  return markdown;
}

export function removeGoal(
  markdown: string,
  horizon: "6-month" | "1-year" | "3-year",
  text: string,
): string {
  const block = findGoalsBlock(markdown, horizon);
  if (!block) return markdown;
  const lines = markdown.split("\n");
  for (let i = block.startLine; i < block.endLine; i++) {
    const cb = lines[i].match(
      /^- \[[ x]\] (?:\[(?:ON-TRACK|AT-RISK|OFF-TRACK)\]\s+)?(.+)$/i,
    );
    const bullet = lines[i].match(
      /^- (?:\[(?:ON-TRACK|AT-RISK|OFF-TRACK)\]\s+)?(.+)$/i,
    );
    if ((cb && cb[1] === text) || (bullet && bullet[1] === text)) {
      lines.splice(i, 1);
      return lines.join("\n");
    }
  }
  return markdown;
}

/** Move a checked todo from "Current To-Dos" to "Recently Completed" with date. */
export function archiveTodoLine(
  markdown: string,
  itemText: string,
  date: string,
): string {
  const lines = markdown.split("\n");
  // Find and remove from To-Dos
  let removedFromIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^(- \[)( |x)(\] )(.+)$/);
    if (m && m[4] === itemText) {
      removedFromIdx = i;
      break;
    }
  }
  if (removedFromIdx === -1) return markdown;

  lines.splice(removedFromIdx, 1);
  let newMarkdown = lines.join("\n");
  newMarkdown = appendLineToSection(
    newMarkdown,
    "Recently Completed",
    `- ${date} — ${itemText}`,
  );
  return newMarkdown;
}
