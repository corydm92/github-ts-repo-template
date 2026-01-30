# Release Automation Behavior

## Purpose
- Generate release commit + tag on main using standard-version

## What it does
- Computes next version from conventional commits
- Runs standard-version (changelog + version + tag)
- Pushes commit + tags to main

## What it does not do
- Does not bypass approvals
- Does not deploy production directly (prod deploy still triggered by tag)

## Failure modes
- No conventional commits -> version cannot be computed
- Missing permissions -> push fails
