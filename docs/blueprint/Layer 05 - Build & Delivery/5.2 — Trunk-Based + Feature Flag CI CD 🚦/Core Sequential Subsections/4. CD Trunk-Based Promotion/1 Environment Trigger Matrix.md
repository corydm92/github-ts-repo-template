# Environment Trigger Matrix

## Goal

Define a single, deterministic trigger path per environment.

## Dev

- Branch: main
- Purpose: integration testing and early validation (trunk)
- Output: dev deploy or dev publish

## Production

- Tag: v\*
- Purpose: final promotion and release audit trail
- Output: prod deploy or latest publish

Rule: prod only from tags, never from branches.

## Verification

- Merge to `main` and confirm dev deploy runs.
- Push a `v*` tag and confirm production deploy runs.
