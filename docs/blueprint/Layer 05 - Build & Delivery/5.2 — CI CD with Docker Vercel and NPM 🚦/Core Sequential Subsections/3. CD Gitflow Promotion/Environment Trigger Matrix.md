# Environment Trigger Matrix

## Dev

- Branch: main
- Purpose: integration testing and early validation (trunk)
- Output: dev deploy or dev publish

## Production

- Tag: v\*
- Purpose: final promotion and release audit trail
- Output: prod deploy or latest publish

Rule: prod only from tags, never from branches.
