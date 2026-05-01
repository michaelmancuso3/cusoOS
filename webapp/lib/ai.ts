import Anthropic from "@anthropic-ai/sdk";
import { readTextFile } from "./storage";
import {
  readAllVentures,
  readAllGoals,
  listDailyPlans,
  readDailyPlan,
} from "./cusoos";
import type { DailyPlanFields } from "./cusoos";

const MODEL = "claude-sonnet-4-6";

function getClient() {
  const key = (process.env.ANTHROPIC_API_KEY ?? "").trim();
  if (!key) throw new Error("ANTHROPIC_API_KEY not set");
  return new Anthropic({ apiKey: key });
}

const SYSTEM_INSTRUCTIONS = `You are CusoOS — Michael's daily planner. Read his venture state and generate a focused, honest daily plan.

DECISION PRINCIPLES (priority order):
1. Hard deadlines — payroll, exam dates, dated commitments
2. Cash flow impact — raises, collections, payment automation
3. Compounding leverage — systems that unlock future capacity
4. Revenue-generating — pitches, meetings, follow-ups
5. Optimization / quality of life — polish, fixes

PLAN ADAPTIVE FORMAT — pick the one that fits today:
- One dominant fire → focused brief on that fire + 2 supporting tasks
- Multiple ventures need touchpoints → ranked top 3-5 across ventures
- Reflection/strategy day → time-blocked deep work
- Communication-heavy day → call/message/follow-up list

HARD TRUTHS:
- Michael over-extends. If the draft needs >6 hours of focused work, cut it.
- If recent dailies show he's smoked, propose a half-day or recovery plan.
- Cross-venture conflicts: name them, propose the trade-off.
- The right plan is sometimes "do less today, focus on X." Say it.

OUTPUT FORMAT:
You MUST call the submit_plan tool exactly once with the structured plan. Do not output any text outside the tool call.

Field expectations:
- theme: one sentence — "what does winning today look like?"
- plan: markdown with the items. Use a numbered list for ranked tasks (most days), or time-blocks for deep-work days, or a bullet list for comms days. Each item should reference its venture.
- why: 2-3 sentences laddering today's actions to goals. Cite specific items from the venture state.
- notDoing: markdown bullet list of 2-3 deferred items, each with a one-sentence reason. MANDATORY — this is the discipline.
- checkIns: exactly 3 questions specific to today's plan. Sharp, action-oriented, not generic.

TONE: direct, experience-grounded, no fluff. Skip encouragement. Hard truths are welcome.`;

const TOOL = {
  name: "submit_plan",
  description: "Submit Michael's daily plan in structured form.",
  input_schema: {
    type: "object" as const,
    properties: {
      theme: {
        type: "string" as const,
        description: "One sentence — what does winning today look like?",
      },
      plan: {
        type: "string" as const,
        description: "Markdown body of the plan. Numbered list, time-blocks, or bullets — whatever fits today.",
      },
      why: {
        type: "string" as const,
        description: "2-3 sentences explaining how today's actions ladder up to Michael's goals.",
      },
      notDoing: {
        type: "string" as const,
        description: "Markdown bullet list of 2-3 deferred items with reasons.",
      },
      checkIns: {
        type: "array" as const,
        items: { type: "string" as const },
        minItems: 3,
        maxItems: 3,
        description: "Exactly 3 end-of-day check-in questions specific to today's plan.",
      },
    },
    required: ["theme", "plan", "why", "notDoing", "checkIns"],
  },
};

async function safeRead(path: string): Promise<string> {
  try {
    return await readTextFile(path);
  } catch {
    return "";
  }
}

async function buildContext(date: string): Promise<string> {
  const [ventures, goals, dailyDates, claudeMd, crossVenture] = await Promise.all([
    readAllVentures(),
    readAllGoals(),
    listDailyPlans(),
    safeRead("CLAUDE.md"),
    safeRead("cross-venture.md"),
  ]);

  // Last 3 daily plans (excluding today if exists)
  const recent = dailyDates.filter((d) => d !== date).slice(0, 3);
  const recentPlans = await Promise.all(recent.map((d) => readDailyPlan(d)));

  const sections: string[] = [];
  sections.push(`## TODAY'S DATE\n${date}\n`);

  if (claudeMd) {
    sections.push(`## CLAUDE.md (who Michael is, how to operate)\n\n${claudeMd}\n`);
  }
  if (crossVenture) {
    sections.push(`## cross-venture.md (deps + watch-outs)\n\n${crossVenture}\n`);
  }

  sections.push(`## VENTURES\n`);
  for (const v of ventures) {
    sections.push(`### ventures/${v.slug}.md\n\n${v.rawMarkdown}\n`);
  }

  sections.push(`## GOALS\n`);
  for (const g of goals) {
    sections.push(`### goals/${g.slug}.md\n\n${g.rawMarkdown}\n`);
  }

  if (recentPlans.length) {
    sections.push(`## RECENT DAILY PLANS (last ${recentPlans.length})\n`);
    for (const p of recentPlans) {
      if (!p) continue;
      sections.push(`### daily/${p.date}.md\n\n${p.rawMarkdown}\n`);
    }
  } else {
    sections.push(`## RECENT DAILY PLANS\n_No prior plans on file._\n`);
  }

  return sections.join("\n");
}

export async function generatePlanWithAI(
  date: string,
): Promise<DailyPlanFields> {
  const client = getClient();
  const context = await buildContext(date);

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 2048,
    system: [
      {
        type: "text",
        text: SYSTEM_INSTRUCTIONS,
        cache_control: { type: "ephemeral" },
      },
    ],
    tools: [TOOL],
    tool_choice: { type: "tool", name: "submit_plan" },
    messages: [
      {
        role: "user",
        content: `Generate today's plan based on the state below.\n\n${context}`,
      },
    ],
  });

  const toolUse = response.content.find(
    (b): b is Anthropic.ToolUseBlock => b.type === "tool_use",
  );
  if (!toolUse) throw new Error("Model did not call submit_plan tool");

  const input = toolUse.input as {
    theme: string;
    plan: string;
    why: string;
    notDoing: string;
    checkIns: string[];
  };

  return {
    theme: input.theme,
    plan: input.plan,
    why: input.why,
    notDoing: input.notDoing,
    checkIns: input.checkIns,
  };
}
