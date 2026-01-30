# Base Project Rules and Tooling

Deployment standards for this section.

## CI gate (non-negotiable)
- Runs on pull_request (all branches).
- Uses Node 24.x + pnpm from packageManager (Corepack).
- Steps run in order: format:check, lint (no warnings), type-check, test.
- Any failure blocks the workflow.

## Trunk-Based CD (how each deploy is triggered)
- Merge to main → dev deploy
- v* tag on a main commit → prod deploy

## Vercel CD (web apps)
- Uses Vercel CLI and per-environment project IDs.
- Required secrets: VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID_DEV, VERCEL_PROJECT_ID_PROD.
- Vercel builds in its own environment; this workflow triggers deployments only.

## Docker CD (services)
- Build happens per environment.
- Image is rebuilt on dev and prod using deterministic inputs.
- Required secrets: GITHUB_TOKEN (GHCR) or registry-specific credentials.

## npm CD (libraries)
- main publishes dist-tag dev (if configured).
- v* tag publishes latest.
- Required secrets: NPM_TOKEN.

## Standardization rules
- Rebuild per environment using deterministic inputs.
- Prefer tag-based releases for prod.
- Keep audits outside CI by default.

## Optional automation
- Release workflow creates a release branch (optional), release commit, and `v*` tag.
