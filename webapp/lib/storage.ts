/**
 * Storage abstraction — abstracts file reads/writes so we can run:
 *   - locally against the cusoOS markdown files (default)
 *   - on Vercel against a GitHub repo via the Contents API
 *
 * Selected by env var CUSOOS_STORAGE: "fs" (default) | "github".
 */

import fs from "node:fs/promises";
import path from "node:path";

const BACKEND = (process.env.CUSOOS_STORAGE ?? "fs").toLowerCase() as
  | "fs"
  | "github";

const FS_ROOT =
  process.env.CUSOOS_ROOT ?? path.resolve(process.cwd(), "..");

const GH_OWNER = process.env.GITHUB_REPO_OWNER ?? "";
const GH_REPO = process.env.GITHUB_REPO_NAME ?? "";
const GH_BRANCH = process.env.GITHUB_BRANCH ?? "main";
const GH_TOKEN = process.env.GITHUB_TOKEN ?? "";

export function getStorageBackend(): "fs" | "github" {
  return BACKEND;
}

export async function readTextFile(relPath: string): Promise<string> {
  if (BACKEND === "github") return ghReadFile(relPath);
  return fs.readFile(path.join(FS_ROOT, relPath), "utf8");
}

export async function writeTextFile(
  relPath: string,
  content: string,
): Promise<void> {
  if (BACKEND === "github") return ghWriteFile(relPath, content);
  await fs.writeFile(path.join(FS_ROOT, relPath), content, "utf8");
}

export async function listDirectory(relPath: string): Promise<string[]> {
  if (BACKEND === "github") return ghListDirectory(relPath);
  const dir = path.join(FS_ROOT, relPath);
  try {
    return await fs.readdir(dir);
  } catch {
    return [];
  }
}

/* ------------------------------------------------------------------ */
/* GitHub Contents API backend                                          */
/* ------------------------------------------------------------------ */

const GH_API = "https://api.github.com";

type GhFile = { type: "file"; sha: string; content: string; encoding: "base64" };
type GhDir = Array<{ type: "file" | "dir"; name: string }>;

function ghHeaders(): HeadersInit {
  if (!GH_TOKEN) throw new Error("GITHUB_TOKEN env var is required for github storage");
  return {
    Authorization: `Bearer ${GH_TOKEN}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

function ghContentsUrl(p: string): string {
  return `${GH_API}/repos/${GH_OWNER}/${GH_REPO}/contents/${encodeURIComponent(p).replace(/%2F/g, "/")}?ref=${GH_BRANCH}`;
}

async function ghReadFile(relPath: string): Promise<string> {
  const res = await fetch(ghContentsUrl(relPath), {
    headers: ghHeaders(),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`GitHub read failed (${res.status}): ${relPath}`);
  }
  const json = (await res.json()) as GhFile;
  return Buffer.from(json.content, "base64").toString("utf8");
}

async function ghGetSha(relPath: string): Promise<string | null> {
  const res = await fetch(ghContentsUrl(relPath), {
    headers: ghHeaders(),
    cache: "no-store",
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub sha lookup failed (${res.status})`);
  const json = (await res.json()) as { sha: string };
  return json.sha;
}

async function ghWriteFile(relPath: string, content: string): Promise<void> {
  const sha = await ghGetSha(relPath);
  const url = `${GH_API}/repos/${GH_OWNER}/${GH_REPO}/contents/${encodeURIComponent(relPath).replace(/%2F/g, "/")}`;
  const body = {
    message: `chore(cusoOS): update ${relPath} via webapp`,
    content: Buffer.from(content, "utf8").toString("base64"),
    branch: GH_BRANCH,
    ...(sha ? { sha } : {}),
  };
  const res = await fetch(url, {
    method: "PUT",
    headers: { ...ghHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub write failed (${res.status}): ${text}`);
  }
}

async function ghListDirectory(relPath: string): Promise<string[]> {
  const res = await fetch(ghContentsUrl(relPath), {
    headers: ghHeaders(),
    cache: "no-store",
  });
  if (res.status === 404) return [];
  if (!res.ok) throw new Error(`GitHub list failed (${res.status})`);
  const json = (await res.json()) as GhDir;
  return json.map((entry) => entry.name);
}
