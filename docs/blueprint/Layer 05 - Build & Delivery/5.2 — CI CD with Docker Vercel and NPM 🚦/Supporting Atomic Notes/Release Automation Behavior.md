# Release Automation Behavior

## Purpose
- Create a release branch from main
- Generate release commit + tag using standard-version
- Open a PR from the release branch into main (if using release branches)

## What it does
- Computes next version from conventional commits
- Creates a release branch (e.g., release/vX.Y.Z)
- Runs standard-version (changelog + version + tag)
- Pushes branch + tags
- Opens PR into main for review

## What it does not do
- Does not auto-merge the PR
- Does not bypass approvals
- Does not deploy production directly (prod deploy still triggered by tag)

## Failure modes
- No conventional commits -> version cannot be computed
- Missing permissions -> branch/tag push fails
- Missing GH CLI -> PR creation fails
