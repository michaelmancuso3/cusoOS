# Deploying cusoOS to Vercel

The webapp ships with two storage backends:

- **`fs`** (default) — reads/writes the markdown files at `../` on the local filesystem. Used for local dev. Won't work on Vercel because the filesystem is ephemeral.
- **`github`** — reads/writes via the GitHub Contents API. Every edit becomes a commit on a real repo. This is what Vercel runs.

This guide takes you from local-only to a deployed Vercel app, accessible from your phone, password-protected, with the markdown files living in a private GitHub repo.

---

## 1. Push cusoOS to a private GitHub repo

From `/Users/Proactive/cusoOS`:

```bash
git init
git add .
git commit -m "Initial cusoOS commit"
gh repo create cusoOS --private --source . --remote origin --push
```

(Or create the repo manually in the GitHub UI and `git remote add` + `git push`.)

The repo should contain the `webapp/` folder plus all the markdown files (`CLAUDE.md`, `ventures/`, `goals/`, `daily/`, etc.).

---

## 2. Create a GitHub Personal Access Token

The webapp uses this token to read/write markdown files via the Contents API.

1. Go to <https://github.com/settings/tokens?type=beta> (fine-grained tokens)
2. Click **Generate new token**
3. Configure:
   - **Repository access:** "Only select repositories" → pick `cusoOS`
   - **Permissions** (Repository):
     - **Contents:** Read and write
     - **Metadata:** Read (auto-selected)
4. Copy the token (starts with `github_pat_…`). Save it — Vercel needs it.

---

## 3. Create the Vercel project

1. Go to <https://vercel.com/new>
2. Import the `cusoOS` GitHub repo
3. **Root Directory:** set to `webapp` (not the repo root)
4. **Framework Preset:** Next.js (auto-detected)
5. Don't deploy yet — set env vars first

---

## 4. Set environment variables on Vercel

Project Settings → Environment Variables. Add these (Production, Preview, Development):

| Name | Value |
|---|---|
| `CUSOOS_STORAGE` | `github` |
| `GITHUB_REPO_OWNER` | your GitHub username |
| `GITHUB_REPO_NAME` | `cusoOS` |
| `GITHUB_BRANCH` | `main` |
| `GITHUB_TOKEN` | the token from step 2 |
| `SITE_PASSWORD` | a long random string (your password to access the app) |

Now click **Deploy**.

---

## 5. Use it

- Visit the Vercel URL → browser prompts for HTTP Basic Auth
- Username: anything (we only check the password)
- Password: whatever you set as `SITE_PASSWORD`

Every edit you make in the webapp commits a change to the cusoOS repo on `main`. To pull those changes locally:

```bash
cd /Users/Proactive/cusoOS && git pull
```

If you edit locally (or Claude Code does), push to keep the deployed app in sync:

```bash
cd /Users/Proactive/cusoOS && git add -A && git commit -m "local edits" && git push
```

---

## Troubleshooting

- **403 / 404 on first read:** check `GITHUB_REPO_OWNER` matches your username exactly (case sensitive on some endpoints) and the token has access to the repo.
- **`auth required` loop:** your browser cached bad credentials. Try a fresh private window, or clear basic auth credentials for the domain.
- **Edits don't appear:** check the GitHub repo for new commits. If commits aren't being created, the token probably doesn't have Contents write permission.

---

## Next: real OAuth (later)

The basic-auth setup is solo-user friendly but not great long-term. When you want multi-user (e.g., Franco/JP for Unify), swap to NextAuth with GitHub OAuth and gate by allowed usernames. The storage abstraction is already shaped for it.
