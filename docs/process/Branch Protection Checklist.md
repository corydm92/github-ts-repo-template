# Branch Protection Checklist

Use this checklist after creating `main` and `develop`.

## main
- Require pull request reviews
- Require status checks to pass before merging
- Require branches to be up to date before merging
- Disallow force pushes
- Disallow deletions
- (Optional) Require linear history

## develop
- Require pull request reviews
- Require status checks to pass before merging
- Require branches to be up to date before merging
- Disallow force pushes
- Disallow deletions

## Required status checks
- CI (pull_request)

## Notes
- Keep merge to `main` restricted to release PRs.
- Back-merge `main` -> `develop` via PR (automated or manual).
