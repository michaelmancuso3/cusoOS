export type TodoItem = {
  text: string;
  checked: boolean;
  category: string;
};

export type TodoCategory = {
  name: string;
  items: TodoItem[];
};

export type RecurringItem = {
  text: string;
  raw: string;
  cadence?: string;
  nextDue?: string;
};

export type VentureSlug =
  | "proactive"
  | "northland"
  | "midas"
  | "sparkling"
  | "unify"
  | "zoomlion";

export const VENTURE_SLUGS: VentureSlug[] = [
  "proactive",
  "northland",
  "midas",
  "sparkling",
  "unify",
  "zoomlion",
];

export type Venture = {
  slug: VentureSlug;
  name: string;
  rawMarkdown: string;
  context: string[];
  recurring: RecurringItem[];
  activeInitiatives: {
    intro: string;
    items: string[];
  };
  todos: TodoCategory[];
  blockers: string[];
  notes: string[];
  recentlyCompleted: string[];
  hardDeadline?: { label: string; date: string };
};

export type GoalSlug = VentureSlug | "personal";

export const GOAL_SLUGS: GoalSlug[] = [...VENTURE_SLUGS, "personal"];

export type GoalHorizon = "6-month" | "1-year" | "3-year";

export type GoalStatus = "on-track" | "at-risk" | "off-track" | null;

export type GoalEntry = {
  text: string;
  checked: boolean | null;
  status: GoalStatus;
};

export type Goals = {
  slug: GoalSlug;
  rawMarkdown: string;
  horizons: Array<{
    horizon: GoalHorizon;
    targetDate: string;
    setDate: string;
    prompts: string[];
    goals: GoalEntry[];
  }>;
};

export type DailyPlan = {
  date: string;
  rawMarkdown: string;
  theme: string;
  plan: string;
  why: string;
  notDoing: string;
  checkIns: string[];
  reflection?: string;
};
