# CI Gate Checklist

## Required
- Deterministic Node + pnpm (via packageManager and Corepack)
- format:check (no auto-fix in CI)
- lint with max warnings = 0
- type-check with no emit
- test (unit/integration baseline)

## Recommended
- Cache pnpm store and build artifacts
- Split lint/type/test into separate jobs only if failure feedback is slow
- Fail fast (no allow-failure)

## Never
- Skip CI for hotfixes
- Auto-fix formatting in CI
- Publish artifacts from a failed gate
