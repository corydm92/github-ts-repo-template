# CI/CD with Docker, Vercel, and npm — Initialization

Updated by Cory Morrissey: 1/29/2026

This setup path wires **one** trunk-based CI/CD pipeline (Vercel, Docker, or npm) and keeps builds deterministic and repeatable.

## 🎯 Goal

Ship a project with:

- CI gating on PRs (all branches).
- Trunk-based CD for a single deploy target.
- Rebuild per environment using deterministic inputs to avoid drift.
- Release automation for commit and tag creation.

## 📦 What This Step Produces

- A working CI pipeline at `.github/workflows/ci.yml`.
- One trunk-based CD pipeline (Vercel, Docker, or npm).
- Required secrets defined in the repo settings.
- A verified dev -> prod flow.

## ✅ Preconditions

- `main` is the trunk branch.
- `package.json` includes `packageManager` for deterministic pnpm.
- Conventional commits + release tooling are available for tag-based prod releases.

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

Pick **one** CD workflow and copy it into `.github/workflows`:

- Templates live here:
  - `docs/blueprint/Layer 05 - Build & Delivery/5.2 — CI CD with Docker Vercel and NPM 🚦/Base Project Rules and Tooling/__Initialization/workflows/`
- Choose one:
  - Web apps: `cd-vercel-trunk-based.yml`
  - Services: `cd-docker-trunk-based.yml`
  - Libraries: `cd-npm-trunk-based.yml`
- Copy the chosen file into `.github/workflows/`.

Rule: **Only one CD path should be active** in a given project to avoid multiple deployments.

---

# Step 3 — Release Automation

Release automation is mandatory:

We leverage standard-version to pull from commit history to generate our semver tag. This ensures we have a defined track to increment from and removing human error.

- Add `release-automation.yml` to `.github/workflows/`.
- It runs `standard-version` on `main` to create the release commit + `v*` tag.

---

# Step 4 — Configure Secrets

Vercel:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID_DEV`
- `VERCEL_PROJECT_ID_PROD`

Docker:

- GHCR uses `GITHUB_TOKEN` (auto-provided), or configure registry credentials.

npm:

- `NPM_TOKEN`

---

# Step 5 — Verify Trunk Triggers

1. Merge to `main` -> dev deploy/publish triggers.
2. Push tag `v*` -> prod deploy/publish triggers.

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
