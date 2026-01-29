# Base Project Rules and Tooling

Deployment standards for this section.

## CI gate (non-negotiable)
- Runs on pull_request (all branches).
- Uses Node 24.x + pnpm from packageManager (Corepack).
- Steps run in order: format:check, lint (no warnings), type-check, test.
- Any failure blocks the workflow.

## Gitflow CD (select one deploy target)
- develop -> dev deploy
- release/* -> staging deploy
- v* tag -> prod deploy

## Vercel CD (web apps)
- Uses Vercel CLI and per-environment project IDs.
- Required secrets: VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID_DEV, VERCEL_PROJECT_ID_STAGING, VERCEL_PROJECT_ID_PROD.
- Vercel builds in its own environment; this workflow triggers deployments only.

## Docker CD (services)
- Build happens per environment.
- Image is rebuilt on dev, staging, and prod using deterministic inputs.
- Required secrets: GITHUB_TOKEN (GHCR) or registry-specific credentials.

## npm CD (libraries)
- develop publishes dist-tag dev.
- release/* publishes dist-tag rc.
- v* tag publishes latest.
- Required secrets: NPM_TOKEN.

## Standardization rules
- Rebuild per environment using deterministic inputs.
- Prefer tag-based releases for prod.
- Keep audits outside CI by default.

## Optional automation
- Release workflow creates `release/vX.Y.Z`, release commit, and `v*` tag.
- Back-merge PR from main -> develop after prod merge.
