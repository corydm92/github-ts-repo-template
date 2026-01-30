# Branch Protection Checklist

Use this checklist after creating `main`.

## main
- Require pull request reviews
- Require status checks to pass before merging
- Require branches to be up to date before merging
- Disallow force pushes
- Disallow deletions
- (Optional) Require linear history

## Required status checks
- CI (pull_request)

## Notes
- Keep merge to `main` via PR only.
- Use feature flags to control rollout.
