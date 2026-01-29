# 🚦 CI/CD with Docker, Vercel, and npm — Gitflow Deployment Flow

Updated by Cory Morrissey: 1/29/2026

This note describes the human flow from a fix on a feature branch to production using the Gitflow pipelines in this repo.

- **Path A (Web Apps)**: CI + Vercel Gitflow CD 🌐
- **Path B (Services)**: CI + Docker Gitflow CD 🐳
- **Path C (Libraries)**: CI + npm Gitflow CD 📦

Templates live in:
`docs/blueprint/Layer 05 - Build & Delivery/5.2 CI CD with Docker Vercel and NPM/Base Project Rules and Tooling/__Initialization/workflows/`

Rule: **Only one CD path should be active** in a given project.

---

# 🌐 Path A — Web App Deploy (Vercel Gitflow)

## Preconditions

- Vercel Gitflow workflow exists: `.github/workflows/cd-vercel-gitflow.yml`
- Secrets are set:
  - `VERCEL_TOKEN`
  - `VERCEL_ORG_ID`
  - `VERCEL_PROJECT_ID_DEV`
  - `VERCEL_PROJECT_ID_STAGING`
  - `VERCEL_PROJECT_ID_PROD`
- Branches exist: `develop`, `release/*`, `main`
- CI workflow exists: `.github/workflows/ci.yml`

## Human flow (fix -> prod)

1) Create a branch from `develop` (ex: `fix/handle-null`).
2) Commit changes using conventional commits (ex: `fix: handle null input`).
3) Open a PR into `develop` and wait for CI to pass.
4) Merge PR into `develop`.
5) **Dev deploy** triggers automatically from `develop`.
6) Create a `release/*` branch from `develop`.
7) **Staging deploy** triggers automatically from `release/*`.
8) QA/UAT on staging.
9) Run `semantic-release` to generate the release commit + `v*` tag.
10) **Prod deploy** triggers automatically from the tag.
11) Merge `release/*` into `main` and back-merge to `develop`.

## Notes

- Vercel builds in its own environment; this workflow triggers deployments only.
- Rebuild per environment and rely on deterministic inputs to avoid drift.

---

# 🐳 Path B — Service Deploy (Docker Gitflow)

## Preconditions

- Docker Gitflow workflow exists: `.github/workflows/cd-docker-gitflow.yml`
- Registry access is configured (GHCR by default).
- Branches exist: `develop`, `release/*`, `main`
- CI workflow exists: `.github/workflows/ci.yml`

## Human flow (fix -> prod)

1) Create a branch from `develop`.
2) Commit changes using conventional commits.
3) Open a PR into `develop` and wait for CI to pass.
4) Merge PR into `develop`.
5) **Build + push** triggers on `develop` (dev image).
6) Create a `release/*` branch from `develop`.
7) **Staging deploy** rebuilds the image with deterministic inputs.
8) QA/UAT on staging.
9) Run `semantic-release` to generate the release commit + `v*` tag.
10) **Prod deploy** rebuilds the image with deterministic inputs.
11) Merge `release/*` into `main` and back-merge to `develop`.

## Notes

- Rebuild per environment and rely on deterministic inputs to avoid drift.

---

# 📦 Path C — Library Publish (npm Gitflow)

## Preconditions

- npm Gitflow workflow exists: `.github/workflows/cd-npm-gitflow.yml`
- `NPM_TOKEN` secret is set.
- Branches exist: `develop`, `release/*`, `main`
- CI workflow exists: `.github/workflows/ci.yml`

## Human flow (fix -> prod)

1) Create a branch from `develop`.
2) Commit changes using conventional commits.
3) Open a PR into `develop` and wait for CI to pass.
4) Merge PR into `develop`.
5) **Dev publish** runs on `develop` with dist-tag `dev`.
6) Create a `release/*` branch from `develop`.
7) **Staging publish** runs on `release/*` with dist-tag `rc`.
8) QA/UAT on staging.
9) Run `semantic-release` to generate the release commit + `v*` tag.
10) **Prod publish** runs on tag with dist-tag `latest`.
11) Merge `release/*` into `main` and back-merge to `develop`.

## Notes

- Use conventional commits + `semantic-release` to automate tagging.
- Adjust dist-tags if your release policy differs.
