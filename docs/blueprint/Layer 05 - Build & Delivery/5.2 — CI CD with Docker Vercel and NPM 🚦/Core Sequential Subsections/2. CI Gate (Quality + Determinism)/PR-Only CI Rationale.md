# PR-Only CI Rationale

## Why PR-only

- Avoid duplicate CI runs on pushes and PR updates
- Keep CI focused on review boundaries
- Reduce cost and noise while maintaining quality gates

## When to add push triggers

- If you need CI on direct pushes (rare)
- If you use automation that bypasses PRs

Rule: default to PR-only CI unless a specific workflow requires push coverage.
