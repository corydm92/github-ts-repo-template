# __Initialization

How to adopt this section in a project.

## What to add
- CI workflow with format, lint, type-check, test.
- Gitflow CD workflow for your chosen deploy target (Vercel, Docker, or npm).
- Release tooling (conventional commits + standard-version) if using tag-based releases.
  - Optional: release-automation + back-merge workflows.

## How to configure
- Ensure package.json has a packageManager entry for deterministic pnpm.
- Create develop, release/*, and main branches for Gitflow.
- Set required secrets for the chosen deploy target.

## How to verify
- Open a PR and confirm CI runs all gates.
- Merge to develop and confirm dev deploy.
- Create release/* and confirm staging deploy.
- Push a v* tag and confirm prod deploy.

## Common setup issues
- Missing secrets -> deployment fails at auth step.
- No packageManager -> Corepack fails.
- Tag not pushed -> prod deploy does not run.
