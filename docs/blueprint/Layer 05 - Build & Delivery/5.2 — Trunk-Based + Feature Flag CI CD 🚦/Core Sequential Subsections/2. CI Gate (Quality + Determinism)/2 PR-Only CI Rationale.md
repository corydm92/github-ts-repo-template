# PR-Only CI Rationale

## Goal

Run CI at the review boundary so gates are enforced once per change set.

## Why PR-only

- Avoid duplicate CI runs on pushes and PR updates
- Keep CI focused on review boundaries
- Reduce cost and noise while maintaining quality gates

## When to add push triggers

- If you need CI on direct pushes (rare)
- If you use automation that bypasses PRs

Rule: default to PR-only CI unless a specific workflow requires push coverage.

## Verification

- Open a PR and confirm CI runs.
- Push to a branch without a PR and confirm CI does not run.
