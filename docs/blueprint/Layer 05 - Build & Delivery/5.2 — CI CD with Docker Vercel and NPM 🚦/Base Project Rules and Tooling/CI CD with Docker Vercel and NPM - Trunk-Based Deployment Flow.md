# 🚦 CI/CD with Docker, Vercel, and npm — Trunk-Based Deployment Flow (Dev + Prod)

Updated by Cory Morrissey: 1/29/2026

This note describes the human flow from a fix on a feature branch to production using trunk-based delivery and feature flags.

- **Path A (Web Apps)**: CI + Vercel CD 🌐
- **Path B (Services)**: CI + Docker CD 🐳
- **Path C (Libraries)**: CI + npm CD 📦

Templates live in:
`docs/blueprint/Layer 05 - Build & Delivery/5.2 — CI CD with Docker Vercel and NPM 🚦/Base Project Rules and Tooling/__Initialization/workflows/`

Rule: **Only one CD path should be active** in a given project.

---

# 🌐 Path A — Web App Deploy (Vercel Trunk-Based)

## Preconditions

- Vercel CD workflow exists: `.github/workflows/cd-vercel-trunk-based.yml`
- Secrets are set:
  - `VERCEL_TOKEN`
  - `VERCEL_ORG_ID`
  - `VERCEL_PROJECT_ID_DEV`
  - `VERCEL_PROJECT_ID_PROD`
- Branches exist: `main`
- CI workflow exists: `.github/workflows/ci.yml`

## Human flow (fix -> prod)

1) Create a branch from `main` (ex: `fix/handle-null`).
2) Commit changes using conventional commits (ex: `fix: handle null input`).
3) Open a PR into `main` and wait for CI to pass.
4) Merge PR into `main`.
5) **Dev deploy** runs from `main`.
6) Run the release automation workflow to create release commit + `v*` tag.
7) **Prod deploy** triggers on `v*` tag.

## Notes

- Vercel builds in its own environment; this workflow triggers deployments only.
- Rebuild per environment using deterministic inputs to avoid drift.

---

# 🐳 Path B — Service Deploy (Docker Trunk-Based)

## Preconditions

- Docker CD workflow exists: `.github/workflows/cd-docker-trunk-based.yml`
- Registry access is configured (GHCR by default).
- Branches exist: `main`
- CI workflow exists: `.github/workflows/ci.yml`

## Human flow (fix -> prod)

1) Create a branch from `main`.
2) Commit changes using conventional commits.
3) Open a PR into `main` and wait for CI to pass.
4) Merge PR into `main`.
5) **Dev deploy** runs from `main`.
6) Run the release automation workflow to create release commit + `v*` tag.
7) **Prod deploy** rebuilds the image on `v*`.

## Notes

- Rebuild per environment using deterministic inputs to avoid drift.

---

# 📦 Path C — Library Publish (npm Trunk-Based)

## Preconditions

- npm CD workflow exists: `.github/workflows/cd-npm-trunk-based.yml`
- `NPM_TOKEN` secret is set.
- Branches exist: `main`
- CI workflow exists: `.github/workflows/ci.yml`

## Human flow (fix -> prod)

1) Create a branch from `main`.
2) Commit changes using conventional commits.
3) Open a PR into `main` and wait for CI to pass.
4) Merge PR into `main`.
5) **Dev publish** runs from `main`.
6) Run the release automation workflow to create release commit + `v*` tag.
7) **Prod publish** runs on tag with dist-tag `latest`.

## Notes

- Use conventional commits + `standard-version` to automate tagging.
- Adjust dist-tags if your release policy differs.
