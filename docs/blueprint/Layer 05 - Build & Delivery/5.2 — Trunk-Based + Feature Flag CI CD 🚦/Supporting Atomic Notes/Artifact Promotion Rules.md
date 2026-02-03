# Artifact Promotion Rules

## Goal

Keep promotion deterministic and auditable across environments.

## Good

- Rebuild per environment using the same inputs and rules
- Pin Node/pnpm versions and enforce lockfile integrity
- Keep build inputs deterministic (env vars, flags, dependencies)

## Bad

- Letting build inputs drift between environments
- Deploying from unreviewed branches
- Skipping CI before deploy

## Verification

- Build inputs are identical across environments.
- CI must pass before any deploy.
