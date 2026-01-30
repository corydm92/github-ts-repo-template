# CI/CD with Docker, Vercel, and npm — Initialization

Updated by Cory Morrissey: 1/29/2026

This setup path wires **one** Gitflow CI/CD pipeline (Vercel, Docker, or npm) and keeps builds deterministic and repeatable.

## 🎯 Goal

Ship a project with:
- CI gating on PRs (all branches) and develop.
- Gitflow CD for a single deploy target.
- Rebuild per environment using deterministic inputs to avoid drift.
- Optional automation for release branch creation and back-merge to develop.

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
- `pull_request` -> runs quality gate (all branches).

Required scripts (order matters):
- `pnpm format:check`
- `pnpm lint --max-warnings=0`
- `pnpm type-check`
- `pnpm test`

Verify:
- Open a PR and confirm CI runs all gates.

---

# Step 2 — Choose Exactly One CD Path

Pick **one** Gitflow CD workflow and copy it into `.github/workflows`:

- Templates live here:
  - `docs/blueprint/Layer 05 - Build & Delivery/5.2 — CI CD with Docker Vercel and NPM 🚦/Base Project Rules and Tooling/__Initialization/workflows/`
- Choose one:
  - Web apps: `cd-vercel-gitflow.yml`
  - Services: `cd-docker-gitflow.yml`
  - Libraries: `cd-npm-gitflow.yml`
- Copy the chosen file into `.github/workflows/`.

Rule: **Only one CD path should be active** in a given project to avoid multiple deployments.

---

# Step 3 — Optional Release Automation

If you want releases created automatically:

- Add `release-automation.yml` to `.github/workflows/`.
- It creates `release/vX.Y.Z` from `develop`, then runs `standard-version` to create the release commit + `v*` tag.
- It opens a PR into `main` for review and QA.

Optional back-merge automation:

- Add `backmerge-main-to-develop.yml` to `.github/workflows/`.
- It opens a PR from `main` -> `develop` after main updates.

---

# Step 4 — Configure Secrets

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

# Step 5 — Verify Gitflow Triggers

1) Push to `develop` -> dev deploy/publish triggers.
2) Create `release/*` -> staging deploy/publish triggers.
3) Push tag `v*` -> prod deploy/publish triggers.

---

# Step 6 — Release Tagging (Prod Gate)

Use conventional commits + `standard-version` to create the release commit + `v*` tags.

This tag is the prod trigger and must point to the release commit.

---

# Step 7 — Document the Chosen Path

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
