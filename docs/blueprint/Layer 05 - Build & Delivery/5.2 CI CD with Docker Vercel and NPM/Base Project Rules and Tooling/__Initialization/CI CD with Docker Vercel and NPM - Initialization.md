# CI CD with Docker Vercel and NPM — Initialization

Updated by Cory Morrissey: 1/29/2026

This setup path wires **one** Gitflow CI/CD pipeline (Vercel, Docker, or npm) and keeps builds deterministic and repeatable.

## 🎯 Goal

Ship a project with:
- CI gating on PRs and main.
- Gitflow CD for a single deploy target.
- One artifact promoted from dev -> staging -> prod (no rebuilds after dev).

## 📦 What This Step Produces

- A working CI pipeline at `.github/workflows/ci.yml`.
- One Gitflow CD pipeline (Vercel, Docker, or npm).
- Required secrets defined in the repo settings.
- A verified dev -> staging -> prod flow.

## ✅ Preconditions

- Gitflow branches exist: `develop`, `release/*`, `main`.
- `package.json` includes `packageManager` for deterministic pnpm.
- Conventional commits + release tooling are available if you plan tag-based prod releases.

---

# Step 1 — Keep CI Only (Baseline Gate)

CI is mandatory for all projects:
- `pull_request` -> runs quality gate.
- `push` to `main` -> runs quality gate.

Required scripts (order matters):
- `pnpm format:check`
- `pnpm lint -- --max-warnings=0`
- `pnpm type-check`
- `pnpm test`

Verify:
- Open a PR and confirm CI runs all gates.

---

# Step 2 — Choose Exactly One CD Path

Pick **one** Gitflow CD workflow and remove or disable the others:

- Web apps: `.github/workflows/cd-vercel-gitflow.yml`
- Services: `.github/workflows/cd-docker-gitflow.yml`
- Libraries: `.github/workflows/cd-npm-gitflow.yml`

Rule: **Only one CD path should be active** in a given project to avoid multiple deployments.

---

# Step 3 — Configure Secrets

Vercel:
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID_DEV`
- `VERCEL_PROJECT_ID_STAGING`
- `VERCEL_PROJECT_ID_PROD`

Docker:
- GHCR uses `GITHUB_TOKEN` (auto-provided), or configure registry credentials.

npm:
- `NPM_TOKEN`

---

# Step 4 — Verify Gitflow Triggers

1) Push to `develop` -> dev deploy/publish triggers.
2) Create `release/*` -> staging deploy/publish triggers.
3) Push tag `v*` -> prod deploy/publish triggers.

---

# Step 5 — Release Tagging (Prod Gate)

Use conventional commits + `standard-version` (or equivalent) to create `v*` tags.

This tag is the prod trigger and must point to the release commit.

---

# Step 6 — Document the Chosen Path

Add a short note in project docs:
- Which CD path is active.
- Where secrets live.
- Who approves prod tags.

---

# Common Issues

- Missing secrets -> deployment fails at auth step.
- `packageManager` missing -> Corepack fails in CI.
- Tag not pushed -> prod deploy does not run.
- Multiple CD workflows active -> multiple deployments triggered.
