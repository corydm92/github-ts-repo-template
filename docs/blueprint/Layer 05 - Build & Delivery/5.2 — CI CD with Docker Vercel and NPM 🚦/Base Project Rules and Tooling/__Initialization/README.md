# __Initialization

How to adopt this section in a project.

## What to add
- CI workflow with format, lint, type-check, test.
- Trunk-based CD workflow for your chosen deploy target (Vercel, Docker, or npm).
- Release tooling (conventional commits + standard-version) if using tag-based releases.
  - Optional: release-automation workflow.

## How to configure
- Ensure package.json has a packageManager entry for deterministic pnpm.
- Use main as the trunk branch.
- Set required secrets for the chosen deploy target.

## How to verify
- Open a PR and confirm CI runs all gates.
- Merge to main and confirm dev deploy (if configured).
- Push a v* tag and confirm prod deploy.

## Common setup issues
- Missing secrets -> deployment fails at auth step.
- No packageManager -> Corepack fails.
- Tag not pushed -> prod deploy does not run.
